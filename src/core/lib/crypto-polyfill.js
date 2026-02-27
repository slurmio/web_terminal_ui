/**
 * Polyfill для window.crypto.subtle в insecure contexts (http:// на не-localhost).
 *
 * Использует чистые JS-библиотеки @noble/hashes и @noble/ciphers,
 * которые работают в любом окружении без Node.js полифиллов.
 *
 * Sshwifty использует:
 *   - HMAC-SHA512 (importKey + sign)
 *   - AES-128-GCM (importKey + encrypt + decrypt)
 *   - getRandomValues
 */
import { hmac } from '@noble/hashes/hmac.js';
import { sha512 } from '@noble/hashes/sha2.js';
import { gcm } from '@noble/ciphers/aes.js';

if (typeof window !== 'undefined' && window.crypto && !window.crypto.subtle) {
  console.warn(
    '[SshTerminal] crypto.subtle unavailable (insecure context). Using polyfill.'
  );

  window.crypto.subtle = {
    /**
     * importKey — сохраняем сырой ключ для дальнейшего использования.
     */
    async importKey(_format, keyData, algorithm, _extractable, _usages) {
      let raw;
      if (keyData instanceof ArrayBuffer) {
        raw = new Uint8Array(keyData);
      } else if (keyData instanceof Uint8Array) {
        raw = new Uint8Array(keyData);
      } else if (keyData && keyData.buffer) {
        raw = new Uint8Array(
          keyData.buffer,
          keyData.byteOffset,
          keyData.byteLength
        );
      } else {
        raw = new Uint8Array(keyData);
      }
      return {
        _raw: raw,
        algorithm:
          typeof algorithm === 'string' ? { name: algorithm } : algorithm,
      };
    },

    /**
     * sign — HMAC-SHA512
     */
    async sign(_algorithm, key, data) {
      let dataArr;
      if (data instanceof ArrayBuffer) {
        dataArr = new Uint8Array(data);
      } else if (data instanceof Uint8Array) {
        dataArr = data;
      } else if (data && data.buffer) {
        dataArr = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      } else {
        dataArr = new Uint8Array(data);
      }

      const result = hmac(sha512, key._raw, dataArr);
      return result.buffer.slice(
        result.byteOffset,
        result.byteOffset + result.byteLength
      );
    },

    /**
     * encrypt — AES-GCM
     */
    async encrypt(params, key, plaintext) {
      const iv =
        params.iv instanceof Uint8Array
          ? params.iv
          : new Uint8Array(
              params.iv instanceof ArrayBuffer
                ? params.iv
                : params.iv.buffer || params.iv
            );

      let plain;
      if (plaintext instanceof ArrayBuffer) {
        plain = new Uint8Array(plaintext);
      } else if (plaintext instanceof Uint8Array) {
        plain = plaintext;
      } else if (plaintext && plaintext.buffer) {
        plain = new Uint8Array(
          plaintext.buffer,
          plaintext.byteOffset,
          plaintext.byteLength
        );
      } else {
        plain = new Uint8Array(plaintext);
      }

      const aes = gcm(key._raw, iv);
      // @noble/ciphers gcm.encrypt returns ciphertext || tag (exactly what WebCrypto does)
      const encrypted = aes.encrypt(plain);
      return encrypted.buffer.slice(
        encrypted.byteOffset,
        encrypted.byteOffset + encrypted.byteLength
      );
    },

    /**
     * decrypt — AES-GCM
     */
    async decrypt(params, key, ciphertext) {
      const iv =
        params.iv instanceof Uint8Array
          ? params.iv
          : new Uint8Array(
              params.iv instanceof ArrayBuffer
                ? params.iv
                : params.iv.buffer || params.iv
            );

      let cipher;
      if (ciphertext instanceof ArrayBuffer) {
        cipher = new Uint8Array(ciphertext);
      } else if (ciphertext instanceof Uint8Array) {
        cipher = ciphertext;
      } else if (ciphertext && ciphertext.buffer) {
        cipher = new Uint8Array(
          ciphertext.buffer,
          ciphertext.byteOffset,
          ciphertext.byteLength
        );
      } else {
        cipher = new Uint8Array(ciphertext);
      }

      const aes = gcm(key._raw, iv);
      // @noble/ciphers gcm.decrypt expects ciphertext || tag
      const decrypted = aes.decrypt(cipher);
      return decrypted.buffer.slice(
        decrypted.byteOffset,
        decrypted.byteOffset + decrypted.byteLength
      );
    },
  };
}
