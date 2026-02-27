var $f = Object.defineProperty;
var Kf = (e, t, r) => t in e ? $f(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ce = (e, t, r) => Kf(e, typeof t != "symbol" ? t + "" : t, r);
import { ref as ms, computed as ys, watch as ja, nextTick as $a, onMounted as Vf, onBeforeUnmount as Gf, openBlock as ci, createElementBlock as ui, createTextVNode as Yf, toDisplayString as Ka, createElementVNode as Xf, createCommentVNode as Jf } from "vue";
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function Zf(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Va(e, t = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const r = t && `"${t}" `;
    throw new Error(`${r}expected integer >= 0, got ${e}`);
  }
}
function Gi(e, t, r = "") {
  const i = Zf(e), s = e == null ? void 0 : e.length, n = t !== void 0;
  if (!i || n && s !== t) {
    const o = r && `"${r}" `, a = n ? ` of length ${t}` : "", h = i ? `length=${s}` : `type=${typeof e}`;
    throw new Error(o + "expected Uint8Array" + a + ", got " + h);
  }
  return e;
}
function Qf(e) {
  if (typeof e != "function" || typeof e.create != "function")
    throw new Error("Hash must wrapped by utils.createHasher");
  Va(e.outputLen), Va(e.blockLen);
}
function Yi(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function ed(e, t) {
  Gi(e, void 0, "digestInto() output");
  const r = t.outputLen;
  if (e.length < r)
    throw new Error('"digestInto() output" expected to be of length >=' + r);
}
function Xi(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function bs(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function td(e, t = {}) {
  const r = (s, n) => e(n).update(s).digest(), i = e(void 0);
  return r.outputLen = i.outputLen, r.blockLen = i.blockLen, r.create = (s) => e(s), Object.assign(r, t), Object.freeze(r);
}
const rd = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
class Xc {
  constructor(t, r) {
    ce(this, "oHash");
    ce(this, "iHash");
    ce(this, "blockLen");
    ce(this, "outputLen");
    ce(this, "finished", !1);
    ce(this, "destroyed", !1);
    if (Qf(t), Gi(r, void 0, "key"), this.iHash = t.create(), typeof this.iHash.update != "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
    const i = this.blockLen, s = new Uint8Array(i);
    s.set(r.length > i ? t.create().update(r).digest() : r);
    for (let n = 0; n < s.length; n++)
      s[n] ^= 54;
    this.iHash.update(s), this.oHash = t.create();
    for (let n = 0; n < s.length; n++)
      s[n] ^= 106;
    this.oHash.update(s), Xi(s);
  }
  update(t) {
    return Yi(this), this.iHash.update(t), this;
  }
  digestInto(t) {
    Yi(this), Gi(t, this.outputLen, "output"), this.finished = !0, this.iHash.digestInto(t), this.oHash.update(t), this.oHash.digestInto(t), this.destroy();
  }
  digest() {
    const t = new Uint8Array(this.oHash.outputLen);
    return this.digestInto(t), t;
  }
  _cloneInto(t) {
    t || (t = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash: r, iHash: i, finished: s, destroyed: n, blockLen: o, outputLen: a } = this;
    return t = t, t.finished = s, t.destroyed = n, t.blockLen = o, t.outputLen = a, t.oHash = r._cloneInto(t.oHash), t.iHash = i._cloneInto(t.iHash), t;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
  }
}
const Jc = (e, t, r) => new Xc(e, t).update(r).digest();
Jc.create = (e, t) => new Xc(e, t);
class id {
  constructor(t, r, i, s) {
    ce(this, "blockLen");
    ce(this, "outputLen");
    ce(this, "padOffset");
    ce(this, "isLE");
    // For partial updates less than block size
    ce(this, "buffer");
    ce(this, "view");
    ce(this, "finished", !1);
    ce(this, "length", 0);
    ce(this, "pos", 0);
    ce(this, "destroyed", !1);
    this.blockLen = t, this.outputLen = r, this.padOffset = i, this.isLE = s, this.buffer = new Uint8Array(t), this.view = bs(this.buffer);
  }
  update(t) {
    Yi(this), Gi(t);
    const { view: r, buffer: i, blockLen: s } = this, n = t.length;
    for (let o = 0; o < n; ) {
      const a = Math.min(s - this.pos, n - o);
      if (a === s) {
        const h = bs(t);
        for (; s <= n - o; o += s)
          this.process(h, o);
        continue;
      }
      i.set(t.subarray(o, o + a), this.pos), this.pos += a, o += a, this.pos === s && (this.process(r, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    Yi(this), ed(t, this), this.finished = !0;
    const { buffer: r, view: i, blockLen: s, isLE: n } = this;
    let { pos: o } = this;
    r[o++] = 128, Xi(this.buffer.subarray(o)), this.padOffset > s - o && (this.process(i, 0), o = 0);
    for (let u = o; u < s; u++)
      r[u] = 0;
    i.setBigUint64(s - 8, BigInt(this.length * 8), n), this.process(i, 0);
    const a = bs(t), h = this.outputLen;
    if (h % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const l = h / 4, c = this.get();
    if (l > c.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let u = 0; u < l; u++)
      a.setUint32(4 * u, c[u], n);
  }
  digest() {
    const { buffer: t, outputLen: r } = this;
    this.digestInto(t);
    const i = t.slice(0, r);
    return this.destroy(), i;
  }
  _cloneInto(t) {
    t || (t = new this.constructor()), t.set(...this.get());
    const { blockLen: r, buffer: i, length: s, finished: n, destroyed: o, pos: a } = this;
    return t.destroyed = o, t.finished = n, t.length = s, t.pos = a, s % r && t.buffer.set(i), t;
  }
  clone() {
    return this._cloneInto();
  }
}
const $e = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]), fi = /* @__PURE__ */ BigInt(2 ** 32 - 1), Ga = /* @__PURE__ */ BigInt(32);
function sd(e, t = !1) {
  return t ? { h: Number(e & fi), l: Number(e >> Ga & fi) } : { h: Number(e >> Ga & fi) | 0, l: Number(e & fi) | 0 };
}
function nd(e, t = !1) {
  const r = e.length;
  let i = new Uint32Array(r), s = new Uint32Array(r);
  for (let n = 0; n < r; n++) {
    const { h: o, l: a } = sd(e[n], t);
    [i[n], s[n]] = [o, a];
  }
  return [i, s];
}
const Ya = (e, t, r) => e >>> r, Xa = (e, t, r) => e << 32 - r | t >>> r, mr = (e, t, r) => e >>> r | t << 32 - r, yr = (e, t, r) => e << 32 - r | t >>> r, di = (e, t, r) => e << 64 - r | t >>> r - 32, pi = (e, t, r) => e >>> r - 32 | t << 64 - r;
function Tt(e, t, r, i) {
  const s = (t >>> 0) + (i >>> 0);
  return { h: e + r + (s / 2 ** 32 | 0) | 0, l: s | 0 };
}
const od = (e, t, r) => (e >>> 0) + (t >>> 0) + (r >>> 0), ad = (e, t, r, i) => t + r + i + (e / 2 ** 32 | 0) | 0, ld = (e, t, r, i) => (e >>> 0) + (t >>> 0) + (r >>> 0) + (i >>> 0), hd = (e, t, r, i, s) => t + r + i + s + (e / 2 ** 32 | 0) | 0, cd = (e, t, r, i, s) => (e >>> 0) + (t >>> 0) + (r >>> 0) + (i >>> 0) + (s >>> 0), ud = (e, t, r, i, s, n) => t + r + i + s + n + (e / 2 ** 32 | 0) | 0, Zc = nd([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((e) => BigInt(e))), fd = Zc[0], dd = Zc[1], $t = /* @__PURE__ */ new Uint32Array(80), Kt = /* @__PURE__ */ new Uint32Array(80);
class pd extends id {
  constructor(t) {
    super(128, t, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: t, Al: r, Bh: i, Bl: s, Ch: n, Cl: o, Dh: a, Dl: h, Eh: l, El: c, Fh: u, Fl: p, Gh: _, Gl: m, Hh: g, Hl: w } = this;
    return [t, r, i, s, n, o, a, h, l, c, u, p, _, m, g, w];
  }
  // prettier-ignore
  set(t, r, i, s, n, o, a, h, l, c, u, p, _, m, g, w) {
    this.Ah = t | 0, this.Al = r | 0, this.Bh = i | 0, this.Bl = s | 0, this.Ch = n | 0, this.Cl = o | 0, this.Dh = a | 0, this.Dl = h | 0, this.Eh = l | 0, this.El = c | 0, this.Fh = u | 0, this.Fl = p | 0, this.Gh = _ | 0, this.Gl = m | 0, this.Hh = g | 0, this.Hl = w | 0;
  }
  process(t, r) {
    for (let S = 0; S < 16; S++, r += 4)
      $t[S] = t.getUint32(r), Kt[S] = t.getUint32(r += 4);
    for (let S = 16; S < 80; S++) {
      const v = $t[S - 15] | 0, k = Kt[S - 15] | 0, R = mr(v, k, 1) ^ mr(v, k, 8) ^ Ya(v, k, 7), O = yr(v, k, 1) ^ yr(v, k, 8) ^ Xa(v, k, 7), N = $t[S - 2] | 0, W = Kt[S - 2] | 0, Z = mr(N, W, 19) ^ di(N, W, 61) ^ Ya(N, W, 6), ie = yr(N, W, 19) ^ pi(N, W, 61) ^ Xa(N, W, 6), K = ld(O, ie, Kt[S - 7], Kt[S - 16]), H = hd(K, R, Z, $t[S - 7], $t[S - 16]);
      $t[S] = H | 0, Kt[S] = K | 0;
    }
    let { Ah: i, Al: s, Bh: n, Bl: o, Ch: a, Cl: h, Dh: l, Dl: c, Eh: u, El: p, Fh: _, Fl: m, Gh: g, Gl: w, Hh: y, Hl: E } = this;
    for (let S = 0; S < 80; S++) {
      const v = mr(u, p, 14) ^ mr(u, p, 18) ^ di(u, p, 41), k = yr(u, p, 14) ^ yr(u, p, 18) ^ pi(u, p, 41), R = u & _ ^ ~u & g, O = p & m ^ ~p & w, N = cd(E, k, O, dd[S], Kt[S]), W = ud(N, y, v, R, fd[S], $t[S]), Z = N | 0, ie = mr(i, s, 28) ^ di(i, s, 34) ^ di(i, s, 39), K = yr(i, s, 28) ^ pi(i, s, 34) ^ pi(i, s, 39), H = i & n ^ i & a ^ n & a, G = s & o ^ s & h ^ o & h;
      y = g | 0, E = w | 0, g = _ | 0, w = m | 0, _ = u | 0, m = p | 0, { h: u, l: p } = Tt(l | 0, c | 0, W | 0, Z | 0), l = a | 0, c = h | 0, a = n | 0, h = o | 0, n = i | 0, o = s | 0;
      const J = od(Z, K, G);
      i = ad(J, W, ie, H), s = J | 0;
    }
    ({ h: i, l: s } = Tt(this.Ah | 0, this.Al | 0, i | 0, s | 0)), { h: n, l: o } = Tt(this.Bh | 0, this.Bl | 0, n | 0, o | 0), { h: a, l: h } = Tt(this.Ch | 0, this.Cl | 0, a | 0, h | 0), { h: l, l: c } = Tt(this.Dh | 0, this.Dl | 0, l | 0, c | 0), { h: u, l: p } = Tt(this.Eh | 0, this.El | 0, u | 0, p | 0), { h: _, l: m } = Tt(this.Fh | 0, this.Fl | 0, _ | 0, m | 0), { h: g, l: w } = Tt(this.Gh | 0, this.Gl | 0, g | 0, w | 0), { h: y, l: E } = Tt(this.Hh | 0, this.Hl | 0, y | 0, E | 0), this.set(i, s, n, o, a, h, l, c, u, p, _, m, g, w, y, E);
  }
  roundClean() {
    Xi($t, Kt);
  }
  destroy() {
    Xi(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class _d extends pd {
  constructor() {
    super(64);
    ce(this, "Ah", $e[0] | 0);
    ce(this, "Al", $e[1] | 0);
    ce(this, "Bh", $e[2] | 0);
    ce(this, "Bl", $e[3] | 0);
    ce(this, "Ch", $e[4] | 0);
    ce(this, "Cl", $e[5] | 0);
    ce(this, "Dh", $e[6] | 0);
    ce(this, "Dl", $e[7] | 0);
    ce(this, "Eh", $e[8] | 0);
    ce(this, "El", $e[9] | 0);
    ce(this, "Fh", $e[10] | 0);
    ce(this, "Fl", $e[11] | 0);
    ce(this, "Gh", $e[12] | 0);
    ce(this, "Gl", $e[13] | 0);
    ce(this, "Hh", $e[14] | 0);
    ce(this, "Hl", $e[15] | 0);
  }
}
const gd = /* @__PURE__ */ td(
  () => new _d(),
  /* @__PURE__ */ rd(3)
);
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function vd(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function rt(e, t, r = "") {
  const i = vd(e), s = e == null ? void 0 : e.length, n = t !== void 0;
  if (!i || n && s !== t) {
    const o = r && `"${r}" `, a = n ? ` of length ${t}` : "", h = i ? `length=${s}` : `type=${typeof e}`;
    throw new Error(o + "expected Uint8Array" + a + ", got " + h);
  }
  return e;
}
function Ji(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function Qc(e, t) {
  rt(e, void 0, "output");
  const r = t.outputLen;
  if (e.length < r)
    throw new Error("digestInto() expects output buffer of length at least " + r);
}
function md(e) {
  return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
function Ut(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function Ht(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function ls(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
const yd = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function bd(e, t) {
  if (e.length !== t.length)
    return !1;
  let r = 0;
  for (let i = 0; i < e.length; i++)
    r |= e[i] ^ t[i];
  return r === 0;
}
const wd = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function r(i, ...s) {
    if (rt(i, void 0, "key"), !yd)
      throw new Error("Non little-endian hardware is not yet supported");
    if (e.nonceLength !== void 0) {
      const c = s[0];
      rt(c, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const n = e.tagLength;
    n && s[1] !== void 0 && rt(s[1], void 0, "AAD");
    const o = t(i, ...s), a = (c, u) => {
      if (u !== void 0) {
        if (c !== 2)
          throw new Error("cipher output not supported");
        rt(u, void 0, "output");
      }
    };
    let h = !1;
    return {
      encrypt(c, u) {
        if (h)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return h = !0, rt(c), a(o.encrypt.length, u), o.encrypt(c, u);
      },
      decrypt(c, u) {
        if (rt(c), n && c.length < n)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + n);
        return a(o.decrypt.length, u), o.decrypt(c, u);
      }
    };
  }
  return Object.assign(r, e), r;
};
function Sd(e, t, r = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (r && !Zi(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function Cd(e, t, r) {
  const i = new Uint8Array(16), s = ls(i);
  return s.setBigUint64(0, BigInt(t), r), s.setBigUint64(8, BigInt(e), r), i;
}
function Zi(e) {
  return e.byteOffset % 4 === 0;
}
function dr(e) {
  return Uint8Array.from(e);
}
const Mt = 16, pa = /* @__PURE__ */ new Uint8Array(16), Ct = Ut(pa), Ed = 225, xd = (e, t, r, i) => {
  const s = i & 1;
  return {
    s3: r << 31 | i >>> 1,
    s2: t << 31 | r >>> 1,
    s1: e << 31 | t >>> 1,
    s0: e >>> 1 ^ Ed << 24 & -(s & 1)
    // reduce % poly
  };
}, ct = (e) => (e >>> 0 & 255) << 24 | (e >>> 8 & 255) << 16 | (e >>> 16 & 255) << 8 | e >>> 24 & 255 | 0;
function kd(e) {
  e.reverse();
  const t = e[15] & 1;
  let r = 0;
  for (let i = 0; i < e.length; i++) {
    const s = e[i];
    e[i] = s >>> 1 | r, r = (s & 1) << 7;
  }
  return e[0] ^= -t & 225, e;
}
const Bd = (e) => e > 64 * 1024 ? 8 : e > 1024 ? 4 : 2;
class eu {
  // We select bits per window adaptively based on expectedLength
  constructor(t, r) {
    ce(this, "blockLen", Mt);
    ce(this, "outputLen", Mt);
    ce(this, "s0", 0);
    ce(this, "s1", 0);
    ce(this, "s2", 0);
    ce(this, "s3", 0);
    ce(this, "finished", !1);
    ce(this, "t");
    ce(this, "W");
    ce(this, "windowSize");
    rt(t, 16, "key"), t = dr(t);
    const i = ls(t);
    let s = i.getUint32(0, !1), n = i.getUint32(4, !1), o = i.getUint32(8, !1), a = i.getUint32(12, !1);
    const h = [];
    for (let m = 0; m < 128; m++)
      h.push({ s0: ct(s), s1: ct(n), s2: ct(o), s3: ct(a) }), { s0: s, s1: n, s2: o, s3: a } = xd(s, n, o, a);
    const l = Bd(r || 1024);
    if (![1, 2, 4, 8].includes(l))
      throw new Error("ghash: invalid window size, expected 2, 4 or 8");
    this.W = l;
    const u = 128 / l, p = this.windowSize = 2 ** l, _ = [];
    for (let m = 0; m < u; m++)
      for (let g = 0; g < p; g++) {
        let w = 0, y = 0, E = 0, S = 0;
        for (let v = 0; v < l; v++) {
          if (!(g >>> l - v - 1 & 1))
            continue;
          const { s0: R, s1: O, s2: N, s3: W } = h[l * m + v];
          w ^= R, y ^= O, E ^= N, S ^= W;
        }
        _.push({ s0: w, s1: y, s2: E, s3: S });
      }
    this.t = _;
  }
  _updateBlock(t, r, i, s) {
    t ^= this.s0, r ^= this.s1, i ^= this.s2, s ^= this.s3;
    const { W: n, t: o, windowSize: a } = this;
    let h = 0, l = 0, c = 0, u = 0;
    const p = (1 << n) - 1;
    let _ = 0;
    for (const m of [t, r, i, s])
      for (let g = 0; g < 4; g++) {
        const w = m >>> 8 * g & 255;
        for (let y = 8 / n - 1; y >= 0; y--) {
          const E = w >>> n * y & p, { s0: S, s1: v, s2: k, s3: R } = o[_ * a + E];
          h ^= S, l ^= v, c ^= k, u ^= R, _ += 1;
        }
      }
    this.s0 = h, this.s1 = l, this.s2 = c, this.s3 = u;
  }
  update(t) {
    Ji(this), rt(t), t = dr(t);
    const r = Ut(t), i = Math.floor(t.length / Mt), s = t.length % Mt;
    for (let n = 0; n < i; n++)
      this._updateBlock(r[n * 4 + 0], r[n * 4 + 1], r[n * 4 + 2], r[n * 4 + 3]);
    return s && (pa.set(t.subarray(i * Mt)), this._updateBlock(Ct[0], Ct[1], Ct[2], Ct[3]), Ht(Ct)), this;
  }
  destroy() {
    const { t } = this;
    for (const r of t)
      r.s0 = 0, r.s1 = 0, r.s2 = 0, r.s3 = 0;
  }
  digestInto(t) {
    Ji(this), Qc(t, this), this.finished = !0;
    const { s0: r, s1: i, s2: s, s3: n } = this, o = Ut(t);
    return o[0] = r, o[1] = i, o[2] = s, o[3] = n, t;
  }
  digest() {
    const t = new Uint8Array(Mt);
    return this.digestInto(t), this.destroy(), t;
  }
}
class Rd extends eu {
  constructor(t, r) {
    rt(t);
    const i = kd(dr(t));
    super(i, r), Ht(i);
  }
  update(t) {
    Ji(this), rt(t), t = dr(t);
    const r = Ut(t), i = t.length % Mt, s = Math.floor(t.length / Mt);
    for (let n = 0; n < s; n++)
      this._updateBlock(ct(r[n * 4 + 3]), ct(r[n * 4 + 2]), ct(r[n * 4 + 1]), ct(r[n * 4 + 0]));
    return i && (pa.set(t.subarray(s * Mt)), this._updateBlock(ct(Ct[3]), ct(Ct[2]), ct(Ct[1]), ct(Ct[0])), Ht(Ct)), this;
  }
  digestInto(t) {
    Ji(this), Qc(t, this), this.finished = !0;
    const { s0: r, s1: i, s2: s, s3: n } = this, o = Ut(t);
    return o[0] = r, o[1] = i, o[2] = s, o[3] = n, t.reverse();
  }
}
function tu(e) {
  const t = (i, s) => e(s, i.length).update(i).digest(), r = e(new Uint8Array(16), 0);
  return t.outputLen = r.outputLen, t.blockLen = r.blockLen, t.create = (i, s) => e(i, s), t;
}
const Ja = tu((e, t) => new eu(e, t));
tu((e, t) => new Rd(e, t));
const wo = 16, Ad = 4, _i = /* @__PURE__ */ new Uint8Array(wo), Dd = 283;
function Td(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function _a(e) {
  return e << 1 ^ Dd & -(e >> 7);
}
function Za(e, t) {
  let r = 0;
  for (; t > 0; t >>= 1)
    r ^= e & -(t & 1), e = _a(e);
  return r;
}
const Ld = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let r = 0, i = 1; r < 256; r++, i ^= _a(i))
    e[r] = i;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let r = 0; r < 255; r++) {
    let i = e[255 - r];
    i |= i << 8, t[e[r]] = (i ^ i >> 4 ^ i >> 5 ^ i >> 6 ^ i >> 7 ^ 99) & 255;
  }
  return Ht(e), t;
})(), Pd = (e) => e << 24 | e >>> 8, ws = (e) => e << 8 | e >>> 24;
function Md(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const r = new Uint32Array(256).map((l, c) => t(e[c])), i = r.map(ws), s = i.map(ws), n = s.map(ws), o = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), h = new Uint16Array(256 * 256);
  for (let l = 0; l < 256; l++)
    for (let c = 0; c < 256; c++) {
      const u = l * 256 + c;
      o[u] = r[l] ^ i[c], a[u] = s[l] ^ n[c], h[u] = e[l] << 8 | e[c];
    }
  return { sbox: e, sbox2: h, T0: r, T1: i, T2: s, T3: n, T01: o, T23: a };
}
const ru = /* @__PURE__ */ Md(Ld, (e) => Za(e, 3) << 24 | e << 16 | e << 8 | Za(e, 2)), Od = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, r = 1; t < 16; t++, r = _a(r))
    e[t] = r;
  return e;
})();
function Id(e) {
  rt(e);
  const t = e.length;
  Td(e);
  const { sbox2: r } = ru, i = [];
  Zi(e) || i.push(e = dr(e));
  const s = Ut(e), n = s.length, o = (h) => $r(r, h, h, h, h), a = new Uint32Array(t + 28);
  a.set(s);
  for (let h = n; h < a.length; h++) {
    let l = a[h - 1];
    h % n === 0 ? l = o(Pd(l)) ^ Od[h / n - 1] : n > 6 && h % n === 4 && (l = o(l)), a[h] = a[h - n] ^ l;
  }
  return Ht(...i), a;
}
function gi(e, t, r, i, s, n) {
  return e[r << 8 & 65280 | i >>> 8 & 255] ^ t[s >>> 8 & 65280 | n >>> 24 & 255];
}
function $r(e, t, r, i, s) {
  return e[t & 255 | r & 65280] | e[i >>> 16 & 255 | s >>> 16 & 65280] << 16;
}
function Qa(e, t, r, i, s) {
  const { sbox2: n, T01: o, T23: a } = ru;
  let h = 0;
  t ^= e[h++], r ^= e[h++], i ^= e[h++], s ^= e[h++];
  const l = e.length / 4 - 2;
  for (let m = 0; m < l; m++) {
    const g = e[h++] ^ gi(o, a, t, r, i, s), w = e[h++] ^ gi(o, a, r, i, s, t), y = e[h++] ^ gi(o, a, i, s, t, r), E = e[h++] ^ gi(o, a, s, t, r, i);
    t = g, r = w, i = y, s = E;
  }
  const c = e[h++] ^ $r(n, t, r, i, s), u = e[h++] ^ $r(n, r, i, s, t), p = e[h++] ^ $r(n, i, s, t, r), _ = e[h++] ^ $r(n, s, t, r, i);
  return { s0: c, s1: u, s2: p, s3: _ };
}
function vi(e, t, r, i, s) {
  rt(r, wo, "nonce"), rt(i), s = Sd(i.length, s);
  const n = r, o = Ut(n), a = ls(n), h = Ut(i), l = Ut(s), c = t ? 0 : 12, u = i.length;
  let p = a.getUint32(c, t), { s0: _, s1: m, s2: g, s3: w } = Qa(e, o[0], o[1], o[2], o[3]);
  for (let E = 0; E + 4 <= h.length; E += 4)
    l[E + 0] = h[E + 0] ^ _, l[E + 1] = h[E + 1] ^ m, l[E + 2] = h[E + 2] ^ g, l[E + 3] = h[E + 3] ^ w, p = p + 1 >>> 0, a.setUint32(c, p, t), { s0: _, s1: m, s2: g, s3: w } = Qa(e, o[0], o[1], o[2], o[3]);
  const y = wo * Math.floor(h.length / Ad);
  if (y < u) {
    const E = new Uint32Array([_, m, g, w]), S = md(E);
    for (let v = y, k = 0; v < u; v++, k++)
      s[v] = i[v] ^ S[k];
    Ht(E);
  }
  return s;
}
function Nd(e, t, r, i, s) {
  const n = s ? s.length : 0, o = e.create(r, i.length + n);
  s && o.update(s);
  const a = Cd(8 * i.length, 8 * n, t);
  o.update(i), o.update(a);
  const h = o.digest();
  return Ht(a), h;
}
const el = /* @__PURE__ */ wd({ blockSize: 16, nonceLength: 12, tagLength: 16, varSizeNonce: !0 }, function(t, r, i) {
  if (r.length < 8)
    throw new Error("aes/gcm: invalid nonce length");
  const s = 16;
  function n(a, h, l) {
    const c = Nd(Ja, !1, a, l, i);
    for (let u = 0; u < h.length; u++)
      c[u] ^= h[u];
    return c;
  }
  function o() {
    const a = Id(t), h = _i.slice(), l = _i.slice();
    if (vi(a, !1, l, l, h), r.length === 12)
      l.set(r);
    else {
      const u = _i.slice();
      ls(u).setBigUint64(8, BigInt(r.length * 8), !1);
      const _ = Ja.create(h).update(r).update(u);
      _.digestInto(l), _.destroy();
    }
    const c = vi(a, !1, l, _i);
    return { xk: a, authKey: h, counter: l, tagMask: c };
  }
  return {
    encrypt(a) {
      const { xk: h, authKey: l, counter: c, tagMask: u } = o(), p = new Uint8Array(a.length + s), _ = [h, l, c, u];
      Zi(a) || _.push(a = dr(a)), vi(h, !1, c, a, p.subarray(0, a.length));
      const m = n(l, u, p.subarray(0, p.length - s));
      return _.push(m), p.set(m, a.length), Ht(..._), p;
    },
    decrypt(a) {
      const { xk: h, authKey: l, counter: c, tagMask: u } = o(), p = [h, l, u, c];
      Zi(a) || p.push(a = dr(a));
      const _ = a.subarray(0, -s), m = a.subarray(-s), g = n(l, u, _);
      if (p.push(g), !bd(g, m))
        throw new Error("aes/gcm: invalid ghash tag");
      const w = vi(h, !1, c, _);
      return Ht(...p), w;
    }
  };
});
typeof window < "u" && window.crypto && !window.crypto.subtle && (console.warn(
  "[SshTerminal] crypto.subtle unavailable (insecure context). Using polyfill."
), window.crypto.subtle = {
  /**
   * importKey — сохраняем сырой ключ для дальнейшего использования.
   */
  async importKey(e, t, r, i, s) {
    let n;
    return t instanceof ArrayBuffer ? n = new Uint8Array(t) : t instanceof Uint8Array ? n = new Uint8Array(t) : t && t.buffer ? n = new Uint8Array(
      t.buffer,
      t.byteOffset,
      t.byteLength
    ) : n = new Uint8Array(t), {
      _raw: n,
      algorithm: typeof r == "string" ? { name: r } : r
    };
  },
  /**
   * sign — HMAC-SHA512
   */
  async sign(e, t, r) {
    let i;
    r instanceof ArrayBuffer ? i = new Uint8Array(r) : r instanceof Uint8Array ? i = r : r && r.buffer ? i = new Uint8Array(r.buffer, r.byteOffset, r.byteLength) : i = new Uint8Array(r);
    const s = Jc(gd, t._raw, i);
    return s.buffer.slice(
      s.byteOffset,
      s.byteOffset + s.byteLength
    );
  },
  /**
   * encrypt — AES-GCM
   */
  async encrypt(e, t, r) {
    const i = e.iv instanceof Uint8Array ? e.iv : new Uint8Array(
      e.iv instanceof ArrayBuffer ? e.iv : e.iv.buffer || e.iv
    );
    let s;
    r instanceof ArrayBuffer ? s = new Uint8Array(r) : r instanceof Uint8Array ? s = r : r && r.buffer ? s = new Uint8Array(
      r.buffer,
      r.byteOffset,
      r.byteLength
    ) : s = new Uint8Array(r);
    const o = el(t._raw, i).encrypt(s);
    return o.buffer.slice(
      o.byteOffset,
      o.byteOffset + o.byteLength
    );
  },
  /**
   * decrypt — AES-GCM
   */
  async decrypt(e, t, r) {
    const i = e.iv instanceof Uint8Array ? e.iv : new Uint8Array(
      e.iv instanceof ArrayBuffer ? e.iv : e.iv.buffer || e.iv
    );
    let s;
    r instanceof ArrayBuffer ? s = new Uint8Array(r) : r instanceof Uint8Array ? s = r : r && r.buffer ? s = new Uint8Array(
      r.buffer,
      r.byteOffset,
      r.byteLength
    ) : s = new Uint8Array(r);
    const o = el(t._raw, i).decrypt(s);
    return o.buffer.slice(
      o.byteOffset,
      o.byteOffset + o.byteLength
    );
  }
});
function Fd(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var iu = { exports: {} }, Te = iu.exports = {}, wt, St;
function So() {
  throw new Error("setTimeout has not been defined");
}
function Co() {
  throw new Error("clearTimeout has not been defined");
}
(function() {
  try {
    typeof setTimeout == "function" ? wt = setTimeout : wt = So;
  } catch {
    wt = So;
  }
  try {
    typeof clearTimeout == "function" ? St = clearTimeout : St = Co;
  } catch {
    St = Co;
  }
})();
function su(e) {
  if (wt === setTimeout)
    return setTimeout(e, 0);
  if ((wt === So || !wt) && setTimeout)
    return wt = setTimeout, setTimeout(e, 0);
  try {
    return wt(e, 0);
  } catch {
    try {
      return wt.call(null, e, 0);
    } catch {
      return wt.call(this, e, 0);
    }
  }
}
function Ud(e) {
  if (St === clearTimeout)
    return clearTimeout(e);
  if ((St === Co || !St) && clearTimeout)
    return St = clearTimeout, clearTimeout(e);
  try {
    return St(e);
  } catch {
    try {
      return St.call(null, e);
    } catch {
      return St.call(this, e);
    }
  }
}
var Nt = [], kr = !1, lr, Mi = -1;
function Hd() {
  !kr || !lr || (kr = !1, lr.length ? Nt = lr.concat(Nt) : Mi = -1, Nt.length && nu());
}
function nu() {
  if (!kr) {
    var e = su(Hd);
    kr = !0;
    for (var t = Nt.length; t; ) {
      for (lr = Nt, Nt = []; ++Mi < t; )
        lr && lr[Mi].run();
      Mi = -1, t = Nt.length;
    }
    lr = null, kr = !1, Ud(e);
  }
}
Te.nextTick = function(e) {
  var t = new Array(arguments.length - 1);
  if (arguments.length > 1)
    for (var r = 1; r < arguments.length; r++)
      t[r - 1] = arguments[r];
  Nt.push(new ou(e, t)), Nt.length === 1 && !kr && su(nu);
};
function ou(e, t) {
  this.fun = e, this.array = t;
}
ou.prototype.run = function() {
  this.fun.apply(null, this.array);
};
Te.title = "browser";
Te.browser = !0;
Te.env = {};
Te.argv = [];
Te.version = "";
Te.versions = {};
function Wt() {
}
Te.on = Wt;
Te.addListener = Wt;
Te.once = Wt;
Te.off = Wt;
Te.removeListener = Wt;
Te.removeAllListeners = Wt;
Te.emit = Wt;
Te.prependListener = Wt;
Te.prependOnceListener = Wt;
Te.listeners = function(e) {
  return [];
};
Te.binding = function(e) {
  throw new Error("process.binding is not supported");
};
Te.cwd = function() {
  return "/";
};
Te.chdir = function(e) {
  throw new Error("process.chdir is not supported");
};
Te.umask = function() {
  return 0;
};
var Wd = iu.exports;
const le = /* @__PURE__ */ Fd(Wd);
async function au(e, t) {
  const r = await window.crypto.subtle.importKey(
    "raw",
    e,
    {
      name: "HMAC",
      hash: { name: "SHA-512" }
    },
    !1,
    ["sign", "verify"]
  );
  return window.crypto.subtle.sign(r.algorithm, r, t);
}
const lu = 12, ga = 128;
function zd(e) {
  return window.crypto.subtle.importKey(
    "raw",
    e,
    {
      name: "AES-GCM",
      length: ga
    },
    !1,
    ["encrypt", "decrypt"]
  );
}
function qd(e, t, r) {
  return window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: t, tagLength: ga },
    e,
    r
  );
}
function jd(e, t, r) {
  return window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: t, tagLength: ga },
    e,
    r
  );
}
function $d() {
  return window.crypto.getRandomValues(new Uint8Array(lu));
}
function tl(e) {
  for (let t = e.length; t > 0 && (e[t - 1]++, e[t - 1] <= 0); t--)
    ;
  return e;
}
let ge = class extends Error {
  /**
   * constructor
   *
   * @param {string} message error message
   * @param {boolean} temporary whether or not the error is temporary
   *
   */
  constructor(t, r) {
    super(t), this.temporary = r;
  }
};
const rl = 0, il = 1;
class er {
  /**
   * constructor
   *
   */
  constructor() {
    this.res = null, this.rej = null, this.pending = [], this.disabled = null;
  }
  /**
   * Returns how many resolve/reject in the pending
   */
  pendings() {
    return this.pending.length + (this.rej !== null || this.res !== null ? 1 : 0);
  }
  /**
   * Resolve the subscribe waiter
   *
   * @param {any} d Resolve data which will be send to the subscriber
   */
  resolve(t) {
    if (this.res !== null) {
      this.res(t);
      return;
    }
    this.pending.push([il, t]);
  }
  /**
   * Reject the subscribe waiter
   *
   * @param {any} e Error message that will be send to the subscriber
   *
   */
  reject(t) {
    if (this.rej !== null) {
      this.rej(t);
      return;
    }
    this.pending.push([rl, t]);
  }
  /**
   * Waiting and receive subscribe data
   *
   * @returns {Promise<any>} Data receiver
   *
   */
  subscribe() {
    if (this.pending.length > 0) {
      let r = this.pending.shift();
      switch (r[0]) {
        case rl:
          throw r[1];
        case il:
          return r[1];
        default:
          throw new ge("Unknown pending type", !1);
      }
    }
    if (this.disabled)
      throw new ge(this.disabled, !1);
    let t = this;
    return new Promise((r, i) => {
      t.res = (s) => {
        t.res = null, t.rej = null, r(s);
      }, t.rej = (s) => {
        t.res = null, t.rej = null, i(s);
      };
    });
  }
  /**
   * Disable current subscriber when all internal data is readed
   *
   * @param {string} reason Reason of the disable
   *
   */
  disable(t) {
    this.disabled = t;
  }
}
let hu = class {
  /**
   * constructor
   *
   * @param {Uint8Array} buffer Array buffer
   * @param {function} depleted Callback that will be called when the buffer
   *                            is depleted
   */
  constructor(t, r) {
    this.buffer = t, this.used = 0, this.onDepleted = r;
  }
  /**
   * Return the index of given byte inside current available (unused) read
   * buffer
   *
   * @param {number} byteData Target data
   * @param {number} maxLen Max search length
   *
   * @returns {number} Return number >= 0 when found, -1 when not
   */
  searchBuffer(t, r) {
    let i = this.remains();
    i > r && (i = r);
    for (let s = 0; s < i; s++)
      if (this.buffer[s + this.used] === t)
        return s;
    return -1;
  }
  /**
   * Return the index of given byte inside current available (unused) read
   * buffer
   *
   * @param {number} byteData Target data
   *
   * @returns {number} Return number >= 0 when found, -1 when not
   */
  indexOf(t) {
    return this.searchBuffer(t, this.remains());
  }
  /**
   * Return how many bytes in the source + buffer is still available to be
   * read, return 0 when reader is depleted and thus can be ditched
   *
   * @returns {number} Remaining size
   *
   */
  remains() {
    return this.buffer.length - this.used;
  }
  /**
   * Return how many bytes is still availale in the buffer.
   *
   * Note: This reader don't have renewable data source, so when buffer
   *       depletes, the reader is done
   *
   * @returns {number} Remaining size
   *
   */
  buffered() {
    return this.remains();
  }
  /**
   * Export max n bytes from current buffer
   *
   * @param {number} n suggested max byte length, set to 0 to refresh buffer
   *                   if current buffer is deplated
   *
   * @returns {Uint8Array} Exported data
   *
   * @throws {Exception} When reader has been depleted
   *
   */
  export(t) {
    let r = this.remains();
    if (r <= 0)
      throw new ge("Reader has been depleted", !1);
    r > t && (r = t);
    let i = this.buffer.slice(this.used, this.used + r);
    return this.used += i.length, this.remains() <= 0 && this.onDepleted(), i;
  }
};
class Eo {
  /**
   * Constructor
   *
   * @param {function} depleted Callback will be called when all reader is
   *                            depleted
   *
   */
  constructor(t) {
    this.reader = null, this.depleted = t, this.subscribe = new er(), this.closed = !1;
  }
  /**
   * Add new reader as sub reader
   *
   * @param {Buffer} reader
   * @param {function} depleted Callback that will be called when given reader
   *                            is depleted
   *
   * @throws {Exception} When the reader is closed
   *
   */
  feed(t, r) {
    if (this.closed)
      throw new ge("Reader is closed", !1);
    if (this.reader === null && this.subscribe.pendings() <= 0) {
      this.reader = {
        reader: t,
        depleted: r
      };
      return;
    }
    this.subscribe.resolve({
      reader: t,
      depleted: r
    });
  }
  /**
   * Return the index of given byte inside current available (unused) read
   * buffer
   *
   * @param {number} byteData Target data
   * @param {number} maxLen Max search length
   *
   * @returns {number} Return number >= 0 when found, -1 when not
   *
   */
  searchBuffer(t, r) {
    return this.reader === null ? -1 : this.reader.reader.searchBuffer(t, r);
  }
  /**
   * Return the index of given byte inside current available (unused) read
   * buffer
   *
   * @param {number} byteData Target data
   *
   * @returns {number} Return number >= 0 when found, -1 when not
   */
  indexOf(t) {
    return this.searchBuffer(t, this.buffered());
  }
  /**
   * Return how many bytes still available in the buffer (How many bytes of
   * buffer is left for read before reloading from data source)
   *
   * @returns {number} How many bytes left in the current buffer
   */
  buffered() {
    return this.reader == null ? 0 : this.reader.reader.buffered();
  }
  /**
   * close current reading
   *
   */
  close() {
    return this.closeWithReason("Reader is closed");
  }
  /**
   * close current reading
   *
   * @param {string} reason Reason
   *
   */
  closeWithReason(t) {
    this.closed || (this.closed = !0, this.subscribe.reject(new ge(t, !1)), this.subscribe.disable(t));
  }
  /**
   * Export max n bytes from current buffer
   *
   * @param {number} n suggested max byte length, set to 0 to refresh buffer
   *                   if current buffer is deplated
   *
   * @returns {Uint8Array} Exported data
   *
   */
  async export(t) {
    for (; ; ) {
      if (this.reader !== null) {
        let r = await this.reader.reader.export(t);
        return this.reader.reader.remains() <= 0 && (this.reader.depleted(), this.reader = null), r;
      }
      this.depleted(this), this.reader = await this.subscribe.subscribe();
    }
  }
}
class Kd {
  /**
   * constructor
   *
   * @param {Multiple} multiple Source reader
   * @param {function} bufferConverter Function convert
   *
   */
  constructor(t, r) {
    this.multiple = t, this.buffers = new er(), this.bufferConverter = r || ((i) => i), this.closed = !1;
  }
  /**
   * Add buffer into current reader
   *
   * @param {Uint8Array} buffer buffer to add
   *
   * @throws {Exception} When the reader is closed
   *
   */
  feed(t) {
    if (this.closed)
      throw new ge("Reader is closed, new data has been deined", !1);
    this.buffers.resolve(t);
  }
  async reader() {
    if (this.closed)
      throw new ge("Reader is closed, unable to read", !1);
    if (this.multiple.buffered() > 0)
      return this.multiple;
    let t = this, r = await this.bufferConverter(await t.buffers.subscribe());
    return this.multiple.feed(new hu(r, () => {
    }), () => {
    }), this.multiple;
  }
  /**
   * close current reading
   *
   */
  close() {
    return this.closeWithReason("Reader is closed");
  }
  /**
   * close current reading
   *
   * @param {string} reason Reason
   *
   */
  closeWithReason(t) {
    if (!this.closed)
      return this.closed = !0, this.buffers.reject(new ge(t, !1)), this.buffers.disable(t), this.multiple.close();
  }
  /**
   * Return the index of given byte inside current available (unused) read
   * buffer
   *
   * @param {number} byteData Target data
   * @param {number} maxLen Max search length
   *
   * @returns {number} Return number >= 0 when found, -1 when not
   */
  async searchBuffer(t, r) {
    return (await this.reader()).searchBuffer(t, r);
  }
  /**
   * Return the index of given byte inside current available (unused) read
   * buffer
   *
   * @param {number} byteData Target data
   *
   * @returns {number} Return number >= 0 when found, -1 when not
   */
  async indexOf(t) {
    return (await this.reader()).indexOf(t);
  }
  /**
   * Return how many bytes still available in the buffer (How many bytes of
   * buffer is left for read before reloading from data source)
   *
   * @returns {number} How many bytes left in the current buffer
   */
  async buffered() {
    return (await this.reader()).buffered();
  }
  /**
   * Export max n bytes from current buffer
   *
   * @param {number} n suggested max byte length, set to 0 to refresh buffer
   *                   if current buffer is deplated
   *
   * @returns {Uint8Array} Exported data
   *
   */
  async export(t) {
    return (await this.reader()).export(t);
  }
}
async function It(e) {
  for (; ; ) {
    let t = await e.export(1);
    if (!(t.length <= 0))
      return t;
  }
}
async function ot(e, t) {
  let r = 0, i = new Uint8Array(t);
  for (; r < t; ) {
    let s = await e.export(t - r);
    i.set(s, r), r += s.length;
  }
  return i;
}
class sl {
  /**
   * Constructor
   *
   * @param {Reader} reader the source reader
   * @param {number} maxN max bytes to read
   *
   * @returns {boolean} true when the reader is completed, false otherwise
   *
   */
  constructor(t, r) {
    this.reader = t, this.remain = r;
  }
  /**
   * Indicate whether or not the current reader is completed
   *
   * @returns {boolean} true when the reader is completed, false otherwise
   *
   */
  completed() {
    return this.remain <= 0;
  }
  /**
   * Return the index of given byte inside current available (unused) read
   * buffer
   *
   * @param {number} byteData Target data
   * @param {number} maxLen Max search length
   *
   * @returns {number} Return number >= 0 when found, -1 when not
   *
   */
  searchBuffer(t, r) {
    return this.reader.searchBuffer(
      t,
      r > this.remain ? this.remain : r
    );
  }
  /**
   * Return the index of given byte inside current read buffer
   *
   * @param {number} byteData Target data
   *
   * @returns {number} Return number >= 0 when found, -1 when not
   */
  indexOf(t) {
    return this.reader.searchBuffer(t, this.remain);
  }
  /**
   * Return how many bytes still available to be read
   *
   * @returns {number} Remaining size
   *
   */
  remains() {
    return this.remain;
  }
  /**
   * Return how many bytes still available in the buffer (How many bytes of
   * buffer is left for read before reloading from data source)
   *
   * @returns {number} Remaining size
   *
   */
  buffered() {
    let t = this.reader.buffered();
    return t > this.remain ? this.remain : t;
  }
  /**
   * Export max n bytes from current buffer
   *
   * @param {number} n suggested max length
   *
   * @throws {Exception} when reading already completed
   *
   * @returns {Uint8Array} Exported data
   *
   */
  async export(t) {
    if (this.completed())
      throw new ge("Reader already completed", !1);
    let r = t > this.remain ? this.remain : t, i = await this.reader.export(r);
    return this.remain -= i.length, i;
  }
}
async function kt(e) {
  return await ot(e, e.remains());
}
async function Vd(e, t) {
  let r = await e.indexOf(t), i = await e.buffered();
  if (r >= 0)
    return {
      data: await ot(e, r + 1),
      found: !0
    };
  if (i <= 0) {
    let s = await It(e);
    return {
      data: s,
      found: s[0] === t
    };
  }
  return {
    data: await ot(e, i),
    found: !1
  };
}
let Gd = class {
  /**
   * constructor
   *
   * @param {function} sender Underlaying sender
   * @param {integer} maxSegSize The size of max data segment
   * @param {integer} bufferFlushDelay Buffer flush delay
   * @param {integer} maxBufferedRequests Buffer flush delay
   *
   */
  constructor(t, r, i, s) {
    this.sender = t, this.maxSegSize = r, this.subscribe = new er(), this.sendingPoc = this.sending(), this.sendDelay = null, this.bufferFlushDelay = i, this.maxBufferedRequests = s, this.buffer = new Uint8Array(r), this.bufferUsed = 0, this.bufferReq = 0;
  }
  /**
   * Set the send delay of current sender
   *
   * @param {integer} newDelay the new delay
   *
   */
  setDelay(t) {
    this.bufferFlushDelay = t;
  }
  /**
   * Sends data to the this.sender
   *
   * @param {Uint8Array} data to send
   * @param {Array<function>} callbacks to call to return send result
   *
   */
  async sendData(t, r) {
    try {
      await this.sender(t);
      for (let i in r)
        r[i].resolve();
    } catch (i) {
      for (let s in r)
        r[s].reject(i);
    }
  }
  /**
   * Append data to the end of internal buffer
   *
   * @param {Uint8Array} data data to add
   *
   * @returns {integer} How many bytes of data is added
   *
   */
  appendBuffer(t) {
    const r = this.buffer.length - this.bufferUsed, i = t.length > r ? r : t.length;
    return this.buffer.set(t.slice(0, i), this.bufferUsed), this.bufferUsed += i, i;
  }
  /**
   * Export current buffer and reset it to empty
   *
   * @returns {Uint8Array} Exported buffer
   *
   */
  exportBuffer() {
    const t = this.buffer.slice(0, this.bufferUsed);
    return this.bufferUsed = 0, this.bufferedRequests = 0, t;
  }
  /**
   * Sender proc
   *
   */
  async sending() {
    let t = [];
    for (; ; ) {
      const r = await this.subscribe.subscribe();
      if (r === !0) {
        if (this.bufferUsed <= 0)
          continue;
        await this.sendData(this.exportBuffer(), t), t = [];
        continue;
      }
      t.push({
        resolve: r.resolve,
        reject: r.reject
      });
      let i = 0;
      for (; r.data.length > i; ) {
        const s = this.appendBuffer(
          r.data.slice(i, r.data.length)
        );
        if (this.buffer.length > this.bufferUsed)
          break;
        i += s, await this.sendData(this.exportBuffer(), t), t = [];
      }
    }
  }
  /**
   * Clear everything
   *
   */
  close() {
    this.sendDelay !== null && (clearTimeout(this.sendDelay), this.sendDelay = null), this.buffered = null, this.bufferUsed = 0, this.bufferedRequests = 0, this.subscribe.reject(new ge("Sender has been cleared", !1)), this.subscribe.disable(), this.sendingPoc.catch(() => {
    });
  }
  /**
   * Send data
   *
   * @param {Uint8Array} data data to send
   *
   * @throws {Exception} when sending has been cancelled
   *
   * @returns {Promise} will be resolved when the data is send and will be
   *          rejected when the data is not
   *
   */
  send(t) {
    let r = !1;
    this.sendDelay !== null && (clearTimeout(this.sendDelay), this.sendDelay = null, r = !0);
    const i = this;
    return new Promise((s, n) => {
      if (i.subscribe.resolve({
        data: t,
        resolve: s,
        reject: n
      }), i.bufferedRequests >= i.maxBufferedRequests) {
        i.bufferedRequests = 0, i.subscribe.resolve(!0);
        return;
      }
      r && i.bufferedRequests++, i.sendDelay = setTimeout(() => {
        i.sendDelay = null, i.bufferedRequests = 0, i.subscribe.resolve(!0);
      }, i.bufferFlushDelay);
    });
  }
};
function Yd(e, t) {
  return Math.floor(Math.random() * (t - e + 1) + e);
}
function Xd(e, t, r) {
  let i = [];
  for (let s = 0; s < e; s++)
    i.push(Yd(t, r));
  return i;
}
function Jd(e, t) {
  let r = 0, i = [];
  for (; r < e.length; ) {
    let s = e.length - r;
    if (s <= t)
      return i.push(e.slice(r, r + s)), i;
    s = t, i.push(e.slice(r, r + s)), r += s;
  }
}
function nl(e) {
  let t = [], r = [];
  for (let i in e) {
    let s = e.charCodeAt(i);
    for (; s > 255; )
      r.push(s & 255), s >>= 8;
    t.push(s);
    for (let n = r.length; n > 0; n--)
      t.push(r[n]);
    r = [];
  }
  return new Uint8Array(t);
}
const mi = 0, Qi = 64, cu = 128, ol = 192, al = 0, Zd = 1, Qd = 2, ep = 192, Oi = 63, tp = Oi;
class ur {
  /**
   * constructor
   *
   * @param {number} headerByte one byte data of the header
   */
  constructor(t) {
    this.headerByte = t;
  }
  /**
   * Return the header type
   *
   * @returns {number} Type number
   *
   */
  type() {
    return this.headerByte & ep;
  }
  /**
   * Return the header data
   *
   * @returns {number} Data number
   *
   */
  data() {
    return this.headerByte & Oi;
  }
  /**
   * Set the reader data
   *
   * @param {number} data
   */
  set(t) {
    if (t > Oi)
      throw new ge("data must not be greater than 0x3f", !1);
    this.headerByte |= Oi & t;
  }
  /**
   * Return the header value
   *
   * @returns {number} Header byte data
   *
   */
  value() {
    return this.headerByte;
  }
}
const uu = 8191, rp = 7, ll = 31;
let es = class {
  /**
   * constructor
   *
   * @param {number} headerByte1 First header byte
   * @param {number} headerByte2 Second header byte
   *
   */
  constructor(t, r) {
    this.headerByte1 = t, this.headerByte2 = r;
  }
  /**
   * Return the marker data
   *
   * @returns {number} the marker
   *
   */
  marker() {
    return this.headerByte1 >> 5;
  }
  /**
   * Return the stream data length
   *
   * @returns {number} Length of the stream data
   *
   */
  length() {
    let t = 0;
    return t |= this.headerByte1 & ll, t <<= 8, t |= this.headerByte2, t;
  }
  /**
   * Set the header
   *
   * @param {number} marker Header marker
   * @param {number} length Stream data length
   *
   */
  set(t, r) {
    if (t > rp)
      throw new ge("marker must not be greater than 0x07", !1);
    if (r > uu)
      throw new ge("n must not be greater than 0x1fff", !1);
    this.headerByte1 = t << 5 | r >> 8 & ll, this.headerByte2 = r & 255;
  }
  /**
   * Return the header data
   *
   * @returns {Uint8Array} Header data
   *
   */
  buffer() {
    return new Uint8Array([this.headerByte1, this.headerByte2]);
  }
};
class Dr extends es {
  /**
   * Return how large the data can be
   *
   * @returns {number} Max data size
   *
   */
  static maxDataSize() {
    return 2047;
  }
  /**
   * constructor
   *
   * @param {number} headerByte1 First header byte
   * @param {number} headerByte2 Second header byte
   *
   */
  constructor(t, r) {
    super(t, r);
  }
  /**
   * Return command ID
   *
   * @returns {number} Command ID
   *
   */
  command() {
    return this.headerByte1 >> 4;
  }
  /**
   * Return data
   *
   * @returns {number} Data
   *
   */
  data() {
    let t = 0;
    return t |= this.headerByte1 & 7, t <<= 8, t |= this.headerByte2 & 255, t;
  }
  /**
   * Return whether or not the respond is success
   *
   * @returns {boolean} True when the request is successful, false otherwise
   *
   */
  success() {
    return (this.headerByte1 & 8) != 0;
  }
  /**
   * Set the header
   *
   * @param {number} commandID Command ID
   * @param {number} data Stream data
   * @param {boolean} success Whether or not the request is successful
   *
   */
  set(t, r, i) {
    if (t > 15)
      throw new ge("Command ID must not greater than 0x0f", !1);
    if (r > Dr.maxDataSize())
      throw new ge("Data must not greater than 0x07ff", !1);
    let s = r & Dr.maxDataSize();
    i && (s |= 2048), this.headerByte1 = 0, this.headerByte1 |= t << 4, this.headerByte1 |= s >> 8, this.headerByte2 = 0, this.headerByte2 |= s & 255;
  }
}
function Ss(e) {
  return new ur(e);
}
class ip {
  /**
   * constructor
   *
   * @param {number} id ID of the stream
   * @param {sender.Sender} sd The data sender
   *
   */
  constructor(t, r) {
    this.id = t, this.sender = r, this.closed = !1;
  }
  /**
   * Sends data to remote
   *
   * @param {number} marker binary marker
   * @param {Uint8Array} data data to be sent
   *
   * @throws {Exception} When the sender already been closed
   *
   */
  send(t, r) {
    if (this.closed)
      throw new ge(
        "Sender already been closed. No data can be send",
        !1
      );
    let i = new ur(Qi), s = new es(0, 0), n = new Uint8Array(r.length + 3);
    return i.set(this.id), s.set(t, r.length), n[0] = i.value(), n.set(s.buffer(), 1), n.set(r, 3), this.sender.send(n);
  }
  /**
   * Sends data to remote, if the data is too long, it will be separated into
   * different stream requests
   *
   * @param {number} marker binary marker
   * @param {Uint8Array} data data to be sent
   *
   * @throws {Exception} When the sender already been closed
   *
   */
  async sendData(t, r) {
    if (this.closed)
      throw new ge(
        "Sender already been closed. No data can be send",
        !1
      );
    let i = Jd(r, uu), s = new ur(Qi);
    s.set(this.id);
    for (let n in i) {
      let o = new es(0, 0), a = new Uint8Array(i[n].length + 3);
      o.set(t, i[n].length), a[0] = s.value(), a.set(o.buffer(), 1), a.set(i[n], 3), await this.sender.send(a);
    }
  }
  /**
   * Send stream signals
   *
   * @param {number} signal Signal value
   *
   * @throws {Exception} When the sender already been closed
   *
   */
  signal(t) {
    if (this.closed)
      throw new ge(
        "Sender already been closed. No signal can be send",
        !1
      );
    let r = new ur(t);
    return r.set(this.id), this.sender.send(new Uint8Array([r.value()]));
  }
  /**
   * Send close signal and close current sender
   *
   */
  close() {
    if (this.closed)
      return;
    let t = this.signal(cu);
    return this.closed = !0, t;
  }
}
class sp {
  /**
   * constructor
   *
   * @param {number} id ID of the stream
   * @param {number} commandID ID of the command
   * @param {sender.Sender} sd The data sender
   *
   */
  constructor(t, r, i) {
    this.id = t, this.command = r, this.sender = i;
  }
  /**
   * Return how large the data can be
   *
   * @returns {number} Max data size
   *
   */
  static maxDataLength() {
    return Dr.maxDataSize();
  }
  /**
   * Sends data to remote
   *
   * @param {Uint8Array} data data to be sent
   *
   */
  send(t) {
    let r = new ur(Qi), i = new Dr(0, 0), s = new Uint8Array(t.length + 3);
    return r.set(this.id), i.set(this.command, t.length, !0), s[0] = r.value(), s.set(i.buffer(), 1), s.set(t, 3), this.sender.send(s);
  }
}
class np {
  /**
   * constructor
   *
   * @param {number} id ID of the stream
   *
   */
  constructor(t) {
    this.id = t, this.command = null, this.isInitializing = !1, this.isShuttingDown = !1;
  }
  /**
   * Returns whether or not current stream is running
   *
   * @returns {boolean} True when it's running, false otherwise
   *
   */
  running() {
    return this.command !== null;
  }
  /**
   * Returns whether or not current stream is initializing
   *
   * @returns {boolean} True when it's initializing, false otherwise
   *
   */
  initializing() {
    return this.isInitializing;
  }
  /**
   * Unsets current stream
   *
   */
  clear() {
    this.command = null, this.isInitializing = !1, this.isShuttingDown = !1;
  }
  /**
   * Request the stream for a new command
   *
   * @param {number} commandID Command ID
   * @param {function} commandBuilder Function that returns a command
   * @param {sender.Sender} sd Data sender
   *
   * @throws {Exception} when stream already running
   *
   */
  run(t, r, i) {
    if (this.running())
      throw new ge(
        "Stream already running, cannot accept new commands",
        !1
      );
    return this.isInitializing = !0, this.command = r(new ip(this.id, i)), this.command.run(new sp(this.id, t, i));
  }
  /**
   * Called when initialization respond has been received
   *
   * @param {header.InitialStream} streamInitialHeader Stream Initial header
   *
   * @throws {Exception} When the stream is not running, or been shutting down
   *
   */
  initialize(t) {
    if (!this.running())
      throw new ge(
        "Cannot initialize a stream that is not running",
        !1
      );
    if (this.isShuttingDown)
      throw new ge(
        "Cannot initialize a stream that is about to shutdown",
        !1
      );
    if (this.command.initialize(t), !t.success()) {
      this.clear();
      return;
    }
    this.isInitializing = !1;
  }
  /**
   * Called when Stream data has been received
   *
   * @param {header.Stream} streamHeader Stream header
   * @param {reader.Limited} rd Data reader
   *
   * @throws {Exception} When the stream is not running, or shutting down
   *
   */
  tick(t, r) {
    if (!this.running())
      throw new ge("Cannot tick a stream that is not running", !1);
    if (this.isShuttingDown)
      throw new ge(
        "Cannot tick a stream that is about to shutdown",
        !1
      );
    return this.command.tick(t, r);
  }
  /**
   * Called when stream close request has been received
   *
   * @throws {Exception} When the stream is not running, or shutting down
   *
   */
  close() {
    if (!this.running())
      throw new ge("Cannot close a stream that is not running", !1);
    if (this.isShuttingDown)
      throw new ge(
        "Cannot close a stream that is about to shutdown",
        !1
      );
    this.isShuttingDown = !0, this.command.close();
  }
  /**
   * Called when stream completed respond has been received
   *
   * @throws {Exception} When stream isn't running, or not shutting down
   *
   */
  completed() {
    if (!this.running())
      throw new ge("Cannot close a stream that is not running", !1);
    if (!this.isShuttingDown)
      throw new ge(
        "Can't complete current stream because Close signal is not received",
        !1
      );
    this.command.completed(), this.clear();
  }
}
const hl = -1;
class op {
  /**
   * constructor
   *
   * @param {stream.Stream} stream The selected stream
   * @param {any} result Result of the run
   *
   */
  constructor(t, r) {
    this.stream = t, this.result = r;
  }
}
class ap {
  /**
   * constructor
   *
   * @param {reader.Reader} reader The data reader
   * @param {sender.Sender} sender The data sender
   * @param {object} config Configuration
   */
  constructor(t, r, i) {
    this.reader = t, this.sender = r, this.config = i, this.echoTimer = null, this.lastEchoTime = null, this.lastEchoData = null, this.stop = !1, this.streams = [];
    for (let s = 0; s <= tp; s++)
      this.streams.push(new np(s));
  }
  /**
   * Starts stream proccessing
   *
   * @returns {Promise<true>} When service is completed
   *
   * @throws {Exception} When the process already started
   *
   */
  async serve() {
    if (this.echoTimer !== null)
      throw new ge("Already started", !1);
    this.echoTimer = setInterval(() => {
      this.sendEcho();
    }, this.config.echoInterval), this.stop = !1, this.sendEcho();
    let t = null;
    for (; !this.stop && t === null; )
      try {
        await this.tick();
      } catch (r) {
        r.temporary || (t = r);
      }
    if (this.clear(t), t !== null)
      throw new ge("Streams is closed: " + t, !1);
  }
  /**
   * Clear current proccess
   *
   * @param {Exception} e An error caused this clear. Null when no error
   *
   */
  clear(t) {
    if (!this.stop) {
      this.stop = !0, this.echoTimer != null && (clearInterval(this.echoTimer), this.echoTimer = null);
      for (let r in this.streams)
        if (this.streams[r].running()) {
          try {
            this.streams[r].close();
          } catch {
          }
          try {
            this.streams[r].completed();
          } catch {
          }
        }
      try {
        this.sender.close();
      } catch (r) {
        le.env.NODE_ENV === "development" && console.trace(r);
      }
      try {
        this.reader.close();
      } catch (r) {
        le.env.NODE_ENV === "development" && console.trace(r);
      }
      this.config.cleared(t);
    }
  }
  /**
   * Request remote to pause stream sending
   *
   */
  pause() {
    let t = Ss(mi);
    return t.set(1), this.sender.send(
      new Uint8Array([t.value(), Zd])
    );
  }
  /**
   * Request remote to resume stream sending
   *
   */
  resume() {
    let t = Ss(mi);
    return t.set(1), this.sender.send(
      new Uint8Array([t.value(), Qd])
    );
  }
  /**
   * Request stream for given command
   *
   * @param {number} commandID Command ID
   * @param {function} commandBuilder Command builder
   *
   * @returns {Requested} The result of the stream command
   *
   */
  request(t, r) {
    try {
      for (let i in this.streams)
        if (!this.streams[i].running())
          return new op(
            this.streams[i],
            this.streams[i].run(t, r, this.sender)
          );
      throw new ge("No stream is currently available", !0);
    } catch (i) {
      throw new ge("Stream request has failed: " + i, !0);
    }
  }
  /**
   * Send echo request
   *
   */
  sendEcho() {
    let t = Ss(mi), r = new Uint8Array(Xd(8, 0, 255));
    t.set(r.length - 1), r[0] = t.value(), r[1] = al, this.sender.send(r).then(() => {
      (this.lastEchoTime !== null || this.lastEchoData !== null) && (this.lastEchoTime = null, this.lastEchoData = null, this.config.echoUpdater(hl)), this.lastEchoTime = /* @__PURE__ */ new Date(), this.lastEchoData = r.slice(2, r.length);
    });
  }
  /**
   * handle received control request
   *
   * @param {reader.Reader} rd The reader
   *
   */
  async handleControl(t) {
    let r = await It(t), i = 0, s = null;
    switch (r[0]) {
      case al:
        if (s = await kt(t), this.lastEchoTime === null || this.lastEchoData === null || this.lastEchoData.length !== s.length)
          return;
        for (let n in this.lastEchoData)
          if (this.lastEchoData[n] != s[n]) {
            this.lastEchoTime = null, this.lastEchoData = null, this.config.echoUpdater(hl);
            return;
          }
        i = (/* @__PURE__ */ new Date()).getTime() - this.lastEchoTime.getTime(), i < 0 && (i = 0), this.lastEchoTime = null, this.lastEchoData = null, this.config.echoUpdater(i);
        return;
    }
    throw await kt(t), new ge("Unknown control signal: " + r);
  }
  /**
   * handle received stream respond
   *
   * @param {header.Header} hd The header
   * @param {reader.Reader} rd The reader
   *
   * @throws {Exception} when given stream is not running
   *
   */
  async handleStream(t, r) {
    if (t.data() >= this.streams.length)
      return;
    let i = this.streams[t.data()];
    if (!i.running())
      throw new ge(
        'Remote is requesting for stream "' + t.data() + '" which is not running',
        !1
      );
    let s = await ot(r, 2);
    if (i.initializing()) {
      let h = new Dr(
        s[0],
        s[1]
      );
      return i.initialize(h);
    }
    let n = new es(
      s[0],
      s[1]
    ), o = new sl(r, n.length()), a = await i.tick(n, o);
    return await kt(o), a;
  }
  /**
   * handle received close respond
   *
   * @param {header.Header} hd The header
   *
   * @throws {Exception} when given stream is not running
   *
   */
  async handleClose(t) {
    if (t.data() >= this.streams.length)
      return;
    let r = this.streams[t.data()];
    if (!r.running())
      throw new ge(
        'Remote is requesting for stream "' + t.data() + '" to be closed, but the stream is not running',
        !1
      );
    let i = await r.close(), s = new ur(ol);
    return s.set(t.data()), this.sender.send(new Uint8Array([s.value()])), i;
  }
  /**
   * handle received close respond
   *
   * @param {header.Header} hd The header
   *
   * @throws {Exception} when given stream is not running
   *
   */
  async handleCompleted(t) {
    if (t.data() >= this.streams.length)
      return;
    let r = this.streams[t.data()];
    if (!r.running())
      throw new ge(
        'Remote is requesting for stream "' + t.data() + '" to be completed, but the stream is not running',
        !1
      );
    return r.completed();
  }
  /**
   * Main proccess loop
   *
   * @throws {Exception} when encountered an unknown header
   */
  async tick() {
    let t = await It(this.reader), r = new ur(t[0]);
    switch (r.type()) {
      case mi:
        return this.handleControl(new sl(this.reader, r.data()));
      case Qi:
        return this.handleStream(r, this.reader);
      case cu:
        return this.handleClose(r);
      case ol:
        return this.handleCompleted(r);
      default:
        throw new ge("Unknown header", !1);
    }
  }
}
function fu(e, t, r) {
  return new Promise((i, s) => {
    let n = new XMLHttpRequest();
    n.addEventListener("readystatechange", () => {
      n.readyState === n.DONE && i(n);
    }), n.addEventListener("error", (o) => {
      s(o);
    }), n.addEventListener("timeout", (o) => {
      s(o);
    }), n.open(e, t, !0);
    for (let o in r)
      n.setRequestHeader(o, r[o]);
    n.send();
  });
}
function lp(e, t) {
  return fu("GET", e, t);
}
function hp(e, t) {
  return fu("OPTIONS", e, t);
}
const cl = 200, xo = 30;
class cp {
  /**
   * constructor
   *
   * @param {string} address Address to the Websocket server
   * @param {number} Dial timeout
   * @param {object} privateKey String key that will be used to encrypt and
   *                            decrypt socket traffic
   *
   */
  constructor(t, r, i) {
    this.address = t, this.timeout = r, this.privateKey = i, this.keepAliveTicker = null;
  }
  /**
   * Connect to the remote server
   *
   * @param {string} address Target URL address
   * @param {number} timeout Connect timeout
   *
   * @returns {Promise<WebSocket>} When connection is established
   *
   */
  connect(t, r) {
    const i = this;
    return new Promise((s, n) => {
      let o = new WebSocket(t.webSocket), a = !1, h = setTimeout(() => {
        o.close();
      }, r), l = (u) => {
        if (!a)
          return clearTimeout(h), a = !0, s(u);
      }, c = (u) => {
        if (!a)
          return clearTimeout(h), a = !0, n(u);
      };
      i.keepAliveTicker || (i.keepAliveTicker = setInterval(
        () => {
          hp(t.keepAlive, {});
        },
        Math.max(i.timeout / 2, 1e3)
      )), o.addEventListener("open", (u) => {
        l(o);
      }), o.addEventListener("close", (u) => {
        u.toString = () => "WebSocket Error (" + u.code + ")", c(u), clearInterval(i.keepAliveTicker), i.keepAliveTicker = null;
      }), o.addEventListener("error", (u) => {
        o.close(), clearInterval(i.keepAliveTicker), i.keepAliveTicker = null;
      });
    });
  }
  /**
   * Build an socket encrypt and decrypt key string
   *
   */
  async buildKeyString() {
    return this.privateKey.fetch();
  }
  /**
   * Build encrypt and decrypt key
   *
   */
  async buildKey() {
    let t = await this.buildKeyString();
    return await zd(t);
  }
  /**
   * Connect to the server
   *
   * @param {object} callbacks Callbacks
   *
   * @returns {object} A pair of ReadWriter which can be used to read and
   *                   send data to the underlaying websocket connection
   *
   */
  async dial(t) {
    let r = await this.connect(this.address, this.timeout);
    try {
      let i = new Kd(new Eo(() => {
      }), (u) => new Promise((p) => {
        let _ = new FileReader();
        _.onload = (m) => {
          let g = new Uint8Array(m.target.result);
          p(g), t.inboundUnpacked(g);
        }, _.readAsArrayBuffer(u);
      }));
      r.addEventListener("message", (u) => {
        t.inbound(u.data), i.feed(u.data);
      }), r.addEventListener("error", (u) => {
        u.toString = () => "WebSocket Error (" + (u.code ? u.code : "Unknown") + ")", i.closeWithReason(u);
      }), r.addEventListener("close", (u) => {
        i.closeWithReason("Connection is closed");
      });
      let s = (u) => u, n = () => s, o = new Gd(
        async (u) => {
          try {
            let p = await n()(u);
            r.send(p.buffer), t.outbound(p);
          } catch (p) {
            throw r.close(), i.closeWithReason(p), le.env.NODE_ENV === "development" && console.error(p), p;
          }
        },
        4032,
        // Server has a 4096 bytes receive buffer, can be no greater,
        xo,
        // 30ms input delay
        10
        // max 10 buffered requests
      ), a = $d();
      o.send(a);
      let h = await ot(i, lu), l = await this.buildKey();
      return s = async (u) => {
        let p = await qd(l, a, u);
        tl(a);
        let _ = new Uint8Array(p.byteLength + 2);
        return _[0] = p.byteLength >> 8 & 255, _[1] = p.byteLength & 255, _.set(new Uint8Array(p), 2), _;
      }, {
        reader: new Eo(async (u) => {
          try {
            let p = await ot(i, 2), _ = 0;
            _ = p[0], _ <<= 8, _ |= p[1];
            let m = await jd(
              l,
              h,
              await ot(i, _)
            );
            tl(h), u.feed(
              new hu(new Uint8Array(m), () => {
              }),
              () => {
              }
            );
          } catch (p) {
            u.closeWithReason(p);
          }
        }),
        sender: o,
        ws: r
      };
    } catch (i) {
      throw r.close(), i;
    }
  }
}
class up {
  /**
   * constructor
   *
   * @param {string} address Address of the WebSocket server
   * @param {object} privateKey String key that will be used to encrypt and
   *                            decrypt socket traffic
   * @param {number} timeout Dial timeout
   * @param {number} echoInterval Echo interval
   */
  constructor(t, r, i, s) {
    this.dial = new cp(t, i, r), this.echoInterval = s, this.streamHandler = null;
  }
  /**
   * Return a stream handler
   *
   * @param {object} callbacks A group of callbacks to call when needed
   *
   * @returns {Promise<streams.Streams>} The stream manager
   *
   */
  async get(t) {
    let r = this;
    if (this.streamHandler)
      return this.streamHandler;
    t.connecting();
    const i = 6, s = 1024 * 16;
    let n = !1, o = 0, a = 0;
    const h = () => o > s && o > a * i;
    try {
      let l = await this.dial.dial({
        inbound(u) {
          o += u.size, t.traffic(u.size, 0);
        },
        inboundUnpacked(u) {
          if (a += u.length, a >= o && (a = 0, o = 0), r.streamHandler !== null) {
            if (n && !h()) {
              n = !1, r.streamHandler.resume();
              return;
            } else if (!n && h()) {
              n = !0, r.streamHandler.pause();
              return;
            }
          }
        },
        outbound(u) {
          t.traffic(0, u.length);
        }
      }), c = new ap(l.reader, l.sender, {
        echoInterval: r.echoInterval,
        echoUpdater(u) {
          const p = u / 2;
          return p > cl ? l.sender.setDelay(cl) : p < xo ? l.sender.setDelay(xo) : l.sender.setDelay(p), t.echo(u);
        },
        cleared(u) {
          r.streamHandler !== null && (r.streamHandler = null, l.ws.close(), t.close(u));
        }
      });
      t.connected(), c.serve().catch((u) => {
        le.env.NODE_ENV === "development" && console.trace(u);
      }), this.streamHandler = c;
    } catch (l) {
      throw t.failed(l), l;
    }
    return this.streamHandler;
  }
}
var Ne = {}, hs = {};
hs.byteLength = pp;
hs.toByteArray = gp;
hs.fromByteArray = yp;
var Et = [], ht = [], fp = typeof Uint8Array < "u" ? Uint8Array : Array, Cs = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var br = 0, dp = Cs.length; br < dp; ++br)
  Et[br] = Cs[br], ht[Cs.charCodeAt(br)] = br;
ht[45] = 62;
ht[95] = 63;
function du(e) {
  var t = e.length;
  if (t % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var r = e.indexOf("=");
  r === -1 && (r = t);
  var i = r === t ? 0 : 4 - r % 4;
  return [r, i];
}
function pp(e) {
  var t = du(e), r = t[0], i = t[1];
  return (r + i) * 3 / 4 - i;
}
function _p(e, t, r) {
  return (t + r) * 3 / 4 - r;
}
function gp(e) {
  var t, r = du(e), i = r[0], s = r[1], n = new fp(_p(e, i, s)), o = 0, a = s > 0 ? i - 4 : i, h;
  for (h = 0; h < a; h += 4)
    t = ht[e.charCodeAt(h)] << 18 | ht[e.charCodeAt(h + 1)] << 12 | ht[e.charCodeAt(h + 2)] << 6 | ht[e.charCodeAt(h + 3)], n[o++] = t >> 16 & 255, n[o++] = t >> 8 & 255, n[o++] = t & 255;
  return s === 2 && (t = ht[e.charCodeAt(h)] << 2 | ht[e.charCodeAt(h + 1)] >> 4, n[o++] = t & 255), s === 1 && (t = ht[e.charCodeAt(h)] << 10 | ht[e.charCodeAt(h + 1)] << 4 | ht[e.charCodeAt(h + 2)] >> 2, n[o++] = t >> 8 & 255, n[o++] = t & 255), n;
}
function vp(e) {
  return Et[e >> 18 & 63] + Et[e >> 12 & 63] + Et[e >> 6 & 63] + Et[e & 63];
}
function mp(e, t, r) {
  for (var i, s = [], n = t; n < r; n += 3)
    i = (e[n] << 16 & 16711680) + (e[n + 1] << 8 & 65280) + (e[n + 2] & 255), s.push(vp(i));
  return s.join("");
}
function yp(e) {
  for (var t, r = e.length, i = r % 3, s = [], n = 16383, o = 0, a = r - i; o < a; o += n)
    s.push(mp(e, o, o + n > a ? a : o + n));
  return i === 1 ? (t = e[r - 1], s.push(
    Et[t >> 2] + Et[t << 4 & 63] + "=="
  )) : i === 2 && (t = (e[r - 2] << 8) + e[r - 1], s.push(
    Et[t >> 10] + Et[t >> 4 & 63] + Et[t << 2 & 63] + "="
  )), s.join("");
}
var va = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
va.read = function(e, t, r, i, s) {
  var n, o, a = s * 8 - i - 1, h = (1 << a) - 1, l = h >> 1, c = -7, u = r ? s - 1 : 0, p = r ? -1 : 1, _ = e[t + u];
  for (u += p, n = _ & (1 << -c) - 1, _ >>= -c, c += a; c > 0; n = n * 256 + e[t + u], u += p, c -= 8)
    ;
  for (o = n & (1 << -c) - 1, n >>= -c, c += i; c > 0; o = o * 256 + e[t + u], u += p, c -= 8)
    ;
  if (n === 0)
    n = 1 - l;
  else {
    if (n === h)
      return o ? NaN : (_ ? -1 : 1) * (1 / 0);
    o = o + Math.pow(2, i), n = n - l;
  }
  return (_ ? -1 : 1) * o * Math.pow(2, n - i);
};
va.write = function(e, t, r, i, s, n) {
  var o, a, h, l = n * 8 - s - 1, c = (1 << l) - 1, u = c >> 1, p = s === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, _ = i ? 0 : n - 1, m = i ? 1 : -1, g = t < 0 || t === 0 && 1 / t < 0 ? 1 : 0;
  for (t = Math.abs(t), isNaN(t) || t === 1 / 0 ? (a = isNaN(t) ? 1 : 0, o = c) : (o = Math.floor(Math.log(t) / Math.LN2), t * (h = Math.pow(2, -o)) < 1 && (o--, h *= 2), o + u >= 1 ? t += p / h : t += p * Math.pow(2, 1 - u), t * h >= 2 && (o++, h /= 2), o + u >= c ? (a = 0, o = c) : o + u >= 1 ? (a = (t * h - 1) * Math.pow(2, s), o = o + u) : (a = t * Math.pow(2, u - 1) * Math.pow(2, s), o = 0)); s >= 8; e[r + _] = a & 255, _ += m, a /= 256, s -= 8)
    ;
  for (o = o << s | a, l += s; l > 0; e[r + _] = o & 255, _ += m, o /= 256, l -= 8)
    ;
  e[r + _ - m] |= g * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(e) {
  const t = hs, r = va, i = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  e.Buffer = c, e.SlowBuffer = k, e.INSPECT_MAX_BYTES = 50;
  const s = 2147483647;
  e.kMaxLength = s;
  const { Uint8Array: n, ArrayBuffer: o, SharedArrayBuffer: a } = globalThis;
  c.TYPED_ARRAY_SUPPORT = h(), !c.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
    "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
  );
  function h() {
    try {
      const b = new n(1), f = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(f, n.prototype), Object.setPrototypeOf(b, f), b.foo() === 42;
    } catch {
      return !1;
    }
  }
  Object.defineProperty(c.prototype, "parent", {
    enumerable: !0,
    get: function() {
      if (c.isBuffer(this))
        return this.buffer;
    }
  }), Object.defineProperty(c.prototype, "offset", {
    enumerable: !0,
    get: function() {
      if (c.isBuffer(this))
        return this.byteOffset;
    }
  });
  function l(b) {
    if (b > s)
      throw new RangeError('The value "' + b + '" is invalid for option "size"');
    const f = new n(b);
    return Object.setPrototypeOf(f, c.prototype), f;
  }
  function c(b, f, d) {
    if (typeof b == "number") {
      if (typeof f == "string")
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      return m(b);
    }
    return u(b, f, d);
  }
  c.poolSize = 8192;
  function u(b, f, d) {
    if (typeof b == "string")
      return g(b, f);
    if (o.isView(b))
      return y(b);
    if (b == null)
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof b
      );
    if (et(b, o) || b && et(b.buffer, o) || typeof a < "u" && (et(b, a) || b && et(b.buffer, a)))
      return E(b, f, d);
    if (typeof b == "number")
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    const B = b.valueOf && b.valueOf();
    if (B != null && B !== b)
      return c.from(B, f, d);
    const T = S(b);
    if (T) return T;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof b[Symbol.toPrimitive] == "function")
      return c.from(b[Symbol.toPrimitive]("string"), f, d);
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof b
    );
  }
  c.from = function(b, f, d) {
    return u(b, f, d);
  }, Object.setPrototypeOf(c.prototype, n.prototype), Object.setPrototypeOf(c, n);
  function p(b) {
    if (typeof b != "number")
      throw new TypeError('"size" argument must be of type number');
    if (b < 0)
      throw new RangeError('The value "' + b + '" is invalid for option "size"');
  }
  function _(b, f, d) {
    return p(b), b <= 0 ? l(b) : f !== void 0 ? typeof d == "string" ? l(b).fill(f, d) : l(b).fill(f) : l(b);
  }
  c.alloc = function(b, f, d) {
    return _(b, f, d);
  };
  function m(b) {
    return p(b), l(b < 0 ? 0 : v(b) | 0);
  }
  c.allocUnsafe = function(b) {
    return m(b);
  }, c.allocUnsafeSlow = function(b) {
    return m(b);
  };
  function g(b, f) {
    if ((typeof f != "string" || f === "") && (f = "utf8"), !c.isEncoding(f))
      throw new TypeError("Unknown encoding: " + f);
    const d = R(b, f) | 0;
    let B = l(d);
    const T = B.write(b, f);
    return T !== d && (B = B.slice(0, T)), B;
  }
  function w(b) {
    const f = b.length < 0 ? 0 : v(b.length) | 0, d = l(f);
    for (let B = 0; B < f; B += 1)
      d[B] = b[B] & 255;
    return d;
  }
  function y(b) {
    if (et(b, n)) {
      const f = new n(b);
      return E(f.buffer, f.byteOffset, f.byteLength);
    }
    return w(b);
  }
  function E(b, f, d) {
    if (f < 0 || b.byteLength < f)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (b.byteLength < f + (d || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    let B;
    return f === void 0 && d === void 0 ? B = new n(b) : d === void 0 ? B = new n(b, f) : B = new n(b, f, d), Object.setPrototypeOf(B, c.prototype), B;
  }
  function S(b) {
    if (c.isBuffer(b)) {
      const f = v(b.length) | 0, d = l(f);
      return d.length === 0 || b.copy(d, 0, 0, f), d;
    }
    if (b.length !== void 0)
      return typeof b.length != "number" || Dt(b.length) ? l(0) : w(b);
    if (b.type === "Buffer" && Array.isArray(b.data))
      return w(b.data);
  }
  function v(b) {
    if (b >= s)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + s.toString(16) + " bytes");
    return b | 0;
  }
  function k(b) {
    return +b != b && (b = 0), c.alloc(+b);
  }
  c.isBuffer = function(f) {
    return f != null && f._isBuffer === !0 && f !== c.prototype;
  }, c.compare = function(f, d) {
    if (et(f, n) && (f = c.from(f, f.offset, f.byteLength)), et(d, n) && (d = c.from(d, d.offset, d.byteLength)), !c.isBuffer(f) || !c.isBuffer(d))
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    if (f === d) return 0;
    let B = f.length, T = d.length;
    for (let M = 0, j = Math.min(B, T); M < j; ++M)
      if (f[M] !== d[M]) {
        B = f[M], T = d[M];
        break;
      }
    return B < T ? -1 : T < B ? 1 : 0;
  }, c.isEncoding = function(f) {
    switch (String(f).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return !0;
      default:
        return !1;
    }
  }, c.concat = function(f, d) {
    if (!Array.isArray(f))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (f.length === 0)
      return c.alloc(0);
    let B;
    if (d === void 0)
      for (d = 0, B = 0; B < f.length; ++B)
        d += f[B].length;
    const T = c.allocUnsafe(d);
    let M = 0;
    for (B = 0; B < f.length; ++B) {
      let j = f[B];
      if (et(j, n))
        M + j.length > T.length ? (c.isBuffer(j) || (j = c.from(j)), j.copy(T, M)) : n.prototype.set.call(
          T,
          j,
          M
        );
      else if (c.isBuffer(j))
        j.copy(T, M);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      M += j.length;
    }
    return T;
  };
  function R(b, f) {
    if (c.isBuffer(b))
      return b.length;
    if (o.isView(b) || et(b, o))
      return b.byteLength;
    if (typeof b != "string")
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof b
      );
    const d = b.length, B = arguments.length > 2 && arguments[2] === !0;
    if (!B && d === 0) return 0;
    let T = !1;
    for (; ; )
      switch (f) {
        case "ascii":
        case "latin1":
        case "binary":
          return d;
        case "utf8":
        case "utf-8":
          return Ze(b).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return d * 2;
        case "hex":
          return d >>> 1;
        case "base64":
          return _t(b).length;
        default:
          if (T)
            return B ? -1 : Ze(b).length;
          f = ("" + f).toLowerCase(), T = !0;
      }
  }
  c.byteLength = R;
  function O(b, f, d) {
    let B = !1;
    if ((f === void 0 || f < 0) && (f = 0), f > this.length || ((d === void 0 || d > this.length) && (d = this.length), d <= 0) || (d >>>= 0, f >>>= 0, d <= f))
      return "";
    for (b || (b = "utf8"); ; )
      switch (b) {
        case "hex":
          return L(this, f, d);
        case "utf8":
        case "utf-8":
          return se(this, f, d);
        case "ascii":
          return ve(this, f, d);
        case "latin1":
        case "binary":
          return Ce(this, f, d);
        case "base64":
          return ee(this, f, d);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return I(this, f, d);
        default:
          if (B) throw new TypeError("Unknown encoding: " + b);
          b = (b + "").toLowerCase(), B = !0;
      }
  }
  c.prototype._isBuffer = !0;
  function N(b, f, d) {
    const B = b[f];
    b[f] = b[d], b[d] = B;
  }
  c.prototype.swap16 = function() {
    const f = this.length;
    if (f % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let d = 0; d < f; d += 2)
      N(this, d, d + 1);
    return this;
  }, c.prototype.swap32 = function() {
    const f = this.length;
    if (f % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let d = 0; d < f; d += 4)
      N(this, d, d + 3), N(this, d + 1, d + 2);
    return this;
  }, c.prototype.swap64 = function() {
    const f = this.length;
    if (f % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let d = 0; d < f; d += 8)
      N(this, d, d + 7), N(this, d + 1, d + 6), N(this, d + 2, d + 5), N(this, d + 3, d + 4);
    return this;
  }, c.prototype.toString = function() {
    const f = this.length;
    return f === 0 ? "" : arguments.length === 0 ? se(this, 0, f) : O.apply(this, arguments);
  }, c.prototype.toLocaleString = c.prototype.toString, c.prototype.equals = function(f) {
    if (!c.isBuffer(f)) throw new TypeError("Argument must be a Buffer");
    return this === f ? !0 : c.compare(this, f) === 0;
  }, c.prototype.inspect = function() {
    let f = "";
    const d = e.INSPECT_MAX_BYTES;
    return f = this.toString("hex", 0, d).replace(/(.{2})/g, "$1 ").trim(), this.length > d && (f += " ... "), "<Buffer " + f + ">";
  }, i && (c.prototype[i] = c.prototype.inspect), c.prototype.compare = function(f, d, B, T, M) {
    if (et(f, n) && (f = c.from(f, f.offset, f.byteLength)), !c.isBuffer(f))
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof f
      );
    if (d === void 0 && (d = 0), B === void 0 && (B = f ? f.length : 0), T === void 0 && (T = 0), M === void 0 && (M = this.length), d < 0 || B > f.length || T < 0 || M > this.length)
      throw new RangeError("out of range index");
    if (T >= M && d >= B)
      return 0;
    if (T >= M)
      return -1;
    if (d >= B)
      return 1;
    if (d >>>= 0, B >>>= 0, T >>>= 0, M >>>= 0, this === f) return 0;
    let j = M - T, _e = B - d;
    const ke = Math.min(j, _e), we = this.slice(T, M), Be = f.slice(d, B);
    for (let ye = 0; ye < ke; ++ye)
      if (we[ye] !== Be[ye]) {
        j = we[ye], _e = Be[ye];
        break;
      }
    return j < _e ? -1 : _e < j ? 1 : 0;
  };
  function W(b, f, d, B, T) {
    if (b.length === 0) return -1;
    if (typeof d == "string" ? (B = d, d = 0) : d > 2147483647 ? d = 2147483647 : d < -2147483648 && (d = -2147483648), d = +d, Dt(d) && (d = T ? 0 : b.length - 1), d < 0 && (d = b.length + d), d >= b.length) {
      if (T) return -1;
      d = b.length - 1;
    } else if (d < 0)
      if (T) d = 0;
      else return -1;
    if (typeof f == "string" && (f = c.from(f, B)), c.isBuffer(f))
      return f.length === 0 ? -1 : Z(b, f, d, B, T);
    if (typeof f == "number")
      return f = f & 255, typeof n.prototype.indexOf == "function" ? T ? n.prototype.indexOf.call(b, f, d) : n.prototype.lastIndexOf.call(b, f, d) : Z(b, [f], d, B, T);
    throw new TypeError("val must be string, number or Buffer");
  }
  function Z(b, f, d, B, T) {
    let M = 1, j = b.length, _e = f.length;
    if (B !== void 0 && (B = String(B).toLowerCase(), B === "ucs2" || B === "ucs-2" || B === "utf16le" || B === "utf-16le")) {
      if (b.length < 2 || f.length < 2)
        return -1;
      M = 2, j /= 2, _e /= 2, d /= 2;
    }
    function ke(Be, ye) {
      return M === 1 ? Be[ye] : Be.readUInt16BE(ye * M);
    }
    let we;
    if (T) {
      let Be = -1;
      for (we = d; we < j; we++)
        if (ke(b, we) === ke(f, Be === -1 ? 0 : we - Be)) {
          if (Be === -1 && (Be = we), we - Be + 1 === _e) return Be * M;
        } else
          Be !== -1 && (we -= we - Be), Be = -1;
    } else
      for (d + _e > j && (d = j - _e), we = d; we >= 0; we--) {
        let Be = !0;
        for (let ye = 0; ye < _e; ye++)
          if (ke(b, we + ye) !== ke(f, ye)) {
            Be = !1;
            break;
          }
        if (Be) return we;
      }
    return -1;
  }
  c.prototype.includes = function(f, d, B) {
    return this.indexOf(f, d, B) !== -1;
  }, c.prototype.indexOf = function(f, d, B) {
    return W(this, f, d, B, !0);
  }, c.prototype.lastIndexOf = function(f, d, B) {
    return W(this, f, d, B, !1);
  };
  function ie(b, f, d, B) {
    d = Number(d) || 0;
    const T = b.length - d;
    B ? (B = Number(B), B > T && (B = T)) : B = T;
    const M = f.length;
    B > M / 2 && (B = M / 2);
    let j;
    for (j = 0; j < B; ++j) {
      const _e = parseInt(f.substr(j * 2, 2), 16);
      if (Dt(_e)) return j;
      b[d + j] = _e;
    }
    return j;
  }
  function K(b, f, d, B) {
    return it(Ze(f, b.length - d), b, d, B);
  }
  function H(b, f, d, B) {
    return it(Qe(f), b, d, B);
  }
  function G(b, f, d, B) {
    return it(_t(f), b, d, B);
  }
  function J(b, f, d, B) {
    return it(At(f, b.length - d), b, d, B);
  }
  c.prototype.write = function(f, d, B, T) {
    if (d === void 0)
      T = "utf8", B = this.length, d = 0;
    else if (B === void 0 && typeof d == "string")
      T = d, B = this.length, d = 0;
    else if (isFinite(d))
      d = d >>> 0, isFinite(B) ? (B = B >>> 0, T === void 0 && (T = "utf8")) : (T = B, B = void 0);
    else
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    const M = this.length - d;
    if ((B === void 0 || B > M) && (B = M), f.length > 0 && (B < 0 || d < 0) || d > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    T || (T = "utf8");
    let j = !1;
    for (; ; )
      switch (T) {
        case "hex":
          return ie(this, f, d, B);
        case "utf8":
        case "utf-8":
          return K(this, f, d, B);
        case "ascii":
        case "latin1":
        case "binary":
          return H(this, f, d, B);
        case "base64":
          return G(this, f, d, B);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return J(this, f, d, B);
        default:
          if (j) throw new TypeError("Unknown encoding: " + T);
          T = ("" + T).toLowerCase(), j = !0;
      }
  }, c.prototype.toJSON = function() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function ee(b, f, d) {
    return f === 0 && d === b.length ? t.fromByteArray(b) : t.fromByteArray(b.slice(f, d));
  }
  function se(b, f, d) {
    d = Math.min(b.length, d);
    const B = [];
    let T = f;
    for (; T < d; ) {
      const M = b[T];
      let j = null, _e = M > 239 ? 4 : M > 223 ? 3 : M > 191 ? 2 : 1;
      if (T + _e <= d) {
        let ke, we, Be, ye;
        switch (_e) {
          case 1:
            M < 128 && (j = M);
            break;
          case 2:
            ke = b[T + 1], (ke & 192) === 128 && (ye = (M & 31) << 6 | ke & 63, ye > 127 && (j = ye));
            break;
          case 3:
            ke = b[T + 1], we = b[T + 2], (ke & 192) === 128 && (we & 192) === 128 && (ye = (M & 15) << 12 | (ke & 63) << 6 | we & 63, ye > 2047 && (ye < 55296 || ye > 57343) && (j = ye));
            break;
          case 4:
            ke = b[T + 1], we = b[T + 2], Be = b[T + 3], (ke & 192) === 128 && (we & 192) === 128 && (Be & 192) === 128 && (ye = (M & 15) << 18 | (ke & 63) << 12 | (we & 63) << 6 | Be & 63, ye > 65535 && ye < 1114112 && (j = ye));
        }
      }
      j === null ? (j = 65533, _e = 1) : j > 65535 && (j -= 65536, B.push(j >>> 10 & 1023 | 55296), j = 56320 | j & 1023), B.push(j), T += _e;
    }
    return ae(B);
  }
  const Y = 4096;
  function ae(b) {
    const f = b.length;
    if (f <= Y)
      return String.fromCharCode.apply(String, b);
    let d = "", B = 0;
    for (; B < f; )
      d += String.fromCharCode.apply(
        String,
        b.slice(B, B += Y)
      );
    return d;
  }
  function ve(b, f, d) {
    let B = "";
    d = Math.min(b.length, d);
    for (let T = f; T < d; ++T)
      B += String.fromCharCode(b[T] & 127);
    return B;
  }
  function Ce(b, f, d) {
    let B = "";
    d = Math.min(b.length, d);
    for (let T = f; T < d; ++T)
      B += String.fromCharCode(b[T]);
    return B;
  }
  function L(b, f, d) {
    const B = b.length;
    (!f || f < 0) && (f = 0), (!d || d < 0 || d > B) && (d = B);
    let T = "";
    for (let M = f; M < d; ++M)
      T += jt[b[M]];
    return T;
  }
  function I(b, f, d) {
    const B = b.slice(f, d);
    let T = "";
    for (let M = 0; M < B.length - 1; M += 2)
      T += String.fromCharCode(B[M] + B[M + 1] * 256);
    return T;
  }
  c.prototype.slice = function(f, d) {
    const B = this.length;
    f = ~~f, d = d === void 0 ? B : ~~d, f < 0 ? (f += B, f < 0 && (f = 0)) : f > B && (f = B), d < 0 ? (d += B, d < 0 && (d = 0)) : d > B && (d = B), d < f && (d = f);
    const T = this.subarray(f, d);
    return Object.setPrototypeOf(T, c.prototype), T;
  };
  function U(b, f, d) {
    if (b % 1 !== 0 || b < 0) throw new RangeError("offset is not uint");
    if (b + f > d) throw new RangeError("Trying to access beyond buffer length");
  }
  c.prototype.readUintLE = c.prototype.readUIntLE = function(f, d, B) {
    f = f >>> 0, d = d >>> 0, B || U(f, d, this.length);
    let T = this[f], M = 1, j = 0;
    for (; ++j < d && (M *= 256); )
      T += this[f + j] * M;
    return T;
  }, c.prototype.readUintBE = c.prototype.readUIntBE = function(f, d, B) {
    f = f >>> 0, d = d >>> 0, B || U(f, d, this.length);
    let T = this[f + --d], M = 1;
    for (; d > 0 && (M *= 256); )
      T += this[f + --d] * M;
    return T;
  }, c.prototype.readUint8 = c.prototype.readUInt8 = function(f, d) {
    return f = f >>> 0, d || U(f, 1, this.length), this[f];
  }, c.prototype.readUint16LE = c.prototype.readUInt16LE = function(f, d) {
    return f = f >>> 0, d || U(f, 2, this.length), this[f] | this[f + 1] << 8;
  }, c.prototype.readUint16BE = c.prototype.readUInt16BE = function(f, d) {
    return f = f >>> 0, d || U(f, 2, this.length), this[f] << 8 | this[f + 1];
  }, c.prototype.readUint32LE = c.prototype.readUInt32LE = function(f, d) {
    return f = f >>> 0, d || U(f, 4, this.length), (this[f] | this[f + 1] << 8 | this[f + 2] << 16) + this[f + 3] * 16777216;
  }, c.prototype.readUint32BE = c.prototype.readUInt32BE = function(f, d) {
    return f = f >>> 0, d || U(f, 4, this.length), this[f] * 16777216 + (this[f + 1] << 16 | this[f + 2] << 8 | this[f + 3]);
  }, c.prototype.readBigUInt64LE = Ve(function(f) {
    f = f >>> 0, ne(f, "offset");
    const d = this[f], B = this[f + 7];
    (d === void 0 || B === void 0) && ue(f, this.length - 8);
    const T = d + this[++f] * 2 ** 8 + this[++f] * 2 ** 16 + this[++f] * 2 ** 24, M = this[++f] + this[++f] * 2 ** 8 + this[++f] * 2 ** 16 + B * 2 ** 24;
    return BigInt(T) + (BigInt(M) << BigInt(32));
  }), c.prototype.readBigUInt64BE = Ve(function(f) {
    f = f >>> 0, ne(f, "offset");
    const d = this[f], B = this[f + 7];
    (d === void 0 || B === void 0) && ue(f, this.length - 8);
    const T = d * 2 ** 24 + this[++f] * 2 ** 16 + this[++f] * 2 ** 8 + this[++f], M = this[++f] * 2 ** 24 + this[++f] * 2 ** 16 + this[++f] * 2 ** 8 + B;
    return (BigInt(T) << BigInt(32)) + BigInt(M);
  }), c.prototype.readIntLE = function(f, d, B) {
    f = f >>> 0, d = d >>> 0, B || U(f, d, this.length);
    let T = this[f], M = 1, j = 0;
    for (; ++j < d && (M *= 256); )
      T += this[f + j] * M;
    return M *= 128, T >= M && (T -= Math.pow(2, 8 * d)), T;
  }, c.prototype.readIntBE = function(f, d, B) {
    f = f >>> 0, d = d >>> 0, B || U(f, d, this.length);
    let T = d, M = 1, j = this[f + --T];
    for (; T > 0 && (M *= 256); )
      j += this[f + --T] * M;
    return M *= 128, j >= M && (j -= Math.pow(2, 8 * d)), j;
  }, c.prototype.readInt8 = function(f, d) {
    return f = f >>> 0, d || U(f, 1, this.length), this[f] & 128 ? (255 - this[f] + 1) * -1 : this[f];
  }, c.prototype.readInt16LE = function(f, d) {
    f = f >>> 0, d || U(f, 2, this.length);
    const B = this[f] | this[f + 1] << 8;
    return B & 32768 ? B | 4294901760 : B;
  }, c.prototype.readInt16BE = function(f, d) {
    f = f >>> 0, d || U(f, 2, this.length);
    const B = this[f + 1] | this[f] << 8;
    return B & 32768 ? B | 4294901760 : B;
  }, c.prototype.readInt32LE = function(f, d) {
    return f = f >>> 0, d || U(f, 4, this.length), this[f] | this[f + 1] << 8 | this[f + 2] << 16 | this[f + 3] << 24;
  }, c.prototype.readInt32BE = function(f, d) {
    return f = f >>> 0, d || U(f, 4, this.length), this[f] << 24 | this[f + 1] << 16 | this[f + 2] << 8 | this[f + 3];
  }, c.prototype.readBigInt64LE = Ve(function(f) {
    f = f >>> 0, ne(f, "offset");
    const d = this[f], B = this[f + 7];
    (d === void 0 || B === void 0) && ue(f, this.length - 8);
    const T = this[f + 4] + this[f + 5] * 2 ** 8 + this[f + 6] * 2 ** 16 + (B << 24);
    return (BigInt(T) << BigInt(32)) + BigInt(d + this[++f] * 2 ** 8 + this[++f] * 2 ** 16 + this[++f] * 2 ** 24);
  }), c.prototype.readBigInt64BE = Ve(function(f) {
    f = f >>> 0, ne(f, "offset");
    const d = this[f], B = this[f + 7];
    (d === void 0 || B === void 0) && ue(f, this.length - 8);
    const T = (d << 24) + // Overflow
    this[++f] * 2 ** 16 + this[++f] * 2 ** 8 + this[++f];
    return (BigInt(T) << BigInt(32)) + BigInt(this[++f] * 2 ** 24 + this[++f] * 2 ** 16 + this[++f] * 2 ** 8 + B);
  }), c.prototype.readFloatLE = function(f, d) {
    return f = f >>> 0, d || U(f, 4, this.length), r.read(this, f, !0, 23, 4);
  }, c.prototype.readFloatBE = function(f, d) {
    return f = f >>> 0, d || U(f, 4, this.length), r.read(this, f, !1, 23, 4);
  }, c.prototype.readDoubleLE = function(f, d) {
    return f = f >>> 0, d || U(f, 8, this.length), r.read(this, f, !0, 52, 8);
  }, c.prototype.readDoubleBE = function(f, d) {
    return f = f >>> 0, d || U(f, 8, this.length), r.read(this, f, !1, 52, 8);
  };
  function te(b, f, d, B, T, M) {
    if (!c.isBuffer(b)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (f > T || f < M) throw new RangeError('"value" argument is out of bounds');
    if (d + B > b.length) throw new RangeError("Index out of range");
  }
  c.prototype.writeUintLE = c.prototype.writeUIntLE = function(f, d, B, T) {
    if (f = +f, d = d >>> 0, B = B >>> 0, !T) {
      const _e = Math.pow(2, 8 * B) - 1;
      te(this, f, d, B, _e, 0);
    }
    let M = 1, j = 0;
    for (this[d] = f & 255; ++j < B && (M *= 256); )
      this[d + j] = f / M & 255;
    return d + B;
  }, c.prototype.writeUintBE = c.prototype.writeUIntBE = function(f, d, B, T) {
    if (f = +f, d = d >>> 0, B = B >>> 0, !T) {
      const _e = Math.pow(2, 8 * B) - 1;
      te(this, f, d, B, _e, 0);
    }
    let M = B - 1, j = 1;
    for (this[d + M] = f & 255; --M >= 0 && (j *= 256); )
      this[d + M] = f / j & 255;
    return d + B;
  }, c.prototype.writeUint8 = c.prototype.writeUInt8 = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 1, 255, 0), this[d] = f & 255, d + 1;
  }, c.prototype.writeUint16LE = c.prototype.writeUInt16LE = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 2, 65535, 0), this[d] = f & 255, this[d + 1] = f >>> 8, d + 2;
  }, c.prototype.writeUint16BE = c.prototype.writeUInt16BE = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 2, 65535, 0), this[d] = f >>> 8, this[d + 1] = f & 255, d + 2;
  }, c.prototype.writeUint32LE = c.prototype.writeUInt32LE = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 4, 4294967295, 0), this[d + 3] = f >>> 24, this[d + 2] = f >>> 16, this[d + 1] = f >>> 8, this[d] = f & 255, d + 4;
  }, c.prototype.writeUint32BE = c.prototype.writeUInt32BE = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 4, 4294967295, 0), this[d] = f >>> 24, this[d + 1] = f >>> 16, this[d + 2] = f >>> 8, this[d + 3] = f & 255, d + 4;
  };
  function A(b, f, d, B, T) {
    pe(f, B, T, b, d, 7);
    let M = Number(f & BigInt(4294967295));
    b[d++] = M, M = M >> 8, b[d++] = M, M = M >> 8, b[d++] = M, M = M >> 8, b[d++] = M;
    let j = Number(f >> BigInt(32) & BigInt(4294967295));
    return b[d++] = j, j = j >> 8, b[d++] = j, j = j >> 8, b[d++] = j, j = j >> 8, b[d++] = j, d;
  }
  function D(b, f, d, B, T) {
    pe(f, B, T, b, d, 7);
    let M = Number(f & BigInt(4294967295));
    b[d + 7] = M, M = M >> 8, b[d + 6] = M, M = M >> 8, b[d + 5] = M, M = M >> 8, b[d + 4] = M;
    let j = Number(f >> BigInt(32) & BigInt(4294967295));
    return b[d + 3] = j, j = j >> 8, b[d + 2] = j, j = j >> 8, b[d + 1] = j, j = j >> 8, b[d] = j, d + 8;
  }
  c.prototype.writeBigUInt64LE = Ve(function(f, d = 0) {
    return A(this, f, d, BigInt(0), BigInt("0xffffffffffffffff"));
  }), c.prototype.writeBigUInt64BE = Ve(function(f, d = 0) {
    return D(this, f, d, BigInt(0), BigInt("0xffffffffffffffff"));
  }), c.prototype.writeIntLE = function(f, d, B, T) {
    if (f = +f, d = d >>> 0, !T) {
      const ke = Math.pow(2, 8 * B - 1);
      te(this, f, d, B, ke - 1, -ke);
    }
    let M = 0, j = 1, _e = 0;
    for (this[d] = f & 255; ++M < B && (j *= 256); )
      f < 0 && _e === 0 && this[d + M - 1] !== 0 && (_e = 1), this[d + M] = (f / j >> 0) - _e & 255;
    return d + B;
  }, c.prototype.writeIntBE = function(f, d, B, T) {
    if (f = +f, d = d >>> 0, !T) {
      const ke = Math.pow(2, 8 * B - 1);
      te(this, f, d, B, ke - 1, -ke);
    }
    let M = B - 1, j = 1, _e = 0;
    for (this[d + M] = f & 255; --M >= 0 && (j *= 256); )
      f < 0 && _e === 0 && this[d + M + 1] !== 0 && (_e = 1), this[d + M] = (f / j >> 0) - _e & 255;
    return d + B;
  }, c.prototype.writeInt8 = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 1, 127, -128), f < 0 && (f = 255 + f + 1), this[d] = f & 255, d + 1;
  }, c.prototype.writeInt16LE = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 2, 32767, -32768), this[d] = f & 255, this[d + 1] = f >>> 8, d + 2;
  }, c.prototype.writeInt16BE = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 2, 32767, -32768), this[d] = f >>> 8, this[d + 1] = f & 255, d + 2;
  }, c.prototype.writeInt32LE = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 4, 2147483647, -2147483648), this[d] = f & 255, this[d + 1] = f >>> 8, this[d + 2] = f >>> 16, this[d + 3] = f >>> 24, d + 4;
  }, c.prototype.writeInt32BE = function(f, d, B) {
    return f = +f, d = d >>> 0, B || te(this, f, d, 4, 2147483647, -2147483648), f < 0 && (f = 4294967295 + f + 1), this[d] = f >>> 24, this[d + 1] = f >>> 16, this[d + 2] = f >>> 8, this[d + 3] = f & 255, d + 4;
  }, c.prototype.writeBigInt64LE = Ve(function(f, d = 0) {
    return A(this, f, d, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }), c.prototype.writeBigInt64BE = Ve(function(f, d = 0) {
    return D(this, f, d, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function F(b, f, d, B, T, M) {
    if (d + B > b.length) throw new RangeError("Index out of range");
    if (d < 0) throw new RangeError("Index out of range");
  }
  function $(b, f, d, B, T) {
    return f = +f, d = d >>> 0, T || F(b, f, d, 4), r.write(b, f, d, B, 23, 4), d + 4;
  }
  c.prototype.writeFloatLE = function(f, d, B) {
    return $(this, f, d, !0, B);
  }, c.prototype.writeFloatBE = function(f, d, B) {
    return $(this, f, d, !1, B);
  };
  function V(b, f, d, B, T) {
    return f = +f, d = d >>> 0, T || F(b, f, d, 8), r.write(b, f, d, B, 52, 8), d + 8;
  }
  c.prototype.writeDoubleLE = function(f, d, B) {
    return V(this, f, d, !0, B);
  }, c.prototype.writeDoubleBE = function(f, d, B) {
    return V(this, f, d, !1, B);
  }, c.prototype.copy = function(f, d, B, T) {
    if (!c.isBuffer(f)) throw new TypeError("argument should be a Buffer");
    if (B || (B = 0), !T && T !== 0 && (T = this.length), d >= f.length && (d = f.length), d || (d = 0), T > 0 && T < B && (T = B), T === B || f.length === 0 || this.length === 0) return 0;
    if (d < 0)
      throw new RangeError("targetStart out of bounds");
    if (B < 0 || B >= this.length) throw new RangeError("Index out of range");
    if (T < 0) throw new RangeError("sourceEnd out of bounds");
    T > this.length && (T = this.length), f.length - d < T - B && (T = f.length - d + B);
    const M = T - B;
    return this === f && typeof n.prototype.copyWithin == "function" ? this.copyWithin(d, B, T) : n.prototype.set.call(
      f,
      this.subarray(B, T),
      d
    ), M;
  }, c.prototype.fill = function(f, d, B, T) {
    if (typeof f == "string") {
      if (typeof d == "string" ? (T = d, d = 0, B = this.length) : typeof B == "string" && (T = B, B = this.length), T !== void 0 && typeof T != "string")
        throw new TypeError("encoding must be a string");
      if (typeof T == "string" && !c.isEncoding(T))
        throw new TypeError("Unknown encoding: " + T);
      if (f.length === 1) {
        const j = f.charCodeAt(0);
        (T === "utf8" && j < 128 || T === "latin1") && (f = j);
      }
    } else typeof f == "number" ? f = f & 255 : typeof f == "boolean" && (f = Number(f));
    if (d < 0 || this.length < d || this.length < B)
      throw new RangeError("Out of range index");
    if (B <= d)
      return this;
    d = d >>> 0, B = B === void 0 ? this.length : B >>> 0, f || (f = 0);
    let M;
    if (typeof f == "number")
      for (M = d; M < B; ++M)
        this[M] = f;
    else {
      const j = c.isBuffer(f) ? f : c.from(f, T), _e = j.length;
      if (_e === 0)
        throw new TypeError('The value "' + f + '" is invalid for argument "value"');
      for (M = 0; M < B - d; ++M)
        this[M + d] = j[M % _e];
    }
    return this;
  };
  const C = {};
  function x(b, f, d) {
    C[b] = class extends d {
      constructor() {
        super(), Object.defineProperty(this, "message", {
          value: f.apply(this, arguments),
          writable: !0,
          configurable: !0
        }), this.name = `${this.name} [${b}]`, this.stack, delete this.name;
      }
      get code() {
        return b;
      }
      set code(T) {
        Object.defineProperty(this, "code", {
          configurable: !0,
          enumerable: !0,
          value: T,
          writable: !0
        });
      }
      toString() {
        return `${this.name} [${b}]: ${this.message}`;
      }
    };
  }
  x(
    "ERR_BUFFER_OUT_OF_BOUNDS",
    function(b) {
      return b ? `${b} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
    },
    RangeError
  ), x(
    "ERR_INVALID_ARG_TYPE",
    function(b, f) {
      return `The "${b}" argument must be of type number. Received type ${typeof f}`;
    },
    TypeError
  ), x(
    "ERR_OUT_OF_RANGE",
    function(b, f, d) {
      let B = `The value of "${b}" is out of range.`, T = d;
      return Number.isInteger(d) && Math.abs(d) > 2 ** 32 ? T = P(String(d)) : typeof d == "bigint" && (T = String(d), (d > BigInt(2) ** BigInt(32) || d < -(BigInt(2) ** BigInt(32))) && (T = P(T)), T += "n"), B += ` It must be ${f}. Received ${T}`, B;
    },
    RangeError
  );
  function P(b) {
    let f = "", d = b.length;
    const B = b[0] === "-" ? 1 : 0;
    for (; d >= B + 4; d -= 3)
      f = `_${b.slice(d - 3, d)}${f}`;
    return `${b.slice(0, d)}${f}`;
  }
  function X(b, f, d) {
    ne(f, "offset"), (b[f] === void 0 || b[f + d] === void 0) && ue(f, b.length - (d + 1));
  }
  function pe(b, f, d, B, T, M) {
    if (b > d || b < f) {
      const j = typeof f == "bigint" ? "n" : "";
      let _e;
      throw f === 0 || f === BigInt(0) ? _e = `>= 0${j} and < 2${j} ** ${(M + 1) * 8}${j}` : _e = `>= -(2${j} ** ${(M + 1) * 8 - 1}${j}) and < 2 ** ${(M + 1) * 8 - 1}${j}`, new C.ERR_OUT_OF_RANGE("value", _e, b);
    }
    X(B, T, M);
  }
  function ne(b, f) {
    if (typeof b != "number")
      throw new C.ERR_INVALID_ARG_TYPE(f, "number", b);
  }
  function ue(b, f, d) {
    throw Math.floor(b) !== b ? (ne(b, d), new C.ERR_OUT_OF_RANGE("offset", "an integer", b)) : f < 0 ? new C.ERR_BUFFER_OUT_OF_BOUNDS() : new C.ERR_OUT_OF_RANGE(
      "offset",
      `>= 0 and <= ${f}`,
      b
    );
  }
  const Je = /[^+/0-9A-Za-z-_]/g;
  function z(b) {
    if (b = b.split("=")[0], b = b.trim().replace(Je, ""), b.length < 2) return "";
    for (; b.length % 4 !== 0; )
      b = b + "=";
    return b;
  }
  function Ze(b, f) {
    f = f || 1 / 0;
    let d;
    const B = b.length;
    let T = null;
    const M = [];
    for (let j = 0; j < B; ++j) {
      if (d = b.charCodeAt(j), d > 55295 && d < 57344) {
        if (!T) {
          if (d > 56319) {
            (f -= 3) > -1 && M.push(239, 191, 189);
            continue;
          } else if (j + 1 === B) {
            (f -= 3) > -1 && M.push(239, 191, 189);
            continue;
          }
          T = d;
          continue;
        }
        if (d < 56320) {
          (f -= 3) > -1 && M.push(239, 191, 189), T = d;
          continue;
        }
        d = (T - 55296 << 10 | d - 56320) + 65536;
      } else T && (f -= 3) > -1 && M.push(239, 191, 189);
      if (T = null, d < 128) {
        if ((f -= 1) < 0) break;
        M.push(d);
      } else if (d < 2048) {
        if ((f -= 2) < 0) break;
        M.push(
          d >> 6 | 192,
          d & 63 | 128
        );
      } else if (d < 65536) {
        if ((f -= 3) < 0) break;
        M.push(
          d >> 12 | 224,
          d >> 6 & 63 | 128,
          d & 63 | 128
        );
      } else if (d < 1114112) {
        if ((f -= 4) < 0) break;
        M.push(
          d >> 18 | 240,
          d >> 12 & 63 | 128,
          d >> 6 & 63 | 128,
          d & 63 | 128
        );
      } else
        throw new Error("Invalid code point");
    }
    return M;
  }
  function Qe(b) {
    const f = [];
    for (let d = 0; d < b.length; ++d)
      f.push(b.charCodeAt(d) & 255);
    return f;
  }
  function At(b, f) {
    let d, B, T;
    const M = [];
    for (let j = 0; j < b.length && !((f -= 2) < 0); ++j)
      d = b.charCodeAt(j), B = d >> 8, T = d % 256, M.push(T), M.push(B);
    return M;
  }
  function _t(b) {
    return t.toByteArray(z(b));
  }
  function it(b, f, d, B) {
    let T;
    for (T = 0; T < B && !(T + d >= f.length || T >= b.length); ++T)
      f[T + d] = b[T];
    return T;
  }
  function et(b, f) {
    return b instanceof f || b != null && b.constructor != null && b.constructor.name != null && b.constructor.name === f.name;
  }
  function Dt(b) {
    return b !== b;
  }
  const jt = function() {
    const b = "0123456789abcdef", f = new Array(256);
    for (let d = 0; d < 16; ++d) {
      const B = d * 16;
      for (let T = 0; T < 16; ++T)
        f[B + T] = b[d] + b[T];
    }
    return f;
  }();
  function Ve(b) {
    return typeof BigInt > "u" ? jf : b;
  }
  function jf() {
    throw new Error("BigInt not supported");
  }
})(Ne);
const bp = Ne.Buffer, wp = Ne.Blob, Sp = Ne.BlobOptions, pu = Ne.Buffer, Cp = Ne.File, Ep = Ne.FileOptions, xp = Ne.INSPECT_MAX_BYTES, kp = Ne.SlowBuffer, Bp = Ne.TranscodeEncoding, Rp = Ne.atob, Ap = Ne.btoa, Dp = Ne.constants, Tp = Ne.isAscii, Lp = Ne.isUtf8, Pp = Ne.kMaxLength, Mp = Ne.kStringMaxLength, Op = Ne.resolveObjectURL, Ip = Ne.transcode, Np = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Blob: wp,
  BlobOptions: Sp,
  Buffer: pu,
  File: Cp,
  FileOptions: Ep,
  INSPECT_MAX_BYTES: xp,
  SlowBuffer: kp,
  TranscodeEncoding: Bp,
  atob: Rp,
  btoa: Ap,
  constants: Dp,
  default: bp,
  isAscii: Tp,
  isUtf8: Lp,
  kMaxLength: Pp,
  kStringMaxLength: Mp,
  resolveObjectURL: Op,
  transcode: Ip
}, Symbol.toStringTag, { value: "Module" }));
var rr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Fp(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == "function") {
    var r = function i() {
      return this instanceof i ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(i) {
    var s = Object.getOwnPropertyDescriptor(e, i);
    Object.defineProperty(r, i, s.get ? s : {
      enumerable: !0,
      get: function() {
        return e[i];
      }
    });
  }), r;
}
var ma = { exports: {} };
const ri = /* @__PURE__ */ Fp(Np);
var Ii = ri, Br = Ii.Buffer, ft = {}, dt;
for (dt in Ii)
  Ii.hasOwnProperty(dt) && (dt === "SlowBuffer" || dt === "Buffer" || (ft[dt] = Ii[dt]));
var Rr = ft.Buffer = {};
for (dt in Br)
  Br.hasOwnProperty(dt) && (dt === "allocUnsafe" || dt === "allocUnsafeSlow" || (Rr[dt] = Br[dt]));
ft.Buffer.prototype = Br.prototype;
(!Rr.from || Rr.from === Uint8Array.from) && (Rr.from = function(e, t, r) {
  if (typeof e == "number")
    throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof e);
  if (e && typeof e.length > "u")
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e);
  return Br(e, t, r);
});
Rr.alloc || (Rr.alloc = function(e, t, r) {
  if (typeof e != "number")
    throw new TypeError('The "size" argument must be of type number. Received type ' + typeof e);
  if (e < 0 || e >= 2 * (1 << 30))
    throw new RangeError('The value "' + e + '" is invalid for option "size"');
  var i = Br(e);
  return !t || t.length === 0 ? i.fill(0) : typeof r == "string" ? i.fill(t, r) : i.fill(t), i;
});
if (!ft.kStringMaxLength)
  try {
    ft.kStringMaxLength = le.binding("buffer").kStringMaxLength;
  } catch {
  }
ft.constants || (ft.constants = {
  MAX_LENGTH: ft.kMaxLength
}, ft.kStringMaxLength && (ft.constants.MAX_STRING_LENGTH = ft.kStringMaxLength));
var ir = ft, ya = {}, _u = "\uFEFF";
ya.PrependBOM = ba;
function ba(e, t) {
  this.encoder = e, this.addBOM = !0;
}
ba.prototype.write = function(e) {
  return this.addBOM && (e = _u + e, this.addBOM = !1), this.encoder.write(e);
};
ba.prototype.end = function() {
  return this.encoder.end();
};
ya.StripBOM = wa;
function wa(e, t) {
  this.decoder = e, this.pass = !1, this.options = t || {};
}
wa.prototype.write = function(e) {
  var t = this.decoder.write(e);
  return this.pass || !t || (t[0] === _u && (t = t.slice(1), typeof this.options.stripBOM == "function" && this.options.stripBOM()), this.pass = !0), t;
};
wa.prototype.end = function() {
  return this.decoder.end();
};
var Up = typeof Object.hasOwn > "u" ? Function.call.bind(Object.prototype.hasOwnProperty) : Object.hasOwn;
function Hp(e, t) {
  for (var r in t)
    Up(t, r) && (e[r] = t[r]);
}
var gu = Hp, Es = {}, xs = {}, yi = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var ul;
function Wp() {
  return ul || (ul = 1, function(e, t) {
    var r = ri, i = r.Buffer;
    function s(o, a) {
      for (var h in o)
        a[h] = o[h];
    }
    i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? e.exports = r : (s(r, t), t.Buffer = n);
    function n(o, a, h) {
      return i(o, a, h);
    }
    n.prototype = Object.create(i.prototype), s(i, n), n.from = function(o, a, h) {
      if (typeof o == "number")
        throw new TypeError("Argument must not be a number");
      return i(o, a, h);
    }, n.alloc = function(o, a, h) {
      if (typeof o != "number")
        throw new TypeError("Argument must be a number");
      var l = i(o);
      return a !== void 0 ? typeof h == "string" ? l.fill(a, h) : l.fill(a) : l.fill(0), l;
    }, n.allocUnsafe = function(o) {
      if (typeof o != "number")
        throw new TypeError("Argument must be a number");
      return i(o);
    }, n.allocUnsafeSlow = function(o) {
      if (typeof o != "number")
        throw new TypeError("Argument must be a number");
      return r.SlowBuffer(o);
    };
  }(yi, yi.exports)), yi.exports;
}
var fl;
function ko() {
  if (fl) return xs;
  fl = 1;
  var e = Wp().Buffer, t = e.isEncoding || function(y) {
    switch (y = "" + y, y && y.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return !0;
      default:
        return !1;
    }
  };
  function r(y) {
    if (!y) return "utf8";
    for (var E; ; )
      switch (y) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return y;
        default:
          if (E) return;
          y = ("" + y).toLowerCase(), E = !0;
      }
  }
  function i(y) {
    var E = r(y);
    if (typeof E != "string" && (e.isEncoding === t || !t(y))) throw new Error("Unknown encoding: " + y);
    return E || y;
  }
  xs.StringDecoder = s;
  function s(y) {
    this.encoding = i(y);
    var E;
    switch (this.encoding) {
      case "utf16le":
        this.text = u, this.end = p, E = 4;
        break;
      case "utf8":
        this.fillLast = h, E = 4;
        break;
      case "base64":
        this.text = _, this.end = m, E = 3;
        break;
      default:
        this.write = g, this.end = w;
        return;
    }
    this.lastNeed = 0, this.lastTotal = 0, this.lastChar = e.allocUnsafe(E);
  }
  s.prototype.write = function(y) {
    if (y.length === 0) return "";
    var E, S;
    if (this.lastNeed) {
      if (E = this.fillLast(y), E === void 0) return "";
      S = this.lastNeed, this.lastNeed = 0;
    } else
      S = 0;
    return S < y.length ? E ? E + this.text(y, S) : this.text(y, S) : E || "";
  }, s.prototype.end = c, s.prototype.text = l, s.prototype.fillLast = function(y) {
    if (this.lastNeed <= y.length)
      return y.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    y.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, y.length), this.lastNeed -= y.length;
  };
  function n(y) {
    return y <= 127 ? 0 : y >> 5 === 6 ? 2 : y >> 4 === 14 ? 3 : y >> 3 === 30 ? 4 : y >> 6 === 2 ? -1 : -2;
  }
  function o(y, E, S) {
    var v = E.length - 1;
    if (v < S) return 0;
    var k = n(E[v]);
    return k >= 0 ? (k > 0 && (y.lastNeed = k - 1), k) : --v < S || k === -2 ? 0 : (k = n(E[v]), k >= 0 ? (k > 0 && (y.lastNeed = k - 2), k) : --v < S || k === -2 ? 0 : (k = n(E[v]), k >= 0 ? (k > 0 && (k === 2 ? k = 0 : y.lastNeed = k - 3), k) : 0));
  }
  function a(y, E, S) {
    if ((E[0] & 192) !== 128)
      return y.lastNeed = 0, "�";
    if (y.lastNeed > 1 && E.length > 1) {
      if ((E[1] & 192) !== 128)
        return y.lastNeed = 1, "�";
      if (y.lastNeed > 2 && E.length > 2 && (E[2] & 192) !== 128)
        return y.lastNeed = 2, "�";
    }
  }
  function h(y) {
    var E = this.lastTotal - this.lastNeed, S = a(this, y);
    if (S !== void 0) return S;
    if (this.lastNeed <= y.length)
      return y.copy(this.lastChar, E, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    y.copy(this.lastChar, E, 0, y.length), this.lastNeed -= y.length;
  }
  function l(y, E) {
    var S = o(this, y, E);
    if (!this.lastNeed) return y.toString("utf8", E);
    this.lastTotal = S;
    var v = y.length - (S - this.lastNeed);
    return y.copy(this.lastChar, 0, v), y.toString("utf8", E, v);
  }
  function c(y) {
    var E = y && y.length ? this.write(y) : "";
    return this.lastNeed ? E + "�" : E;
  }
  function u(y, E) {
    if ((y.length - E) % 2 === 0) {
      var S = y.toString("utf16le", E);
      if (S) {
        var v = S.charCodeAt(S.length - 1);
        if (v >= 55296 && v <= 56319)
          return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = y[y.length - 2], this.lastChar[1] = y[y.length - 1], S.slice(0, -1);
      }
      return S;
    }
    return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = y[y.length - 1], y.toString("utf16le", E, y.length - 1);
  }
  function p(y) {
    var E = y && y.length ? this.write(y) : "";
    if (this.lastNeed) {
      var S = this.lastTotal - this.lastNeed;
      return E + this.lastChar.toString("utf16le", 0, S);
    }
    return E;
  }
  function _(y, E) {
    var S = (y.length - E) % 3;
    return S === 0 ? y.toString("base64", E) : (this.lastNeed = 3 - S, this.lastTotal = 3, S === 1 ? this.lastChar[0] = y[y.length - 1] : (this.lastChar[0] = y[y.length - 2], this.lastChar[1] = y[y.length - 1]), y.toString("base64", E, y.length - S));
  }
  function m(y) {
    var E = y && y.length ? this.write(y) : "";
    return this.lastNeed ? E + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : E;
  }
  function g(y) {
    return y.toString(this.encoding);
  }
  function w(y) {
    return y && y.length ? this.write(y) : "";
  }
  return xs;
}
var ks, dl;
function zp() {
  if (dl) return ks;
  dl = 1;
  var e = ir.Buffer;
  ks = {
    // Encodings
    utf8: { type: "_internal", bomAware: !0 },
    cesu8: { type: "_internal", bomAware: !0 },
    unicode11utf8: "utf8",
    ucs2: { type: "_internal", bomAware: !0 },
    utf16le: "ucs2",
    binary: { type: "_internal" },
    base64: { type: "_internal" },
    hex: { type: "_internal" },
    // Codec.
    _internal: t
  };
  function t(l, c) {
    this.enc = l.encodingName, this.bomAware = l.bomAware, this.enc === "base64" ? this.encoder = n : this.enc === "utf8" ? this.encoder = h : this.enc === "cesu8" && (this.enc = "utf8", this.encoder = o, e.from("eda0bdedb2a9", "hex").toString() !== "💩" && (this.decoder = a, this.defaultCharUnicode = c.defaultCharUnicode));
  }
  t.prototype.encoder = s, t.prototype.decoder = i;
  var r = ko().StringDecoder;
  function i(l, c) {
    this.decoder = new r(c.enc);
  }
  i.prototype.write = function(l) {
    return e.isBuffer(l) || (l = e.from(l)), this.decoder.write(l);
  }, i.prototype.end = function() {
    return this.decoder.end();
  };
  function s(l, c) {
    this.enc = c.enc;
  }
  s.prototype.write = function(l) {
    return e.from(l, this.enc);
  }, s.prototype.end = function() {
  };
  function n(l, c) {
    this.prevStr = "";
  }
  n.prototype.write = function(l) {
    l = this.prevStr + l;
    var c = l.length - l.length % 4;
    return this.prevStr = l.slice(c), l = l.slice(0, c), e.from(l, "base64");
  }, n.prototype.end = function() {
    return e.from(this.prevStr, "base64");
  };
  function o(l, c) {
  }
  o.prototype.write = function(l) {
    for (var c = e.alloc(l.length * 3), u = 0, p = 0; p < l.length; p++) {
      var _ = l.charCodeAt(p);
      _ < 128 ? c[u++] = _ : _ < 2048 ? (c[u++] = 192 + (_ >>> 6), c[u++] = 128 + (_ & 63)) : (c[u++] = 224 + (_ >>> 12), c[u++] = 128 + (_ >>> 6 & 63), c[u++] = 128 + (_ & 63));
    }
    return c.slice(0, u);
  }, o.prototype.end = function() {
  };
  function a(l, c) {
    this.acc = 0, this.contBytes = 0, this.accBytes = 0, this.defaultCharUnicode = c.defaultCharUnicode;
  }
  a.prototype.write = function(l) {
    for (var c = this.acc, u = this.contBytes, p = this.accBytes, _ = "", m = 0; m < l.length; m++) {
      var g = l[m];
      (g & 192) !== 128 ? (u > 0 && (_ += this.defaultCharUnicode, u = 0), g < 128 ? _ += String.fromCharCode(g) : g < 224 ? (c = g & 31, u = 1, p = 1) : g < 240 ? (c = g & 15, u = 2, p = 1) : _ += this.defaultCharUnicode) : u > 0 ? (c = c << 6 | g & 63, u--, p++, u === 0 && (p === 2 && c < 128 && c > 0 ? _ += this.defaultCharUnicode : p === 3 && c < 2048 ? _ += this.defaultCharUnicode : _ += String.fromCharCode(c))) : _ += this.defaultCharUnicode;
    }
    return this.acc = c, this.contBytes = u, this.accBytes = p, _;
  }, a.prototype.end = function() {
    var l = 0;
    return this.contBytes > 0 && (l += this.defaultCharUnicode), l;
  };
  function h(l, c) {
    this.highSurrogate = "";
  }
  return h.prototype.write = function(l) {
    if (this.highSurrogate && (l = this.highSurrogate + l, this.highSurrogate = ""), l.length > 0) {
      var c = l.charCodeAt(l.length - 1);
      c >= 55296 && c < 56320 && (this.highSurrogate = l[l.length - 1], l = l.slice(0, l.length - 1));
    }
    return e.from(l, this.enc);
  }, h.prototype.end = function() {
    if (this.highSurrogate) {
      var l = this.highSurrogate;
      return this.highSurrogate = "", e.from(l, this.enc);
    }
  }, ks;
}
var Lt = {}, pl;
function qp() {
  if (pl) return Lt;
  pl = 1;
  var e = ir.Buffer;
  Lt._utf32 = t;
  function t(l, c) {
    this.iconv = c, this.bomAware = !0, this.isLE = l.isLE;
  }
  Lt.utf32le = { type: "_utf32", isLE: !0 }, Lt.utf32be = { type: "_utf32", isLE: !1 }, Lt.ucs4le = "utf32le", Lt.ucs4be = "utf32be", t.prototype.encoder = r, t.prototype.decoder = i;
  function r(l, c) {
    this.isLE = c.isLE, this.highSurrogate = 0;
  }
  r.prototype.write = function(l) {
    for (var c = e.from(l, "ucs2"), u = e.alloc(c.length * 2), p = this.isLE ? u.writeUInt32LE : u.writeUInt32BE, _ = 0, m = 0; m < c.length; m += 2) {
      var g = c.readUInt16LE(m), w = g >= 55296 && g < 56320, y = g >= 56320 && g < 57344;
      if (this.highSurrogate)
        if (w || !y)
          p.call(u, this.highSurrogate, _), _ += 4;
        else {
          var E = (this.highSurrogate - 55296 << 10 | g - 56320) + 65536;
          p.call(u, E, _), _ += 4, this.highSurrogate = 0;
          continue;
        }
      w ? this.highSurrogate = g : (p.call(u, g, _), _ += 4, this.highSurrogate = 0);
    }
    return _ < u.length && (u = u.slice(0, _)), u;
  }, r.prototype.end = function() {
    if (this.highSurrogate) {
      var l = e.alloc(4);
      return this.isLE ? l.writeUInt32LE(this.highSurrogate, 0) : l.writeUInt32BE(this.highSurrogate, 0), this.highSurrogate = 0, l;
    }
  };
  function i(l, c) {
    this.isLE = c.isLE, this.badChar = c.iconv.defaultCharUnicode.charCodeAt(0), this.overflow = [];
  }
  i.prototype.write = function(l) {
    if (l.length === 0)
      return "";
    var c = 0, u = 0, p = e.alloc(l.length + 4), _ = 0, m = this.isLE, g = this.overflow, w = this.badChar;
    if (g.length > 0) {
      for (; c < l.length && g.length < 4; c++)
        g.push(l[c]);
      g.length === 4 && (m ? u = g[c] | g[c + 1] << 8 | g[c + 2] << 16 | g[c + 3] << 24 : u = g[c + 3] | g[c + 2] << 8 | g[c + 1] << 16 | g[c] << 24, g.length = 0, _ = s(p, _, u, w));
    }
    for (; c < l.length - 3; c += 4)
      m ? u = l[c] | l[c + 1] << 8 | l[c + 2] << 16 | l[c + 3] << 24 : u = l[c + 3] | l[c + 2] << 8 | l[c + 1] << 16 | l[c] << 24, _ = s(p, _, u, w);
    for (; c < l.length; c++)
      g.push(l[c]);
    return p.slice(0, _).toString("ucs2");
  };
  function s(l, c, u, p) {
    if ((u < 0 || u > 1114111) && (u = p), u >= 65536) {
      u -= 65536;
      var _ = 55296 | u >> 10;
      l[c++] = _ & 255, l[c++] = _ >> 8;
      var u = 56320 | u & 1023;
    }
    return l[c++] = u & 255, l[c++] = u >> 8, c;
  }
  i.prototype.end = function() {
    this.overflow.length = 0;
  }, Lt.utf32 = n, Lt.ucs4 = "utf32";
  function n(l, c) {
    this.iconv = c;
  }
  n.prototype.encoder = o, n.prototype.decoder = a;
  function o(l, c) {
    l = l || {}, l.addBOM === void 0 && (l.addBOM = !0), this.encoder = c.iconv.getEncoder(l.defaultEncoding || "utf-32le", l);
  }
  o.prototype.write = function(l) {
    return this.encoder.write(l);
  }, o.prototype.end = function() {
    return this.encoder.end();
  };
  function a(l, c) {
    this.decoder = null, this.initialBufs = [], this.initialBufsLen = 0, this.options = l || {}, this.iconv = c.iconv;
  }
  a.prototype.write = function(l) {
    if (!this.decoder) {
      if (this.initialBufs.push(l), this.initialBufsLen += l.length, this.initialBufsLen < 32)
        return "";
      var c = h(this.initialBufs, this.options.defaultEncoding);
      this.decoder = this.iconv.getDecoder(c, this.options);
      for (var u = "", p = 0; p < this.initialBufs.length; p++)
        u += this.decoder.write(this.initialBufs[p]);
      return this.initialBufs.length = this.initialBufsLen = 0, u;
    }
    return this.decoder.write(l);
  }, a.prototype.end = function() {
    if (!this.decoder) {
      var l = h(this.initialBufs, this.options.defaultEncoding);
      this.decoder = this.iconv.getDecoder(l, this.options);
      for (var c = "", u = 0; u < this.initialBufs.length; u++)
        c += this.decoder.write(this.initialBufs[u]);
      var p = this.decoder.end();
      return p && (c += p), this.initialBufs.length = this.initialBufsLen = 0, c;
    }
    return this.decoder.end();
  };
  function h(l, c) {
    var u = [], p = 0, _ = 0, m = 0, g = 0, w = 0;
    e:
      for (var y = 0; y < l.length; y++)
        for (var E = l[y], S = 0; S < E.length; S++)
          if (u.push(E[S]), u.length === 4) {
            if (p === 0) {
              if (u[0] === 255 && u[1] === 254 && u[2] === 0 && u[3] === 0)
                return "utf-32le";
              if (u[0] === 0 && u[1] === 0 && u[2] === 254 && u[3] === 255)
                return "utf-32be";
            }
            if ((u[0] !== 0 || u[1] > 16) && m++, (u[3] !== 0 || u[2] > 16) && _++, u[0] === 0 && u[1] === 0 && (u[2] !== 0 || u[3] !== 0) && w++, (u[0] !== 0 || u[1] !== 0) && u[2] === 0 && u[3] === 0 && g++, u.length = 0, p++, p >= 100)
              break e;
          }
    return w - m > g - _ ? "utf-32be" : w - m < g - _ ? "utf-32le" : c || "utf-32le";
  }
  return Lt;
}
var bi = {}, _l;
function jp() {
  if (_l) return bi;
  _l = 1;
  var e = ir.Buffer;
  bi.utf16be = t;
  function t() {
  }
  t.prototype.encoder = r, t.prototype.decoder = i, t.prototype.bomAware = !0;
  function r() {
  }
  r.prototype.write = function(h) {
    for (var l = e.from(h, "ucs2"), c = 0; c < l.length; c += 2) {
      var u = l[c];
      l[c] = l[c + 1], l[c + 1] = u;
    }
    return l;
  }, r.prototype.end = function() {
  };
  function i() {
    this.overflowByte = -1;
  }
  i.prototype.write = function(h) {
    if (h.length == 0)
      return "";
    var l = e.alloc(h.length + 1), c = 0, u = 0;
    for (this.overflowByte !== -1 && (l[0] = h[0], l[1] = this.overflowByte, c = 1, u = 2); c < h.length - 1; c += 2, u += 2)
      l[u] = h[c + 1], l[u + 1] = h[c];
    return this.overflowByte = c == h.length - 1 ? h[h.length - 1] : -1, l.slice(0, u).toString("ucs2");
  }, i.prototype.end = function() {
    this.overflowByte = -1;
  }, bi.utf16 = s;
  function s(h, l) {
    this.iconv = l;
  }
  s.prototype.encoder = n, s.prototype.decoder = o;
  function n(h, l) {
    h = h || {}, h.addBOM === void 0 && (h.addBOM = !0), this.encoder = l.iconv.getEncoder("utf-16le", h);
  }
  n.prototype.write = function(h) {
    return this.encoder.write(h);
  }, n.prototype.end = function() {
    return this.encoder.end();
  };
  function o(h, l) {
    this.decoder = null, this.initialBufs = [], this.initialBufsLen = 0, this.options = h || {}, this.iconv = l.iconv;
  }
  o.prototype.write = function(h) {
    if (!this.decoder) {
      if (this.initialBufs.push(h), this.initialBufsLen += h.length, this.initialBufsLen < 16)
        return "";
      var l = a(this.initialBufs, this.options.defaultEncoding);
      this.decoder = this.iconv.getDecoder(l, this.options);
      for (var c = "", u = 0; u < this.initialBufs.length; u++)
        c += this.decoder.write(this.initialBufs[u]);
      return this.initialBufs.length = this.initialBufsLen = 0, c;
    }
    return this.decoder.write(h);
  }, o.prototype.end = function() {
    if (!this.decoder) {
      var h = a(this.initialBufs, this.options.defaultEncoding);
      this.decoder = this.iconv.getDecoder(h, this.options);
      for (var l = "", c = 0; c < this.initialBufs.length; c++)
        l += this.decoder.write(this.initialBufs[c]);
      var u = this.decoder.end();
      return u && (l += u), this.initialBufs.length = this.initialBufsLen = 0, l;
    }
    return this.decoder.end();
  };
  function a(h, l) {
    var c = [], u = 0, p = 0, _ = 0;
    e:
      for (var m = 0; m < h.length; m++)
        for (var g = h[m], w = 0; w < g.length; w++)
          if (c.push(g[w]), c.length === 2) {
            if (u === 0) {
              if (c[0] === 255 && c[1] === 254) return "utf-16le";
              if (c[0] === 254 && c[1] === 255) return "utf-16be";
            }
            if (c[0] === 0 && c[1] !== 0 && _++, c[0] !== 0 && c[1] === 0 && p++, c.length = 0, u++, u >= 100)
              break e;
          }
    return _ > p ? "utf-16be" : _ < p ? "utf-16le" : l || "utf-16le";
  }
  return bi;
}
var Fr = {}, gl;
function $p() {
  if (gl) return Fr;
  gl = 1;
  var e = ir.Buffer;
  Fr.utf7 = t, Fr.unicode11utf7 = "utf7";
  function t(g, w) {
    this.iconv = w;
  }
  t.prototype.encoder = i, t.prototype.decoder = s, t.prototype.bomAware = !0;
  var r = /[^A-Za-z0-9'\(\),-\.\/:\? \n\r\t]+/g;
  function i(g, w) {
    this.iconv = w.iconv;
  }
  i.prototype.write = function(g) {
    return e.from(g.replace(r, (function(w) {
      return "+" + (w === "+" ? "" : this.iconv.encode(w, "utf16-be").toString("base64").replace(/=+$/, "")) + "-";
    }).bind(this)));
  }, i.prototype.end = function() {
  };
  function s(g, w) {
    this.iconv = w.iconv, this.inBase64 = !1, this.base64Accum = "";
  }
  for (var n = /[A-Za-z0-9\/+]/, o = [], a = 0; a < 256; a++)
    o[a] = n.test(String.fromCharCode(a));
  var h = 43, l = 45, c = 38;
  s.prototype.write = function(g) {
    for (var w = "", y = 0, E = this.inBase64, S = this.base64Accum, v = 0; v < g.length; v++)
      if (!E)
        g[v] == h && (w += this.iconv.decode(g.slice(y, v), "ascii"), y = v + 1, E = !0);
      else if (!o[g[v]]) {
        if (v == y && g[v] == l)
          w += "+";
        else {
          var k = S + this.iconv.decode(g.slice(y, v), "ascii");
          w += this.iconv.decode(e.from(k, "base64"), "utf16-be");
        }
        g[v] != l && v--, y = v + 1, E = !1, S = "";
      }
    if (!E)
      w += this.iconv.decode(g.slice(y), "ascii");
    else {
      var k = S + this.iconv.decode(g.slice(y), "ascii"), R = k.length - k.length % 8;
      S = k.slice(R), k = k.slice(0, R), w += this.iconv.decode(e.from(k, "base64"), "utf16-be");
    }
    return this.inBase64 = E, this.base64Accum = S, w;
  }, s.prototype.end = function() {
    var g = "";
    return this.inBase64 && this.base64Accum.length > 0 && (g = this.iconv.decode(e.from(this.base64Accum, "base64"), "utf16-be")), this.inBase64 = !1, this.base64Accum = "", g;
  }, Fr.utf7imap = u;
  function u(g, w) {
    this.iconv = w;
  }
  u.prototype.encoder = p, u.prototype.decoder = _, u.prototype.bomAware = !0;
  function p(g, w) {
    this.iconv = w.iconv, this.inBase64 = !1, this.base64Accum = e.alloc(6), this.base64AccumIdx = 0;
  }
  p.prototype.write = function(g) {
    for (var w = this.inBase64, y = this.base64Accum, E = this.base64AccumIdx, S = e.alloc(g.length * 5 + 10), v = 0, k = 0; k < g.length; k++) {
      var R = g.charCodeAt(k);
      R >= 32 && R <= 126 ? (w && (E > 0 && (v += S.write(y.slice(0, E).toString("base64").replace(/\//g, ",").replace(/=+$/, ""), v), E = 0), S[v++] = l, w = !1), w || (S[v++] = R, R === c && (S[v++] = l))) : (w || (S[v++] = c, w = !0), w && (y[E++] = R >> 8, y[E++] = R & 255, E == y.length && (v += S.write(y.toString("base64").replace(/\//g, ","), v), E = 0)));
    }
    return this.inBase64 = w, this.base64AccumIdx = E, S.slice(0, v);
  }, p.prototype.end = function() {
    var g = e.alloc(10), w = 0;
    return this.inBase64 && (this.base64AccumIdx > 0 && (w += g.write(this.base64Accum.slice(0, this.base64AccumIdx).toString("base64").replace(/\//g, ",").replace(/=+$/, ""), w), this.base64AccumIdx = 0), g[w++] = l, this.inBase64 = !1), g.slice(0, w);
  };
  function _(g, w) {
    this.iconv = w.iconv, this.inBase64 = !1, this.base64Accum = "";
  }
  var m = o.slice();
  return m[44] = !0, _.prototype.write = function(g) {
    for (var w = "", y = 0, E = this.inBase64, S = this.base64Accum, v = 0; v < g.length; v++)
      if (!E)
        g[v] == c && (w += this.iconv.decode(g.slice(y, v), "ascii"), y = v + 1, E = !0);
      else if (!m[g[v]]) {
        if (v == y && g[v] == l)
          w += "&";
        else {
          var k = S + this.iconv.decode(g.slice(y, v), "ascii").replace(/,/g, "/");
          w += this.iconv.decode(e.from(k, "base64"), "utf16-be");
        }
        g[v] != l && v--, y = v + 1, E = !1, S = "";
      }
    if (!E)
      w += this.iconv.decode(g.slice(y), "ascii");
    else {
      var k = S + this.iconv.decode(g.slice(y), "ascii").replace(/,/g, "/"), R = k.length - k.length % 8;
      S = k.slice(R), k = k.slice(0, R), w += this.iconv.decode(e.from(k, "base64"), "utf16-be");
    }
    return this.inBase64 = E, this.base64Accum = S, w;
  }, _.prototype.end = function() {
    var g = "";
    return this.inBase64 && this.base64Accum.length > 0 && (g = this.iconv.decode(e.from(this.base64Accum, "base64"), "utf16-be")), this.inBase64 = !1, this.base64Accum = "", g;
  }, Fr;
}
var Bs = {}, vl;
function Kp() {
  if (vl) return Bs;
  vl = 1;
  var e = ir.Buffer;
  Bs._sbcs = t;
  function t(s, n) {
    if (!s)
      throw new Error("SBCS codec is called without the data.");
    if (!s.chars || s.chars.length !== 128 && s.chars.length !== 256)
      throw new Error("Encoding '" + s.type + "' has incorrect 'chars' (must be of len 128 or 256)");
    if (s.chars.length === 128) {
      for (var o = "", a = 0; a < 128; a++)
        o += String.fromCharCode(a);
      s.chars = o + s.chars;
    }
    this.decodeBuf = e.from(s.chars, "ucs2");
    for (var h = e.alloc(65536, n.defaultCharSingleByte.charCodeAt(0)), a = 0; a < s.chars.length; a++)
      h[s.chars.charCodeAt(a)] = a;
    this.encodeBuf = h;
  }
  t.prototype.encoder = r, t.prototype.decoder = i;
  function r(s, n) {
    this.encodeBuf = n.encodeBuf;
  }
  r.prototype.write = function(s) {
    for (var n = e.alloc(s.length), o = 0; o < s.length; o++)
      n[o] = this.encodeBuf[s.charCodeAt(o)];
    return n;
  }, r.prototype.end = function() {
  };
  function i(s, n) {
    this.decodeBuf = n.decodeBuf;
  }
  return i.prototype.write = function(s) {
    for (var n = this.decodeBuf, o = e.alloc(s.length * 2), a = 0, h = 0, l = 0; l < s.length; l++)
      a = s[l] * 2, h = l * 2, o[h] = n[a], o[h + 1] = n[a + 1];
    return o.toString("ucs2");
  }, i.prototype.end = function() {
  }, Bs;
}
var Rs, ml;
function Vp() {
  return ml || (ml = 1, Rs = {
    // Not supported by iconv, not sure why.
    10029: "maccenteuro",
    maccenteuro: {
      type: "_sbcs",
      chars: "ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§•¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅņŃ¬√ńŇ∆«»… ňŐÕőŌ–—“”‘’÷◊ōŔŕŘ‹›řŖŗŠ‚„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ"
    },
    808: "cp808",
    ibm808: "cp808",
    cp808: {
      type: "_sbcs",
      chars: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№€■ "
    },
    mik: {
      type: "_sbcs",
      chars: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя└┴┬├─┼╣║╚╔╩╦╠═╬┐░▒▓│┤№§╗╝┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
    },
    cp720: {
      type: "_sbcs",
      chars: "éâàçêëèïîّْô¤ـûùءآأؤ£إئابةتثجحخدذرزسشص«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀ضطظعغفµقكلمنهوىي≡ًٌٍَُِ≈°∙·√ⁿ²■ "
    },
    // Aliases of generated encodings.
    ascii8bit: "ascii",
    usascii: "ascii",
    ansix34: "ascii",
    ansix341968: "ascii",
    ansix341986: "ascii",
    csascii: "ascii",
    cp367: "ascii",
    ibm367: "ascii",
    isoir6: "ascii",
    iso646us: "ascii",
    iso646irv: "ascii",
    us: "ascii",
    latin1: "iso88591",
    latin2: "iso88592",
    latin3: "iso88593",
    latin4: "iso88594",
    latin5: "iso88599",
    latin6: "iso885910",
    latin7: "iso885913",
    latin8: "iso885914",
    latin9: "iso885915",
    latin10: "iso885916",
    csisolatin1: "iso88591",
    csisolatin2: "iso88592",
    csisolatin3: "iso88593",
    csisolatin4: "iso88594",
    csisolatincyrillic: "iso88595",
    csisolatinarabic: "iso88596",
    csisolatingreek: "iso88597",
    csisolatinhebrew: "iso88598",
    csisolatin5: "iso88599",
    csisolatin6: "iso885910",
    l1: "iso88591",
    l2: "iso88592",
    l3: "iso88593",
    l4: "iso88594",
    l5: "iso88599",
    l6: "iso885910",
    l7: "iso885913",
    l8: "iso885914",
    l9: "iso885915",
    l10: "iso885916",
    isoir14: "iso646jp",
    isoir57: "iso646cn",
    isoir100: "iso88591",
    isoir101: "iso88592",
    isoir109: "iso88593",
    isoir110: "iso88594",
    isoir144: "iso88595",
    isoir127: "iso88596",
    isoir126: "iso88597",
    isoir138: "iso88598",
    isoir148: "iso88599",
    isoir157: "iso885910",
    isoir166: "tis620",
    isoir179: "iso885913",
    isoir199: "iso885914",
    isoir203: "iso885915",
    isoir226: "iso885916",
    cp819: "iso88591",
    ibm819: "iso88591",
    cyrillic: "iso88595",
    arabic: "iso88596",
    arabic8: "iso88596",
    ecma114: "iso88596",
    asmo708: "iso88596",
    greek: "iso88597",
    greek8: "iso88597",
    ecma118: "iso88597",
    elot928: "iso88597",
    hebrew: "iso88598",
    hebrew8: "iso88598",
    turkish: "iso88599",
    turkish8: "iso88599",
    thai: "iso885911",
    thai8: "iso885911",
    celtic: "iso885914",
    celtic8: "iso885914",
    isoceltic: "iso885914",
    tis6200: "tis620",
    tis62025291: "tis620",
    tis62025330: "tis620",
    1e4: "macroman",
    10006: "macgreek",
    10007: "maccyrillic",
    10079: "maciceland",
    10081: "macturkish",
    cspc8codepage437: "cp437",
    cspc775baltic: "cp775",
    cspc850multilingual: "cp850",
    cspcp852: "cp852",
    cspc862latinhebrew: "cp862",
    cpgr: "cp869",
    msee: "cp1250",
    mscyrl: "cp1251",
    msansi: "cp1252",
    msgreek: "cp1253",
    msturk: "cp1254",
    mshebr: "cp1255",
    msarab: "cp1256",
    winbaltrim: "cp1257",
    cp20866: "koi8r",
    20866: "koi8r",
    ibm878: "koi8r",
    cskoi8r: "koi8r",
    cp21866: "koi8u",
    21866: "koi8u",
    ibm1168: "koi8u",
    strk10482002: "rk1048",
    tcvn5712: "tcvn",
    tcvn57121: "tcvn",
    gb198880: "iso646cn",
    cn: "iso646cn",
    csiso14jisc6220ro: "iso646jp",
    jisc62201969ro: "iso646jp",
    jp: "iso646jp",
    cshproman8: "hproman8",
    r8: "hproman8",
    roman8: "hproman8",
    xroman8: "hproman8",
    ibm1051: "hproman8",
    mac: "macintosh",
    csmacintosh: "macintosh"
  }), Rs;
}
var As, yl;
function Gp() {
  return yl || (yl = 1, As = {
    437: "cp437",
    737: "cp737",
    775: "cp775",
    850: "cp850",
    852: "cp852",
    855: "cp855",
    856: "cp856",
    857: "cp857",
    858: "cp858",
    860: "cp860",
    861: "cp861",
    862: "cp862",
    863: "cp863",
    864: "cp864",
    865: "cp865",
    866: "cp866",
    869: "cp869",
    874: "windows874",
    922: "cp922",
    1046: "cp1046",
    1124: "cp1124",
    1125: "cp1125",
    1129: "cp1129",
    1133: "cp1133",
    1161: "cp1161",
    1162: "cp1162",
    1163: "cp1163",
    1250: "windows1250",
    1251: "windows1251",
    1252: "windows1252",
    1253: "windows1253",
    1254: "windows1254",
    1255: "windows1255",
    1256: "windows1256",
    1257: "windows1257",
    1258: "windows1258",
    28591: "iso88591",
    28592: "iso88592",
    28593: "iso88593",
    28594: "iso88594",
    28595: "iso88595",
    28596: "iso88596",
    28597: "iso88597",
    28598: "iso88598",
    28599: "iso88599",
    28600: "iso885910",
    28601: "iso885911",
    28603: "iso885913",
    28604: "iso885914",
    28605: "iso885915",
    28606: "iso885916",
    windows874: {
      type: "_sbcs",
      chars: "€����…�����������‘’“”•–—�������� กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����"
    },
    win874: "windows874",
    cp874: "windows874",
    windows1250: {
      type: "_sbcs",
      chars: "€�‚�„…†‡�‰Š‹ŚŤŽŹ�‘’“”•–—�™š›śťžź ˇ˘Ł¤Ą¦§¨©Ş«¬­®Ż°±˛ł´µ¶·¸ąş»Ľ˝ľżŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢßŕáâăäĺćçčéęëěíîďđńňóôőö÷řůúűüýţ˙"
    },
    win1250: "windows1250",
    cp1250: "windows1250",
    windows1251: {
      type: "_sbcs",
      chars: "ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—�™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬­®Ї°±Ііґµ¶·ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя"
    },
    win1251: "windows1251",
    cp1251: "windows1251",
    windows1252: {
      type: "_sbcs",
      chars: "€�‚ƒ„…†‡ˆ‰Š‹Œ�Ž��‘’“”•–—˜™š›œ�žŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
    },
    win1252: "windows1252",
    cp1252: "windows1252",
    windows1253: {
      type: "_sbcs",
      chars: "€�‚ƒ„…†‡�‰�‹�����‘’“”•–—�™�›���� ΅Ά£¤¥¦§¨©�«¬­®―°±²³΄µ¶·ΈΉΊ»Ό½ΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ�ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ�"
    },
    win1253: "windows1253",
    cp1253: "windows1253",
    windows1254: {
      type: "_sbcs",
      chars: "€�‚ƒ„…†‡ˆ‰Š‹Œ����‘’“”•–—˜™š›œ��Ÿ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖ×ØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğñòóôõö÷øùúûüışÿ"
    },
    win1254: "windows1254",
    cp1254: "windows1254",
    windows1255: {
      type: "_sbcs",
      chars: "€�‚ƒ„…†‡ˆ‰�‹�����‘’“”•–—˜™�›���� ¡¢£₪¥¦§¨©×«¬­®¯°±²³´µ¶·¸¹÷»¼½¾¿ְֱֲֳִֵֶַָֹֺֻּֽ־ֿ׀ׁׂ׃װױײ׳״�������אבגדהוזחטיךכלםמןנסעףפץצקרשת��‎‏�"
    },
    win1255: "windows1255",
    cp1255: "windows1255",
    windows1256: {
      type: "_sbcs",
      chars: "€پ‚ƒ„…†‡ˆ‰ٹ‹Œچژڈگ‘’“”•–—ک™ڑ›œ‌‍ں ،¢£¤¥¦§¨©ھ«¬­®¯°±²³´µ¶·¸¹؛»¼½¾؟ہءآأؤإئابةتثجحخدذرزسشصض×طظعغـفقكàلâمنهوçèéêëىيîïًٌٍَôُِ÷ّùْûü‎‏ے"
    },
    win1256: "windows1256",
    cp1256: "windows1256",
    windows1257: {
      type: "_sbcs",
      chars: "€�‚�„…†‡�‰�‹�¨ˇ¸�‘’“”•–—�™�›�¯˛� �¢£¤�¦§Ø©Ŗ«¬­®Æ°±²³´µ¶·ø¹ŗ»¼½¾æĄĮĀĆÄÅĘĒČÉŹĖĢĶĪĻŠŃŅÓŌÕÖ×ŲŁŚŪÜŻŽßąįāćäåęēčéźėģķīļšńņóōõö÷ųłśūüżž˙"
    },
    win1257: "windows1257",
    cp1257: "windows1257",
    windows1258: {
      type: "_sbcs",
      chars: "€�‚ƒ„…†‡ˆ‰�‹Œ����‘’“”•–—˜™�›œ��Ÿ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂĂÄÅÆÇÈÉÊË̀ÍÎÏĐÑ̉ÓÔƠÖ×ØÙÚÛÜỮßàáâăäåæçèéêë́íîïđṇ̃óôơö÷øùúûüư₫ÿ"
    },
    win1258: "windows1258",
    cp1258: "windows1258",
    iso88591: {
      type: "_sbcs",
      chars: " ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
    },
    cp28591: "iso88591",
    iso88592: {
      type: "_sbcs",
      chars: " Ą˘Ł¤ĽŚ§¨ŠŞŤŹ­ŽŻ°ą˛ł´ľśˇ¸šşťź˝žżŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢßŕáâăäĺćçčéęëěíîďđńňóôőö÷řůúűüýţ˙"
    },
    cp28592: "iso88592",
    iso88593: {
      type: "_sbcs",
      chars: " Ħ˘£¤�Ĥ§¨İŞĞĴ­�Ż°ħ²³´µĥ·¸ışğĵ½�żÀÁÂ�ÄĊĈÇÈÉÊËÌÍÎÏ�ÑÒÓÔĠÖ×ĜÙÚÛÜŬŜßàáâ�äċĉçèéêëìíîï�ñòóôġö÷ĝùúûüŭŝ˙"
    },
    cp28593: "iso88593",
    iso88594: {
      type: "_sbcs",
      chars: " ĄĸŖ¤ĨĻ§¨ŠĒĢŦ­Ž¯°ą˛ŗ´ĩļˇ¸šēģŧŊžŋĀÁÂÃÄÅÆĮČÉĘËĖÍÎĪĐŅŌĶÔÕÖ×ØŲÚÛÜŨŪßāáâãäåæįčéęëėíîīđņōķôõö÷øųúûüũū˙"
    },
    cp28594: "iso88594",
    iso88595: {
      type: "_sbcs",
      chars: " ЁЂЃЄЅІЇЈЉЊЋЌ­ЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя№ёђѓєѕіїјљњћќ§ўџ"
    },
    cp28595: "iso88595",
    iso88596: {
      type: "_sbcs",
      chars: " ���¤�������،­�������������؛���؟�ءآأؤإئابةتثجحخدذرزسشصضطظعغ�����ـفقكلمنهوىيًٌٍَُِّْ�������������"
    },
    cp28596: "iso88596",
    iso88597: {
      type: "_sbcs",
      chars: " ‘’£€₯¦§¨©ͺ«¬­�―°±²³΄΅Ά·ΈΉΊ»Ό½ΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ�ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ�"
    },
    cp28597: "iso88597",
    iso88598: {
      type: "_sbcs",
      chars: " �¢£¤¥¦§¨©×«¬­®¯°±²³´µ¶·¸¹÷»¼½¾��������������������������������‗אבגדהוזחטיךכלםמןנסעףפץצקרשת��‎‏�"
    },
    cp28598: "iso88598",
    iso88599: {
      type: "_sbcs",
      chars: " ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖ×ØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğñòóôõö÷øùúûüışÿ"
    },
    cp28599: "iso88599",
    iso885910: {
      type: "_sbcs",
      chars: " ĄĒĢĪĨĶ§ĻĐŠŦŽ­ŪŊ°ąēģīĩķ·ļđšŧž―ūŋĀÁÂÃÄÅÆĮČÉĘËĖÍÎÏÐŅŌÓÔÕÖŨØŲÚÛÜÝÞßāáâãäåæįčéęëėíîïðņōóôõöũøųúûüýþĸ"
    },
    cp28600: "iso885910",
    iso885911: {
      type: "_sbcs",
      chars: " กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����"
    },
    cp28601: "iso885911",
    iso885913: {
      type: "_sbcs",
      chars: " ”¢£¤„¦§Ø©Ŗ«¬­®Æ°±²³“µ¶·ø¹ŗ»¼½¾æĄĮĀĆÄÅĘĒČÉŹĖĢĶĪĻŠŃŅÓŌÕÖ×ŲŁŚŪÜŻŽßąįāćäåęēčéźėģķīļšńņóōõö÷ųłśūüżž’"
    },
    cp28603: "iso885913",
    iso885914: {
      type: "_sbcs",
      chars: " Ḃḃ£ĊċḊ§Ẁ©ẂḋỲ­®ŸḞḟĠġṀṁ¶ṖẁṗẃṠỳẄẅṡÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏŴÑÒÓÔÕÖṪØÙÚÛÜÝŶßàáâãäåæçèéêëìíîïŵñòóôõöṫøùúûüýŷÿ"
    },
    cp28604: "iso885914",
    iso885915: {
      type: "_sbcs",
      chars: " ¡¢£€¥Š§š©ª«¬­®¯°±²³Žµ¶·ž¹º»ŒœŸ¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
    },
    cp28605: "iso885915",
    iso885916: {
      type: "_sbcs",
      chars: " ĄąŁ€„Š§š©Ș«Ź­źŻ°±ČłŽ”¶·žčș»ŒœŸżÀÁÂĂÄĆÆÇÈÉÊËÌÍÎÏĐŃÒÓÔŐÖŚŰÙÚÛÜĘȚßàáâăäćæçèéêëìíîïđńòóôőöśűùúûüęțÿ"
    },
    cp28606: "iso885916",
    cp437: {
      type: "_sbcs",
      chars: "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
    },
    ibm437: "cp437",
    csibm437: "cp437",
    cp737: {
      type: "_sbcs",
      chars: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρσςτυφχψ░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀ωάέήϊίόύϋώΆΈΉΊΌΎΏ±≥≤ΪΫ÷≈°∙·√ⁿ²■ "
    },
    ibm737: "cp737",
    csibm737: "cp737",
    cp775: {
      type: "_sbcs",
      chars: "ĆüéāäģåćłēŖŗīŹÄÅÉæÆōöĢ¢ŚśÖÜø£Ø×¤ĀĪóŻżź”¦©®¬½¼Ł«»░▒▓│┤ĄČĘĖ╣║╗╝ĮŠ┐└┴┬├─┼ŲŪ╚╔╩╦╠═╬Žąčęėįšųūž┘┌█▄▌▐▀ÓßŌŃõÕµńĶķĻļņĒŅ’­±“¾¶§÷„°∙·¹³²■ "
    },
    ibm775: "cp775",
    csibm775: "cp775",
    cp850: {
      type: "_sbcs",
      chars: "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ "
    },
    ibm850: "cp850",
    csibm850: "cp850",
    cp852: {
      type: "_sbcs",
      chars: "ÇüéâäůćçłëŐőîŹÄĆÉĹĺôöĽľŚśÖÜŤťŁ×čáíóúĄąŽžĘę¬źČş«»░▒▓│┤ÁÂĚŞ╣║╗╝Żż┐└┴┬├─┼Ăă╚╔╩╦╠═╬¤đĐĎËďŇÍÎě┘┌█▄ŢŮ▀ÓßÔŃńňŠšŔÚŕŰýÝţ´­˝˛ˇ˘§÷¸°¨˙űŘř■ "
    },
    ibm852: "cp852",
    csibm852: "cp852",
    cp855: {
      type: "_sbcs",
      chars: "ђЂѓЃёЁєЄѕЅіІїЇјЈљЉњЊћЋќЌўЎџЏюЮъЪаАбБцЦдДеЕфФгГ«»░▒▓│┤хХиИ╣║╗╝йЙ┐└┴┬├─┼кК╚╔╩╦╠═╬¤лЛмМнНоОп┘┌█▄Пя▀ЯрРсСтТуУжЖвВьЬ№­ыЫзЗшШэЭщЩчЧ§■ "
    },
    ibm855: "cp855",
    csibm855: "cp855",
    cp856: {
      type: "_sbcs",
      chars: "אבגדהוזחטיךכלםמןנסעףפץצקרשת�£�×����������®¬½¼�«»░▒▓│┤���©╣║╗╝¢¥┐└┴┬├─┼��╚╔╩╦╠═╬¤���������┘┌█▄¦�▀������µ�������¯´­±‗¾¶§÷¸°¨·¹³²■ "
    },
    ibm856: "cp856",
    csibm856: "cp856",
    cp857: {
      type: "_sbcs",
      chars: "ÇüéâäàåçêëèïîıÄÅÉæÆôöòûùİÖÜø£ØŞşáíóúñÑĞğ¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ºªÊËÈ�ÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµ�×ÚÛÙìÿ¯´­±�¾¶§÷¸°¨·¹³²■ "
    },
    ibm857: "cp857",
    csibm857: "cp857",
    cp858: {
      type: "_sbcs",
      chars: "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈ€ÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ "
    },
    ibm858: "cp858",
    csibm858: "cp858",
    cp860: {
      type: "_sbcs",
      chars: "ÇüéâãàÁçêÊèÍÔìÃÂÉÀÈôõòÚùÌÕÜ¢£Ù₧ÓáíóúñÑªº¿Ò¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
    },
    ibm860: "cp860",
    csibm860: "cp860",
    cp861: {
      type: "_sbcs",
      chars: "ÇüéâäàåçêëèÐðÞÄÅÉæÆôöþûÝýÖÜø£Ø₧ƒáíóúÁÍÓÚ¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
    },
    ibm861: "cp861",
    csibm861: "cp861",
    cp862: {
      type: "_sbcs",
      chars: "אבגדהוזחטיךכלםמןנסעףפץצקרשת¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
    },
    ibm862: "cp862",
    csibm862: "cp862",
    cp863: {
      type: "_sbcs",
      chars: "ÇüéâÂà¶çêëèïî‗À§ÉÈÊôËÏûù¤ÔÜ¢£ÙÛƒ¦´óú¨¸³¯Î⌐¬½¼¾«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
    },
    ibm863: "cp863",
    csibm863: "cp863",
    cp864: {
      type: "_sbcs",
      chars: `\0\x07\b	
\v\f\r\x1B !"#$٪&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~°·∙√▒─│┼┤┬├┴┐┌└┘β∞φ±½¼≈«»ﻷﻸ��ﻻﻼ� ­ﺂ£¤ﺄ��ﺎﺏﺕﺙ،ﺝﺡﺥ٠١٢٣٤٥٦٧٨٩ﻑ؛ﺱﺵﺹ؟¢ﺀﺁﺃﺅﻊﺋﺍﺑﺓﺗﺛﺟﺣﺧﺩﺫﺭﺯﺳﺷﺻﺿﻁﻅﻋﻏ¦¬÷×ﻉـﻓﻗﻛﻟﻣﻧﻫﻭﻯﻳﺽﻌﻎﻍﻡﹽّﻥﻩﻬﻰﻲﻐﻕﻵﻶﻝﻙﻱ■�`
    },
    ibm864: "cp864",
    csibm864: "cp864",
    cp865: {
      type: "_sbcs",
      chars: "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø₧ƒáíóúñÑªº¿⌐¬½¼¡«¤░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
    },
    ibm865: "cp865",
    csibm865: "cp865",
    cp866: {
      type: "_sbcs",
      chars: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■ "
    },
    ibm866: "cp866",
    csibm866: "cp866",
    cp869: {
      type: "_sbcs",
      chars: "������Ά�·¬¦‘’Έ―ΉΊΪΌ��ΎΫ©Ώ²³ά£έήίϊΐόύΑΒΓΔΕΖΗ½ΘΙ«»░▒▓│┤ΚΛΜΝ╣║╗╝ΞΟ┐└┴┬├─┼ΠΡ╚╔╩╦╠═╬ΣΤΥΦΧΨΩαβγ┘┌█▄δε▀ζηθικλμνξοπρσςτ΄­±υφχ§ψ΅°¨ωϋΰώ■ "
    },
    ibm869: "cp869",
    csibm869: "cp869",
    cp922: {
      type: "_sbcs",
      chars: " ¡¢£¤¥¦§¨©ª«¬­®‾°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏŠÑÒÓÔÕÖ×ØÙÚÛÜÝŽßàáâãäåæçèéêëìíîïšñòóôõö÷øùúûüýžÿ"
    },
    ibm922: "cp922",
    csibm922: "cp922",
    cp1046: {
      type: "_sbcs",
      chars: "ﺈ×÷ﹱ■│─┐┌└┘ﹹﹻﹽﹿﹷﺊﻰﻳﻲﻎﻏﻐﻶﻸﻺﻼ ¤ﺋﺑﺗﺛﺟﺣ،­ﺧﺳ٠١٢٣٤٥٦٧٨٩ﺷ؛ﺻﺿﻊ؟ﻋءآأؤإئابةتثجحخدذرزسشصضطﻇعغﻌﺂﺄﺎﻓـفقكلمنهوىيًٌٍَُِّْﻗﻛﻟﻵﻷﻹﻻﻣﻧﻬﻩ�"
    },
    ibm1046: "cp1046",
    csibm1046: "cp1046",
    cp1124: {
      type: "_sbcs",
      chars: " ЁЂҐЄЅІЇЈЉЊЋЌ­ЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя№ёђґєѕіїјљњћќ§ўџ"
    },
    ibm1124: "cp1124",
    csibm1124: "cp1124",
    cp1125: {
      type: "_sbcs",
      chars: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёҐґЄєІіЇї·√№¤■ "
    },
    ibm1125: "cp1125",
    csibm1125: "cp1125",
    cp1129: {
      type: "_sbcs",
      chars: " ¡¢£¤¥¦§œ©ª«¬­®¯°±²³Ÿµ¶·Œ¹º»¼½¾¿ÀÁÂĂÄÅÆÇÈÉÊË̀ÍÎÏĐÑ̉ÓÔƠÖ×ØÙÚÛÜỮßàáâăäåæçèéêë́íîïđṇ̃óôơö÷øùúûüư₫ÿ"
    },
    ibm1129: "cp1129",
    csibm1129: "cp1129",
    cp1133: {
      type: "_sbcs",
      chars: " ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮ���ຯະາຳິີຶືຸູຼັົຽ���ເແໂໃໄ່້໊໋໌ໍໆ�ໜໝ₭����������������໐໑໒໓໔໕໖໗໘໙��¢¬¦�"
    },
    ibm1133: "cp1133",
    csibm1133: "cp1133",
    cp1161: {
      type: "_sbcs",
      chars: "��������������������������������่กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู้๊๋€฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛¢¬¦ "
    },
    ibm1161: "cp1161",
    csibm1161: "cp1161",
    cp1162: {
      type: "_sbcs",
      chars: "€…‘’“”•–— กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����"
    },
    ibm1162: "cp1162",
    csibm1162: "cp1162",
    cp1163: {
      type: "_sbcs",
      chars: " ¡¢£€¥¦§œ©ª«¬­®¯°±²³Ÿµ¶·Œ¹º»¼½¾¿ÀÁÂĂÄÅÆÇÈÉÊË̀ÍÎÏĐÑ̉ÓÔƠÖ×ØÙÚÛÜỮßàáâăäåæçèéêë́íîïđṇ̃óôơö÷øùúûüư₫ÿ"
    },
    ibm1163: "cp1163",
    csibm1163: "cp1163",
    maccroatian: {
      type: "_sbcs",
      chars: "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø¿¡¬√ƒ≈Ć«Č… ÀÃÕŒœĐ—“”‘’÷◊�©⁄¤‹›Æ»–·‚„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙıˆ˜¯πË˚¸Êæˇ"
    },
    maccyrillic: {
      type: "_sbcs",
      chars: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°¢£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµ∂ЈЄєЇїЉљЊњјЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю¤"
    },
    macgreek: {
      type: "_sbcs",
      chars: "Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï•½‰ôö¦­ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩάΝ¬ΟΡ≈Τ«»… ΥΧΆΈœ–―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ�"
    },
    maciceland: {
      type: "_sbcs",
      chars: "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄¤ÐðÞþý·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ"
    },
    macroman: {
      type: "_sbcs",
      chars: "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄¤‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ"
    },
    macromania: {
      type: "_sbcs",
      chars: "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ĂŞ∞±≤≥¥µ∂∑∏π∫ªºΩăş¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄¤‹›Ţţ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ"
    },
    macthai: {
      type: "_sbcs",
      chars: "«»…“”�•‘’� กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู\uFEFF​–—฿เแโใไๅๆ็่้๊๋์ํ™๏๐๑๒๓๔๕๖๗๘๙®©����"
    },
    macturkish: {
      type: "_sbcs",
      chars: "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸĞğİıŞş‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙ�ˆ˜¯˘˙˚¸˝˛ˇ"
    },
    macukraine: {
      type: "_sbcs",
      chars: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњјЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю¤"
    },
    koi8r: {
      type: "_sbcs",
      chars: "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥ ⌡°²·÷═║╒ё╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡Ё╢╣╤╥╦╧╨╩╪╫╬©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ"
    },
    koi8u: {
      type: "_sbcs",
      chars: "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥ ⌡°²·÷═║╒ёє╔ії╗╘╙╚╛ґ╝╞╟╠╡ЁЄ╣ІЇ╦╧╨╩╪Ґ╬©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ"
    },
    koi8ru: {
      type: "_sbcs",
      chars: "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥ ⌡°²·÷═║╒ёє╔ії╗╘╙╚╛ґў╞╟╠╡ЁЄ╣ІЇ╦╧╨╩╪ҐЎ©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ"
    },
    koi8t: {
      type: "_sbcs",
      chars: "қғ‚Ғ„…†‡�‰ҳ‹ҲҷҶ�Қ‘’“”•–—�™�›�����ӯӮё¤ӣ¦§���«¬­®�°±²Ё�Ӣ¶·�№�»���©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ"
    },
    armscii8: {
      type: "_sbcs",
      chars: " �և։)(»«—.՝,-֊…՜՛՞ԱաԲբԳգԴդԵեԶզԷէԸըԹթԺժԻիԼլԽխԾծԿկՀհՁձՂղՃճՄմՅյՆնՇշՈոՉչՊպՋջՌռՍսՎվՏտՐրՑցՒւՓփՔքՕօՖֆ՚�"
    },
    rk1048: {
      type: "_sbcs",
      chars: "ЂЃ‚ѓ„…†‡€‰Љ‹ЊҚҺЏђ‘’“”•–—�™љ›њқһџ ҰұӘ¤Ө¦§Ё©Ғ«¬­®Ү°±Ііөµ¶·ё№ғ»әҢңүАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя"
    },
    tcvn: {
      type: "_sbcs",
      chars: `\0ÚỤỪỬỮ\x07\b	
\v\f\rỨỰỲỶỸÝỴ\x1B !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~ÀẢÃÁẠẶẬÈẺẼÉẸỆÌỈĨÍỊÒỎÕÓỌỘỜỞỠỚỢÙỦŨ ĂÂÊÔƠƯĐăâêôơưđẶ̀̀̉̃́àảãáạẲằẳẵắẴẮẦẨẪẤỀặầẩẫấậèỂẻẽéẹềểễếệìỉỄẾỒĩíịòỔỏõóọồổỗốộờởỡớợùỖủũúụừửữứựỳỷỹýỵỐ`
    },
    georgianacademy: {
      type: "_sbcs",
      chars: "‚ƒ„…†‡ˆ‰Š‹Œ‘’“”•–—˜™š›œŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰჱჲჳჴჵჶçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
    },
    georgianps: {
      type: "_sbcs",
      chars: "‚ƒ„…†‡ˆ‰Š‹Œ‘’“”•–—˜™š›œŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿აბგდევზჱთიკლმნჲოპჟრსტჳუფქღყშჩცძწჭხჴჯჰჵæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
    },
    pt154: {
      type: "_sbcs",
      chars: "ҖҒӮғ„…ҶҮҲүҠӢҢҚҺҸҗ‘’“”•–—ҳҷҡӣңқһҹ ЎўЈӨҘҰ§Ё©Ә«¬ӯ®Ҝ°ұІіҙө¶·ё№ә»јҪҫҝАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя"
    },
    viscii: {
      type: "_sbcs",
      chars: `\0ẲẴẪ\x07\b	
\v\f\rỶỸ\x1BỴ !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~ẠẮẰẶẤẦẨẬẼẸẾỀỂỄỆỐỒỔỖỘỢỚỜỞỊỎỌỈỦŨỤỲÕắằặấầẩậẽẹếềểễệốồổỗỠƠộờởịỰỨỪỬơớƯÀÁÂÃẢĂẳẵÈÉÊẺÌÍĨỳĐứÒÓÔạỷừửÙÚỹỵÝỡưàáâãảăữẫèéêẻìíĩỉđựòóôõỏọụùúũủýợỮ`
    },
    iso646cn: {
      type: "_sbcs",
      chars: `\0\x07\b	
\v\f\r\x1B !"#¥%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}‾��������������������������������������������������������������������������������������������������������������������������������`
    },
    iso646jp: {
      type: "_sbcs",
      chars: `\0\x07\b	
\v\f\r\x1B !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[¥]^_\`abcdefghijklmnopqrstuvwxyz{|}‾��������������������������������������������������������������������������������������������������������������������������������`
    },
    hproman8: {
      type: "_sbcs",
      chars: " ÀÂÈÊËÎÏ´ˋˆ¨˜ÙÛ₤¯Ýý°ÇçÑñ¡¿¤£¥§ƒ¢âêôûáéóúàèòùäëöüÅîØÆåíøæÄìÖÜÉïßÔÁÃãÐðÍÌÓÒÕõŠšÚŸÿÞþ·µ¶¾—¼½ªº«■»±�"
    },
    macintosh: {
      type: "_sbcs",
      chars: "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄¤‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ"
    },
    ascii: {
      type: "_sbcs",
      chars: "��������������������������������������������������������������������������������������������������������������������������������"
    },
    tis620: {
      type: "_sbcs",
      chars: "���������������������������������กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����"
    }
  }), As;
}
var Ds = {}, bl;
function Yp() {
  if (bl) return Ds;
  bl = 1;
  var e = ir.Buffer;
  Ds._dbcs = h;
  for (var t = -1, r = -2, i = -10, s = -1e3, n = new Array(256), o = -1, a = 0; a < 256; a++)
    n[a] = t;
  function h(p, _) {
    if (this.encodingName = p.encodingName, !p)
      throw new Error("DBCS codec is called without the data.");
    if (!p.table)
      throw new Error("Encoding '" + this.encodingName + "' has no data.");
    var m = p.table();
    this.decodeTables = [], this.decodeTables[0] = n.slice(0), this.decodeTableSeq = [];
    for (var g = 0; g < m.length; g++)
      this._addDecodeChunk(m[g]);
    if (typeof p.gb18030 == "function") {
      this.gb18030 = p.gb18030();
      var w = this.decodeTables.length;
      this.decodeTables.push(n.slice(0));
      var y = this.decodeTables.length;
      this.decodeTables.push(n.slice(0));
      for (var E = this.decodeTables[0], g = 129; g <= 254; g++)
        for (var S = this.decodeTables[s - E[g]], v = 48; v <= 57; v++) {
          if (S[v] === t)
            S[v] = s - w;
          else if (S[v] > s)
            throw new Error("gb18030 decode tables conflict at byte 2");
          for (var k = this.decodeTables[s - S[v]], R = 129; R <= 254; R++) {
            if (k[R] === t)
              k[R] = s - y;
            else {
              if (k[R] === s - y)
                continue;
              if (k[R] > s)
                throw new Error("gb18030 decode tables conflict at byte 3");
            }
            for (var O = this.decodeTables[s - k[R]], N = 48; N <= 57; N++)
              O[N] === t && (O[N] = r);
          }
        }
    }
    this.defaultCharUnicode = _.defaultCharUnicode, this.encodeTable = [], this.encodeTableSeq = [];
    var W = {};
    if (p.encodeSkipVals)
      for (var g = 0; g < p.encodeSkipVals.length; g++) {
        var Z = p.encodeSkipVals[g];
        if (typeof Z == "number")
          W[Z] = !0;
        else
          for (var v = Z.from; v <= Z.to; v++)
            W[v] = !0;
      }
    if (this._fillEncodeTable(0, 0, W), p.encodeAdd)
      for (var ie in p.encodeAdd)
        Object.prototype.hasOwnProperty.call(p.encodeAdd, ie) && this._setEncodeChar(ie.charCodeAt(0), p.encodeAdd[ie]);
    this.defCharSB = this.encodeTable[0][_.defaultCharSingleByte.charCodeAt(0)], this.defCharSB === t && (this.defCharSB = this.encodeTable[0]["?"]), this.defCharSB === t && (this.defCharSB = 63);
  }
  h.prototype.encoder = l, h.prototype.decoder = c, h.prototype._getDecodeTrieNode = function(p) {
    for (var _ = []; p > 0; p >>>= 8)
      _.push(p & 255);
    _.length == 0 && _.push(0);
    for (var m = this.decodeTables[0], g = _.length - 1; g > 0; g--) {
      var w = m[_[g]];
      if (w == t)
        m[_[g]] = s - this.decodeTables.length, this.decodeTables.push(m = n.slice(0));
      else if (w <= s)
        m = this.decodeTables[s - w];
      else
        throw new Error("Overwrite byte in " + this.encodingName + ", addr: " + p.toString(16));
    }
    return m;
  }, h.prototype._addDecodeChunk = function(p) {
    var _ = parseInt(p[0], 16), m = this._getDecodeTrieNode(_);
    _ = _ & 255;
    for (var g = 1; g < p.length; g++) {
      var w = p[g];
      if (typeof w == "string")
        for (var y = 0; y < w.length; ) {
          var E = w.charCodeAt(y++);
          if (E >= 55296 && E < 56320) {
            var S = w.charCodeAt(y++);
            if (S >= 56320 && S < 57344)
              m[_++] = 65536 + (E - 55296) * 1024 + (S - 56320);
            else
              throw new Error("Incorrect surrogate pair in " + this.encodingName + " at chunk " + p[0]);
          } else if (E > 4080 && E <= 4095) {
            for (var v = 4095 - E + 2, k = [], R = 0; R < v; R++)
              k.push(w.charCodeAt(y++));
            m[_++] = i - this.decodeTableSeq.length, this.decodeTableSeq.push(k);
          } else
            m[_++] = E;
        }
      else if (typeof w == "number")
        for (var O = m[_ - 1] + 1, y = 0; y < w; y++)
          m[_++] = O++;
      else
        throw new Error("Incorrect type '" + typeof w + "' given in " + this.encodingName + " at chunk " + p[0]);
    }
    if (_ > 255)
      throw new Error("Incorrect chunk in " + this.encodingName + " at addr " + p[0] + ": too long" + _);
  }, h.prototype._getEncodeBucket = function(p) {
    var _ = p >> 8;
    return this.encodeTable[_] === void 0 && (this.encodeTable[_] = n.slice(0)), this.encodeTable[_];
  }, h.prototype._setEncodeChar = function(p, _) {
    var m = this._getEncodeBucket(p), g = p & 255;
    m[g] <= i ? this.encodeTableSeq[i - m[g]][o] = _ : m[g] == t && (m[g] = _);
  }, h.prototype._setEncodeSequence = function(p, _) {
    var m = p[0], g = this._getEncodeBucket(m), w = m & 255, y;
    g[w] <= i ? y = this.encodeTableSeq[i - g[w]] : (y = {}, g[w] !== t && (y[o] = g[w]), g[w] = i - this.encodeTableSeq.length, this.encodeTableSeq.push(y));
    for (var E = 1; E < p.length - 1; E++) {
      var S = y[m];
      typeof S == "object" ? y = S : (y = y[m] = {}, S !== void 0 && (y[o] = S));
    }
    m = p[p.length - 1], y[m] = _;
  }, h.prototype._fillEncodeTable = function(p, _, m) {
    for (var g = this.decodeTables[p], w = !1, y = {}, E = 0; E < 256; E++) {
      var S = g[E], v = _ + E;
      if (!m[v])
        if (S >= 0)
          this._setEncodeChar(S, v), w = !0;
        else if (S <= s) {
          var k = s - S;
          if (!y[k]) {
            var R = v << 8 >>> 0;
            this._fillEncodeTable(k, R, m) ? w = !0 : y[k] = !0;
          }
        } else S <= i && (this._setEncodeSequence(this.decodeTableSeq[i - S], v), w = !0);
    }
    return w;
  };
  function l(p, _) {
    this.leadSurrogate = -1, this.seqObj = void 0, this.encodeTable = _.encodeTable, this.encodeTableSeq = _.encodeTableSeq, this.defaultCharSingleByte = _.defCharSB, this.gb18030 = _.gb18030;
  }
  l.prototype.write = function(p) {
    for (var _ = e.alloc(p.length * (this.gb18030 ? 4 : 3)), m = this.leadSurrogate, g = this.seqObj, w = -1, y = 0, E = 0; ; ) {
      if (w === -1) {
        if (y == p.length) break;
        var S = p.charCodeAt(y++);
      } else {
        var S = w;
        w = -1;
      }
      if (S >= 55296 && S < 57344)
        if (S < 56320)
          if (m === -1) {
            m = S;
            continue;
          } else
            m = S, S = t;
        else
          m !== -1 ? (S = 65536 + (m - 55296) * 1024 + (S - 56320), m = -1) : S = t;
      else m !== -1 && (w = S, S = t, m = -1);
      var v = t;
      if (g !== void 0 && S != t) {
        var k = g[S];
        if (typeof k == "object") {
          g = k;
          continue;
        } else typeof k == "number" ? v = k : k == null && (k = g[o], k !== void 0 && (v = k, w = S));
        g = void 0;
      } else if (S >= 0) {
        var R = this.encodeTable[S >> 8];
        if (R !== void 0 && (v = R[S & 255]), v <= i) {
          g = this.encodeTableSeq[i - v];
          continue;
        }
        if (v == t && this.gb18030) {
          var O = u(this.gb18030.uChars, S);
          if (O != -1) {
            var v = this.gb18030.gbChars[O] + (S - this.gb18030.uChars[O]);
            _[E++] = 129 + Math.floor(v / 12600), v = v % 12600, _[E++] = 48 + Math.floor(v / 1260), v = v % 1260, _[E++] = 129 + Math.floor(v / 10), v = v % 10, _[E++] = 48 + v;
            continue;
          }
        }
      }
      v === t && (v = this.defaultCharSingleByte), v < 256 ? _[E++] = v : v < 65536 ? (_[E++] = v >> 8, _[E++] = v & 255) : v < 16777216 ? (_[E++] = v >> 16, _[E++] = v >> 8 & 255, _[E++] = v & 255) : (_[E++] = v >>> 24, _[E++] = v >>> 16 & 255, _[E++] = v >>> 8 & 255, _[E++] = v & 255);
    }
    return this.seqObj = g, this.leadSurrogate = m, _.slice(0, E);
  }, l.prototype.end = function() {
    if (!(this.leadSurrogate === -1 && this.seqObj === void 0)) {
      var p = e.alloc(10), _ = 0;
      if (this.seqObj) {
        var m = this.seqObj[o];
        m !== void 0 && (m < 256 ? p[_++] = m : (p[_++] = m >> 8, p[_++] = m & 255)), this.seqObj = void 0;
      }
      return this.leadSurrogate !== -1 && (p[_++] = this.defaultCharSingleByte, this.leadSurrogate = -1), p.slice(0, _);
    }
  }, l.prototype.findIdx = u;
  function c(p, _) {
    this.nodeIdx = 0, this.prevBytes = [], this.decodeTables = _.decodeTables, this.decodeTableSeq = _.decodeTableSeq, this.defaultCharUnicode = _.defaultCharUnicode, this.gb18030 = _.gb18030;
  }
  c.prototype.write = function(p) {
    for (var _ = e.alloc(p.length * 2), m = this.nodeIdx, g = this.prevBytes, w = this.prevBytes.length, y = -this.prevBytes.length, E, S = 0, v = 0; S < p.length; S++) {
      var k = S >= 0 ? p[S] : g[S + w], E = this.decodeTables[m][k];
      if (!(E >= 0)) if (E === t)
        E = this.defaultCharUnicode.charCodeAt(0), S = y;
      else if (E === r) {
        if (S >= 3)
          var R = (p[S - 3] - 129) * 12600 + (p[S - 2] - 48) * 1260 + (p[S - 1] - 129) * 10 + (k - 48);
        else
          var R = (g[S - 3 + w] - 129) * 12600 + ((S - 2 >= 0 ? p[S - 2] : g[S - 2 + w]) - 48) * 1260 + ((S - 1 >= 0 ? p[S - 1] : g[S - 1 + w]) - 129) * 10 + (k - 48);
        var O = u(this.gb18030.gbChars, R);
        E = this.gb18030.uChars[O] + R - this.gb18030.gbChars[O];
      } else if (E <= s) {
        m = s - E;
        continue;
      } else if (E <= i) {
        for (var N = this.decodeTableSeq[i - E], W = 0; W < N.length - 1; W++)
          E = N[W], _[v++] = E & 255, _[v++] = E >> 8;
        E = N[N.length - 1];
      } else
        throw new Error("iconv-lite internal error: invalid decoding table value " + E + " at " + m + "/" + k);
      if (E >= 65536) {
        E -= 65536;
        var Z = 55296 | E >> 10;
        _[v++] = Z & 255, _[v++] = Z >> 8, E = 56320 | E & 1023;
      }
      _[v++] = E & 255, _[v++] = E >> 8, m = 0, y = S + 1;
    }
    return this.nodeIdx = m, this.prevBytes = y >= 0 ? Array.prototype.slice.call(p, y) : g.slice(y + w).concat(Array.prototype.slice.call(p)), _.slice(0, v).toString("ucs2");
  }, c.prototype.end = function() {
    for (var p = ""; this.prevBytes.length > 0; ) {
      p += this.defaultCharUnicode;
      var _ = this.prevBytes.slice(1);
      this.prevBytes = [], this.nodeIdx = 0, _.length > 0 && (p += this.write(_));
    }
    return this.prevBytes = [], this.nodeIdx = 0, p;
  };
  function u(p, _) {
    if (p[0] > _)
      return -1;
    for (var m = 0, g = p.length; m < g - 1; ) {
      var w = m + (g - m + 1 >> 1);
      p[w] <= _ ? m = w : g = w;
    }
    return m;
  }
  return Ds;
}
const Xp = [
  [
    "0",
    "\0",
    128
  ],
  [
    "a1",
    "｡",
    62
  ],
  [
    "8140",
    "　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈",
    9,
    "＋－±×"
  ],
  [
    "8180",
    "÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓"
  ],
  [
    "81b8",
    "∈∋⊆⊇⊂⊃∪∩"
  ],
  [
    "81c8",
    "∧∨￢⇒⇔∀∃"
  ],
  [
    "81da",
    "∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬"
  ],
  [
    "81f0",
    "Å‰♯♭♪†‡¶"
  ],
  [
    "81fc",
    "◯"
  ],
  [
    "824f",
    "０",
    9
  ],
  [
    "8260",
    "Ａ",
    25
  ],
  [
    "8281",
    "ａ",
    25
  ],
  [
    "829f",
    "ぁ",
    82
  ],
  [
    "8340",
    "ァ",
    62
  ],
  [
    "8380",
    "ム",
    22
  ],
  [
    "839f",
    "Α",
    16,
    "Σ",
    6
  ],
  [
    "83bf",
    "α",
    16,
    "σ",
    6
  ],
  [
    "8440",
    "А",
    5,
    "ЁЖ",
    25
  ],
  [
    "8470",
    "а",
    5,
    "ёж",
    7
  ],
  [
    "8480",
    "о",
    17
  ],
  [
    "849f",
    "─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂"
  ],
  [
    "8740",
    "①",
    19,
    "Ⅰ",
    9
  ],
  [
    "875f",
    "㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡"
  ],
  [
    "877e",
    "㍻"
  ],
  [
    "8780",
    "〝〟№㏍℡㊤",
    4,
    "㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪"
  ],
  [
    "889f",
    "亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭"
  ],
  [
    "8940",
    "院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円"
  ],
  [
    "8980",
    "園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改"
  ],
  [
    "8a40",
    "魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫"
  ],
  [
    "8a80",
    "橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄"
  ],
  [
    "8b40",
    "機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救"
  ],
  [
    "8b80",
    "朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈"
  ],
  [
    "8c40",
    "掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨"
  ],
  [
    "8c80",
    "劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向"
  ],
  [
    "8d40",
    "后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降"
  ],
  [
    "8d80",
    "項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷"
  ],
  [
    "8e40",
    "察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止"
  ],
  [
    "8e80",
    "死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周"
  ],
  [
    "8f40",
    "宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳"
  ],
  [
    "8f80",
    "準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾"
  ],
  [
    "9040",
    "拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨"
  ],
  [
    "9080",
    "逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線"
  ],
  [
    "9140",
    "繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻"
  ],
  [
    "9180",
    "操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只"
  ],
  [
    "9240",
    "叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄"
  ],
  [
    "9280",
    "逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓"
  ],
  [
    "9340",
    "邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬"
  ],
  [
    "9380",
    "凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入"
  ],
  [
    "9440",
    "如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅"
  ],
  [
    "9480",
    "楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美"
  ],
  [
    "9540",
    "鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷"
  ],
  [
    "9580",
    "斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋"
  ],
  [
    "9640",
    "法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆"
  ],
  [
    "9680",
    "摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒"
  ],
  [
    "9740",
    "諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲"
  ],
  [
    "9780",
    "沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯"
  ],
  [
    "9840",
    "蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕"
  ],
  [
    "989f",
    "弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲"
  ],
  [
    "9940",
    "僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭"
  ],
  [
    "9980",
    "凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨"
  ],
  [
    "9a40",
    "咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸"
  ],
  [
    "9a80",
    "噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩"
  ],
  [
    "9b40",
    "奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀"
  ],
  [
    "9b80",
    "它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏"
  ],
  [
    "9c40",
    "廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠"
  ],
  [
    "9c80",
    "怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛"
  ],
  [
    "9d40",
    "戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫"
  ],
  [
    "9d80",
    "捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼"
  ],
  [
    "9e40",
    "曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎"
  ],
  [
    "9e80",
    "梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣"
  ],
  [
    "9f40",
    "檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯"
  ],
  [
    "9f80",
    "麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌"
  ],
  [
    "e040",
    "漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝"
  ],
  [
    "e080",
    "烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱"
  ],
  [
    "e140",
    "瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿"
  ],
  [
    "e180",
    "痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬"
  ],
  [
    "e240",
    "磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰"
  ],
  [
    "e280",
    "窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆"
  ],
  [
    "e340",
    "紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷"
  ],
  [
    "e380",
    "縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋"
  ],
  [
    "e440",
    "隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤"
  ],
  [
    "e480",
    "艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈"
  ],
  [
    "e540",
    "蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬"
  ],
  [
    "e580",
    "蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞"
  ],
  [
    "e640",
    "襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧"
  ],
  [
    "e680",
    "諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊"
  ],
  [
    "e740",
    "蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜"
  ],
  [
    "e780",
    "轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮"
  ],
  [
    "e840",
    "錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙"
  ],
  [
    "e880",
    "閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰"
  ],
  [
    "e940",
    "顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃"
  ],
  [
    "e980",
    "騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈"
  ],
  [
    "ea40",
    "鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯"
  ],
  [
    "ea80",
    "黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠堯槇遙瑤凜熙"
  ],
  [
    "ed40",
    "纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏"
  ],
  [
    "ed80",
    "塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱"
  ],
  [
    "ee40",
    "犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙"
  ],
  [
    "ee80",
    "蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"
  ],
  [
    "eeef",
    "ⅰ",
    9,
    "￢￤＇＂"
  ],
  [
    "f040",
    "",
    62
  ],
  [
    "f080",
    "",
    124
  ],
  [
    "f140",
    "",
    62
  ],
  [
    "f180",
    "",
    124
  ],
  [
    "f240",
    "",
    62
  ],
  [
    "f280",
    "",
    124
  ],
  [
    "f340",
    "",
    62
  ],
  [
    "f380",
    "",
    124
  ],
  [
    "f440",
    "",
    62
  ],
  [
    "f480",
    "",
    124
  ],
  [
    "f540",
    "",
    62
  ],
  [
    "f580",
    "",
    124
  ],
  [
    "f640",
    "",
    62
  ],
  [
    "f680",
    "",
    124
  ],
  [
    "f740",
    "",
    62
  ],
  [
    "f780",
    "",
    124
  ],
  [
    "f840",
    "",
    62
  ],
  [
    "f880",
    "",
    124
  ],
  [
    "f940",
    ""
  ],
  [
    "fa40",
    "ⅰ",
    9,
    "Ⅰ",
    9,
    "￢￤＇＂㈱№℡∵纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊"
  ],
  [
    "fa80",
    "兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯"
  ],
  [
    "fb40",
    "涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神"
  ],
  [
    "fb80",
    "祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙"
  ],
  [
    "fc40",
    "髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"
  ]
], Jp = [
  [
    "0",
    "\0",
    127
  ],
  [
    "8ea1",
    "｡",
    62
  ],
  [
    "a1a1",
    "　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈",
    9,
    "＋－±×÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇"
  ],
  [
    "a2a1",
    "◆□■△▲▽▼※〒→←↑↓〓"
  ],
  [
    "a2ba",
    "∈∋⊆⊇⊂⊃∪∩"
  ],
  [
    "a2ca",
    "∧∨￢⇒⇔∀∃"
  ],
  [
    "a2dc",
    "∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬"
  ],
  [
    "a2f2",
    "Å‰♯♭♪†‡¶"
  ],
  [
    "a2fe",
    "◯"
  ],
  [
    "a3b0",
    "０",
    9
  ],
  [
    "a3c1",
    "Ａ",
    25
  ],
  [
    "a3e1",
    "ａ",
    25
  ],
  [
    "a4a1",
    "ぁ",
    82
  ],
  [
    "a5a1",
    "ァ",
    85
  ],
  [
    "a6a1",
    "Α",
    16,
    "Σ",
    6
  ],
  [
    "a6c1",
    "α",
    16,
    "σ",
    6
  ],
  [
    "a7a1",
    "А",
    5,
    "ЁЖ",
    25
  ],
  [
    "a7d1",
    "а",
    5,
    "ёж",
    25
  ],
  [
    "a8a1",
    "─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂"
  ],
  [
    "ada1",
    "①",
    19,
    "Ⅰ",
    9
  ],
  [
    "adc0",
    "㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡"
  ],
  [
    "addf",
    "㍻〝〟№㏍℡㊤",
    4,
    "㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪"
  ],
  [
    "b0a1",
    "亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭"
  ],
  [
    "b1a1",
    "院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応"
  ],
  [
    "b2a1",
    "押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改"
  ],
  [
    "b3a1",
    "魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱"
  ],
  [
    "b4a1",
    "粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄"
  ],
  [
    "b5a1",
    "機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京"
  ],
  [
    "b6a1",
    "供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈"
  ],
  [
    "b7a1",
    "掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲"
  ],
  [
    "b8a1",
    "検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向"
  ],
  [
    "b9a1",
    "后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込"
  ],
  [
    "baa1",
    "此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷"
  ],
  [
    "bba1",
    "察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時"
  ],
  [
    "bca1",
    "次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周"
  ],
  [
    "bda1",
    "宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償"
  ],
  [
    "bea1",
    "勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾"
  ],
  [
    "bfa1",
    "拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾"
  ],
  [
    "c0a1",
    "澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線"
  ],
  [
    "c1a1",
    "繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎"
  ],
  [
    "c2a1",
    "臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只"
  ],
  [
    "c3a1",
    "叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵"
  ],
  [
    "c4a1",
    "帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓"
  ],
  [
    "c5a1",
    "邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到"
  ],
  [
    "c6a1",
    "董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入"
  ],
  [
    "c7a1",
    "如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦"
  ],
  [
    "c8a1",
    "函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美"
  ],
  [
    "c9a1",
    "鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服"
  ],
  [
    "caa1",
    "福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋"
  ],
  [
    "cba1",
    "法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満"
  ],
  [
    "cca1",
    "漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒"
  ],
  [
    "cda1",
    "諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃"
  ],
  [
    "cea1",
    "痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯"
  ],
  [
    "cfa1",
    "蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕"
  ],
  [
    "d0a1",
    "弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲"
  ],
  [
    "d1a1",
    "僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨"
  ],
  [
    "d2a1",
    "辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨"
  ],
  [
    "d3a1",
    "咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉"
  ],
  [
    "d4a1",
    "圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩"
  ],
  [
    "d5a1",
    "奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓"
  ],
  [
    "d6a1",
    "屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏"
  ],
  [
    "d7a1",
    "廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚"
  ],
  [
    "d8a1",
    "悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛"
  ],
  [
    "d9a1",
    "戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼"
  ],
  [
    "daa1",
    "據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼"
  ],
  [
    "dba1",
    "曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍"
  ],
  [
    "dca1",
    "棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣"
  ],
  [
    "dda1",
    "檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾"
  ],
  [
    "dea1",
    "沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌"
  ],
  [
    "dfa1",
    "漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼"
  ],
  [
    "e0a1",
    "燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱"
  ],
  [
    "e1a1",
    "瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰"
  ],
  [
    "e2a1",
    "癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬"
  ],
  [
    "e3a1",
    "磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐"
  ],
  [
    "e4a1",
    "筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆"
  ],
  [
    "e5a1",
    "紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺"
  ],
  [
    "e6a1",
    "罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋"
  ],
  [
    "e7a1",
    "隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙"
  ],
  [
    "e8a1",
    "茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈"
  ],
  [
    "e9a1",
    "蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙"
  ],
  [
    "eaa1",
    "蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞"
  ],
  [
    "eba1",
    "襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫"
  ],
  [
    "eca1",
    "譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊"
  ],
  [
    "eda1",
    "蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸"
  ],
  [
    "eea1",
    "遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮"
  ],
  [
    "efa1",
    "錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞"
  ],
  [
    "f0a1",
    "陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰"
  ],
  [
    "f1a1",
    "顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷"
  ],
  [
    "f2a1",
    "髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈"
  ],
  [
    "f3a1",
    "鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠"
  ],
  [
    "f4a1",
    "堯槇遙瑤凜熙"
  ],
  [
    "f9a1",
    "纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德"
  ],
  [
    "faa1",
    "忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱"
  ],
  [
    "fba1",
    "犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚"
  ],
  [
    "fca1",
    "釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"
  ],
  [
    "fcf1",
    "ⅰ",
    9,
    "￢￤＇＂"
  ],
  [
    "8fa2af",
    "˘ˇ¸˙˝¯˛˚～΄΅"
  ],
  [
    "8fa2c2",
    "¡¦¿"
  ],
  [
    "8fa2eb",
    "ºª©®™¤№"
  ],
  [
    "8fa6e1",
    "ΆΈΉΊΪ"
  ],
  [
    "8fa6e7",
    "Ό"
  ],
  [
    "8fa6e9",
    "ΎΫ"
  ],
  [
    "8fa6ec",
    "Ώ"
  ],
  [
    "8fa6f1",
    "άέήίϊΐόςύϋΰώ"
  ],
  [
    "8fa7c2",
    "Ђ",
    10,
    "ЎЏ"
  ],
  [
    "8fa7f2",
    "ђ",
    10,
    "ўџ"
  ],
  [
    "8fa9a1",
    "ÆĐ"
  ],
  [
    "8fa9a4",
    "Ħ"
  ],
  [
    "8fa9a6",
    "Ĳ"
  ],
  [
    "8fa9a8",
    "ŁĿ"
  ],
  [
    "8fa9ab",
    "ŊØŒ"
  ],
  [
    "8fa9af",
    "ŦÞ"
  ],
  [
    "8fa9c1",
    "æđðħıĳĸłŀŉŋøœßŧþ"
  ],
  [
    "8faaa1",
    "ÁÀÄÂĂǍĀĄÅÃĆĈČÇĊĎÉÈËÊĚĖĒĘ"
  ],
  [
    "8faaba",
    "ĜĞĢĠĤÍÌÏÎǏİĪĮĨĴĶĹĽĻŃŇŅÑÓÒÖÔǑŐŌÕŔŘŖŚŜŠŞŤŢÚÙÜÛŬǓŰŪŲŮŨǗǛǙǕŴÝŸŶŹŽŻ"
  ],
  [
    "8faba1",
    "áàäâăǎāąåãćĉčçċďéèëêěėēęǵĝğ"
  ],
  [
    "8fabbd",
    "ġĥíìïîǐ"
  ],
  [
    "8fabc5",
    "īįĩĵķĺľļńňņñóòöôǒőōõŕřŗśŝšşťţúùüûŭǔűūųůũǘǜǚǖŵýÿŷźžż"
  ],
  [
    "8fb0a1",
    "丂丄丅丌丒丟丣两丨丫丮丯丰丵乀乁乄乇乑乚乜乣乨乩乴乵乹乿亍亖亗亝亯亹仃仐仚仛仠仡仢仨仯仱仳仵份仾仿伀伂伃伈伋伌伒伕伖众伙伮伱你伳伵伷伹伻伾佀佂佈佉佋佌佒佔佖佘佟佣佪佬佮佱佷佸佹佺佽佾侁侂侄"
  ],
  [
    "8fb1a1",
    "侅侉侊侌侎侐侒侓侔侗侙侚侞侟侲侷侹侻侼侽侾俀俁俅俆俈俉俋俌俍俏俒俜俠俢俰俲俼俽俿倀倁倄倇倊倌倎倐倓倗倘倛倜倝倞倢倧倮倰倲倳倵偀偁偂偅偆偊偌偎偑偒偓偗偙偟偠偢偣偦偧偪偭偰偱倻傁傃傄傆傊傎傏傐"
  ],
  [
    "8fb2a1",
    "傒傓傔傖傛傜傞",
    4,
    "傪傯傰傹傺傽僀僃僄僇僌僎僐僓僔僘僜僝僟僢僤僦僨僩僯僱僶僺僾儃儆儇儈儋儌儍儎僲儐儗儙儛儜儝儞儣儧儨儬儭儯儱儳儴儵儸儹兂兊兏兓兕兗兘兟兤兦兾冃冄冋冎冘冝冡冣冭冸冺冼冾冿凂"
  ],
  [
    "8fb3a1",
    "凈减凑凒凓凕凘凞凢凥凮凲凳凴凷刁刂刅划刓刕刖刘刢刨刱刲刵刼剅剉剕剗剘剚剜剟剠剡剦剮剷剸剹劀劂劅劊劌劓劕劖劗劘劚劜劤劥劦劧劯劰劶劷劸劺劻劽勀勄勆勈勌勏勑勔勖勛勜勡勥勨勩勪勬勰勱勴勶勷匀匃匊匋"
  ],
  [
    "8fb4a1",
    "匌匑匓匘匛匜匞匟匥匧匨匩匫匬匭匰匲匵匼匽匾卂卌卋卙卛卡卣卥卬卭卲卹卾厃厇厈厎厓厔厙厝厡厤厪厫厯厲厴厵厷厸厺厽叀叅叏叒叓叕叚叝叞叠另叧叵吂吓吚吡吧吨吪启吱吴吵呃呄呇呍呏呞呢呤呦呧呩呫呭呮呴呿"
  ],
  [
    "8fb5a1",
    "咁咃咅咈咉咍咑咕咖咜咟咡咦咧咩咪咭咮咱咷咹咺咻咿哆哊响哎哠哪哬哯哶哼哾哿唀唁唅唈唉唌唍唎唕唪唫唲唵唶唻唼唽啁啇啉啊啍啐啑啘啚啛啞啠啡啤啦啿喁喂喆喈喎喏喑喒喓喔喗喣喤喭喲喿嗁嗃嗆嗉嗋嗌嗎嗑嗒"
  ],
  [
    "8fb6a1",
    "嗓嗗嗘嗛嗞嗢嗩嗶嗿嘅嘈嘊嘍",
    5,
    "嘙嘬嘰嘳嘵嘷嘹嘻嘼嘽嘿噀噁噃噄噆噉噋噍噏噔噞噠噡噢噣噦噩噭噯噱噲噵嚄嚅嚈嚋嚌嚕嚙嚚嚝嚞嚟嚦嚧嚨嚩嚫嚬嚭嚱嚳嚷嚾囅囉囊囋囏囐囌囍囙囜囝囟囡囤",
    4,
    "囱囫园"
  ],
  [
    "8fb7a1",
    "囶囷圁圂圇圊圌圑圕圚圛圝圠圢圣圤圥圩圪圬圮圯圳圴圽圾圿坅坆坌坍坒坢坥坧坨坫坭",
    4,
    "坳坴坵坷坹坺坻坼坾垁垃垌垔垗垙垚垜垝垞垟垡垕垧垨垩垬垸垽埇埈埌埏埕埝埞埤埦埧埩埭埰埵埶埸埽埾埿堃堄堈堉埡"
  ],
  [
    "8fb8a1",
    "堌堍堛堞堟堠堦堧堭堲堹堿塉塌塍塏塐塕塟塡塤塧塨塸塼塿墀墁墇墈墉墊墌墍墏墐墔墖墝墠墡墢墦墩墱墲壄墼壂壈壍壎壐壒壔壖壚壝壡壢壩壳夅夆夋夌夒夓夔虁夝夡夣夤夨夯夰夳夵夶夿奃奆奒奓奙奛奝奞奟奡奣奫奭"
  ],
  [
    "8fb9a1",
    "奯奲奵奶她奻奼妋妌妎妒妕妗妟妤妧妭妮妯妰妳妷妺妼姁姃姄姈姊姍姒姝姞姟姣姤姧姮姯姱姲姴姷娀娄娌娍娎娒娓娞娣娤娧娨娪娭娰婄婅婇婈婌婐婕婞婣婥婧婭婷婺婻婾媋媐媓媖媙媜媞媟媠媢媧媬媱媲媳媵媸媺媻媿"
  ],
  [
    "8fbaa1",
    "嫄嫆嫈嫏嫚嫜嫠嫥嫪嫮嫵嫶嫽嬀嬁嬈嬗嬴嬙嬛嬝嬡嬥嬭嬸孁孋孌孒孖孞孨孮孯孼孽孾孿宁宄宆宊宎宐宑宓宔宖宨宩宬宭宯宱宲宷宺宼寀寁寍寏寖",
    4,
    "寠寯寱寴寽尌尗尞尟尣尦尩尫尬尮尰尲尵尶屙屚屜屢屣屧屨屩"
  ],
  [
    "8fbba1",
    "屭屰屴屵屺屻屼屽岇岈岊岏岒岝岟岠岢岣岦岪岲岴岵岺峉峋峒峝峗峮峱峲峴崁崆崍崒崫崣崤崦崧崱崴崹崽崿嵂嵃嵆嵈嵕嵑嵙嵊嵟嵠嵡嵢嵤嵪嵭嵰嵹嵺嵾嵿嶁嶃嶈嶊嶒嶓嶔嶕嶙嶛嶟嶠嶧嶫嶰嶴嶸嶹巃巇巋巐巎巘巙巠巤"
  ],
  [
    "8fbca1",
    "巩巸巹帀帇帍帒帔帕帘帟帠帮帨帲帵帾幋幐幉幑幖幘幛幜幞幨幪",
    4,
    "幰庀庋庎庢庤庥庨庪庬庱庳庽庾庿廆廌廋廎廑廒廔廕廜廞廥廫异弆弇弈弎弙弜弝弡弢弣弤弨弫弬弮弰弴弶弻弽弿彀彄彅彇彍彐彔彘彛彠彣彤彧"
  ],
  [
    "8fbda1",
    "彯彲彴彵彸彺彽彾徉徍徏徖徜徝徢徧徫徤徬徯徰徱徸忄忇忈忉忋忐",
    4,
    "忞忡忢忨忩忪忬忭忮忯忲忳忶忺忼怇怊怍怓怔怗怘怚怟怤怭怳怵恀恇恈恉恌恑恔恖恗恝恡恧恱恾恿悂悆悈悊悎悑悓悕悘悝悞悢悤悥您悰悱悷"
  ],
  [
    "8fbea1",
    "悻悾惂惄惈惉惊惋惎惏惔惕惙惛惝惞惢惥惲惵惸惼惽愂愇愊愌愐",
    4,
    "愖愗愙愜愞愢愪愫愰愱愵愶愷愹慁慅慆慉慞慠慬慲慸慻慼慿憀憁憃憄憋憍憒憓憗憘憜憝憟憠憥憨憪憭憸憹憼懀懁懂懎懏懕懜懝懞懟懡懢懧懩懥"
  ],
  [
    "8fbfa1",
    "懬懭懯戁戃戄戇戓戕戜戠戢戣戧戩戫戹戽扂扃扄扆扌扐扑扒扔扖扚扜扤扭扯扳扺扽抍抎抏抐抦抨抳抶抷抺抾抿拄拎拕拖拚拪拲拴拼拽挃挄挊挋挍挐挓挖挘挩挪挭挵挶挹挼捁捂捃捄捆捊捋捎捒捓捔捘捛捥捦捬捭捱捴捵"
  ],
  [
    "8fc0a1",
    "捸捼捽捿掂掄掇掊掐掔掕掙掚掞掤掦掭掮掯掽揁揅揈揎揑揓揔揕揜揠揥揪揬揲揳揵揸揹搉搊搐搒搔搘搞搠搢搤搥搩搪搯搰搵搽搿摋摏摑摒摓摔摚摛摜摝摟摠摡摣摭摳摴摻摽撅撇撏撐撑撘撙撛撝撟撡撣撦撨撬撳撽撾撿"
  ],
  [
    "8fc1a1",
    "擄擉擊擋擌擎擐擑擕擗擤擥擩擪擭擰擵擷擻擿攁攄攈攉攊攏攓攔攖攙攛攞攟攢攦攩攮攱攺攼攽敃敇敉敐敒敔敟敠敧敫敺敽斁斅斊斒斕斘斝斠斣斦斮斲斳斴斿旂旈旉旎旐旔旖旘旟旰旲旴旵旹旾旿昀昄昈昉昍昑昒昕昖昝"
  ],
  [
    "8fc2a1",
    "昞昡昢昣昤昦昩昪昫昬昮昰昱昳昹昷晀晅晆晊晌晑晎晗晘晙晛晜晠晡曻晪晫晬晾晳晵晿晷晸晹晻暀晼暋暌暍暐暒暙暚暛暜暟暠暤暭暱暲暵暻暿曀曂曃曈曌曎曏曔曛曟曨曫曬曮曺朅朇朎朓朙朜朠朢朳朾杅杇杈杌杔杕杝"
  ],
  [
    "8fc3a1",
    "杦杬杮杴杶杻极构枎枏枑枓枖枘枙枛枰枱枲枵枻枼枽柹柀柂柃柅柈柉柒柗柙柜柡柦柰柲柶柷桒栔栙栝栟栨栧栬栭栯栰栱栳栻栿桄桅桊桌桕桗桘桛桫桮",
    4,
    "桵桹桺桻桼梂梄梆梈梖梘梚梜梡梣梥梩梪梮梲梻棅棈棌棏"
  ],
  [
    "8fc4a1",
    "棐棑棓棖棙棜棝棥棨棪棫棬棭棰棱棵棶棻棼棽椆椉椊椐椑椓椖椗椱椳椵椸椻楂楅楉楎楗楛楣楤楥楦楨楩楬楰楱楲楺楻楿榀榍榒榖榘榡榥榦榨榫榭榯榷榸榺榼槅槈槑槖槗槢槥槮槯槱槳槵槾樀樁樃樏樑樕樚樝樠樤樨樰樲"
  ],
  [
    "8fc5a1",
    "樴樷樻樾樿橅橆橉橊橎橐橑橒橕橖橛橤橧橪橱橳橾檁檃檆檇檉檋檑檛檝檞檟檥檫檯檰檱檴檽檾檿櫆櫉櫈櫌櫐櫔櫕櫖櫜櫝櫤櫧櫬櫰櫱櫲櫼櫽欂欃欆欇欉欏欐欑欗欛欞欤欨欫欬欯欵欶欻欿歆歊歍歒歖歘歝歠歧歫歮歰歵歽"
  ],
  [
    "8fc6a1",
    "歾殂殅殗殛殟殠殢殣殨殩殬殭殮殰殸殹殽殾毃毄毉毌毖毚毡毣毦毧毮毱毷毹毿氂氄氅氉氍氎氐氒氙氟氦氧氨氬氮氳氵氶氺氻氿汊汋汍汏汒汔汙汛汜汫汭汯汴汶汸汹汻沅沆沇沉沔沕沗沘沜沟沰沲沴泂泆泍泏泐泑泒泔泖"
  ],
  [
    "8fc7a1",
    "泚泜泠泧泩泫泬泮泲泴洄洇洊洎洏洑洓洚洦洧洨汧洮洯洱洹洼洿浗浞浟浡浥浧浯浰浼涂涇涑涒涔涖涗涘涪涬涴涷涹涽涿淄淈淊淎淏淖淛淝淟淠淢淥淩淯淰淴淶淼渀渄渞渢渧渲渶渹渻渼湄湅湈湉湋湏湑湒湓湔湗湜湝湞"
  ],
  [
    "8fc8a1",
    "湢湣湨湳湻湽溍溓溙溠溧溭溮溱溳溻溿滀滁滃滇滈滊滍滎滏滫滭滮滹滻滽漄漈漊漌漍漖漘漚漛漦漩漪漯漰漳漶漻漼漭潏潑潒潓潗潙潚潝潞潡潢潨潬潽潾澃澇澈澋澌澍澐澒澓澔澖澚澟澠澥澦澧澨澮澯澰澵澶澼濅濇濈濊"
  ],
  [
    "8fc9a1",
    "濚濞濨濩濰濵濹濼濽瀀瀅瀆瀇瀍瀗瀠瀣瀯瀴瀷瀹瀼灃灄灈灉灊灋灔灕灝灞灎灤灥灬灮灵灶灾炁炅炆炔",
    4,
    "炛炤炫炰炱炴炷烊烑烓烔烕烖烘烜烤烺焃",
    4,
    "焋焌焏焞焠焫焭焯焰焱焸煁煅煆煇煊煋煐煒煗煚煜煞煠"
  ],
  [
    "8fcaa1",
    "煨煹熀熅熇熌熒熚熛熠熢熯熰熲熳熺熿燀燁燄燋燌燓燖燙燚燜燸燾爀爇爈爉爓爗爚爝爟爤爫爯爴爸爹牁牂牃牅牎牏牐牓牕牖牚牜牞牠牣牨牫牮牯牱牷牸牻牼牿犄犉犍犎犓犛犨犭犮犱犴犾狁狇狉狌狕狖狘狟狥狳狴狺狻"
  ],
  [
    "8fcba1",
    "狾猂猄猅猇猋猍猒猓猘猙猞猢猤猧猨猬猱猲猵猺猻猽獃獍獐獒獖獘獝獞獟獠獦獧獩獫獬獮獯獱獷獹獼玀玁玃玅玆玎玐玓玕玗玘玜玞玟玠玢玥玦玪玫玭玵玷玹玼玽玿珅珆珉珋珌珏珒珓珖珙珝珡珣珦珧珩珴珵珷珹珺珻珽"
  ],
  [
    "8fcca1",
    "珿琀琁琄琇琊琑琚琛琤琦琨",
    9,
    "琹瑀瑃瑄瑆瑇瑋瑍瑑瑒瑗瑝瑢瑦瑧瑨瑫瑭瑮瑱瑲璀璁璅璆璇璉璏璐璑璒璘璙璚璜璟璠璡璣璦璨璩璪璫璮璯璱璲璵璹璻璿瓈瓉瓌瓐瓓瓘瓚瓛瓞瓟瓤瓨瓪瓫瓯瓴瓺瓻瓼瓿甆"
  ],
  [
    "8fcda1",
    "甒甖甗甠甡甤甧甩甪甯甶甹甽甾甿畀畃畇畈畎畐畒畗畞畟畡畯畱畹",
    5,
    "疁疅疐疒疓疕疙疜疢疤疴疺疿痀痁痄痆痌痎痏痗痜痟痠痡痤痧痬痮痯痱痹瘀瘂瘃瘄瘇瘈瘊瘌瘏瘒瘓瘕瘖瘙瘛瘜瘝瘞瘣瘥瘦瘩瘭瘲瘳瘵瘸瘹"
  ],
  [
    "8fcea1",
    "瘺瘼癊癀癁癃癄癅癉癋癕癙癟癤癥癭癮癯癱癴皁皅皌皍皕皛皜皝皟皠皢",
    6,
    "皪皭皽盁盅盉盋盌盎盔盙盠盦盨盬盰盱盶盹盼眀眆眊眎眒眔眕眗眙眚眜眢眨眭眮眯眴眵眶眹眽眾睂睅睆睊睍睎睏睒睖睗睜睞睟睠睢"
  ],
  [
    "8fcfa1",
    "睤睧睪睬睰睲睳睴睺睽瞀瞄瞌瞍瞔瞕瞖瞚瞟瞢瞧瞪瞮瞯瞱瞵瞾矃矉矑矒矕矙矞矟矠矤矦矪矬矰矱矴矸矻砅砆砉砍砎砑砝砡砢砣砭砮砰砵砷硃硄硇硈硌硎硒硜硞硠硡硣硤硨硪确硺硾碊碏碔碘碡碝碞碟碤碨碬碭碰碱碲碳"
  ],
  [
    "8fd0a1",
    "碻碽碿磇磈磉磌磎磒磓磕磖磤磛磟磠磡磦磪磲磳礀磶磷磺磻磿礆礌礐礚礜礞礟礠礥礧礩礭礱礴礵礻礽礿祄祅祆祊祋祏祑祔祘祛祜祧祩祫祲祹祻祼祾禋禌禑禓禔禕禖禘禛禜禡禨禩禫禯禱禴禸离秂秄秇秈秊秏秔秖秚秝秞"
  ],
  [
    "8fd1a1",
    "秠秢秥秪秫秭秱秸秼稂稃稇稉稊稌稑稕稛稞稡稧稫稭稯稰稴稵稸稹稺穄穅穇穈穌穕穖穙穜穝穟穠穥穧穪穭穵穸穾窀窂窅窆窊窋窐窑窔窞窠窣窬窳窵窹窻窼竆竉竌竎竑竛竨竩竫竬竱竴竻竽竾笇笔笟笣笧笩笪笫笭笮笯笰"
  ],
  [
    "8fd2a1",
    "笱笴笽笿筀筁筇筎筕筠筤筦筩筪筭筯筲筳筷箄箉箎箐箑箖箛箞箠箥箬箯箰箲箵箶箺箻箼箽篂篅篈篊篔篖篗篙篚篛篨篪篲篴篵篸篹篺篼篾簁簂簃簄簆簉簋簌簎簏簙簛簠簥簦簨簬簱簳簴簶簹簺籆籊籕籑籒籓籙",
    5
  ],
  [
    "8fd3a1",
    "籡籣籧籩籭籮籰籲籹籼籽粆粇粏粔粞粠粦粰粶粷粺粻粼粿糄糇糈糉糍糏糓糔糕糗糙糚糝糦糩糫糵紃紇紈紉紏紑紒紓紖紝紞紣紦紪紭紱紼紽紾絀絁絇絈絍絑絓絗絙絚絜絝絥絧絪絰絸絺絻絿綁綂綃綅綆綈綋綌綍綑綖綗綝"
  ],
  [
    "8fd4a1",
    "綞綦綧綪綳綶綷綹緂",
    4,
    "緌緍緎緗緙縀緢緥緦緪緫緭緱緵緶緹緺縈縐縑縕縗縜縝縠縧縨縬縭縯縳縶縿繄繅繇繎繐繒繘繟繡繢繥繫繮繯繳繸繾纁纆纇纊纍纑纕纘纚纝纞缼缻缽缾缿罃罄罇罏罒罓罛罜罝罡罣罤罥罦罭"
  ],
  [
    "8fd5a1",
    "罱罽罾罿羀羋羍羏羐羑羖羗羜羡羢羦羪羭羴羼羿翀翃翈翎翏翛翟翣翥翨翬翮翯翲翺翽翾翿耇耈耊耍耎耏耑耓耔耖耝耞耟耠耤耦耬耮耰耴耵耷耹耺耼耾聀聄聠聤聦聭聱聵肁肈肎肜肞肦肧肫肸肹胈胍胏胒胔胕胗胘胠胭胮"
  ],
  [
    "8fd6a1",
    "胰胲胳胶胹胺胾脃脋脖脗脘脜脞脠脤脧脬脰脵脺脼腅腇腊腌腒腗腠腡腧腨腩腭腯腷膁膐膄膅膆膋膎膖膘膛膞膢膮膲膴膻臋臃臅臊臎臏臕臗臛臝臞臡臤臫臬臰臱臲臵臶臸臹臽臿舀舃舏舓舔舙舚舝舡舢舨舲舴舺艃艄艅艆"
  ],
  [
    "8fd7a1",
    "艋艎艏艑艖艜艠艣艧艭艴艻艽艿芀芁芃芄芇芉芊芎芑芔芖芘芚芛芠芡芣芤芧芨芩芪芮芰芲芴芷芺芼芾芿苆苐苕苚苠苢苤苨苪苭苯苶苷苽苾茀茁茇茈茊茋荔茛茝茞茟茡茢茬茭茮茰茳茷茺茼茽荂荃荄荇荍荎荑荕荖荗荰荸"
  ],
  [
    "8fd8a1",
    "荽荿莀莂莄莆莍莒莔莕莘莙莛莜莝莦莧莩莬莾莿菀菇菉菏菐菑菔菝荓菨菪菶菸菹菼萁萆萊萏萑萕萙莭萯萹葅葇葈葊葍葏葑葒葖葘葙葚葜葠葤葥葧葪葰葳葴葶葸葼葽蒁蒅蒒蒓蒕蒞蒦蒨蒩蒪蒯蒱蒴蒺蒽蒾蓀蓂蓇蓈蓌蓏蓓"
  ],
  [
    "8fd9a1",
    "蓜蓧蓪蓯蓰蓱蓲蓷蔲蓺蓻蓽蔂蔃蔇蔌蔎蔐蔜蔞蔢蔣蔤蔥蔧蔪蔫蔯蔳蔴蔶蔿蕆蕏",
    4,
    "蕖蕙蕜",
    6,
    "蕤蕫蕯蕹蕺蕻蕽蕿薁薅薆薉薋薌薏薓薘薝薟薠薢薥薧薴薶薷薸薼薽薾薿藂藇藊藋藎薭藘藚藟藠藦藨藭藳藶藼"
  ],
  [
    "8fdaa1",
    "藿蘀蘄蘅蘍蘎蘐蘑蘒蘘蘙蘛蘞蘡蘧蘩蘶蘸蘺蘼蘽虀虂虆虒虓虖虗虘虙虝虠",
    4,
    "虩虬虯虵虶虷虺蚍蚑蚖蚘蚚蚜蚡蚦蚧蚨蚭蚱蚳蚴蚵蚷蚸蚹蚿蛀蛁蛃蛅蛑蛒蛕蛗蛚蛜蛠蛣蛥蛧蚈蛺蛼蛽蜄蜅蜇蜋蜎蜏蜐蜓蜔蜙蜞蜟蜡蜣"
  ],
  [
    "8fdba1",
    "蜨蜮蜯蜱蜲蜹蜺蜼蜽蜾蝀蝃蝅蝍蝘蝝蝡蝤蝥蝯蝱蝲蝻螃",
    6,
    "螋螌螐螓螕螗螘螙螞螠螣螧螬螭螮螱螵螾螿蟁蟈蟉蟊蟎蟕蟖蟙蟚蟜蟟蟢蟣蟤蟪蟫蟭蟱蟳蟸蟺蟿蠁蠃蠆蠉蠊蠋蠐蠙蠒蠓蠔蠘蠚蠛蠜蠞蠟蠨蠭蠮蠰蠲蠵"
  ],
  [
    "8fdca1",
    "蠺蠼衁衃衅衈衉衊衋衎衑衕衖衘衚衜衟衠衤衩衱衹衻袀袘袚袛袜袟袠袨袪袺袽袾裀裊",
    4,
    "裑裒裓裛裞裧裯裰裱裵裷褁褆褍褎褏褕褖褘褙褚褜褠褦褧褨褰褱褲褵褹褺褾襀襂襅襆襉襏襒襗襚襛襜襡襢襣襫襮襰襳襵襺"
  ],
  [
    "8fdda1",
    "襻襼襽覉覍覐覔覕覛覜覟覠覥覰覴覵覶覷覼觔",
    4,
    "觥觩觫觭觱觳觶觹觽觿訄訅訇訏訑訒訔訕訞訠訢訤訦訫訬訯訵訷訽訾詀詃詅詇詉詍詎詓詖詗詘詜詝詡詥詧詵詶詷詹詺詻詾詿誀誃誆誋誏誐誒誖誗誙誟誧誩誮誯誳"
  ],
  [
    "8fdea1",
    "誶誷誻誾諃諆諈諉諊諑諓諔諕諗諝諟諬諰諴諵諶諼諿謅謆謋謑謜謞謟謊謭謰謷謼譂",
    4,
    "譈譒譓譔譙譍譞譣譭譶譸譹譼譾讁讄讅讋讍讏讔讕讜讞讟谸谹谽谾豅豇豉豋豏豑豓豔豗豘豛豝豙豣豤豦豨豩豭豳豵豶豻豾貆"
  ],
  [
    "8fdfa1",
    "貇貋貐貒貓貙貛貜貤貹貺賅賆賉賋賏賖賕賙賝賡賨賬賯賰賲賵賷賸賾賿贁贃贉贒贗贛赥赩赬赮赿趂趄趈趍趐趑趕趞趟趠趦趫趬趯趲趵趷趹趻跀跅跆跇跈跊跎跑跔跕跗跙跤跥跧跬跰趼跱跲跴跽踁踄踅踆踋踑踔踖踠踡踢"
  ],
  [
    "8fe0a1",
    "踣踦踧踱踳踶踷踸踹踽蹀蹁蹋蹍蹎蹏蹔蹛蹜蹝蹞蹡蹢蹩蹬蹭蹯蹰蹱蹹蹺蹻躂躃躉躐躒躕躚躛躝躞躢躧躩躭躮躳躵躺躻軀軁軃軄軇軏軑軔軜軨軮軰軱軷軹軺軭輀輂輇輈輏輐輖輗輘輞輠輡輣輥輧輨輬輭輮輴輵輶輷輺轀轁"
  ],
  [
    "8fe1a1",
    "轃轇轏轑",
    4,
    "轘轝轞轥辝辠辡辤辥辦辵辶辸达迀迁迆迊迋迍运迒迓迕迠迣迤迨迮迱迵迶迻迾适逄逈逌逘逛逨逩逯逪逬逭逳逴逷逿遃遄遌遛遝遢遦遧遬遰遴遹邅邈邋邌邎邐邕邗邘邙邛邠邡邢邥邰邲邳邴邶邽郌邾郃"
  ],
  [
    "8fe2a1",
    "郄郅郇郈郕郗郘郙郜郝郟郥郒郶郫郯郰郴郾郿鄀鄄鄅鄆鄈鄍鄐鄔鄖鄗鄘鄚鄜鄞鄠鄥鄢鄣鄧鄩鄮鄯鄱鄴鄶鄷鄹鄺鄼鄽酃酇酈酏酓酗酙酚酛酡酤酧酭酴酹酺酻醁醃醅醆醊醎醑醓醔醕醘醞醡醦醨醬醭醮醰醱醲醳醶醻醼醽醿"
  ],
  [
    "8fe3a1",
    "釂釃釅釓釔釗釙釚釞釤釥釩釪釬",
    5,
    "釷釹釻釽鈀鈁鈄鈅鈆鈇鈉鈊鈌鈐鈒鈓鈖鈘鈜鈝鈣鈤鈥鈦鈨鈮鈯鈰鈳鈵鈶鈸鈹鈺鈼鈾鉀鉂鉃鉆鉇鉊鉍鉎鉏鉑鉘鉙鉜鉝鉠鉡鉥鉧鉨鉩鉮鉯鉰鉵",
    4,
    "鉻鉼鉽鉿銈銉銊銍銎銒銗"
  ],
  [
    "8fe4a1",
    "銙銟銠銤銥銧銨銫銯銲銶銸銺銻銼銽銿",
    4,
    "鋅鋆鋇鋈鋋鋌鋍鋎鋐鋓鋕鋗鋘鋙鋜鋝鋟鋠鋡鋣鋥鋧鋨鋬鋮鋰鋹鋻鋿錀錂錈錍錑錔錕錜錝錞錟錡錤錥錧錩錪錳錴錶錷鍇鍈鍉鍐鍑鍒鍕鍗鍘鍚鍞鍤鍥鍧鍩鍪鍭鍯鍰鍱鍳鍴鍶"
  ],
  [
    "8fe5a1",
    "鍺鍽鍿鎀鎁鎂鎈鎊鎋鎍鎏鎒鎕鎘鎛鎞鎡鎣鎤鎦鎨鎫鎴鎵鎶鎺鎩鏁鏄鏅鏆鏇鏉",
    4,
    "鏓鏙鏜鏞鏟鏢鏦鏧鏹鏷鏸鏺鏻鏽鐁鐂鐄鐈鐉鐍鐎鐏鐕鐖鐗鐟鐮鐯鐱鐲鐳鐴鐻鐿鐽鑃鑅鑈鑊鑌鑕鑙鑜鑟鑡鑣鑨鑫鑭鑮鑯鑱鑲钄钃镸镹"
  ],
  [
    "8fe6a1",
    "镾閄閈閌閍閎閝閞閟閡閦閩閫閬閴閶閺閽閿闆闈闉闋闐闑闒闓闙闚闝闞闟闠闤闦阝阞阢阤阥阦阬阱阳阷阸阹阺阼阽陁陒陔陖陗陘陡陮陴陻陼陾陿隁隂隃隄隉隑隖隚隝隟隤隥隦隩隮隯隳隺雊雒嶲雘雚雝雞雟雩雯雱雺霂"
  ],
  [
    "8fe7a1",
    "霃霅霉霚霛霝霡霢霣霨霱霳靁靃靊靎靏靕靗靘靚靛靣靧靪靮靳靶靷靸靻靽靿鞀鞉鞕鞖鞗鞙鞚鞞鞟鞢鞬鞮鞱鞲鞵鞶鞸鞹鞺鞼鞾鞿韁韄韅韇韉韊韌韍韎韐韑韔韗韘韙韝韞韠韛韡韤韯韱韴韷韸韺頇頊頙頍頎頔頖頜頞頠頣頦"
  ],
  [
    "8fe8a1",
    "頫頮頯頰頲頳頵頥頾顄顇顊顑顒顓顖顗顙顚顢顣顥顦顪顬颫颭颮颰颴颷颸颺颻颿飂飅飈飌飡飣飥飦飧飪飳飶餂餇餈餑餕餖餗餚餛餜餟餢餦餧餫餱",
    4,
    "餹餺餻餼饀饁饆饇饈饍饎饔饘饙饛饜饞饟饠馛馝馟馦馰馱馲馵"
  ],
  [
    "8fe9a1",
    "馹馺馽馿駃駉駓駔駙駚駜駞駧駪駫駬駰駴駵駹駽駾騂騃騄騋騌騐騑騖騞騠騢騣騤騧騭騮騳騵騶騸驇驁驄驊驋驌驎驑驔驖驝骪骬骮骯骲骴骵骶骹骻骾骿髁髃髆髈髎髐髒髕髖髗髛髜髠髤髥髧髩髬髲髳髵髹髺髽髿",
    4
  ],
  [
    "8feaa1",
    "鬄鬅鬈鬉鬋鬌鬍鬎鬐鬒鬖鬙鬛鬜鬠鬦鬫鬭鬳鬴鬵鬷鬹鬺鬽魈魋魌魕魖魗魛魞魡魣魥魦魨魪",
    4,
    "魳魵魷魸魹魿鮀鮄鮅鮆鮇鮉鮊鮋鮍鮏鮐鮔鮚鮝鮞鮦鮧鮩鮬鮰鮱鮲鮷鮸鮻鮼鮾鮿鯁鯇鯈鯎鯐鯗鯘鯝鯟鯥鯧鯪鯫鯯鯳鯷鯸"
  ],
  [
    "8feba1",
    "鯹鯺鯽鯿鰀鰂鰋鰏鰑鰖鰘鰙鰚鰜鰞鰢鰣鰦",
    4,
    "鰱鰵鰶鰷鰽鱁鱃鱄鱅鱉鱊鱎鱏鱐鱓鱔鱖鱘鱛鱝鱞鱟鱣鱩鱪鱜鱫鱨鱮鱰鱲鱵鱷鱻鳦鳲鳷鳹鴋鴂鴑鴗鴘鴜鴝鴞鴯鴰鴲鴳鴴鴺鴼鵅鴽鵂鵃鵇鵊鵓鵔鵟鵣鵢鵥鵩鵪鵫鵰鵶鵷鵻"
  ],
  [
    "8feca1",
    "鵼鵾鶃鶄鶆鶊鶍鶎鶒鶓鶕鶖鶗鶘鶡鶪鶬鶮鶱鶵鶹鶼鶿鷃鷇鷉鷊鷔鷕鷖鷗鷚鷞鷟鷠鷥鷧鷩鷫鷮鷰鷳鷴鷾鸊鸂鸇鸎鸐鸑鸒鸕鸖鸙鸜鸝鹺鹻鹼麀麂麃麄麅麇麎麏麖麘麛麞麤麨麬麮麯麰麳麴麵黆黈黋黕黟黤黧黬黭黮黰黱黲黵"
  ],
  [
    "8feda1",
    "黸黿鼂鼃鼉鼏鼐鼑鼒鼔鼖鼗鼙鼚鼛鼟鼢鼦鼪鼫鼯鼱鼲鼴鼷鼹鼺鼼鼽鼿齁齃",
    4,
    "齓齕齖齗齘齚齝齞齨齩齭",
    4,
    "齳齵齺齽龏龐龑龒龔龖龗龞龡龢龣龥"
  ]
], Ts = [
  [
    "0",
    "\0",
    127,
    "€"
  ],
  [
    "8140",
    "丂丄丅丆丏丒丗丟丠両丣並丩丮丯丱丳丵丷丼乀乁乂乄乆乊乑乕乗乚乛乢乣乤乥乧乨乪",
    5,
    "乲乴",
    9,
    "乿",
    6,
    "亇亊"
  ],
  [
    "8180",
    "亐亖亗亙亜亝亞亣亪亯亰亱亴亶亷亸亹亼亽亾仈仌仏仐仒仚仛仜仠仢仦仧仩仭仮仯仱仴仸仹仺仼仾伀伂",
    6,
    "伋伌伒",
    4,
    "伜伝伡伣伨伩伬伭伮伱伳伵伷伹伻伾",
    4,
    "佄佅佇",
    5,
    "佒佔佖佡佢佦佨佪佫佭佮佱佲併佷佸佹佺佽侀侁侂侅來侇侊侌侎侐侒侓侕侖侘侙侚侜侞侟価侢"
  ],
  [
    "8240",
    "侤侫侭侰",
    4,
    "侶",
    8,
    "俀俁係俆俇俈俉俋俌俍俒",
    4,
    "俙俛俠俢俤俥俧俫俬俰俲俴俵俶俷俹俻俼俽俿",
    11
  ],
  [
    "8280",
    "個倎倐們倓倕倖倗倛倝倞倠倢倣値倧倫倯",
    10,
    "倻倽倿偀偁偂偄偅偆偉偊偋偍偐",
    4,
    "偖偗偘偙偛偝",
    7,
    "偦",
    5,
    "偭",
    8,
    "偸偹偺偼偽傁傂傃傄傆傇傉傊傋傌傎",
    20,
    "傤傦傪傫傭",
    4,
    "傳",
    6,
    "傼"
  ],
  [
    "8340",
    "傽",
    17,
    "僐",
    5,
    "僗僘僙僛",
    10,
    "僨僩僪僫僯僰僱僲僴僶",
    4,
    "僼",
    9,
    "儈"
  ],
  [
    "8380",
    "儉儊儌",
    5,
    "儓",
    13,
    "儢",
    28,
    "兂兇兊兌兎兏児兒兓兗兘兙兛兝",
    4,
    "兣兤兦內兩兪兯兲兺兾兿冃冄円冇冊冋冎冏冐冑冓冔冘冚冝冞冟冡冣冦",
    4,
    "冭冮冴冸冹冺冾冿凁凂凃凅凈凊凍凎凐凒",
    5
  ],
  [
    "8440",
    "凘凙凚凜凞凟凢凣凥",
    5,
    "凬凮凱凲凴凷凾刄刅刉刋刌刏刐刓刔刕刜刞刟刡刢刣別刦刧刪刬刯刱刲刴刵刼刾剄",
    5,
    "剋剎剏剒剓剕剗剘"
  ],
  [
    "8480",
    "剙剚剛剝剟剠剢剣剤剦剨剫剬剭剮剰剱剳",
    9,
    "剾劀劃",
    4,
    "劉",
    6,
    "劑劒劔",
    6,
    "劜劤劥劦劧劮劯劰労",
    9,
    "勀勁勂勄勅勆勈勊勌勍勎勏勑勓勔動勗務",
    5,
    "勠勡勢勣勥",
    10,
    "勱",
    7,
    "勻勼勽匁匂匃匄匇匉匊匋匌匎"
  ],
  [
    "8540",
    "匑匒匓匔匘匛匜匞匟匢匤匥匧匨匩匫匬匭匯",
    9,
    "匼匽區卂卄卆卋卌卍卐協単卙卛卝卥卨卪卬卭卲卶卹卻卼卽卾厀厁厃厇厈厊厎厏"
  ],
  [
    "8580",
    "厐",
    4,
    "厖厗厙厛厜厞厠厡厤厧厪厫厬厭厯",
    6,
    "厷厸厹厺厼厽厾叀參",
    4,
    "収叏叐叒叓叕叚叜叝叞叡叢叧叴叺叾叿吀吂吅吇吋吔吘吙吚吜吢吤吥吪吰吳吶吷吺吽吿呁呂呄呅呇呉呌呍呎呏呑呚呝",
    4,
    "呣呥呧呩",
    7,
    "呴呹呺呾呿咁咃咅咇咈咉咊咍咑咓咗咘咜咞咟咠咡"
  ],
  [
    "8640",
    "咢咥咮咰咲咵咶咷咹咺咼咾哃哅哊哋哖哘哛哠",
    4,
    "哫哬哯哰哱哴",
    5,
    "哻哾唀唂唃唄唅唈唊",
    4,
    "唒唓唕",
    5,
    "唜唝唞唟唡唥唦"
  ],
  [
    "8680",
    "唨唩唫唭唲唴唵唶唸唹唺唻唽啀啂啅啇啈啋",
    4,
    "啑啒啓啔啗",
    4,
    "啝啞啟啠啢啣啨啩啫啯",
    5,
    "啹啺啽啿喅喆喌喍喎喐喒喓喕喖喗喚喛喞喠",
    6,
    "喨",
    8,
    "喲喴営喸喺喼喿",
    4,
    "嗆嗇嗈嗊嗋嗎嗏嗐嗕嗗",
    4,
    "嗞嗠嗢嗧嗩嗭嗮嗰嗱嗴嗶嗸",
    4,
    "嗿嘂嘃嘄嘅"
  ],
  [
    "8740",
    "嘆嘇嘊嘋嘍嘐",
    7,
    "嘙嘚嘜嘝嘠嘡嘢嘥嘦嘨嘩嘪嘫嘮嘯嘰嘳嘵嘷嘸嘺嘼嘽嘾噀",
    11,
    "噏",
    4,
    "噕噖噚噛噝",
    4
  ],
  [
    "8780",
    "噣噥噦噧噭噮噯噰噲噳噴噵噷噸噹噺噽",
    7,
    "嚇",
    6,
    "嚐嚑嚒嚔",
    14,
    "嚤",
    10,
    "嚰",
    6,
    "嚸嚹嚺嚻嚽",
    12,
    "囋",
    8,
    "囕囖囘囙囜団囥",
    5,
    "囬囮囯囲図囶囷囸囻囼圀圁圂圅圇國",
    6
  ],
  [
    "8840",
    "園",
    9,
    "圝圞圠圡圢圤圥圦圧圫圱圲圴",
    4,
    "圼圽圿坁坃坄坅坆坈坉坋坒",
    4,
    "坘坙坢坣坥坧坬坮坰坱坲坴坵坸坹坺坽坾坿垀"
  ],
  [
    "8880",
    "垁垇垈垉垊垍",
    4,
    "垔",
    6,
    "垜垝垞垟垥垨垪垬垯垰垱垳垵垶垷垹",
    8,
    "埄",
    6,
    "埌埍埐埑埓埖埗埛埜埞埡埢埣埥",
    7,
    "埮埰埱埲埳埵埶執埻埼埾埿堁堃堄堅堈堉堊堌堎堏堐堒堓堔堖堗堘堚堛堜堝堟堢堣堥",
    4,
    "堫",
    4,
    "報堲堳場堶",
    7
  ],
  [
    "8940",
    "堾",
    5,
    "塅",
    6,
    "塎塏塐塒塓塕塖塗塙",
    4,
    "塟",
    5,
    "塦",
    4,
    "塭",
    16,
    "塿墂墄墆墇墈墊墋墌"
  ],
  [
    "8980",
    "墍",
    4,
    "墔",
    4,
    "墛墜墝墠",
    7,
    "墪",
    17,
    "墽墾墿壀壂壃壄壆",
    10,
    "壒壓壔壖",
    13,
    "壥",
    5,
    "壭壯壱売壴壵壷壸壺",
    7,
    "夃夅夆夈",
    4,
    "夎夐夑夒夓夗夘夛夝夞夠夡夢夣夦夨夬夰夲夳夵夶夻"
  ],
  [
    "8a40",
    "夽夾夿奀奃奅奆奊奌奍奐奒奓奙奛",
    4,
    "奡奣奤奦",
    12,
    "奵奷奺奻奼奾奿妀妅妉妋妌妎妏妐妑妔妕妘妚妛妜妝妟妠妡妢妦"
  ],
  [
    "8a80",
    "妧妬妭妰妱妳",
    5,
    "妺妼妽妿",
    6,
    "姇姈姉姌姍姎姏姕姖姙姛姞",
    4,
    "姤姦姧姩姪姫姭",
    11,
    "姺姼姽姾娀娂娊娋娍娎娏娐娒娔娕娖娗娙娚娛娝娞娡娢娤娦娧娨娪",
    6,
    "娳娵娷",
    4,
    "娽娾娿婁",
    4,
    "婇婈婋",
    9,
    "婖婗婘婙婛",
    5
  ],
  [
    "8b40",
    "婡婣婤婥婦婨婩婫",
    8,
    "婸婹婻婼婽婾媀",
    17,
    "媓",
    6,
    "媜",
    13,
    "媫媬"
  ],
  [
    "8b80",
    "媭",
    4,
    "媴媶媷媹",
    4,
    "媿嫀嫃",
    5,
    "嫊嫋嫍",
    4,
    "嫓嫕嫗嫙嫚嫛嫝嫞嫟嫢嫤嫥嫧嫨嫪嫬",
    4,
    "嫲",
    22,
    "嬊",
    11,
    "嬘",
    25,
    "嬳嬵嬶嬸",
    7,
    "孁",
    6
  ],
  [
    "8c40",
    "孈",
    7,
    "孒孖孞孠孡孧孨孫孭孮孯孲孴孶孷學孹孻孼孾孿宂宆宊宍宎宐宑宒宔宖実宧宨宩宬宭宮宯宱宲宷宺宻宼寀寁寃寈寉寊寋寍寎寏"
  ],
  [
    "8c80",
    "寑寔",
    8,
    "寠寢寣實寧審",
    4,
    "寯寱",
    6,
    "寽対尀専尃尅將專尋尌對導尐尒尓尗尙尛尞尟尠尡尣尦尨尩尪尫尭尮尯尰尲尳尵尶尷屃屄屆屇屌屍屒屓屔屖屗屘屚屛屜屝屟屢層屧",
    6,
    "屰屲",
    6,
    "屻屼屽屾岀岃",
    4,
    "岉岊岋岎岏岒岓岕岝",
    4,
    "岤",
    4
  ],
  [
    "8d40",
    "岪岮岯岰岲岴岶岹岺岻岼岾峀峂峃峅",
    5,
    "峌",
    5,
    "峓",
    5,
    "峚",
    6,
    "峢峣峧峩峫峬峮峯峱",
    9,
    "峼",
    4
  ],
  [
    "8d80",
    "崁崄崅崈",
    5,
    "崏",
    4,
    "崕崗崘崙崚崜崝崟",
    4,
    "崥崨崪崫崬崯",
    4,
    "崵",
    7,
    "崿",
    7,
    "嵈嵉嵍",
    10,
    "嵙嵚嵜嵞",
    10,
    "嵪嵭嵮嵰嵱嵲嵳嵵",
    12,
    "嶃",
    21,
    "嶚嶛嶜嶞嶟嶠"
  ],
  [
    "8e40",
    "嶡",
    21,
    "嶸",
    12,
    "巆",
    6,
    "巎",
    12,
    "巜巟巠巣巤巪巬巭"
  ],
  [
    "8e80",
    "巰巵巶巸",
    4,
    "巿帀帄帇帉帊帋帍帎帒帓帗帞",
    7,
    "帨",
    4,
    "帯帰帲",
    4,
    "帹帺帾帿幀幁幃幆",
    5,
    "幍",
    6,
    "幖",
    4,
    "幜幝幟幠幣",
    14,
    "幵幷幹幾庁庂広庅庈庉庌庍庎庒庘庛庝庡庢庣庤庨",
    4,
    "庮",
    4,
    "庴庺庻庼庽庿",
    6
  ],
  [
    "8f40",
    "廆廇廈廋",
    5,
    "廔廕廗廘廙廚廜",
    11,
    "廩廫",
    8,
    "廵廸廹廻廼廽弅弆弇弉弌弍弎弐弒弔弖弙弚弜弝弞弡弢弣弤"
  ],
  [
    "8f80",
    "弨弫弬弮弰弲",
    6,
    "弻弽弾弿彁",
    14,
    "彑彔彙彚彛彜彞彟彠彣彥彧彨彫彮彯彲彴彵彶彸彺彽彾彿徃徆徍徎徏徑従徔徖徚徛徝從徟徠徢",
    5,
    "復徫徬徯",
    5,
    "徶徸徹徺徻徾",
    4,
    "忇忈忊忋忎忓忔忕忚忛応忞忟忢忣忥忦忨忩忬忯忰忲忳忴忶忷忹忺忼怇"
  ],
  [
    "9040",
    "怈怉怋怌怐怑怓怗怘怚怞怟怢怣怤怬怭怮怰",
    4,
    "怶",
    4,
    "怽怾恀恄",
    6,
    "恌恎恏恑恓恔恖恗恘恛恜恞恟恠恡恥恦恮恱恲恴恵恷恾悀"
  ],
  [
    "9080",
    "悁悂悅悆悇悈悊悋悎悏悐悑悓悕悗悘悙悜悞悡悢悤悥悧悩悪悮悰悳悵悶悷悹悺悽",
    7,
    "惇惈惉惌",
    4,
    "惒惓惔惖惗惙惛惞惡",
    4,
    "惪惱惲惵惷惸惻",
    4,
    "愂愃愄愅愇愊愋愌愐",
    4,
    "愖愗愘愙愛愜愝愞愡愢愥愨愩愪愬",
    18,
    "慀",
    6
  ],
  [
    "9140",
    "慇慉態慍慏慐慒慓慔慖",
    6,
    "慞慟慠慡慣慤慥慦慩",
    6,
    "慱慲慳慴慶慸",
    18,
    "憌憍憏",
    4,
    "憕"
  ],
  [
    "9180",
    "憖",
    6,
    "憞",
    8,
    "憪憫憭",
    9,
    "憸",
    5,
    "憿懀懁懃",
    4,
    "應懌",
    4,
    "懓懕",
    16,
    "懧",
    13,
    "懶",
    8,
    "戀",
    5,
    "戇戉戓戔戙戜戝戞戠戣戦戧戨戩戫戭戯戰戱戲戵戶戸",
    4,
    "扂扄扅扆扊"
  ],
  [
    "9240",
    "扏扐払扖扗扙扚扜",
    6,
    "扤扥扨扱扲扴扵扷扸扺扻扽抁抂抃抅抆抇抈抋",
    5,
    "抔抙抜抝択抣抦抧抩抪抭抮抯抰抲抳抴抶抷抸抺抾拀拁"
  ],
  [
    "9280",
    "拃拋拏拑拕拝拞拠拡拤拪拫拰拲拵拸拹拺拻挀挃挄挅挆挊挋挌挍挏挐挒挓挔挕挗挘挙挜挦挧挩挬挭挮挰挱挳",
    5,
    "挻挼挾挿捀捁捄捇捈捊捑捒捓捔捖",
    7,
    "捠捤捥捦捨捪捫捬捯捰捲捳捴捵捸捹捼捽捾捿掁掃掄掅掆掋掍掑掓掔掕掗掙",
    6,
    "採掤掦掫掯掱掲掵掶掹掻掽掿揀"
  ],
  [
    "9340",
    "揁揂揃揅揇揈揊揋揌揑揓揔揕揗",
    6,
    "揟揢揤",
    4,
    "揫揬揮揯揰揱揳揵揷揹揺揻揼揾搃搄搆",
    4,
    "損搎搑搒搕",
    5,
    "搝搟搢搣搤"
  ],
  [
    "9380",
    "搥搧搨搩搫搮",
    5,
    "搵",
    4,
    "搻搼搾摀摂摃摉摋",
    6,
    "摓摕摖摗摙",
    4,
    "摟",
    7,
    "摨摪摫摬摮",
    9,
    "摻",
    6,
    "撃撆撈",
    8,
    "撓撔撗撘撚撛撜撝撟",
    4,
    "撥撦撧撨撪撫撯撱撲撳撴撶撹撻撽撾撿擁擃擄擆",
    6,
    "擏擑擓擔擕擖擙據"
  ],
  [
    "9440",
    "擛擜擝擟擠擡擣擥擧",
    24,
    "攁",
    7,
    "攊",
    7,
    "攓",
    4,
    "攙",
    8
  ],
  [
    "9480",
    "攢攣攤攦",
    4,
    "攬攭攰攱攲攳攷攺攼攽敀",
    4,
    "敆敇敊敋敍敎敐敒敓敔敗敘敚敜敟敠敡敤敥敧敨敩敪敭敮敯敱敳敵敶數",
    14,
    "斈斉斊斍斎斏斒斔斕斖斘斚斝斞斠斢斣斦斨斪斬斮斱",
    7,
    "斺斻斾斿旀旂旇旈旉旊旍旐旑旓旔旕旘",
    7,
    "旡旣旤旪旫"
  ],
  [
    "9540",
    "旲旳旴旵旸旹旻",
    4,
    "昁昄昅昇昈昉昋昍昐昑昒昖昗昘昚昛昜昞昡昢昣昤昦昩昪昫昬昮昰昲昳昷",
    4,
    "昽昿晀時晄",
    6,
    "晍晎晐晑晘"
  ],
  [
    "9580",
    "晙晛晜晝晞晠晢晣晥晧晩",
    4,
    "晱晲晳晵晸晹晻晼晽晿暀暁暃暅暆暈暉暊暋暍暎暏暐暒暓暔暕暘",
    4,
    "暞",
    8,
    "暩",
    4,
    "暯",
    4,
    "暵暶暷暸暺暻暼暽暿",
    25,
    "曚曞",
    7,
    "曧曨曪",
    5,
    "曱曵曶書曺曻曽朁朂會"
  ],
  [
    "9640",
    "朄朅朆朇朌朎朏朑朒朓朖朘朙朚朜朞朠",
    5,
    "朧朩朮朰朲朳朶朷朸朹朻朼朾朿杁杄杅杇杊杋杍杒杔杕杗",
    4,
    "杝杢杣杤杦杧杫杬杮東杴杶"
  ],
  [
    "9680",
    "杸杹杺杻杽枀枂枃枅枆枈枊枌枍枎枏枑枒枓枔枖枙枛枟枠枡枤枦枩枬枮枱枲枴枹",
    7,
    "柂柅",
    9,
    "柕柖柗柛柟柡柣柤柦柧柨柪柫柭柮柲柵",
    7,
    "柾栁栂栃栄栆栍栐栒栔栕栘",
    4,
    "栞栟栠栢",
    6,
    "栫",
    6,
    "栴栵栶栺栻栿桇桋桍桏桒桖",
    5
  ],
  [
    "9740",
    "桜桝桞桟桪桬",
    7,
    "桵桸",
    8,
    "梂梄梇",
    7,
    "梐梑梒梔梕梖梘",
    9,
    "梣梤梥梩梪梫梬梮梱梲梴梶梷梸"
  ],
  [
    "9780",
    "梹",
    6,
    "棁棃",
    5,
    "棊棌棎棏棐棑棓棔棖棗棙棛",
    4,
    "棡棢棤",
    9,
    "棯棲棳棴棶棷棸棻棽棾棿椀椂椃椄椆",
    4,
    "椌椏椑椓",
    11,
    "椡椢椣椥",
    7,
    "椮椯椱椲椳椵椶椷椸椺椻椼椾楀楁楃",
    16,
    "楕楖楘楙楛楜楟"
  ],
  [
    "9840",
    "楡楢楤楥楧楨楩楪楬業楯楰楲",
    4,
    "楺楻楽楾楿榁榃榅榊榋榌榎",
    5,
    "榖榗榙榚榝",
    9,
    "榩榪榬榮榯榰榲榳榵榶榸榹榺榼榽"
  ],
  [
    "9880",
    "榾榿槀槂",
    7,
    "構槍槏槑槒槓槕",
    5,
    "槜槝槞槡",
    11,
    "槮槯槰槱槳",
    9,
    "槾樀",
    9,
    "樋",
    11,
    "標",
    5,
    "樠樢",
    5,
    "権樫樬樭樮樰樲樳樴樶",
    6,
    "樿",
    4,
    "橅橆橈",
    7,
    "橑",
    6,
    "橚"
  ],
  [
    "9940",
    "橜",
    4,
    "橢橣橤橦",
    10,
    "橲",
    6,
    "橺橻橽橾橿檁檂檃檅",
    8,
    "檏檒",
    4,
    "檘",
    7,
    "檡",
    5
  ],
  [
    "9980",
    "檧檨檪檭",
    114,
    "欥欦欨",
    6
  ],
  [
    "9a40",
    "欯欰欱欳欴欵欶欸欻欼欽欿歀歁歂歄歅歈歊歋歍",
    11,
    "歚",
    7,
    "歨歩歫",
    13,
    "歺歽歾歿殀殅殈"
  ],
  [
    "9a80",
    "殌殎殏殐殑殔殕殗殘殙殜",
    4,
    "殢",
    7,
    "殫",
    7,
    "殶殸",
    6,
    "毀毃毄毆",
    4,
    "毌毎毐毑毘毚毜",
    4,
    "毢",
    7,
    "毬毭毮毰毱毲毴毶毷毸毺毻毼毾",
    6,
    "氈",
    4,
    "氎氒気氜氝氞氠氣氥氫氬氭氱氳氶氷氹氺氻氼氾氿汃汄汅汈汋",
    4,
    "汑汒汓汖汘"
  ],
  [
    "9b40",
    "汙汚汢汣汥汦汧汫",
    4,
    "汱汳汵汷汸決汻汼汿沀沄沇沊沋沍沎沑沒沕沖沗沘沚沜沝沞沠沢沨沬沯沰沴沵沶沷沺泀況泂泃泆泇泈泋泍泎泏泑泒泘"
  ],
  [
    "9b80",
    "泙泚泜泝泟泤泦泧泩泬泭泲泴泹泿洀洂洃洅洆洈洉洊洍洏洐洑洓洔洕洖洘洜洝洟",
    5,
    "洦洨洩洬洭洯洰洴洶洷洸洺洿浀浂浄浉浌浐浕浖浗浘浛浝浟浡浢浤浥浧浨浫浬浭浰浱浲浳浵浶浹浺浻浽",
    4,
    "涃涄涆涇涊涋涍涏涐涒涖",
    4,
    "涜涢涥涬涭涰涱涳涴涶涷涹",
    5,
    "淁淂淃淈淉淊"
  ],
  [
    "9c40",
    "淍淎淏淐淒淓淔淕淗淚淛淜淟淢淣淥淧淨淩淪淭淯淰淲淴淵淶淸淺淽",
    7,
    "渆渇済渉渋渏渒渓渕渘渙減渜渞渟渢渦渧渨渪測渮渰渱渳渵"
  ],
  [
    "9c80",
    "渶渷渹渻",
    7,
    "湅",
    7,
    "湏湐湑湒湕湗湙湚湜湝湞湠",
    10,
    "湬湭湯",
    14,
    "満溁溂溄溇溈溊",
    4,
    "溑",
    6,
    "溙溚溛溝溞溠溡溣溤溦溨溩溫溬溭溮溰溳溵溸溹溼溾溿滀滃滄滅滆滈滉滊滌滍滎滐滒滖滘滙滛滜滝滣滧滪",
    5
  ],
  [
    "9d40",
    "滰滱滲滳滵滶滷滸滺",
    7,
    "漃漄漅漇漈漊",
    4,
    "漐漑漒漖",
    9,
    "漡漢漣漥漦漧漨漬漮漰漲漴漵漷",
    6,
    "漿潀潁潂"
  ],
  [
    "9d80",
    "潃潄潅潈潉潊潌潎",
    9,
    "潙潚潛潝潟潠潡潣潤潥潧",
    5,
    "潯潰潱潳潵潶潷潹潻潽",
    6,
    "澅澆澇澊澋澏",
    12,
    "澝澞澟澠澢",
    4,
    "澨",
    10,
    "澴澵澷澸澺",
    5,
    "濁濃",
    5,
    "濊",
    6,
    "濓",
    10,
    "濟濢濣濤濥"
  ],
  [
    "9e40",
    "濦",
    7,
    "濰",
    32,
    "瀒",
    7,
    "瀜",
    6,
    "瀤",
    6
  ],
  [
    "9e80",
    "瀫",
    9,
    "瀶瀷瀸瀺",
    17,
    "灍灎灐",
    13,
    "灟",
    11,
    "灮灱灲灳灴灷灹灺灻災炁炂炃炄炆炇炈炋炌炍炏炐炑炓炗炘炚炛炞",
    12,
    "炰炲炴炵炶為炾炿烄烅烆烇烉烋",
    12,
    "烚"
  ],
  [
    "9f40",
    "烜烝烞烠烡烢烣烥烪烮烰",
    6,
    "烸烺烻烼烾",
    10,
    "焋",
    4,
    "焑焒焔焗焛",
    10,
    "焧",
    7,
    "焲焳焴"
  ],
  [
    "9f80",
    "焵焷",
    13,
    "煆煇煈煉煋煍煏",
    12,
    "煝煟",
    4,
    "煥煩",
    4,
    "煯煰煱煴煵煶煷煹煻煼煾",
    5,
    "熅",
    4,
    "熋熌熍熎熐熑熒熓熕熖熗熚",
    4,
    "熡",
    6,
    "熩熪熫熭",
    5,
    "熴熶熷熸熺",
    8,
    "燄",
    9,
    "燏",
    4
  ],
  [
    "a040",
    "燖",
    9,
    "燡燢燣燤燦燨",
    5,
    "燯",
    9,
    "燺",
    11,
    "爇",
    19
  ],
  [
    "a080",
    "爛爜爞",
    9,
    "爩爫爭爮爯爲爳爴爺爼爾牀",
    6,
    "牉牊牋牎牏牐牑牓牔牕牗牘牚牜牞牠牣牤牥牨牪牫牬牭牰牱牳牴牶牷牸牻牼牽犂犃犅",
    4,
    "犌犎犐犑犓",
    11,
    "犠",
    11,
    "犮犱犲犳犵犺",
    6,
    "狅狆狇狉狊狋狌狏狑狓狔狕狖狘狚狛"
  ],
  [
    "a1a1",
    "　、。·ˉˇ¨〃々—～‖…‘’“”〔〕〈",
    7,
    "〖〗【】±×÷∶∧∨∑∏∪∩∈∷√⊥∥∠⌒⊙∫∮≡≌≈∽∝≠≮≯≤≥∞∵∴♂♀°′″℃＄¤￠￡‰§№☆★○●◎◇◆□■△▲※→←↑↓〓"
  ],
  [
    "a2a1",
    "ⅰ",
    9
  ],
  [
    "a2b1",
    "⒈",
    19,
    "⑴",
    19,
    "①",
    9
  ],
  [
    "a2e5",
    "㈠",
    9
  ],
  [
    "a2f1",
    "Ⅰ",
    11
  ],
  [
    "a3a1",
    "！＂＃￥％",
    88,
    "￣"
  ],
  [
    "a4a1",
    "ぁ",
    82
  ],
  [
    "a5a1",
    "ァ",
    85
  ],
  [
    "a6a1",
    "Α",
    16,
    "Σ",
    6
  ],
  [
    "a6c1",
    "α",
    16,
    "σ",
    6
  ],
  [
    "a6e0",
    "︵︶︹︺︿﹀︽︾﹁﹂﹃﹄"
  ],
  [
    "a6ee",
    "︻︼︷︸︱"
  ],
  [
    "a6f4",
    "︳︴"
  ],
  [
    "a7a1",
    "А",
    5,
    "ЁЖ",
    25
  ],
  [
    "a7d1",
    "а",
    5,
    "ёж",
    25
  ],
  [
    "a840",
    "ˊˋ˙–―‥‵℅℉↖↗↘↙∕∟∣≒≦≧⊿═",
    35,
    "▁",
    6
  ],
  [
    "a880",
    "█",
    7,
    "▓▔▕▼▽◢◣◤◥☉⊕〒〝〞"
  ],
  [
    "a8a1",
    "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüêɑ"
  ],
  [
    "a8bd",
    "ńň"
  ],
  [
    "a8c0",
    "ɡ"
  ],
  [
    "a8c5",
    "ㄅ",
    36
  ],
  [
    "a940",
    "〡",
    8,
    "㊣㎎㎏㎜㎝㎞㎡㏄㏎㏑㏒㏕︰￢￤"
  ],
  [
    "a959",
    "℡㈱"
  ],
  [
    "a95c",
    "‐"
  ],
  [
    "a960",
    "ー゛゜ヽヾ〆ゝゞ﹉",
    9,
    "﹔﹕﹖﹗﹙",
    8
  ],
  [
    "a980",
    "﹢",
    4,
    "﹨﹩﹪﹫"
  ],
  [
    "a996",
    "〇"
  ],
  [
    "a9a4",
    "─",
    75
  ],
  [
    "aa40",
    "狜狝狟狢",
    5,
    "狪狫狵狶狹狽狾狿猀猂猄",
    5,
    "猋猌猍猏猐猑猒猔猘猙猚猟猠猣猤猦猧猨猭猯猰猲猳猵猶猺猻猼猽獀",
    8
  ],
  [
    "aa80",
    "獉獊獋獌獎獏獑獓獔獕獖獘",
    7,
    "獡",
    10,
    "獮獰獱"
  ],
  [
    "ab40",
    "獲",
    11,
    "獿",
    4,
    "玅玆玈玊玌玍玏玐玒玓玔玕玗玘玙玚玜玝玞玠玡玣",
    5,
    "玪玬玭玱玴玵玶玸玹玼玽玾玿珁珃",
    4
  ],
  [
    "ab80",
    "珋珌珎珒",
    6,
    "珚珛珜珝珟珡珢珣珤珦珨珪珫珬珮珯珰珱珳",
    4
  ],
  [
    "ac40",
    "珸",
    10,
    "琄琇琈琋琌琍琎琑",
    8,
    "琜",
    5,
    "琣琤琧琩琫琭琯琱琲琷",
    4,
    "琽琾琿瑀瑂",
    11
  ],
  [
    "ac80",
    "瑎",
    6,
    "瑖瑘瑝瑠",
    12,
    "瑮瑯瑱",
    4,
    "瑸瑹瑺"
  ],
  [
    "ad40",
    "瑻瑼瑽瑿璂璄璅璆璈璉璊璌璍璏璑",
    10,
    "璝璟",
    7,
    "璪",
    15,
    "璻",
    12
  ],
  [
    "ad80",
    "瓈",
    9,
    "瓓",
    8,
    "瓝瓟瓡瓥瓧",
    6,
    "瓰瓱瓲"
  ],
  [
    "ae40",
    "瓳瓵瓸",
    6,
    "甀甁甂甃甅",
    7,
    "甎甐甒甔甕甖甗甛甝甞甠",
    4,
    "甦甧甪甮甴甶甹甼甽甿畁畂畃畄畆畇畉畊畍畐畑畒畓畕畖畗畘"
  ],
  [
    "ae80",
    "畝",
    7,
    "畧畨畩畫",
    6,
    "畳畵當畷畺",
    4,
    "疀疁疂疄疅疇"
  ],
  [
    "af40",
    "疈疉疊疌疍疎疐疓疕疘疛疜疞疢疦",
    4,
    "疭疶疷疺疻疿痀痁痆痋痌痎痏痐痑痓痗痙痚痜痝痟痠痡痥痩痬痭痮痯痲痳痵痶痷痸痺痻痽痾瘂瘄瘆瘇"
  ],
  [
    "af80",
    "瘈瘉瘋瘍瘎瘏瘑瘒瘓瘔瘖瘚瘜瘝瘞瘡瘣瘧瘨瘬瘮瘯瘱瘲瘶瘷瘹瘺瘻瘽癁療癄"
  ],
  [
    "b040",
    "癅",
    6,
    "癎",
    5,
    "癕癗",
    4,
    "癝癟癠癡癢癤",
    6,
    "癬癭癮癰",
    7,
    "癹発發癿皀皁皃皅皉皊皌皍皏皐皒皔皕皗皘皚皛"
  ],
  [
    "b080",
    "皜",
    7,
    "皥",
    8,
    "皯皰皳皵",
    9,
    "盀盁盃啊阿埃挨哎唉哀皑癌蔼矮艾碍爱隘鞍氨安俺按暗岸胺案肮昂盎凹敖熬翱袄傲奥懊澳芭捌扒叭吧笆八疤巴拔跋靶把耙坝霸罢爸白柏百摆佰败拜稗斑班搬扳般颁板版扮拌伴瓣半办绊邦帮梆榜膀绑棒磅蚌镑傍谤苞胞包褒剥"
  ],
  [
    "b140",
    "盄盇盉盋盌盓盕盙盚盜盝盞盠",
    4,
    "盦",
    7,
    "盰盳盵盶盷盺盻盽盿眀眂眃眅眆眊県眎",
    10,
    "眛眜眝眞眡眣眤眥眧眪眫"
  ],
  [
    "b180",
    "眬眮眰",
    4,
    "眹眻眽眾眿睂睄睅睆睈",
    7,
    "睒",
    7,
    "睜薄雹保堡饱宝抱报暴豹鲍爆杯碑悲卑北辈背贝钡倍狈备惫焙被奔苯本笨崩绷甭泵蹦迸逼鼻比鄙笔彼碧蓖蔽毕毙毖币庇痹闭敝弊必辟壁臂避陛鞭边编贬扁便变卞辨辩辫遍标彪膘表鳖憋别瘪彬斌濒滨宾摈兵冰柄丙秉饼炳"
  ],
  [
    "b240",
    "睝睞睟睠睤睧睩睪睭",
    11,
    "睺睻睼瞁瞂瞃瞆",
    5,
    "瞏瞐瞓",
    11,
    "瞡瞣瞤瞦瞨瞫瞭瞮瞯瞱瞲瞴瞶",
    4
  ],
  [
    "b280",
    "瞼瞾矀",
    12,
    "矎",
    8,
    "矘矙矚矝",
    4,
    "矤病并玻菠播拨钵波博勃搏铂箔伯帛舶脖膊渤泊驳捕卜哺补埠不布步簿部怖擦猜裁材才财睬踩采彩菜蔡餐参蚕残惭惨灿苍舱仓沧藏操糙槽曹草厕策侧册测层蹭插叉茬茶查碴搽察岔差诧拆柴豺搀掺蝉馋谗缠铲产阐颤昌猖"
  ],
  [
    "b340",
    "矦矨矪矯矰矱矲矴矵矷矹矺矻矼砃",
    5,
    "砊砋砎砏砐砓砕砙砛砞砠砡砢砤砨砪砫砮砯砱砲砳砵砶砽砿硁硂硃硄硆硈硉硊硋硍硏硑硓硔硘硙硚"
  ],
  [
    "b380",
    "硛硜硞",
    11,
    "硯",
    7,
    "硸硹硺硻硽",
    6,
    "场尝常长偿肠厂敞畅唱倡超抄钞朝嘲潮巢吵炒车扯撤掣彻澈郴臣辰尘晨忱沉陈趁衬撑称城橙成呈乘程惩澄诚承逞骋秤吃痴持匙池迟弛驰耻齿侈尺赤翅斥炽充冲虫崇宠抽酬畴踌稠愁筹仇绸瞅丑臭初出橱厨躇锄雏滁除楚"
  ],
  [
    "b440",
    "碄碅碆碈碊碋碏碐碒碔碕碖碙碝碞碠碢碤碦碨",
    7,
    "碵碶碷碸確碻碼碽碿磀磂磃磄磆磇磈磌磍磎磏磑磒磓磖磗磘磚",
    9
  ],
  [
    "b480",
    "磤磥磦磧磩磪磫磭",
    4,
    "磳磵磶磸磹磻",
    5,
    "礂礃礄礆",
    6,
    "础储矗搐触处揣川穿椽传船喘串疮窗幢床闯创吹炊捶锤垂春椿醇唇淳纯蠢戳绰疵茨磁雌辞慈瓷词此刺赐次聪葱囱匆从丛凑粗醋簇促蹿篡窜摧崔催脆瘁粹淬翠村存寸磋撮搓措挫错搭达答瘩打大呆歹傣戴带殆代贷袋待逮"
  ],
  [
    "b540",
    "礍",
    5,
    "礔",
    9,
    "礟",
    4,
    "礥",
    14,
    "礵",
    4,
    "礽礿祂祃祄祅祇祊",
    8,
    "祔祕祘祙祡祣"
  ],
  [
    "b580",
    "祤祦祩祪祫祬祮祰",
    6,
    "祹祻",
    4,
    "禂禃禆禇禈禉禋禌禍禎禐禑禒怠耽担丹单郸掸胆旦氮但惮淡诞弹蛋当挡党荡档刀捣蹈倒岛祷导到稻悼道盗德得的蹬灯登等瞪凳邓堤低滴迪敌笛狄涤翟嫡抵底地蒂第帝弟递缔颠掂滇碘点典靛垫电佃甸店惦奠淀殿碉叼雕凋刁掉吊钓调跌爹碟蝶迭谍叠"
  ],
  [
    "b640",
    "禓",
    6,
    "禛",
    11,
    "禨",
    10,
    "禴",
    4,
    "禼禿秂秄秅秇秈秊秌秎秏秐秓秔秖秗秙",
    5,
    "秠秡秢秥秨秪"
  ],
  [
    "b680",
    "秬秮秱",
    6,
    "秹秺秼秾秿稁稄稅稇稈稉稊稌稏",
    4,
    "稕稖稘稙稛稜丁盯叮钉顶鼎锭定订丢东冬董懂动栋侗恫冻洞兜抖斗陡豆逗痘都督毒犊独读堵睹赌杜镀肚度渡妒端短锻段断缎堆兑队对墩吨蹲敦顿囤钝盾遁掇哆多夺垛躲朵跺舵剁惰堕蛾峨鹅俄额讹娥恶厄扼遏鄂饿恩而儿耳尔饵洱二"
  ],
  [
    "b740",
    "稝稟稡稢稤",
    14,
    "稴稵稶稸稺稾穀",
    5,
    "穇",
    9,
    "穒",
    4,
    "穘",
    16
  ],
  [
    "b780",
    "穩",
    6,
    "穱穲穳穵穻穼穽穾窂窅窇窉窊窋窌窎窏窐窓窔窙窚窛窞窡窢贰发罚筏伐乏阀法珐藩帆番翻樊矾钒繁凡烦反返范贩犯饭泛坊芳方肪房防妨仿访纺放菲非啡飞肥匪诽吠肺废沸费芬酚吩氛分纷坟焚汾粉奋份忿愤粪丰封枫蜂峰锋风疯烽逢冯缝讽奉凤佛否夫敷肤孵扶拂辐幅氟符伏俘服"
  ],
  [
    "b840",
    "窣窤窧窩窪窫窮",
    4,
    "窴",
    10,
    "竀",
    10,
    "竌",
    9,
    "竗竘竚竛竜竝竡竢竤竧",
    5,
    "竮竰竱竲竳"
  ],
  [
    "b880",
    "竴",
    4,
    "竻竼竾笀笁笂笅笇笉笌笍笎笐笒笓笖笗笘笚笜笝笟笡笢笣笧笩笭浮涪福袱弗甫抚辅俯釜斧脯腑府腐赴副覆赋复傅付阜父腹负富讣附妇缚咐噶嘎该改概钙盖溉干甘杆柑竿肝赶感秆敢赣冈刚钢缸肛纲岗港杠篙皋高膏羔糕搞镐稿告哥歌搁戈鸽胳疙割革葛格蛤阁隔铬个各给根跟耕更庚羹"
  ],
  [
    "b940",
    "笯笰笲笴笵笶笷笹笻笽笿",
    5,
    "筆筈筊筍筎筓筕筗筙筜筞筟筡筣",
    10,
    "筯筰筳筴筶筸筺筼筽筿箁箂箃箄箆",
    6,
    "箎箏"
  ],
  [
    "b980",
    "箑箒箓箖箘箙箚箛箞箟箠箣箤箥箮箯箰箲箳箵箶箷箹",
    7,
    "篂篃範埂耿梗工攻功恭龚供躬公宫弓巩汞拱贡共钩勾沟苟狗垢构购够辜菇咕箍估沽孤姑鼓古蛊骨谷股故顾固雇刮瓜剐寡挂褂乖拐怪棺关官冠观管馆罐惯灌贯光广逛瑰规圭硅归龟闺轨鬼诡癸桂柜跪贵刽辊滚棍锅郭国果裹过哈"
  ],
  [
    "ba40",
    "篅篈築篊篋篍篎篏篐篒篔",
    4,
    "篛篜篞篟篠篢篣篤篧篨篩篫篬篭篯篰篲",
    4,
    "篸篹篺篻篽篿",
    7,
    "簈簉簊簍簎簐",
    5,
    "簗簘簙"
  ],
  [
    "ba80",
    "簚",
    4,
    "簠",
    5,
    "簨簩簫",
    12,
    "簹",
    5,
    "籂骸孩海氦亥害骇酣憨邯韩含涵寒函喊罕翰撼捍旱憾悍焊汗汉夯杭航壕嚎豪毫郝好耗号浩呵喝荷菏核禾和何合盒貉阂河涸赫褐鹤贺嘿黑痕很狠恨哼亨横衡恒轰哄烘虹鸿洪宏弘红喉侯猴吼厚候后呼乎忽瑚壶葫胡蝴狐糊湖"
  ],
  [
    "bb40",
    "籃",
    9,
    "籎",
    36,
    "籵",
    5,
    "籾",
    9
  ],
  [
    "bb80",
    "粈粊",
    6,
    "粓粔粖粙粚粛粠粡粣粦粧粨粩粫粬粭粯粰粴",
    4,
    "粺粻弧虎唬护互沪户花哗华猾滑画划化话槐徊怀淮坏欢环桓还缓换患唤痪豢焕涣宦幻荒慌黄磺蝗簧皇凰惶煌晃幌恍谎灰挥辉徽恢蛔回毁悔慧卉惠晦贿秽会烩汇讳诲绘荤昏婚魂浑混豁活伙火获或惑霍货祸击圾基机畸稽积箕"
  ],
  [
    "bc40",
    "粿糀糂糃糄糆糉糋糎",
    6,
    "糘糚糛糝糞糡",
    6,
    "糩",
    5,
    "糰",
    7,
    "糹糺糼",
    13,
    "紋",
    5
  ],
  [
    "bc80",
    "紑",
    14,
    "紡紣紤紥紦紨紩紪紬紭紮細",
    6,
    "肌饥迹激讥鸡姬绩缉吉极棘辑籍集及急疾汲即嫉级挤几脊己蓟技冀季伎祭剂悸济寄寂计记既忌际妓继纪嘉枷夹佳家加荚颊贾甲钾假稼价架驾嫁歼监坚尖笺间煎兼肩艰奸缄茧检柬碱硷拣捡简俭剪减荐槛鉴践贱见键箭件"
  ],
  [
    "bd40",
    "紷",
    54,
    "絯",
    7
  ],
  [
    "bd80",
    "絸",
    32,
    "健舰剑饯渐溅涧建僵姜将浆江疆蒋桨奖讲匠酱降蕉椒礁焦胶交郊浇骄娇嚼搅铰矫侥脚狡角饺缴绞剿教酵轿较叫窖揭接皆秸街阶截劫节桔杰捷睫竭洁结解姐戒藉芥界借介疥诫届巾筋斤金今津襟紧锦仅谨进靳晋禁近烬浸"
  ],
  [
    "be40",
    "継",
    12,
    "綧",
    6,
    "綯",
    42
  ],
  [
    "be80",
    "線",
    32,
    "尽劲荆兢茎睛晶鲸京惊精粳经井警景颈静境敬镜径痉靖竟竞净炯窘揪究纠玖韭久灸九酒厩救旧臼舅咎就疚鞠拘狙疽居驹菊局咀矩举沮聚拒据巨具距踞锯俱句惧炬剧捐鹃娟倦眷卷绢撅攫抉掘倔爵觉决诀绝均菌钧军君峻"
  ],
  [
    "bf40",
    "緻",
    62
  ],
  [
    "bf80",
    "縺縼",
    4,
    "繂",
    4,
    "繈",
    21,
    "俊竣浚郡骏喀咖卡咯开揩楷凯慨刊堪勘坎砍看康慷糠扛抗亢炕考拷烤靠坷苛柯棵磕颗科壳咳可渴克刻客课肯啃垦恳坑吭空恐孔控抠口扣寇枯哭窟苦酷库裤夸垮挎跨胯块筷侩快宽款匡筐狂框矿眶旷况亏盔岿窥葵奎魁傀"
  ],
  [
    "c040",
    "繞",
    35,
    "纃",
    23,
    "纜纝纞"
  ],
  [
    "c080",
    "纮纴纻纼绖绤绬绹缊缐缞缷缹缻",
    6,
    "罃罆",
    9,
    "罒罓馈愧溃坤昆捆困括扩廓阔垃拉喇蜡腊辣啦莱来赖蓝婪栏拦篮阑兰澜谰揽览懒缆烂滥琅榔狼廊郎朗浪捞劳牢老佬姥酪烙涝勒乐雷镭蕾磊累儡垒擂肋类泪棱楞冷厘梨犁黎篱狸离漓理李里鲤礼莉荔吏栗丽厉励砾历利傈例俐"
  ],
  [
    "c140",
    "罖罙罛罜罝罞罠罣",
    4,
    "罫罬罭罯罰罳罵罶罷罸罺罻罼罽罿羀羂",
    7,
    "羋羍羏",
    4,
    "羕",
    4,
    "羛羜羠羢羣羥羦羨",
    6,
    "羱"
  ],
  [
    "c180",
    "羳",
    4,
    "羺羻羾翀翂翃翄翆翇翈翉翋翍翏",
    4,
    "翖翗翙",
    5,
    "翢翣痢立粒沥隶力璃哩俩联莲连镰廉怜涟帘敛脸链恋炼练粮凉梁粱良两辆量晾亮谅撩聊僚疗燎寥辽潦了撂镣廖料列裂烈劣猎琳林磷霖临邻鳞淋凛赁吝拎玲菱零龄铃伶羚凌灵陵岭领另令溜琉榴硫馏留刘瘤流柳六龙聋咙笼窿"
  ],
  [
    "c240",
    "翤翧翨翪翫翬翭翯翲翴",
    6,
    "翽翾翿耂耇耈耉耊耎耏耑耓耚耛耝耞耟耡耣耤耫",
    5,
    "耲耴耹耺耼耾聀聁聄聅聇聈聉聎聏聐聑聓聕聖聗"
  ],
  [
    "c280",
    "聙聛",
    13,
    "聫",
    5,
    "聲",
    11,
    "隆垄拢陇楼娄搂篓漏陋芦卢颅庐炉掳卤虏鲁麓碌露路赂鹿潞禄录陆戮驴吕铝侣旅履屡缕虑氯律率滤绿峦挛孪滦卵乱掠略抡轮伦仑沦纶论萝螺罗逻锣箩骡裸落洛骆络妈麻玛码蚂马骂嘛吗埋买麦卖迈脉瞒馒蛮满蔓曼慢漫"
  ],
  [
    "c340",
    "聾肁肂肅肈肊肍",
    5,
    "肔肕肗肙肞肣肦肧肨肬肰肳肵肶肸肹肻胅胇",
    4,
    "胏",
    6,
    "胘胟胠胢胣胦胮胵胷胹胻胾胿脀脁脃脄脅脇脈脋"
  ],
  [
    "c380",
    "脌脕脗脙脛脜脝脟",
    12,
    "脭脮脰脳脴脵脷脹",
    4,
    "脿谩芒茫盲氓忙莽猫茅锚毛矛铆卯茂冒帽貌贸么玫枚梅酶霉煤没眉媒镁每美昧寐妹媚门闷们萌蒙檬盟锰猛梦孟眯醚靡糜迷谜弥米秘觅泌蜜密幂棉眠绵冕免勉娩缅面苗描瞄藐秒渺庙妙蔑灭民抿皿敏悯闽明螟鸣铭名命谬摸"
  ],
  [
    "c440",
    "腀",
    5,
    "腇腉腍腎腏腒腖腗腘腛",
    4,
    "腡腢腣腤腦腨腪腫腬腯腲腳腵腶腷腸膁膃",
    4,
    "膉膋膌膍膎膐膒",
    5,
    "膙膚膞",
    4,
    "膤膥"
  ],
  [
    "c480",
    "膧膩膫",
    7,
    "膴",
    5,
    "膼膽膾膿臄臅臇臈臉臋臍",
    6,
    "摹蘑模膜磨摩魔抹末莫墨默沫漠寞陌谋牟某拇牡亩姆母墓暮幕募慕木目睦牧穆拿哪呐钠那娜纳氖乃奶耐奈南男难囊挠脑恼闹淖呢馁内嫩能妮霓倪泥尼拟你匿腻逆溺蔫拈年碾撵捻念娘酿鸟尿捏聂孽啮镊镍涅您柠狞凝宁"
  ],
  [
    "c540",
    "臔",
    14,
    "臤臥臦臨臩臫臮",
    4,
    "臵",
    5,
    "臽臿舃與",
    4,
    "舎舏舑舓舕",
    5,
    "舝舠舤舥舦舧舩舮舲舺舼舽舿"
  ],
  [
    "c580",
    "艀艁艂艃艅艆艈艊艌艍艎艐",
    7,
    "艙艛艜艝艞艠",
    7,
    "艩拧泞牛扭钮纽脓浓农弄奴努怒女暖虐疟挪懦糯诺哦欧鸥殴藕呕偶沤啪趴爬帕怕琶拍排牌徘湃派攀潘盘磐盼畔判叛乓庞旁耪胖抛咆刨炮袍跑泡呸胚培裴赔陪配佩沛喷盆砰抨烹澎彭蓬棚硼篷膨朋鹏捧碰坯砒霹批披劈琵毗"
  ],
  [
    "c640",
    "艪艫艬艭艱艵艶艷艸艻艼芀芁芃芅芆芇芉芌芐芓芔芕芖芚芛芞芠芢芣芧芲芵芶芺芻芼芿苀苂苃苅苆苉苐苖苙苚苝苢苧苨苩苪苬苭苮苰苲苳苵苶苸"
  ],
  [
    "c680",
    "苺苼",
    4,
    "茊茋茍茐茒茓茖茘茙茝",
    9,
    "茩茪茮茰茲茷茻茽啤脾疲皮匹痞僻屁譬篇偏片骗飘漂瓢票撇瞥拼频贫品聘乒坪苹萍平凭瓶评屏坡泼颇婆破魄迫粕剖扑铺仆莆葡菩蒲埔朴圃普浦谱曝瀑期欺栖戚妻七凄漆柒沏其棋奇歧畦崎脐齐旗祈祁骑起岂乞企启契砌器气迄弃汽泣讫掐"
  ],
  [
    "c740",
    "茾茿荁荂荄荅荈荊",
    4,
    "荓荕",
    4,
    "荝荢荰",
    6,
    "荹荺荾",
    6,
    "莇莈莊莋莌莍莏莐莑莔莕莖莗莙莚莝莟莡",
    6,
    "莬莭莮"
  ],
  [
    "c780",
    "莯莵莻莾莿菂菃菄菆菈菉菋菍菎菐菑菒菓菕菗菙菚菛菞菢菣菤菦菧菨菫菬菭恰洽牵扦钎铅千迁签仟谦乾黔钱钳前潜遣浅谴堑嵌欠歉枪呛腔羌墙蔷强抢橇锹敲悄桥瞧乔侨巧鞘撬翘峭俏窍切茄且怯窃钦侵亲秦琴勤芹擒禽寝沁青轻氢倾卿清擎晴氰情顷请庆琼穷秋丘邱球求囚酋泅趋区蛆曲躯屈驱渠"
  ],
  [
    "c840",
    "菮華菳",
    4,
    "菺菻菼菾菿萀萂萅萇萈萉萊萐萒",
    5,
    "萙萚萛萞",
    5,
    "萩",
    7,
    "萲",
    5,
    "萹萺萻萾",
    7,
    "葇葈葉"
  ],
  [
    "c880",
    "葊",
    6,
    "葒",
    4,
    "葘葝葞葟葠葢葤",
    4,
    "葪葮葯葰葲葴葷葹葻葼取娶龋趣去圈颧权醛泉全痊拳犬券劝缺炔瘸却鹊榷确雀裙群然燃冉染瓤壤攘嚷让饶扰绕惹热壬仁人忍韧任认刃妊纫扔仍日戎茸蓉荣融熔溶容绒冗揉柔肉茹蠕儒孺如辱乳汝入褥软阮蕊瑞锐闰润若弱撒洒萨腮鳃塞赛三叁"
  ],
  [
    "c940",
    "葽",
    4,
    "蒃蒄蒅蒆蒊蒍蒏",
    7,
    "蒘蒚蒛蒝蒞蒟蒠蒢",
    12,
    "蒰蒱蒳蒵蒶蒷蒻蒼蒾蓀蓂蓃蓅蓆蓇蓈蓋蓌蓎蓏蓒蓔蓕蓗"
  ],
  [
    "c980",
    "蓘",
    4,
    "蓞蓡蓢蓤蓧",
    4,
    "蓭蓮蓯蓱",
    10,
    "蓽蓾蔀蔁蔂伞散桑嗓丧搔骚扫嫂瑟色涩森僧莎砂杀刹沙纱傻啥煞筛晒珊苫杉山删煽衫闪陕擅赡膳善汕扇缮墒伤商赏晌上尚裳梢捎稍烧芍勺韶少哨邵绍奢赊蛇舌舍赦摄射慑涉社设砷申呻伸身深娠绅神沈审婶甚肾慎渗声生甥牲升绳"
  ],
  [
    "ca40",
    "蔃",
    8,
    "蔍蔎蔏蔐蔒蔔蔕蔖蔘蔙蔛蔜蔝蔞蔠蔢",
    8,
    "蔭",
    9,
    "蔾",
    4,
    "蕄蕅蕆蕇蕋",
    10
  ],
  [
    "ca80",
    "蕗蕘蕚蕛蕜蕝蕟",
    4,
    "蕥蕦蕧蕩",
    8,
    "蕳蕵蕶蕷蕸蕼蕽蕿薀薁省盛剩胜圣师失狮施湿诗尸虱十石拾时什食蚀实识史矢使屎驶始式示士世柿事拭誓逝势是嗜噬适仕侍释饰氏市恃室视试收手首守寿授售受瘦兽蔬枢梳殊抒输叔舒淑疏书赎孰熟薯暑曙署蜀黍鼠属术述树束戍竖墅庶数漱"
  ],
  [
    "cb40",
    "薂薃薆薈",
    6,
    "薐",
    10,
    "薝",
    6,
    "薥薦薧薩薫薬薭薱",
    5,
    "薸薺",
    6,
    "藂",
    6,
    "藊",
    4,
    "藑藒"
  ],
  [
    "cb80",
    "藔藖",
    5,
    "藝",
    6,
    "藥藦藧藨藪",
    14,
    "恕刷耍摔衰甩帅栓拴霜双爽谁水睡税吮瞬顺舜说硕朔烁斯撕嘶思私司丝死肆寺嗣四伺似饲巳松耸怂颂送宋讼诵搜艘擞嗽苏酥俗素速粟僳塑溯宿诉肃酸蒜算虽隋随绥髓碎岁穗遂隧祟孙损笋蓑梭唆缩琐索锁所塌他它她塔"
  ],
  [
    "cc40",
    "藹藺藼藽藾蘀",
    4,
    "蘆",
    10,
    "蘒蘓蘔蘕蘗",
    15,
    "蘨蘪",
    13,
    "蘹蘺蘻蘽蘾蘿虀"
  ],
  [
    "cc80",
    "虁",
    11,
    "虒虓處",
    4,
    "虛虜虝號虠虡虣",
    7,
    "獭挞蹋踏胎苔抬台泰酞太态汰坍摊贪瘫滩坛檀痰潭谭谈坦毯袒碳探叹炭汤塘搪堂棠膛唐糖倘躺淌趟烫掏涛滔绦萄桃逃淘陶讨套特藤腾疼誊梯剔踢锑提题蹄啼体替嚏惕涕剃屉天添填田甜恬舔腆挑条迢眺跳贴铁帖厅听烃"
  ],
  [
    "cd40",
    "虭虯虰虲",
    6,
    "蚃",
    6,
    "蚎",
    4,
    "蚔蚖",
    5,
    "蚞",
    4,
    "蚥蚦蚫蚭蚮蚲蚳蚷蚸蚹蚻",
    4,
    "蛁蛂蛃蛅蛈蛌蛍蛒蛓蛕蛖蛗蛚蛜"
  ],
  [
    "cd80",
    "蛝蛠蛡蛢蛣蛥蛦蛧蛨蛪蛫蛬蛯蛵蛶蛷蛺蛻蛼蛽蛿蜁蜄蜅蜆蜋蜌蜎蜏蜐蜑蜔蜖汀廷停亭庭挺艇通桐酮瞳同铜彤童桶捅筒统痛偷投头透凸秃突图徒途涂屠土吐兔湍团推颓腿蜕褪退吞屯臀拖托脱鸵陀驮驼椭妥拓唾挖哇蛙洼娃瓦袜歪外豌弯湾玩顽丸烷完碗挽晚皖惋宛婉万腕汪王亡枉网往旺望忘妄威"
  ],
  [
    "ce40",
    "蜙蜛蜝蜟蜠蜤蜦蜧蜨蜪蜫蜬蜭蜯蜰蜲蜳蜵蜶蜸蜹蜺蜼蜽蝀",
    6,
    "蝊蝋蝍蝏蝐蝑蝒蝔蝕蝖蝘蝚",
    5,
    "蝡蝢蝦",
    7,
    "蝯蝱蝲蝳蝵"
  ],
  [
    "ce80",
    "蝷蝸蝹蝺蝿螀螁螄螆螇螉螊螌螎",
    4,
    "螔螕螖螘",
    6,
    "螠",
    4,
    "巍微危韦违桅围唯惟为潍维苇萎委伟伪尾纬未蔚味畏胃喂魏位渭谓尉慰卫瘟温蚊文闻纹吻稳紊问嗡翁瓮挝蜗涡窝我斡卧握沃巫呜钨乌污诬屋无芜梧吾吴毋武五捂午舞伍侮坞戊雾晤物勿务悟误昔熙析西硒矽晰嘻吸锡牺"
  ],
  [
    "cf40",
    "螥螦螧螩螪螮螰螱螲螴螶螷螸螹螻螼螾螿蟁",
    4,
    "蟇蟈蟉蟌",
    4,
    "蟔",
    6,
    "蟜蟝蟞蟟蟡蟢蟣蟤蟦蟧蟨蟩蟫蟬蟭蟯",
    9
  ],
  [
    "cf80",
    "蟺蟻蟼蟽蟿蠀蠁蠂蠄",
    5,
    "蠋",
    7,
    "蠔蠗蠘蠙蠚蠜",
    4,
    "蠣稀息希悉膝夕惜熄烯溪汐犀檄袭席习媳喜铣洗系隙戏细瞎虾匣霞辖暇峡侠狭下厦夏吓掀锨先仙鲜纤咸贤衔舷闲涎弦嫌显险现献县腺馅羡宪陷限线相厢镶香箱襄湘乡翔祥详想响享项巷橡像向象萧硝霄削哮嚣销消宵淆晓"
  ],
  [
    "d040",
    "蠤",
    13,
    "蠳",
    5,
    "蠺蠻蠽蠾蠿衁衂衃衆",
    5,
    "衎",
    5,
    "衕衖衘衚",
    6,
    "衦衧衪衭衯衱衳衴衵衶衸衹衺"
  ],
  [
    "d080",
    "衻衼袀袃袆袇袉袊袌袎袏袐袑袓袔袕袗",
    4,
    "袝",
    4,
    "袣袥",
    5,
    "小孝校肖啸笑效楔些歇蝎鞋协挟携邪斜胁谐写械卸蟹懈泄泻谢屑薪芯锌欣辛新忻心信衅星腥猩惺兴刑型形邢行醒幸杏性姓兄凶胸匈汹雄熊休修羞朽嗅锈秀袖绣墟戌需虚嘘须徐许蓄酗叙旭序畜恤絮婿绪续轩喧宣悬旋玄"
  ],
  [
    "d140",
    "袬袮袯袰袲",
    4,
    "袸袹袺袻袽袾袿裀裃裄裇裈裊裋裌裍裏裐裑裓裖裗裚",
    4,
    "裠裡裦裧裩",
    6,
    "裲裵裶裷裺裻製裿褀褁褃",
    5
  ],
  [
    "d180",
    "褉褋",
    4,
    "褑褔",
    4,
    "褜",
    4,
    "褢褣褤褦褧褨褩褬褭褮褯褱褲褳褵褷选癣眩绚靴薛学穴雪血勋熏循旬询寻驯巡殉汛训讯逊迅压押鸦鸭呀丫芽牙蚜崖衙涯雅哑亚讶焉咽阉烟淹盐严研蜒岩延言颜阎炎沿奄掩眼衍演艳堰燕厌砚雁唁彦焰宴谚验殃央鸯秧杨扬佯疡羊洋阳氧仰痒养样漾邀腰妖瑶"
  ],
  [
    "d240",
    "褸",
    8,
    "襂襃襅",
    24,
    "襠",
    5,
    "襧",
    19,
    "襼"
  ],
  [
    "d280",
    "襽襾覀覂覄覅覇",
    26,
    "摇尧遥窑谣姚咬舀药要耀椰噎耶爷野冶也页掖业叶曳腋夜液一壹医揖铱依伊衣颐夷遗移仪胰疑沂宜姨彝椅蚁倚已乙矣以艺抑易邑屹亿役臆逸肄疫亦裔意毅忆义益溢诣议谊译异翼翌绎茵荫因殷音阴姻吟银淫寅饮尹引隐"
  ],
  [
    "d340",
    "覢",
    30,
    "觃觍觓觔觕觗觘觙觛觝觟觠觡觢觤觧觨觩觪觬觭觮觰觱觲觴",
    6
  ],
  [
    "d380",
    "觻",
    4,
    "訁",
    5,
    "計",
    21,
    "印英樱婴鹰应缨莹萤营荧蝇迎赢盈影颖硬映哟拥佣臃痈庸雍踊蛹咏泳涌永恿勇用幽优悠忧尤由邮铀犹油游酉有友右佑釉诱又幼迂淤于盂榆虞愚舆余俞逾鱼愉渝渔隅予娱雨与屿禹宇语羽玉域芋郁吁遇喻峪御愈欲狱育誉"
  ],
  [
    "d440",
    "訞",
    31,
    "訿",
    8,
    "詉",
    21
  ],
  [
    "d480",
    "詟",
    25,
    "詺",
    6,
    "浴寓裕预豫驭鸳渊冤元垣袁原援辕园员圆猿源缘远苑愿怨院曰约越跃钥岳粤月悦阅耘云郧匀陨允运蕴酝晕韵孕匝砸杂栽哉灾宰载再在咱攒暂赞赃脏葬遭糟凿藻枣早澡蚤躁噪造皂灶燥责择则泽贼怎增憎曾赠扎喳渣札轧"
  ],
  [
    "d540",
    "誁",
    7,
    "誋",
    7,
    "誔",
    46
  ],
  [
    "d580",
    "諃",
    32,
    "铡闸眨栅榨咋乍炸诈摘斋宅窄债寨瞻毡詹粘沾盏斩辗崭展蘸栈占战站湛绽樟章彰漳张掌涨杖丈帐账仗胀瘴障招昭找沼赵照罩兆肇召遮折哲蛰辙者锗蔗这浙珍斟真甄砧臻贞针侦枕疹诊震振镇阵蒸挣睁征狰争怔整拯正政"
  ],
  [
    "d640",
    "諤",
    34,
    "謈",
    27
  ],
  [
    "d680",
    "謤謥謧",
    30,
    "帧症郑证芝枝支吱蜘知肢脂汁之织职直植殖执值侄址指止趾只旨纸志挚掷至致置帜峙制智秩稚质炙痔滞治窒中盅忠钟衷终种肿重仲众舟周州洲诌粥轴肘帚咒皱宙昼骤珠株蛛朱猪诸诛逐竹烛煮拄瞩嘱主著柱助蛀贮铸筑"
  ],
  [
    "d740",
    "譆",
    31,
    "譧",
    4,
    "譭",
    25
  ],
  [
    "d780",
    "讇",
    24,
    "讬讱讻诇诐诪谉谞住注祝驻抓爪拽专砖转撰赚篆桩庄装妆撞壮状椎锥追赘坠缀谆准捉拙卓桌琢茁酌啄着灼浊兹咨资姿滋淄孜紫仔籽滓子自渍字鬃棕踪宗综总纵邹走奏揍租足卒族祖诅阻组钻纂嘴醉最罪尊遵昨左佐柞做作坐座"
  ],
  [
    "d840",
    "谸",
    8,
    "豂豃豄豅豈豊豋豍",
    7,
    "豖豗豘豙豛",
    5,
    "豣",
    6,
    "豬",
    6,
    "豴豵豶豷豻",
    6,
    "貃貄貆貇"
  ],
  [
    "d880",
    "貈貋貍",
    6,
    "貕貖貗貙",
    20,
    "亍丌兀丐廿卅丕亘丞鬲孬噩丨禺丿匕乇夭爻卮氐囟胤馗毓睾鼗丶亟鼐乜乩亓芈孛啬嘏仄厍厝厣厥厮靥赝匚叵匦匮匾赜卦卣刂刈刎刭刳刿剀剌剞剡剜蒯剽劂劁劐劓冂罔亻仃仉仂仨仡仫仞伛仳伢佤仵伥伧伉伫佞佧攸佚佝"
  ],
  [
    "d940",
    "貮",
    62
  ],
  [
    "d980",
    "賭",
    32,
    "佟佗伲伽佶佴侑侉侃侏佾佻侪佼侬侔俦俨俪俅俚俣俜俑俟俸倩偌俳倬倏倮倭俾倜倌倥倨偾偃偕偈偎偬偻傥傧傩傺僖儆僭僬僦僮儇儋仝氽佘佥俎龠汆籴兮巽黉馘冁夔勹匍訇匐凫夙兕亠兖亳衮袤亵脔裒禀嬴蠃羸冫冱冽冼"
  ],
  [
    "da40",
    "贎",
    14,
    "贠赑赒赗赟赥赨赩赪赬赮赯赱赲赸",
    8,
    "趂趃趆趇趈趉趌",
    4,
    "趒趓趕",
    9,
    "趠趡"
  ],
  [
    "da80",
    "趢趤",
    12,
    "趲趶趷趹趻趽跀跁跂跅跇跈跉跊跍跐跒跓跔凇冖冢冥讠讦讧讪讴讵讷诂诃诋诏诎诒诓诔诖诘诙诜诟诠诤诨诩诮诰诳诶诹诼诿谀谂谄谇谌谏谑谒谔谕谖谙谛谘谝谟谠谡谥谧谪谫谮谯谲谳谵谶卩卺阝阢阡阱阪阽阼陂陉陔陟陧陬陲陴隈隍隗隰邗邛邝邙邬邡邴邳邶邺"
  ],
  [
    "db40",
    "跕跘跙跜跠跡跢跥跦跧跩跭跮跰跱跲跴跶跼跾",
    6,
    "踆踇踈踋踍踎踐踑踒踓踕",
    7,
    "踠踡踤",
    4,
    "踫踭踰踲踳踴踶踷踸踻踼踾"
  ],
  [
    "db80",
    "踿蹃蹅蹆蹌",
    4,
    "蹓",
    5,
    "蹚",
    11,
    "蹧蹨蹪蹫蹮蹱邸邰郏郅邾郐郄郇郓郦郢郜郗郛郫郯郾鄄鄢鄞鄣鄱鄯鄹酃酆刍奂劢劬劭劾哿勐勖勰叟燮矍廴凵凼鬯厶弁畚巯坌垩垡塾墼壅壑圩圬圪圳圹圮圯坜圻坂坩垅坫垆坼坻坨坭坶坳垭垤垌垲埏垧垴垓垠埕埘埚埙埒垸埴埯埸埤埝"
  ],
  [
    "dc40",
    "蹳蹵蹷",
    4,
    "蹽蹾躀躂躃躄躆躈",
    6,
    "躑躒躓躕",
    6,
    "躝躟",
    11,
    "躭躮躰躱躳",
    6,
    "躻",
    7
  ],
  [
    "dc80",
    "軃",
    10,
    "軏",
    21,
    "堋堍埽埭堀堞堙塄堠塥塬墁墉墚墀馨鼙懿艹艽艿芏芊芨芄芎芑芗芙芫芸芾芰苈苊苣芘芷芮苋苌苁芩芴芡芪芟苄苎芤苡茉苷苤茏茇苜苴苒苘茌苻苓茑茚茆茔茕苠苕茜荑荛荜茈莒茼茴茱莛荞茯荏荇荃荟荀茗荠茭茺茳荦荥"
  ],
  [
    "dd40",
    "軥",
    62
  ],
  [
    "dd80",
    "輤",
    32,
    "荨茛荩荬荪荭荮莰荸莳莴莠莪莓莜莅荼莶莩荽莸荻莘莞莨莺莼菁萁菥菘堇萘萋菝菽菖萜萸萑萆菔菟萏萃菸菹菪菅菀萦菰菡葜葑葚葙葳蒇蒈葺蒉葸萼葆葩葶蒌蒎萱葭蓁蓍蓐蓦蒽蓓蓊蒿蒺蓠蒡蒹蒴蒗蓥蓣蔌甍蔸蓰蔹蔟蔺"
  ],
  [
    "de40",
    "轅",
    32,
    "轪辀辌辒辝辠辡辢辤辥辦辧辪辬辭辮辯農辳辴辵辷辸辺辻込辿迀迃迆"
  ],
  [
    "de80",
    "迉",
    4,
    "迏迒迖迗迚迠迡迣迧迬迯迱迲迴迵迶迺迻迼迾迿逇逈逌逎逓逕逘蕖蔻蓿蓼蕙蕈蕨蕤蕞蕺瞢蕃蕲蕻薤薨薇薏蕹薮薜薅薹薷薰藓藁藜藿蘧蘅蘩蘖蘼廾弈夼奁耷奕奚奘匏尢尥尬尴扌扪抟抻拊拚拗拮挢拶挹捋捃掭揶捱捺掎掴捭掬掊捩掮掼揲揸揠揿揄揞揎摒揆掾摅摁搋搛搠搌搦搡摞撄摭撖"
  ],
  [
    "df40",
    "這逜連逤逥逧",
    5,
    "逰",
    4,
    "逷逹逺逽逿遀遃遅遆遈",
    4,
    "過達違遖遙遚遜",
    5,
    "遤遦遧適遪遫遬遯",
    4,
    "遶",
    6,
    "遾邁"
  ],
  [
    "df80",
    "還邅邆邇邉邊邌",
    4,
    "邒邔邖邘邚邜邞邟邠邤邥邧邨邩邫邭邲邷邼邽邿郀摺撷撸撙撺擀擐擗擤擢攉攥攮弋忒甙弑卟叱叽叩叨叻吒吖吆呋呒呓呔呖呃吡呗呙吣吲咂咔呷呱呤咚咛咄呶呦咝哐咭哂咴哒咧咦哓哔呲咣哕咻咿哌哙哚哜咩咪咤哝哏哞唛哧唠哽唔哳唢唣唏唑唧唪啧喏喵啉啭啁啕唿啐唼"
  ],
  [
    "e040",
    "郂郃郆郈郉郋郌郍郒郔郕郖郘郙郚郞郟郠郣郤郥郩郪郬郮郰郱郲郳郵郶郷郹郺郻郼郿鄀鄁鄃鄅",
    19,
    "鄚鄛鄜"
  ],
  [
    "e080",
    "鄝鄟鄠鄡鄤",
    10,
    "鄰鄲",
    6,
    "鄺",
    8,
    "酄唷啖啵啶啷唳唰啜喋嗒喃喱喹喈喁喟啾嗖喑啻嗟喽喾喔喙嗪嗷嗉嘟嗑嗫嗬嗔嗦嗝嗄嗯嗥嗲嗳嗌嗍嗨嗵嗤辔嘞嘈嘌嘁嘤嘣嗾嘀嘧嘭噘嘹噗嘬噍噢噙噜噌噔嚆噤噱噫噻噼嚅嚓嚯囔囗囝囡囵囫囹囿圄圊圉圜帏帙帔帑帱帻帼"
  ],
  [
    "e140",
    "酅酇酈酑酓酔酕酖酘酙酛酜酟酠酦酧酨酫酭酳酺酻酼醀",
    4,
    "醆醈醊醎醏醓",
    6,
    "醜",
    5,
    "醤",
    5,
    "醫醬醰醱醲醳醶醷醸醹醻"
  ],
  [
    "e180",
    "醼",
    10,
    "釈釋釐釒",
    9,
    "針",
    8,
    "帷幄幔幛幞幡岌屺岍岐岖岈岘岙岑岚岜岵岢岽岬岫岱岣峁岷峄峒峤峋峥崂崃崧崦崮崤崞崆崛嵘崾崴崽嵬嵛嵯嵝嵫嵋嵊嵩嵴嶂嶙嶝豳嶷巅彳彷徂徇徉後徕徙徜徨徭徵徼衢彡犭犰犴犷犸狃狁狎狍狒狨狯狩狲狴狷猁狳猃狺"
  ],
  [
    "e240",
    "釦",
    62
  ],
  [
    "e280",
    "鈥",
    32,
    "狻猗猓猡猊猞猝猕猢猹猥猬猸猱獐獍獗獠獬獯獾舛夥飧夤夂饣饧",
    5,
    "饴饷饽馀馄馇馊馍馐馑馓馔馕庀庑庋庖庥庠庹庵庾庳赓廒廑廛廨廪膺忄忉忖忏怃忮怄忡忤忾怅怆忪忭忸怙怵怦怛怏怍怩怫怊怿怡恸恹恻恺恂"
  ],
  [
    "e340",
    "鉆",
    45,
    "鉵",
    16
  ],
  [
    "e380",
    "銆",
    7,
    "銏",
    24,
    "恪恽悖悚悭悝悃悒悌悛惬悻悱惝惘惆惚悴愠愦愕愣惴愀愎愫慊慵憬憔憧憷懔懵忝隳闩闫闱闳闵闶闼闾阃阄阆阈阊阋阌阍阏阒阕阖阗阙阚丬爿戕氵汔汜汊沣沅沐沔沌汨汩汴汶沆沩泐泔沭泷泸泱泗沲泠泖泺泫泮沱泓泯泾"
  ],
  [
    "e440",
    "銨",
    5,
    "銯",
    24,
    "鋉",
    31
  ],
  [
    "e480",
    "鋩",
    32,
    "洹洧洌浃浈洇洄洙洎洫浍洮洵洚浏浒浔洳涑浯涞涠浞涓涔浜浠浼浣渚淇淅淞渎涿淠渑淦淝淙渖涫渌涮渫湮湎湫溲湟溆湓湔渲渥湄滟溱溘滠漭滢溥溧溽溻溷滗溴滏溏滂溟潢潆潇漤漕滹漯漶潋潴漪漉漩澉澍澌潸潲潼潺濑"
  ],
  [
    "e540",
    "錊",
    51,
    "錿",
    10
  ],
  [
    "e580",
    "鍊",
    31,
    "鍫濉澧澹澶濂濡濮濞濠濯瀚瀣瀛瀹瀵灏灞宀宄宕宓宥宸甯骞搴寤寮褰寰蹇謇辶迓迕迥迮迤迩迦迳迨逅逄逋逦逑逍逖逡逵逶逭逯遄遑遒遐遨遘遢遛暹遴遽邂邈邃邋彐彗彖彘尻咫屐屙孱屣屦羼弪弩弭艴弼鬻屮妁妃妍妩妪妣"
  ],
  [
    "e640",
    "鍬",
    34,
    "鎐",
    27
  ],
  [
    "e680",
    "鎬",
    29,
    "鏋鏌鏍妗姊妫妞妤姒妲妯姗妾娅娆姝娈姣姘姹娌娉娲娴娑娣娓婀婧婊婕娼婢婵胬媪媛婷婺媾嫫媲嫒嫔媸嫠嫣嫱嫖嫦嫘嫜嬉嬗嬖嬲嬷孀尕尜孚孥孳孑孓孢驵驷驸驺驿驽骀骁骅骈骊骐骒骓骖骘骛骜骝骟骠骢骣骥骧纟纡纣纥纨纩"
  ],
  [
    "e740",
    "鏎",
    7,
    "鏗",
    54
  ],
  [
    "e780",
    "鐎",
    32,
    "纭纰纾绀绁绂绉绋绌绐绔绗绛绠绡绨绫绮绯绱绲缍绶绺绻绾缁缂缃缇缈缋缌缏缑缒缗缙缜缛缟缡",
    6,
    "缪缫缬缭缯",
    4,
    "缵幺畿巛甾邕玎玑玮玢玟珏珂珑玷玳珀珉珈珥珙顼琊珩珧珞玺珲琏琪瑛琦琥琨琰琮琬"
  ],
  [
    "e840",
    "鐯",
    14,
    "鐿",
    43,
    "鑬鑭鑮鑯"
  ],
  [
    "e880",
    "鑰",
    20,
    "钑钖钘铇铏铓铔铚铦铻锜锠琛琚瑁瑜瑗瑕瑙瑷瑭瑾璜璎璀璁璇璋璞璨璩璐璧瓒璺韪韫韬杌杓杞杈杩枥枇杪杳枘枧杵枨枞枭枋杷杼柰栉柘栊柩枰栌柙枵柚枳柝栀柃枸柢栎柁柽栲栳桠桡桎桢桄桤梃栝桕桦桁桧桀栾桊桉栩梵梏桴桷梓桫棂楮棼椟椠棹"
  ],
  [
    "e940",
    "锧锳锽镃镈镋镕镚镠镮镴镵長",
    7,
    "門",
    42
  ],
  [
    "e980",
    "閫",
    32,
    "椤棰椋椁楗棣椐楱椹楠楂楝榄楫榀榘楸椴槌榇榈槎榉楦楣楹榛榧榻榫榭槔榱槁槊槟榕槠榍槿樯槭樗樘橥槲橄樾檠橐橛樵檎橹樽樨橘橼檑檐檩檗檫猷獒殁殂殇殄殒殓殍殚殛殡殪轫轭轱轲轳轵轶轸轷轹轺轼轾辁辂辄辇辋"
  ],
  [
    "ea40",
    "闌",
    27,
    "闬闿阇阓阘阛阞阠阣",
    6,
    "阫阬阭阯阰阷阸阹阺阾陁陃陊陎陏陑陒陓陖陗"
  ],
  [
    "ea80",
    "陘陙陚陜陝陞陠陣陥陦陫陭",
    4,
    "陳陸",
    12,
    "隇隉隊辍辎辏辘辚軎戋戗戛戟戢戡戥戤戬臧瓯瓴瓿甏甑甓攴旮旯旰昊昙杲昃昕昀炅曷昝昴昱昶昵耆晟晔晁晏晖晡晗晷暄暌暧暝暾曛曜曦曩贲贳贶贻贽赀赅赆赈赉赇赍赕赙觇觊觋觌觎觏觐觑牮犟牝牦牯牾牿犄犋犍犏犒挈挲掰"
  ],
  [
    "eb40",
    "隌階隑隒隓隕隖隚際隝",
    9,
    "隨",
    7,
    "隱隲隴隵隷隸隺隻隿雂雃雈雊雋雐雑雓雔雖",
    9,
    "雡",
    6,
    "雫"
  ],
  [
    "eb80",
    "雬雭雮雰雱雲雴雵雸雺電雼雽雿霂霃霅霊霋霌霐霑霒霔霕霗",
    4,
    "霝霟霠搿擘耄毪毳毽毵毹氅氇氆氍氕氘氙氚氡氩氤氪氲攵敕敫牍牒牖爰虢刖肟肜肓肼朊肽肱肫肭肴肷胧胨胩胪胛胂胄胙胍胗朐胝胫胱胴胭脍脎胲胼朕脒豚脶脞脬脘脲腈腌腓腴腙腚腱腠腩腼腽腭腧塍媵膈膂膑滕膣膪臌朦臊膻"
  ],
  [
    "ec40",
    "霡",
    8,
    "霫霬霮霯霱霳",
    4,
    "霺霻霼霽霿",
    18,
    "靔靕靗靘靚靜靝靟靣靤靦靧靨靪",
    7
  ],
  [
    "ec80",
    "靲靵靷",
    4,
    "靽",
    7,
    "鞆",
    4,
    "鞌鞎鞏鞐鞓鞕鞖鞗鞙",
    4,
    "臁膦欤欷欹歃歆歙飑飒飓飕飙飚殳彀毂觳斐齑斓於旆旄旃旌旎旒旖炀炜炖炝炻烀炷炫炱烨烊焐焓焖焯焱煳煜煨煅煲煊煸煺熘熳熵熨熠燠燔燧燹爝爨灬焘煦熹戾戽扃扈扉礻祀祆祉祛祜祓祚祢祗祠祯祧祺禅禊禚禧禳忑忐"
  ],
  [
    "ed40",
    "鞞鞟鞡鞢鞤",
    6,
    "鞬鞮鞰鞱鞳鞵",
    46
  ],
  [
    "ed80",
    "韤韥韨韮",
    4,
    "韴韷",
    23,
    "怼恝恚恧恁恙恣悫愆愍慝憩憝懋懑戆肀聿沓泶淼矶矸砀砉砗砘砑斫砭砜砝砹砺砻砟砼砥砬砣砩硎硭硖硗砦硐硇硌硪碛碓碚碇碜碡碣碲碹碥磔磙磉磬磲礅磴礓礤礞礴龛黹黻黼盱眄眍盹眇眈眚眢眙眭眦眵眸睐睑睇睃睚睨"
  ],
  [
    "ee40",
    "頏",
    62
  ],
  [
    "ee80",
    "顎",
    32,
    "睢睥睿瞍睽瞀瞌瞑瞟瞠瞰瞵瞽町畀畎畋畈畛畲畹疃罘罡罟詈罨罴罱罹羁罾盍盥蠲钅钆钇钋钊钌钍钏钐钔钗钕钚钛钜钣钤钫钪钭钬钯钰钲钴钶",
    4,
    "钼钽钿铄铈",
    6,
    "铐铑铒铕铖铗铙铘铛铞铟铠铢铤铥铧铨铪"
  ],
  [
    "ef40",
    "顯",
    5,
    "颋颎颒颕颙颣風",
    37,
    "飏飐飔飖飗飛飜飝飠",
    4
  ],
  [
    "ef80",
    "飥飦飩",
    30,
    "铩铫铮铯铳铴铵铷铹铼铽铿锃锂锆锇锉锊锍锎锏锒",
    4,
    "锘锛锝锞锟锢锪锫锩锬锱锲锴锶锷锸锼锾锿镂锵镄镅镆镉镌镎镏镒镓镔镖镗镘镙镛镞镟镝镡镢镤",
    8,
    "镯镱镲镳锺矧矬雉秕秭秣秫稆嵇稃稂稞稔"
  ],
  [
    "f040",
    "餈",
    4,
    "餎餏餑",
    28,
    "餯",
    26
  ],
  [
    "f080",
    "饊",
    9,
    "饖",
    12,
    "饤饦饳饸饹饻饾馂馃馉稹稷穑黏馥穰皈皎皓皙皤瓞瓠甬鸠鸢鸨",
    4,
    "鸲鸱鸶鸸鸷鸹鸺鸾鹁鹂鹄鹆鹇鹈鹉鹋鹌鹎鹑鹕鹗鹚鹛鹜鹞鹣鹦",
    6,
    "鹱鹭鹳疒疔疖疠疝疬疣疳疴疸痄疱疰痃痂痖痍痣痨痦痤痫痧瘃痱痼痿瘐瘀瘅瘌瘗瘊瘥瘘瘕瘙"
  ],
  [
    "f140",
    "馌馎馚",
    10,
    "馦馧馩",
    47
  ],
  [
    "f180",
    "駙",
    32,
    "瘛瘼瘢瘠癀瘭瘰瘿瘵癃瘾瘳癍癞癔癜癖癫癯翊竦穸穹窀窆窈窕窦窠窬窨窭窳衤衩衲衽衿袂袢裆袷袼裉裢裎裣裥裱褚裼裨裾裰褡褙褓褛褊褴褫褶襁襦襻疋胥皲皴矜耒耔耖耜耠耢耥耦耧耩耨耱耋耵聃聆聍聒聩聱覃顸颀颃"
  ],
  [
    "f240",
    "駺",
    62
  ],
  [
    "f280",
    "騹",
    32,
    "颉颌颍颏颔颚颛颞颟颡颢颥颦虍虔虬虮虿虺虼虻蚨蚍蚋蚬蚝蚧蚣蚪蚓蚩蚶蛄蚵蛎蚰蚺蚱蚯蛉蛏蚴蛩蛱蛲蛭蛳蛐蜓蛞蛴蛟蛘蛑蜃蜇蛸蜈蜊蜍蜉蜣蜻蜞蜥蜮蜚蜾蝈蜴蜱蜩蜷蜿螂蜢蝽蝾蝻蝠蝰蝌蝮螋蝓蝣蝼蝤蝙蝥螓螯螨蟒"
  ],
  [
    "f340",
    "驚",
    17,
    "驲骃骉骍骎骔骕骙骦骩",
    6,
    "骲骳骴骵骹骻骽骾骿髃髄髆",
    4,
    "髍髎髏髐髒體髕髖髗髙髚髛髜"
  ],
  [
    "f380",
    "髝髞髠髢髣髤髥髧髨髩髪髬髮髰",
    8,
    "髺髼",
    6,
    "鬄鬅鬆蟆螈螅螭螗螃螫蟥螬螵螳蟋蟓螽蟑蟀蟊蟛蟪蟠蟮蠖蠓蟾蠊蠛蠡蠹蠼缶罂罄罅舐竺竽笈笃笄笕笊笫笏筇笸笪笙笮笱笠笥笤笳笾笞筘筚筅筵筌筝筠筮筻筢筲筱箐箦箧箸箬箝箨箅箪箜箢箫箴篑篁篌篝篚篥篦篪簌篾篼簏簖簋"
  ],
  [
    "f440",
    "鬇鬉",
    5,
    "鬐鬑鬒鬔",
    10,
    "鬠鬡鬢鬤",
    10,
    "鬰鬱鬳",
    7,
    "鬽鬾鬿魀魆魊魋魌魎魐魒魓魕",
    5
  ],
  [
    "f480",
    "魛",
    32,
    "簟簪簦簸籁籀臾舁舂舄臬衄舡舢舣舭舯舨舫舸舻舳舴舾艄艉艋艏艚艟艨衾袅袈裘裟襞羝羟羧羯羰羲籼敉粑粝粜粞粢粲粼粽糁糇糌糍糈糅糗糨艮暨羿翎翕翥翡翦翩翮翳糸絷綦綮繇纛麸麴赳趄趔趑趱赧赭豇豉酊酐酎酏酤"
  ],
  [
    "f540",
    "魼",
    62
  ],
  [
    "f580",
    "鮻",
    32,
    "酢酡酰酩酯酽酾酲酴酹醌醅醐醍醑醢醣醪醭醮醯醵醴醺豕鹾趸跫踅蹙蹩趵趿趼趺跄跖跗跚跞跎跏跛跆跬跷跸跣跹跻跤踉跽踔踝踟踬踮踣踯踺蹀踹踵踽踱蹉蹁蹂蹑蹒蹊蹰蹶蹼蹯蹴躅躏躔躐躜躞豸貂貊貅貘貔斛觖觞觚觜"
  ],
  [
    "f640",
    "鯜",
    62
  ],
  [
    "f680",
    "鰛",
    32,
    "觥觫觯訾謦靓雩雳雯霆霁霈霏霎霪霭霰霾龀龃龅",
    5,
    "龌黾鼋鼍隹隼隽雎雒瞿雠銎銮鋈錾鍪鏊鎏鐾鑫鱿鲂鲅鲆鲇鲈稣鲋鲎鲐鲑鲒鲔鲕鲚鲛鲞",
    5,
    "鲥",
    4,
    "鲫鲭鲮鲰",
    7,
    "鲺鲻鲼鲽鳄鳅鳆鳇鳊鳋"
  ],
  [
    "f740",
    "鰼",
    62
  ],
  [
    "f780",
    "鱻鱽鱾鲀鲃鲄鲉鲊鲌鲏鲓鲖鲗鲘鲙鲝鲪鲬鲯鲹鲾",
    4,
    "鳈鳉鳑鳒鳚鳛鳠鳡鳌",
    4,
    "鳓鳔鳕鳗鳘鳙鳜鳝鳟鳢靼鞅鞑鞒鞔鞯鞫鞣鞲鞴骱骰骷鹘骶骺骼髁髀髅髂髋髌髑魅魃魇魉魈魍魑飨餍餮饕饔髟髡髦髯髫髻髭髹鬈鬏鬓鬟鬣麽麾縻麂麇麈麋麒鏖麝麟黛黜黝黠黟黢黩黧黥黪黯鼢鼬鼯鼹鼷鼽鼾齄"
  ],
  [
    "f840",
    "鳣",
    62
  ],
  [
    "f880",
    "鴢",
    32
  ],
  [
    "f940",
    "鵃",
    62
  ],
  [
    "f980",
    "鶂",
    32
  ],
  [
    "fa40",
    "鶣",
    62
  ],
  [
    "fa80",
    "鷢",
    32
  ],
  [
    "fb40",
    "鸃",
    27,
    "鸤鸧鸮鸰鸴鸻鸼鹀鹍鹐鹒鹓鹔鹖鹙鹝鹟鹠鹡鹢鹥鹮鹯鹲鹴",
    9,
    "麀"
  ],
  [
    "fb80",
    "麁麃麄麅麆麉麊麌",
    5,
    "麔",
    8,
    "麞麠",
    5,
    "麧麨麩麪"
  ],
  [
    "fc40",
    "麫",
    8,
    "麵麶麷麹麺麼麿",
    4,
    "黅黆黇黈黊黋黌黐黒黓黕黖黗黙黚點黡黣黤黦黨黫黬黭黮黰",
    8,
    "黺黽黿",
    6
  ],
  [
    "fc80",
    "鼆",
    4,
    "鼌鼏鼑鼒鼔鼕鼖鼘鼚",
    5,
    "鼡鼣",
    8,
    "鼭鼮鼰鼱"
  ],
  [
    "fd40",
    "鼲",
    4,
    "鼸鼺鼼鼿",
    4,
    "齅",
    10,
    "齒",
    38
  ],
  [
    "fd80",
    "齹",
    5,
    "龁龂龍",
    11,
    "龜龝龞龡",
    4,
    "郎凉秊裏隣"
  ],
  [
    "fe40",
    "兀嗀﨎﨏﨑﨓﨔礼﨟蘒﨡﨣﨤﨧﨨﨩"
  ]
], wl = [
  [
    "a140",
    "",
    62
  ],
  [
    "a180",
    "",
    32
  ],
  [
    "a240",
    "",
    62
  ],
  [
    "a280",
    "",
    32
  ],
  [
    "a2ab",
    "",
    5
  ],
  [
    "a2e3",
    "€"
  ],
  [
    "a2ef",
    ""
  ],
  [
    "a2fd",
    ""
  ],
  [
    "a340",
    "",
    62
  ],
  [
    "a380",
    "",
    31,
    "　"
  ],
  [
    "a440",
    "",
    62
  ],
  [
    "a480",
    "",
    32
  ],
  [
    "a4f4",
    "",
    10
  ],
  [
    "a540",
    "",
    62
  ],
  [
    "a580",
    "",
    32
  ],
  [
    "a5f7",
    "",
    7
  ],
  [
    "a640",
    "",
    62
  ],
  [
    "a680",
    "",
    32
  ],
  [
    "a6b9",
    "",
    7
  ],
  [
    "a6d9",
    "",
    6
  ],
  [
    "a6ec",
    ""
  ],
  [
    "a6f3",
    ""
  ],
  [
    "a6f6",
    "",
    8
  ],
  [
    "a740",
    "",
    62
  ],
  [
    "a780",
    "",
    32
  ],
  [
    "a7c2",
    "",
    14
  ],
  [
    "a7f2",
    "",
    12
  ],
  [
    "a896",
    "",
    10
  ],
  [
    "a8bc",
    "ḿ"
  ],
  [
    "a8bf",
    "ǹ"
  ],
  [
    "a8c1",
    ""
  ],
  [
    "a8ea",
    "",
    20
  ],
  [
    "a958",
    ""
  ],
  [
    "a95b",
    ""
  ],
  [
    "a95d",
    ""
  ],
  [
    "a989",
    "〾⿰",
    11
  ],
  [
    "a997",
    "",
    12
  ],
  [
    "a9f0",
    "",
    14
  ],
  [
    "aaa1",
    "",
    93
  ],
  [
    "aba1",
    "",
    93
  ],
  [
    "aca1",
    "",
    93
  ],
  [
    "ada1",
    "",
    93
  ],
  [
    "aea1",
    "",
    93
  ],
  [
    "afa1",
    "",
    93
  ],
  [
    "d7fa",
    "",
    4
  ],
  [
    "f8a1",
    "",
    93
  ],
  [
    "f9a1",
    "",
    93
  ],
  [
    "faa1",
    "",
    93
  ],
  [
    "fba1",
    "",
    93
  ],
  [
    "fca1",
    "",
    93
  ],
  [
    "fda1",
    "",
    93
  ],
  [
    "fe50",
    "⺁⺄㑳㑇⺈⺋㖞㘚㘎⺌⺗㥮㤘㧏㧟㩳㧐㭎㱮㳠⺧⺪䁖䅟⺮䌷⺳⺶⺷䎱䎬⺻䏝䓖䙡䙌"
  ],
  [
    "fe80",
    "䜣䜩䝼䞍⻊䥇䥺䥽䦂䦃䦅䦆䦟䦛䦷䦶䲣䲟䲠䲡䱷䲢䴓",
    6,
    "䶮",
    93
  ],
  [
    "8135f437",
    ""
  ]
], Zp = [
  128,
  165,
  169,
  178,
  184,
  216,
  226,
  235,
  238,
  244,
  248,
  251,
  253,
  258,
  276,
  284,
  300,
  325,
  329,
  334,
  364,
  463,
  465,
  467,
  469,
  471,
  473,
  475,
  477,
  506,
  594,
  610,
  712,
  716,
  730,
  930,
  938,
  962,
  970,
  1026,
  1104,
  1106,
  8209,
  8215,
  8218,
  8222,
  8231,
  8241,
  8244,
  8246,
  8252,
  8365,
  8452,
  8454,
  8458,
  8471,
  8482,
  8556,
  8570,
  8596,
  8602,
  8713,
  8720,
  8722,
  8726,
  8731,
  8737,
  8740,
  8742,
  8748,
  8751,
  8760,
  8766,
  8777,
  8781,
  8787,
  8802,
  8808,
  8816,
  8854,
  8858,
  8870,
  8896,
  8979,
  9322,
  9372,
  9548,
  9588,
  9616,
  9622,
  9634,
  9652,
  9662,
  9672,
  9676,
  9680,
  9702,
  9735,
  9738,
  9793,
  9795,
  11906,
  11909,
  11913,
  11917,
  11928,
  11944,
  11947,
  11951,
  11956,
  11960,
  11964,
  11979,
  12284,
  12292,
  12312,
  12319,
  12330,
  12351,
  12436,
  12447,
  12535,
  12543,
  12586,
  12842,
  12850,
  12964,
  13200,
  13215,
  13218,
  13253,
  13263,
  13267,
  13270,
  13384,
  13428,
  13727,
  13839,
  13851,
  14617,
  14703,
  14801,
  14816,
  14964,
  15183,
  15471,
  15585,
  16471,
  16736,
  17208,
  17325,
  17330,
  17374,
  17623,
  17997,
  18018,
  18212,
  18218,
  18301,
  18318,
  18760,
  18811,
  18814,
  18820,
  18823,
  18844,
  18848,
  18872,
  19576,
  19620,
  19738,
  19887,
  40870,
  59244,
  59336,
  59367,
  59413,
  59417,
  59423,
  59431,
  59437,
  59443,
  59452,
  59460,
  59478,
  59493,
  63789,
  63866,
  63894,
  63976,
  63986,
  64016,
  64018,
  64021,
  64025,
  64034,
  64037,
  64042,
  65074,
  65093,
  65107,
  65112,
  65127,
  65132,
  65375,
  65510,
  65536
], Qp = [
  0,
  36,
  38,
  45,
  50,
  81,
  89,
  95,
  96,
  100,
  103,
  104,
  105,
  109,
  126,
  133,
  148,
  172,
  175,
  179,
  208,
  306,
  307,
  308,
  309,
  310,
  311,
  312,
  313,
  341,
  428,
  443,
  544,
  545,
  558,
  741,
  742,
  749,
  750,
  805,
  819,
  820,
  7922,
  7924,
  7925,
  7927,
  7934,
  7943,
  7944,
  7945,
  7950,
  8062,
  8148,
  8149,
  8152,
  8164,
  8174,
  8236,
  8240,
  8262,
  8264,
  8374,
  8380,
  8381,
  8384,
  8388,
  8390,
  8392,
  8393,
  8394,
  8396,
  8401,
  8406,
  8416,
  8419,
  8424,
  8437,
  8439,
  8445,
  8482,
  8485,
  8496,
  8521,
  8603,
  8936,
  8946,
  9046,
  9050,
  9063,
  9066,
  9076,
  9092,
  9100,
  9108,
  9111,
  9113,
  9131,
  9162,
  9164,
  9218,
  9219,
  11329,
  11331,
  11334,
  11336,
  11346,
  11361,
  11363,
  11366,
  11370,
  11372,
  11375,
  11389,
  11682,
  11686,
  11687,
  11692,
  11694,
  11714,
  11716,
  11723,
  11725,
  11730,
  11736,
  11982,
  11989,
  12102,
  12336,
  12348,
  12350,
  12384,
  12393,
  12395,
  12397,
  12510,
  12553,
  12851,
  12962,
  12973,
  13738,
  13823,
  13919,
  13933,
  14080,
  14298,
  14585,
  14698,
  15583,
  15847,
  16318,
  16434,
  16438,
  16481,
  16729,
  17102,
  17122,
  17315,
  17320,
  17402,
  17418,
  17859,
  17909,
  17911,
  17915,
  17916,
  17936,
  17939,
  17961,
  18664,
  18703,
  18814,
  18962,
  19043,
  33469,
  33470,
  33471,
  33484,
  33485,
  33490,
  33497,
  33501,
  33505,
  33513,
  33520,
  33536,
  33550,
  37845,
  37921,
  37948,
  38029,
  38038,
  38064,
  38065,
  38066,
  38069,
  38075,
  38076,
  38078,
  39108,
  39109,
  39113,
  39114,
  39115,
  39116,
  39265,
  39394,
  189e3
], e_ = {
  uChars: Zp,
  gbChars: Qp
}, t_ = [
  [
    "0",
    "\0",
    127
  ],
  [
    "8141",
    "갂갃갅갆갋",
    4,
    "갘갞갟갡갢갣갥",
    6,
    "갮갲갳갴"
  ],
  [
    "8161",
    "갵갶갷갺갻갽갾갿걁",
    9,
    "걌걎",
    5,
    "걕"
  ],
  [
    "8181",
    "걖걗걙걚걛걝",
    18,
    "걲걳걵걶걹걻",
    4,
    "겂겇겈겍겎겏겑겒겓겕",
    6,
    "겞겢",
    5,
    "겫겭겮겱",
    6,
    "겺겾겿곀곂곃곅곆곇곉곊곋곍",
    7,
    "곖곘",
    7,
    "곢곣곥곦곩곫곭곮곲곴곷",
    4,
    "곾곿괁괂괃괅괇",
    4,
    "괎괐괒괓"
  ],
  [
    "8241",
    "괔괕괖괗괙괚괛괝괞괟괡",
    7,
    "괪괫괮",
    5
  ],
  [
    "8261",
    "괶괷괹괺괻괽",
    6,
    "굆굈굊",
    5,
    "굑굒굓굕굖굗"
  ],
  [
    "8281",
    "굙",
    7,
    "굢굤",
    7,
    "굮굯굱굲굷굸굹굺굾궀궃",
    4,
    "궊궋궍궎궏궑",
    10,
    "궞",
    5,
    "궥",
    17,
    "궸",
    7,
    "귂귃귅귆귇귉",
    6,
    "귒귔",
    7,
    "귝귞귟귡귢귣귥",
    18
  ],
  [
    "8341",
    "귺귻귽귾긂",
    5,
    "긊긌긎",
    5,
    "긕",
    7
  ],
  [
    "8361",
    "긝",
    18,
    "긲긳긵긶긹긻긼"
  ],
  [
    "8381",
    "긽긾긿깂깄깇깈깉깋깏깑깒깓깕깗",
    4,
    "깞깢깣깤깦깧깪깫깭깮깯깱",
    6,
    "깺깾",
    5,
    "꺆",
    5,
    "꺍",
    46,
    "꺿껁껂껃껅",
    6,
    "껎껒",
    5,
    "껚껛껝",
    8
  ],
  [
    "8441",
    "껦껧껩껪껬껮",
    5,
    "껵껶껷껹껺껻껽",
    8
  ],
  [
    "8461",
    "꼆꼉꼊꼋꼌꼎꼏꼑",
    18
  ],
  [
    "8481",
    "꼤",
    7,
    "꼮꼯꼱꼳꼵",
    6,
    "꼾꽀꽄꽅꽆꽇꽊",
    5,
    "꽑",
    10,
    "꽞",
    5,
    "꽦",
    18,
    "꽺",
    5,
    "꾁꾂꾃꾅꾆꾇꾉",
    6,
    "꾒꾓꾔꾖",
    5,
    "꾝",
    26,
    "꾺꾻꾽꾾"
  ],
  [
    "8541",
    "꾿꿁",
    5,
    "꿊꿌꿏",
    4,
    "꿕",
    6,
    "꿝",
    4
  ],
  [
    "8561",
    "꿢",
    5,
    "꿪",
    5,
    "꿲꿳꿵꿶꿷꿹",
    6,
    "뀂뀃"
  ],
  [
    "8581",
    "뀅",
    6,
    "뀍뀎뀏뀑뀒뀓뀕",
    6,
    "뀞",
    9,
    "뀩",
    26,
    "끆끇끉끋끍끏끐끑끒끖끘끚끛끜끞",
    29,
    "끾끿낁낂낃낅",
    6,
    "낎낐낒",
    5,
    "낛낝낞낣낤"
  ],
  [
    "8641",
    "낥낦낧낪낰낲낶낷낹낺낻낽",
    6,
    "냆냊",
    5,
    "냒"
  ],
  [
    "8661",
    "냓냕냖냗냙",
    6,
    "냡냢냣냤냦",
    10
  ],
  [
    "8681",
    "냱",
    22,
    "넊넍넎넏넑넔넕넖넗넚넞",
    4,
    "넦넧넩넪넫넭",
    6,
    "넶넺",
    5,
    "녂녃녅녆녇녉",
    6,
    "녒녓녖녗녙녚녛녝녞녟녡",
    22,
    "녺녻녽녾녿놁놃",
    4,
    "놊놌놎놏놐놑놕놖놗놙놚놛놝"
  ],
  [
    "8741",
    "놞",
    9,
    "놩",
    15
  ],
  [
    "8761",
    "놹",
    18,
    "뇍뇎뇏뇑뇒뇓뇕"
  ],
  [
    "8781",
    "뇖",
    5,
    "뇞뇠",
    7,
    "뇪뇫뇭뇮뇯뇱",
    7,
    "뇺뇼뇾",
    5,
    "눆눇눉눊눍",
    6,
    "눖눘눚",
    5,
    "눡",
    18,
    "눵",
    6,
    "눽",
    26,
    "뉙뉚뉛뉝뉞뉟뉡",
    6,
    "뉪",
    4
  ],
  [
    "8841",
    "뉯",
    4,
    "뉶",
    5,
    "뉽",
    6,
    "늆늇늈늊",
    4
  ],
  [
    "8861",
    "늏늒늓늕늖늗늛",
    4,
    "늢늤늧늨늩늫늭늮늯늱늲늳늵늶늷"
  ],
  [
    "8881",
    "늸",
    15,
    "닊닋닍닎닏닑닓",
    4,
    "닚닜닞닟닠닡닣닧닩닪닰닱닲닶닼닽닾댂댃댅댆댇댉",
    6,
    "댒댖",
    5,
    "댝",
    54,
    "덗덙덚덝덠덡덢덣"
  ],
  [
    "8941",
    "덦덨덪덬덭덯덲덳덵덶덷덹",
    6,
    "뎂뎆",
    5,
    "뎍"
  ],
  [
    "8961",
    "뎎뎏뎑뎒뎓뎕",
    10,
    "뎢",
    5,
    "뎩뎪뎫뎭"
  ],
  [
    "8981",
    "뎮",
    21,
    "돆돇돉돊돍돏돑돒돓돖돘돚돜돞돟돡돢돣돥돦돧돩",
    18,
    "돽",
    18,
    "됑",
    6,
    "됙됚됛됝됞됟됡",
    6,
    "됪됬",
    7,
    "됵",
    15
  ],
  [
    "8a41",
    "둅",
    10,
    "둒둓둕둖둗둙",
    6,
    "둢둤둦"
  ],
  [
    "8a61",
    "둧",
    4,
    "둭",
    18,
    "뒁뒂"
  ],
  [
    "8a81",
    "뒃",
    4,
    "뒉",
    19,
    "뒞",
    5,
    "뒥뒦뒧뒩뒪뒫뒭",
    7,
    "뒶뒸뒺",
    5,
    "듁듂듃듅듆듇듉",
    6,
    "듑듒듓듔듖",
    5,
    "듞듟듡듢듥듧",
    4,
    "듮듰듲",
    5,
    "듹",
    26,
    "딖딗딙딚딝"
  ],
  [
    "8b41",
    "딞",
    5,
    "딦딫",
    4,
    "딲딳딵딶딷딹",
    6,
    "땂땆"
  ],
  [
    "8b61",
    "땇땈땉땊땎땏땑땒땓땕",
    6,
    "땞땢",
    8
  ],
  [
    "8b81",
    "땫",
    52,
    "떢떣떥떦떧떩떬떭떮떯떲떶",
    4,
    "떾떿뗁뗂뗃뗅",
    6,
    "뗎뗒",
    5,
    "뗙",
    18,
    "뗭",
    18
  ],
  [
    "8c41",
    "똀",
    15,
    "똒똓똕똖똗똙",
    4
  ],
  [
    "8c61",
    "똞",
    6,
    "똦",
    5,
    "똭",
    6,
    "똵",
    5
  ],
  [
    "8c81",
    "똻",
    12,
    "뙉",
    26,
    "뙥뙦뙧뙩",
    50,
    "뚞뚟뚡뚢뚣뚥",
    5,
    "뚭뚮뚯뚰뚲",
    16
  ],
  [
    "8d41",
    "뛃",
    16,
    "뛕",
    8
  ],
  [
    "8d61",
    "뛞",
    17,
    "뛱뛲뛳뛵뛶뛷뛹뛺"
  ],
  [
    "8d81",
    "뛻",
    4,
    "뜂뜃뜄뜆",
    33,
    "뜪뜫뜭뜮뜱",
    6,
    "뜺뜼",
    7,
    "띅띆띇띉띊띋띍",
    6,
    "띖",
    9,
    "띡띢띣띥띦띧띩",
    6,
    "띲띴띶",
    5,
    "띾띿랁랂랃랅",
    6,
    "랎랓랔랕랚랛랝랞"
  ],
  [
    "8e41",
    "랟랡",
    6,
    "랪랮",
    5,
    "랶랷랹",
    8
  ],
  [
    "8e61",
    "럂",
    4,
    "럈럊",
    19
  ],
  [
    "8e81",
    "럞",
    13,
    "럮럯럱럲럳럵",
    6,
    "럾렂",
    4,
    "렊렋렍렎렏렑",
    6,
    "렚렜렞",
    5,
    "렦렧렩렪렫렭",
    6,
    "렶렺",
    5,
    "롁롂롃롅",
    11,
    "롒롔",
    7,
    "롞롟롡롢롣롥",
    6,
    "롮롰롲",
    5,
    "롹롺롻롽",
    7
  ],
  [
    "8f41",
    "뢅",
    7,
    "뢎",
    17
  ],
  [
    "8f61",
    "뢠",
    7,
    "뢩",
    6,
    "뢱뢲뢳뢵뢶뢷뢹",
    4
  ],
  [
    "8f81",
    "뢾뢿룂룄룆",
    5,
    "룍룎룏룑룒룓룕",
    7,
    "룞룠룢",
    5,
    "룪룫룭룮룯룱",
    6,
    "룺룼룾",
    5,
    "뤅",
    18,
    "뤙",
    6,
    "뤡",
    26,
    "뤾뤿륁륂륃륅",
    6,
    "륍륎륐륒",
    5
  ],
  [
    "9041",
    "륚륛륝륞륟륡",
    6,
    "륪륬륮",
    5,
    "륶륷륹륺륻륽"
  ],
  [
    "9061",
    "륾",
    5,
    "릆릈릋릌릏",
    15
  ],
  [
    "9081",
    "릟",
    12,
    "릮릯릱릲릳릵",
    6,
    "릾맀맂",
    5,
    "맊맋맍맓",
    4,
    "맚맜맟맠맢맦맧맩맪맫맭",
    6,
    "맶맻",
    4,
    "먂",
    5,
    "먉",
    11,
    "먖",
    33,
    "먺먻먽먾먿멁멃멄멅멆"
  ],
  [
    "9141",
    "멇멊멌멏멐멑멒멖멗멙멚멛멝",
    6,
    "멦멪",
    5
  ],
  [
    "9161",
    "멲멳멵멶멷멹",
    9,
    "몆몈몉몊몋몍",
    5
  ],
  [
    "9181",
    "몓",
    20,
    "몪몭몮몯몱몳",
    4,
    "몺몼몾",
    5,
    "뫅뫆뫇뫉",
    14,
    "뫚",
    33,
    "뫽뫾뫿묁묂묃묅",
    7,
    "묎묐묒",
    5,
    "묙묚묛묝묞묟묡",
    6
  ],
  [
    "9241",
    "묨묪묬",
    7,
    "묷묹묺묿",
    4,
    "뭆뭈뭊뭋뭌뭎뭑뭒"
  ],
  [
    "9261",
    "뭓뭕뭖뭗뭙",
    7,
    "뭢뭤",
    7,
    "뭭",
    4
  ],
  [
    "9281",
    "뭲",
    21,
    "뮉뮊뮋뮍뮎뮏뮑",
    18,
    "뮥뮦뮧뮩뮪뮫뮭",
    6,
    "뮵뮶뮸",
    7,
    "믁믂믃믅믆믇믉",
    6,
    "믑믒믔",
    35,
    "믺믻믽믾밁"
  ],
  [
    "9341",
    "밃",
    4,
    "밊밎밐밒밓밙밚밠밡밢밣밦밨밪밫밬밮밯밲밳밵"
  ],
  [
    "9361",
    "밶밷밹",
    6,
    "뱂뱆뱇뱈뱊뱋뱎뱏뱑",
    8
  ],
  [
    "9381",
    "뱚뱛뱜뱞",
    37,
    "벆벇벉벊벍벏",
    4,
    "벖벘벛",
    4,
    "벢벣벥벦벩",
    6,
    "벲벶",
    5,
    "벾벿볁볂볃볅",
    7,
    "볎볒볓볔볖볗볙볚볛볝",
    22,
    "볷볹볺볻볽"
  ],
  [
    "9441",
    "볾",
    5,
    "봆봈봊",
    5,
    "봑봒봓봕",
    8
  ],
  [
    "9461",
    "봞",
    5,
    "봥",
    6,
    "봭",
    12
  ],
  [
    "9481",
    "봺",
    5,
    "뵁",
    6,
    "뵊뵋뵍뵎뵏뵑",
    6,
    "뵚",
    9,
    "뵥뵦뵧뵩",
    22,
    "붂붃붅붆붋",
    4,
    "붒붔붖붗붘붛붝",
    6,
    "붥",
    10,
    "붱",
    6,
    "붹",
    24
  ],
  [
    "9541",
    "뷒뷓뷖뷗뷙뷚뷛뷝",
    11,
    "뷪",
    5,
    "뷱"
  ],
  [
    "9561",
    "뷲뷳뷵뷶뷷뷹",
    6,
    "븁븂븄븆",
    5,
    "븎븏븑븒븓"
  ],
  [
    "9581",
    "븕",
    6,
    "븞븠",
    35,
    "빆빇빉빊빋빍빏",
    4,
    "빖빘빜빝빞빟빢빣빥빦빧빩빫",
    4,
    "빲빶",
    4,
    "빾빿뺁뺂뺃뺅",
    6,
    "뺎뺒",
    5,
    "뺚",
    13,
    "뺩",
    14
  ],
  [
    "9641",
    "뺸",
    23,
    "뻒뻓"
  ],
  [
    "9661",
    "뻕뻖뻙",
    6,
    "뻡뻢뻦",
    5,
    "뻭",
    8
  ],
  [
    "9681",
    "뻶",
    10,
    "뼂",
    5,
    "뼊",
    13,
    "뼚뼞",
    33,
    "뽂뽃뽅뽆뽇뽉",
    6,
    "뽒뽓뽔뽖",
    44
  ],
  [
    "9741",
    "뾃",
    16,
    "뾕",
    8
  ],
  [
    "9761",
    "뾞",
    17,
    "뾱",
    7
  ],
  [
    "9781",
    "뾹",
    11,
    "뿆",
    5,
    "뿎뿏뿑뿒뿓뿕",
    6,
    "뿝뿞뿠뿢",
    89,
    "쀽쀾쀿"
  ],
  [
    "9841",
    "쁀",
    16,
    "쁒",
    5,
    "쁙쁚쁛"
  ],
  [
    "9861",
    "쁝쁞쁟쁡",
    6,
    "쁪",
    15
  ],
  [
    "9881",
    "쁺",
    21,
    "삒삓삕삖삗삙",
    6,
    "삢삤삦",
    5,
    "삮삱삲삷",
    4,
    "삾샂샃샄샆샇샊샋샍샎샏샑",
    6,
    "샚샞",
    5,
    "샦샧샩샪샫샭",
    6,
    "샶샸샺",
    5,
    "섁섂섃섅섆섇섉",
    6,
    "섑섒섓섔섖",
    5,
    "섡섢섥섨섩섪섫섮"
  ],
  [
    "9941",
    "섲섳섴섵섷섺섻섽섾섿셁",
    6,
    "셊셎",
    5,
    "셖셗"
  ],
  [
    "9961",
    "셙셚셛셝",
    6,
    "셦셪",
    5,
    "셱셲셳셵셶셷셹셺셻"
  ],
  [
    "9981",
    "셼",
    8,
    "솆",
    5,
    "솏솑솒솓솕솗",
    4,
    "솞솠솢솣솤솦솧솪솫솭솮솯솱",
    11,
    "솾",
    5,
    "쇅쇆쇇쇉쇊쇋쇍",
    6,
    "쇕쇖쇙",
    6,
    "쇡쇢쇣쇥쇦쇧쇩",
    6,
    "쇲쇴",
    7,
    "쇾쇿숁숂숃숅",
    6,
    "숎숐숒",
    5,
    "숚숛숝숞숡숢숣"
  ],
  [
    "9a41",
    "숤숥숦숧숪숬숮숰숳숵",
    16
  ],
  [
    "9a61",
    "쉆쉇쉉",
    6,
    "쉒쉓쉕쉖쉗쉙",
    6,
    "쉡쉢쉣쉤쉦"
  ],
  [
    "9a81",
    "쉧",
    4,
    "쉮쉯쉱쉲쉳쉵",
    6,
    "쉾슀슂",
    5,
    "슊",
    5,
    "슑",
    6,
    "슙슚슜슞",
    5,
    "슦슧슩슪슫슮",
    5,
    "슶슸슺",
    33,
    "싞싟싡싢싥",
    5,
    "싮싰싲싳싴싵싷싺싽싾싿쌁",
    6,
    "쌊쌋쌎쌏"
  ],
  [
    "9b41",
    "쌐쌑쌒쌖쌗쌙쌚쌛쌝",
    6,
    "쌦쌧쌪",
    8
  ],
  [
    "9b61",
    "쌳",
    17,
    "썆",
    7
  ],
  [
    "9b81",
    "썎",
    25,
    "썪썫썭썮썯썱썳",
    4,
    "썺썻썾",
    5,
    "쎅쎆쎇쎉쎊쎋쎍",
    50,
    "쏁",
    22,
    "쏚"
  ],
  [
    "9c41",
    "쏛쏝쏞쏡쏣",
    4,
    "쏪쏫쏬쏮",
    5,
    "쏶쏷쏹",
    5
  ],
  [
    "9c61",
    "쏿",
    8,
    "쐉",
    6,
    "쐑",
    9
  ],
  [
    "9c81",
    "쐛",
    8,
    "쐥",
    6,
    "쐭쐮쐯쐱쐲쐳쐵",
    6,
    "쐾",
    9,
    "쑉",
    26,
    "쑦쑧쑩쑪쑫쑭",
    6,
    "쑶쑷쑸쑺",
    5,
    "쒁",
    18,
    "쒕",
    6,
    "쒝",
    12
  ],
  [
    "9d41",
    "쒪",
    13,
    "쒹쒺쒻쒽",
    8
  ],
  [
    "9d61",
    "쓆",
    25
  ],
  [
    "9d81",
    "쓠",
    8,
    "쓪",
    5,
    "쓲쓳쓵쓶쓷쓹쓻쓼쓽쓾씂",
    9,
    "씍씎씏씑씒씓씕",
    6,
    "씝",
    10,
    "씪씫씭씮씯씱",
    6,
    "씺씼씾",
    5,
    "앆앇앋앏앐앑앒앖앚앛앜앟앢앣앥앦앧앩",
    6,
    "앲앶",
    5,
    "앾앿얁얂얃얅얆얈얉얊얋얎얐얒얓얔"
  ],
  [
    "9e41",
    "얖얙얚얛얝얞얟얡",
    7,
    "얪",
    9,
    "얶"
  ],
  [
    "9e61",
    "얷얺얿",
    4,
    "엋엍엏엒엓엕엖엗엙",
    6,
    "엢엤엦엧"
  ],
  [
    "9e81",
    "엨엩엪엫엯엱엲엳엵엸엹엺엻옂옃옄옉옊옋옍옎옏옑",
    6,
    "옚옝",
    6,
    "옦옧옩옪옫옯옱옲옶옸옺옼옽옾옿왂왃왅왆왇왉",
    6,
    "왒왖",
    5,
    "왞왟왡",
    10,
    "왭왮왰왲",
    5,
    "왺왻왽왾왿욁",
    6,
    "욊욌욎",
    5,
    "욖욗욙욚욛욝",
    6,
    "욦"
  ],
  [
    "9f41",
    "욨욪",
    5,
    "욲욳욵욶욷욻",
    4,
    "웂웄웆",
    5,
    "웎"
  ],
  [
    "9f61",
    "웏웑웒웓웕",
    6,
    "웞웟웢",
    5,
    "웪웫웭웮웯웱웲"
  ],
  [
    "9f81",
    "웳",
    4,
    "웺웻웼웾",
    5,
    "윆윇윉윊윋윍",
    6,
    "윖윘윚",
    5,
    "윢윣윥윦윧윩",
    6,
    "윲윴윶윸윹윺윻윾윿읁읂읃읅",
    4,
    "읋읎읐읙읚읛읝읞읟읡",
    6,
    "읩읪읬",
    7,
    "읶읷읹읺읻읿잀잁잂잆잋잌잍잏잒잓잕잙잛",
    4,
    "잢잧",
    4,
    "잮잯잱잲잳잵잶잷"
  ],
  [
    "a041",
    "잸잹잺잻잾쟂",
    5,
    "쟊쟋쟍쟏쟑",
    6,
    "쟙쟚쟛쟜"
  ],
  [
    "a061",
    "쟞",
    5,
    "쟥쟦쟧쟩쟪쟫쟭",
    13
  ],
  [
    "a081",
    "쟻",
    4,
    "젂젃젅젆젇젉젋",
    4,
    "젒젔젗",
    4,
    "젞젟젡젢젣젥",
    6,
    "젮젰젲",
    5,
    "젹젺젻젽젾젿졁",
    6,
    "졊졋졎",
    5,
    "졕",
    26,
    "졲졳졵졶졷졹졻",
    4,
    "좂좄좈좉좊좎",
    5,
    "좕",
    7,
    "좞좠좢좣좤"
  ],
  [
    "a141",
    "좥좦좧좩",
    18,
    "좾좿죀죁"
  ],
  [
    "a161",
    "죂죃죅죆죇죉죊죋죍",
    6,
    "죖죘죚",
    5,
    "죢죣죥"
  ],
  [
    "a181",
    "죦",
    14,
    "죶",
    5,
    "죾죿줁줂줃줇",
    4,
    "줎　、。·‥…¨〃­―∥＼∼‘’“”〔〕〈",
    9,
    "±×÷≠≤≥∞∴°′″℃Å￠￡￥♂♀∠⊥⌒∂∇≡≒§※☆★○●◎◇◆□■△▲▽▼→←↑↓↔〓≪≫√∽∝∵∫∬∈∋⊆⊇⊂⊃∪∩∧∨￢"
  ],
  [
    "a241",
    "줐줒",
    5,
    "줙",
    18
  ],
  [
    "a261",
    "줭",
    6,
    "줵",
    18
  ],
  [
    "a281",
    "쥈",
    7,
    "쥒쥓쥕쥖쥗쥙",
    6,
    "쥢쥤",
    7,
    "쥭쥮쥯⇒⇔∀∃´～ˇ˘˝˚˙¸˛¡¿ː∮∑∏¤℉‰◁◀▷▶♤♠♡♥♧♣⊙◈▣◐◑▒▤▥▨▧▦▩♨☏☎☜☞¶†‡↕↗↙↖↘♭♩♪♬㉿㈜№㏇™㏂㏘℡€®"
  ],
  [
    "a341",
    "쥱쥲쥳쥵",
    6,
    "쥽",
    10,
    "즊즋즍즎즏"
  ],
  [
    "a361",
    "즑",
    6,
    "즚즜즞",
    16
  ],
  [
    "a381",
    "즯",
    16,
    "짂짃짅짆짉짋",
    4,
    "짒짔짗짘짛！",
    58,
    "￦］",
    32,
    "￣"
  ],
  [
    "a441",
    "짞짟짡짣짥짦짨짩짪짫짮짲",
    5,
    "짺짻짽짾짿쨁쨂쨃쨄"
  ],
  [
    "a461",
    "쨅쨆쨇쨊쨎",
    5,
    "쨕쨖쨗쨙",
    12
  ],
  [
    "a481",
    "쨦쨧쨨쨪",
    28,
    "ㄱ",
    93
  ],
  [
    "a541",
    "쩇",
    4,
    "쩎쩏쩑쩒쩓쩕",
    6,
    "쩞쩢",
    5,
    "쩩쩪"
  ],
  [
    "a561",
    "쩫",
    17,
    "쩾",
    5,
    "쪅쪆"
  ],
  [
    "a581",
    "쪇",
    16,
    "쪙",
    14,
    "ⅰ",
    9
  ],
  [
    "a5b0",
    "Ⅰ",
    9
  ],
  [
    "a5c1",
    "Α",
    16,
    "Σ",
    6
  ],
  [
    "a5e1",
    "α",
    16,
    "σ",
    6
  ],
  [
    "a641",
    "쪨",
    19,
    "쪾쪿쫁쫂쫃쫅"
  ],
  [
    "a661",
    "쫆",
    5,
    "쫎쫐쫒쫔쫕쫖쫗쫚",
    5,
    "쫡",
    6
  ],
  [
    "a681",
    "쫨쫩쫪쫫쫭",
    6,
    "쫵",
    18,
    "쬉쬊─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂┒┑┚┙┖┕┎┍┞┟┡┢┦┧┩┪┭┮┱┲┵┶┹┺┽┾╀╁╃",
    7
  ],
  [
    "a741",
    "쬋",
    4,
    "쬑쬒쬓쬕쬖쬗쬙",
    6,
    "쬢",
    7
  ],
  [
    "a761",
    "쬪",
    22,
    "쭂쭃쭄"
  ],
  [
    "a781",
    "쭅쭆쭇쭊쭋쭍쭎쭏쭑",
    6,
    "쭚쭛쭜쭞",
    5,
    "쭥",
    7,
    "㎕㎖㎗ℓ㎘㏄㎣㎤㎥㎦㎙",
    9,
    "㏊㎍㎎㎏㏏㎈㎉㏈㎧㎨㎰",
    9,
    "㎀",
    4,
    "㎺",
    5,
    "㎐",
    4,
    "Ω㏀㏁㎊㎋㎌㏖㏅㎭㎮㎯㏛㎩㎪㎫㎬㏝㏐㏓㏃㏉㏜㏆"
  ],
  [
    "a841",
    "쭭",
    10,
    "쭺",
    14
  ],
  [
    "a861",
    "쮉",
    18,
    "쮝",
    6
  ],
  [
    "a881",
    "쮤",
    19,
    "쮹",
    11,
    "ÆÐªĦ"
  ],
  [
    "a8a6",
    "Ĳ"
  ],
  [
    "a8a8",
    "ĿŁØŒºÞŦŊ"
  ],
  [
    "a8b1",
    "㉠",
    27,
    "ⓐ",
    25,
    "①",
    14,
    "½⅓⅔¼¾⅛⅜⅝⅞"
  ],
  [
    "a941",
    "쯅",
    14,
    "쯕",
    10
  ],
  [
    "a961",
    "쯠쯡쯢쯣쯥쯦쯨쯪",
    18
  ],
  [
    "a981",
    "쯽",
    14,
    "찎찏찑찒찓찕",
    6,
    "찞찟찠찣찤æđðħıĳĸŀłøœßþŧŋŉ㈀",
    27,
    "⒜",
    25,
    "⑴",
    14,
    "¹²³⁴ⁿ₁₂₃₄"
  ],
  [
    "aa41",
    "찥찦찪찫찭찯찱",
    6,
    "찺찿",
    4,
    "챆챇챉챊챋챍챎"
  ],
  [
    "aa61",
    "챏",
    4,
    "챖챚",
    5,
    "챡챢챣챥챧챩",
    6,
    "챱챲"
  ],
  [
    "aa81",
    "챳챴챶",
    29,
    "ぁ",
    82
  ],
  [
    "ab41",
    "첔첕첖첗첚첛첝첞첟첡",
    6,
    "첪첮",
    5,
    "첶첷첹"
  ],
  [
    "ab61",
    "첺첻첽",
    6,
    "쳆쳈쳊",
    5,
    "쳑쳒쳓쳕",
    5
  ],
  [
    "ab81",
    "쳛",
    8,
    "쳥",
    6,
    "쳭쳮쳯쳱",
    12,
    "ァ",
    85
  ],
  [
    "ac41",
    "쳾쳿촀촂",
    5,
    "촊촋촍촎촏촑",
    6,
    "촚촜촞촟촠"
  ],
  [
    "ac61",
    "촡촢촣촥촦촧촩촪촫촭",
    11,
    "촺",
    4
  ],
  [
    "ac81",
    "촿",
    28,
    "쵝쵞쵟А",
    5,
    "ЁЖ",
    25
  ],
  [
    "acd1",
    "а",
    5,
    "ёж",
    25
  ],
  [
    "ad41",
    "쵡쵢쵣쵥",
    6,
    "쵮쵰쵲",
    5,
    "쵹",
    7
  ],
  [
    "ad61",
    "춁",
    6,
    "춉",
    10,
    "춖춗춙춚춛춝춞춟"
  ],
  [
    "ad81",
    "춠춡춢춣춦춨춪",
    5,
    "춱",
    18,
    "췅"
  ],
  [
    "ae41",
    "췆",
    5,
    "췍췎췏췑",
    16
  ],
  [
    "ae61",
    "췢",
    5,
    "췩췪췫췭췮췯췱",
    6,
    "췺췼췾",
    4
  ],
  [
    "ae81",
    "츃츅츆츇츉츊츋츍",
    6,
    "츕츖츗츘츚",
    5,
    "츢츣츥츦츧츩츪츫"
  ],
  [
    "af41",
    "츬츭츮츯츲츴츶",
    19
  ],
  [
    "af61",
    "칊",
    13,
    "칚칛칝칞칢",
    5,
    "칪칬"
  ],
  [
    "af81",
    "칮",
    5,
    "칶칷칹칺칻칽",
    6,
    "캆캈캊",
    5,
    "캒캓캕캖캗캙"
  ],
  [
    "b041",
    "캚",
    5,
    "캢캦",
    5,
    "캮",
    12
  ],
  [
    "b061",
    "캻",
    5,
    "컂",
    19
  ],
  [
    "b081",
    "컖",
    13,
    "컦컧컩컪컭",
    6,
    "컶컺",
    5,
    "가각간갇갈갉갊감",
    7,
    "같",
    4,
    "갠갤갬갭갯갰갱갸갹갼걀걋걍걔걘걜거걱건걷걸걺검겁것겄겅겆겉겊겋게겐겔겜겝겟겠겡겨격겪견겯결겸겹겻겼경곁계곈곌곕곗고곡곤곧골곪곬곯곰곱곳공곶과곽관괄괆"
  ],
  [
    "b141",
    "켂켃켅켆켇켉",
    6,
    "켒켔켖",
    5,
    "켝켞켟켡켢켣"
  ],
  [
    "b161",
    "켥",
    6,
    "켮켲",
    5,
    "켹",
    11
  ],
  [
    "b181",
    "콅",
    14,
    "콖콗콙콚콛콝",
    6,
    "콦콨콪콫콬괌괍괏광괘괜괠괩괬괭괴괵괸괼굄굅굇굉교굔굘굡굣구국군굳굴굵굶굻굼굽굿궁궂궈궉권궐궜궝궤궷귀귁귄귈귐귑귓규균귤그극근귿글긁금급긋긍긔기긱긴긷길긺김깁깃깅깆깊까깍깎깐깔깖깜깝깟깠깡깥깨깩깬깰깸"
  ],
  [
    "b241",
    "콭콮콯콲콳콵콶콷콹",
    6,
    "쾁쾂쾃쾄쾆",
    5,
    "쾍"
  ],
  [
    "b261",
    "쾎",
    18,
    "쾢",
    5,
    "쾩"
  ],
  [
    "b281",
    "쾪",
    5,
    "쾱",
    18,
    "쿅",
    6,
    "깹깻깼깽꺄꺅꺌꺼꺽꺾껀껄껌껍껏껐껑께껙껜껨껫껭껴껸껼꼇꼈꼍꼐꼬꼭꼰꼲꼴꼼꼽꼿꽁꽂꽃꽈꽉꽐꽜꽝꽤꽥꽹꾀꾄꾈꾐꾑꾕꾜꾸꾹꾼꿀꿇꿈꿉꿋꿍꿎꿔꿜꿨꿩꿰꿱꿴꿸뀀뀁뀄뀌뀐뀔뀜뀝뀨끄끅끈끊끌끎끓끔끕끗끙"
  ],
  [
    "b341",
    "쿌",
    19,
    "쿢쿣쿥쿦쿧쿩"
  ],
  [
    "b361",
    "쿪",
    5,
    "쿲쿴쿶",
    5,
    "쿽쿾쿿퀁퀂퀃퀅",
    5
  ],
  [
    "b381",
    "퀋",
    5,
    "퀒",
    5,
    "퀙",
    19,
    "끝끼끽낀낄낌낍낏낑나낙낚난낟날낡낢남납낫",
    4,
    "낱낳내낵낸낼냄냅냇냈냉냐냑냔냘냠냥너넉넋넌널넒넓넘넙넛넜넝넣네넥넨넬넴넵넷넸넹녀녁년녈념녑녔녕녘녜녠노녹논놀놂놈놉놋농높놓놔놘놜놨뇌뇐뇔뇜뇝"
  ],
  [
    "b441",
    "퀮",
    5,
    "퀶퀷퀹퀺퀻퀽",
    6,
    "큆큈큊",
    5
  ],
  [
    "b461",
    "큑큒큓큕큖큗큙",
    6,
    "큡",
    10,
    "큮큯"
  ],
  [
    "b481",
    "큱큲큳큵",
    6,
    "큾큿킀킂",
    18,
    "뇟뇨뇩뇬뇰뇹뇻뇽누눅눈눋눌눔눕눗눙눠눴눼뉘뉜뉠뉨뉩뉴뉵뉼늄늅늉느늑는늘늙늚늠늡늣능늦늪늬늰늴니닉닌닐닒님닙닛닝닢다닥닦단닫",
    4,
    "닳담답닷",
    4,
    "닿대댁댄댈댐댑댓댔댕댜더덕덖던덛덜덞덟덤덥"
  ],
  [
    "b541",
    "킕",
    14,
    "킦킧킩킪킫킭",
    5
  ],
  [
    "b561",
    "킳킶킸킺",
    5,
    "탂탃탅탆탇탊",
    5,
    "탒탖",
    4
  ],
  [
    "b581",
    "탛탞탟탡탢탣탥",
    6,
    "탮탲",
    5,
    "탹",
    11,
    "덧덩덫덮데덱덴델뎀뎁뎃뎄뎅뎌뎐뎔뎠뎡뎨뎬도독돈돋돌돎돐돔돕돗동돛돝돠돤돨돼됐되된될됨됩됫됴두둑둔둘둠둡둣둥둬뒀뒈뒝뒤뒨뒬뒵뒷뒹듀듄듈듐듕드득든듣들듦듬듭듯등듸디딕딘딛딜딤딥딧딨딩딪따딱딴딸"
  ],
  [
    "b641",
    "턅",
    7,
    "턎",
    17
  ],
  [
    "b661",
    "턠",
    15,
    "턲턳턵턶턷턹턻턼턽턾"
  ],
  [
    "b681",
    "턿텂텆",
    5,
    "텎텏텑텒텓텕",
    6,
    "텞텠텢",
    5,
    "텩텪텫텭땀땁땃땄땅땋때땍땐땔땜땝땟땠땡떠떡떤떨떪떫떰떱떳떴떵떻떼떽뗀뗄뗌뗍뗏뗐뗑뗘뗬또똑똔똘똥똬똴뙈뙤뙨뚜뚝뚠뚤뚫뚬뚱뛔뛰뛴뛸뜀뜁뜅뜨뜩뜬뜯뜰뜸뜹뜻띄띈띌띔띕띠띤띨띰띱띳띵라락란랄람랍랏랐랑랒랖랗"
  ],
  [
    "b741",
    "텮",
    13,
    "텽",
    6,
    "톅톆톇톉톊"
  ],
  [
    "b761",
    "톋",
    20,
    "톢톣톥톦톧"
  ],
  [
    "b781",
    "톩",
    6,
    "톲톴톶톷톸톹톻톽톾톿퇁",
    14,
    "래랙랜랠램랩랫랬랭랴략랸럇량러럭런럴럼럽럿렀렁렇레렉렌렐렘렙렛렝려력련렬렴렵렷렸령례롄롑롓로록론롤롬롭롯롱롸롼뢍뢨뢰뢴뢸룀룁룃룅료룐룔룝룟룡루룩룬룰룸룹룻룽뤄뤘뤠뤼뤽륀륄륌륏륑류륙륜률륨륩"
  ],
  [
    "b841",
    "퇐",
    7,
    "퇙",
    17
  ],
  [
    "b861",
    "퇫",
    8,
    "퇵퇶퇷퇹",
    13
  ],
  [
    "b881",
    "툈툊",
    5,
    "툑",
    24,
    "륫륭르륵른를름릅릇릉릊릍릎리릭린릴림립릿링마막만많",
    4,
    "맘맙맛망맞맡맣매맥맨맬맴맵맷맸맹맺먀먁먈먕머먹먼멀멂멈멉멋멍멎멓메멕멘멜멤멥멧멨멩며멱면멸몃몄명몇몌모목몫몬몰몲몸몹못몽뫄뫈뫘뫙뫼"
  ],
  [
    "b941",
    "툪툫툮툯툱툲툳툵",
    6,
    "툾퉀퉂",
    5,
    "퉉퉊퉋퉌"
  ],
  [
    "b961",
    "퉍",
    14,
    "퉝",
    6,
    "퉥퉦퉧퉨"
  ],
  [
    "b981",
    "퉩",
    22,
    "튂튃튅튆튇튉튊튋튌묀묄묍묏묑묘묜묠묩묫무묵묶문묻물묽묾뭄뭅뭇뭉뭍뭏뭐뭔뭘뭡뭣뭬뮈뮌뮐뮤뮨뮬뮴뮷므믄믈믐믓미믹민믿밀밂밈밉밋밌밍및밑바",
    4,
    "받",
    4,
    "밤밥밧방밭배백밴밸뱀뱁뱃뱄뱅뱉뱌뱍뱐뱝버벅번벋벌벎범법벗"
  ],
  [
    "ba41",
    "튍튎튏튒튓튔튖",
    5,
    "튝튞튟튡튢튣튥",
    6,
    "튭"
  ],
  [
    "ba61",
    "튮튯튰튲",
    5,
    "튺튻튽튾틁틃",
    4,
    "틊틌",
    5
  ],
  [
    "ba81",
    "틒틓틕틖틗틙틚틛틝",
    6,
    "틦",
    9,
    "틲틳틵틶틷틹틺벙벚베벡벤벧벨벰벱벳벴벵벼벽변별볍볏볐병볕볘볜보복볶본볼봄봅봇봉봐봔봤봬뵀뵈뵉뵌뵐뵘뵙뵤뵨부북분붇불붉붊붐붑붓붕붙붚붜붤붰붸뷔뷕뷘뷜뷩뷰뷴뷸븀븃븅브븍븐블븜븝븟비빅빈빌빎빔빕빗빙빚빛빠빡빤"
  ],
  [
    "bb41",
    "틻",
    4,
    "팂팄팆",
    5,
    "팏팑팒팓팕팗",
    4,
    "팞팢팣"
  ],
  [
    "bb61",
    "팤팦팧팪팫팭팮팯팱",
    6,
    "팺팾",
    5,
    "퍆퍇퍈퍉"
  ],
  [
    "bb81",
    "퍊",
    31,
    "빨빪빰빱빳빴빵빻빼빽뺀뺄뺌뺍뺏뺐뺑뺘뺙뺨뻐뻑뻔뻗뻘뻠뻣뻤뻥뻬뼁뼈뼉뼘뼙뼛뼜뼝뽀뽁뽄뽈뽐뽑뽕뾔뾰뿅뿌뿍뿐뿔뿜뿟뿡쀼쁑쁘쁜쁠쁨쁩삐삑삔삘삠삡삣삥사삭삯산삳살삵삶삼삽삿샀상샅새색샌샐샘샙샛샜생샤"
  ],
  [
    "bc41",
    "퍪",
    17,
    "퍾퍿펁펂펃펅펆펇"
  ],
  [
    "bc61",
    "펈펉펊펋펎펒",
    5,
    "펚펛펝펞펟펡",
    6,
    "펪펬펮"
  ],
  [
    "bc81",
    "펯",
    4,
    "펵펶펷펹펺펻펽",
    6,
    "폆폇폊",
    5,
    "폑",
    5,
    "샥샨샬샴샵샷샹섀섄섈섐섕서",
    4,
    "섣설섦섧섬섭섯섰성섶세섹센셀셈셉셋셌셍셔셕션셜셤셥셧셨셩셰셴셸솅소속솎손솔솖솜솝솟송솥솨솩솬솰솽쇄쇈쇌쇔쇗쇘쇠쇤쇨쇰쇱쇳쇼쇽숀숄숌숍숏숑수숙순숟술숨숩숫숭"
  ],
  [
    "bd41",
    "폗폙",
    7,
    "폢폤",
    7,
    "폮폯폱폲폳폵폶폷"
  ],
  [
    "bd61",
    "폸폹폺폻폾퐀퐂",
    5,
    "퐉",
    13
  ],
  [
    "bd81",
    "퐗",
    5,
    "퐞",
    25,
    "숯숱숲숴쉈쉐쉑쉔쉘쉠쉥쉬쉭쉰쉴쉼쉽쉿슁슈슉슐슘슛슝스슥슨슬슭슴습슷승시식신싣실싫심십싯싱싶싸싹싻싼쌀쌈쌉쌌쌍쌓쌔쌕쌘쌜쌤쌥쌨쌩썅써썩썬썰썲썸썹썼썽쎄쎈쎌쏀쏘쏙쏜쏟쏠쏢쏨쏩쏭쏴쏵쏸쐈쐐쐤쐬쐰"
  ],
  [
    "be41",
    "퐸",
    7,
    "푁푂푃푅",
    14
  ],
  [
    "be61",
    "푔",
    7,
    "푝푞푟푡푢푣푥",
    7,
    "푮푰푱푲"
  ],
  [
    "be81",
    "푳",
    4,
    "푺푻푽푾풁풃",
    4,
    "풊풌풎",
    5,
    "풕",
    8,
    "쐴쐼쐽쑈쑤쑥쑨쑬쑴쑵쑹쒀쒔쒜쒸쒼쓩쓰쓱쓴쓸쓺쓿씀씁씌씐씔씜씨씩씬씰씸씹씻씽아악안앉않알앍앎앓암압앗았앙앝앞애액앤앨앰앱앳앴앵야약얀얄얇얌얍얏양얕얗얘얜얠얩어억언얹얻얼얽얾엄",
    6,
    "엌엎"
  ],
  [
    "bf41",
    "풞",
    10,
    "풪",
    14
  ],
  [
    "bf61",
    "풹",
    18,
    "퓍퓎퓏퓑퓒퓓퓕"
  ],
  [
    "bf81",
    "퓖",
    5,
    "퓝퓞퓠",
    7,
    "퓩퓪퓫퓭퓮퓯퓱",
    6,
    "퓹퓺퓼에엑엔엘엠엡엣엥여역엮연열엶엷염",
    5,
    "옅옆옇예옌옐옘옙옛옜오옥온올옭옮옰옳옴옵옷옹옻와왁완왈왐왑왓왔왕왜왝왠왬왯왱외왹왼욀욈욉욋욍요욕욘욜욤욥욧용우욱운울욹욺움웁웃웅워웍원월웜웝웠웡웨"
  ],
  [
    "c041",
    "퓾",
    5,
    "픅픆픇픉픊픋픍",
    6,
    "픖픘",
    5
  ],
  [
    "c061",
    "픞",
    25
  ],
  [
    "c081",
    "픸픹픺픻픾픿핁핂핃핅",
    6,
    "핎핐핒",
    5,
    "핚핛핝핞핟핡핢핣웩웬웰웸웹웽위윅윈윌윔윕윗윙유육윤율윰윱윳융윷으윽은을읊음읍읏응",
    7,
    "읜읠읨읫이익인일읽읾잃임입잇있잉잊잎자작잔잖잗잘잚잠잡잣잤장잦재잭잰잴잼잽잿쟀쟁쟈쟉쟌쟎쟐쟘쟝쟤쟨쟬저적전절젊"
  ],
  [
    "c141",
    "핤핦핧핪핬핮",
    5,
    "핶핷핹핺핻핽",
    6,
    "햆햊햋"
  ],
  [
    "c161",
    "햌햍햎햏햑",
    19,
    "햦햧"
  ],
  [
    "c181",
    "햨",
    31,
    "점접젓정젖제젝젠젤젬젭젯젱져젼졀졈졉졌졍졔조족존졸졺좀좁좃종좆좇좋좌좍좔좝좟좡좨좼좽죄죈죌죔죕죗죙죠죡죤죵주죽준줄줅줆줌줍줏중줘줬줴쥐쥑쥔쥘쥠쥡쥣쥬쥰쥴쥼즈즉즌즐즘즙즛증지직진짇질짊짐집짓"
  ],
  [
    "c241",
    "헊헋헍헎헏헑헓",
    4,
    "헚헜헞",
    5,
    "헦헧헩헪헫헭헮"
  ],
  [
    "c261",
    "헯",
    4,
    "헶헸헺",
    5,
    "혂혃혅혆혇혉",
    6,
    "혒"
  ],
  [
    "c281",
    "혖",
    5,
    "혝혞혟혡혢혣혥",
    7,
    "혮",
    9,
    "혺혻징짖짙짚짜짝짠짢짤짧짬짭짯짰짱째짹짼쨀쨈쨉쨋쨌쨍쨔쨘쨩쩌쩍쩐쩔쩜쩝쩟쩠쩡쩨쩽쪄쪘쪼쪽쫀쫄쫌쫍쫏쫑쫓쫘쫙쫠쫬쫴쬈쬐쬔쬘쬠쬡쭁쭈쭉쭌쭐쭘쭙쭝쭤쭸쭹쮜쮸쯔쯤쯧쯩찌찍찐찔찜찝찡찢찧차착찬찮찰참찹찻"
  ],
  [
    "c341",
    "혽혾혿홁홂홃홄홆홇홊홌홎홏홐홒홓홖홗홙홚홛홝",
    4
  ],
  [
    "c361",
    "홢",
    4,
    "홨홪",
    5,
    "홲홳홵",
    11
  ],
  [
    "c381",
    "횁횂횄횆",
    5,
    "횎횏횑횒횓횕",
    7,
    "횞횠횢",
    5,
    "횩횪찼창찾채책챈챌챔챕챗챘챙챠챤챦챨챰챵처척천철첨첩첫첬청체첵첸첼쳄쳅쳇쳉쳐쳔쳤쳬쳰촁초촉촌촐촘촙촛총촤촨촬촹최쵠쵤쵬쵭쵯쵱쵸춈추축춘출춤춥춧충춰췄췌췐취췬췰췸췹췻췽츄츈츌츔츙츠측츤츨츰츱츳층"
  ],
  [
    "c441",
    "횫횭횮횯횱",
    7,
    "횺횼",
    7,
    "훆훇훉훊훋"
  ],
  [
    "c461",
    "훍훎훏훐훒훓훕훖훘훚",
    5,
    "훡훢훣훥훦훧훩",
    4
  ],
  [
    "c481",
    "훮훯훱훲훳훴훶",
    5,
    "훾훿휁휂휃휅",
    11,
    "휒휓휔치칙친칟칠칡침칩칫칭카칵칸칼캄캅캇캉캐캑캔캘캠캡캣캤캥캬캭컁커컥컨컫컬컴컵컷컸컹케켁켄켈켐켑켓켕켜켠켤켬켭켯켰켱켸코콕콘콜콤콥콧콩콰콱콴콸쾀쾅쾌쾡쾨쾰쿄쿠쿡쿤쿨쿰쿱쿳쿵쿼퀀퀄퀑퀘퀭퀴퀵퀸퀼"
  ],
  [
    "c541",
    "휕휖휗휚휛휝휞휟휡",
    6,
    "휪휬휮",
    5,
    "휶휷휹"
  ],
  [
    "c561",
    "휺휻휽",
    6,
    "흅흆흈흊",
    5,
    "흒흓흕흚",
    4
  ],
  [
    "c581",
    "흟흢흤흦흧흨흪흫흭흮흯흱흲흳흵",
    6,
    "흾흿힀힂",
    5,
    "힊힋큄큅큇큉큐큔큘큠크큭큰클큼큽킁키킥킨킬킴킵킷킹타탁탄탈탉탐탑탓탔탕태택탠탤탬탭탯탰탱탸턍터턱턴털턺텀텁텃텄텅테텍텐텔템텝텟텡텨텬텼톄톈토톡톤톨톰톱톳통톺톼퇀퇘퇴퇸툇툉툐투툭툰툴툼툽툿퉁퉈퉜"
  ],
  [
    "c641",
    "힍힎힏힑",
    6,
    "힚힜힞",
    5
  ],
  [
    "c6a1",
    "퉤튀튁튄튈튐튑튕튜튠튤튬튱트특튼튿틀틂틈틉틋틔틘틜틤틥티틱틴틸팀팁팃팅파팍팎판팔팖팜팝팟팠팡팥패팩팬팰팸팹팻팼팽퍄퍅퍼퍽펀펄펌펍펏펐펑페펙펜펠펨펩펫펭펴편펼폄폅폈평폐폘폡폣포폭폰폴폼폽폿퐁"
  ],
  [
    "c7a1",
    "퐈퐝푀푄표푠푤푭푯푸푹푼푿풀풂품풉풋풍풔풩퓌퓐퓔퓜퓟퓨퓬퓰퓸퓻퓽프픈플픔픕픗피픽핀필핌핍핏핑하학한할핥함합핫항해핵핸핼햄햅햇했행햐향허헉헌헐헒험헙헛헝헤헥헨헬헴헵헷헹혀혁현혈혐협혓혔형혜혠"
  ],
  [
    "c8a1",
    "혤혭호혹혼홀홅홈홉홋홍홑화확환활홧황홰홱홴횃횅회획횐횔횝횟횡효횬횰횹횻후훅훈훌훑훔훗훙훠훤훨훰훵훼훽휀휄휑휘휙휜휠휨휩휫휭휴휵휸휼흄흇흉흐흑흔흖흗흘흙흠흡흣흥흩희흰흴흼흽힁히힉힌힐힘힙힛힝"
  ],
  [
    "caa1",
    "伽佳假價加可呵哥嘉嫁家暇架枷柯歌珂痂稼苛茄街袈訶賈跏軻迦駕刻却各恪慤殼珏脚覺角閣侃刊墾奸姦干幹懇揀杆柬桿澗癎看磵稈竿簡肝艮艱諫間乫喝曷渴碣竭葛褐蝎鞨勘坎堪嵌感憾戡敢柑橄減甘疳監瞰紺邯鑑鑒龕"
  ],
  [
    "cba1",
    "匣岬甲胛鉀閘剛堈姜岡崗康强彊慷江畺疆糠絳綱羌腔舡薑襁講鋼降鱇介价個凱塏愷愾慨改槪漑疥皆盖箇芥蓋豈鎧開喀客坑更粳羹醵倨去居巨拒据據擧渠炬祛距踞車遽鉅鋸乾件健巾建愆楗腱虔蹇鍵騫乞傑杰桀儉劍劒檢"
  ],
  [
    "cca1",
    "瞼鈐黔劫怯迲偈憩揭擊格檄激膈覡隔堅牽犬甄絹繭肩見譴遣鵑抉決潔結缺訣兼慊箝謙鉗鎌京俓倞傾儆勁勍卿坰境庚徑慶憬擎敬景暻更梗涇炅烱璟璥瓊痙硬磬竟競絅經耕耿脛莖警輕逕鏡頃頸驚鯨係啓堺契季屆悸戒桂械"
  ],
  [
    "cda1",
    "棨溪界癸磎稽系繫繼計誡谿階鷄古叩告呱固姑孤尻庫拷攷故敲暠枯槁沽痼皐睾稿羔考股膏苦苽菰藁蠱袴誥賈辜錮雇顧高鼓哭斛曲梏穀谷鵠困坤崑昆梱棍滾琨袞鯤汨滑骨供公共功孔工恐恭拱控攻珙空蚣貢鞏串寡戈果瓜"
  ],
  [
    "cea1",
    "科菓誇課跨過鍋顆廓槨藿郭串冠官寬慣棺款灌琯瓘管罐菅觀貫關館刮恝括适侊光匡壙廣曠洸炚狂珖筐胱鑛卦掛罫乖傀塊壞怪愧拐槐魁宏紘肱轟交僑咬喬嬌嶠巧攪敎校橋狡皎矯絞翹膠蕎蛟較轎郊餃驕鮫丘久九仇俱具勾"
  ],
  [
    "cfa1",
    "區口句咎嘔坵垢寇嶇廐懼拘救枸柩構歐毆毬求溝灸狗玖球瞿矩究絿耉臼舅舊苟衢謳購軀逑邱鉤銶駒驅鳩鷗龜國局菊鞠鞫麴君窘群裙軍郡堀屈掘窟宮弓穹窮芎躬倦券勸卷圈拳捲權淃眷厥獗蕨蹶闕机櫃潰詭軌饋句晷歸貴"
  ],
  [
    "d0a1",
    "鬼龜叫圭奎揆槻珪硅窺竅糾葵規赳逵閨勻均畇筠菌鈞龜橘克剋劇戟棘極隙僅劤勤懃斤根槿瑾筋芹菫覲謹近饉契今妗擒昑檎琴禁禽芩衾衿襟金錦伋及急扱汲級給亘兢矜肯企伎其冀嗜器圻基埼夔奇妓寄岐崎己幾忌技旗旣"
  ],
  [
    "d1a1",
    "朞期杞棋棄機欺氣汽沂淇玘琦琪璂璣畸畿碁磯祁祇祈祺箕紀綺羈耆耭肌記譏豈起錡錤飢饑騎騏驥麒緊佶吉拮桔金喫儺喇奈娜懦懶拏拿癩",
    5,
    "那樂",
    4,
    "諾酪駱亂卵暖欄煖爛蘭難鸞捏捺南嵐枏楠湳濫男藍襤拉"
  ],
  [
    "d2a1",
    "納臘蠟衲囊娘廊",
    4,
    "乃來內奈柰耐冷女年撚秊念恬拈捻寧寗努勞奴弩怒擄櫓爐瑙盧",
    5,
    "駑魯",
    10,
    "濃籠聾膿農惱牢磊腦賂雷尿壘",
    7,
    "嫩訥杻紐勒",
    5,
    "能菱陵尼泥匿溺多茶"
  ],
  [
    "d3a1",
    "丹亶但單團壇彖斷旦檀段湍短端簞緞蛋袒鄲鍛撻澾獺疸達啖坍憺擔曇淡湛潭澹痰聃膽蕁覃談譚錟沓畓答踏遝唐堂塘幢戇撞棠當糖螳黨代垈坮大對岱帶待戴擡玳臺袋貸隊黛宅德悳倒刀到圖堵塗導屠島嶋度徒悼挑掉搗桃"
  ],
  [
    "d4a1",
    "棹櫂淘渡滔濤燾盜睹禱稻萄覩賭跳蹈逃途道都鍍陶韜毒瀆牘犢獨督禿篤纛讀墩惇敦旽暾沌焞燉豚頓乭突仝冬凍動同憧東桐棟洞潼疼瞳童胴董銅兜斗杜枓痘竇荳讀豆逗頭屯臀芚遁遯鈍得嶝橙燈登等藤謄鄧騰喇懶拏癩羅"
  ],
  [
    "d5a1",
    "蘿螺裸邏樂洛烙珞絡落諾酪駱丹亂卵欄欒瀾爛蘭鸞剌辣嵐擥攬欖濫籃纜藍襤覽拉臘蠟廊朗浪狼琅瑯螂郞來崍徠萊冷掠略亮倆兩凉梁樑粮粱糧良諒輛量侶儷勵呂廬慮戾旅櫚濾礪藜蠣閭驢驪麗黎力曆歷瀝礫轢靂憐戀攣漣"
  ],
  [
    "d6a1",
    "煉璉練聯蓮輦連鍊冽列劣洌烈裂廉斂殮濂簾獵令伶囹寧岺嶺怜玲笭羚翎聆逞鈴零靈領齡例澧禮醴隷勞怒撈擄櫓潞瀘爐盧老蘆虜路輅露魯鷺鹵碌祿綠菉錄鹿麓論壟弄朧瀧瓏籠聾儡瀨牢磊賂賚賴雷了僚寮廖料燎療瞭聊蓼"
  ],
  [
    "d7a1",
    "遼鬧龍壘婁屢樓淚漏瘻累縷蔞褸鏤陋劉旒柳榴流溜瀏琉瑠留瘤硫謬類六戮陸侖倫崙淪綸輪律慄栗率隆勒肋凜凌楞稜綾菱陵俚利厘吏唎履悧李梨浬犁狸理璃異痢籬罹羸莉裏裡里釐離鯉吝潾燐璘藺躪隣鱗麟林淋琳臨霖砬"
  ],
  [
    "d8a1",
    "立笠粒摩瑪痲碼磨馬魔麻寞幕漠膜莫邈万卍娩巒彎慢挽晩曼滿漫灣瞞萬蔓蠻輓饅鰻唜抹末沫茉襪靺亡妄忘忙望網罔芒茫莽輞邙埋妹媒寐昧枚梅每煤罵買賣邁魅脈貊陌驀麥孟氓猛盲盟萌冪覓免冕勉棉沔眄眠綿緬面麵滅"
  ],
  [
    "d9a1",
    "蔑冥名命明暝椧溟皿瞑茗蓂螟酩銘鳴袂侮冒募姆帽慕摸摹暮某模母毛牟牡瑁眸矛耗芼茅謀謨貌木沐牧目睦穆鶩歿沒夢朦蒙卯墓妙廟描昴杳渺猫竗苗錨務巫憮懋戊拇撫无楙武毋無珷畝繆舞茂蕪誣貿霧鵡墨默們刎吻問文"
  ],
  [
    "daa1",
    "汶紊紋聞蚊門雯勿沕物味媚尾嵋彌微未梶楣渼湄眉米美薇謎迷靡黴岷悶愍憫敏旻旼民泯玟珉緡閔密蜜謐剝博拍搏撲朴樸泊珀璞箔粕縛膊舶薄迫雹駁伴半反叛拌搬攀斑槃泮潘班畔瘢盤盼磐磻礬絆般蟠返頒飯勃拔撥渤潑"
  ],
  [
    "dba1",
    "發跋醱鉢髮魃倣傍坊妨尨幇彷房放方旁昉枋榜滂磅紡肪膀舫芳蒡蚌訪謗邦防龐倍俳北培徘拜排杯湃焙盃背胚裴裵褙賠輩配陪伯佰帛柏栢白百魄幡樊煩燔番磻繁蕃藩飜伐筏罰閥凡帆梵氾汎泛犯範范法琺僻劈壁擘檗璧癖"
  ],
  [
    "dca1",
    "碧蘗闢霹便卞弁變辨辯邊別瞥鱉鼈丙倂兵屛幷昞昺柄棅炳甁病秉竝輧餠騈保堡報寶普步洑湺潽珤甫菩補褓譜輔伏僕匐卜宓復服福腹茯蔔複覆輹輻馥鰒本乶俸奉封峯峰捧棒烽熢琫縫蓬蜂逢鋒鳳不付俯傅剖副否咐埠夫婦"
  ],
  [
    "dda1",
    "孚孵富府復扶敷斧浮溥父符簿缶腐腑膚艀芙莩訃負賦賻赴趺部釜阜附駙鳧北分吩噴墳奔奮忿憤扮昐汾焚盆粉糞紛芬賁雰不佛弗彿拂崩朋棚硼繃鵬丕備匕匪卑妃婢庇悲憊扉批斐枇榧比毖毗毘沸泌琵痺砒碑秕秘粃緋翡肥"
  ],
  [
    "dea1",
    "脾臂菲蜚裨誹譬費鄙非飛鼻嚬嬪彬斌檳殯浜濱瀕牝玭貧賓頻憑氷聘騁乍事些仕伺似使俟僿史司唆嗣四士奢娑寫寺射巳師徙思捨斜斯柶査梭死沙泗渣瀉獅砂社祀祠私篩紗絲肆舍莎蓑蛇裟詐詞謝賜赦辭邪飼駟麝削數朔索"
  ],
  [
    "dfa1",
    "傘刪山散汕珊産疝算蒜酸霰乷撒殺煞薩三參杉森渗芟蔘衫揷澁鈒颯上傷像償商喪嘗孀尙峠常床庠廂想桑橡湘爽牀狀相祥箱翔裳觴詳象賞霜塞璽賽嗇塞穡索色牲生甥省笙墅壻嶼序庶徐恕抒捿敍暑曙書栖棲犀瑞筮絮緖署"
  ],
  [
    "e0a1",
    "胥舒薯西誓逝鋤黍鼠夕奭席惜昔晳析汐淅潟石碩蓆釋錫仙僊先善嬋宣扇敾旋渲煽琁瑄璇璿癬禪線繕羨腺膳船蘚蟬詵跣選銑鐥饍鮮卨屑楔泄洩渫舌薛褻設說雪齧剡暹殲纖蟾贍閃陝攝涉燮葉城姓宬性惺成星晟猩珹盛省筬"
  ],
  [
    "e1a1",
    "聖聲腥誠醒世勢歲洗稅笹細說貰召嘯塑宵小少巢所掃搔昭梳沼消溯瀟炤燒甦疏疎瘙笑篠簫素紹蔬蕭蘇訴逍遡邵銷韶騷俗屬束涑粟續謖贖速孫巽損蓀遜飡率宋悚松淞訟誦送頌刷殺灑碎鎖衰釗修受嗽囚垂壽嫂守岫峀帥愁"
  ],
  [
    "e2a1",
    "戍手授搜收數樹殊水洙漱燧狩獸琇璲瘦睡秀穗竪粹綏綬繡羞脩茱蒐蓚藪袖誰讐輸遂邃酬銖銹隋隧隨雖需須首髓鬚叔塾夙孰宿淑潚熟琡璹肅菽巡徇循恂旬栒楯橓殉洵淳珣盾瞬筍純脣舜荀蓴蕣詢諄醇錞順馴戌術述鉥崇崧"
  ],
  [
    "e3a1",
    "嵩瑟膝蝨濕拾習褶襲丞乘僧勝升承昇繩蠅陞侍匙嘶始媤尸屎屍市弑恃施是時枾柴猜矢示翅蒔蓍視試詩諡豕豺埴寔式息拭植殖湜熄篒蝕識軾食飾伸侁信呻娠宸愼新晨燼申神紳腎臣莘薪藎蜃訊身辛辰迅失室實悉審尋心沁"
  ],
  [
    "e4a1",
    "沈深瀋甚芯諶什十拾雙氏亞俄兒啞娥峨我牙芽莪蛾衙訝阿雅餓鴉鵝堊岳嶽幄惡愕握樂渥鄂鍔顎鰐齷安岸按晏案眼雁鞍顔鮟斡謁軋閼唵岩巖庵暗癌菴闇壓押狎鴨仰央怏昻殃秧鴦厓哀埃崖愛曖涯碍艾隘靄厄扼掖液縊腋額"
  ],
  [
    "e5a1",
    "櫻罌鶯鸚也倻冶夜惹揶椰爺耶若野弱掠略約若葯蒻藥躍亮佯兩凉壤孃恙揚攘敭暘梁楊樣洋瀁煬痒瘍禳穰糧羊良襄諒讓釀陽量養圄御於漁瘀禦語馭魚齬億憶抑檍臆偃堰彦焉言諺孼蘖俺儼嚴奄掩淹嶪業円予余勵呂女如廬"
  ],
  [
    "e6a1",
    "旅歟汝濾璵礖礪與艅茹輿轝閭餘驪麗黎亦力域役易曆歷疫繹譯轢逆驛嚥堧姸娟宴年延憐戀捐挻撚椽沇沿涎涓淵演漣烟然煙煉燃燕璉硏硯秊筵緣練縯聯衍軟輦蓮連鉛鍊鳶列劣咽悅涅烈熱裂說閱厭廉念捻染殮炎焰琰艶苒"
  ],
  [
    "e7a1",
    "簾閻髥鹽曄獵燁葉令囹塋寧嶺嶸影怜映暎楹榮永泳渶潁濚瀛瀯煐營獰玲瑛瑩瓔盈穎纓羚聆英詠迎鈴鍈零霙靈領乂倪例刈叡曳汭濊猊睿穢芮藝蘂禮裔詣譽豫醴銳隸霓預五伍俉傲午吾吳嗚塢墺奧娛寤悟惡懊敖旿晤梧汚澳"
  ],
  [
    "e8a1",
    "烏熬獒筽蜈誤鰲鼇屋沃獄玉鈺溫瑥瘟穩縕蘊兀壅擁瓮甕癰翁邕雍饔渦瓦窩窪臥蛙蝸訛婉完宛梡椀浣玩琓琬碗緩翫脘腕莞豌阮頑曰往旺枉汪王倭娃歪矮外嵬巍猥畏了僚僥凹堯夭妖姚寥寮尿嶢拗搖撓擾料曜樂橈燎燿瑤療"
  ],
  [
    "e9a1",
    "窈窯繇繞耀腰蓼蟯要謠遙遼邀饒慾欲浴縟褥辱俑傭冗勇埇墉容庸慂榕涌湧溶熔瑢用甬聳茸蓉踊鎔鏞龍于佑偶優又友右宇寓尤愚憂旴牛玗瑀盂祐禑禹紆羽芋藕虞迂遇郵釪隅雨雩勖彧旭昱栯煜稶郁頊云暈橒殞澐熉耘芸蕓"
  ],
  [
    "eaa1",
    "運隕雲韻蔚鬱亐熊雄元原員圓園垣媛嫄寃怨愿援沅洹湲源爰猿瑗苑袁轅遠阮院願鴛月越鉞位偉僞危圍委威尉慰暐渭爲瑋緯胃萎葦蔿蝟衛褘謂違韋魏乳侑儒兪劉唯喩孺宥幼幽庾悠惟愈愉揄攸有杻柔柚柳楡楢油洧流游溜"
  ],
  [
    "eba1",
    "濡猶猷琉瑜由留癒硫紐維臾萸裕誘諛諭踰蹂遊逾遺酉釉鍮類六堉戮毓肉育陸倫允奫尹崙淪潤玧胤贇輪鈗閏律慄栗率聿戎瀜絨融隆垠恩慇殷誾銀隱乙吟淫蔭陰音飮揖泣邑凝應膺鷹依倚儀宜意懿擬椅毅疑矣義艤薏蟻衣誼"
  ],
  [
    "eca1",
    "議醫二以伊利吏夷姨履已弛彛怡易李梨泥爾珥理異痍痢移罹而耳肄苡荑裏裡貽貳邇里離飴餌匿溺瀷益翊翌翼謚人仁刃印吝咽因姻寅引忍湮燐璘絪茵藺蚓認隣靭靷鱗麟一佚佾壹日溢逸鎰馹任壬妊姙恁林淋稔臨荏賃入卄"
  ],
  [
    "eda1",
    "立笠粒仍剩孕芿仔刺咨姉姿子字孜恣慈滋炙煮玆瓷疵磁紫者自茨蔗藉諮資雌作勺嚼斫昨灼炸爵綽芍酌雀鵲孱棧殘潺盞岑暫潛箴簪蠶雜丈仗匠場墻壯奬將帳庄張掌暲杖樟檣欌漿牆狀獐璋章粧腸臟臧莊葬蔣薔藏裝贓醬長"
  ],
  [
    "eea1",
    "障再哉在宰才材栽梓渽滓災縡裁財載齋齎爭箏諍錚佇低儲咀姐底抵杵楮樗沮渚狙猪疽箸紵苧菹著藷詛貯躇這邸雎齟勣吊嫡寂摘敵滴狄炙的積笛籍績翟荻謫賊赤跡蹟迪迹適鏑佃佺傳全典前剪塡塼奠專展廛悛戰栓殿氈澱"
  ],
  [
    "efa1",
    "煎琠田甸畑癲筌箋箭篆纏詮輾轉鈿銓錢鐫電顚顫餞切截折浙癤竊節絶占岾店漸点粘霑鮎點接摺蝶丁井亭停偵呈姃定幀庭廷征情挺政整旌晶晸柾楨檉正汀淀淨渟湞瀞炡玎珽町睛碇禎程穽精綎艇訂諪貞鄭酊釘鉦鋌錠霆靖"
  ],
  [
    "f0a1",
    "靜頂鼎制劑啼堤帝弟悌提梯濟祭第臍薺製諸蹄醍除際霽題齊俎兆凋助嘲弔彫措操早晁曺曹朝條棗槽漕潮照燥爪璪眺祖祚租稠窕粗糟組繰肇藻蚤詔調趙躁造遭釣阻雕鳥族簇足鏃存尊卒拙猝倧宗從悰慫棕淙琮種終綜縱腫"
  ],
  [
    "f1a1",
    "踪踵鍾鐘佐坐左座挫罪主住侏做姝胄呪周嗾奏宙州廚晝朱柱株注洲湊澍炷珠疇籌紂紬綢舟蛛註誅走躊輳週酎酒鑄駐竹粥俊儁准埈寯峻晙樽浚準濬焌畯竣蠢逡遵雋駿茁中仲衆重卽櫛楫汁葺增憎曾拯烝甑症繒蒸證贈之只"
  ],
  [
    "f2a1",
    "咫地址志持指摯支旨智枝枳止池沚漬知砥祉祗紙肢脂至芝芷蜘誌識贄趾遲直稙稷織職唇嗔塵振搢晉晋桭榛殄津溱珍瑨璡畛疹盡眞瞋秦縉縝臻蔯袗診賑軫辰進鎭陣陳震侄叱姪嫉帙桎瓆疾秩窒膣蛭質跌迭斟朕什執潗緝輯"
  ],
  [
    "f3a1",
    "鏶集徵懲澄且侘借叉嗟嵯差次此磋箚茶蹉車遮捉搾着窄錯鑿齪撰澯燦璨瓚竄簒纂粲纘讚贊鑽餐饌刹察擦札紮僭參塹慘慙懺斬站讒讖倉倡創唱娼廠彰愴敞昌昶暢槍滄漲猖瘡窓脹艙菖蒼債埰寀寨彩採砦綵菜蔡采釵冊柵策"
  ],
  [
    "f4a1",
    "責凄妻悽處倜刺剔尺慽戚拓擲斥滌瘠脊蹠陟隻仟千喘天川擅泉淺玔穿舛薦賤踐遷釧闡阡韆凸哲喆徹撤澈綴輟轍鐵僉尖沾添甛瞻簽籤詹諂堞妾帖捷牒疊睫諜貼輒廳晴淸聽菁請靑鯖切剃替涕滯締諦逮遞體初剿哨憔抄招梢"
  ],
  [
    "f5a1",
    "椒楚樵炒焦硝礁礎秒稍肖艸苕草蕉貂超酢醋醮促囑燭矗蜀觸寸忖村邨叢塚寵悤憁摠總聰蔥銃撮催崔最墜抽推椎楸樞湫皺秋芻萩諏趨追鄒酋醜錐錘鎚雛騶鰍丑畜祝竺筑築縮蓄蹙蹴軸逐春椿瑃出朮黜充忠沖蟲衝衷悴膵萃"
  ],
  [
    "f6a1",
    "贅取吹嘴娶就炊翠聚脆臭趣醉驟鷲側仄厠惻測層侈値嗤峙幟恥梔治淄熾痔痴癡稚穉緇緻置致蚩輜雉馳齒則勅飭親七柒漆侵寢枕沈浸琛砧針鍼蟄秤稱快他咤唾墮妥惰打拖朶楕舵陀馱駝倬卓啄坼度托拓擢晫柝濁濯琢琸託"
  ],
  [
    "f7a1",
    "鐸呑嘆坦彈憚歎灘炭綻誕奪脫探眈耽貪塔搭榻宕帑湯糖蕩兌台太怠態殆汰泰笞胎苔跆邰颱宅擇澤撑攄兎吐土討慟桶洞痛筒統通堆槌腿褪退頹偸套妬投透鬪慝特闖坡婆巴把播擺杷波派爬琶破罷芭跛頗判坂板版瓣販辦鈑"
  ],
  [
    "f8a1",
    "阪八叭捌佩唄悖敗沛浿牌狽稗覇貝彭澎烹膨愎便偏扁片篇編翩遍鞭騙貶坪平枰萍評吠嬖幣廢弊斃肺蔽閉陛佈包匍匏咆哺圃布怖抛抱捕暴泡浦疱砲胞脯苞葡蒲袍褒逋鋪飽鮑幅暴曝瀑爆輻俵剽彪慓杓標漂瓢票表豹飇飄驃"
  ],
  [
    "f9a1",
    "品稟楓諷豊風馮彼披疲皮被避陂匹弼必泌珌畢疋筆苾馝乏逼下何厦夏廈昰河瑕荷蝦賀遐霞鰕壑學虐謔鶴寒恨悍旱汗漢澣瀚罕翰閑閒限韓割轄函含咸啣喊檻涵緘艦銜陷鹹合哈盒蛤閤闔陜亢伉姮嫦巷恒抗杭桁沆港缸肛航"
  ],
  [
    "faa1",
    "行降項亥偕咳垓奚孩害懈楷海瀣蟹解該諧邂駭骸劾核倖幸杏荇行享向嚮珦鄕響餉饗香噓墟虛許憲櫶獻軒歇險驗奕爀赫革俔峴弦懸晛泫炫玄玹現眩睍絃絢縣舷衒見賢鉉顯孑穴血頁嫌俠協夾峽挾浹狹脅脇莢鋏頰亨兄刑型"
  ],
  [
    "fba1",
    "形泂滎瀅灐炯熒珩瑩荊螢衡逈邢鎣馨兮彗惠慧暳蕙蹊醯鞋乎互呼壕壺好岵弧戶扈昊晧毫浩淏湖滸澔濠濩灝狐琥瑚瓠皓祜糊縞胡芦葫蒿虎號蝴護豪鎬頀顥惑或酷婚昏混渾琿魂忽惚笏哄弘汞泓洪烘紅虹訌鴻化和嬅樺火畵"
  ],
  [
    "fca1",
    "禍禾花華話譁貨靴廓擴攫確碻穫丸喚奐宦幻患換歡晥桓渙煥環紈還驩鰥活滑猾豁闊凰幌徨恍惶愰慌晃晄榥況湟滉潢煌璜皇篁簧荒蝗遑隍黃匯回廻徊恢悔懷晦會檜淮澮灰獪繪膾茴蛔誨賄劃獲宖橫鐄哮嚆孝效斅曉梟涍淆"
  ],
  [
    "fda1",
    "爻肴酵驍侯候厚后吼喉嗅帿後朽煦珝逅勛勳塤壎焄熏燻薰訓暈薨喧暄煊萱卉喙毁彙徽揮暉煇諱輝麾休携烋畦虧恤譎鷸兇凶匈洶胸黑昕欣炘痕吃屹紇訖欠欽歆吸恰洽翕興僖凞喜噫囍姬嬉希憙憘戱晞曦熙熹熺犧禧稀羲詰"
  ]
], Sl = [
  [
    "0",
    "\0",
    127
  ],
  [
    "a140",
    "　，、。．‧；：？！︰…‥﹐﹑﹒·﹔﹕﹖﹗｜–︱—︳╴︴﹏（）︵︶｛｝︷︸〔〕︹︺【】︻︼《》︽︾〈〉︿﹀「」﹁﹂『』﹃﹄﹙﹚"
  ],
  [
    "a1a1",
    "﹛﹜﹝﹞‘’“”〝〞‵′＃＆＊※§〃○●△▲◎☆★◇◆□■▽▼㊣℅¯￣＿ˍ﹉﹊﹍﹎﹋﹌﹟﹠﹡＋－×÷±√＜＞＝≦≧≠∞≒≡﹢",
    4,
    "～∩∪⊥∠∟⊿㏒㏑∫∮∵∴♀♂⊕⊙↑↓←→↖↗↙↘∥∣／"
  ],
  [
    "a240",
    "＼∕﹨＄￥〒￠￡％＠℃℉﹩﹪﹫㏕㎜㎝㎞㏎㎡㎎㎏㏄°兙兛兞兝兡兣嗧瓩糎▁",
    7,
    "▏▎▍▌▋▊▉┼┴┬┤├▔─│▕┌┐└┘╭"
  ],
  [
    "a2a1",
    "╮╰╯═╞╪╡◢◣◥◤╱╲╳０",
    9,
    "Ⅰ",
    9,
    "〡",
    8,
    "十卄卅Ａ",
    25,
    "ａ",
    21
  ],
  [
    "a340",
    "ｗｘｙｚΑ",
    16,
    "Σ",
    6,
    "α",
    16,
    "σ",
    6,
    "ㄅ",
    10
  ],
  [
    "a3a1",
    "ㄐ",
    25,
    "˙ˉˊˇˋ"
  ],
  [
    "a3e1",
    "€"
  ],
  [
    "a440",
    "一乙丁七乃九了二人儿入八几刀刁力匕十卜又三下丈上丫丸凡久么也乞于亡兀刃勺千叉口土士夕大女子孑孓寸小尢尸山川工己已巳巾干廾弋弓才"
  ],
  [
    "a4a1",
    "丑丐不中丰丹之尹予云井互五亢仁什仃仆仇仍今介仄元允內六兮公冗凶分切刈勻勾勿化匹午升卅卞厄友及反壬天夫太夭孔少尤尺屯巴幻廿弔引心戈戶手扎支文斗斤方日曰月木欠止歹毋比毛氏水火爪父爻片牙牛犬王丙"
  ],
  [
    "a540",
    "世丕且丘主乍乏乎以付仔仕他仗代令仙仞充兄冉冊冬凹出凸刊加功包匆北匝仟半卉卡占卯卮去可古右召叮叩叨叼司叵叫另只史叱台句叭叻四囚外"
  ],
  [
    "a5a1",
    "央失奴奶孕它尼巨巧左市布平幼弁弘弗必戊打扔扒扑斥旦朮本未末札正母民氐永汁汀氾犯玄玉瓜瓦甘生用甩田由甲申疋白皮皿目矛矢石示禾穴立丞丟乒乓乩亙交亦亥仿伉伙伊伕伍伐休伏仲件任仰仳份企伋光兇兆先全"
  ],
  [
    "a640",
    "共再冰列刑划刎刖劣匈匡匠印危吉吏同吊吐吁吋各向名合吃后吆吒因回囝圳地在圭圬圯圩夙多夷夸妄奸妃好她如妁字存宇守宅安寺尖屹州帆并年"
  ],
  [
    "a6a1",
    "式弛忙忖戎戌戍成扣扛托收早旨旬旭曲曳有朽朴朱朵次此死氖汝汗汙江池汐汕污汛汍汎灰牟牝百竹米糸缶羊羽老考而耒耳聿肉肋肌臣自至臼舌舛舟艮色艾虫血行衣西阡串亨位住佇佗佞伴佛何估佐佑伽伺伸佃佔似但佣"
  ],
  [
    "a740",
    "作你伯低伶余佝佈佚兌克免兵冶冷別判利刪刨劫助努劬匣即卵吝吭吞吾否呎吧呆呃吳呈呂君吩告吹吻吸吮吵吶吠吼呀吱含吟听囪困囤囫坊坑址坍"
  ],
  [
    "a7a1",
    "均坎圾坐坏圻壯夾妝妒妨妞妣妙妖妍妤妓妊妥孝孜孚孛完宋宏尬局屁尿尾岐岑岔岌巫希序庇床廷弄弟彤形彷役忘忌志忍忱快忸忪戒我抄抗抖技扶抉扭把扼找批扳抒扯折扮投抓抑抆改攻攸旱更束李杏材村杜杖杞杉杆杠"
  ],
  [
    "a840",
    "杓杗步每求汞沙沁沈沉沅沛汪決沐汰沌汨沖沒汽沃汲汾汴沆汶沍沔沘沂灶灼災灸牢牡牠狄狂玖甬甫男甸皂盯矣私秀禿究系罕肖肓肝肘肛肚育良芒"
  ],
  [
    "a8a1",
    "芋芍見角言谷豆豕貝赤走足身車辛辰迂迆迅迄巡邑邢邪邦那酉釆里防阮阱阪阬並乖乳事些亞享京佯依侍佳使佬供例來侃佰併侈佩佻侖佾侏侑佺兔兒兕兩具其典冽函刻券刷刺到刮制剁劾劻卒協卓卑卦卷卸卹取叔受味呵"
  ],
  [
    "a940",
    "咖呸咕咀呻呷咄咒咆呼咐呱呶和咚呢周咋命咎固垃坷坪坩坡坦坤坼夜奉奇奈奄奔妾妻委妹妮姑姆姐姍始姓姊妯妳姒姅孟孤季宗定官宜宙宛尚屈居"
  ],
  [
    "a9a1",
    "屆岷岡岸岩岫岱岳帘帚帖帕帛帑幸庚店府底庖延弦弧弩往征彿彼忝忠忽念忿怏怔怯怵怖怪怕怡性怩怫怛或戕房戾所承拉拌拄抿拂抹拒招披拓拔拋拈抨抽押拐拙拇拍抵拚抱拘拖拗拆抬拎放斧於旺昔易昌昆昂明昀昏昕昊"
  ],
  [
    "aa40",
    "昇服朋杭枋枕東果杳杷枇枝林杯杰板枉松析杵枚枓杼杪杲欣武歧歿氓氛泣注泳沱泌泥河沽沾沼波沫法泓沸泄油況沮泗泅泱沿治泡泛泊沬泯泜泖泠"
  ],
  [
    "aaa1",
    "炕炎炒炊炙爬爭爸版牧物狀狎狙狗狐玩玨玟玫玥甽疝疙疚的盂盲直知矽社祀祁秉秈空穹竺糾罔羌羋者肺肥肢肱股肫肩肴肪肯臥臾舍芳芝芙芭芽芟芹花芬芥芯芸芣芰芾芷虎虱初表軋迎返近邵邸邱邶采金長門阜陀阿阻附"
  ],
  [
    "ab40",
    "陂隹雨青非亟亭亮信侵侯便俠俑俏保促侶俘俟俊俗侮俐俄係俚俎俞侷兗冒冑冠剎剃削前剌剋則勇勉勃勁匍南卻厚叛咬哀咨哎哉咸咦咳哇哂咽咪品"
  ],
  [
    "aba1",
    "哄哈咯咫咱咻咩咧咿囿垂型垠垣垢城垮垓奕契奏奎奐姜姘姿姣姨娃姥姪姚姦威姻孩宣宦室客宥封屎屏屍屋峙峒巷帝帥帟幽庠度建弈弭彥很待徊律徇後徉怒思怠急怎怨恍恰恨恢恆恃恬恫恪恤扁拜挖按拼拭持拮拽指拱拷"
  ],
  [
    "ac40",
    "拯括拾拴挑挂政故斫施既春昭映昧是星昨昱昤曷柿染柱柔某柬架枯柵柩柯柄柑枴柚查枸柏柞柳枰柙柢柝柒歪殃殆段毒毗氟泉洋洲洪流津洌洱洞洗"
  ],
  [
    "aca1",
    "活洽派洶洛泵洹洧洸洩洮洵洎洫炫為炳炬炯炭炸炮炤爰牲牯牴狩狠狡玷珊玻玲珍珀玳甚甭畏界畎畋疫疤疥疢疣癸皆皇皈盈盆盃盅省盹相眉看盾盼眇矜砂研砌砍祆祉祈祇禹禺科秒秋穿突竿竽籽紂紅紀紉紇約紆缸美羿耄"
  ],
  [
    "ad40",
    "耐耍耑耶胖胥胚胃胄背胡胛胎胞胤胝致舢苧范茅苣苛苦茄若茂茉苒苗英茁苜苔苑苞苓苟苯茆虐虹虻虺衍衫要觔計訂訃貞負赴赳趴軍軌述迦迢迪迥"
  ],
  [
    "ada1",
    "迭迫迤迨郊郎郁郃酋酊重閂限陋陌降面革韋韭音頁風飛食首香乘亳倌倍倣俯倦倥俸倩倖倆值借倚倒們俺倀倔倨俱倡個候倘俳修倭倪俾倫倉兼冤冥冢凍凌准凋剖剜剔剛剝匪卿原厝叟哨唐唁唷哼哥哲唆哺唔哩哭員唉哮哪"
  ],
  [
    "ae40",
    "哦唧唇哽唏圃圄埂埔埋埃堉夏套奘奚娑娘娜娟娛娓姬娠娣娩娥娌娉孫屘宰害家宴宮宵容宸射屑展屐峭峽峻峪峨峰島崁峴差席師庫庭座弱徒徑徐恙"
  ],
  [
    "aea1",
    "恣恥恐恕恭恩息悄悟悚悍悔悌悅悖扇拳挈拿捎挾振捕捂捆捏捉挺捐挽挪挫挨捍捌效敉料旁旅時晉晏晃晒晌晅晁書朔朕朗校核案框桓根桂桔栩梳栗桌桑栽柴桐桀格桃株桅栓栘桁殊殉殷氣氧氨氦氤泰浪涕消涇浦浸海浙涓"
  ],
  [
    "af40",
    "浬涉浮浚浴浩涌涊浹涅浥涔烊烘烤烙烈烏爹特狼狹狽狸狷玆班琉珮珠珪珞畔畝畜畚留疾病症疲疳疽疼疹痂疸皋皰益盍盎眩真眠眨矩砰砧砸砝破砷"
  ],
  [
    "afa1",
    "砥砭砠砟砲祕祐祠祟祖神祝祗祚秤秣秧租秦秩秘窄窈站笆笑粉紡紗紋紊素索純紐紕級紜納紙紛缺罟羔翅翁耆耘耕耙耗耽耿胱脂胰脅胭胴脆胸胳脈能脊胼胯臭臬舀舐航舫舨般芻茫荒荔荊茸荐草茵茴荏茲茹茶茗荀茱茨荃"
  ],
  [
    "b040",
    "虔蚊蚪蚓蚤蚩蚌蚣蚜衰衷袁袂衽衹記訐討訌訕訊託訓訖訏訑豈豺豹財貢起躬軒軔軏辱送逆迷退迺迴逃追逅迸邕郡郝郢酒配酌釘針釗釜釙閃院陣陡"
  ],
  [
    "b0a1",
    "陛陝除陘陞隻飢馬骨高鬥鬲鬼乾偺偽停假偃偌做偉健偶偎偕偵側偷偏倏偯偭兜冕凰剪副勒務勘動匐匏匙匿區匾參曼商啪啦啄啞啡啃啊唱啖問啕唯啤唸售啜唬啣唳啁啗圈國圉域堅堊堆埠埤基堂堵執培夠奢娶婁婉婦婪婀"
  ],
  [
    "b140",
    "娼婢婚婆婊孰寇寅寄寂宿密尉專將屠屜屝崇崆崎崛崖崢崑崩崔崙崤崧崗巢常帶帳帷康庸庶庵庾張強彗彬彩彫得徙從徘御徠徜恿患悉悠您惋悴惦悽"
  ],
  [
    "b1a1",
    "情悻悵惜悼惘惕惆惟悸惚惇戚戛扈掠控捲掖探接捷捧掘措捱掩掉掃掛捫推掄授掙採掬排掏掀捻捩捨捺敝敖救教敗啟敏敘敕敔斜斛斬族旋旌旎晝晚晤晨晦晞曹勗望梁梯梢梓梵桿桶梱梧梗械梃棄梭梆梅梔條梨梟梡梂欲殺"
  ],
  [
    "b240",
    "毫毬氫涎涼淳淙液淡淌淤添淺清淇淋涯淑涮淞淹涸混淵淅淒渚涵淚淫淘淪深淮淨淆淄涪淬涿淦烹焉焊烽烯爽牽犁猜猛猖猓猙率琅琊球理現琍瓠瓶"
  ],
  [
    "b2a1",
    "瓷甜產略畦畢異疏痔痕疵痊痍皎盔盒盛眷眾眼眶眸眺硫硃硎祥票祭移窒窕笠笨笛第符笙笞笮粒粗粕絆絃統紮紹紼絀細紳組累終紲紱缽羞羚翌翎習耜聊聆脯脖脣脫脩脰脤舂舵舷舶船莎莞莘荸莢莖莽莫莒莊莓莉莠荷荻荼"
  ],
  [
    "b340",
    "莆莧處彪蛇蛀蚶蛄蚵蛆蛋蚱蚯蛉術袞袈被袒袖袍袋覓規訪訝訣訥許設訟訛訢豉豚販責貫貨貪貧赧赦趾趺軛軟這逍通逗連速逝逐逕逞造透逢逖逛途"
  ],
  [
    "b3a1",
    "部郭都酗野釵釦釣釧釭釩閉陪陵陳陸陰陴陶陷陬雀雪雩章竟頂頃魚鳥鹵鹿麥麻傢傍傅備傑傀傖傘傚最凱割剴創剩勞勝勛博厥啻喀喧啼喊喝喘喂喜喪喔喇喋喃喳單喟唾喲喚喻喬喱啾喉喫喙圍堯堪場堤堰報堡堝堠壹壺奠"
  ],
  [
    "b440",
    "婷媚婿媒媛媧孳孱寒富寓寐尊尋就嵌嵐崴嵇巽幅帽幀幃幾廊廁廂廄弼彭復循徨惑惡悲悶惠愜愣惺愕惰惻惴慨惱愎惶愉愀愒戟扉掣掌描揀揩揉揆揍"
  ],
  [
    "b4a1",
    "插揣提握揖揭揮捶援揪換摒揚揹敞敦敢散斑斐斯普晰晴晶景暑智晾晷曾替期朝棺棕棠棘棗椅棟棵森棧棹棒棲棣棋棍植椒椎棉棚楮棻款欺欽殘殖殼毯氮氯氬港游湔渡渲湧湊渠渥渣減湛湘渤湖湮渭渦湯渴湍渺測湃渝渾滋"
  ],
  [
    "b540",
    "溉渙湎湣湄湲湩湟焙焚焦焰無然煮焜牌犄犀猶猥猴猩琺琪琳琢琥琵琶琴琯琛琦琨甥甦畫番痢痛痣痙痘痞痠登發皖皓皴盜睏短硝硬硯稍稈程稅稀窘"
  ],
  [
    "b5a1",
    "窗窖童竣等策筆筐筒答筍筋筏筑粟粥絞結絨絕紫絮絲絡給絢絰絳善翔翕耋聒肅腕腔腋腑腎脹腆脾腌腓腴舒舜菩萃菸萍菠菅萋菁華菱菴著萊菰萌菌菽菲菊萸萎萄菜萇菔菟虛蛟蛙蛭蛔蛛蛤蛐蛞街裁裂袱覃視註詠評詞証詁"
  ],
  [
    "b640",
    "詔詛詐詆訴診訶詖象貂貯貼貳貽賁費賀貴買貶貿貸越超趁跎距跋跚跑跌跛跆軻軸軼辜逮逵週逸進逶鄂郵鄉郾酣酥量鈔鈕鈣鈉鈞鈍鈐鈇鈑閔閏開閑"
  ],
  [
    "b6a1",
    "間閒閎隊階隋陽隅隆隍陲隄雁雅雄集雇雯雲韌項順須飧飪飯飩飲飭馮馭黃黍黑亂傭債傲傳僅傾催傷傻傯僇剿剷剽募勦勤勢勣匯嗟嗨嗓嗦嗎嗜嗇嗑嗣嗤嗯嗚嗡嗅嗆嗥嗉園圓塞塑塘塗塚塔填塌塭塊塢塒塋奧嫁嫉嫌媾媽媼"
  ],
  [
    "b740",
    "媳嫂媲嵩嵯幌幹廉廈弒彙徬微愚意慈感想愛惹愁愈慎慌慄慍愾愴愧愍愆愷戡戢搓搾搞搪搭搽搬搏搜搔損搶搖搗搆敬斟新暗暉暇暈暖暄暘暍會榔業"
  ],
  [
    "b7a1",
    "楚楷楠楔極椰概楊楨楫楞楓楹榆楝楣楛歇歲毀殿毓毽溢溯滓溶滂源溝滇滅溥溘溼溺溫滑準溜滄滔溪溧溴煎煙煩煤煉照煜煬煦煌煥煞煆煨煖爺牒猷獅猿猾瑯瑚瑕瑟瑞瑁琿瑙瑛瑜當畸瘀痰瘁痲痱痺痿痴痳盞盟睛睫睦睞督"
  ],
  [
    "b840",
    "睹睪睬睜睥睨睢矮碎碰碗碘碌碉硼碑碓硿祺祿禁萬禽稜稚稠稔稟稞窟窠筷節筠筮筧粱粳粵經絹綑綁綏絛置罩罪署義羨群聖聘肆肄腱腰腸腥腮腳腫"
  ],
  [
    "b8a1",
    "腹腺腦舅艇蒂葷落萱葵葦葫葉葬葛萼萵葡董葩葭葆虞虜號蛹蜓蜈蜇蜀蛾蛻蜂蜃蜆蜊衙裟裔裙補裘裝裡裊裕裒覜解詫該詳試詩詰誇詼詣誠話誅詭詢詮詬詹詻訾詨豢貊貉賊資賈賄貲賃賂賅跡跟跨路跳跺跪跤跦躲較載軾輊"
  ],
  [
    "b940",
    "辟農運遊道遂達逼違遐遇遏過遍遑逾遁鄒鄗酬酪酩釉鈷鉗鈸鈽鉀鈾鉛鉋鉤鉑鈴鉉鉍鉅鈹鈿鉚閘隘隔隕雍雋雉雊雷電雹零靖靴靶預頑頓頊頒頌飼飴"
  ],
  [
    "b9a1",
    "飽飾馳馱馴髡鳩麂鼎鼓鼠僧僮僥僖僭僚僕像僑僱僎僩兢凳劃劂匱厭嗾嘀嘛嘗嗽嘔嘆嘉嘍嘎嗷嘖嘟嘈嘐嗶團圖塵塾境墓墊塹墅塽壽夥夢夤奪奩嫡嫦嫩嫗嫖嫘嫣孵寞寧寡寥實寨寢寤察對屢嶄嶇幛幣幕幗幔廓廖弊彆彰徹慇"
  ],
  [
    "ba40",
    "愿態慷慢慣慟慚慘慵截撇摘摔撤摸摟摺摑摧搴摭摻敲斡旗旖暢暨暝榜榨榕槁榮槓構榛榷榻榫榴槐槍榭槌榦槃榣歉歌氳漳演滾漓滴漩漾漠漬漏漂漢"
  ],
  [
    "baa1",
    "滿滯漆漱漸漲漣漕漫漯澈漪滬漁滲滌滷熔熙煽熊熄熒爾犒犖獄獐瑤瑣瑪瑰瑭甄疑瘧瘍瘋瘉瘓盡監瞄睽睿睡磁碟碧碳碩碣禎福禍種稱窪窩竭端管箕箋筵算箝箔箏箸箇箄粹粽精綻綰綜綽綾綠緊綴網綱綺綢綿綵綸維緒緇綬"
  ],
  [
    "bb40",
    "罰翠翡翟聞聚肇腐膀膏膈膊腿膂臧臺與舔舞艋蓉蒿蓆蓄蒙蒞蒲蒜蓋蒸蓀蓓蒐蒼蓑蓊蜿蜜蜻蜢蜥蜴蜘蝕蜷蜩裳褂裴裹裸製裨褚裯誦誌語誣認誡誓誤"
  ],
  [
    "bba1",
    "說誥誨誘誑誚誧豪貍貌賓賑賒赫趙趕跼輔輒輕輓辣遠遘遜遣遙遞遢遝遛鄙鄘鄞酵酸酷酴鉸銀銅銘銖鉻銓銜銨鉼銑閡閨閩閣閥閤隙障際雌雒需靼鞅韶頗領颯颱餃餅餌餉駁骯骰髦魁魂鳴鳶鳳麼鼻齊億儀僻僵價儂儈儉儅凜"
  ],
  [
    "bc40",
    "劇劈劉劍劊勰厲嘮嘻嘹嘲嘿嘴嘩噓噎噗噴嘶嘯嘰墀墟增墳墜墮墩墦奭嬉嫻嬋嫵嬌嬈寮寬審寫層履嶝嶔幢幟幡廢廚廟廝廣廠彈影德徵慶慧慮慝慕憂"
  ],
  [
    "bca1",
    "慼慰慫慾憧憐憫憎憬憚憤憔憮戮摩摯摹撞撲撈撐撰撥撓撕撩撒撮播撫撚撬撙撢撳敵敷數暮暫暴暱樣樟槨樁樞標槽模樓樊槳樂樅槭樑歐歎殤毅毆漿潼澄潑潦潔澆潭潛潸潮澎潺潰潤澗潘滕潯潠潟熟熬熱熨牖犛獎獗瑩璋璃"
  ],
  [
    "bd40",
    "瑾璀畿瘠瘩瘟瘤瘦瘡瘢皚皺盤瞎瞇瞌瞑瞋磋磅確磊碾磕碼磐稿稼穀稽稷稻窯窮箭箱範箴篆篇篁箠篌糊締練緯緻緘緬緝編緣線緞緩綞緙緲緹罵罷羯"
  ],
  [
    "bda1",
    "翩耦膛膜膝膠膚膘蔗蔽蔚蓮蔬蔭蔓蔑蔣蔡蔔蓬蔥蓿蔆螂蝴蝶蝠蝦蝸蝨蝙蝗蝌蝓衛衝褐複褒褓褕褊誼諒談諄誕請諸課諉諂調誰論諍誶誹諛豌豎豬賠賞賦賤賬賭賢賣賜質賡赭趟趣踫踐踝踢踏踩踟踡踞躺輝輛輟輩輦輪輜輞"
  ],
  [
    "be40",
    "輥適遮遨遭遷鄰鄭鄧鄱醇醉醋醃鋅銻銷鋪銬鋤鋁銳銼鋒鋇鋰銲閭閱霄霆震霉靠鞍鞋鞏頡頫頜颳養餓餒餘駝駐駟駛駑駕駒駙骷髮髯鬧魅魄魷魯鴆鴉"
  ],
  [
    "bea1",
    "鴃麩麾黎墨齒儒儘儔儐儕冀冪凝劑劓勳噙噫噹噩噤噸噪器噥噱噯噬噢噶壁墾壇壅奮嬝嬴學寰導彊憲憑憩憊懍憶憾懊懈戰擅擁擋撻撼據擄擇擂操撿擒擔撾整曆曉暹曄曇暸樽樸樺橙橫橘樹橄橢橡橋橇樵機橈歙歷氅濂澱澡"
  ],
  [
    "bf40",
    "濃澤濁澧澳激澹澶澦澠澴熾燉燐燒燈燕熹燎燙燜燃燄獨璜璣璘璟璞瓢甌甍瘴瘸瘺盧盥瞠瞞瞟瞥磨磚磬磧禦積穎穆穌穋窺篙簑築篤篛篡篩篦糕糖縊"
  ],
  [
    "bfa1",
    "縑縈縛縣縞縝縉縐罹羲翰翱翮耨膳膩膨臻興艘艙蕊蕙蕈蕨蕩蕃蕉蕭蕪蕞螃螟螞螢融衡褪褲褥褫褡親覦諦諺諫諱謀諜諧諮諾謁謂諷諭諳諶諼豫豭貓賴蹄踱踴蹂踹踵輻輯輸輳辨辦遵遴選遲遼遺鄴醒錠錶鋸錳錯錢鋼錫錄錚"
  ],
  [
    "c040",
    "錐錦錡錕錮錙閻隧隨險雕霎霑霖霍霓霏靛靜靦鞘頰頸頻頷頭頹頤餐館餞餛餡餚駭駢駱骸骼髻髭鬨鮑鴕鴣鴦鴨鴒鴛默黔龍龜優償儡儲勵嚎嚀嚐嚅嚇"
  ],
  [
    "c0a1",
    "嚏壕壓壑壎嬰嬪嬤孺尷屨嶼嶺嶽嶸幫彌徽應懂懇懦懋戲戴擎擊擘擠擰擦擬擱擢擭斂斃曙曖檀檔檄檢檜櫛檣橾檗檐檠歜殮毚氈濘濱濟濠濛濤濫濯澀濬濡濩濕濮濰燧營燮燦燥燭燬燴燠爵牆獰獲璩環璦璨癆療癌盪瞳瞪瞰瞬"
  ],
  [
    "c140",
    "瞧瞭矯磷磺磴磯礁禧禪穗窿簇簍篾篷簌篠糠糜糞糢糟糙糝縮績繆縷縲繃縫總縱繅繁縴縹繈縵縿縯罄翳翼聱聲聰聯聳臆臃膺臂臀膿膽臉膾臨舉艱薪"
  ],
  [
    "c1a1",
    "薄蕾薜薑薔薯薛薇薨薊虧蟀蟑螳蟒蟆螫螻螺蟈蟋褻褶襄褸褽覬謎謗謙講謊謠謝謄謐豁谿豳賺賽購賸賻趨蹉蹋蹈蹊轄輾轂轅輿避遽還邁邂邀鄹醣醞醜鍍鎂錨鍵鍊鍥鍋錘鍾鍬鍛鍰鍚鍔闊闋闌闈闆隱隸雖霜霞鞠韓顆颶餵騁"
  ],
  [
    "c240",
    "駿鮮鮫鮪鮭鴻鴿麋黏點黜黝黛鼾齋叢嚕嚮壙壘嬸彝懣戳擴擲擾攆擺擻擷斷曜朦檳檬櫃檻檸櫂檮檯歟歸殯瀉瀋濾瀆濺瀑瀏燻燼燾燸獷獵璧璿甕癖癘"
  ],
  [
    "c2a1",
    "癒瞽瞿瞻瞼礎禮穡穢穠竄竅簫簧簪簞簣簡糧織繕繞繚繡繒繙罈翹翻職聶臍臏舊藏薩藍藐藉薰薺薹薦蟯蟬蟲蟠覆覲觴謨謹謬謫豐贅蹙蹣蹦蹤蹟蹕軀轉轍邇邃邈醫醬釐鎔鎊鎖鎢鎳鎮鎬鎰鎘鎚鎗闔闖闐闕離雜雙雛雞霤鞣鞦"
  ],
  [
    "c340",
    "鞭韹額顏題顎顓颺餾餿餽餮馥騎髁鬃鬆魏魎魍鯊鯉鯽鯈鯀鵑鵝鵠黠鼕鼬儳嚥壞壟壢寵龐廬懲懷懶懵攀攏曠曝櫥櫝櫚櫓瀛瀟瀨瀚瀝瀕瀘爆爍牘犢獸"
  ],
  [
    "c3a1",
    "獺璽瓊瓣疇疆癟癡矇礙禱穫穩簾簿簸簽簷籀繫繭繹繩繪羅繳羶羹羸臘藩藝藪藕藤藥藷蟻蠅蠍蟹蟾襠襟襖襞譁譜識證譚譎譏譆譙贈贊蹼蹲躇蹶蹬蹺蹴轔轎辭邊邋醱醮鏡鏑鏟鏃鏈鏜鏝鏖鏢鏍鏘鏤鏗鏨關隴難霪霧靡韜韻類"
  ],
  [
    "c440",
    "願顛颼饅饉騖騙鬍鯨鯧鯖鯛鶉鵡鵲鵪鵬麒麗麓麴勸嚨嚷嚶嚴嚼壤孀孃孽寶巉懸懺攘攔攙曦朧櫬瀾瀰瀲爐獻瓏癢癥礦礪礬礫竇競籌籃籍糯糰辮繽繼"
  ],
  [
    "c4a1",
    "纂罌耀臚艦藻藹蘑藺蘆蘋蘇蘊蠔蠕襤覺觸議譬警譯譟譫贏贍躉躁躅躂醴釋鐘鐃鏽闡霰飄饒饑馨騫騰騷騵鰓鰍鹹麵黨鼯齟齣齡儷儸囁囀囂夔屬巍懼懾攝攜斕曩櫻欄櫺殲灌爛犧瓖瓔癩矓籐纏續羼蘗蘭蘚蠣蠢蠡蠟襪襬覽譴"
  ],
  [
    "c540",
    "護譽贓躊躍躋轟辯醺鐮鐳鐵鐺鐸鐲鐫闢霸霹露響顧顥饗驅驃驀騾髏魔魑鰭鰥鶯鶴鷂鶸麝黯鼙齜齦齧儼儻囈囊囉孿巔巒彎懿攤權歡灑灘玀瓤疊癮癬"
  ],
  [
    "c5a1",
    "禳籠籟聾聽臟襲襯觼讀贖贗躑躓轡酈鑄鑑鑒霽霾韃韁顫饕驕驍髒鬚鱉鰱鰾鰻鷓鷗鼴齬齪龔囌巖戀攣攫攪曬欐瓚竊籤籣籥纓纖纔臢蘸蘿蠱變邐邏鑣鑠鑤靨顯饜驚驛驗髓體髑鱔鱗鱖鷥麟黴囑壩攬灞癱癲矗罐羈蠶蠹衢讓讒"
  ],
  [
    "c640",
    "讖艷贛釀鑪靂靈靄韆顰驟鬢魘鱟鷹鷺鹼鹽鼇齷齲廳欖灣籬籮蠻觀躡釁鑲鑰顱饞髖鬣黌灤矚讚鑷韉驢驥纜讜躪釅鑽鑾鑼鱷鱸黷豔鑿鸚爨驪鬱鸛鸞籲"
  ],
  [
    "c940",
    "乂乜凵匚厂万丌乇亍囗兀屮彳丏冇与丮亓仂仉仈冘勼卬厹圠夃夬尐巿旡殳毌气爿丱丼仨仜仩仡仝仚刌匜卌圢圣夗夯宁宄尒尻屴屳帄庀庂忉戉扐氕"
  ],
  [
    "c9a1",
    "氶汃氿氻犮犰玊禸肊阞伎优伬仵伔仱伀价伈伝伂伅伢伓伄仴伒冱刓刉刐劦匢匟卍厊吇囡囟圮圪圴夼妀奼妅奻奾奷奿孖尕尥屼屺屻屾巟幵庄异弚彴忕忔忏扜扞扤扡扦扢扙扠扚扥旯旮朾朹朸朻机朿朼朳氘汆汒汜汏汊汔汋"
  ],
  [
    "ca40",
    "汌灱牞犴犵玎甪癿穵网艸艼芀艽艿虍襾邙邗邘邛邔阢阤阠阣佖伻佢佉体佤伾佧佒佟佁佘伭伳伿佡冏冹刜刞刡劭劮匉卣卲厎厏吰吷吪呔呅吙吜吥吘"
  ],
  [
    "caa1",
    "吽呏呁吨吤呇囮囧囥坁坅坌坉坋坒夆奀妦妘妠妗妎妢妐妏妧妡宎宒尨尪岍岏岈岋岉岒岊岆岓岕巠帊帎庋庉庌庈庍弅弝彸彶忒忑忐忭忨忮忳忡忤忣忺忯忷忻怀忴戺抃抌抎抏抔抇扱扻扺扰抁抈扷扽扲扴攷旰旴旳旲旵杅杇"
  ],
  [
    "cb40",
    "杙杕杌杈杝杍杚杋毐氙氚汸汧汫沄沋沏汱汯汩沚汭沇沕沜汦汳汥汻沎灴灺牣犿犽狃狆狁犺狅玕玗玓玔玒町甹疔疕皁礽耴肕肙肐肒肜芐芏芅芎芑芓"
  ],
  [
    "cba1",
    "芊芃芄豸迉辿邟邡邥邞邧邠阰阨阯阭丳侘佼侅佽侀侇佶佴侉侄佷佌侗佪侚佹侁佸侐侜侔侞侒侂侕佫佮冞冼冾刵刲刳剆刱劼匊匋匼厒厔咇呿咁咑咂咈呫呺呾呥呬呴呦咍呯呡呠咘呣呧呤囷囹坯坲坭坫坱坰坶垀坵坻坳坴坢"
  ],
  [
    "cc40",
    "坨坽夌奅妵妺姏姎妲姌姁妶妼姃姖妱妽姀姈妴姇孢孥宓宕屄屇岮岤岠岵岯岨岬岟岣岭岢岪岧岝岥岶岰岦帗帔帙弨弢弣弤彔徂彾彽忞忥怭怦怙怲怋"
  ],
  [
    "cca1",
    "怴怊怗怳怚怞怬怢怍怐怮怓怑怌怉怜戔戽抭抴拑抾抪抶拊抮抳抯抻抩抰抸攽斨斻昉旼昄昒昈旻昃昋昍昅旽昑昐曶朊枅杬枎枒杶杻枘枆构杴枍枌杺枟枑枙枃杽极杸杹枔欥殀歾毞氝沓泬泫泮泙沶泔沭泧沷泐泂沺泃泆泭泲"
  ],
  [
    "cd40",
    "泒泝沴沊沝沀泞泀洰泍泇沰泹泏泩泑炔炘炅炓炆炄炑炖炂炚炃牪狖狋狘狉狜狒狔狚狌狑玤玡玭玦玢玠玬玝瓝瓨甿畀甾疌疘皯盳盱盰盵矸矼矹矻矺"
  ],
  [
    "cda1",
    "矷祂礿秅穸穻竻籵糽耵肏肮肣肸肵肭舠芠苀芫芚芘芛芵芧芮芼芞芺芴芨芡芩苂芤苃芶芢虰虯虭虮豖迒迋迓迍迖迕迗邲邴邯邳邰阹阽阼阺陃俍俅俓侲俉俋俁俔俜俙侻侳俛俇俖侺俀侹俬剄剉勀勂匽卼厗厖厙厘咺咡咭咥哏"
  ],
  [
    "ce40",
    "哃茍咷咮哖咶哅哆咠呰咼咢咾呲哞咰垵垞垟垤垌垗垝垛垔垘垏垙垥垚垕壴复奓姡姞姮娀姱姝姺姽姼姶姤姲姷姛姩姳姵姠姾姴姭宨屌峐峘峌峗峋峛"
  ],
  [
    "cea1",
    "峞峚峉峇峊峖峓峔峏峈峆峎峟峸巹帡帢帣帠帤庰庤庢庛庣庥弇弮彖徆怷怹恔恲恞恅恓恇恉恛恌恀恂恟怤恄恘恦恮扂扃拏挍挋拵挎挃拫拹挏挌拸拶挀挓挔拺挕拻拰敁敃斪斿昶昡昲昵昜昦昢昳昫昺昝昴昹昮朏朐柁柲柈枺"
  ],
  [
    "cf40",
    "柜枻柸柘柀枷柅柫柤柟枵柍枳柷柶柮柣柂枹柎柧柰枲柼柆柭柌枮柦柛柺柉柊柃柪柋欨殂殄殶毖毘毠氠氡洨洴洭洟洼洿洒洊泚洳洄洙洺洚洑洀洝浂"
  ],
  [
    "cfa1",
    "洁洘洷洃洏浀洇洠洬洈洢洉洐炷炟炾炱炰炡炴炵炩牁牉牊牬牰牳牮狊狤狨狫狟狪狦狣玅珌珂珈珅玹玶玵玴珫玿珇玾珃珆玸珋瓬瓮甮畇畈疧疪癹盄眈眃眄眅眊盷盻盺矧矨砆砑砒砅砐砏砎砉砃砓祊祌祋祅祄秕种秏秖秎窀"
  ],
  [
    "d040",
    "穾竑笀笁籺籸籹籿粀粁紃紈紁罘羑羍羾耇耎耏耔耷胘胇胠胑胈胂胐胅胣胙胜胊胕胉胏胗胦胍臿舡芔苙苾苹茇苨茀苕茺苫苖苴苬苡苲苵茌苻苶苰苪"
  ],
  [
    "d0a1",
    "苤苠苺苳苭虷虴虼虳衁衎衧衪衩觓訄訇赲迣迡迮迠郱邽邿郕郅邾郇郋郈釔釓陔陏陑陓陊陎倞倅倇倓倢倰倛俵俴倳倷倬俶俷倗倜倠倧倵倯倱倎党冔冓凊凄凅凈凎剡剚剒剞剟剕剢勍匎厞唦哢唗唒哧哳哤唚哿唄唈哫唑唅哱"
  ],
  [
    "d140",
    "唊哻哷哸哠唎唃唋圁圂埌堲埕埒垺埆垽垼垸垶垿埇埐垹埁夎奊娙娖娭娮娕娏娗娊娞娳孬宧宭宬尃屖屔峬峿峮峱峷崀峹帩帨庨庮庪庬弳弰彧恝恚恧"
  ],
  [
    "d1a1",
    "恁悢悈悀悒悁悝悃悕悛悗悇悜悎戙扆拲挐捖挬捄捅挶捃揤挹捋捊挼挩捁挴捘捔捙挭捇挳捚捑挸捗捀捈敊敆旆旃旄旂晊晟晇晑朒朓栟栚桉栲栳栻桋桏栖栱栜栵栫栭栯桎桄栴栝栒栔栦栨栮桍栺栥栠欬欯欭欱欴歭肂殈毦毤"
  ],
  [
    "d240",
    "毨毣毢毧氥浺浣浤浶洍浡涒浘浢浭浯涑涍淯浿涆浞浧浠涗浰浼浟涂涘洯浨涋浾涀涄洖涃浻浽浵涐烜烓烑烝烋缹烢烗烒烞烠烔烍烅烆烇烚烎烡牂牸"
  ],
  [
    "d2a1",
    "牷牶猀狺狴狾狶狳狻猁珓珙珥珖玼珧珣珩珜珒珛珔珝珚珗珘珨瓞瓟瓴瓵甡畛畟疰痁疻痄痀疿疶疺皊盉眝眛眐眓眒眣眑眕眙眚眢眧砣砬砢砵砯砨砮砫砡砩砳砪砱祔祛祏祜祓祒祑秫秬秠秮秭秪秜秞秝窆窉窅窋窌窊窇竘笐"
  ],
  [
    "d340",
    "笄笓笅笏笈笊笎笉笒粄粑粊粌粈粍粅紞紝紑紎紘紖紓紟紒紏紌罜罡罞罠罝罛羖羒翃翂翀耖耾耹胺胲胹胵脁胻脀舁舯舥茳茭荄茙荑茥荖茿荁茦茜茢"
  ],
  [
    "d3a1",
    "荂荎茛茪茈茼荍茖茤茠茷茯茩荇荅荌荓茞茬荋茧荈虓虒蚢蚨蚖蚍蚑蚞蚇蚗蚆蚋蚚蚅蚥蚙蚡蚧蚕蚘蚎蚝蚐蚔衃衄衭衵衶衲袀衱衿衯袃衾衴衼訒豇豗豻貤貣赶赸趵趷趶軑軓迾迵适迿迻逄迼迶郖郠郙郚郣郟郥郘郛郗郜郤酐"
  ],
  [
    "d440",
    "酎酏釕釢釚陜陟隼飣髟鬯乿偰偪偡偞偠偓偋偝偲偈偍偁偛偊偢倕偅偟偩偫偣偤偆偀偮偳偗偑凐剫剭剬剮勖勓匭厜啵啶唼啍啐唴唪啑啢唶唵唰啒啅"
  ],
  [
    "d4a1",
    "唌唲啥啎唹啈唭唻啀啋圊圇埻堔埢埶埜埴堀埭埽堈埸堋埳埏堇埮埣埲埥埬埡堎埼堐埧堁堌埱埩埰堍堄奜婠婘婕婧婞娸娵婭婐婟婥婬婓婤婗婃婝婒婄婛婈媎娾婍娹婌婰婩婇婑婖婂婜孲孮寁寀屙崞崋崝崚崠崌崨崍崦崥崏"
  ],
  [
    "d540",
    "崰崒崣崟崮帾帴庱庴庹庲庳弶弸徛徖徟悊悐悆悾悰悺惓惔惏惤惙惝惈悱惛悷惊悿惃惍惀挲捥掊掂捽掽掞掭掝掗掫掎捯掇掐据掯捵掜捭掮捼掤挻掟"
  ],
  [
    "d5a1",
    "捸掅掁掑掍捰敓旍晥晡晛晙晜晢朘桹梇梐梜桭桮梮梫楖桯梣梬梩桵桴梲梏桷梒桼桫桲梪梀桱桾梛梖梋梠梉梤桸桻梑梌梊桽欶欳欷欸殑殏殍殎殌氪淀涫涴涳湴涬淩淢涷淶淔渀淈淠淟淖涾淥淜淝淛淴淊涽淭淰涺淕淂淏淉"
  ],
  [
    "d640",
    "淐淲淓淽淗淍淣涻烺焍烷焗烴焌烰焄烳焐烼烿焆焓焀烸烶焋焂焎牾牻牼牿猝猗猇猑猘猊猈狿猏猞玈珶珸珵琄琁珽琇琀珺珼珿琌琋珴琈畤畣痎痒痏"
  ],
  [
    "d6a1",
    "痋痌痑痐皏皉盓眹眯眭眱眲眴眳眽眥眻眵硈硒硉硍硊硌砦硅硐祤祧祩祪祣祫祡离秺秸秶秷窏窔窐笵筇笴笥笰笢笤笳笘笪笝笱笫笭笯笲笸笚笣粔粘粖粣紵紽紸紶紺絅紬紩絁絇紾紿絊紻紨罣羕羜羝羛翊翋翍翐翑翇翏翉耟"
  ],
  [
    "d740",
    "耞耛聇聃聈脘脥脙脛脭脟脬脞脡脕脧脝脢舑舸舳舺舴舲艴莐莣莨莍荺荳莤荴莏莁莕莙荵莔莩荽莃莌莝莛莪莋荾莥莯莈莗莰荿莦莇莮荶莚虙虖蚿蚷"
  ],
  [
    "d7a1",
    "蛂蛁蛅蚺蚰蛈蚹蚳蚸蛌蚴蚻蚼蛃蚽蚾衒袉袕袨袢袪袚袑袡袟袘袧袙袛袗袤袬袌袓袎覂觖觙觕訰訧訬訞谹谻豜豝豽貥赽赻赹趼跂趹趿跁軘軞軝軜軗軠軡逤逋逑逜逌逡郯郪郰郴郲郳郔郫郬郩酖酘酚酓酕釬釴釱釳釸釤釹釪"
  ],
  [
    "d840",
    "釫釷釨釮镺閆閈陼陭陫陱陯隿靪頄飥馗傛傕傔傞傋傣傃傌傎傝偨傜傒傂傇兟凔匒匑厤厧喑喨喥喭啷噅喢喓喈喏喵喁喣喒喤啽喌喦啿喕喡喎圌堩堷"
  ],
  [
    "d8a1",
    "堙堞堧堣堨埵塈堥堜堛堳堿堶堮堹堸堭堬堻奡媯媔媟婺媢媞婸媦婼媥媬媕媮娷媄媊媗媃媋媩婻婽媌媜媏媓媝寪寍寋寔寑寊寎尌尰崷嵃嵫嵁嵋崿崵嵑嵎嵕崳崺嵒崽崱嵙嵂崹嵉崸崼崲崶嵀嵅幄幁彘徦徥徫惉悹惌惢惎惄愔"
  ],
  [
    "d940",
    "惲愊愖愅惵愓惸惼惾惁愃愘愝愐惿愄愋扊掔掱掰揎揥揨揯揃撝揳揊揠揶揕揲揵摡揟掾揝揜揄揘揓揂揇揌揋揈揰揗揙攲敧敪敤敜敨敥斌斝斞斮旐旒"
  ],
  [
    "d9a1",
    "晼晬晻暀晱晹晪晲朁椌棓椄棜椪棬棪棱椏棖棷棫棤棶椓椐棳棡椇棌椈楰梴椑棯棆椔棸棐棽棼棨椋椊椗棎棈棝棞棦棴棑椆棔棩椕椥棇欹欻欿欼殔殗殙殕殽毰毲毳氰淼湆湇渟湉溈渼渽湅湢渫渿湁湝湳渜渳湋湀湑渻渃渮湞"
  ],
  [
    "da40",
    "湨湜湡渱渨湠湱湫渹渢渰湓湥渧湸湤湷湕湹湒湦渵渶湚焠焞焯烻焮焱焣焥焢焲焟焨焺焛牋牚犈犉犆犅犋猒猋猰猢猱猳猧猲猭猦猣猵猌琮琬琰琫琖"
  ],
  [
    "daa1",
    "琚琡琭琱琤琣琝琩琠琲瓻甯畯畬痧痚痡痦痝痟痤痗皕皒盚睆睇睄睍睅睊睎睋睌矞矬硠硤硥硜硭硱硪确硰硩硨硞硢祴祳祲祰稂稊稃稌稄窙竦竤筊笻筄筈筌筎筀筘筅粢粞粨粡絘絯絣絓絖絧絪絏絭絜絫絒絔絩絑絟絎缾缿罥"
  ],
  [
    "db40",
    "罦羢羠羡翗聑聏聐胾胔腃腊腒腏腇脽腍脺臦臮臷臸臹舄舼舽舿艵茻菏菹萣菀菨萒菧菤菼菶萐菆菈菫菣莿萁菝菥菘菿菡菋菎菖菵菉萉萏菞萑萆菂菳"
  ],
  [
    "dba1",
    "菕菺菇菑菪萓菃菬菮菄菻菗菢萛菛菾蛘蛢蛦蛓蛣蛚蛪蛝蛫蛜蛬蛩蛗蛨蛑衈衖衕袺裗袹袸裀袾袶袼袷袽袲褁裉覕覘覗觝觚觛詎詍訹詙詀詗詘詄詅詒詈詑詊詌詏豟貁貀貺貾貰貹貵趄趀趉跘跓跍跇跖跜跏跕跙跈跗跅軯軷軺"
  ],
  [
    "dc40",
    "軹軦軮軥軵軧軨軶軫軱軬軴軩逭逴逯鄆鄬鄄郿郼鄈郹郻鄁鄀鄇鄅鄃酡酤酟酢酠鈁鈊鈥鈃鈚鈦鈏鈌鈀鈒釿釽鈆鈄鈧鈂鈜鈤鈙鈗鈅鈖镻閍閌閐隇陾隈"
  ],
  [
    "dca1",
    "隉隃隀雂雈雃雱雰靬靰靮頇颩飫鳦黹亃亄亶傽傿僆傮僄僊傴僈僂傰僁傺傱僋僉傶傸凗剺剸剻剼嗃嗛嗌嗐嗋嗊嗝嗀嗔嗄嗩喿嗒喍嗏嗕嗢嗖嗈嗲嗍嗙嗂圔塓塨塤塏塍塉塯塕塎塝塙塥塛堽塣塱壼嫇嫄嫋媺媸媱媵媰媿嫈媻嫆"
  ],
  [
    "dd40",
    "媷嫀嫊媴媶嫍媹媐寖寘寙尟尳嵱嵣嵊嵥嵲嵬嵞嵨嵧嵢巰幏幎幊幍幋廅廌廆廋廇彀徯徭惷慉慊愫慅愶愲愮慆愯慏愩慀戠酨戣戥戤揅揱揫搐搒搉搠搤"
  ],
  [
    "dda1",
    "搳摃搟搕搘搹搷搢搣搌搦搰搨摁搵搯搊搚摀搥搧搋揧搛搮搡搎敯斒旓暆暌暕暐暋暊暙暔晸朠楦楟椸楎楢楱椿楅楪椹楂楗楙楺楈楉椵楬椳椽楥棰楸椴楩楀楯楄楶楘楁楴楌椻楋椷楜楏楑椲楒椯楻椼歆歅歃歂歈歁殛嗀毻毼"
  ],
  [
    "de40",
    "毹毷毸溛滖滈溏滀溟溓溔溠溱溹滆滒溽滁溞滉溷溰滍溦滏溲溾滃滜滘溙溒溎溍溤溡溿溳滐滊溗溮溣煇煔煒煣煠煁煝煢煲煸煪煡煂煘煃煋煰煟煐煓"
  ],
  [
    "dea1",
    "煄煍煚牏犍犌犑犐犎猼獂猻猺獀獊獉瑄瑊瑋瑒瑑瑗瑀瑏瑐瑎瑂瑆瑍瑔瓡瓿瓾瓽甝畹畷榃痯瘏瘃痷痾痼痹痸瘐痻痶痭痵痽皙皵盝睕睟睠睒睖睚睩睧睔睙睭矠碇碚碔碏碄碕碅碆碡碃硹碙碀碖硻祼禂祽祹稑稘稙稒稗稕稢稓"
  ],
  [
    "df40",
    "稛稐窣窢窞竫筦筤筭筴筩筲筥筳筱筰筡筸筶筣粲粴粯綈綆綀綍絿綅絺綎絻綃絼綌綔綄絽綒罭罫罧罨罬羦羥羧翛翜耡腤腠腷腜腩腛腢腲朡腞腶腧腯"
  ],
  [
    "dfa1",
    "腄腡舝艉艄艀艂艅蓱萿葖葶葹蒏蒍葥葑葀蒆葧萰葍葽葚葙葴葳葝蔇葞萷萺萴葺葃葸萲葅萩菙葋萯葂萭葟葰萹葎葌葒葯蓅蒎萻葇萶萳葨葾葄萫葠葔葮葐蜋蜄蛷蜌蛺蛖蛵蝍蛸蜎蜉蜁蛶蜍蜅裖裋裍裎裞裛裚裌裐覅覛觟觥觤"
  ],
  [
    "e040",
    "觡觠觢觜触詶誆詿詡訿詷誂誄詵誃誁詴詺谼豋豊豥豤豦貆貄貅賌赨赩趑趌趎趏趍趓趔趐趒跰跠跬跱跮跐跩跣跢跧跲跫跴輆軿輁輀輅輇輈輂輋遒逿"
  ],
  [
    "e0a1",
    "遄遉逽鄐鄍鄏鄑鄖鄔鄋鄎酮酯鉈鉒鈰鈺鉦鈳鉥鉞銃鈮鉊鉆鉭鉬鉏鉠鉧鉯鈶鉡鉰鈱鉔鉣鉐鉲鉎鉓鉌鉖鈲閟閜閞閛隒隓隑隗雎雺雽雸雵靳靷靸靲頏頍頎颬飶飹馯馲馰馵骭骫魛鳪鳭鳧麀黽僦僔僗僨僳僛僪僝僤僓僬僰僯僣僠"
  ],
  [
    "e140",
    "凘劀劁勩勫匰厬嘧嘕嘌嘒嗼嘏嘜嘁嘓嘂嗺嘝嘄嗿嗹墉塼墐墘墆墁塿塴墋塺墇墑墎塶墂墈塻墔墏壾奫嫜嫮嫥嫕嫪嫚嫭嫫嫳嫢嫠嫛嫬嫞嫝嫙嫨嫟孷寠"
  ],
  [
    "e1a1",
    "寣屣嶂嶀嵽嶆嵺嶁嵷嶊嶉嶈嵾嵼嶍嵹嵿幘幙幓廘廑廗廎廜廕廙廒廔彄彃彯徶愬愨慁慞慱慳慒慓慲慬憀慴慔慺慛慥愻慪慡慖戩戧戫搫摍摛摝摴摶摲摳摽摵摦撦摎撂摞摜摋摓摠摐摿搿摬摫摙摥摷敳斠暡暠暟朅朄朢榱榶槉"
  ],
  [
    "e240",
    "榠槎榖榰榬榼榑榙榎榧榍榩榾榯榿槄榽榤槔榹槊榚槏榳榓榪榡榞槙榗榐槂榵榥槆歊歍歋殞殟殠毃毄毾滎滵滱漃漥滸漷滻漮漉潎漙漚漧漘漻漒滭漊"
  ],
  [
    "e2a1",
    "漶潳滹滮漭潀漰漼漵滫漇漎潃漅滽滶漹漜滼漺漟漍漞漈漡熇熐熉熀熅熂熏煻熆熁熗牄牓犗犕犓獃獍獑獌瑢瑳瑱瑵瑲瑧瑮甀甂甃畽疐瘖瘈瘌瘕瘑瘊瘔皸瞁睼瞅瞂睮瞀睯睾瞃碲碪碴碭碨硾碫碞碥碠碬碢碤禘禊禋禖禕禔禓"
  ],
  [
    "e340",
    "禗禈禒禐稫穊稰稯稨稦窨窫窬竮箈箜箊箑箐箖箍箌箛箎箅箘劄箙箤箂粻粿粼粺綧綷緂綣綪緁緀緅綝緎緄緆緋緌綯綹綖綼綟綦綮綩綡緉罳翢翣翥翞"
  ],
  [
    "e3a1",
    "耤聝聜膉膆膃膇膍膌膋舕蒗蒤蒡蒟蒺蓎蓂蒬蒮蒫蒹蒴蓁蓍蒪蒚蒱蓐蒝蒧蒻蒢蒔蓇蓌蒛蒩蒯蒨蓖蒘蒶蓏蒠蓗蓔蓒蓛蒰蒑虡蜳蜣蜨蝫蝀蜮蜞蜡蜙蜛蝃蜬蝁蜾蝆蜠蜲蜪蜭蜼蜒蜺蜱蜵蝂蜦蜧蜸蜤蜚蜰蜑裷裧裱裲裺裾裮裼裶裻"
  ],
  [
    "e440",
    "裰裬裫覝覡覟覞觩觫觨誫誙誋誒誏誖谽豨豩賕賏賗趖踉踂跿踍跽踊踃踇踆踅跾踀踄輐輑輎輍鄣鄜鄠鄢鄟鄝鄚鄤鄡鄛酺酲酹酳銥銤鉶銛鉺銠銔銪銍"
  ],
  [
    "e4a1",
    "銦銚銫鉹銗鉿銣鋮銎銂銕銢鉽銈銡銊銆銌銙銧鉾銇銩銝銋鈭隞隡雿靘靽靺靾鞃鞀鞂靻鞄鞁靿韎韍頖颭颮餂餀餇馝馜駃馹馻馺駂馽駇骱髣髧鬾鬿魠魡魟鳱鳲鳵麧僿儃儰僸儆儇僶僾儋儌僽儊劋劌勱勯噈噂噌嘵噁噊噉噆噘"
  ],
  [
    "e540",
    "噚噀嘳嘽嘬嘾嘸嘪嘺圚墫墝墱墠墣墯墬墥墡壿嫿嫴嫽嫷嫶嬃嫸嬂嫹嬁嬇嬅嬏屧嶙嶗嶟嶒嶢嶓嶕嶠嶜嶡嶚嶞幩幝幠幜緳廛廞廡彉徲憋憃慹憱憰憢憉"
  ],
  [
    "e5a1",
    "憛憓憯憭憟憒憪憡憍慦憳戭摮摰撖撠撅撗撜撏撋撊撌撣撟摨撱撘敶敺敹敻斲斳暵暰暩暲暷暪暯樀樆樗槥槸樕槱槤樠槿槬槢樛樝槾樧槲槮樔槷槧橀樈槦槻樍槼槫樉樄樘樥樏槶樦樇槴樖歑殥殣殢殦氁氀毿氂潁漦潾澇濆澒"
  ],
  [
    "e640",
    "澍澉澌潢潏澅潚澖潶潬澂潕潲潒潐潗澔澓潝漀潡潫潽潧澐潓澋潩潿澕潣潷潪潻熲熯熛熰熠熚熩熵熝熥熞熤熡熪熜熧熳犘犚獘獒獞獟獠獝獛獡獚獙"
  ],
  [
    "e6a1",
    "獢璇璉璊璆璁瑽璅璈瑼瑹甈甇畾瘥瘞瘙瘝瘜瘣瘚瘨瘛皜皝皞皛瞍瞏瞉瞈磍碻磏磌磑磎磔磈磃磄磉禚禡禠禜禢禛歶稹窲窴窳箷篋箾箬篎箯箹篊箵糅糈糌糋緷緛緪緧緗緡縃緺緦緶緱緰緮緟罶羬羰羭翭翫翪翬翦翨聤聧膣膟"
  ],
  [
    "e740",
    "膞膕膢膙膗舖艏艓艒艐艎艑蔤蔻蔏蔀蔩蔎蔉蔍蔟蔊蔧蔜蓻蔫蓺蔈蔌蓴蔪蓲蔕蓷蓫蓳蓼蔒蓪蓩蔖蓾蔨蔝蔮蔂蓽蔞蓶蔱蔦蓧蓨蓰蓯蓹蔘蔠蔰蔋蔙蔯虢"
  ],
  [
    "e7a1",
    "蝖蝣蝤蝷蟡蝳蝘蝔蝛蝒蝡蝚蝑蝞蝭蝪蝐蝎蝟蝝蝯蝬蝺蝮蝜蝥蝏蝻蝵蝢蝧蝩衚褅褌褔褋褗褘褙褆褖褑褎褉覢覤覣觭觰觬諏諆誸諓諑諔諕誻諗誾諀諅諘諃誺誽諙谾豍貏賥賟賙賨賚賝賧趠趜趡趛踠踣踥踤踮踕踛踖踑踙踦踧"
  ],
  [
    "e840",
    "踔踒踘踓踜踗踚輬輤輘輚輠輣輖輗遳遰遯遧遫鄯鄫鄩鄪鄲鄦鄮醅醆醊醁醂醄醀鋐鋃鋄鋀鋙銶鋏鋱鋟鋘鋩鋗鋝鋌鋯鋂鋨鋊鋈鋎鋦鋍鋕鋉鋠鋞鋧鋑鋓"
  ],
  [
    "e8a1",
    "銵鋡鋆銴镼閬閫閮閰隤隢雓霅霈霂靚鞊鞎鞈韐韏頞頝頦頩頨頠頛頧颲餈飺餑餔餖餗餕駜駍駏駓駔駎駉駖駘駋駗駌骳髬髫髳髲髱魆魃魧魴魱魦魶魵魰魨魤魬鳼鳺鳽鳿鳷鴇鴀鳹鳻鴈鴅鴄麃黓鼏鼐儜儓儗儚儑凞匴叡噰噠噮"
  ],
  [
    "e940",
    "噳噦噣噭噲噞噷圜圛壈墽壉墿墺壂墼壆嬗嬙嬛嬡嬔嬓嬐嬖嬨嬚嬠嬞寯嶬嶱嶩嶧嶵嶰嶮嶪嶨嶲嶭嶯嶴幧幨幦幯廩廧廦廨廥彋徼憝憨憖懅憴懆懁懌憺"
  ],
  [
    "e9a1",
    "憿憸憌擗擖擐擏擉撽撉擃擛擳擙攳敿敼斢曈暾曀曊曋曏暽暻暺曌朣樴橦橉橧樲橨樾橝橭橶橛橑樨橚樻樿橁橪橤橐橏橔橯橩橠樼橞橖橕橍橎橆歕歔歖殧殪殫毈毇氄氃氆澭濋澣濇澼濎濈潞濄澽澞濊澨瀄澥澮澺澬澪濏澿澸"
  ],
  [
    "ea40",
    "澢濉澫濍澯澲澰燅燂熿熸燖燀燁燋燔燊燇燏熽燘熼燆燚燛犝犞獩獦獧獬獥獫獪瑿璚璠璔璒璕璡甋疀瘯瘭瘱瘽瘳瘼瘵瘲瘰皻盦瞚瞝瞡瞜瞛瞢瞣瞕瞙"
  ],
  [
    "eaa1",
    "瞗磝磩磥磪磞磣磛磡磢磭磟磠禤穄穈穇窶窸窵窱窷篞篣篧篝篕篥篚篨篹篔篪篢篜篫篘篟糒糔糗糐糑縒縡縗縌縟縠縓縎縜縕縚縢縋縏縖縍縔縥縤罃罻罼罺羱翯耪耩聬膱膦膮膹膵膫膰膬膴膲膷膧臲艕艖艗蕖蕅蕫蕍蕓蕡蕘"
  ],
  [
    "eb40",
    "蕀蕆蕤蕁蕢蕄蕑蕇蕣蔾蕛蕱蕎蕮蕵蕕蕧蕠薌蕦蕝蕔蕥蕬虣虥虤螛螏螗螓螒螈螁螖螘蝹螇螣螅螐螑螝螄螔螜螚螉褞褦褰褭褮褧褱褢褩褣褯褬褟觱諠"
  ],
  [
    "eba1",
    "諢諲諴諵諝謔諤諟諰諈諞諡諨諿諯諻貑貒貐賵賮賱賰賳赬赮趥趧踳踾踸蹀蹅踶踼踽蹁踰踿躽輶輮輵輲輹輷輴遶遹遻邆郺鄳鄵鄶醓醐醑醍醏錧錞錈錟錆錏鍺錸錼錛錣錒錁鍆錭錎錍鋋錝鋺錥錓鋹鋷錴錂錤鋿錩錹錵錪錔錌"
  ],
  [
    "ec40",
    "錋鋾錉錀鋻錖閼闍閾閹閺閶閿閵閽隩雔霋霒霐鞙鞗鞔韰韸頵頯頲餤餟餧餩馞駮駬駥駤駰駣駪駩駧骹骿骴骻髶髺髹髷鬳鮀鮅鮇魼魾魻鮂鮓鮒鮐魺鮕"
  ],
  [
    "eca1",
    "魽鮈鴥鴗鴠鴞鴔鴩鴝鴘鴢鴐鴙鴟麈麆麇麮麭黕黖黺鼒鼽儦儥儢儤儠儩勴嚓嚌嚍嚆嚄嚃噾嚂噿嚁壖壔壏壒嬭嬥嬲嬣嬬嬧嬦嬯嬮孻寱寲嶷幬幪徾徻懃憵憼懧懠懥懤懨懞擯擩擣擫擤擨斁斀斶旚曒檍檖檁檥檉檟檛檡檞檇檓檎"
  ],
  [
    "ed40",
    "檕檃檨檤檑橿檦檚檅檌檒歛殭氉濌澩濴濔濣濜濭濧濦濞濲濝濢濨燡燱燨燲燤燰燢獳獮獯璗璲璫璐璪璭璱璥璯甐甑甒甏疄癃癈癉癇皤盩瞵瞫瞲瞷瞶"
  ],
  [
    "eda1",
    "瞴瞱瞨矰磳磽礂磻磼磲礅磹磾礄禫禨穜穛穖穘穔穚窾竀竁簅簏篲簀篿篻簎篴簋篳簂簉簃簁篸篽簆篰篱簐簊糨縭縼繂縳顈縸縪繉繀繇縩繌縰縻縶繄縺罅罿罾罽翴翲耬膻臄臌臊臅臇膼臩艛艚艜薃薀薏薧薕薠薋薣蕻薤薚薞"
  ],
  [
    "ee40",
    "蕷蕼薉薡蕺蕸蕗薎薖薆薍薙薝薁薢薂薈薅蕹蕶薘薐薟虨螾螪螭蟅螰螬螹螵螼螮蟉蟃蟂蟌螷螯蟄蟊螴螶螿螸螽蟞螲褵褳褼褾襁襒褷襂覭覯覮觲觳謞"
  ],
  [
    "eea1",
    "謘謖謑謅謋謢謏謒謕謇謍謈謆謜謓謚豏豰豲豱豯貕貔賹赯蹎蹍蹓蹐蹌蹇轃轀邅遾鄸醚醢醛醙醟醡醝醠鎡鎃鎯鍤鍖鍇鍼鍘鍜鍶鍉鍐鍑鍠鍭鎏鍌鍪鍹鍗鍕鍒鍏鍱鍷鍻鍡鍞鍣鍧鎀鍎鍙闇闀闉闃闅閷隮隰隬霠霟霘霝霙鞚鞡鞜"
  ],
  [
    "ef40",
    "鞞鞝韕韔韱顁顄顊顉顅顃餥餫餬餪餳餲餯餭餱餰馘馣馡騂駺駴駷駹駸駶駻駽駾駼騃骾髾髽鬁髼魈鮚鮨鮞鮛鮦鮡鮥鮤鮆鮢鮠鮯鴳鵁鵧鴶鴮鴯鴱鴸鴰"
  ],
  [
    "efa1",
    "鵅鵂鵃鴾鴷鵀鴽翵鴭麊麉麍麰黈黚黻黿鼤鼣鼢齔龠儱儭儮嚘嚜嚗嚚嚝嚙奰嬼屩屪巀幭幮懘懟懭懮懱懪懰懫懖懩擿攄擽擸攁攃擼斔旛曚曛曘櫅檹檽櫡櫆檺檶檷櫇檴檭歞毉氋瀇瀌瀍瀁瀅瀔瀎濿瀀濻瀦濼濷瀊爁燿燹爃燽獶"
  ],
  [
    "f040",
    "璸瓀璵瓁璾璶璻瓂甔甓癜癤癙癐癓癗癚皦皽盬矂瞺磿礌礓礔礉礐礒礑禭禬穟簜簩簙簠簟簭簝簦簨簢簥簰繜繐繖繣繘繢繟繑繠繗繓羵羳翷翸聵臑臒"
  ],
  [
    "f0a1",
    "臐艟艞薴藆藀藃藂薳薵薽藇藄薿藋藎藈藅薱薶藒蘤薸薷薾虩蟧蟦蟢蟛蟫蟪蟥蟟蟳蟤蟔蟜蟓蟭蟘蟣螤蟗蟙蠁蟴蟨蟝襓襋襏襌襆襐襑襉謪謧謣謳謰謵譇謯謼謾謱謥謷謦謶謮謤謻謽謺豂豵貙貘貗賾贄贂贀蹜蹢蹠蹗蹖蹞蹥蹧"
  ],
  [
    "f140",
    "蹛蹚蹡蹝蹩蹔轆轇轈轋鄨鄺鄻鄾醨醥醧醯醪鎵鎌鎒鎷鎛鎝鎉鎧鎎鎪鎞鎦鎕鎈鎙鎟鎍鎱鎑鎲鎤鎨鎴鎣鎥闒闓闑隳雗雚巂雟雘雝霣霢霥鞬鞮鞨鞫鞤鞪"
  ],
  [
    "f1a1",
    "鞢鞥韗韙韖韘韺顐顑顒颸饁餼餺騏騋騉騍騄騑騊騅騇騆髀髜鬈鬄鬅鬩鬵魊魌魋鯇鯆鯃鮿鯁鮵鮸鯓鮶鯄鮹鮽鵜鵓鵏鵊鵛鵋鵙鵖鵌鵗鵒鵔鵟鵘鵚麎麌黟鼁鼀鼖鼥鼫鼪鼩鼨齌齕儴儵劖勷厴嚫嚭嚦嚧嚪嚬壚壝壛夒嬽嬾嬿巃幰"
  ],
  [
    "f240",
    "徿懻攇攐攍攉攌攎斄旞旝曞櫧櫠櫌櫑櫙櫋櫟櫜櫐櫫櫏櫍櫞歠殰氌瀙瀧瀠瀖瀫瀡瀢瀣瀩瀗瀤瀜瀪爌爊爇爂爅犥犦犤犣犡瓋瓅璷瓃甖癠矉矊矄矱礝礛"
  ],
  [
    "f2a1",
    "礡礜礗礞禰穧穨簳簼簹簬簻糬糪繶繵繸繰繷繯繺繲繴繨罋罊羃羆羷翽翾聸臗臕艤艡艣藫藱藭藙藡藨藚藗藬藲藸藘藟藣藜藑藰藦藯藞藢蠀蟺蠃蟶蟷蠉蠌蠋蠆蟼蠈蟿蠊蠂襢襚襛襗襡襜襘襝襙覈覷覶觶譐譈譊譀譓譖譔譋譕"
  ],
  [
    "f340",
    "譑譂譒譗豃豷豶貚贆贇贉趬趪趭趫蹭蹸蹳蹪蹯蹻軂轒轑轏轐轓辴酀鄿醰醭鏞鏇鏏鏂鏚鏐鏹鏬鏌鏙鎩鏦鏊鏔鏮鏣鏕鏄鏎鏀鏒鏧镽闚闛雡霩霫霬霨霦"
  ],
  [
    "f3a1",
    "鞳鞷鞶韝韞韟顜顙顝顗颿颽颻颾饈饇饃馦馧騚騕騥騝騤騛騢騠騧騣騞騜騔髂鬋鬊鬎鬌鬷鯪鯫鯠鯞鯤鯦鯢鯰鯔鯗鯬鯜鯙鯥鯕鯡鯚鵷鶁鶊鶄鶈鵱鶀鵸鶆鶋鶌鵽鵫鵴鵵鵰鵩鶅鵳鵻鶂鵯鵹鵿鶇鵨麔麑黀黼鼭齀齁齍齖齗齘匷嚲"
  ],
  [
    "f440",
    "嚵嚳壣孅巆巇廮廯忀忁懹攗攖攕攓旟曨曣曤櫳櫰櫪櫨櫹櫱櫮櫯瀼瀵瀯瀷瀴瀱灂瀸瀿瀺瀹灀瀻瀳灁爓爔犨獽獼璺皫皪皾盭矌矎矏矍矲礥礣礧礨礤礩"
  ],
  [
    "f4a1",
    "禲穮穬穭竷籉籈籊籇籅糮繻繾纁纀羺翿聹臛臙舋艨艩蘢藿蘁藾蘛蘀藶蘄蘉蘅蘌藽蠙蠐蠑蠗蠓蠖襣襦覹觷譠譪譝譨譣譥譧譭趮躆躈躄轙轖轗轕轘轚邍酃酁醷醵醲醳鐋鐓鏻鐠鐏鐔鏾鐕鐐鐨鐙鐍鏵鐀鏷鐇鐎鐖鐒鏺鐉鏸鐊鏿"
  ],
  [
    "f540",
    "鏼鐌鏶鐑鐆闞闠闟霮霯鞹鞻韽韾顠顢顣顟飁飂饐饎饙饌饋饓騲騴騱騬騪騶騩騮騸騭髇髊髆鬐鬒鬑鰋鰈鯷鰅鰒鯸鱀鰇鰎鰆鰗鰔鰉鶟鶙鶤鶝鶒鶘鶐鶛"
  ],
  [
    "f5a1",
    "鶠鶔鶜鶪鶗鶡鶚鶢鶨鶞鶣鶿鶩鶖鶦鶧麙麛麚黥黤黧黦鼰鼮齛齠齞齝齙龑儺儹劘劗囃嚽嚾孈孇巋巏廱懽攛欂櫼欃櫸欀灃灄灊灈灉灅灆爝爚爙獾甗癪矐礭礱礯籔籓糲纊纇纈纋纆纍罍羻耰臝蘘蘪蘦蘟蘣蘜蘙蘧蘮蘡蘠蘩蘞蘥"
  ],
  [
    "f640",
    "蠩蠝蠛蠠蠤蠜蠫衊襭襩襮襫觺譹譸譅譺譻贐贔趯躎躌轞轛轝酆酄酅醹鐿鐻鐶鐩鐽鐼鐰鐹鐪鐷鐬鑀鐱闥闤闣霵霺鞿韡顤飉飆飀饘饖騹騽驆驄驂驁騺"
  ],
  [
    "f6a1",
    "騿髍鬕鬗鬘鬖鬺魒鰫鰝鰜鰬鰣鰨鰩鰤鰡鶷鶶鶼鷁鷇鷊鷏鶾鷅鷃鶻鶵鷎鶹鶺鶬鷈鶱鶭鷌鶳鷍鶲鹺麜黫黮黭鼛鼘鼚鼱齎齥齤龒亹囆囅囋奱孋孌巕巑廲攡攠攦攢欋欈欉氍灕灖灗灒爞爟犩獿瓘瓕瓙瓗癭皭礵禴穰穱籗籜籙籛籚"
  ],
  [
    "f740",
    "糴糱纑罏羇臞艫蘴蘵蘳蘬蘲蘶蠬蠨蠦蠪蠥襱覿覾觻譾讄讂讆讅譿贕躕躔躚躒躐躖躗轠轢酇鑌鑐鑊鑋鑏鑇鑅鑈鑉鑆霿韣顪顩飋饔饛驎驓驔驌驏驈驊"
  ],
  [
    "f7a1",
    "驉驒驐髐鬙鬫鬻魖魕鱆鱈鰿鱄鰹鰳鱁鰼鰷鰴鰲鰽鰶鷛鷒鷞鷚鷋鷐鷜鷑鷟鷩鷙鷘鷖鷵鷕鷝麶黰鼵鼳鼲齂齫龕龢儽劙壨壧奲孍巘蠯彏戁戃戄攩攥斖曫欑欒欏毊灛灚爢玂玁玃癰矔籧籦纕艬蘺虀蘹蘼蘱蘻蘾蠰蠲蠮蠳襶襴襳觾"
  ],
  [
    "f840",
    "讌讎讋讈豅贙躘轤轣醼鑢鑕鑝鑗鑞韄韅頀驖驙鬞鬟鬠鱒鱘鱐鱊鱍鱋鱕鱙鱌鱎鷻鷷鷯鷣鷫鷸鷤鷶鷡鷮鷦鷲鷰鷢鷬鷴鷳鷨鷭黂黐黲黳鼆鼜鼸鼷鼶齃齏"
  ],
  [
    "f8a1",
    "齱齰齮齯囓囍孎屭攭曭曮欓灟灡灝灠爣瓛瓥矕礸禷禶籪纗羉艭虃蠸蠷蠵衋讔讕躞躟躠躝醾醽釂鑫鑨鑩雥靆靃靇韇韥驞髕魙鱣鱧鱦鱢鱞鱠鸂鷾鸇鸃鸆鸅鸀鸁鸉鷿鷽鸄麠鼞齆齴齵齶囔攮斸欘欙欗欚灢爦犪矘矙礹籩籫糶纚"
  ],
  [
    "f940",
    "纘纛纙臠臡虆虇虈襹襺襼襻觿讘讙躥躤躣鑮鑭鑯鑱鑳靉顲饟鱨鱮鱭鸋鸍鸐鸏鸒鸑麡黵鼉齇齸齻齺齹圞灦籯蠼趲躦釃鑴鑸鑶鑵驠鱴鱳鱱鱵鸔鸓黶鼊"
  ],
  [
    "f9a1",
    "龤灨灥糷虪蠾蠽蠿讞貜躩軉靋顳顴飌饡馫驤驦驧鬤鸕鸗齈戇欞爧虌躨钂钀钁驩驨鬮鸙爩虋讟钃鱹麷癵驫鱺鸝灩灪麤齾齉龘碁銹裏墻恒粧嫺╔╦╗╠╬╣╚╩╝╒╤╕╞╪╡╘╧╛╓╥╖╟╫╢╙╨╜║═╭╮╰╯▓"
  ]
], r_ = [
  [
    "8740",
    "䏰䰲䘃䖦䕸𧉧䵷䖳𧲱䳢𧳅㮕䜶䝄䱇䱀𤊿𣘗𧍒𦺋𧃒䱗𪍑䝏䗚䲅𧱬䴇䪤䚡𦬣爥𥩔𡩣𣸆𣽡晍囻"
  ],
  [
    "8767",
    "綕夝𨮹㷴霴𧯯寛𡵞媤㘥𩺰嫑宷峼杮薓𩥅瑡璝㡵𡵓𣚞𦀡㻬"
  ],
  [
    "87a1",
    "𥣞㫵竼龗𤅡𨤍𣇪𠪊𣉞䌊蒄龖鐯䤰蘓墖靊鈘秐稲晠権袝瑌篅枂稬剏遆㓦珄𥶹瓆鿇垳䤯呌䄱𣚎堘穲𧭥讏䚮𦺈䆁𥶙箮𢒼鿈𢓁𢓉𢓌鿉蔄𣖻䂴鿊䓡𪷿拁灮鿋"
  ],
  [
    "8840",
    "㇀",
    4,
    "𠄌㇅𠃑𠃍㇆㇇𠃋𡿨㇈𠃊㇉㇊㇋㇌𠄎㇍㇎ĀÁǍÀĒÉĚÈŌÓǑÒ࿿Ê̄Ế࿿Ê̌ỀÊāáǎàɑēéěèīíǐìōóǒòūúǔùǖǘǚ"
  ],
  [
    "88a1",
    "ǜü࿿ê̄ế࿿ê̌ềêɡ⏚⏛"
  ],
  [
    "8940",
    "𪎩𡅅"
  ],
  [
    "8943",
    "攊"
  ],
  [
    "8946",
    "丽滝鵎釟"
  ],
  [
    "894c",
    "𧜵撑会伨侨兖兴农凤务动医华发变团声处备夲头学实実岚庆总斉柾栄桥济炼电纤纬纺织经统缆缷艺苏药视设询车轧轮"
  ],
  [
    "89a1",
    "琑糼緍楆竉刧"
  ],
  [
    "89ab",
    "醌碸酞肼"
  ],
  [
    "89b0",
    "贋胶𠧧"
  ],
  [
    "89b5",
    "肟黇䳍鷉鸌䰾𩷶𧀎鸊𪄳㗁"
  ],
  [
    "89c1",
    "溚舾甙"
  ],
  [
    "89c5",
    "䤑马骏龙禇𨑬𡷊𠗐𢫦两亁亀亇亿仫伷㑌侽㹈倃傈㑽㒓㒥円夅凛凼刅争剹劐匧㗇厩㕑厰㕓参吣㕭㕲㚁咓咣咴咹哐哯唘唣唨㖘唿㖥㖿嗗㗅"
  ],
  [
    "8a40",
    "𧶄唥"
  ],
  [
    "8a43",
    "𠱂𠴕𥄫喐𢳆㧬𠍁蹆𤶸𩓥䁓𨂾睺𢰸㨴䟕𨅝𦧲𤷪擝𠵼𠾴𠳕𡃴撍蹾𠺖𠰋𠽤𢲩𨉖𤓓"
  ],
  [
    "8a64",
    "𠵆𩩍𨃩䟴𤺧𢳂骲㩧𩗴㿭㔆𥋇𩟔𧣈𢵄鵮頕"
  ],
  [
    "8a76",
    "䏙𦂥撴哣𢵌𢯊𡁷㧻𡁯"
  ],
  [
    "8aa1",
    "𦛚𦜖𧦠擪𥁒𠱃蹨𢆡𨭌𠜱"
  ],
  [
    "8aac",
    "䠋𠆩㿺塳𢶍"
  ],
  [
    "8ab2",
    "𤗈𠓼𦂗𠽌𠶖啹䂻䎺"
  ],
  [
    "8abb",
    "䪴𢩦𡂝膪飵𠶜捹㧾𢝵跀嚡摼㹃"
  ],
  [
    "8ac9",
    "𪘁𠸉𢫏𢳉"
  ],
  [
    "8ace",
    "𡃈𣧂㦒㨆𨊛㕸𥹉𢃇噒𠼱𢲲𩜠㒼氽𤸻"
  ],
  [
    "8adf",
    "𧕴𢺋𢈈𪙛𨳍𠹺𠰴𦠜羓𡃏𢠃𢤹㗻𥇣𠺌𠾍𠺪㾓𠼰𠵇𡅏𠹌"
  ],
  [
    "8af6",
    "𠺫𠮩𠵈𡃀𡄽㿹𢚖搲𠾭"
  ],
  [
    "8b40",
    "𣏴𧘹𢯎𠵾𠵿𢱑𢱕㨘𠺘𡃇𠼮𪘲𦭐𨳒𨶙𨳊閪哌苄喹"
  ],
  [
    "8b55",
    "𩻃鰦骶𧝞𢷮煀腭胬尜𦕲脴㞗卟𨂽醶𠻺𠸏𠹷𠻻㗝𤷫㘉𠳖嚯𢞵𡃉𠸐𠹸𡁸𡅈𨈇𡑕𠹹𤹐𢶤婔𡀝𡀞𡃵𡃶垜𠸑"
  ],
  [
    "8ba1",
    "𧚔𨋍𠾵𠹻𥅾㜃𠾶𡆀𥋘𪊽𤧚𡠺𤅷𨉼墙剨㘚𥜽箲孨䠀䬬鼧䧧鰟鮍𥭴𣄽嗻㗲嚉丨夂𡯁屮靑𠂆乛亻㔾尣彑忄㣺扌攵歺氵氺灬爫丬犭𤣩罒礻糹罓𦉪㓁"
  ],
  [
    "8bde",
    "𦍋耂肀𦘒𦥑卝衤见𧢲讠贝钅镸长门𨸏韦页风飞饣𩠐鱼鸟黄歯龜丷𠂇阝户钢"
  ],
  [
    "8c40",
    "倻淾𩱳龦㷉袏𤅎灷峵䬠𥇍㕙𥴰愢𨨲辧釶熑朙玺𣊁𪄇㲋𡦀䬐磤琂冮𨜏䀉橣𪊺䈣蘏𠩯稪𩥇𨫪靕灍匤𢁾鏴盙𨧣龧矝亣俰傼丯众龨吴綋墒壐𡶶庒庙忂𢜒斋"
  ],
  [
    "8ca1",
    "𣏹椙橃𣱣泿"
  ],
  [
    "8ca7",
    "爀𤔅玌㻛𤨓嬕璹讃𥲤𥚕窓篬糃繬苸薗龩袐龪躹龫迏蕟駠鈡龬𨶹𡐿䁱䊢娚"
  ],
  [
    "8cc9",
    "顨杫䉶圽"
  ],
  [
    "8cce",
    "藖𤥻芿𧄍䲁𦵴嵻𦬕𦾾龭龮宖龯曧繛湗秊㶈䓃𣉖𢞖䎚䔶"
  ],
  [
    "8ce6",
    "峕𣬚諹屸㴒𣕑嵸龲煗䕘𤃬𡸣䱷㥸㑊𠆤𦱁諌侴𠈹妿腬顖𩣺弻"
  ],
  [
    "8d40",
    "𠮟"
  ],
  [
    "8d42",
    "𢇁𨥭䄂䚻𩁹㼇龳𪆵䃸㟖䛷𦱆䅼𨚲𧏿䕭㣔𥒚䕡䔛䶉䱻䵶䗪㿈𤬏㙡䓞䒽䇭崾嵈嵖㷼㠏嶤嶹㠠㠸幂庽弥徃㤈㤔㤿㥍惗愽峥㦉憷憹懏㦸戬抐拥挘㧸嚱"
  ],
  [
    "8da1",
    "㨃揢揻搇摚㩋擀崕嘡龟㪗斆㪽旿晓㫲暒㬢朖㭂枤栀㭘桊梄㭲㭱㭻椉楃牜楤榟榅㮼槖㯝橥橴橱檂㯬檙㯲檫檵櫔櫶殁毁毪汵沪㳋洂洆洦涁㳯涤涱渕渘温溆𨧀溻滢滚齿滨滩漤漴㵆𣽁澁澾㵪㵵熷岙㶊瀬㶑灐灔灯灿炉𠌥䏁㗱𠻘"
  ],
  [
    "8e40",
    "𣻗垾𦻓焾𥟠㙎榢𨯩孴穉𥣡𩓙穥穽𥦬窻窰竂竃燑𦒍䇊竚竝竪䇯咲𥰁笋筕笩𥌎𥳾箢筯莜𥮴𦱿篐萡箒箸𥴠㶭𥱥蒒篺簆簵𥳁籄粃𤢂粦晽𤕸糉糇糦籴糳糵糎"
  ],
  [
    "8ea1",
    "繧䔝𦹄絝𦻖璍綉綫焵綳緒𤁗𦀩緤㴓緵𡟹緥𨍭縝𦄡𦅚繮纒䌫鑬縧罀罁罇礶𦋐駡羗𦍑羣𡙡𠁨䕜𣝦䔃𨌺翺𦒉者耈耝耨耯𪂇𦳃耻耼聡𢜔䦉𦘦𣷣𦛨朥肧𨩈脇脚墰𢛶汿𦒘𤾸擧𡒊舘𡡞橓𤩥𤪕䑺舩𠬍𦩒𣵾俹𡓽蓢荢𦬊𤦧𣔰𡝳𣷸芪椛芳䇛"
  ],
  [
    "8f40",
    "蕋苐茚𠸖𡞴㛁𣅽𣕚艻苢茘𣺋𦶣𦬅𦮗𣗎㶿茝嗬莅䔋𦶥莬菁菓㑾𦻔橗蕚㒖𦹂𢻯葘𥯤葱㷓䓤檧葊𣲵祘蒨𦮖𦹷𦹃蓞萏莑䒠蒓蓤𥲑䉀𥳀䕃蔴嫲𦺙䔧蕳䔖枿蘖"
  ],
  [
    "8fa1",
    "𨘥𨘻藁𧂈蘂𡖂𧃍䕫䕪蘨㙈𡢢号𧎚虾蝱𪃸蟮𢰧螱蟚蠏噡虬桖䘏衅衆𧗠𣶹𧗤衞袜䙛袴袵揁装睷𧜏覇覊覦覩覧覼𨨥觧𧤤𧪽誜瞓釾誐𧩙竩𧬺𣾏䜓𧬸煼謌謟𥐰𥕥謿譌譍誩𤩺讐讛誯𡛟䘕衏貛𧵔𧶏貫㜥𧵓賖𧶘𧶽贒贃𡤐賛灜贑𤳉㻐起"
  ],
  [
    "9040",
    "趩𨀂𡀔𤦊㭼𨆼𧄌竧躭躶軃鋔輙輭𨍥𨐒辥錃𪊟𠩐辳䤪𨧞𨔽𣶻廸𣉢迹𪀔𨚼𨔁𢌥㦀𦻗逷𨔼𧪾遡𨕬𨘋邨𨜓郄𨛦邮都酧㫰醩釄粬𨤳𡺉鈎沟鉁鉢𥖹銹𨫆𣲛𨬌𥗛"
  ],
  [
    "90a1",
    "𠴱錬鍫𨫡𨯫炏嫃𨫢𨫥䥥鉄𨯬𨰹𨯿鍳鑛躼閅閦鐦閠濶䊹𢙺𨛘𡉼𣸮䧟氜陻隖䅬隣𦻕懚隶磵𨫠隽双䦡𦲸𠉴𦐐𩂯𩃥𤫑𡤕𣌊霱虂霶䨏䔽䖅𤫩灵孁霛靜𩇕靗孊𩇫靟鐥僐𣂷𣂼鞉鞟鞱鞾韀韒韠𥑬韮琜𩐳響韵𩐝𧥺䫑頴頳顋顦㬎𧅵㵑𠘰𤅜"
  ],
  [
    "9140",
    "𥜆飊颷飈飇䫿𦴧𡛓喰飡飦飬鍸餹𤨩䭲𩡗𩤅駵騌騻騐驘𥜥㛄𩂱𩯕髠髢𩬅髴䰎鬔鬭𨘀倴鬴𦦨㣃𣁽魐魀𩴾婅𡡣鮎𤉋鰂鯿鰌𩹨鷔𩾷𪆒𪆫𪃡𪄣𪇟鵾鶃𪄴鸎梈"
  ],
  [
    "91a1",
    "鷄𢅛𪆓𪈠𡤻𪈳鴹𪂹𪊴麐麕麞麢䴴麪麯𤍤黁㭠㧥㴝伲㞾𨰫鼂鼈䮖鐤𦶢鼗鼖鼹嚟嚊齅馸𩂋韲葿齢齩竜龎爖䮾𤥵𤦻煷𤧸𤍈𤩑玞𨯚𡣺禟𨥾𨸶鍩鏳𨩄鋬鎁鏋𨥬𤒹爗㻫睲穃烐𤑳𤏸煾𡟯炣𡢾𣖙㻇𡢅𥐯𡟸㜢𡛻𡠹㛡𡝴𡣑𥽋㜣𡛀坛𤨥𡏾𡊨"
  ],
  [
    "9240",
    "𡏆𡒶蔃𣚦蔃葕𤦔𧅥𣸱𥕜𣻻𧁒䓴𣛮𩦝𦼦柹㜳㰕㷧塬𡤢栐䁗𣜿𤃡𤂋𤄏𦰡哋嚞𦚱嚒𠿟𠮨𠸍鏆𨬓鎜仸儫㠙𤐶亼𠑥𠍿佋侊𥙑婨𠆫𠏋㦙𠌊𠐔㐵伩𠋀𨺳𠉵諚𠈌亘"
  ],
  [
    "92a1",
    "働儍侢伃𤨎𣺊佂倮偬傁俌俥偘僼兙兛兝兞湶𣖕𣸹𣺿浲𡢄𣺉冨凃𠗠䓝𠒣𠒒𠒑赺𨪜𠜎剙劤𠡳勡鍮䙺熌𤎌𠰠𤦬𡃤槑𠸝瑹㻞璙琔瑖玘䮎𤪼𤂍叐㖄爏𤃉喴𠍅响𠯆圝鉝雴鍦埝垍坿㘾壋媙𨩆𡛺𡝯𡜐娬妸銏婾嫏娒𥥆𡧳𡡡𤊕㛵洅瑃娡𥺃"
  ],
  [
    "9340",
    "媁𨯗𠐓鏠璌𡌃焅䥲鐈𨧻鎽㞠尞岞幞幈𡦖𡥼𣫮廍孏𡤃𡤄㜁𡢠㛝𡛾㛓脪𨩇𡶺𣑲𨦨弌弎𡤧𡞫婫𡜻孄蘔𧗽衠恾𢡠𢘫忛㺸𢖯𢖾𩂈𦽳懀𠀾𠁆𢘛憙憘恵𢲛𢴇𤛔𩅍"
  ],
  [
    "93a1",
    "摱𤙥𢭪㨩𢬢𣑐𩣪𢹸挷𪑛撶挱揑𤧣𢵧护𢲡搻敫楲㯴𣂎𣊭𤦉𣊫唍𣋠𡣙𩐿曎𣊉𣆳㫠䆐𥖄𨬢𥖏𡛼𥕛𥐥磮𣄃𡠪𣈴㑤𣈏𣆂𤋉暎𦴤晫䮓昰𧡰𡷫晣𣋒𣋡昞𥡲㣑𣠺𣞼㮙𣞢𣏾瓐㮖枏𤘪梶栞㯄檾㡣𣟕𤒇樳橒櫉欅𡤒攑梘橌㯗橺歗𣿀𣲚鎠鋲𨯪𨫋"
  ],
  [
    "9440",
    "銉𨀞𨧜鑧涥漋𤧬浧𣽿㶏渄𤀼娽渊塇洤硂焻𤌚𤉶烱牐犇犔𤞏𤜥兹𤪤𠗫瑺𣻸𣙟𤩊𤤗𥿡㼆㺱𤫟𨰣𣼵悧㻳瓌琼鎇琷䒟𦷪䕑疃㽣𤳙𤴆㽘畕癳𪗆㬙瑨𨫌𤦫𤦎㫻"
  ],
  [
    "94a1",
    "㷍𤩎㻿𤧅𤣳釺圲鍂𨫣𡡤僟𥈡𥇧睸𣈲眎眏睻𤚗𣞁㩞𤣰琸璛㺿𤪺𤫇䃈𤪖𦆮錇𥖁砞碍碈磒珐祙𧝁𥛣䄎禛蒖禥樭𣻺稺秴䅮𡛦䄲鈵秱𠵌𤦌𠊙𣶺𡝮㖗啫㕰㚪𠇔𠰍竢婙𢛵𥪯𥪜娍𠉛磰娪𥯆竾䇹籝籭䈑𥮳𥺼𥺦糍𤧹𡞰粎籼粮檲緜縇緓罎𦉡"
  ],
  [
    "9540",
    "𦅜𧭈綗𥺂䉪𦭵𠤖柖𠁎𣗏埄𦐒𦏸𤥢翝笧𠠬𥫩𥵃笌𥸎駦虅驣樜𣐿㧢𤧷𦖭騟𦖠蒀𧄧𦳑䓪脷䐂胆脉腂𦞴飃𦩂艢艥𦩑葓𦶧蘐𧈛媆䅿𡡀嬫𡢡嫤𡣘蚠蜨𣶏蠭𧐢娂"
  ],
  [
    "95a1",
    "衮佅袇袿裦襥襍𥚃襔𧞅𧞄𨯵𨯙𨮜𨧹㺭蒣䛵䛏㟲訽訜𩑈彍鈫𤊄旔焩烄𡡅鵭貟賩𧷜妚矃姰䍮㛔踪躧𤰉輰轊䋴汘澻𢌡䢛潹溋𡟚鯩㚵𤤯邻邗啱䤆醻鐄𨩋䁢𨫼鐧𨰝𨰻蓥訫閙閧閗閖𨴴瑅㻂𤣿𤩂𤏪㻧𣈥随𨻧𨹦𨹥㻌𤧭𤩸𣿮琒瑫㻼靁𩂰"
  ],
  [
    "9640",
    "桇䨝𩂓𥟟靝鍨𨦉𨰦𨬯𦎾銺嬑譩䤼珹𤈛鞛靱餸𠼦巁𨯅𤪲頟𩓚鋶𩗗釥䓀𨭐𤩧𨭤飜𨩅㼀鈪䤥萔餻饍𧬆㷽馛䭯馪驜𨭥𥣈檏騡嫾騯𩣱䮐𩥈馼䮽䮗鍽塲𡌂堢𤦸"
  ],
  [
    "96a1",
    "𡓨硄𢜟𣶸棅㵽鑘㤧慐𢞁𢥫愇鱏鱓鱻鰵鰐魿鯏𩸭鮟𪇵𪃾鴡䲮𤄄鸘䲰鴌𪆴𪃭𪃳𩤯鶥蒽𦸒𦿟𦮂藼䔳𦶤𦺄𦷰萠藮𦸀𣟗𦁤秢𣖜𣙀䤭𤧞㵢鏛銾鍈𠊿碹鉷鑍俤㑀遤𥕝砽硔碶硋𡝗𣇉𤥁㚚佲濚濙瀞瀞吔𤆵垻壳垊鴖埗焴㒯𤆬燫𦱀𤾗嬨𡞵𨩉"
  ],
  [
    "9740",
    "愌嫎娋䊼𤒈㜬䭻𨧼鎻鎸𡣖𠼝葲𦳀𡐓𤋺𢰦𤏁妔𣶷𦝁綨𦅛𦂤𤦹𤦋𨧺鋥珢㻩璴𨭣𡢟㻡𤪳櫘珳珻㻖𤨾𤪔𡟙𤩦𠎧𡐤𤧥瑈𤤖炥𤥶銄珦鍟𠓾錱𨫎𨨖鎆𨯧𥗕䤵𨪂煫"
  ],
  [
    "97a1",
    "𤥃𠳿嚤𠘚𠯫𠲸唂秄𡟺緾𡛂𤩐𡡒䔮鐁㜊𨫀𤦭妰𡢿𡢃𧒄媡㛢𣵛㚰鉟婹𨪁𡡢鍴㳍𠪴䪖㦊僴㵩㵌𡎜煵䋻𨈘渏𩃤䓫浗𧹏灧沯㳖𣿭𣸭渂漌㵯𠏵畑㚼㓈䚀㻚䡱姄鉮䤾轁𨰜𦯀堒埈㛖𡑒烾𤍢𤩱𢿣𡊰𢎽梹楧𡎘𣓥𧯴𣛟𨪃𣟖𣏺𤲟樚𣚭𦲷萾䓟䓎"
  ],
  [
    "9840",
    "𦴦𦵑𦲂𦿞漗𧄉茽𡜺菭𦲀𧁓𡟛妉媂𡞳婡婱𡤅𤇼㜭姯𡜼㛇熎鎐暚𤊥婮娫𤊓樫𣻹𧜶𤑛𤋊焝𤉙𨧡侰𦴨峂𤓎𧹍𤎽樌𤉖𡌄炦焳𤏩㶥泟勇𤩏繥姫崯㷳彜𤩝𡟟綤萦"
  ],
  [
    "98a1",
    "咅𣫺𣌀𠈔坾𠣕𠘙㿥𡾞𪊶瀃𩅛嵰玏糓𨩙𩐠俈翧狍猐𧫴猸猹𥛶獁獈㺩𧬘遬燵𤣲珡臶㻊県㻑沢国琙琞琟㻢㻰㻴㻺瓓㼎㽓畂畭畲疍㽼痈痜㿀癍㿗癴㿜発𤽜熈嘣覀塩䀝睃䀹条䁅㗛瞘䁪䁯属瞾矋売砘点砜䂨砹硇硑硦葈𥔵礳栃礲䄃"
  ],
  [
    "9940",
    "䄉禑禙辻稆込䅧窑䆲窼艹䇄竏竛䇏両筢筬筻簒簛䉠䉺类粜䊌粸䊔糭输烀𠳏総緔緐緽羮羴犟䎗耠耥笹耮耱联㷌垴炠肷胩䏭脌猪脎脒畠脔䐁㬹腖腙腚"
  ],
  [
    "99a1",
    "䐓堺腼膄䐥膓䐭膥埯臁臤艔䒏芦艶苊苘苿䒰荗险榊萅烵葤惣蒈䔄蒾蓡蓸蔐蔸蕒䔻蕯蕰藠䕷虲蚒蚲蛯际螋䘆䘗袮裿褤襇覑𧥧訩訸誔誴豑賔賲贜䞘塟跃䟭仮踺嗘坔蹱嗵躰䠷軎転軤軭軲辷迁迊迌逳駄䢭飠鈓䤞鈨鉘鉫銱銮銿"
  ],
  [
    "9a40",
    "鋣鋫鋳鋴鋽鍃鎄鎭䥅䥑麿鐗匁鐝鐭鐾䥪鑔鑹锭関䦧间阳䧥枠䨤靀䨵鞲韂噔䫤惨颹䬙飱塄餎餙冴餜餷饂饝饢䭰駅䮝騼鬏窃魩鮁鯝鯱鯴䱭鰠㝯𡯂鵉鰺"
  ],
  [
    "9aa1",
    "黾噐鶓鶽鷀鷼银辶鹻麬麱麽黆铜黢黱黸竈齄𠂔𠊷𠎠椚铃妬𠓗塀铁㞹𠗕𠘕𠙶𡚺块煳𠫂𠫍𠮿呪吆𠯋咞𠯻𠰻𠱓𠱥𠱼惧𠲍噺𠲵𠳝𠳭𠵯𠶲𠷈楕鰯螥𠸄𠸎𠻗𠾐𠼭𠹳尠𠾼帋𡁜𡁏𡁶朞𡁻𡂈𡂖㙇𡂿𡃓𡄯𡄻卤蒭𡋣𡍵𡌶讁𡕷𡘙𡟃𡟇乸炻𡠭𡥪"
  ],
  [
    "9b40",
    "𡨭𡩅𡰪𡱰𡲬𡻈拃𡻕𡼕熘桕𢁅槩㛈𢉼𢏗𢏺𢜪𢡱𢥏苽𢥧𢦓𢫕覥𢫨辠𢬎鞸𢬿顇骽𢱌"
  ],
  [
    "9b62",
    "𢲈𢲷𥯨𢴈𢴒𢶷𢶕𢹂𢽴𢿌𣀳𣁦𣌟𣏞徱晈暿𧩹𣕧𣗳爁𤦺矗𣘚𣜖纇𠍆墵朎"
  ],
  [
    "9ba1",
    "椘𣪧𧙗𥿢𣸑𣺹𧗾𢂚䣐䪸𤄙𨪚𤋮𤌍𤀻𤌴𤎖𤩅𠗊凒𠘑妟𡺨㮾𣳿𤐄𤓖垈𤙴㦛𤜯𨗨𩧉㝢𢇃譞𨭎駖𤠒𤣻𤨕爉𤫀𠱸奥𤺥𤾆𠝹軚𥀬劏圿煱𥊙𥐙𣽊𤪧喼𥑆𥑮𦭒釔㑳𥔿𧘲𥕞䜘𥕢𥕦𥟇𤤿𥡝偦㓻𣏌惞𥤃䝼𨥈𥪮𥮉𥰆𡶐垡煑澶𦄂𧰒遖𦆲𤾚譢𦐂𦑊"
  ],
  [
    "9c40",
    "嵛𦯷輶𦒄𡤜諪𤧶𦒈𣿯𦔒䯀𦖿𦚵𢜛鑥𥟡憕娧晉侻嚹𤔡𦛼乪𤤴陖涏𦲽㘘襷𦞙𦡮𦐑𦡞營𦣇筂𩃀𠨑𦤦鄄𦤹穅鷰𦧺騦𦨭㙟𦑩𠀡禃𦨴𦭛崬𣔙菏𦮝䛐𦲤画补𦶮墶"
  ],
  [
    "9ca1",
    "㜜𢖍𧁋𧇍㱔𧊀𧊅銁𢅺𧊋錰𧋦𤧐氹钟𧑐𠻸蠧裵𢤦𨑳𡞱溸𤨪𡠠㦤㚹尐秣䔿暶𩲭𩢤襃𧟌𧡘囖䃟𡘊㦡𣜯𨃨𡏅熭荦𧧝𩆨婧䲷𧂯𨦫𧧽𧨊𧬋𧵦𤅺筃祾𨀉澵𪋟樃𨌘厢𦸇鎿栶靝𨅯𨀣𦦵𡏭𣈯𨁈嶅𨰰𨂃圕頣𨥉嶫𤦈斾槕叒𤪥𣾁㰑朶𨂐𨃴𨄮𡾡𨅏"
  ],
  [
    "9d40",
    "𨆉𨆯𨈚𨌆𨌯𨎊㗊𨑨𨚪䣺揦𨥖砈鉕𨦸䏲𨧧䏟𨧨𨭆𨯔姸𨰉輋𨿅𩃬筑𩄐𩄼㷷𩅞𤫊运犏嚋𩓧𩗩𩖰𩖸𩜲𩣑𩥉𩥪𩧃𩨨𩬎𩵚𩶛纟𩻸𩼣䲤镇𪊓熢𪋿䶑递𪗋䶜𠲜达嗁"
  ],
  [
    "9da1",
    "辺𢒰边𤪓䔉繿潖檱仪㓤𨬬𧢝㜺躀𡟵𨀤𨭬𨮙𧨾𦚯㷫𧙕𣲷𥘵𥥖亚𥺁𦉘嚿𠹭踎孭𣺈𤲞揞拐𡟶𡡻攰嘭𥱊吚𥌑㷆𩶘䱽嘢嘞罉𥻘奵𣵀蝰东𠿪𠵉𣚺脗鵞贘瘻鱅癎瞹鍅吲腈苷嘥脲萘肽嗪祢噃吖𠺝㗎嘅嗱曱𨋢㘭甴嗰喺咗啲𠱁𠲖廐𥅈𠹶𢱢"
  ],
  [
    "9e40",
    "𠺢麫絚嗞𡁵抝靭咔賍燶酶揼掹揾啩𢭃鱲𢺳冚㓟𠶧冧呍唞唓癦踭𦢊疱肶蠄螆裇膶萜𡃁䓬猄𤜆宐茋𦢓噻𢛴𧴯𤆣𧵳𦻐𧊶酰𡇙鈈𣳼𪚩𠺬𠻹牦𡲢䝎𤿂𧿹𠿫䃺"
  ],
  [
    "9ea1",
    "鱝攟𢶠䣳𤟠𩵼𠿬𠸊恢𧖣𠿭"
  ],
  [
    "9ead",
    "𦁈𡆇熣纎鵐业丄㕷嬍沲卧㚬㧜卽㚥𤘘墚𤭮舭呋垪𥪕𠥹"
  ],
  [
    "9ec5",
    "㩒𢑥獴𩺬䴉鯭𣳾𩼰䱛𤾩𩖞𩿞葜𣶶𧊲𦞳𣜠挮紥𣻷𣸬㨪逈勌㹴㙺䗩𠒎癀嫰𠺶硺𧼮墧䂿噼鮋嵴癔𪐴麅䳡痹㟻愙𣃚𤏲"
  ],
  [
    "9ef5",
    "噝𡊩垧𤥣𩸆刴𧂮㖭汊鵼"
  ],
  [
    "9f40",
    "籖鬹埞𡝬屓擓𩓐𦌵𧅤蚭𠴨𦴢𤫢𠵱"
  ],
  [
    "9f4f",
    "凾𡼏嶎霃𡷑麁遌笟鬂峑箣扨挵髿篏鬪籾鬮籂粆鰕篼鬉鼗鰛𤤾齚啳寃俽麘俲剠㸆勑坧偖妷帒韈鶫轜呩鞴饀鞺匬愰"
  ],
  [
    "9fa1",
    "椬叚鰊鴂䰻陁榀傦畆𡝭駚剳"
  ],
  [
    "9fae",
    "酙隁酜"
  ],
  [
    "9fb2",
    "酑𨺗捿𦴣櫊嘑醎畺抅𠏼獏籰𥰡𣳽"
  ],
  [
    "9fc1",
    "𤤙盖鮝个𠳔莾衂"
  ],
  [
    "9fc9",
    "届槀僭坺刟巵从氱𠇲伹咜哚劚趂㗾弌㗳"
  ],
  [
    "9fdb",
    "歒酼龥鮗頮颴骺麨麄煺笔"
  ],
  [
    "9fe7",
    "毺蠘罸"
  ],
  [
    "9feb",
    "嘠𪙊蹷齓"
  ],
  [
    "9ff0",
    "跔蹏鸜踁抂𨍽踨蹵竓𤩷稾磘泪詧瘇"
  ],
  [
    "a040",
    "𨩚鼦泎蟖痃𪊲硓咢贌狢獱謭猂瓱賫𤪻蘯徺袠䒷"
  ],
  [
    "a055",
    "𡠻𦸅"
  ],
  [
    "a058",
    "詾𢔛"
  ],
  [
    "a05b",
    "惽癧髗鵄鍮鮏蟵"
  ],
  [
    "a063",
    "蠏賷猬霡鮰㗖犲䰇籑饊𦅙慙䰄麖慽"
  ],
  [
    "a073",
    "坟慯抦戹拎㩜懢厪𣏵捤栂㗒"
  ],
  [
    "a0a1",
    "嵗𨯂迚𨸹"
  ],
  [
    "a0a6",
    "僙𡵆礆匲阸𠼻䁥"
  ],
  [
    "a0ae",
    "矾"
  ],
  [
    "a0b0",
    "糂𥼚糚稭聦聣絍甅瓲覔舚朌聢𧒆聛瓰脃眤覉𦟌畓𦻑螩蟎臈螌詉貭譃眫瓸蓚㘵榲趦"
  ],
  [
    "a0d4",
    "覩瑨涹蟁𤀑瓧㷛煶悤憜㳑煢恷"
  ],
  [
    "a0e2",
    "罱𨬭牐惩䭾删㰘𣳇𥻗𧙖𥔱𡥄𡋾𩤃𦷜𧂭峁𦆭𨨏𣙷𠃮𦡆𤼎䕢嬟𦍌齐麦𦉫"
  ],
  [
    "a3c0",
    "␀",
    31,
    "␡"
  ],
  [
    "c6a1",
    "①",
    9,
    "⑴",
    9,
    "ⅰ",
    9,
    "丶丿亅亠冂冖冫勹匸卩厶夊宀巛⼳广廴彐彡攴无疒癶辵隶¨ˆヽヾゝゞ〃仝々〆〇ー［］✽ぁ",
    23
  ],
  [
    "c740",
    "す",
    58,
    "ァアィイ"
  ],
  [
    "c7a1",
    "ゥ",
    81,
    "А",
    5,
    "ЁЖ",
    4
  ],
  [
    "c840",
    "Л",
    26,
    "ёж",
    25,
    "⇧↸↹㇏𠃌乚𠂊刂䒑"
  ],
  [
    "c8a1",
    "龰冈龱𧘇"
  ],
  [
    "c8cd",
    "￢￤＇＂㈱№℡゛゜⺀⺄⺆⺇⺈⺊⺌⺍⺕⺜⺝⺥⺧⺪⺬⺮⺶⺼⺾⻆⻊⻌⻍⻏⻖⻗⻞⻣"
  ],
  [
    "c8f5",
    "ʃɐɛɔɵœøŋʊɪ"
  ],
  [
    "f9fe",
    "￭"
  ],
  [
    "fa40",
    "𠕇鋛𠗟𣿅蕌䊵珯况㙉𤥂𨧤鍄𡧛苮𣳈砼杄拟𤤳𨦪𠊠𦮳𡌅侫𢓭倈𦴩𧪄𣘀𤪱𢔓倩𠍾徤𠎀𠍇滛𠐟偽儁㑺儎顬㝃萖𤦤𠒇兠𣎴兪𠯿𢃼𠋥𢔰𠖎𣈳𡦃宂蝽𠖳𣲙冲冸"
  ],
  [
    "faa1",
    "鴴凉减凑㳜凓𤪦决凢卂凭菍椾𣜭彻刋刦刼劵剗劔効勅簕蕂勠蘍𦬓包𨫞啉滙𣾀𠥔𣿬匳卄𠯢泋𡜦栛珕恊㺪㣌𡛨燝䒢卭却𨚫卾卿𡖖𡘓矦厓𨪛厠厫厮玧𥝲㽙玜叁叅汉义埾叙㪫𠮏叠𣿫𢶣叶𠱷吓灹唫晗浛呭𦭓𠵴啝咏咤䞦𡜍𠻝㶴𠵍"
  ],
  [
    "fb40",
    "𨦼𢚘啇䳭启琗喆喩嘅𡣗𤀺䕒𤐵暳𡂴嘷曍𣊊暤暭噍噏磱囱鞇叾圀囯园𨭦㘣𡉏坆𤆥汮炋坂㚱𦱾埦𡐖堃𡑔𤍣堦𤯵塜墪㕡壠壜𡈼壻寿坃𪅐𤉸鏓㖡够梦㛃湙"
  ],
  [
    "fba1",
    "𡘾娤啓𡚒蔅姉𠵎𦲁𦴪𡟜姙𡟻𡞲𦶦浱𡠨𡛕姹𦹅媫婣㛦𤦩婷㜈媖瑥嫓𦾡𢕔㶅𡤑㜲𡚸広勐孶斈孼𧨎䀄䡝𠈄寕慠𡨴𥧌𠖥寳宝䴐尅𡭄尓珎尔𡲥𦬨屉䣝岅峩峯嶋𡷹𡸷崐崘嵆𡺤岺巗苼㠭𤤁𢁉𢅳芇㠶㯂帮檊幵幺𤒼𠳓厦亷廐厨𡝱帉廴𨒂"
  ],
  [
    "fc40",
    "廹廻㢠廼栾鐛弍𠇁弢㫞䢮𡌺强𦢈𢏐彘𢑱彣鞽𦹮彲鍀𨨶徧嶶㵟𥉐𡽪𧃸𢙨釖𠊞𨨩怱暅𡡷㥣㷇㘹垐𢞴祱㹀悞悤悳𤦂𤦏𧩓璤僡媠慤萤慂慈𦻒憁凴𠙖憇宪𣾷"
  ],
  [
    "fca1",
    "𢡟懓𨮝𩥝懐㤲𢦀𢣁怣慜攞掋𠄘担𡝰拕𢸍捬𤧟㨗搸揸𡎎𡟼撐澊𢸶頔𤂌𥜝擡擥鑻㩦携㩗敍漖𤨨𤨣斅敭敟𣁾斵𤥀䬷旑䃘𡠩无旣忟𣐀昘𣇷𣇸晄𣆤𣆥晋𠹵晧𥇦晳晴𡸽𣈱𨗴𣇈𥌓矅𢣷馤朂𤎜𤨡㬫槺𣟂杞杧杢𤇍𩃭柗䓩栢湐鈼栁𣏦𦶠桝"
  ],
  [
    "fd40",
    "𣑯槡樋𨫟楳棃𣗍椁椀㴲㨁𣘼㮀枬楡𨩊䋼椶榘㮡𠏉荣傐槹𣙙𢄪橅𣜃檝㯳枱櫈𩆜㰍欝𠤣惞欵歴𢟍溵𣫛𠎵𡥘㝀吡𣭚毡𣻼毜氷𢒋𤣱𦭑汚舦汹𣶼䓅𣶽𤆤𤤌𤤀"
  ],
  [
    "fda1",
    "𣳉㛥㳫𠴲鮃𣇹𢒑羏样𦴥𦶡𦷫涖浜湼漄𤥿𤂅𦹲蔳𦽴凇沜渝萮𨬡港𣸯瑓𣾂秌湏媑𣁋濸㜍澝𣸰滺𡒗𤀽䕕鏰潄潜㵎潴𩅰㴻澟𤅄濓𤂑𤅕𤀹𣿰𣾴𤄿凟𤅖𤅗𤅀𦇝灋灾炧炁烌烕烖烟䄄㷨熴熖𤉷焫煅媈煊煮岜𤍥煏鍢𤋁焬𤑚𤨧𤨢熺𨯨炽爎"
  ],
  [
    "fe40",
    "鑂爕夑鑃爤鍁𥘅爮牀𤥴梽牕牗㹕𣁄栍漽犂猪猫𤠣𨠫䣭𨠄猨献珏玪𠰺𦨮珉瑉𤇢𡛧𤨤昣㛅𤦷𤦍𤧻珷琕椃𤨦琹𠗃㻗瑜𢢭瑠𨺲瑇珤瑶莹瑬㜰瑴鏱樬璂䥓𤪌"
  ],
  [
    "fea1",
    "𤅟𤩹𨮏孆𨰃𡢞瓈𡦈甎瓩甞𨻙𡩋寗𨺬鎅畍畊畧畮𤾂㼄𤴓疎瑝疞疴瘂瘬癑癏癯癶𦏵皐臯㟸𦤑𦤎皡皥皷盌𦾟葢𥂝𥅽𡸜眞眦着撯𥈠睘𣊬瞯𨥤𨥨𡛁矴砉𡍶𤨒棊碯磇磓隥礮𥗠磗礴碱𧘌辸袄𨬫𦂃𢘜禆褀椂禀𥡗禝𧬹礼禩渪𧄦㺨秆𩄍秔"
  ]
];
var Ls, Cl;
function i_() {
  return Cl || (Cl = 1, Ls = {
    // == Japanese/ShiftJIS ====================================================
    // All japanese encodings are based on JIS X set of standards:
    // JIS X 0201 - Single-byte encoding of ASCII + ¥ + Kana chars at 0xA1-0xDF.
    // JIS X 0208 - Main set of 6879 characters, placed in 94x94 plane, to be encoded by 2 bytes.
    //              Has several variations in 1978, 1983, 1990 and 1997.
    // JIS X 0212 - Supplementary plane of 6067 chars in 94x94 plane. 1990. Effectively dead.
    // JIS X 0213 - Extension and modern replacement of 0208 and 0212. Total chars: 11233.
    //              2 planes, first is superset of 0208, second - revised 0212.
    //              Introduced in 2000, revised 2004. Some characters are in Unicode Plane 2 (0x2xxxx)
    // Byte encodings are:
    //  * Shift_JIS: Compatible with 0201, uses not defined chars in top half as lead bytes for double-byte
    //               encoding of 0208. Lead byte ranges: 0x81-0x9F, 0xE0-0xEF; Trail byte ranges: 0x40-0x7E, 0x80-0x9E, 0x9F-0xFC.
    //               Windows CP932 is a superset of Shift_JIS. Some companies added more chars, notably KDDI.
    //  * EUC-JP:    Up to 3 bytes per character. Used mostly on *nixes.
    //               0x00-0x7F       - lower part of 0201
    //               0x8E, 0xA1-0xDF - upper part of 0201
    //               (0xA1-0xFE)x2   - 0208 plane (94x94).
    //               0x8F, (0xA1-0xFE)x2 - 0212 plane (94x94).
    //  * JIS X 208: 7-bit, direct encoding of 0208. Byte ranges: 0x21-0x7E (94 values). Uncommon.
    //               Used as-is in ISO2022 family.
    //  * ISO2022-JP: Stateful encoding, with escape sequences to switch between ASCII,
    //                0201-1976 Roman, 0208-1978, 0208-1983.
    //  * ISO2022-JP-1: Adds esc seq for 0212-1990.
    //  * ISO2022-JP-2: Adds esc seq for GB2313-1980, KSX1001-1992, ISO8859-1, ISO8859-7.
    //  * ISO2022-JP-3: Adds esc seq for 0201-1976 Kana set, 0213-2000 Planes 1, 2.
    //  * ISO2022-JP-2004: Adds 0213-2004 Plane 1.
    //
    // After JIS X 0213 appeared, Shift_JIS-2004, EUC-JISX0213 and ISO2022-JP-2004 followed, with just changing the planes.
    //
    // Overall, it seems that it's a mess :( http://www8.plala.or.jp/tkubota1/unicode-symbols-map2.html
    shiftjis: {
      type: "_dbcs",
      table: function() {
        return Xp;
      },
      encodeAdd: { "¥": 92, "‾": 126 },
      encodeSkipVals: [{ from: 60736, to: 63808 }]
    },
    csshiftjis: "shiftjis",
    mskanji: "shiftjis",
    sjis: "shiftjis",
    windows31j: "shiftjis",
    ms31j: "shiftjis",
    xsjis: "shiftjis",
    windows932: "shiftjis",
    ms932: "shiftjis",
    932: "shiftjis",
    cp932: "shiftjis",
    eucjp: {
      type: "_dbcs",
      table: function() {
        return Jp;
      },
      encodeAdd: { "¥": 92, "‾": 126 }
    },
    // TODO: KDDI extension to Shift_JIS
    // TODO: IBM CCSID 942 = CP932, but F0-F9 custom chars and other char changes.
    // TODO: IBM CCSID 943 = Shift_JIS = CP932 with original Shift_JIS lower 128 chars.
    // == Chinese/GBK ==========================================================
    // http://en.wikipedia.org/wiki/GBK
    // We mostly implement W3C recommendation: https://www.w3.org/TR/encoding/#gbk-encoder
    // Oldest GB2312 (1981, ~7600 chars) is a subset of CP936
    gb2312: "cp936",
    gb231280: "cp936",
    gb23121980: "cp936",
    csgb2312: "cp936",
    csiso58gb231280: "cp936",
    euccn: "cp936",
    // Microsoft's CP936 is a subset and approximation of GBK.
    windows936: "cp936",
    ms936: "cp936",
    936: "cp936",
    cp936: {
      type: "_dbcs",
      table: function() {
        return Ts;
      }
    },
    // GBK (~22000 chars) is an extension of CP936 that added user-mapped chars and some other.
    gbk: {
      type: "_dbcs",
      table: function() {
        return Ts.concat(wl);
      }
    },
    xgbk: "gbk",
    isoir58: "gbk",
    // GB18030 is an algorithmic extension of GBK.
    // Main source: https://www.w3.org/TR/encoding/#gbk-encoder
    // http://icu-project.org/docs/papers/gb18030.html
    // http://source.icu-project.org/repos/icu/data/trunk/charset/data/xml/gb-18030-2000.xml
    // http://www.khngai.com/chinese/charmap/tblgbk.php?page=0
    gb18030: {
      type: "_dbcs",
      table: function() {
        return Ts.concat(wl);
      },
      gb18030: function() {
        return e_;
      },
      encodeSkipVals: [128],
      encodeAdd: { "€": 41699 }
    },
    chinese: "gb18030",
    // == Korean ===============================================================
    // EUC-KR, KS_C_5601 and KS X 1001 are exactly the same.
    windows949: "cp949",
    ms949: "cp949",
    949: "cp949",
    cp949: {
      type: "_dbcs",
      table: function() {
        return t_;
      }
    },
    cseuckr: "cp949",
    csksc56011987: "cp949",
    euckr: "cp949",
    isoir149: "cp949",
    korean: "cp949",
    ksc56011987: "cp949",
    ksc56011989: "cp949",
    ksc5601: "cp949",
    // == Big5/Taiwan/Hong Kong ================================================
    // There are lots of tables for Big5 and cp950. Please see the following links for history:
    // http://moztw.org/docs/big5/  http://www.haible.de/bruno/charsets/conversion-tables/Big5.html
    // Variations, in roughly number of defined chars:
    //  * Windows CP 950: Microsoft variant of Big5. Canonical: http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP950.TXT
    //  * Windows CP 951: Microsoft variant of Big5-HKSCS-2001. Seems to be never public. http://me.abelcheung.org/articles/research/what-is-cp951/
    //  * Big5-2003 (Taiwan standard) almost superset of cp950.
    //  * Unicode-at-on (UAO) / Mozilla 1.8. Falling out of use on the Web. Not supported by other browsers.
    //  * Big5-HKSCS (-2001, -2004, -2008). Hong Kong standard.
    //    many unicode code points moved from PUA to Supplementary plane (U+2XXXX) over the years.
    //    Plus, it has 4 combining sequences.
    //    Seems that Mozilla refused to support it for 10 yrs. https://bugzilla.mozilla.org/show_bug.cgi?id=162431 https://bugzilla.mozilla.org/show_bug.cgi?id=310299
    //    because big5-hkscs is the only encoding to include astral characters in non-algorithmic way.
    //    Implementations are not consistent within browsers; sometimes labeled as just big5.
    //    MS Internet Explorer switches from big5 to big5-hkscs when a patch applied.
    //    Great discussion & recap of what's going on https://bugzilla.mozilla.org/show_bug.cgi?id=912470#c31
    //    In the encoder, it might make sense to support encoding old PUA mappings to Big5 bytes seq-s.
    //    Official spec: http://www.ogcio.gov.hk/en/business/tech_promotion/ccli/terms/doc/2003cmp_2008.txt
    //                   http://www.ogcio.gov.hk/tc/business/tech_promotion/ccli/terms/doc/hkscs-2008-big5-iso.txt
    //
    // Current understanding of how to deal with Big5(-HKSCS) is in the Encoding Standard, http://encoding.spec.whatwg.org/#big5-encoder
    // Unicode mapping (http://www.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT) is said to be wrong.
    windows950: "cp950",
    ms950: "cp950",
    950: "cp950",
    cp950: {
      type: "_dbcs",
      table: function() {
        return Sl;
      }
    },
    // Big5 has many variations and is an extension of cp950. We use Encoding Standard's as a consensus.
    big5: "big5hkscs",
    big5hkscs: {
      type: "_dbcs",
      table: function() {
        return Sl.concat(r_);
      },
      encodeSkipVals: [
        // Although Encoding Standard says we should avoid encoding to HKSCS area (See Step 1 of
        // https://encoding.spec.whatwg.org/#index-big5-pointer), we still do it to increase compatibility with ICU.
        // But if a single unicode point can be encoded both as HKSCS and regular Big5, we prefer the latter.
        36457,
        36463,
        36478,
        36523,
        36532,
        36557,
        36560,
        36695,
        36713,
        36718,
        36811,
        36862,
        36973,
        36986,
        37060,
        37084,
        37105,
        37311,
        37551,
        37552,
        37553,
        37554,
        37585,
        37959,
        38090,
        38361,
        38652,
        39285,
        39798,
        39800,
        39803,
        39878,
        39902,
        39916,
        39926,
        40002,
        40019,
        40034,
        40040,
        40043,
        40055,
        40124,
        40125,
        40144,
        40279,
        40282,
        40388,
        40431,
        40443,
        40617,
        40687,
        40701,
        40800,
        40907,
        41079,
        41180,
        41183,
        36812,
        37576,
        38468,
        38637,
        // Step 2 of https://encoding.spec.whatwg.org/#index-big5-pointer: Use last pointer for U+2550, U+255E, U+2561, U+256A, U+5341, or U+5345
        41636,
        41637,
        41639,
        41638,
        41676,
        41678
      ]
    },
    cnbig5: "big5hkscs",
    csbig5: "big5hkscs",
    xxbig5: "big5hkscs"
  }), Ls;
}
var El;
function s_() {
  return El || (El = 1, function(e) {
    for (var t = gu, r = [
      zp(),
      qp(),
      jp(),
      $p(),
      Kp(),
      Vp(),
      Gp(),
      Yp(),
      i_()
    ], i = 0; i < r.length; i++) {
      var s = r[i];
      t(e, s);
    }
  }(Es)), Es;
}
var Ps, xl;
function n_() {
  if (xl) return Ps;
  xl = 1;
  var e = ir.Buffer;
  return Ps = function(t) {
    var r = t.Transform;
    function i(n, o) {
      this.conv = n, o = o || {}, o.decodeStrings = !1, r.call(this, o);
    }
    i.prototype = Object.create(r.prototype, {
      constructor: { value: i }
    }), i.prototype._transform = function(n, o, a) {
      if (typeof n != "string")
        return a(new Error("Iconv encoding stream needs strings as its input."));
      try {
        var h = this.conv.write(n);
        h && h.length && this.push(h), a();
      } catch (l) {
        a(l);
      }
    }, i.prototype._flush = function(n) {
      try {
        var o = this.conv.end();
        o && o.length && this.push(o), n();
      } catch (a) {
        n(a);
      }
    }, i.prototype.collect = function(n) {
      var o = [];
      return this.on("error", n), this.on("data", function(a) {
        o.push(a);
      }), this.on("end", function() {
        n(null, e.concat(o));
      }), this;
    };
    function s(n, o) {
      this.conv = n, o = o || {}, o.encoding = this.encoding = "utf8", r.call(this, o);
    }
    return s.prototype = Object.create(r.prototype, {
      constructor: { value: s }
    }), s.prototype._transform = function(n, o, a) {
      if (!e.isBuffer(n) && !(n instanceof Uint8Array))
        return a(new Error("Iconv decoding stream needs buffers as its input."));
      try {
        var h = this.conv.write(n);
        h && h.length && this.push(h, this.encoding), a();
      } catch (l) {
        a(l);
      }
    }, s.prototype._flush = function(n) {
      try {
        var o = this.conv.end();
        o && o.length && this.push(o, this.encoding), n();
      } catch (a) {
        n(a);
      }
    }, s.prototype.collect = function(n) {
      var o = "";
      return this.on("error", n), this.on("data", function(a) {
        o += a;
      }), this.on("end", function() {
        n(null, o);
      }), this;
    }, {
      IconvLiteEncoderStream: i,
      IconvLiteDecoderStream: s
    };
  }, Ps;
}
var wi = { exports: {} }, kl;
function Sa() {
  if (kl) return wi.exports;
  kl = 1;
  var e = typeof Reflect == "object" ? Reflect : null, t = e && typeof e.apply == "function" ? e.apply : function(k, R, O) {
    return Function.prototype.apply.call(k, R, O);
  }, r;
  e && typeof e.ownKeys == "function" ? r = e.ownKeys : Object.getOwnPropertySymbols ? r = function(k) {
    return Object.getOwnPropertyNames(k).concat(Object.getOwnPropertySymbols(k));
  } : r = function(k) {
    return Object.getOwnPropertyNames(k);
  };
  function i(v) {
    console && console.warn && console.warn(v);
  }
  var s = Number.isNaN || function(k) {
    return k !== k;
  };
  function n() {
    n.init.call(this);
  }
  wi.exports = n, wi.exports.once = y, n.EventEmitter = n, n.prototype._events = void 0, n.prototype._eventsCount = 0, n.prototype._maxListeners = void 0;
  var o = 10;
  function a(v) {
    if (typeof v != "function")
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof v);
  }
  Object.defineProperty(n, "defaultMaxListeners", {
    enumerable: !0,
    get: function() {
      return o;
    },
    set: function(v) {
      if (typeof v != "number" || v < 0 || s(v))
        throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + v + ".");
      o = v;
    }
  }), n.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  }, n.prototype.setMaxListeners = function(k) {
    if (typeof k != "number" || k < 0 || s(k))
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + k + ".");
    return this._maxListeners = k, this;
  };
  function h(v) {
    return v._maxListeners === void 0 ? n.defaultMaxListeners : v._maxListeners;
  }
  n.prototype.getMaxListeners = function() {
    return h(this);
  }, n.prototype.emit = function(k) {
    for (var R = [], O = 1; O < arguments.length; O++) R.push(arguments[O]);
    var N = k === "error", W = this._events;
    if (W !== void 0)
      N = N && W.error === void 0;
    else if (!N)
      return !1;
    if (N) {
      var Z;
      if (R.length > 0 && (Z = R[0]), Z instanceof Error)
        throw Z;
      var ie = new Error("Unhandled error." + (Z ? " (" + Z.message + ")" : ""));
      throw ie.context = Z, ie;
    }
    var K = W[k];
    if (K === void 0)
      return !1;
    if (typeof K == "function")
      t(K, this, R);
    else
      for (var H = K.length, G = m(K, H), O = 0; O < H; ++O)
        t(G[O], this, R);
    return !0;
  };
  function l(v, k, R, O) {
    var N, W, Z;
    if (a(R), W = v._events, W === void 0 ? (W = v._events = /* @__PURE__ */ Object.create(null), v._eventsCount = 0) : (W.newListener !== void 0 && (v.emit(
      "newListener",
      k,
      R.listener ? R.listener : R
    ), W = v._events), Z = W[k]), Z === void 0)
      Z = W[k] = R, ++v._eventsCount;
    else if (typeof Z == "function" ? Z = W[k] = O ? [R, Z] : [Z, R] : O ? Z.unshift(R) : Z.push(R), N = h(v), N > 0 && Z.length > N && !Z.warned) {
      Z.warned = !0;
      var ie = new Error("Possible EventEmitter memory leak detected. " + Z.length + " " + String(k) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      ie.name = "MaxListenersExceededWarning", ie.emitter = v, ie.type = k, ie.count = Z.length, i(ie);
    }
    return v;
  }
  n.prototype.addListener = function(k, R) {
    return l(this, k, R, !1);
  }, n.prototype.on = n.prototype.addListener, n.prototype.prependListener = function(k, R) {
    return l(this, k, R, !0);
  };
  function c() {
    if (!this.fired)
      return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  function u(v, k, R) {
    var O = { fired: !1, wrapFn: void 0, target: v, type: k, listener: R }, N = c.bind(O);
    return N.listener = R, O.wrapFn = N, N;
  }
  n.prototype.once = function(k, R) {
    return a(R), this.on(k, u(this, k, R)), this;
  }, n.prototype.prependOnceListener = function(k, R) {
    return a(R), this.prependListener(k, u(this, k, R)), this;
  }, n.prototype.removeListener = function(k, R) {
    var O, N, W, Z, ie;
    if (a(R), N = this._events, N === void 0)
      return this;
    if (O = N[k], O === void 0)
      return this;
    if (O === R || O.listener === R)
      --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete N[k], N.removeListener && this.emit("removeListener", k, O.listener || R));
    else if (typeof O != "function") {
      for (W = -1, Z = O.length - 1; Z >= 0; Z--)
        if (O[Z] === R || O[Z].listener === R) {
          ie = O[Z].listener, W = Z;
          break;
        }
      if (W < 0)
        return this;
      W === 0 ? O.shift() : g(O, W), O.length === 1 && (N[k] = O[0]), N.removeListener !== void 0 && this.emit("removeListener", k, ie || R);
    }
    return this;
  }, n.prototype.off = n.prototype.removeListener, n.prototype.removeAllListeners = function(k) {
    var R, O, N;
    if (O = this._events, O === void 0)
      return this;
    if (O.removeListener === void 0)
      return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : O[k] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete O[k]), this;
    if (arguments.length === 0) {
      var W = Object.keys(O), Z;
      for (N = 0; N < W.length; ++N)
        Z = W[N], Z !== "removeListener" && this.removeAllListeners(Z);
      return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if (R = O[k], typeof R == "function")
      this.removeListener(k, R);
    else if (R !== void 0)
      for (N = R.length - 1; N >= 0; N--)
        this.removeListener(k, R[N]);
    return this;
  };
  function p(v, k, R) {
    var O = v._events;
    if (O === void 0)
      return [];
    var N = O[k];
    return N === void 0 ? [] : typeof N == "function" ? R ? [N.listener || N] : [N] : R ? w(N) : m(N, N.length);
  }
  n.prototype.listeners = function(k) {
    return p(this, k, !0);
  }, n.prototype.rawListeners = function(k) {
    return p(this, k, !1);
  }, n.listenerCount = function(v, k) {
    return typeof v.listenerCount == "function" ? v.listenerCount(k) : _.call(v, k);
  }, n.prototype.listenerCount = _;
  function _(v) {
    var k = this._events;
    if (k !== void 0) {
      var R = k[v];
      if (typeof R == "function")
        return 1;
      if (R !== void 0)
        return R.length;
    }
    return 0;
  }
  n.prototype.eventNames = function() {
    return this._eventsCount > 0 ? r(this._events) : [];
  };
  function m(v, k) {
    for (var R = new Array(k), O = 0; O < k; ++O)
      R[O] = v[O];
    return R;
  }
  function g(v, k) {
    for (; k + 1 < v.length; k++)
      v[k] = v[k + 1];
    v.pop();
  }
  function w(v) {
    for (var k = new Array(v.length), R = 0; R < k.length; ++R)
      k[R] = v[R].listener || v[R];
    return k;
  }
  function y(v, k) {
    return new Promise(function(R, O) {
      function N(Z) {
        v.removeListener(k, W), O(Z);
      }
      function W() {
        typeof v.removeListener == "function" && v.removeListener("error", N), R([].slice.call(arguments));
      }
      S(v, k, W, { once: !0 }), k !== "error" && E(v, N, { once: !0 });
    });
  }
  function E(v, k, R) {
    typeof v.on == "function" && S(v, "error", k, R);
  }
  function S(v, k, R, O) {
    if (typeof v.on == "function")
      O.once ? v.once(k, R) : v.on(k, R);
    else if (typeof v.addEventListener == "function")
      v.addEventListener(k, function N(W) {
        O.once && v.removeEventListener(k, N), R(W);
      });
    else
      throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof v);
  }
  return wi.exports;
}
var Si = { exports: {} }, Bl;
function gr() {
  return Bl || (Bl = 1, typeof Object.create == "function" ? Si.exports = function(t, r) {
    r && (t.super_ = r, t.prototype = Object.create(r.prototype, {
      constructor: {
        value: t,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : Si.exports = function(t, r) {
    if (r) {
      t.super_ = r;
      var i = function() {
      };
      i.prototype = r.prototype, t.prototype = new i(), t.prototype.constructor = t;
    }
  }), Si.exports;
}
var Ms, Rl;
function vu() {
  return Rl || (Rl = 1, Ms = Sa().EventEmitter), Ms;
}
var Os = {}, Is = {}, Ns, Al;
function mu() {
  return Al || (Al = 1, Ns = function() {
    if (typeof Symbol != "function" || typeof Object.getOwnPropertySymbols != "function")
      return !1;
    if (typeof Symbol.iterator == "symbol")
      return !0;
    var t = {}, r = Symbol("test"), i = Object(r);
    if (typeof r == "string" || Object.prototype.toString.call(r) !== "[object Symbol]" || Object.prototype.toString.call(i) !== "[object Symbol]")
      return !1;
    var s = 42;
    t[r] = s;
    for (var n in t)
      return !1;
    if (typeof Object.keys == "function" && Object.keys(t).length !== 0 || typeof Object.getOwnPropertyNames == "function" && Object.getOwnPropertyNames(t).length !== 0)
      return !1;
    var o = Object.getOwnPropertySymbols(t);
    if (o.length !== 1 || o[0] !== r || !Object.prototype.propertyIsEnumerable.call(t, r))
      return !1;
    if (typeof Object.getOwnPropertyDescriptor == "function") {
      var a = (
        /** @type {PropertyDescriptor} */
        Object.getOwnPropertyDescriptor(t, r)
      );
      if (a.value !== s || a.enumerable !== !0)
        return !1;
    }
    return !0;
  }), Ns;
}
var Fs, Dl;
function cs() {
  if (Dl) return Fs;
  Dl = 1;
  var e = mu();
  return Fs = function() {
    return e() && !!Symbol.toStringTag;
  }, Fs;
}
var Us, Tl;
function yu() {
  return Tl || (Tl = 1, Us = Object), Us;
}
var Hs, Ll;
function o_() {
  return Ll || (Ll = 1, Hs = Error), Hs;
}
var Ws, Pl;
function a_() {
  return Pl || (Pl = 1, Ws = EvalError), Ws;
}
var zs, Ml;
function l_() {
  return Ml || (Ml = 1, zs = RangeError), zs;
}
var qs, Ol;
function h_() {
  return Ol || (Ol = 1, qs = ReferenceError), qs;
}
var js, Il;
function bu() {
  return Il || (Il = 1, js = SyntaxError), js;
}
var $s, Nl;
function ii() {
  return Nl || (Nl = 1, $s = TypeError), $s;
}
var Ks, Fl;
function c_() {
  return Fl || (Fl = 1, Ks = URIError), Ks;
}
var Vs, Ul;
function u_() {
  return Ul || (Ul = 1, Vs = Math.abs), Vs;
}
var Gs, Hl;
function f_() {
  return Hl || (Hl = 1, Gs = Math.floor), Gs;
}
var Ys, Wl;
function d_() {
  return Wl || (Wl = 1, Ys = Math.max), Ys;
}
var Xs, zl;
function p_() {
  return zl || (zl = 1, Xs = Math.min), Xs;
}
var Js, ql;
function __() {
  return ql || (ql = 1, Js = Math.pow), Js;
}
var Zs, jl;
function g_() {
  return jl || (jl = 1, Zs = Math.round), Zs;
}
var Qs, $l;
function v_() {
  return $l || ($l = 1, Qs = Number.isNaN || function(t) {
    return t !== t;
  }), Qs;
}
var en, Kl;
function m_() {
  if (Kl) return en;
  Kl = 1;
  var e = v_();
  return en = function(r) {
    return e(r) || r === 0 ? r : r < 0 ? -1 : 1;
  }, en;
}
var tn, Vl;
function y_() {
  return Vl || (Vl = 1, tn = Object.getOwnPropertyDescriptor), tn;
}
var rn, Gl;
function Mr() {
  if (Gl) return rn;
  Gl = 1;
  var e = y_();
  if (e)
    try {
      e([], "length");
    } catch {
      e = null;
    }
  return rn = e, rn;
}
var sn, Yl;
function us() {
  if (Yl) return sn;
  Yl = 1;
  var e = Object.defineProperty || !1;
  if (e)
    try {
      e({}, "a", { value: 1 });
    } catch {
      e = !1;
    }
  return sn = e, sn;
}
var nn, Xl;
function b_() {
  if (Xl) return nn;
  Xl = 1;
  var e = typeof Symbol < "u" && Symbol, t = mu();
  return nn = function() {
    return typeof e != "function" || typeof Symbol != "function" || typeof e("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 : t();
  }, nn;
}
var on, Jl;
function wu() {
  return Jl || (Jl = 1, on = typeof Reflect < "u" && Reflect.getPrototypeOf || null), on;
}
var an, Zl;
function Su() {
  if (Zl) return an;
  Zl = 1;
  var e = yu();
  return an = e.getPrototypeOf || null, an;
}
var ln, Ql;
function w_() {
  if (Ql) return ln;
  Ql = 1;
  var e = "Function.prototype.bind called on incompatible ", t = Object.prototype.toString, r = Math.max, i = "[object Function]", s = function(h, l) {
    for (var c = [], u = 0; u < h.length; u += 1)
      c[u] = h[u];
    for (var p = 0; p < l.length; p += 1)
      c[p + h.length] = l[p];
    return c;
  }, n = function(h, l) {
    for (var c = [], u = l, p = 0; u < h.length; u += 1, p += 1)
      c[p] = h[u];
    return c;
  }, o = function(a, h) {
    for (var l = "", c = 0; c < a.length; c += 1)
      l += a[c], c + 1 < a.length && (l += h);
    return l;
  };
  return ln = function(h) {
    var l = this;
    if (typeof l != "function" || t.apply(l) !== i)
      throw new TypeError(e + l);
    for (var c = n(arguments, 1), u, p = function() {
      if (this instanceof u) {
        var y = l.apply(
          this,
          s(c, arguments)
        );
        return Object(y) === y ? y : this;
      }
      return l.apply(
        h,
        s(c, arguments)
      );
    }, _ = r(0, l.length - c.length), m = [], g = 0; g < _; g++)
      m[g] = "$" + g;
    if (u = Function("binder", "return function (" + o(m, ",") + "){ return binder.apply(this,arguments); }")(p), l.prototype) {
      var w = function() {
      };
      w.prototype = l.prototype, u.prototype = new w(), w.prototype = null;
    }
    return u;
  }, ln;
}
var hn, eh;
function si() {
  if (eh) return hn;
  eh = 1;
  var e = w_();
  return hn = Function.prototype.bind || e, hn;
}
var cn, th;
function Ca() {
  return th || (th = 1, cn = Function.prototype.call), cn;
}
var un, rh;
function Ea() {
  return rh || (rh = 1, un = Function.prototype.apply), un;
}
var fn, ih;
function S_() {
  return ih || (ih = 1, fn = typeof Reflect < "u" && Reflect && Reflect.apply), fn;
}
var dn, sh;
function Cu() {
  if (sh) return dn;
  sh = 1;
  var e = si(), t = Ea(), r = Ca(), i = S_();
  return dn = i || e.call(r, t), dn;
}
var pn, nh;
function xa() {
  if (nh) return pn;
  nh = 1;
  var e = si(), t = ii(), r = Ca(), i = Cu();
  return pn = function(n) {
    if (n.length < 1 || typeof n[0] != "function")
      throw new t("a function is required");
    return i(e, r, n);
  }, pn;
}
var _n, oh;
function C_() {
  if (oh) return _n;
  oh = 1;
  var e = xa(), t = Mr(), r;
  try {
    r = /** @type {{ __proto__?: typeof Array.prototype }} */
    [].__proto__ === Array.prototype;
  } catch (o) {
    if (!o || typeof o != "object" || !("code" in o) || o.code !== "ERR_PROTO_ACCESS")
      throw o;
  }
  var i = !!r && t && t(
    Object.prototype,
    /** @type {keyof typeof Object.prototype} */
    "__proto__"
  ), s = Object, n = s.getPrototypeOf;
  return _n = i && typeof i.get == "function" ? e([i.get]) : typeof n == "function" ? (
    /** @type {import('./get')} */
    function(a) {
      return n(a == null ? a : s(a));
    }
  ) : !1, _n;
}
var gn, ah;
function ka() {
  if (ah) return gn;
  ah = 1;
  var e = wu(), t = Su(), r = C_();
  return gn = e ? function(s) {
    return e(s);
  } : t ? function(s) {
    if (!s || typeof s != "object" && typeof s != "function")
      throw new TypeError("getProto: not an object");
    return t(s);
  } : r ? function(s) {
    return r(s);
  } : null, gn;
}
var vn, lh;
function Eu() {
  if (lh) return vn;
  lh = 1;
  var e = Function.prototype.call, t = Object.prototype.hasOwnProperty, r = si();
  return vn = r.call(e, t), vn;
}
var mn, hh;
function xu() {
  if (hh) return mn;
  hh = 1;
  var e, t = yu(), r = o_(), i = a_(), s = l_(), n = h_(), o = bu(), a = ii(), h = c_(), l = u_(), c = f_(), u = d_(), p = p_(), _ = __(), m = g_(), g = m_(), w = Function, y = function($) {
    try {
      return w('"use strict"; return (' + $ + ").constructor;")();
    } catch {
    }
  }, E = Mr(), S = us(), v = function() {
    throw new a();
  }, k = E ? function() {
    try {
      return arguments.callee, v;
    } catch {
      try {
        return E(arguments, "callee").get;
      } catch {
        return v;
      }
    }
  }() : v, R = b_()(), O = ka(), N = Su(), W = wu(), Z = Ea(), ie = Ca(), K = {}, H = typeof Uint8Array > "u" || !O ? e : O(Uint8Array), G = {
    __proto__: null,
    "%AggregateError%": typeof AggregateError > "u" ? e : AggregateError,
    "%Array%": Array,
    "%ArrayBuffer%": typeof ArrayBuffer > "u" ? e : ArrayBuffer,
    "%ArrayIteratorPrototype%": R && O ? O([][Symbol.iterator]()) : e,
    "%AsyncFromSyncIteratorPrototype%": e,
    "%AsyncFunction%": K,
    "%AsyncGenerator%": K,
    "%AsyncGeneratorFunction%": K,
    "%AsyncIteratorPrototype%": K,
    "%Atomics%": typeof Atomics > "u" ? e : Atomics,
    "%BigInt%": typeof BigInt > "u" ? e : BigInt,
    "%BigInt64Array%": typeof BigInt64Array > "u" ? e : BigInt64Array,
    "%BigUint64Array%": typeof BigUint64Array > "u" ? e : BigUint64Array,
    "%Boolean%": Boolean,
    "%DataView%": typeof DataView > "u" ? e : DataView,
    "%Date%": Date,
    "%decodeURI%": decodeURI,
    "%decodeURIComponent%": decodeURIComponent,
    "%encodeURI%": encodeURI,
    "%encodeURIComponent%": encodeURIComponent,
    "%Error%": r,
    "%eval%": eval,
    // eslint-disable-line no-eval
    "%EvalError%": i,
    "%Float16Array%": typeof Float16Array > "u" ? e : Float16Array,
    "%Float32Array%": typeof Float32Array > "u" ? e : Float32Array,
    "%Float64Array%": typeof Float64Array > "u" ? e : Float64Array,
    "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? e : FinalizationRegistry,
    "%Function%": w,
    "%GeneratorFunction%": K,
    "%Int8Array%": typeof Int8Array > "u" ? e : Int8Array,
    "%Int16Array%": typeof Int16Array > "u" ? e : Int16Array,
    "%Int32Array%": typeof Int32Array > "u" ? e : Int32Array,
    "%isFinite%": isFinite,
    "%isNaN%": isNaN,
    "%IteratorPrototype%": R && O ? O(O([][Symbol.iterator]())) : e,
    "%JSON%": typeof JSON == "object" ? JSON : e,
    "%Map%": typeof Map > "u" ? e : Map,
    "%MapIteratorPrototype%": typeof Map > "u" || !R || !O ? e : O((/* @__PURE__ */ new Map())[Symbol.iterator]()),
    "%Math%": Math,
    "%Number%": Number,
    "%Object%": t,
    "%Object.getOwnPropertyDescriptor%": E,
    "%parseFloat%": parseFloat,
    "%parseInt%": parseInt,
    "%Promise%": typeof Promise > "u" ? e : Promise,
    "%Proxy%": typeof Proxy > "u" ? e : Proxy,
    "%RangeError%": s,
    "%ReferenceError%": n,
    "%Reflect%": typeof Reflect > "u" ? e : Reflect,
    "%RegExp%": RegExp,
    "%Set%": typeof Set > "u" ? e : Set,
    "%SetIteratorPrototype%": typeof Set > "u" || !R || !O ? e : O((/* @__PURE__ */ new Set())[Symbol.iterator]()),
    "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? e : SharedArrayBuffer,
    "%String%": String,
    "%StringIteratorPrototype%": R && O ? O(""[Symbol.iterator]()) : e,
    "%Symbol%": R ? Symbol : e,
    "%SyntaxError%": o,
    "%ThrowTypeError%": k,
    "%TypedArray%": H,
    "%TypeError%": a,
    "%Uint8Array%": typeof Uint8Array > "u" ? e : Uint8Array,
    "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? e : Uint8ClampedArray,
    "%Uint16Array%": typeof Uint16Array > "u" ? e : Uint16Array,
    "%Uint32Array%": typeof Uint32Array > "u" ? e : Uint32Array,
    "%URIError%": h,
    "%WeakMap%": typeof WeakMap > "u" ? e : WeakMap,
    "%WeakRef%": typeof WeakRef > "u" ? e : WeakRef,
    "%WeakSet%": typeof WeakSet > "u" ? e : WeakSet,
    "%Function.prototype.call%": ie,
    "%Function.prototype.apply%": Z,
    "%Object.defineProperty%": S,
    "%Object.getPrototypeOf%": N,
    "%Math.abs%": l,
    "%Math.floor%": c,
    "%Math.max%": u,
    "%Math.min%": p,
    "%Math.pow%": _,
    "%Math.round%": m,
    "%Math.sign%": g,
    "%Reflect.getPrototypeOf%": W
  };
  if (O)
    try {
      null.error;
    } catch ($) {
      var J = O(O($));
      G["%Error.prototype%"] = J;
    }
  var ee = function $(V) {
    var C;
    if (V === "%AsyncFunction%")
      C = y("async function () {}");
    else if (V === "%GeneratorFunction%")
      C = y("function* () {}");
    else if (V === "%AsyncGeneratorFunction%")
      C = y("async function* () {}");
    else if (V === "%AsyncGenerator%") {
      var x = $("%AsyncGeneratorFunction%");
      x && (C = x.prototype);
    } else if (V === "%AsyncIteratorPrototype%") {
      var P = $("%AsyncGenerator%");
      P && O && (C = O(P.prototype));
    }
    return G[V] = C, C;
  }, se = {
    __proto__: null,
    "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
    "%ArrayPrototype%": ["Array", "prototype"],
    "%ArrayProto_entries%": ["Array", "prototype", "entries"],
    "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
    "%ArrayProto_keys%": ["Array", "prototype", "keys"],
    "%ArrayProto_values%": ["Array", "prototype", "values"],
    "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
    "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
    "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
    "%BooleanPrototype%": ["Boolean", "prototype"],
    "%DataViewPrototype%": ["DataView", "prototype"],
    "%DatePrototype%": ["Date", "prototype"],
    "%ErrorPrototype%": ["Error", "prototype"],
    "%EvalErrorPrototype%": ["EvalError", "prototype"],
    "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
    "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
    "%FunctionPrototype%": ["Function", "prototype"],
    "%Generator%": ["GeneratorFunction", "prototype"],
    "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
    "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
    "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
    "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
    "%JSONParse%": ["JSON", "parse"],
    "%JSONStringify%": ["JSON", "stringify"],
    "%MapPrototype%": ["Map", "prototype"],
    "%NumberPrototype%": ["Number", "prototype"],
    "%ObjectPrototype%": ["Object", "prototype"],
    "%ObjProto_toString%": ["Object", "prototype", "toString"],
    "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
    "%PromisePrototype%": ["Promise", "prototype"],
    "%PromiseProto_then%": ["Promise", "prototype", "then"],
    "%Promise_all%": ["Promise", "all"],
    "%Promise_reject%": ["Promise", "reject"],
    "%Promise_resolve%": ["Promise", "resolve"],
    "%RangeErrorPrototype%": ["RangeError", "prototype"],
    "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
    "%RegExpPrototype%": ["RegExp", "prototype"],
    "%SetPrototype%": ["Set", "prototype"],
    "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
    "%StringPrototype%": ["String", "prototype"],
    "%SymbolPrototype%": ["Symbol", "prototype"],
    "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
    "%TypedArrayPrototype%": ["TypedArray", "prototype"],
    "%TypeErrorPrototype%": ["TypeError", "prototype"],
    "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
    "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
    "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
    "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
    "%URIErrorPrototype%": ["URIError", "prototype"],
    "%WeakMapPrototype%": ["WeakMap", "prototype"],
    "%WeakSetPrototype%": ["WeakSet", "prototype"]
  }, Y = si(), ae = Eu(), ve = Y.call(ie, Array.prototype.concat), Ce = Y.call(Z, Array.prototype.splice), L = Y.call(ie, String.prototype.replace), I = Y.call(ie, String.prototype.slice), U = Y.call(ie, RegExp.prototype.exec), te = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, A = /\\(\\)?/g, D = function(V) {
    var C = I(V, 0, 1), x = I(V, -1);
    if (C === "%" && x !== "%")
      throw new o("invalid intrinsic syntax, expected closing `%`");
    if (x === "%" && C !== "%")
      throw new o("invalid intrinsic syntax, expected opening `%`");
    var P = [];
    return L(V, te, function(X, pe, ne, ue) {
      P[P.length] = ne ? L(ue, A, "$1") : pe || X;
    }), P;
  }, F = function(V, C) {
    var x = V, P;
    if (ae(se, x) && (P = se[x], x = "%" + P[0] + "%"), ae(G, x)) {
      var X = G[x];
      if (X === K && (X = ee(x)), typeof X > "u" && !C)
        throw new a("intrinsic " + V + " exists, but is not available. Please file an issue!");
      return {
        alias: P,
        name: x,
        value: X
      };
    }
    throw new o("intrinsic " + V + " does not exist!");
  };
  return mn = function(V, C) {
    if (typeof V != "string" || V.length === 0)
      throw new a("intrinsic name must be a non-empty string");
    if (arguments.length > 1 && typeof C != "boolean")
      throw new a('"allowMissing" argument must be a boolean');
    if (U(/^%?[^%]*%?$/, V) === null)
      throw new o("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
    var x = D(V), P = x.length > 0 ? x[0] : "", X = F("%" + P + "%", C), pe = X.name, ne = X.value, ue = !1, Je = X.alias;
    Je && (P = Je[0], Ce(x, ve([0, 1], Je)));
    for (var z = 1, Ze = !0; z < x.length; z += 1) {
      var Qe = x[z], At = I(Qe, 0, 1), _t = I(Qe, -1);
      if ((At === '"' || At === "'" || At === "`" || _t === '"' || _t === "'" || _t === "`") && At !== _t)
        throw new o("property names with quotes must have matching quotes");
      if ((Qe === "constructor" || !Ze) && (ue = !0), P += "." + Qe, pe = "%" + P + "%", ae(G, pe))
        ne = G[pe];
      else if (ne != null) {
        if (!(Qe in ne)) {
          if (!C)
            throw new a("base intrinsic for " + V + " exists, but the property is not available.");
          return;
        }
        if (E && z + 1 >= x.length) {
          var it = E(ne, Qe);
          Ze = !!it, Ze && "get" in it && !("originalValue" in it.get) ? ne = it.get : ne = ne[Qe];
        } else
          Ze = ae(ne, Qe), ne = ne[Qe];
        Ze && !ue && (G[pe] = ne);
      }
    }
    return ne;
  }, mn;
}
var yn, ch;
function ni() {
  if (ch) return yn;
  ch = 1;
  var e = xu(), t = xa(), r = t([e("%String.prototype.indexOf%")]);
  return yn = function(s, n) {
    var o = (
      /** @type {(this: unknown, ...args: unknown[]) => unknown} */
      e(s, !!n)
    );
    return typeof o == "function" && r(s, ".prototype.") > -1 ? t(
      /** @type {const} */
      [o]
    ) : o;
  }, yn;
}
var bn, uh;
function E_() {
  if (uh) return bn;
  uh = 1;
  var e = cs()(), t = ni(), r = t("Object.prototype.toString"), i = function(a) {
    return e && a && typeof a == "object" && Symbol.toStringTag in a ? !1 : r(a) === "[object Arguments]";
  }, s = function(a) {
    return i(a) ? !0 : a !== null && typeof a == "object" && "length" in a && typeof a.length == "number" && a.length >= 0 && r(a) !== "[object Array]" && "callee" in a && r(a.callee) === "[object Function]";
  }, n = function() {
    return i(arguments);
  }();
  return i.isLegacyArguments = s, bn = n ? i : s, bn;
}
var wn, fh;
function x_() {
  if (fh) return wn;
  fh = 1;
  var e = ni(), t = cs()(), r = Eu(), i = Mr(), s;
  if (t) {
    var n = e("RegExp.prototype.exec"), o = {}, a = function() {
      throw o;
    }, h = {
      toString: a,
      valueOf: a
    };
    typeof Symbol.toPrimitive == "symbol" && (h[Symbol.toPrimitive] = a), s = function(p) {
      if (!p || typeof p != "object")
        return !1;
      var _ = (
        /** @type {NonNullable<typeof gOPD>} */
        i(
          /** @type {{ lastIndex?: unknown }} */
          p,
          "lastIndex"
        )
      ), m = _ && r(_, "value");
      if (!m)
        return !1;
      try {
        n(
          p,
          /** @type {string} */
          /** @type {unknown} */
          h
        );
      } catch (g) {
        return g === o;
      }
    };
  } else {
    var l = e("Object.prototype.toString"), c = "[object RegExp]";
    s = function(p) {
      return !p || typeof p != "object" && typeof p != "function" ? !1 : l(p) === c;
    };
  }
  return wn = s, wn;
}
var Sn, dh;
function k_() {
  if (dh) return Sn;
  dh = 1;
  var e = ni(), t = x_(), r = e("RegExp.prototype.exec"), i = ii();
  return Sn = function(n) {
    if (!t(n))
      throw new i("`regex` must be a RegExp");
    return function(a) {
      return r(n, a) !== null;
    };
  }, Sn;
}
var Cn, ph;
function B_() {
  if (ph) return Cn;
  ph = 1;
  const e = (
    /** @type {GeneratorFunctionConstructor} */
    (function* () {
    }).constructor
  );
  return Cn = () => e, Cn;
}
var En, _h;
function R_() {
  if (_h) return En;
  _h = 1;
  var e = ni(), t = k_(), r = t(/^\s*(?:function)?\*/), i = cs()(), s = ka(), n = e("Object.prototype.toString"), o = e("Function.prototype.toString"), a = B_();
  return En = function(l) {
    if (typeof l != "function")
      return !1;
    if (r(o(l)))
      return !0;
    if (!i) {
      var c = n(l);
      return c === "[object GeneratorFunction]";
    }
    if (!s)
      return !1;
    var u = a();
    return u && s(l) === u.prototype;
  }, En;
}
var xn, gh;
function A_() {
  if (gh) return xn;
  gh = 1;
  var e = Function.prototype.toString, t = typeof Reflect == "object" && Reflect !== null && Reflect.apply, r, i;
  if (typeof t == "function" && typeof Object.defineProperty == "function")
    try {
      r = Object.defineProperty({}, "length", {
        get: function() {
          throw i;
        }
      }), i = {}, t(function() {
        throw 42;
      }, null, r);
    } catch (E) {
      E !== i && (t = null);
    }
  else
    t = null;
  var s = /^\s*class\b/, n = function(S) {
    try {
      var v = e.call(S);
      return s.test(v);
    } catch {
      return !1;
    }
  }, o = function(S) {
    try {
      return n(S) ? !1 : (e.call(S), !0);
    } catch {
      return !1;
    }
  }, a = Object.prototype.toString, h = "[object Object]", l = "[object Function]", c = "[object GeneratorFunction]", u = "[object HTMLAllCollection]", p = "[object HTML document.all class]", _ = "[object HTMLCollection]", m = typeof Symbol == "function" && !!Symbol.toStringTag, g = !(0 in [,]), w = function() {
    return !1;
  };
  if (typeof document == "object") {
    var y = document.all;
    a.call(y) === a.call(document.all) && (w = function(S) {
      if ((g || !S) && (typeof S > "u" || typeof S == "object"))
        try {
          var v = a.call(S);
          return (v === u || v === p || v === _ || v === h) && S("") == null;
        } catch {
        }
      return !1;
    });
  }
  return xn = t ? function(S) {
    if (w(S))
      return !0;
    if (!S || typeof S != "function" && typeof S != "object")
      return !1;
    try {
      t(S, null, r);
    } catch (v) {
      if (v !== i)
        return !1;
    }
    return !n(S) && o(S);
  } : function(S) {
    if (w(S))
      return !0;
    if (!S || typeof S != "function" && typeof S != "object")
      return !1;
    if (m)
      return o(S);
    if (n(S))
      return !1;
    var v = a.call(S);
    return v !== l && v !== c && !/^\[object HTML/.test(v) ? !1 : o(S);
  }, xn;
}
var kn, vh;
function D_() {
  if (vh) return kn;
  vh = 1;
  var e = A_(), t = Object.prototype.toString, r = Object.prototype.hasOwnProperty, i = function(h, l, c) {
    for (var u = 0, p = h.length; u < p; u++)
      r.call(h, u) && (c == null ? l(h[u], u, h) : l.call(c, h[u], u, h));
  }, s = function(h, l, c) {
    for (var u = 0, p = h.length; u < p; u++)
      c == null ? l(h.charAt(u), u, h) : l.call(c, h.charAt(u), u, h);
  }, n = function(h, l, c) {
    for (var u in h)
      r.call(h, u) && (c == null ? l(h[u], u, h) : l.call(c, h[u], u, h));
  };
  function o(a) {
    return t.call(a) === "[object Array]";
  }
  return kn = function(h, l, c) {
    if (!e(l))
      throw new TypeError("iterator must be a function");
    var u;
    arguments.length >= 3 && (u = c), o(h) ? i(h, l, u) : typeof h == "string" ? s(h, l, u) : n(h, l, u);
  }, kn;
}
var Bn, mh;
function T_() {
  return mh || (mh = 1, Bn = [
    "Float16Array",
    "Float32Array",
    "Float64Array",
    "Int8Array",
    "Int16Array",
    "Int32Array",
    "Uint8Array",
    "Uint8ClampedArray",
    "Uint16Array",
    "Uint32Array",
    "BigInt64Array",
    "BigUint64Array"
  ]), Bn;
}
var Rn, yh;
function L_() {
  if (yh) return Rn;
  yh = 1;
  var e = T_(), t = typeof globalThis > "u" ? rr : globalThis;
  return Rn = function() {
    for (var i = [], s = 0; s < e.length; s++)
      typeof t[e[s]] == "function" && (i[i.length] = e[s]);
    return i;
  }, Rn;
}
var An = { exports: {} }, Dn, bh;
function P_() {
  if (bh) return Dn;
  bh = 1;
  var e = us(), t = bu(), r = ii(), i = Mr();
  return Dn = function(n, o, a) {
    if (!n || typeof n != "object" && typeof n != "function")
      throw new r("`obj` must be an object or a function`");
    if (typeof o != "string" && typeof o != "symbol")
      throw new r("`property` must be a string or a symbol`");
    if (arguments.length > 3 && typeof arguments[3] != "boolean" && arguments[3] !== null)
      throw new r("`nonEnumerable`, if provided, must be a boolean or null");
    if (arguments.length > 4 && typeof arguments[4] != "boolean" && arguments[4] !== null)
      throw new r("`nonWritable`, if provided, must be a boolean or null");
    if (arguments.length > 5 && typeof arguments[5] != "boolean" && arguments[5] !== null)
      throw new r("`nonConfigurable`, if provided, must be a boolean or null");
    if (arguments.length > 6 && typeof arguments[6] != "boolean")
      throw new r("`loose`, if provided, must be a boolean");
    var h = arguments.length > 3 ? arguments[3] : null, l = arguments.length > 4 ? arguments[4] : null, c = arguments.length > 5 ? arguments[5] : null, u = arguments.length > 6 ? arguments[6] : !1, p = !!i && i(n, o);
    if (e)
      e(n, o, {
        configurable: c === null && p ? p.configurable : !c,
        enumerable: h === null && p ? p.enumerable : !h,
        value: a,
        writable: l === null && p ? p.writable : !l
      });
    else if (u || !h && !l && !c)
      n[o] = a;
    else
      throw new t("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
  }, Dn;
}
var Tn, wh;
function M_() {
  if (wh) return Tn;
  wh = 1;
  var e = us(), t = function() {
    return !!e;
  };
  return t.hasArrayLengthDefineBug = function() {
    if (!e)
      return null;
    try {
      return e([], "length", { value: 1 }).length !== 1;
    } catch {
      return !0;
    }
  }, Tn = t, Tn;
}
var Ln, Sh;
function O_() {
  if (Sh) return Ln;
  Sh = 1;
  var e = xu(), t = P_(), r = M_()(), i = Mr(), s = ii(), n = e("%Math.floor%");
  return Ln = function(a, h) {
    if (typeof a != "function")
      throw new s("`fn` is not a function");
    if (typeof h != "number" || h < 0 || h > 4294967295 || n(h) !== h)
      throw new s("`length` must be a positive 32-bit integer");
    var l = arguments.length > 2 && !!arguments[2], c = !0, u = !0;
    if ("length" in a && i) {
      var p = i(a, "length");
      p && !p.configurable && (c = !1), p && !p.writable && (u = !1);
    }
    return (c || u || !l) && (r ? t(
      /** @type {Parameters<define>[0]} */
      a,
      "length",
      h,
      !0,
      !0
    ) : t(
      /** @type {Parameters<define>[0]} */
      a,
      "length",
      h
    )), a;
  }, Ln;
}
var Pn, Ch;
function I_() {
  if (Ch) return Pn;
  Ch = 1;
  var e = si(), t = Ea(), r = Cu();
  return Pn = function() {
    return r(e, t, arguments);
  }, Pn;
}
var Eh;
function N_() {
  return Eh || (Eh = 1, function(e) {
    var t = O_(), r = us(), i = xa(), s = I_();
    e.exports = function(o) {
      var a = i(arguments), h = o.length - (arguments.length - 1);
      return t(
        a,
        1 + (h > 0 ? h : 0),
        !0
      );
    }, r ? r(e.exports, "apply", { value: s }) : e.exports.apply = s;
  }(An)), An.exports;
}
var Mn, xh;
function ku() {
  if (xh) return Mn;
  xh = 1;
  var e = D_(), t = L_(), r = N_(), i = ni(), s = Mr(), n = ka(), o = i("Object.prototype.toString"), a = cs()(), h = typeof globalThis > "u" ? rr : globalThis, l = t(), c = i("String.prototype.slice"), u = i("Array.prototype.indexOf", !0) || function(w, y) {
    for (var E = 0; E < w.length; E += 1)
      if (w[E] === y)
        return E;
    return -1;
  }, p = { __proto__: null };
  a && s && n ? e(l, function(g) {
    var w = new h[g]();
    if (Symbol.toStringTag in w && n) {
      var y = n(w), E = s(y, Symbol.toStringTag);
      if (!E && y) {
        var S = n(y);
        E = s(S, Symbol.toStringTag);
      }
      if (E && E.get) {
        var v = r(E.get);
        p[
          /** @type {`$${import('.').TypedArrayName}`} */
          "$" + g
        ] = v;
      }
    }
  }) : e(l, function(g) {
    var w = new h[g](), y = w.slice || w.set;
    if (y) {
      var E = (
        /** @type {import('./types').BoundSlice | import('./types').BoundSet} */
        // @ts-expect-error TODO FIXME
        r(y)
      );
      p[
        /** @type {`$${import('.').TypedArrayName}`} */
        "$" + g
      ] = E;
    }
  });
  var _ = function(w) {
    var y = !1;
    return e(
      /** @type {Record<`\$${import('.').TypedArrayName}`, Getter>} */
      p,
      /** @type {(getter: Getter, name: `\$${import('.').TypedArrayName}`) => void} */
      function(E, S) {
        if (!y)
          try {
            "$" + E(w) === S && (y = /** @type {import('.').TypedArrayName} */
            c(S, 1));
          } catch {
          }
      }
    ), y;
  }, m = function(w) {
    var y = !1;
    return e(
      /** @type {Record<`\$${import('.').TypedArrayName}`, Getter>} */
      p,
      /** @type {(getter: Getter, name: `\$${import('.').TypedArrayName}`) => void} */
      function(E, S) {
        if (!y)
          try {
            E(w), y = /** @type {import('.').TypedArrayName} */
            c(S, 1);
          } catch {
          }
      }
    ), y;
  };
  return Mn = function(w) {
    if (!w || typeof w != "object")
      return !1;
    if (!a) {
      var y = c(o(w), 8, -1);
      return u(l, y) > -1 ? y : y !== "Object" ? !1 : m(w);
    }
    return s ? _(w) : null;
  }, Mn;
}
var On, kh;
function F_() {
  if (kh) return On;
  kh = 1;
  var e = ku();
  return On = function(r) {
    return !!e(r);
  }, On;
}
var Bh;
function U_() {
  return Bh || (Bh = 1, function(e) {
    var t = E_(), r = R_(), i = ku(), s = F_();
    function n(z) {
      return z.call.bind(z);
    }
    var o = typeof BigInt < "u", a = typeof Symbol < "u", h = n(Object.prototype.toString), l = n(Number.prototype.valueOf), c = n(String.prototype.valueOf), u = n(Boolean.prototype.valueOf);
    if (o)
      var p = n(BigInt.prototype.valueOf);
    if (a)
      var _ = n(Symbol.prototype.valueOf);
    function m(z, Ze) {
      if (typeof z != "object")
        return !1;
      try {
        return Ze(z), !0;
      } catch {
        return !1;
      }
    }
    e.isArgumentsObject = t, e.isGeneratorFunction = r, e.isTypedArray = s;
    function g(z) {
      return typeof Promise < "u" && z instanceof Promise || z !== null && typeof z == "object" && typeof z.then == "function" && typeof z.catch == "function";
    }
    e.isPromise = g;
    function w(z) {
      return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? ArrayBuffer.isView(z) : s(z) || I(z);
    }
    e.isArrayBufferView = w;
    function y(z) {
      return i(z) === "Uint8Array";
    }
    e.isUint8Array = y;
    function E(z) {
      return i(z) === "Uint8ClampedArray";
    }
    e.isUint8ClampedArray = E;
    function S(z) {
      return i(z) === "Uint16Array";
    }
    e.isUint16Array = S;
    function v(z) {
      return i(z) === "Uint32Array";
    }
    e.isUint32Array = v;
    function k(z) {
      return i(z) === "Int8Array";
    }
    e.isInt8Array = k;
    function R(z) {
      return i(z) === "Int16Array";
    }
    e.isInt16Array = R;
    function O(z) {
      return i(z) === "Int32Array";
    }
    e.isInt32Array = O;
    function N(z) {
      return i(z) === "Float32Array";
    }
    e.isFloat32Array = N;
    function W(z) {
      return i(z) === "Float64Array";
    }
    e.isFloat64Array = W;
    function Z(z) {
      return i(z) === "BigInt64Array";
    }
    e.isBigInt64Array = Z;
    function ie(z) {
      return i(z) === "BigUint64Array";
    }
    e.isBigUint64Array = ie;
    function K(z) {
      return h(z) === "[object Map]";
    }
    K.working = typeof Map < "u" && K(/* @__PURE__ */ new Map());
    function H(z) {
      return typeof Map > "u" ? !1 : K.working ? K(z) : z instanceof Map;
    }
    e.isMap = H;
    function G(z) {
      return h(z) === "[object Set]";
    }
    G.working = typeof Set < "u" && G(/* @__PURE__ */ new Set());
    function J(z) {
      return typeof Set > "u" ? !1 : G.working ? G(z) : z instanceof Set;
    }
    e.isSet = J;
    function ee(z) {
      return h(z) === "[object WeakMap]";
    }
    ee.working = typeof WeakMap < "u" && ee(/* @__PURE__ */ new WeakMap());
    function se(z) {
      return typeof WeakMap > "u" ? !1 : ee.working ? ee(z) : z instanceof WeakMap;
    }
    e.isWeakMap = se;
    function Y(z) {
      return h(z) === "[object WeakSet]";
    }
    Y.working = typeof WeakSet < "u" && Y(/* @__PURE__ */ new WeakSet());
    function ae(z) {
      return Y(z);
    }
    e.isWeakSet = ae;
    function ve(z) {
      return h(z) === "[object ArrayBuffer]";
    }
    ve.working = typeof ArrayBuffer < "u" && ve(new ArrayBuffer());
    function Ce(z) {
      return typeof ArrayBuffer > "u" ? !1 : ve.working ? ve(z) : z instanceof ArrayBuffer;
    }
    e.isArrayBuffer = Ce;
    function L(z) {
      return h(z) === "[object DataView]";
    }
    L.working = typeof ArrayBuffer < "u" && typeof DataView < "u" && L(new DataView(new ArrayBuffer(1), 0, 1));
    function I(z) {
      return typeof DataView > "u" ? !1 : L.working ? L(z) : z instanceof DataView;
    }
    e.isDataView = I;
    var U = typeof SharedArrayBuffer < "u" ? SharedArrayBuffer : void 0;
    function te(z) {
      return h(z) === "[object SharedArrayBuffer]";
    }
    function A(z) {
      return typeof U > "u" ? !1 : (typeof te.working > "u" && (te.working = te(new U())), te.working ? te(z) : z instanceof U);
    }
    e.isSharedArrayBuffer = A;
    function D(z) {
      return h(z) === "[object AsyncFunction]";
    }
    e.isAsyncFunction = D;
    function F(z) {
      return h(z) === "[object Map Iterator]";
    }
    e.isMapIterator = F;
    function $(z) {
      return h(z) === "[object Set Iterator]";
    }
    e.isSetIterator = $;
    function V(z) {
      return h(z) === "[object Generator]";
    }
    e.isGeneratorObject = V;
    function C(z) {
      return h(z) === "[object WebAssembly.Module]";
    }
    e.isWebAssemblyCompiledModule = C;
    function x(z) {
      return m(z, l);
    }
    e.isNumberObject = x;
    function P(z) {
      return m(z, c);
    }
    e.isStringObject = P;
    function X(z) {
      return m(z, u);
    }
    e.isBooleanObject = X;
    function pe(z) {
      return o && m(z, p);
    }
    e.isBigIntObject = pe;
    function ne(z) {
      return a && m(z, _);
    }
    e.isSymbolObject = ne;
    function ue(z) {
      return x(z) || P(z) || X(z) || pe(z) || ne(z);
    }
    e.isBoxedPrimitive = ue;
    function Je(z) {
      return typeof Uint8Array < "u" && (Ce(z) || A(z));
    }
    e.isAnyArrayBuffer = Je, ["isProxy", "isExternal", "isModuleNamespaceObject"].forEach(function(z) {
      Object.defineProperty(e, z, {
        enumerable: !1,
        value: function() {
          throw new Error(z + " is not supported in userland");
        }
      });
    });
  }(Is)), Is;
}
var In, Rh;
function H_() {
  return Rh || (Rh = 1, In = function(t) {
    return t && typeof t == "object" && typeof t.copy == "function" && typeof t.fill == "function" && typeof t.readUInt8 == "function";
  }), In;
}
var Ah;
function Bu() {
  return Ah || (Ah = 1, function(e) {
    var t = Object.getOwnPropertyDescriptors || function(I) {
      for (var U = Object.keys(I), te = {}, A = 0; A < U.length; A++)
        te[U[A]] = Object.getOwnPropertyDescriptor(I, U[A]);
      return te;
    }, r = /%[sdj%]/g;
    e.format = function(L) {
      if (!k(L)) {
        for (var I = [], U = 0; U < arguments.length; U++)
          I.push(o(arguments[U]));
        return I.join(" ");
      }
      for (var U = 1, te = arguments, A = te.length, D = String(L).replace(r, function($) {
        if ($ === "%%") return "%";
        if (U >= A) return $;
        switch ($) {
          case "%s":
            return String(te[U++]);
          case "%d":
            return Number(te[U++]);
          case "%j":
            try {
              return JSON.stringify(te[U++]);
            } catch {
              return "[Circular]";
            }
          default:
            return $;
        }
      }), F = te[U]; U < A; F = te[++U])
        E(F) || !W(F) ? D += " " + F : D += " " + o(F);
      return D;
    }, e.deprecate = function(L, I) {
      if (typeof le < "u" && le.noDeprecation === !0)
        return L;
      if (typeof le > "u")
        return function() {
          return e.deprecate(L, I).apply(this, arguments);
        };
      var U = !1;
      function te() {
        if (!U) {
          if (le.throwDeprecation)
            throw new Error(I);
          le.traceDeprecation ? console.trace(I) : console.error(I), U = !0;
        }
        return L.apply(this, arguments);
      }
      return te;
    };
    var i = {}, s = /^$/;
    if (le.env.NODE_DEBUG) {
      var n = le.env.NODE_DEBUG;
      n = n.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/,/g, "$|^").toUpperCase(), s = new RegExp("^" + n + "$", "i");
    }
    e.debuglog = function(L) {
      if (L = L.toUpperCase(), !i[L])
        if (s.test(L)) {
          var I = le.pid;
          i[L] = function() {
            var U = e.format.apply(e, arguments);
            console.error("%s %d: %s", L, I, U);
          };
        } else
          i[L] = function() {
          };
      return i[L];
    };
    function o(L, I) {
      var U = {
        seen: [],
        stylize: h
      };
      return arguments.length >= 3 && (U.depth = arguments[2]), arguments.length >= 4 && (U.colors = arguments[3]), y(I) ? U.showHidden = I : I && e._extend(U, I), O(U.showHidden) && (U.showHidden = !1), O(U.depth) && (U.depth = 2), O(U.colors) && (U.colors = !1), O(U.customInspect) && (U.customInspect = !0), U.colors && (U.stylize = a), c(U, L, U.depth);
    }
    e.inspect = o, o.colors = {
      bold: [1, 22],
      italic: [3, 23],
      underline: [4, 24],
      inverse: [7, 27],
      white: [37, 39],
      grey: [90, 39],
      black: [30, 39],
      blue: [34, 39],
      cyan: [36, 39],
      green: [32, 39],
      magenta: [35, 39],
      red: [31, 39],
      yellow: [33, 39]
    }, o.styles = {
      special: "cyan",
      number: "yellow",
      boolean: "yellow",
      undefined: "grey",
      null: "bold",
      string: "green",
      date: "magenta",
      // "name": intentionally not styling
      regexp: "red"
    };
    function a(L, I) {
      var U = o.styles[I];
      return U ? "\x1B[" + o.colors[U][0] + "m" + L + "\x1B[" + o.colors[U][1] + "m" : L;
    }
    function h(L, I) {
      return L;
    }
    function l(L) {
      var I = {};
      return L.forEach(function(U, te) {
        I[U] = !0;
      }), I;
    }
    function c(L, I, U) {
      if (L.customInspect && I && K(I.inspect) && // Filter out the util module, it's inspect function is special
      I.inspect !== e.inspect && // Also filter out any prototype objects using the circular check.
      !(I.constructor && I.constructor.prototype === I)) {
        var te = I.inspect(U, L);
        return k(te) || (te = c(L, te, U)), te;
      }
      var A = u(L, I);
      if (A)
        return A;
      var D = Object.keys(I), F = l(D);
      if (L.showHidden && (D = Object.getOwnPropertyNames(I)), ie(I) && (D.indexOf("message") >= 0 || D.indexOf("description") >= 0))
        return p(I);
      if (D.length === 0) {
        if (K(I)) {
          var $ = I.name ? ": " + I.name : "";
          return L.stylize("[Function" + $ + "]", "special");
        }
        if (N(I))
          return L.stylize(RegExp.prototype.toString.call(I), "regexp");
        if (Z(I))
          return L.stylize(Date.prototype.toString.call(I), "date");
        if (ie(I))
          return p(I);
      }
      var V = "", C = !1, x = ["{", "}"];
      if (w(I) && (C = !0, x = ["[", "]"]), K(I)) {
        var P = I.name ? ": " + I.name : "";
        V = " [Function" + P + "]";
      }
      if (N(I) && (V = " " + RegExp.prototype.toString.call(I)), Z(I) && (V = " " + Date.prototype.toUTCString.call(I)), ie(I) && (V = " " + p(I)), D.length === 0 && (!C || I.length == 0))
        return x[0] + V + x[1];
      if (U < 0)
        return N(I) ? L.stylize(RegExp.prototype.toString.call(I), "regexp") : L.stylize("[Object]", "special");
      L.seen.push(I);
      var X;
      return C ? X = _(L, I, U, F, D) : X = D.map(function(pe) {
        return m(L, I, U, F, pe, C);
      }), L.seen.pop(), g(X, V, x);
    }
    function u(L, I) {
      if (O(I))
        return L.stylize("undefined", "undefined");
      if (k(I)) {
        var U = "'" + JSON.stringify(I).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
        return L.stylize(U, "string");
      }
      if (v(I))
        return L.stylize("" + I, "number");
      if (y(I))
        return L.stylize("" + I, "boolean");
      if (E(I))
        return L.stylize("null", "null");
    }
    function p(L) {
      return "[" + Error.prototype.toString.call(L) + "]";
    }
    function _(L, I, U, te, A) {
      for (var D = [], F = 0, $ = I.length; F < $; ++F)
        Y(I, String(F)) ? D.push(m(
          L,
          I,
          U,
          te,
          String(F),
          !0
        )) : D.push("");
      return A.forEach(function(V) {
        V.match(/^\d+$/) || D.push(m(
          L,
          I,
          U,
          te,
          V,
          !0
        ));
      }), D;
    }
    function m(L, I, U, te, A, D) {
      var F, $, V;
      if (V = Object.getOwnPropertyDescriptor(I, A) || { value: I[A] }, V.get ? V.set ? $ = L.stylize("[Getter/Setter]", "special") : $ = L.stylize("[Getter]", "special") : V.set && ($ = L.stylize("[Setter]", "special")), Y(te, A) || (F = "[" + A + "]"), $ || (L.seen.indexOf(V.value) < 0 ? (E(U) ? $ = c(L, V.value, null) : $ = c(L, V.value, U - 1), $.indexOf(`
`) > -1 && (D ? $ = $.split(`
`).map(function(C) {
        return "  " + C;
      }).join(`
`).slice(2) : $ = `
` + $.split(`
`).map(function(C) {
        return "   " + C;
      }).join(`
`))) : $ = L.stylize("[Circular]", "special")), O(F)) {
        if (D && A.match(/^\d+$/))
          return $;
        F = JSON.stringify("" + A), F.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (F = F.slice(1, -1), F = L.stylize(F, "name")) : (F = F.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), F = L.stylize(F, "string"));
      }
      return F + ": " + $;
    }
    function g(L, I, U) {
      var te = L.reduce(function(A, D) {
        return D.indexOf(`
`) >= 0, A + D.replace(/\u001b\[\d\d?m/g, "").length + 1;
      }, 0);
      return te > 60 ? U[0] + (I === "" ? "" : I + `
 `) + " " + L.join(`,
  `) + " " + U[1] : U[0] + I + " " + L.join(", ") + " " + U[1];
    }
    e.types = U_();
    function w(L) {
      return Array.isArray(L);
    }
    e.isArray = w;
    function y(L) {
      return typeof L == "boolean";
    }
    e.isBoolean = y;
    function E(L) {
      return L === null;
    }
    e.isNull = E;
    function S(L) {
      return L == null;
    }
    e.isNullOrUndefined = S;
    function v(L) {
      return typeof L == "number";
    }
    e.isNumber = v;
    function k(L) {
      return typeof L == "string";
    }
    e.isString = k;
    function R(L) {
      return typeof L == "symbol";
    }
    e.isSymbol = R;
    function O(L) {
      return L === void 0;
    }
    e.isUndefined = O;
    function N(L) {
      return W(L) && G(L) === "[object RegExp]";
    }
    e.isRegExp = N, e.types.isRegExp = N;
    function W(L) {
      return typeof L == "object" && L !== null;
    }
    e.isObject = W;
    function Z(L) {
      return W(L) && G(L) === "[object Date]";
    }
    e.isDate = Z, e.types.isDate = Z;
    function ie(L) {
      return W(L) && (G(L) === "[object Error]" || L instanceof Error);
    }
    e.isError = ie, e.types.isNativeError = ie;
    function K(L) {
      return typeof L == "function";
    }
    e.isFunction = K;
    function H(L) {
      return L === null || typeof L == "boolean" || typeof L == "number" || typeof L == "string" || typeof L == "symbol" || // ES6 symbol
      typeof L > "u";
    }
    e.isPrimitive = H, e.isBuffer = H_();
    function G(L) {
      return Object.prototype.toString.call(L);
    }
    function J(L) {
      return L < 10 ? "0" + L.toString(10) : L.toString(10);
    }
    var ee = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    function se() {
      var L = /* @__PURE__ */ new Date(), I = [
        J(L.getHours()),
        J(L.getMinutes()),
        J(L.getSeconds())
      ].join(":");
      return [L.getDate(), ee[L.getMonth()], I].join(" ");
    }
    e.log = function() {
      console.log("%s - %s", se(), e.format.apply(e, arguments));
    }, e.inherits = gr(), e._extend = function(L, I) {
      if (!I || !W(I)) return L;
      for (var U = Object.keys(I), te = U.length; te--; )
        L[U[te]] = I[U[te]];
      return L;
    };
    function Y(L, I) {
      return Object.prototype.hasOwnProperty.call(L, I);
    }
    var ae = typeof Symbol < "u" ? Symbol("util.promisify.custom") : void 0;
    e.promisify = function(I) {
      if (typeof I != "function")
        throw new TypeError('The "original" argument must be of type Function');
      if (ae && I[ae]) {
        var U = I[ae];
        if (typeof U != "function")
          throw new TypeError('The "util.promisify.custom" argument must be of type Function');
        return Object.defineProperty(U, ae, {
          value: U,
          enumerable: !1,
          writable: !1,
          configurable: !0
        }), U;
      }
      function U() {
        for (var te, A, D = new Promise(function(V, C) {
          te = V, A = C;
        }), F = [], $ = 0; $ < arguments.length; $++)
          F.push(arguments[$]);
        F.push(function(V, C) {
          V ? A(V) : te(C);
        });
        try {
          I.apply(this, F);
        } catch (V) {
          A(V);
        }
        return D;
      }
      return Object.setPrototypeOf(U, Object.getPrototypeOf(I)), ae && Object.defineProperty(U, ae, {
        value: U,
        enumerable: !1,
        writable: !1,
        configurable: !0
      }), Object.defineProperties(
        U,
        t(I)
      );
    }, e.promisify.custom = ae;
    function ve(L, I) {
      if (!L) {
        var U = new Error("Promise was rejected with a falsy value");
        U.reason = L, L = U;
      }
      return I(L);
    }
    function Ce(L) {
      if (typeof L != "function")
        throw new TypeError('The "original" argument must be of type Function');
      function I() {
        for (var U = [], te = 0; te < arguments.length; te++)
          U.push(arguments[te]);
        var A = U.pop();
        if (typeof A != "function")
          throw new TypeError("The last argument must be of type Function");
        var D = this, F = function() {
          return A.apply(D, arguments);
        };
        L.apply(this, U).then(
          function($) {
            le.nextTick(F.bind(null, null, $));
          },
          function($) {
            le.nextTick(ve.bind(null, $, F));
          }
        );
      }
      return Object.setPrototypeOf(I, Object.getPrototypeOf(L)), Object.defineProperties(
        I,
        t(L)
      ), I;
    }
    e.callbackify = Ce;
  }(Os)), Os;
}
var Nn, Dh;
function W_() {
  if (Dh) return Nn;
  Dh = 1;
  function e(m, g) {
    var w = Object.keys(m);
    if (Object.getOwnPropertySymbols) {
      var y = Object.getOwnPropertySymbols(m);
      g && (y = y.filter(function(E) {
        return Object.getOwnPropertyDescriptor(m, E).enumerable;
      })), w.push.apply(w, y);
    }
    return w;
  }
  function t(m) {
    for (var g = 1; g < arguments.length; g++) {
      var w = arguments[g] != null ? arguments[g] : {};
      g % 2 ? e(Object(w), !0).forEach(function(y) {
        r(m, y, w[y]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(m, Object.getOwnPropertyDescriptors(w)) : e(Object(w)).forEach(function(y) {
        Object.defineProperty(m, y, Object.getOwnPropertyDescriptor(w, y));
      });
    }
    return m;
  }
  function r(m, g, w) {
    return g = o(g), g in m ? Object.defineProperty(m, g, { value: w, enumerable: !0, configurable: !0, writable: !0 }) : m[g] = w, m;
  }
  function i(m, g) {
    if (!(m instanceof g))
      throw new TypeError("Cannot call a class as a function");
  }
  function s(m, g) {
    for (var w = 0; w < g.length; w++) {
      var y = g[w];
      y.enumerable = y.enumerable || !1, y.configurable = !0, "value" in y && (y.writable = !0), Object.defineProperty(m, o(y.key), y);
    }
  }
  function n(m, g, w) {
    return g && s(m.prototype, g), Object.defineProperty(m, "prototype", { writable: !1 }), m;
  }
  function o(m) {
    var g = a(m, "string");
    return typeof g == "symbol" ? g : String(g);
  }
  function a(m, g) {
    if (typeof m != "object" || m === null) return m;
    var w = m[Symbol.toPrimitive];
    if (w !== void 0) {
      var y = w.call(m, g);
      if (typeof y != "object") return y;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(m);
  }
  var h = ri, l = h.Buffer, c = Bu(), u = c.inspect, p = u && u.custom || "inspect";
  function _(m, g, w) {
    l.prototype.copy.call(m, g, w);
  }
  return Nn = /* @__PURE__ */ function() {
    function m() {
      i(this, m), this.head = null, this.tail = null, this.length = 0;
    }
    return n(m, [{
      key: "push",
      value: function(w) {
        var y = {
          data: w,
          next: null
        };
        this.length > 0 ? this.tail.next = y : this.head = y, this.tail = y, ++this.length;
      }
    }, {
      key: "unshift",
      value: function(w) {
        var y = {
          data: w,
          next: this.head
        };
        this.length === 0 && (this.tail = y), this.head = y, ++this.length;
      }
    }, {
      key: "shift",
      value: function() {
        if (this.length !== 0) {
          var w = this.head.data;
          return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, w;
        }
      }
    }, {
      key: "clear",
      value: function() {
        this.head = this.tail = null, this.length = 0;
      }
    }, {
      key: "join",
      value: function(w) {
        if (this.length === 0) return "";
        for (var y = this.head, E = "" + y.data; y = y.next; ) E += w + y.data;
        return E;
      }
    }, {
      key: "concat",
      value: function(w) {
        if (this.length === 0) return l.alloc(0);
        for (var y = l.allocUnsafe(w >>> 0), E = this.head, S = 0; E; )
          _(E.data, y, S), S += E.data.length, E = E.next;
        return y;
      }
      // Consumes a specified amount of bytes or characters from the buffered data.
    }, {
      key: "consume",
      value: function(w, y) {
        var E;
        return w < this.head.data.length ? (E = this.head.data.slice(0, w), this.head.data = this.head.data.slice(w)) : w === this.head.data.length ? E = this.shift() : E = y ? this._getString(w) : this._getBuffer(w), E;
      }
    }, {
      key: "first",
      value: function() {
        return this.head.data;
      }
      // Consumes a specified amount of characters from the buffered data.
    }, {
      key: "_getString",
      value: function(w) {
        var y = this.head, E = 1, S = y.data;
        for (w -= S.length; y = y.next; ) {
          var v = y.data, k = w > v.length ? v.length : w;
          if (k === v.length ? S += v : S += v.slice(0, w), w -= k, w === 0) {
            k === v.length ? (++E, y.next ? this.head = y.next : this.head = this.tail = null) : (this.head = y, y.data = v.slice(k));
            break;
          }
          ++E;
        }
        return this.length -= E, S;
      }
      // Consumes a specified amount of bytes from the buffered data.
    }, {
      key: "_getBuffer",
      value: function(w) {
        var y = l.allocUnsafe(w), E = this.head, S = 1;
        for (E.data.copy(y), w -= E.data.length; E = E.next; ) {
          var v = E.data, k = w > v.length ? v.length : w;
          if (v.copy(y, y.length - w, 0, k), w -= k, w === 0) {
            k === v.length ? (++S, E.next ? this.head = E.next : this.head = this.tail = null) : (this.head = E, E.data = v.slice(k));
            break;
          }
          ++S;
        }
        return this.length -= S, y;
      }
      // Make sure the linked list only shows the minimal necessary information.
    }, {
      key: p,
      value: function(w, y) {
        return u(this, t(t({}, y), {}, {
          // Only inspect one level.
          depth: 0,
          // It should not recurse.
          customInspect: !1
        }));
      }
    }]), m;
  }(), Nn;
}
var Fn, Th;
function Ru() {
  if (Th) return Fn;
  Th = 1;
  function e(o, a) {
    var h = this, l = this._readableState && this._readableState.destroyed, c = this._writableState && this._writableState.destroyed;
    return l || c ? (a ? a(o) : o && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, le.nextTick(s, this, o)) : le.nextTick(s, this, o)), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(o || null, function(u) {
      !a && u ? h._writableState ? h._writableState.errorEmitted ? le.nextTick(r, h) : (h._writableState.errorEmitted = !0, le.nextTick(t, h, u)) : le.nextTick(t, h, u) : a ? (le.nextTick(r, h), a(u)) : le.nextTick(r, h);
    }), this);
  }
  function t(o, a) {
    s(o, a), r(o);
  }
  function r(o) {
    o._writableState && !o._writableState.emitClose || o._readableState && !o._readableState.emitClose || o.emit("close");
  }
  function i() {
    this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
  }
  function s(o, a) {
    o.emit("error", a);
  }
  function n(o, a) {
    var h = o._readableState, l = o._writableState;
    h && h.autoDestroy || l && l.autoDestroy ? o.destroy(a) : o.emit("error", a);
  }
  return Fn = {
    destroy: e,
    undestroy: i,
    errorOrDestroy: n
  }, Fn;
}
var Un = {}, Lh;
function Or() {
  if (Lh) return Un;
  Lh = 1;
  function e(a, h) {
    a.prototype = Object.create(h.prototype), a.prototype.constructor = a, a.__proto__ = h;
  }
  var t = {};
  function r(a, h, l) {
    l || (l = Error);
    function c(p, _, m) {
      return typeof h == "string" ? h : h(p, _, m);
    }
    var u = /* @__PURE__ */ function(p) {
      e(_, p);
      function _(m, g, w) {
        return p.call(this, c(m, g, w)) || this;
      }
      return _;
    }(l);
    u.prototype.name = l.name, u.prototype.code = a, t[a] = u;
  }
  function i(a, h) {
    if (Array.isArray(a)) {
      var l = a.length;
      return a = a.map(function(c) {
        return String(c);
      }), l > 2 ? "one of ".concat(h, " ").concat(a.slice(0, l - 1).join(", "), ", or ") + a[l - 1] : l === 2 ? "one of ".concat(h, " ").concat(a[0], " or ").concat(a[1]) : "of ".concat(h, " ").concat(a[0]);
    } else
      return "of ".concat(h, " ").concat(String(a));
  }
  function s(a, h, l) {
    return a.substr(0, h.length) === h;
  }
  function n(a, h, l) {
    return (l === void 0 || l > a.length) && (l = a.length), a.substring(l - h.length, l) === h;
  }
  function o(a, h, l) {
    return typeof l != "number" && (l = 0), l + h.length > a.length ? !1 : a.indexOf(h, l) !== -1;
  }
  return r("ERR_INVALID_OPT_VALUE", function(a, h) {
    return 'The value "' + h + '" is invalid for option "' + a + '"';
  }, TypeError), r("ERR_INVALID_ARG_TYPE", function(a, h, l) {
    var c;
    typeof h == "string" && s(h, "not ") ? (c = "must not be", h = h.replace(/^not /, "")) : c = "must be";
    var u;
    if (n(a, " argument"))
      u = "The ".concat(a, " ").concat(c, " ").concat(i(h, "type"));
    else {
      var p = o(a, ".") ? "property" : "argument";
      u = 'The "'.concat(a, '" ').concat(p, " ").concat(c, " ").concat(i(h, "type"));
    }
    return u += ". Received type ".concat(typeof l), u;
  }, TypeError), r("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF"), r("ERR_METHOD_NOT_IMPLEMENTED", function(a) {
    return "The " + a + " method is not implemented";
  }), r("ERR_STREAM_PREMATURE_CLOSE", "Premature close"), r("ERR_STREAM_DESTROYED", function(a) {
    return "Cannot call " + a + " after a stream was destroyed";
  }), r("ERR_MULTIPLE_CALLBACK", "Callback called multiple times"), r("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable"), r("ERR_STREAM_WRITE_AFTER_END", "write after end"), r("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError), r("ERR_UNKNOWN_ENCODING", function(a) {
    return "Unknown encoding: " + a;
  }, TypeError), r("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event"), Un.codes = t, Un;
}
var Hn, Ph;
function Au() {
  if (Ph) return Hn;
  Ph = 1;
  var e = Or().codes.ERR_INVALID_OPT_VALUE;
  function t(i, s, n) {
    return i.highWaterMark != null ? i.highWaterMark : s ? i[n] : null;
  }
  function r(i, s, n, o) {
    var a = t(s, o, n);
    if (a != null) {
      if (!(isFinite(a) && Math.floor(a) === a) || a < 0) {
        var h = o ? n : "highWaterMark";
        throw new e(h, a);
      }
      return Math.floor(a);
    }
    return i.objectMode ? 16 : 16 * 1024;
  }
  return Hn = {
    getHighWaterMark: r
  }, Hn;
}
var Wn, Mh;
function z_() {
  if (Mh) return Wn;
  Mh = 1, Wn = e;
  function e(r, i) {
    if (t("noDeprecation"))
      return r;
    var s = !1;
    function n() {
      if (!s) {
        if (t("throwDeprecation"))
          throw new Error(i);
        t("traceDeprecation") ? console.trace(i) : console.warn(i), s = !0;
      }
      return r.apply(this, arguments);
    }
    return n;
  }
  function t(r) {
    try {
      if (!rr.localStorage) return !1;
    } catch {
      return !1;
    }
    var i = rr.localStorage[r];
    return i == null ? !1 : String(i).toLowerCase() === "true";
  }
  return Wn;
}
var zn, Oh;
function Du() {
  if (Oh) return zn;
  Oh = 1, zn = N;
  function e(A) {
    var D = this;
    this.next = null, this.entry = null, this.finish = function() {
      te(D, A);
    };
  }
  var t;
  N.WritableState = R;
  var r = {
    deprecate: z_()
  }, i = vu(), s = ri.Buffer, n = (typeof rr < "u" ? rr : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function o(A) {
    return s.from(A);
  }
  function a(A) {
    return s.isBuffer(A) || A instanceof n;
  }
  var h = Ru(), l = Au(), c = l.getHighWaterMark, u = Or().codes, p = u.ERR_INVALID_ARG_TYPE, _ = u.ERR_METHOD_NOT_IMPLEMENTED, m = u.ERR_MULTIPLE_CALLBACK, g = u.ERR_STREAM_CANNOT_PIPE, w = u.ERR_STREAM_DESTROYED, y = u.ERR_STREAM_NULL_VALUES, E = u.ERR_STREAM_WRITE_AFTER_END, S = u.ERR_UNKNOWN_ENCODING, v = h.errorOrDestroy;
  gr()(N, i);
  function k() {
  }
  function R(A, D, F) {
    t = t || Tr(), A = A || {}, typeof F != "boolean" && (F = D instanceof t), this.objectMode = !!A.objectMode, F && (this.objectMode = this.objectMode || !!A.writableObjectMode), this.highWaterMark = c(this, A, "writableHighWaterMark", F), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
    var $ = A.decodeStrings === !1;
    this.decodeStrings = !$, this.defaultEncoding = A.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(V) {
      ee(D, V);
    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.emitClose = A.emitClose !== !1, this.autoDestroy = !!A.autoDestroy, this.bufferedRequestCount = 0, this.corkedRequestsFree = new e(this);
  }
  R.prototype.getBuffer = function() {
    for (var D = this.bufferedRequest, F = []; D; )
      F.push(D), D = D.next;
    return F;
  }, function() {
    try {
      Object.defineProperty(R.prototype, "buffer", {
        get: r.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch {
    }
  }();
  var O;
  typeof Symbol == "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] == "function" ? (O = Function.prototype[Symbol.hasInstance], Object.defineProperty(N, Symbol.hasInstance, {
    value: function(D) {
      return O.call(this, D) ? !0 : this !== N ? !1 : D && D._writableState instanceof R;
    }
  })) : O = function(D) {
    return D instanceof this;
  };
  function N(A) {
    t = t || Tr();
    var D = this instanceof t;
    if (!D && !O.call(N, this)) return new N(A);
    this._writableState = new R(A, this, D), this.writable = !0, A && (typeof A.write == "function" && (this._write = A.write), typeof A.writev == "function" && (this._writev = A.writev), typeof A.destroy == "function" && (this._destroy = A.destroy), typeof A.final == "function" && (this._final = A.final)), i.call(this);
  }
  N.prototype.pipe = function() {
    v(this, new g());
  };
  function W(A, D) {
    var F = new E();
    v(A, F), le.nextTick(D, F);
  }
  function Z(A, D, F, $) {
    var V;
    return F === null ? V = new y() : typeof F != "string" && !D.objectMode && (V = new p("chunk", ["string", "Buffer"], F)), V ? (v(A, V), le.nextTick($, V), !1) : !0;
  }
  N.prototype.write = function(A, D, F) {
    var $ = this._writableState, V = !1, C = !$.objectMode && a(A);
    return C && !s.isBuffer(A) && (A = o(A)), typeof D == "function" && (F = D, D = null), C ? D = "buffer" : D || (D = $.defaultEncoding), typeof F != "function" && (F = k), $.ending ? W(this, F) : (C || Z(this, $, A, F)) && ($.pendingcb++, V = K(this, $, C, A, D, F)), V;
  }, N.prototype.cork = function() {
    this._writableState.corked++;
  }, N.prototype.uncork = function() {
    var A = this._writableState;
    A.corked && (A.corked--, !A.writing && !A.corked && !A.bufferProcessing && A.bufferedRequest && ae(this, A));
  }, N.prototype.setDefaultEncoding = function(D) {
    if (typeof D == "string" && (D = D.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((D + "").toLowerCase()) > -1)) throw new S(D);
    return this._writableState.defaultEncoding = D, this;
  }, Object.defineProperty(N.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  function ie(A, D, F) {
    return !A.objectMode && A.decodeStrings !== !1 && typeof D == "string" && (D = s.from(D, F)), D;
  }
  Object.defineProperty(N.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function K(A, D, F, $, V, C) {
    if (!F) {
      var x = ie(D, $, V);
      $ !== x && (F = !0, V = "buffer", $ = x);
    }
    var P = D.objectMode ? 1 : $.length;
    D.length += P;
    var X = D.length < D.highWaterMark;
    if (X || (D.needDrain = !0), D.writing || D.corked) {
      var pe = D.lastBufferedRequest;
      D.lastBufferedRequest = {
        chunk: $,
        encoding: V,
        isBuf: F,
        callback: C,
        next: null
      }, pe ? pe.next = D.lastBufferedRequest : D.bufferedRequest = D.lastBufferedRequest, D.bufferedRequestCount += 1;
    } else
      H(A, D, !1, P, $, V, C);
    return X;
  }
  function H(A, D, F, $, V, C, x) {
    D.writelen = $, D.writecb = x, D.writing = !0, D.sync = !0, D.destroyed ? D.onwrite(new w("write")) : F ? A._writev(V, D.onwrite) : A._write(V, C, D.onwrite), D.sync = !1;
  }
  function G(A, D, F, $, V) {
    --D.pendingcb, F ? (le.nextTick(V, $), le.nextTick(I, A, D), A._writableState.errorEmitted = !0, v(A, $)) : (V($), A._writableState.errorEmitted = !0, v(A, $), I(A, D));
  }
  function J(A) {
    A.writing = !1, A.writecb = null, A.length -= A.writelen, A.writelen = 0;
  }
  function ee(A, D) {
    var F = A._writableState, $ = F.sync, V = F.writecb;
    if (typeof V != "function") throw new m();
    if (J(F), D) G(A, F, $, D, V);
    else {
      var C = ve(F) || A.destroyed;
      !C && !F.corked && !F.bufferProcessing && F.bufferedRequest && ae(A, F), $ ? le.nextTick(se, A, F, C, V) : se(A, F, C, V);
    }
  }
  function se(A, D, F, $) {
    F || Y(A, D), D.pendingcb--, $(), I(A, D);
  }
  function Y(A, D) {
    D.length === 0 && D.needDrain && (D.needDrain = !1, A.emit("drain"));
  }
  function ae(A, D) {
    D.bufferProcessing = !0;
    var F = D.bufferedRequest;
    if (A._writev && F && F.next) {
      var $ = D.bufferedRequestCount, V = new Array($), C = D.corkedRequestsFree;
      C.entry = F;
      for (var x = 0, P = !0; F; )
        V[x] = F, F.isBuf || (P = !1), F = F.next, x += 1;
      V.allBuffers = P, H(A, D, !0, D.length, V, "", C.finish), D.pendingcb++, D.lastBufferedRequest = null, C.next ? (D.corkedRequestsFree = C.next, C.next = null) : D.corkedRequestsFree = new e(D), D.bufferedRequestCount = 0;
    } else {
      for (; F; ) {
        var X = F.chunk, pe = F.encoding, ne = F.callback, ue = D.objectMode ? 1 : X.length;
        if (H(A, D, !1, ue, X, pe, ne), F = F.next, D.bufferedRequestCount--, D.writing)
          break;
      }
      F === null && (D.lastBufferedRequest = null);
    }
    D.bufferedRequest = F, D.bufferProcessing = !1;
  }
  N.prototype._write = function(A, D, F) {
    F(new _("_write()"));
  }, N.prototype._writev = null, N.prototype.end = function(A, D, F) {
    var $ = this._writableState;
    return typeof A == "function" ? (F = A, A = null, D = null) : typeof D == "function" && (F = D, D = null), A != null && this.write(A, D), $.corked && ($.corked = 1, this.uncork()), $.ending || U(this, $, F), this;
  }, Object.defineProperty(N.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.length;
    }
  });
  function ve(A) {
    return A.ending && A.length === 0 && A.bufferedRequest === null && !A.finished && !A.writing;
  }
  function Ce(A, D) {
    A._final(function(F) {
      D.pendingcb--, F && v(A, F), D.prefinished = !0, A.emit("prefinish"), I(A, D);
    });
  }
  function L(A, D) {
    !D.prefinished && !D.finalCalled && (typeof A._final == "function" && !D.destroyed ? (D.pendingcb++, D.finalCalled = !0, le.nextTick(Ce, A, D)) : (D.prefinished = !0, A.emit("prefinish")));
  }
  function I(A, D) {
    var F = ve(D);
    if (F && (L(A, D), D.pendingcb === 0 && (D.finished = !0, A.emit("finish"), D.autoDestroy))) {
      var $ = A._readableState;
      (!$ || $.autoDestroy && $.endEmitted) && A.destroy();
    }
    return F;
  }
  function U(A, D, F) {
    D.ending = !0, I(A, D), F && (D.finished ? le.nextTick(F) : A.once("finish", F)), D.ended = !0, A.writable = !1;
  }
  function te(A, D, F) {
    var $ = A.entry;
    for (A.entry = null; $; ) {
      var V = $.callback;
      D.pendingcb--, V(F), $ = $.next;
    }
    D.corkedRequestsFree.next = A;
  }
  return Object.defineProperty(N.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState === void 0 ? !1 : this._writableState.destroyed;
    },
    set: function(D) {
      this._writableState && (this._writableState.destroyed = D);
    }
  }), N.prototype.destroy = h.destroy, N.prototype._undestroy = h.undestroy, N.prototype._destroy = function(A, D) {
    D(A);
  }, zn;
}
var qn, Ih;
function Tr() {
  if (Ih) return qn;
  Ih = 1;
  var e = Object.keys || function(l) {
    var c = [];
    for (var u in l) c.push(u);
    return c;
  };
  qn = o;
  var t = Tu(), r = Du();
  gr()(o, t);
  for (var i = e(r.prototype), s = 0; s < i.length; s++) {
    var n = i[s];
    o.prototype[n] || (o.prototype[n] = r.prototype[n]);
  }
  function o(l) {
    if (!(this instanceof o)) return new o(l);
    t.call(this, l), r.call(this, l), this.allowHalfOpen = !0, l && (l.readable === !1 && (this.readable = !1), l.writable === !1 && (this.writable = !1), l.allowHalfOpen === !1 && (this.allowHalfOpen = !1, this.once("end", a)));
  }
  Object.defineProperty(o.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  }), Object.defineProperty(o.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState && this._writableState.getBuffer();
    }
  }), Object.defineProperty(o.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.length;
    }
  });
  function a() {
    this._writableState.ended || le.nextTick(h, this);
  }
  function h(l) {
    l.end();
  }
  return Object.defineProperty(o.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState === void 0 || this._writableState === void 0 ? !1 : this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(c) {
      this._readableState === void 0 || this._writableState === void 0 || (this._readableState.destroyed = c, this._writableState.destroyed = c);
    }
  }), qn;
}
var jn, Nh;
function Ba() {
  if (Nh) return jn;
  Nh = 1;
  var e = Or().codes.ERR_STREAM_PREMATURE_CLOSE;
  function t(n) {
    var o = !1;
    return function() {
      if (!o) {
        o = !0;
        for (var a = arguments.length, h = new Array(a), l = 0; l < a; l++)
          h[l] = arguments[l];
        n.apply(this, h);
      }
    };
  }
  function r() {
  }
  function i(n) {
    return n.setHeader && typeof n.abort == "function";
  }
  function s(n, o, a) {
    if (typeof o == "function") return s(n, null, o);
    o || (o = {}), a = t(a || r);
    var h = o.readable || o.readable !== !1 && n.readable, l = o.writable || o.writable !== !1 && n.writable, c = function() {
      n.writable || p();
    }, u = n._writableState && n._writableState.finished, p = function() {
      l = !1, u = !0, h || a.call(n);
    }, _ = n._readableState && n._readableState.endEmitted, m = function() {
      h = !1, _ = !0, l || a.call(n);
    }, g = function(S) {
      a.call(n, S);
    }, w = function() {
      var S;
      if (h && !_)
        return (!n._readableState || !n._readableState.ended) && (S = new e()), a.call(n, S);
      if (l && !u)
        return (!n._writableState || !n._writableState.ended) && (S = new e()), a.call(n, S);
    }, y = function() {
      n.req.on("finish", p);
    };
    return i(n) ? (n.on("complete", p), n.on("abort", w), n.req ? y() : n.on("request", y)) : l && !n._writableState && (n.on("end", c), n.on("close", c)), n.on("end", m), n.on("finish", p), o.error !== !1 && n.on("error", g), n.on("close", w), function() {
      n.removeListener("complete", p), n.removeListener("abort", w), n.removeListener("request", y), n.req && n.req.removeListener("finish", p), n.removeListener("end", c), n.removeListener("close", c), n.removeListener("finish", p), n.removeListener("end", m), n.removeListener("error", g), n.removeListener("close", w);
    };
  }
  return jn = s, jn;
}
var $n, Fh;
function q_() {
  if (Fh) return $n;
  Fh = 1;
  var e;
  function t(S, v, k) {
    return v = r(v), v in S ? Object.defineProperty(S, v, { value: k, enumerable: !0, configurable: !0, writable: !0 }) : S[v] = k, S;
  }
  function r(S) {
    var v = i(S, "string");
    return typeof v == "symbol" ? v : String(v);
  }
  function i(S, v) {
    if (typeof S != "object" || S === null) return S;
    var k = S[Symbol.toPrimitive];
    if (k !== void 0) {
      var R = k.call(S, v);
      if (typeof R != "object") return R;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (v === "string" ? String : Number)(S);
  }
  var s = Ba(), n = Symbol("lastResolve"), o = Symbol("lastReject"), a = Symbol("error"), h = Symbol("ended"), l = Symbol("lastPromise"), c = Symbol("handlePromise"), u = Symbol("stream");
  function p(S, v) {
    return {
      value: S,
      done: v
    };
  }
  function _(S) {
    var v = S[n];
    if (v !== null) {
      var k = S[u].read();
      k !== null && (S[l] = null, S[n] = null, S[o] = null, v(p(k, !1)));
    }
  }
  function m(S) {
    le.nextTick(_, S);
  }
  function g(S, v) {
    return function(k, R) {
      S.then(function() {
        if (v[h]) {
          k(p(void 0, !0));
          return;
        }
        v[c](k, R);
      }, R);
    };
  }
  var w = Object.getPrototypeOf(function() {
  }), y = Object.setPrototypeOf((e = {
    get stream() {
      return this[u];
    },
    next: function() {
      var v = this, k = this[a];
      if (k !== null)
        return Promise.reject(k);
      if (this[h])
        return Promise.resolve(p(void 0, !0));
      if (this[u].destroyed)
        return new Promise(function(W, Z) {
          le.nextTick(function() {
            v[a] ? Z(v[a]) : W(p(void 0, !0));
          });
        });
      var R = this[l], O;
      if (R)
        O = new Promise(g(R, this));
      else {
        var N = this[u].read();
        if (N !== null)
          return Promise.resolve(p(N, !1));
        O = new Promise(this[c]);
      }
      return this[l] = O, O;
    }
  }, t(e, Symbol.asyncIterator, function() {
    return this;
  }), t(e, "return", function() {
    var v = this;
    return new Promise(function(k, R) {
      v[u].destroy(null, function(O) {
        if (O) {
          R(O);
          return;
        }
        k(p(void 0, !0));
      });
    });
  }), e), w), E = function(v) {
    var k, R = Object.create(y, (k = {}, t(k, u, {
      value: v,
      writable: !0
    }), t(k, n, {
      value: null,
      writable: !0
    }), t(k, o, {
      value: null,
      writable: !0
    }), t(k, a, {
      value: null,
      writable: !0
    }), t(k, h, {
      value: v._readableState.endEmitted,
      writable: !0
    }), t(k, c, {
      value: function(N, W) {
        var Z = R[u].read();
        Z ? (R[l] = null, R[n] = null, R[o] = null, N(p(Z, !1))) : (R[n] = N, R[o] = W);
      },
      writable: !0
    }), k));
    return R[l] = null, s(v, function(O) {
      if (O && O.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        var N = R[o];
        N !== null && (R[l] = null, R[n] = null, R[o] = null, N(O)), R[a] = O;
        return;
      }
      var W = R[n];
      W !== null && (R[l] = null, R[n] = null, R[o] = null, W(p(void 0, !0))), R[h] = !0;
    }), v.on("readable", m.bind(null, R)), R;
  };
  return $n = E, $n;
}
var Kn, Uh;
function j_() {
  return Uh || (Uh = 1, Kn = function() {
    throw new Error("Readable.from is not available in the browser");
  }), Kn;
}
var Vn, Hh;
function Tu() {
  if (Hh) return Vn;
  Hh = 1, Vn = W;
  var e;
  W.ReadableState = N, Sa().EventEmitter;
  var t = function(x, P) {
    return x.listeners(P).length;
  }, r = vu(), i = ri.Buffer, s = (typeof rr < "u" ? rr : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function n(C) {
    return i.from(C);
  }
  function o(C) {
    return i.isBuffer(C) || C instanceof s;
  }
  var a = Bu(), h;
  a && a.debuglog ? h = a.debuglog("stream") : h = function() {
  };
  var l = W_(), c = Ru(), u = Au(), p = u.getHighWaterMark, _ = Or().codes, m = _.ERR_INVALID_ARG_TYPE, g = _.ERR_STREAM_PUSH_AFTER_EOF, w = _.ERR_METHOD_NOT_IMPLEMENTED, y = _.ERR_STREAM_UNSHIFT_AFTER_END_EVENT, E, S, v;
  gr()(W, r);
  var k = c.errorOrDestroy, R = ["error", "close", "destroy", "pause", "resume"];
  function O(C, x, P) {
    if (typeof C.prependListener == "function") return C.prependListener(x, P);
    !C._events || !C._events[x] ? C.on(x, P) : Array.isArray(C._events[x]) ? C._events[x].unshift(P) : C._events[x] = [P, C._events[x]];
  }
  function N(C, x, P) {
    e = e || Tr(), C = C || {}, typeof P != "boolean" && (P = x instanceof e), this.objectMode = !!C.objectMode, P && (this.objectMode = this.objectMode || !!C.readableObjectMode), this.highWaterMark = p(this, C, "readableHighWaterMark", P), this.buffer = new l(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.paused = !0, this.emitClose = C.emitClose !== !1, this.autoDestroy = !!C.autoDestroy, this.destroyed = !1, this.defaultEncoding = C.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, C.encoding && (E || (E = ko().StringDecoder), this.decoder = new E(C.encoding), this.encoding = C.encoding);
  }
  function W(C) {
    if (e = e || Tr(), !(this instanceof W)) return new W(C);
    var x = this instanceof e;
    this._readableState = new N(C, this, x), this.readable = !0, C && (typeof C.read == "function" && (this._read = C.read), typeof C.destroy == "function" && (this._destroy = C.destroy)), r.call(this);
  }
  Object.defineProperty(W.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState === void 0 ? !1 : this._readableState.destroyed;
    },
    set: function(x) {
      this._readableState && (this._readableState.destroyed = x);
    }
  }), W.prototype.destroy = c.destroy, W.prototype._undestroy = c.undestroy, W.prototype._destroy = function(C, x) {
    x(C);
  }, W.prototype.push = function(C, x) {
    var P = this._readableState, X;
    return P.objectMode ? X = !0 : typeof C == "string" && (x = x || P.defaultEncoding, x !== P.encoding && (C = i.from(C, x), x = ""), X = !0), Z(this, C, x, !1, X);
  }, W.prototype.unshift = function(C) {
    return Z(this, C, null, !0, !1);
  };
  function Z(C, x, P, X, pe) {
    h("readableAddChunk", x);
    var ne = C._readableState;
    if (x === null)
      ne.reading = !1, ee(C, ne);
    else {
      var ue;
      if (pe || (ue = K(ne, x)), ue)
        k(C, ue);
      else if (ne.objectMode || x && x.length > 0)
        if (typeof x != "string" && !ne.objectMode && Object.getPrototypeOf(x) !== i.prototype && (x = n(x)), X)
          ne.endEmitted ? k(C, new y()) : ie(C, ne, x, !0);
        else if (ne.ended)
          k(C, new g());
        else {
          if (ne.destroyed)
            return !1;
          ne.reading = !1, ne.decoder && !P ? (x = ne.decoder.write(x), ne.objectMode || x.length !== 0 ? ie(C, ne, x, !1) : ae(C, ne)) : ie(C, ne, x, !1);
        }
      else X || (ne.reading = !1, ae(C, ne));
    }
    return !ne.ended && (ne.length < ne.highWaterMark || ne.length === 0);
  }
  function ie(C, x, P, X) {
    x.flowing && x.length === 0 && !x.sync ? (x.awaitDrain = 0, C.emit("data", P)) : (x.length += x.objectMode ? 1 : P.length, X ? x.buffer.unshift(P) : x.buffer.push(P), x.needReadable && se(C)), ae(C, x);
  }
  function K(C, x) {
    var P;
    return !o(x) && typeof x != "string" && x !== void 0 && !C.objectMode && (P = new m("chunk", ["string", "Buffer", "Uint8Array"], x)), P;
  }
  W.prototype.isPaused = function() {
    return this._readableState.flowing === !1;
  }, W.prototype.setEncoding = function(C) {
    E || (E = ko().StringDecoder);
    var x = new E(C);
    this._readableState.decoder = x, this._readableState.encoding = this._readableState.decoder.encoding;
    for (var P = this._readableState.buffer.head, X = ""; P !== null; )
      X += x.write(P.data), P = P.next;
    return this._readableState.buffer.clear(), X !== "" && this._readableState.buffer.push(X), this._readableState.length = X.length, this;
  };
  var H = 1073741824;
  function G(C) {
    return C >= H ? C = H : (C--, C |= C >>> 1, C |= C >>> 2, C |= C >>> 4, C |= C >>> 8, C |= C >>> 16, C++), C;
  }
  function J(C, x) {
    return C <= 0 || x.length === 0 && x.ended ? 0 : x.objectMode ? 1 : C !== C ? x.flowing && x.length ? x.buffer.head.data.length : x.length : (C > x.highWaterMark && (x.highWaterMark = G(C)), C <= x.length ? C : x.ended ? x.length : (x.needReadable = !0, 0));
  }
  W.prototype.read = function(C) {
    h("read", C), C = parseInt(C, 10);
    var x = this._readableState, P = C;
    if (C !== 0 && (x.emittedReadable = !1), C === 0 && x.needReadable && ((x.highWaterMark !== 0 ? x.length >= x.highWaterMark : x.length > 0) || x.ended))
      return h("read: emitReadable", x.length, x.ended), x.length === 0 && x.ended ? F(this) : se(this), null;
    if (C = J(C, x), C === 0 && x.ended)
      return x.length === 0 && F(this), null;
    var X = x.needReadable;
    h("need readable", X), (x.length === 0 || x.length - C < x.highWaterMark) && (X = !0, h("length less than watermark", X)), x.ended || x.reading ? (X = !1, h("reading or ended", X)) : X && (h("do read"), x.reading = !0, x.sync = !0, x.length === 0 && (x.needReadable = !0), this._read(x.highWaterMark), x.sync = !1, x.reading || (C = J(P, x)));
    var pe;
    return C > 0 ? pe = D(C, x) : pe = null, pe === null ? (x.needReadable = x.length <= x.highWaterMark, C = 0) : (x.length -= C, x.awaitDrain = 0), x.length === 0 && (x.ended || (x.needReadable = !0), P !== C && x.ended && F(this)), pe !== null && this.emit("data", pe), pe;
  };
  function ee(C, x) {
    if (h("onEofChunk"), !x.ended) {
      if (x.decoder) {
        var P = x.decoder.end();
        P && P.length && (x.buffer.push(P), x.length += x.objectMode ? 1 : P.length);
      }
      x.ended = !0, x.sync ? se(C) : (x.needReadable = !1, x.emittedReadable || (x.emittedReadable = !0, Y(C)));
    }
  }
  function se(C) {
    var x = C._readableState;
    h("emitReadable", x.needReadable, x.emittedReadable), x.needReadable = !1, x.emittedReadable || (h("emitReadable", x.flowing), x.emittedReadable = !0, le.nextTick(Y, C));
  }
  function Y(C) {
    var x = C._readableState;
    h("emitReadable_", x.destroyed, x.length, x.ended), !x.destroyed && (x.length || x.ended) && (C.emit("readable"), x.emittedReadable = !1), x.needReadable = !x.flowing && !x.ended && x.length <= x.highWaterMark, A(C);
  }
  function ae(C, x) {
    x.readingMore || (x.readingMore = !0, le.nextTick(ve, C, x));
  }
  function ve(C, x) {
    for (; !x.reading && !x.ended && (x.length < x.highWaterMark || x.flowing && x.length === 0); ) {
      var P = x.length;
      if (h("maybeReadMore read 0"), C.read(0), P === x.length)
        break;
    }
    x.readingMore = !1;
  }
  W.prototype._read = function(C) {
    k(this, new w("_read()"));
  }, W.prototype.pipe = function(C, x) {
    var P = this, X = this._readableState;
    switch (X.pipesCount) {
      case 0:
        X.pipes = C;
        break;
      case 1:
        X.pipes = [X.pipes, C];
        break;
      default:
        X.pipes.push(C);
        break;
    }
    X.pipesCount += 1, h("pipe count=%d opts=%j", X.pipesCount, x);
    var pe = (!x || x.end !== !1) && C !== le.stdout && C !== le.stderr, ne = pe ? Je : Dt;
    X.endEmitted ? le.nextTick(ne) : P.once("end", ne), C.on("unpipe", ue);
    function ue(jt, Ve) {
      h("onunpipe"), jt === P && Ve && Ve.hasUnpiped === !1 && (Ve.hasUnpiped = !0, Qe());
    }
    function Je() {
      h("onend"), C.end();
    }
    var z = Ce(P);
    C.on("drain", z);
    var Ze = !1;
    function Qe() {
      h("cleanup"), C.removeListener("close", it), C.removeListener("finish", et), C.removeListener("drain", z), C.removeListener("error", _t), C.removeListener("unpipe", ue), P.removeListener("end", Je), P.removeListener("end", Dt), P.removeListener("data", At), Ze = !0, X.awaitDrain && (!C._writableState || C._writableState.needDrain) && z();
    }
    P.on("data", At);
    function At(jt) {
      h("ondata");
      var Ve = C.write(jt);
      h("dest.write", Ve), Ve === !1 && ((X.pipesCount === 1 && X.pipes === C || X.pipesCount > 1 && V(X.pipes, C) !== -1) && !Ze && (h("false write response, pause", X.awaitDrain), X.awaitDrain++), P.pause());
    }
    function _t(jt) {
      h("onerror", jt), Dt(), C.removeListener("error", _t), t(C, "error") === 0 && k(C, jt);
    }
    O(C, "error", _t);
    function it() {
      C.removeListener("finish", et), Dt();
    }
    C.once("close", it);
    function et() {
      h("onfinish"), C.removeListener("close", it), Dt();
    }
    C.once("finish", et);
    function Dt() {
      h("unpipe"), P.unpipe(C);
    }
    return C.emit("pipe", P), X.flowing || (h("pipe resume"), P.resume()), C;
  };
  function Ce(C) {
    return function() {
      var P = C._readableState;
      h("pipeOnDrain", P.awaitDrain), P.awaitDrain && P.awaitDrain--, P.awaitDrain === 0 && t(C, "data") && (P.flowing = !0, A(C));
    };
  }
  W.prototype.unpipe = function(C) {
    var x = this._readableState, P = {
      hasUnpiped: !1
    };
    if (x.pipesCount === 0) return this;
    if (x.pipesCount === 1)
      return C && C !== x.pipes ? this : (C || (C = x.pipes), x.pipes = null, x.pipesCount = 0, x.flowing = !1, C && C.emit("unpipe", this, P), this);
    if (!C) {
      var X = x.pipes, pe = x.pipesCount;
      x.pipes = null, x.pipesCount = 0, x.flowing = !1;
      for (var ne = 0; ne < pe; ne++) X[ne].emit("unpipe", this, {
        hasUnpiped: !1
      });
      return this;
    }
    var ue = V(x.pipes, C);
    return ue === -1 ? this : (x.pipes.splice(ue, 1), x.pipesCount -= 1, x.pipesCount === 1 && (x.pipes = x.pipes[0]), C.emit("unpipe", this, P), this);
  }, W.prototype.on = function(C, x) {
    var P = r.prototype.on.call(this, C, x), X = this._readableState;
    return C === "data" ? (X.readableListening = this.listenerCount("readable") > 0, X.flowing !== !1 && this.resume()) : C === "readable" && !X.endEmitted && !X.readableListening && (X.readableListening = X.needReadable = !0, X.flowing = !1, X.emittedReadable = !1, h("on readable", X.length, X.reading), X.length ? se(this) : X.reading || le.nextTick(I, this)), P;
  }, W.prototype.addListener = W.prototype.on, W.prototype.removeListener = function(C, x) {
    var P = r.prototype.removeListener.call(this, C, x);
    return C === "readable" && le.nextTick(L, this), P;
  }, W.prototype.removeAllListeners = function(C) {
    var x = r.prototype.removeAllListeners.apply(this, arguments);
    return (C === "readable" || C === void 0) && le.nextTick(L, this), x;
  };
  function L(C) {
    var x = C._readableState;
    x.readableListening = C.listenerCount("readable") > 0, x.resumeScheduled && !x.paused ? x.flowing = !0 : C.listenerCount("data") > 0 && C.resume();
  }
  function I(C) {
    h("readable nexttick read 0"), C.read(0);
  }
  W.prototype.resume = function() {
    var C = this._readableState;
    return C.flowing || (h("resume"), C.flowing = !C.readableListening, U(this, C)), C.paused = !1, this;
  };
  function U(C, x) {
    x.resumeScheduled || (x.resumeScheduled = !0, le.nextTick(te, C, x));
  }
  function te(C, x) {
    h("resume", x.reading), x.reading || C.read(0), x.resumeScheduled = !1, C.emit("resume"), A(C), x.flowing && !x.reading && C.read(0);
  }
  W.prototype.pause = function() {
    return h("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== !1 && (h("pause"), this._readableState.flowing = !1, this.emit("pause")), this._readableState.paused = !0, this;
  };
  function A(C) {
    var x = C._readableState;
    for (h("flow", x.flowing); x.flowing && C.read() !== null; ) ;
  }
  W.prototype.wrap = function(C) {
    var x = this, P = this._readableState, X = !1;
    C.on("end", function() {
      if (h("wrapped end"), P.decoder && !P.ended) {
        var ue = P.decoder.end();
        ue && ue.length && x.push(ue);
      }
      x.push(null);
    }), C.on("data", function(ue) {
      if (h("wrapped data"), P.decoder && (ue = P.decoder.write(ue)), !(P.objectMode && ue == null) && !(!P.objectMode && (!ue || !ue.length))) {
        var Je = x.push(ue);
        Je || (X = !0, C.pause());
      }
    });
    for (var pe in C)
      this[pe] === void 0 && typeof C[pe] == "function" && (this[pe] = /* @__PURE__ */ function(Je) {
        return function() {
          return C[Je].apply(C, arguments);
        };
      }(pe));
    for (var ne = 0; ne < R.length; ne++)
      C.on(R[ne], this.emit.bind(this, R[ne]));
    return this._read = function(ue) {
      h("wrapped _read", ue), X && (X = !1, C.resume());
    }, this;
  }, typeof Symbol == "function" && (W.prototype[Symbol.asyncIterator] = function() {
    return S === void 0 && (S = q_()), S(this);
  }), Object.defineProperty(W.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.highWaterMark;
    }
  }), Object.defineProperty(W.prototype, "readableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState && this._readableState.buffer;
    }
  }), Object.defineProperty(W.prototype, "readableFlowing", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.flowing;
    },
    set: function(x) {
      this._readableState && (this._readableState.flowing = x);
    }
  }), W._fromList = D, Object.defineProperty(W.prototype, "readableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.length;
    }
  });
  function D(C, x) {
    if (x.length === 0) return null;
    var P;
    return x.objectMode ? P = x.buffer.shift() : !C || C >= x.length ? (x.decoder ? P = x.buffer.join("") : x.buffer.length === 1 ? P = x.buffer.first() : P = x.buffer.concat(x.length), x.buffer.clear()) : P = x.buffer.consume(C, x.decoder), P;
  }
  function F(C) {
    var x = C._readableState;
    h("endReadable", x.endEmitted), x.endEmitted || (x.ended = !0, le.nextTick($, x, C));
  }
  function $(C, x) {
    if (h("endReadableNT", C.endEmitted, C.length), !C.endEmitted && C.length === 0 && (C.endEmitted = !0, x.readable = !1, x.emit("end"), C.autoDestroy)) {
      var P = x._writableState;
      (!P || P.autoDestroy && P.finished) && x.destroy();
    }
  }
  typeof Symbol == "function" && (W.from = function(C, x) {
    return v === void 0 && (v = j_()), v(W, C, x);
  });
  function V(C, x) {
    for (var P = 0, X = C.length; P < X; P++)
      if (C[P] === x) return P;
    return -1;
  }
  return Vn;
}
var Gn, Wh;
function Lu() {
  if (Wh) return Gn;
  Wh = 1, Gn = a;
  var e = Or().codes, t = e.ERR_METHOD_NOT_IMPLEMENTED, r = e.ERR_MULTIPLE_CALLBACK, i = e.ERR_TRANSFORM_ALREADY_TRANSFORMING, s = e.ERR_TRANSFORM_WITH_LENGTH_0, n = Tr();
  gr()(a, n);
  function o(c, u) {
    var p = this._transformState;
    p.transforming = !1;
    var _ = p.writecb;
    if (_ === null)
      return this.emit("error", new r());
    p.writechunk = null, p.writecb = null, u != null && this.push(u), _(c);
    var m = this._readableState;
    m.reading = !1, (m.needReadable || m.length < m.highWaterMark) && this._read(m.highWaterMark);
  }
  function a(c) {
    if (!(this instanceof a)) return new a(c);
    n.call(this, c), this._transformState = {
      afterTransform: o.bind(this),
      needTransform: !1,
      transforming: !1,
      writecb: null,
      writechunk: null,
      writeencoding: null
    }, this._readableState.needReadable = !0, this._readableState.sync = !1, c && (typeof c.transform == "function" && (this._transform = c.transform), typeof c.flush == "function" && (this._flush = c.flush)), this.on("prefinish", h);
  }
  function h() {
    var c = this;
    typeof this._flush == "function" && !this._readableState.destroyed ? this._flush(function(u, p) {
      l(c, u, p);
    }) : l(this, null, null);
  }
  a.prototype.push = function(c, u) {
    return this._transformState.needTransform = !1, n.prototype.push.call(this, c, u);
  }, a.prototype._transform = function(c, u, p) {
    p(new t("_transform()"));
  }, a.prototype._write = function(c, u, p) {
    var _ = this._transformState;
    if (_.writecb = p, _.writechunk = c, _.writeencoding = u, !_.transforming) {
      var m = this._readableState;
      (_.needTransform || m.needReadable || m.length < m.highWaterMark) && this._read(m.highWaterMark);
    }
  }, a.prototype._read = function(c) {
    var u = this._transformState;
    u.writechunk !== null && !u.transforming ? (u.transforming = !0, this._transform(u.writechunk, u.writeencoding, u.afterTransform)) : u.needTransform = !0;
  }, a.prototype._destroy = function(c, u) {
    n.prototype._destroy.call(this, c, function(p) {
      u(p);
    });
  };
  function l(c, u, p) {
    if (u) return c.emit("error", u);
    if (p != null && c.push(p), c._writableState.length) throw new s();
    if (c._transformState.transforming) throw new i();
    return c.push(null);
  }
  return Gn;
}
var Yn, zh;
function $_() {
  if (zh) return Yn;
  zh = 1, Yn = t;
  var e = Lu();
  gr()(t, e);
  function t(r) {
    if (!(this instanceof t)) return new t(r);
    e.call(this, r);
  }
  return t.prototype._transform = function(r, i, s) {
    s(null, r);
  }, Yn;
}
var Xn, qh;
function K_() {
  if (qh) return Xn;
  qh = 1;
  var e;
  function t(p) {
    var _ = !1;
    return function() {
      _ || (_ = !0, p.apply(void 0, arguments));
    };
  }
  var r = Or().codes, i = r.ERR_MISSING_ARGS, s = r.ERR_STREAM_DESTROYED;
  function n(p) {
    if (p) throw p;
  }
  function o(p) {
    return p.setHeader && typeof p.abort == "function";
  }
  function a(p, _, m, g) {
    g = t(g);
    var w = !1;
    p.on("close", function() {
      w = !0;
    }), e === void 0 && (e = Ba()), e(p, {
      readable: _,
      writable: m
    }, function(E) {
      if (E) return g(E);
      w = !0, g();
    });
    var y = !1;
    return function(E) {
      if (!w && !y) {
        if (y = !0, o(p)) return p.abort();
        if (typeof p.destroy == "function") return p.destroy();
        g(E || new s("pipe"));
      }
    };
  }
  function h(p) {
    p();
  }
  function l(p, _) {
    return p.pipe(_);
  }
  function c(p) {
    return !p.length || typeof p[p.length - 1] != "function" ? n : p.pop();
  }
  function u() {
    for (var p = arguments.length, _ = new Array(p), m = 0; m < p; m++)
      _[m] = arguments[m];
    var g = c(_);
    if (Array.isArray(_[0]) && (_ = _[0]), _.length < 2)
      throw new i("streams");
    var w, y = _.map(function(E, S) {
      var v = S < _.length - 1, k = S > 0;
      return a(E, v, k, function(R) {
        w || (w = R), R && y.forEach(h), !v && (y.forEach(h), g(w));
      });
    });
    return _.reduce(l);
  }
  return Xn = u, Xn;
}
var Jn, jh;
function V_() {
  if (jh) return Jn;
  jh = 1, Jn = r;
  var e = Sa().EventEmitter, t = gr();
  t(r, e), r.Readable = Tu(), r.Writable = Du(), r.Duplex = Tr(), r.Transform = Lu(), r.PassThrough = $_(), r.finished = Ba(), r.pipeline = K_(), r.Stream = r;
  function r() {
    e.call(this);
  }
  return r.prototype.pipe = function(i, s) {
    var n = this;
    function o(_) {
      i.writable && i.write(_) === !1 && n.pause && n.pause();
    }
    n.on("data", o);
    function a() {
      n.readable && n.resume && n.resume();
    }
    i.on("drain", a), !i._isStdio && (!s || s.end !== !1) && (n.on("end", l), n.on("close", c));
    var h = !1;
    function l() {
      h || (h = !0, i.end());
    }
    function c() {
      h || (h = !0, typeof i.destroy == "function" && i.destroy());
    }
    function u(_) {
      if (p(), e.listenerCount(this, "error") === 0)
        throw _;
    }
    n.on("error", u), i.on("error", u);
    function p() {
      n.removeListener("data", o), i.removeListener("drain", a), n.removeListener("end", l), n.removeListener("close", c), n.removeListener("error", u), i.removeListener("error", u), n.removeListener("end", p), n.removeListener("close", p), i.removeListener("close", p);
    }
    return n.on("end", p), n.on("close", p), i.on("close", p), i.emit("pipe", n), i;
  }, Jn;
}
ma.exports;
(function(e) {
  var t = ir.Buffer, r = ya, i = gu;
  e.exports.encodings = null, e.exports.defaultCharUnicode = "�", e.exports.defaultCharSingleByte = "?", e.exports.encode = function(o, a, h) {
    o = "" + (o || "");
    var l = e.exports.getEncoder(a, h), c = l.write(o), u = l.end();
    return u && u.length > 0 ? t.concat([c, u]) : c;
  }, e.exports.decode = function(o, a, h) {
    typeof o == "string" && (e.exports.skipDecodeWarning || (console.error("Iconv-lite warning: decode()-ing strings is deprecated. Refer to https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding"), e.exports.skipDecodeWarning = !0), o = t.from("" + (o || ""), "binary"));
    var l = e.exports.getDecoder(a, h), c = l.write(o), u = l.end();
    return u ? c + u : c;
  }, e.exports.encodingExists = function(o) {
    try {
      return e.exports.getCodec(o), !0;
    } catch {
      return !1;
    }
  }, e.exports.toEncoding = e.exports.encode, e.exports.fromEncoding = e.exports.decode, e.exports._codecDataCache = { __proto__: null }, e.exports.getCodec = function(o) {
    if (!e.exports.encodings) {
      var a = s_();
      e.exports.encodings = { __proto__: null }, i(e.exports.encodings, a);
    }
    for (var h = e.exports._canonicalizeEncoding(o), l = {}; ; ) {
      var c = e.exports._codecDataCache[h];
      if (c)
        return c;
      var u = e.exports.encodings[h];
      switch (typeof u) {
        case "string":
          h = u;
          break;
        case "object":
          for (var p in u)
            l[p] = u[p];
          l.encodingName || (l.encodingName = h), h = u.type;
          break;
        case "function":
          return l.encodingName || (l.encodingName = h), c = new u(l, e.exports), e.exports._codecDataCache[l.encodingName] = c, c;
        default:
          throw new Error("Encoding not recognized: '" + o + "' (searched as: '" + h + "')");
      }
    }
  }, e.exports._canonicalizeEncoding = function(n) {
    return ("" + n).toLowerCase().replace(/:\d{4}$|[^0-9a-z]/g, "");
  }, e.exports.getEncoder = function(o, a) {
    var h = e.exports.getCodec(o), l = new h.encoder(a, h);
    return h.bomAware && a && a.addBOM && (l = new r.PrependBOM(l, a)), l;
  }, e.exports.getDecoder = function(o, a) {
    var h = e.exports.getCodec(o), l = new h.decoder(a, h);
    return h.bomAware && !(a && a.stripBOM === !1) && (l = new r.StripBOM(l, a)), l;
  }, e.exports.enableStreamingAPI = function(o) {
    if (!e.exports.supportsStreams) {
      var a = n_()(o);
      e.exports.IconvLiteEncoderStream = a.IconvLiteEncoderStream, e.exports.IconvLiteDecoderStream = a.IconvLiteDecoderStream, e.exports.encodeStream = function(l, c) {
        return new e.exports.IconvLiteEncoderStream(e.exports.getEncoder(l, c), c);
      }, e.exports.decodeStream = function(l, c) {
        return new e.exports.IconvLiteDecoderStream(e.exports.getDecoder(l, c), c);
      }, e.exports.supportsStreams = !0;
    }
  };
  var s;
  try {
    s = V_();
  } catch {
  }
  s && s.Transform ? e.exports.enableStreamingAPI(s) : e.exports.encodeStream = e.exports.decodeStream = function() {
    throw new Error("iconv-lite Streaming API is not enabled. Use iconv.enableStreamingAPI(require('stream')); to enable it.");
  };
})(ma);
var Zr = ma.exports;
class oe extends Error {
  /**
   * constructor
   *
   * @param {string} message error message
   *
   */
  constructor(t) {
    super(t);
  }
}
const Ci = [
  "utf-8",
  "ibm866",
  "iso-8859-2",
  "iso-8859-3",
  "iso-8859-4",
  "iso-8859-5",
  "iso-8859-6",
  "iso-8859-7",
  "iso-8859-8",
  "iso-8859-10",
  "iso-8859-13",
  "iso-8859-14",
  "iso-8859-15",
  "iso-8859-16",
  "koi8-r",
  "koi8-u",
  "macintosh",
  "windows-874",
  "windows-1250",
  "windows-1251",
  "windows-1252",
  "windows-1253",
  "windows-1254",
  "windows-1255",
  "windows-1256",
  "windows-1257",
  "windows-1258",
  "gbk",
  "gb18030",
  "big5",
  "euc-jp",
  "shift-jis",
  "euc-kr",
  "utf-16be",
  "utf-16le"
], Pu = 128, Mu = "...", Ar = (() => {
  let e = [];
  for (let t in Ci)
    try {
      if (!Zr.encodingExists(Ci[t]))
        continue;
      new TextDecoder(Ci[t]), e.push(Ci[t]);
    } catch {
    }
  return e;
})(), G_ = {
  0: !0,
  1: !0,
  2: !0,
  3: !0,
  4: !0,
  5: !0,
  6: !0,
  7: !0,
  8: !0,
  9: !0
}, Y_ = {
  0: !0,
  1: !0,
  2: !0,
  3: !0,
  4: !0,
  5: !0,
  6: !0,
  7: !0,
  8: !0,
  9: !0,
  a: !0,
  b: !0,
  c: !0,
  d: !0,
  e: !0,
  f: !0
};
function Ou(e) {
  for (let t = 0; t < e.length; t++)
    if (!G_[e[t]])
      return !1;
  return !0;
}
function X_(e) {
  let t = e.toLowerCase();
  for (let r = 0; r < t.length; r++)
    if (!Y_[t[r]])
      return !1;
  return !0;
}
function J_(e) {
  for (let t = 0; t < e.length; t++) {
    const r = e.charCodeAt(t);
    if (!(r >= 32 && r <= 126) && r !== 128 && !(r >= 130 && r <= 140) && r !== 142 && !(r >= 145 && r <= 156) && !(r >= 158 && r <= 159) && !(r >= 161 && r <= 255))
      return !1;
  }
  return !0;
}
function Z_(e) {
  let r = e.split(".");
  if (r.length != 4)
    throw new oe("Invalid address");
  let i = new Uint8Array(4);
  for (let s in r) {
    if (!Ou(r[s]))
      throw new oe("Invalid address");
    let n = parseInt(r[s], 10);
    if (isNaN(n))
      throw new oe("Invalid address");
    if (n > 255)
      throw new oe("Invalid address");
    i[s] = n;
  }
  return i;
}
function Q_(e) {
  let r = e.split(":");
  if (r.length > 8 || r.length <= 1)
    throw new oe("Invalid address");
  if (r[0].charAt(0) === "[") {
    r[0] = r[0].substring(1, r[0].length);
    let n = r.length - 1;
    if (r[n].charAt(r[n].length - 1) !== "]")
      throw new oe("Invalid address");
    r[n] = r[n].substring(0, r[n].length - 1);
  }
  let i = new Uint8Array(8 * 2), s = 0;
  for (let n = 0; n < r.length; n++) {
    if (r[n].length <= 0) {
      s = 8 - r.length;
      continue;
    }
    if (!X_(r[n]))
      throw new oe("Invalid address");
    let o = parseInt(r[n], 16);
    if (isNaN(o))
      throw new oe("Invalid address");
    if (o > 65535)
      throw new oe("Invalid address");
    let a = (s + n) * 2;
    i[a] = o >> 8, i[a + 1] = o & 255;
  }
  return i;
}
function Iu(e) {
  let t = new Uint8Array(e.length);
  for (let r = 0, i = e.length; r < i; r++)
    t[r] = e.charCodeAt(r);
  return t;
}
function Nu(e) {
  return new Uint8Array(pu.from(e, "binary").buffer);
}
const e0 = new RegExp("^([0-9A-Za-z_.-]+)$");
function t0(e) {
  if (e.length <= 0)
    throw new oe("Invalid address");
  if (!J_(e))
    throw new oe("Invalid address");
  if (!e0.test(e))
    throw new oe("Invalid address");
  return Iu(e);
}
function $h(e) {
  try {
    return {
      type: "IPv4",
      data: Z_(e)
    };
  } catch {
  }
  try {
    return {
      type: "IPv6",
      data: new Uint8Array(Q_(e).buffer)
    };
  } catch {
  }
  return {
    type: "Hostname",
    data: t0(e)
  };
}
function Ra(e, t) {
  let r = e.lastIndexOf(":"), i = e.indexOf(":"), s = e.indexOf("[");
  if ((r < 0 || r != i) && s < 0) {
    let l = $h(e);
    return {
      type: l.type,
      addr: l.data,
      port: t
    };
  }
  if (s > 0)
    throw new oe("Invalid address");
  if (s === 0) {
    let l = e.lastIndexOf("]");
    if (l <= s || l + 1 != r)
      throw new oe("Invalid address");
  }
  let n = e.slice(0, r), o = e.slice(r + 1, e.length);
  if (!Ou(o))
    throw new oe("Invalid address");
  let a = parseInt(o, 10), h = $h(n);
  return {
    type: h.type,
    addr: h.data,
    port: a
  };
}
const Ei = 0, Ni = 1, Fi = 2, Ui = 3, Lr = 255;
class fs {
  /**
   * Read builds an Address from data readed from the reader
   *
   * @param {reader.Reader} rd The reader
   *
   * @returns {Address} The Address
   *
   * @throws {Exception} when address type is invalid
   */
  static async read(t) {
    let r = await ot(t, 3), i = 0, s = Ei, n = null;
    switch (i |= r[0], i <<= 8, i |= r[1], s = r[2], s) {
      case Ei:
        break;
      case Ni:
        n = await ot(t, 4);
        break;
      case Fi:
        n = await ot(t, 16);
        break;
      case Ui:
        n = await ot(t, 1), n = await ot(t, n[0]);
        break;
      default:
        throw new oe("Unknown address type");
    }
    return new fs(s, n, i);
  }
  /**
   * constructor
   *
   * @param {number} type Type of the address
   * @param {Uint8Array} address Address data
   * @param {number} port port number of the address
   *
   */
  constructor(t, r, i) {
    this.addrType = t, this.addrData = r, this.addrPort = i;
  }
  /**
   * Return the address type
   *
   */
  type() {
    return this.addrType;
  }
  /**
   * Return the address data
   *
   */
  address() {
    return this.addrData;
  }
  /**
   * Return the port data
   *
   */
  port() {
    return this.addrPort;
  }
  /**
   * Buffer returns the marshalled address
   *
   * @returns {Uint8Array} Marshalled address
   *
   * @throws {Exception} When address data is invalid
   *
   */
  buffer() {
    switch (this.type()) {
      case Ei:
        return new Uint8Array([
          this.addrPort >> 8,
          this.addrPort & 255,
          Ei
        ]);
      case Ni:
        if (this.addrData.length != 4)
          throw new oe("Invalid address length");
        return new Uint8Array([
          this.addrPort >> 8,
          this.addrPort & 255,
          Ni,
          this.addrData[0],
          this.addrData[1],
          this.addrData[2],
          this.addrData[3]
        ]);
      case Fi:
        if (this.addrData.length != 16)
          throw new oe("Invalid address length");
        return new Uint8Array([
          this.addrPort >> 8,
          this.addrPort & 255,
          Fi,
          this.addrData[0],
          this.addrData[1],
          this.addrData[2],
          this.addrData[3],
          this.addrData[4],
          this.addrData[5],
          this.addrData[6],
          this.addrData[7],
          this.addrData[8],
          this.addrData[9],
          this.addrData[10],
          this.addrData[11],
          this.addrData[12],
          this.addrData[13],
          this.addrData[14],
          this.addrData[15]
        ]);
      case Ui:
        if (this.addrData.length > Lr)
          throw new oe("Host name cannot longer than " + Lr);
        {
          let t = new Uint8Array(this.addrData.length + 4);
          return t[0] = this.addrPort >> 8 & 255, t[1] = this.addrPort & 255, t[2] = Ui, t[3] = this.addrData.length & 255, t.set(this.addrData, 4), t;
        }
      default:
        throw new oe("Unknown address type");
    }
  }
}
function Fu(e, t) {
  let r = Ra(e, t), i = Ui;
  switch (r.type) {
    case "IPv4":
      i = Ni;
      break;
    case "IPv6":
      i = Fi;
      break;
    case "Hostname":
      break;
    default:
      throw new oe("Invalid address type");
  }
  return {
    type: i,
    address: r.addr,
    port: r.port
  };
}
const wr = {
  title: "",
  type: "",
  host: "",
  tab_color: "",
  meta: {}
};
function r0(e) {
  for (let t in e.meta)
    if (typeof e.meta[t] != "string")
      throw new oe(
        'The data type of meta field "' + t + '" was "' + typeof e.meta[t] + '" instead of expected "string"'
      );
}
function i0(e) {
  let t = {};
  for (let r in wr)
    t[r] = wr[r];
  for (let r in wr) {
    if (typeof wr[r] == typeof e[r]) {
      t[r] = e[r];
      continue;
    }
    if (typeof e[r] > "u" || !e[r]) {
      t[r] = wr[r];
      continue;
    }
    throw new oe(
      'Expecting the data type of "' + r + '" is "' + typeof wr[r] + '", received data of "' + typeof e[r] + '" type instead'
    );
  }
  return r0(t.meta), t;
}
let s0 = class {
  /**
   * constructor
   *
   * @param {object} preset preset data
   *
   */
  constructor(t) {
    this.preset = i0(t);
  }
  /**
   * Return the title of the preset
   *
   * @returns {string}
   *
   */
  title() {
    return this.preset.title;
  }
  /**
   * Return the type of the preset
   *
   * @returns {string}
   *
   */
  type() {
    return this.preset.type;
  }
  /**
   * Return the host of the preset
   *
   * @returns {string}
   *
   */
  host() {
    return this.preset.host;
  }
  /**
   * Return the tab color of the preset
   *
   * @returns {string}
   *
   */
  tabColor() {
    return this.preset.tab_color;
  }
  /**
   * Return the given meta of current preset
   *
   * @param {string} name name of the meta data
   *
   * @throws {Exception} when invalid data is given
   *
   * @returns {string}
   *
   */
  meta(t) {
    if (typeof this.preset.meta[t] != "string")
      throw new oe('Meta "' + t + '" was undefined');
    return this.preset.meta[t];
  }
  /**
   * Return the given meta of current preset, and if failed, return the given
   * default value
   *
   * @param {string} name name of the meta data
   * @param {string} defaultValue default value to be returned when the meta was
   *                              not found
   *
   * @returns {string}
   *
   */
  metaDefault(t, r) {
    try {
      return this.meta(t);
    } catch {
      return r;
    }
  }
  /**
   * Insert new meta item
   *
   * @param {string} name name of the meta data
   * @param {string} data data of the meta data
   *
   * @throws {Exception} when invalid data is given
   *
   */
  insertMeta(t, r) {
    if (typeof this.preset.meta[t] < "u")
      throw new oe('Meta "' + t + '" has already been defined');
    this.preset.meta[t] = r;
  }
  /**
   * Export all meta keys
   *
   * @returns {Array<string>} All meta keys
   *
   */
  metaKeys() {
    let t = [];
    for (let r in this.preset.meta)
      t.push(r);
    return t;
  }
};
function Uu() {
  return new s0({
    title: "Default",
    type: "Default",
    host: "",
    tab_color: "",
    meta: {}
  });
}
const Aa = 1, Da = 2, ds = 3;
class Hu {
  /**
   * constructor
   *
   * @param {string} name Result type
   * @param {Info} info Result info
   * @param {object} control Result controller
   * @param {string} ui User interfact this command will use
   */
  constructor(t, r, i, s) {
    this.name = t, this.info = r, this.control = i, this.ui = s;
  }
}
class n0 {
  /**
   * constructor
   *
   * @param {object} data Step data
   *
   */
  constructor(t) {
    this.s = !!t.success, this.d = t.successData, this.errorTitle = t.errorTitle, this.errorMessage = t.errorMessage;
  }
  /**
   * Return the error of current Done
   *
   * @returns {string} title
   *
   */
  error() {
    return this.errorTitle;
  }
  /**
   * Return the error message of current Done
   *
   * @returns {string} message
   *
   */
  message() {
    return this.errorMessage;
  }
  /**
   * Returns whether or not current Done is representing a success
   *
   * @returns {boolean} True when success, false otherwise
   */
  success() {
    return this.s;
  }
  /**
   * Returns final data
   *
   * @returns {Result} Successful result
   */
  data() {
    return this.d;
  }
}
class o0 {
  /**
   * constructor
   *
   * @param {object} data Step data
   *
   */
  constructor(t) {
    this.t = t.title, this.m = t.message;
  }
  /**
   * Return the title of current Wait
   *
   * @returns {string} title
   *
   */
  title() {
    return this.t;
  }
  /**
   * Return the message of current Wait
   *
   * @returns {string} message
   *
   */
  message() {
    return this.m;
  }
}
const a0 = {
  name: "",
  description: "",
  type: "",
  value: "",
  example: "",
  readonly: !1,
  suggestions(e) {
    return [];
  },
  verify(e) {
    return "";
  }
};
function Wu(e, t) {
  let r = {};
  for (let i in e)
    r[i] = e[i];
  for (let i in t) {
    if (typeof r[i] == typeof t[i]) {
      r[i] = t[i];
      continue;
    }
    throw new oe(
      'Field data type for "' + i + '" was unmatched. Expecting "' + typeof r[i] + '", got "' + typeof t[i] + '" instead'
    );
  }
  if (!r.name)
    throw new oe('Field "name" must be specified');
  return r;
}
function zu(e, t) {
  let r = [];
  for (let i in t) {
    if (!t[i].name)
      throw new oe('Field "name" must be specified');
    if (!e[t[i].name])
      throw new oe('Undefined field "' + t[i].name + '"');
    r.push(Wu(e[t[i].name], t[i]));
  }
  return r;
}
function Bo(e, t, r, i) {
  let s = zu(e, t);
  for (let n in s)
    try {
      s[n].value = r.meta(s[n].name), s[n].readonly = !0, i(s[n].name);
    } catch {
    }
  return s;
}
class l0 {
  /**
   * constructor
   *
   * @param {object} data Step data
   *
   * @throws {Exception} If the field verify is not a function while
   *                               not null
   */
  constructor(t) {
    this.t = t.title, this.m = t.message, this.a = t.actionText, this.r = t.respond, this.c = t.cancel, this.i = [], this.f = {};
    for (let r in t.inputs) {
      let i = Wu(a0, t.inputs[r]);
      this.i.push(i), this.f[t.inputs[r].name.toLowerCase()] = {
        value: i.value,
        verify: i.verify
      };
    }
  }
  /**
   * Return the title of current Prompt
   *
   * @returns {string} title
   *
   */
  title() {
    return this.t;
  }
  /**
   * Return the message of current Prompt
   *
   * @returns {string} message
   *
   */
  message() {
    return this.m;
  }
  /**
   * Return the input field of current prompt
   *
   * @returns {array} Input fields
   *
   */
  inputs() {
    let t = [];
    for (let r in this.i)
      t.push(this.i[r]);
    return t;
  }
  /**
   * Returns the name of the action
   *
   * @returns {string} Action name
   *
   */
  actionText() {
    return this.a;
  }
  /**
   * Receive the submit of current prompt
   *
   * @param {object} inputs Input value
   *
   * @returns {any} The result of the step responder
   *
   * @throws {Exception} When the field is undefined or invalid
   *
   */
  submit(t) {
    let r = {};
    for (let i in this.f)
      r[i] = this.f[i].value;
    for (let i in t) {
      let s = i.toLowerCase();
      if (typeof r[s] > "u")
        throw new oe('Field "' + s + '" is undefined');
      try {
        this.f[s].verify(t[i]);
      } catch (n) {
        throw new oe('Field "' + s + '" is invalid: ' + n);
      }
      r[s] = t[i];
    }
    return this.r(r);
  }
  /**
   * Cancel current wait operation
   *
   */
  cancel() {
    return this.c();
  }
}
function Ta(e, t) {
  return {
    type() {
      return e;
    },
    data() {
      return t;
    }
  };
}
function ts(e, t, r, i) {
  return Ta(ds, {
    success: e,
    successData: t,
    errorTitle: r,
    errorMessage: i
  });
}
function Ot(e, t) {
  return Ta(Da, {
    title: e,
    message: t
  });
}
function Hi(e, t, r, i, s, n) {
  return Ta(Aa, {
    title: e,
    message: t,
    actionText: r,
    inputs: n,
    respond: i,
    cancel: s
  });
}
class h0 {
  /**
   * constructor
   *
   * @param {object} data Step data
   */
  constructor(t) {
    this.t = t.type(), this.d = t.data();
  }
  /**
   * Return step type
   *
   * @returns {string} Step type
   */
  type() {
    return this.t;
  }
  /**
   * Return step data
   *
   * @returns {Done|Prompt} Step data
   *
   * @throws {Exception} When the step type is unknown
   *
   */
  data() {
    switch (this.type()) {
      case Aa:
        return new l0(this.d);
      case Da:
        return new o0(this.d);
      case ds:
        return new n0(this.d);
      default:
        throw new oe("Unknown data type");
    }
  }
}
let Zn = class {
  /**
   * constructor
   *
   * @param {object} built Command executer
   * @param {subscribe.Subscribe} subs Wizard step subscriber
   * @param {function} done Callback which will be called when the wizard
   *                        is done
   *
   */
  constructor(t, r, i) {
    this.built = t, this.subs = r, this.done = i, this.closed = !1, this.built.run();
  }
  /**
   * Return the Next step
   *
   * @returns {Next} Next step
   *
   * @throws {Exception} When wizard is closed
   *
   */
  async next() {
    if (this.closed)
      throw new oe("Wizard already closed, no next step is available");
    let t = await this.subs.subscribe();
    return t.type() === ds && (this.close(), this.done(t)), new h0(t);
  }
  /**
   * Return whether or not the command is started
   *
   * @returns {boolean} True when the command already started, false otherwise
   *
   */
  started() {
    return this.built.started();
  }
  /**
   * Return the name of the control info of current wizard
   *
   * @returns {object}
   *
   */
  control() {
    return this.built.control();
  }
  /**
   * Close current wizard
   *
   * @returns {any} Close result
   *
   */
  close() {
    if (!this.closed)
      return this.closed = !0, this.built.close();
  }
};
class Qn {
  /**
   * constructor
   *
   * @param {Builder} info Builder info
   *
   */
  constructor(t) {
    this.type = t.name(), this.info = t.description(), this.tcolor = t.color();
  }
  /**
   * Return command name
   *
   * @returns {string} Command name
   *
   */
  name() {
    return this.type;
  }
  /**
   * Return command description
   *
   * @returns {string} Command description
   *
   */
  description() {
    return this.info;
  }
  /**
   * Return the theme color of the command
   *
   * @returns {string} Command name
   *
   */
  color() {
    return this.tcolor;
  }
}
class c0 {
  /**
   * constructor
   *
   * @param {object} command Command builder
   *
   */
  constructor(t) {
    this.cid = t.id(), this.represeter = (r) => t.represet(r), this.wizarder = (r, i, s, n, o, a, h, l) => t.wizard(r, i, s, n, o, a, h, l), this.executer = (r, i, s, n, o, a, h, l) => t.execute(r, i, s, n, o, a, h, l), this.launchCmd = (r, i, s, n, o, a) => t.launch(r, i, s, n, o, a), this.launcherCmd = (r) => t.launcher(r), this.type = t.name(), this.info = t.description(), this.tcolor = t.color();
  }
  /**
   * Return the command ID
   *
   * @returns {number} Command ID
   *
   */
  id() {
    return this.cid;
  }
  /**
   * Return command name
   *
   * @returns {string} Command name
   *
   */
  name() {
    return this.type;
  }
  /**
   * Return command description
   *
   * @returns {string} Command description
   *
   */
  description() {
    return this.info;
  }
  /**
   * Return the theme color of the command
   *
   * @returns {string} Command name
   *
   */
  color() {
    return this.tcolor;
  }
  /**
   * Execute an automatic command wizard
   *
   * @param {stream.Streams} streams
   * @param {controls.Controls} controls
   * @param {history.History} history
   * @param {presets.Preset} preset
   * @param {object} session
   * @param {Array<string>} keptSessions
   * @param {function} done Callback which will be called when wizard is done
   *
   * @returns {Wizard} Command wizard
   *
   */
  wizard(t, r, i, s, n, o, a) {
    let h = new er();
    return new Zn(
      this.wizarder(
        new Qn(this),
        s,
        n,
        o,
        t,
        h,
        r,
        i
      ),
      h,
      a
    );
  }
  /**
   * Execute an automatic command wizard
   *
   * @param {stream.Streams} streams
   * @param {controls.Controls} controls
   * @param {history.History} history
   * @param {object} config
   * @param {object} session
   * @param {Array<string>} keptSessions
   * @param {function} done Callback which will be called when wizard is done
   *
   * @returns {Wizard} Command wizard
   *
   */
  execute(t, r, i, s, n, o, a) {
    let h = new er();
    return new Zn(
      this.executer(
        new Qn(this),
        s,
        n,
        o,
        t,
        h,
        r,
        i
      ),
      h,
      a
    );
  }
  /**
   * Launch command wizard out of given launcher string
   *
   * @param {stream.Streams} streams
   * @param {controls.Controls} controls
   * @param {history.History} history
   * @param {string} launcher Launcher format
   * @param {function} done Callback which will be called when launching is done
   *
   * @returns {Wizard} Command wizard
   *
   */
  launch(t, r, i, s, n) {
    let o = new er();
    return new Zn(
      this.launchCmd(
        new Qn(this),
        decodeURI(s),
        t,
        o,
        r,
        i
      ),
      o,
      n
    );
  }
  /**
   * Build launcher string out of given config
   *
   * @param {object} config Configuration object
   *
   * @return {string} Launcher string
   */
  launcher(t) {
    return this.name() + ":" + encodeURI(this.launcherCmd(t));
  }
  /**
   * Reconfigure the preset data for the command wizard
   *
   * @param {presets.Preset} n preset
   *
   * @return {presets.Preset} modified new preset
   */
  represet(t) {
    return this.represeter(t);
  }
}
class u0 {
  /**
   * constructor
   *
   * @param {presets.Preset} preset preset
   * @param {Builder} command executor
   *
   */
  constructor(t, r) {
    this.preset = t, this.command = r;
  }
}
class f0 {
  /**
   * constructor
   *
   * @param {Array<object>} commands Command array
   *
   */
  constructor(t) {
    this.commands = [];
    for (let r = 0; r < t.length; r++)
      this.commands.push(new c0(t[r]));
  }
  /**
   * Return all commands
   *
   * @returns {Array<Builder>} A group of command
   *
   */
  all() {
    return this.commands;
  }
  /**
   * Select one command
   *
   * @param {number} id Command ID
   *
   * @returns {Builder} Command builder
   *
   */
  select(t) {
    return this.commands[t];
  }
  /**
   * Returns presets with merged command
   *
   * @param {presets.Presets} ps
   *
   * @returns {Array<Preset>}
   *
   */
  mergePresets(t) {
    let r = [];
    for (let i = 0; i < this.commands.length; i++) {
      const s = t.fetch(this.commands[i].name());
      for (let n = 0; n < s.length; n++)
        r.push(
          new u0(this.commands[i].represet(s[n]), this.commands[i])
        );
    }
    return r;
  }
}
class d0 {
  /**
   * constructor
   *
   * @param {[]object} controls
   *
   * @throws {Exception} When control type already been defined
   *
   */
  constructor(t) {
    this.controls = {};
    for (let r in t) {
      let i = t[r].type();
      if (typeof this.controls[i] == "object")
        throw new oe('Control "' + i + '" already been defined');
      this.controls[i] = t[r];
    }
  }
  /**
   * Get a control
   *
   * @param {string} type Type of the control
   *
   * @returns {object} Control object
   *
   * @throws {Exception} When given control type is undefined
   *
   */
  get(t) {
    if (typeof this.controls[t] != "object")
      throw new oe('Control "' + t + '" was undefined');
    return this.controls[t];
  }
}
class qu {
  /**
   * constructor
   *
   * @param {[]string} events required events
   * @param {object} callbacks Callbacks
   *
   * @throws {Exception} When event handler is not registered
   *
   */
  constructor(t, r) {
    this.events = {}, this.placeHolders = {};
    for (let i in t) {
      if (typeof r[t[i]] != "function")
        throw new oe(
          'Unknown event type for "' + t[i] + '". Expecting "function" got "' + typeof r[t[i]] + '" instead.'
        );
      let s = t[i];
      s.indexOf("@") === 0 && (s = s.substring(1), this.placeHolders[s] = null), this.events[s] = r[t[i]];
    }
  }
  /**
   * Place callbacks to pending placeholder events
   *
   * @param {string} type Event Type
   * @param {function} callback Callback function
   */
  place(t, r) {
    if (this.placeHolders[t] !== null)
      throw new oe(
        'Event type "' + t + '" cannot be appended. It maybe unregistered or already been acquired'
      );
    if (typeof r != "function")
      throw new oe(
        'Unknown event type for "' + t + '". Expecting "function" got "' + typeof r + '" instead.'
      );
    delete this.placeHolders[t], this.events[t] = r;
  }
  /**
   * Fire an event
   *
   * @param {string} type Event type
   * @param  {...any} data Event data
   *
   * @returns {any} The result of the event handler
   *
   * @throws {Exception} When event type is not registered
   *
   */
  fire(t, ...r) {
    if (!this.events[t] && this.placeHolders[t] !== null)
      throw new oe("Unknown event type: " + t);
    return this.events[t](...r);
  }
}
function Kh(e, t) {
  if (!e || typeof e != "object" || e.length < 0)
    return null;
  let r = {}, i = 0;
  for (let s in e)
    t[e[s]] && (r[e[s]] = t[e[s]], i++);
  return i <= 0 ? null : r;
}
function p0(e, t, r) {
  switch (typeof e[t]) {
    case "string":
      return e[t].indexOf(r) >= 0;
    default:
      return !1;
  }
}
class _0 {
  /**
   * constructor
   *
   * @param {Array<object>} records
   * @param {function} saver
   * @param {number} maxItems
   *
   */
  constructor(t, r, i) {
    this.records = t, this.maxItems = i, this.saver = r;
  }
  /**
   * Return the index of given uname, or -1 when not found
   *
   * @param {string} uname the unique name
   *
   * @returns {integer} The index of given uname
   *
   */
  indexOf(t) {
    for (let r in this.records)
      if (this.records[r].uname === t)
        return r;
    return -1;
  }
  /**
   * Save record to history
   *
   * @param {string} uname unique name
   * @param {string} title Title
   * @param {command.Info} info Command info
   * @param {Date} lastUsed Last used
   * @param {object} data Data
   * @param {object} sessionData Data which only available for current session
   * @param {Array<string>} keptSessions Keys of the session data that should
   *                                     be saved
   *
   */
  save(t, r, i, s, n, o, a) {
    const h = this.indexOf(t);
    h >= 0 && this.records.splice(h, 1), this.records.push({
      uname: t,
      title: r,
      type: s.name(),
      color: s.color(),
      last: i.getTime(),
      data: n,
      session: o,
      keptSessions: a
    }), this.records.length > this.maxItems && (this.records = this.records.slice(
      this.records.length - this.maxItems,
      this.records.length
    )), this.store();
  }
  /**
   * Save current records to storage
   *
   */
  store() {
    this.saver(this, this.export());
  }
  /**
   * Delete record from history
   *
   * @param {string} uid unique name
   *
   */
  del(t) {
    for (let r in this.records)
      if (this.records[r].uname === t) {
        this.records.splice(r, 1);
        break;
      }
    this.saver(this, this.records);
  }
  /**
   * Clear session data
   *
   * @param {string} uid unique name
   *
   */
  clearSession(t) {
    for (let r in this.records)
      if (this.records[r].uname === t) {
        this.records[r].session = null, this.records[r].keptSessions = [];
        break;
      }
    this.store();
  }
  /**
   * Return all history records. The exported data is differ than the
   * internal ones, it cannot be directly import back
   *
   * @returns {Array<object>} Records
   *
   */
  all() {
    let t = [];
    for (let r in this.records)
      t.push({
        uid: this.records[r].uname,
        title: this.records[r].title,
        type: this.records[r].type,
        color: this.records[r].color,
        last: new Date(this.records[r].last),
        data: this.records[r].data,
        session: this.records[r].session,
        keptSessions: this.records[r].keptSessions
      });
    return t;
  }
  /**
   * Export current history records
   *
   * @returns {Array<object>} Records
   *
   */
  export() {
    let t = [];
    for (let r in this.records)
      t.push({
        uname: this.records[r].uname,
        title: this.records[r].title,
        type: this.records[r].type,
        color: this.records[r].color,
        last: this.records[r].last,
        data: this.records[r].data,
        session: Kh(
          this.records[r].keptSessions,
          this.records[r].session
        ),
        keptSessions: this.records[r].keptSessions
      });
    return t;
  }
  /**
   * Import data into current history records
   *
   * @param {Array<object>} records Records
   *
   */
  import(t) {
    for (let r in t)
      this.indexOf(t[r].uname) >= 0 || this.records.push({
        uname: t[r].uname,
        title: t[r].title,
        type: t[r].type,
        color: t[r].color,
        last: t[r].last,
        data: t[r].data,
        session: Kh(
          t[r].keptSessions,
          t[r].session
        ),
        keptSessions: t[r].keptSessions
      });
    this.store();
  }
  /**
   * Search for partly matched results
   *
   * @param {string} type of the history record
   * @param {string} metaName name of the meta data
   * @param {string} keyword keyword to search
   * @param {number} max max results
   */
  search(t, r, i, s) {
    let n = s > this.records.length ? this.records.length : s, o = [];
    n < 0 && (n = this.records.length);
    for (let a = 0; a < this.records.length && o.length < n; a++)
      this.records[a].type === t && this.records[a].data && p0(this.records[a].data, r, i) && o.push(this.records[a]);
    return o;
  }
}
const g0 = 16383, v0 = 2, Vh = 128, xi = 127;
class Gh {
  /**
   * constructor
   *
   * @param {number} num Integer number
   *
   */
  constructor(t) {
    this.num = t;
  }
  /**
   * Marshal integer to buffer
   *
   * @returns {Uint8Array} Integer buffer
   *
   * @throws {Exception} When number is too large
   *
   */
  marshal() {
    if (this.num > g0)
      throw new oe("Integer number cannot be greater than 0x3fff");
    return this.num <= xi ? new Uint8Array([this.num & xi]) : new Uint8Array([
      this.num >> 7 | Vh,
      this.num & xi
    ]);
  }
  /**
   * Parse the reader to build an Integer
   *
   * @param {reader.Reader} rd Data reader
   *
   */
  async unmarshal(t) {
    for (let r = 0; r < v0; r++) {
      let i = await It(t);
      if (this.num |= i[0] & xi, !(Vh & i[0]))
        return;
      this.num <<= 7;
    }
  }
  /**
   * Return the value of the number
   *
   * @returns {number} The integer value
   *
   */
  value() {
    return this.num;
  }
}
let m0 = class ju {
  /**
   * Read String from given reader
   *
   * @param {reader.Reader} rd Source reader
   *
   * @returns {String} readed string
   *
   */
  static async read(t) {
    let r = new Gh(0);
    return await r.unmarshal(t), new ju(await ot(t, r.value()));
  }
  /**
   * constructor
   *
   * @param {Uint8Array} str String data
   */
  constructor(t) {
    this.str = t;
  }
  /**
   * Return the string
   *
   * @returns {Uint8Array} String data
   *
   */
  data() {
    return this.str;
  }
  /**
   * Return serialized String as array
   *
   * @returns {Uint8Array} serialized String
   *
   */
  buffer() {
    let t = new Gh(this.str.length).marshal(), r = new Uint8Array(t.length + this.str.length);
    return r.set(t, 0), r.set(this.str, t.length), r;
  }
};
function $u(e, t, r) {
  return e.length <= t ? e : e.substring(0, t) + r;
}
const y0 = 0, Ku = 1, Vu = 2, La = 1, Yh = 127, ki = 4096, Gu = 22, b0 = 0, w0 = 1, S0 = 2, C0 = 3, E0 = 4, x0 = 5, k0 = 6, B0 = 0, R0 = 1, eo = 2, Xh = 3, A0 = 1, D0 = 2, T0 = 3, Jh = 0, L0 = 1, Zh = 2, P0 = 3;
let M0 = class {
  /**
   * constructor
   *
   * @param {stream.Sender} sd Stream sender
   * @param {object} config configuration
   * @param {object} callbacks Event callbacks
   *
   */
  constructor(t, r, i) {
    this.sender = t, this.config = r, this.connected = !1, this.events = new qu(
      [
        "initialization.failed",
        "initialized",
        "hook.before_connected",
        "connect.failed",
        "connect.succeed",
        "connect.fingerprint",
        "connect.credential",
        "@stdout",
        "@stderr",
        "close",
        "@completed"
      ],
      i
    );
  }
  /**
   * Send intial request
   *
   * @param {stream.InitialSender} initialSender Initial stream request sender
   *
   */
  run(t) {
    let r = new m0(this.config.user), i = r.buffer(), s = new fs(
      this.config.host.type,
      this.config.host.address,
      this.config.host.port
    ), n = s.buffer(), o = new Uint8Array([this.config.auth]), a = new Uint8Array(i.length + n.length + 1);
    a.set(i, 0), a.set(n, i.length), a.set(o, i.length + n.length), t.send(a);
  }
  /**
   * Receive the initial stream request
   *
   * @param {header.InitialStream} streamInitialHeader Server respond on the
   *                                                   initial stream request
   *
   */
  initialize(t) {
    if (!t.success()) {
      this.events.fire("initialization.failed", t);
      return;
    }
    this.events.fire("initialized", t);
  }
  /**
   * Tick the command
   *
   * @param {header.Stream} streamHeader Stream data header
   * @param {reader.Limited} rd Data reader
   *
   * @returns {any} The result of the ticking
   *
   * @throws {Exception} When the stream header type is unknown
   *
   */
  tick(t, r) {
    switch (t.marker()) {
      case k0:
        if (!this.connected)
          return this.events.fire("connect.credential", r, this.sender);
        break;
      case x0:
        if (!this.connected)
          return this.events.fire("connect.fingerprint", r, this.sender);
        break;
      case E0:
        if (!this.connected)
          return this.connected = !0, this.events.fire("connect.succeed", r, this);
        break;
      case C0:
        if (!this.connected)
          return this.events.fire("connect.failed", r);
        break;
      case S0:
        if (!this.connected)
          return this.events.fire("hook.before_connected", r);
        break;
      case w0:
        if (this.connected)
          return this.events.fire("stderr", r);
        break;
      case b0:
        if (this.connected)
          return this.events.fire("stdout", r);
        break;
    }
    throw new oe("Unknown stream header marker");
  }
  /**
   * Send close signal to remote
   *
   */
  async sendClose() {
    return await this.sender.close();
  }
  /**
   * Send data to remote
   *
   * @param {Uint8Array} data
   *
   */
  async sendData(t) {
    return this.sender.sendData(B0, t);
  }
  /**
   * Send resize request
   *
   * @param {number} rows
   * @param {number} cols
   *
   */
  async sendResize(t, r) {
    let i = new DataView(new ArrayBuffer(4));
    return i.setUint16(0, t), i.setUint16(2, r), this.sender.send(R0, new Uint8Array(i.buffer));
  }
  /**
   * Close the command
   *
   */
  async close() {
    return await this.sendClose(), this.events.fire("close");
  }
  /**
   * Tear down the command completely
   *
   */
  completed() {
    return this.events.fire("completed");
  }
};
const hr = {
  Host: {
    name: "Host",
    description: "",
    type: "text",
    value: "",
    example: "ssh.nirui.org:22",
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      if (e.length <= 0)
        throw new Error("Hostname must be specified");
      let t = Ra(e, Gu);
      if (t.addr.length <= 0)
        throw new Error("Cannot be empty");
      if (t.addr.length > Lr)
        throw new Error(
          "Can no longer than " + Lr + " bytes"
        );
      if (t.port <= 0)
        throw new Error("Port must be specified");
      return "Look like " + t.type + " address";
    }
  },
  User: {
    name: "User",
    description: "",
    type: "text",
    value: "",
    example: "guest",
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      if (e.length <= 0)
        throw new Error("Username must be specified");
      if (e.length > Yh)
        throw new Error(
          "Username must not longer than " + Yh + " bytes"
        );
      return `We'll login as user "` + e + '"';
    }
  },
  Encoding: {
    name: "Encoding",
    description: "The character encoding of the server",
    type: "select",
    value: "utf-8",
    example: Ar.join(","),
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      for (let t in Ar)
        if (Ar[t] === e)
          return "";
      throw new Error('The character encoding "' + e + '" is not supported');
    }
  },
  Notice: {
    name: "Notice",
    description: "",
    type: "textdata",
    value: "SSH session is handled by the backend. Traffic will be decrypted on the backend server and then transmit back to your client.",
    example: "",
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      return "";
    }
  },
  Password: {
    name: "Password",
    description: "",
    type: "password",
    value: "",
    example: "----------",
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      if (e.length <= 0)
        throw new Error("Password must be specified");
      if (e.length > ki)
        throw new Error(
          "It's too long, make it shorter than " + ki + " bytes"
        );
      return "We'll login with this password";
    }
  },
  "Private Key": {
    name: "Private Key",
    description: 'Like the one inside <i style="color: #fff; font-style: normal;">~/.ssh/id_rsa</i>, can&apos;t be encrypted<br /><br />To decrypt the Private Key, use command: <i style="color: #fff; font-style: normal;">ssh-keygen -f /path/to/private_key -p</i><br /><br />It is strongly recommended to use one Private Key per SSH server if the Private Key will be submitted to Sshwifty. To generate a new SSH key pair, use command <i style="color: #fff; font-style: normal;">ssh-keygen -o -f /path/to/my_server_key</i> and then deploy the generated <i style="color: #fff; font-style: normal;">/path/to/my_server_key.pub</i> file onto the target SSH server',
    type: "textfile",
    value: "",
    example: "",
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      if (e.length <= 0)
        throw new Error("Private Key must be specified");
      if (e.length > ki)
        throw new Error(
          "It's too long, make it shorter than " + ki + " bytes"
        );
      const t = e.trim().split(`
`);
      let r = !1;
      for (let i in t) {
        if (!r) {
          if (t[i].indexOf("-") === 0 && (r = !0, t[i].indexOf("RSA") <= 0))
            break;
          continue;
        }
        if (t[i].indexOf("Proc-Type: 4,ENCRYPTED") === 0)
          throw new Error("Cannot use encrypted Private Key file");
        if (!(t[i].indexOf(":") > 0)) {
          if (t[i].indexOf("MII") < 0)
            throw new Error("Cannot use encrypted Private Key file");
          break;
        }
      }
      return "We'll login with this Private Key";
    }
  },
  Authentication: {
    name: "Authentication",
    description: "Please make sure the authentication method that you selected is supported by the server, otherwise it will be ignored and likely cause the login to fail",
    type: "radio",
    value: "",
    example: "Password,Private Key,None",
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      switch (e) {
        case "Password":
        case "Private Key":
        case "None":
          return "";
        default:
          throw new Error("Authentication method must be specified");
      }
    }
  },
  Fingerprint: {
    name: "Fingerprint",
    description: "Please carefully verify the fingerprint. DO NOT continue if the fingerprint is unknown to you, otherwise you maybe giving your own secrets to an imposter",
    type: "textdata",
    value: "",
    example: "",
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      return "";
    }
  }
};
function O0(e) {
  switch (e) {
    case "None":
      return y0;
    case "Password":
      return Ku;
    case "Private Key":
      return Vu;
    default:
      throw new oe("Unknown Auth method");
  }
}
let Yu = class {
  /**
   * constructor
   *
   * @param {command.Info} info
   * @param {presets.Preset} preset
   * @param {object} session
   * @param {Array<string>} keptSessions
   * @param {streams.Streams} streams
   * @param {subscribe.Subscribe} subs
   * @param {controls.Controls} controls
   * @param {history.History} history
   *
   */
  constructor(t, r, i, s, n, o, a, h) {
    this.info = t, this.preset = r, this.hasStarted = !1, this.streams = n, this.session = i || {
      credential: ""
    }, this.keptSessions = s, this.step = o, this.controls = a.get("SSH"), this.history = h;
  }
  run() {
    this.step.resolve(this.stepInitialPrompt());
  }
  started() {
    return this.hasStarted;
  }
  control() {
    return this.controls;
  }
  close() {
    this.step.resolve(
      this.stepErrorDone(
        "Action cancelled",
        "Action has been cancelled without reach any success"
      )
    );
  }
  stepErrorDone(t, r) {
    return ts(!1, null, t, r);
  }
  stepSuccessfulDone(t) {
    return ts(
      !0,
      t,
      "Success!",
      "We have connected to the remote"
    );
  }
  stepWaitForAcceptWait() {
    return Ot(
      "Requesting",
      "Waiting for the request to be accepted by the backend"
    );
  }
  stepWaitForEstablishWait(t) {
    return Ot(
      "Connecting to " + t,
      "Establishing connection with the remote host, may take a while"
    );
  }
  stepContinueWaitForEstablishWait() {
    return Ot(
      "Connecting",
      "Establishing connection with the remote host, may take a while"
    );
  }
  /**
   *
   * @param {stream.Sender} sender
   * @param {object} configInput
   * @param {object} sessionData
   *
   */
  buildCommand(t, r, i) {
    let s = this, n = {
      user: Iu(r.user),
      auth: O0(r.authentication),
      charset: r.charset,
      credential: i.credential,
      host: Fu(r.host, Gu),
      fingerprint: r.fingerprint
    }, o = s.keptSessions ? [].concat(...s.keptSessions) : [];
    return new M0(t, n, {
      "initialization.failed"(a) {
        switch (a.data()) {
          case A0:
            s.step.resolve(
              s.stepErrorDone("Request failed", "Invalid username")
            );
            return;
          case D0:
            s.step.resolve(
              s.stepErrorDone("Request failed", "Invalid address")
            );
            return;
          case T0:
            s.step.resolve(
              s.stepErrorDone("Request failed", "Invalid authication method")
            );
            return;
        }
        s.step.resolve(
          s.stepErrorDone("Request failed", "Unknown error: " + a.data())
        );
      },
      initialized(a) {
        s.step.resolve(s.stepWaitForEstablishWait(r.host));
      },
      async "connect.failed"(a) {
        let h = new TextDecoder("utf-8").decode(
          await kt(a)
        );
        s.step.resolve(s.stepErrorDone("Connection failed", h));
      },
      async "hook.before_connected"(a) {
        const h = new TextDecoder("utf-8").decode(
          await kt(a)
        );
        s.step.resolve(
          s.stepHookOutputPrompt("Waiting for server hook", h)
        );
      },
      "connect.succeed"(a, h) {
        s.connectionSucceed = !0, s.step.resolve(
          s.stepSuccessfulDone(
            new Hu(
              r.user + "@" + r.host,
              s.info,
              s.controls.build({
                charset: r.charset,
                tabColor: r.tabColor,
                send(l) {
                  return h.sendData(l);
                },
                close() {
                  return h.sendClose();
                },
                resize(l, c) {
                  return h.sendResize(l, c);
                },
                events: h.events
              }),
              s.controls.ui()
            )
          )
        ), s.history.save(
          s.info.name() + ":" + r.user + "@" + r.host,
          r.user + "@" + r.host,
          /* @__PURE__ */ new Date(),
          s.info,
          r,
          i,
          o
        );
      },
      async "connect.fingerprint"(a, h) {
        s.step.resolve(
          await s.stepFingerprintPrompt(
            a,
            h,
            (l) => r.fingerprint ? r.fingerprint === l ? Jh : Zh : L0,
            (l) => {
              r.fingerprint = l;
            }
          )
        );
      },
      async "connect.credential"(a, h) {
        s.step.resolve(
          s.stepCredentialPrompt(a, h, n, (l, c) => {
            i.credential = l, c && o.indexOf("credential") < 0 && o.push("credential");
          })
        );
      },
      "@stdout"(a) {
      },
      "@stderr"(a) {
      },
      close() {
      },
      "@completed"() {
        s.step.resolve(
          s.stepErrorDone(
            "Operation has failed",
            "Connection has been cancelled"
          )
        );
      }
    });
  }
  stepInitialPrompt() {
    let t = this;
    return Hi(
      "SSH",
      "Secure Shell Host",
      "Connect",
      (r) => {
        t.hasStarted = !0, t.streams.request(La, (i) => t.buildCommand(
          i,
          {
            user: r.user,
            authentication: r.authentication,
            host: r.host,
            charset: r.encoding,
            tabColor: t.preset ? t.preset.tabColor() : "",
            fingerprint: t.preset ? t.preset.metaDefault("Fingerprint", "") : ""
          },
          t.session
        )), t.step.resolve(t.stepWaitForAcceptWait());
      },
      () => {
      },
      Bo(
        hr,
        [
          {
            name: "Host",
            suggestions(r) {
              const i = t.history.search(
                "SSH",
                "host",
                r,
                P0
              );
              let s = [];
              for (let n = 0; n < i.length; n++)
                s.push({
                  title: i[n].title,
                  value: i[n].data.host,
                  meta: {
                    User: i[n].data.user,
                    Authentication: i[n].data.authentication,
                    Encoding: i[n].data.charset
                  }
                });
              return s;
            }
          },
          { name: "User" },
          { name: "Authentication" },
          { name: "Encoding" },
          { name: "Notice" }
        ],
        t.preset,
        (r) => {
        }
      )
    );
  }
  async stepFingerprintPrompt(t, r, i, s) {
    const n = this;
    let o = new TextDecoder("utf-8").decode(
      await kt(t)
    ), a = !1;
    switch (i(o)) {
      case Jh:
        return r.send(eo, new Uint8Array([0])), n.stepContinueWaitForEstablishWait();
      case Zh:
        a = !0;
    }
    return Hi(
      a ? "Danger! Server fingerprint has changed!" : "Do you recognize this server?",
      a ? "It's very unusual. Please verify the new server fingerprint below" : "Verify server fingerprint displayed below",
      a ? "I'm aware of the change" : "Yes, I do",
      (h) => {
        s(o), r.send(eo, new Uint8Array([0])), n.step.resolve(n.stepContinueWaitForEstablishWait());
      },
      () => {
        r.send(eo, new Uint8Array([1])), n.step.resolve(
          Ot("Rejecting", "Sending rejection to the backend")
        );
      },
      zu(hr, [
        {
          name: "Fingerprint",
          value: o
        }
      ])
    );
  }
  stepHookOutputPrompt(t, r) {
    return Ot(
      t,
      $u(
        r,
        Pu,
        Mu
      )
    );
  }
  async stepCredentialPrompt(t, r, i, s) {
    const n = this;
    let o = [];
    if (i.credential.length > 0)
      return r.send(
        Xh,
        new TextEncoder().encode(i.credential)
      ), n.stepContinueWaitForEstablishWait();
    switch (i.auth) {
      case Ku:
        o = [{ name: "Password" }];
        break;
      case Vu:
        o = [{ name: "Private Key" }];
        break;
      default:
        throw new oe(
          'Auth method "' + i.auth + '" was unsupported'
        );
    }
    let a = !1;
    const h = Bo(
      hr,
      o,
      n.preset,
      (l) => {
        l === o[0].name && (a = !0);
      }
    );
    return Hi(
      "Provide credential",
      "Please input your credential",
      "Login",
      (l) => {
        let c = l[o[0].name.toLowerCase()];
        r.send(
          Xh,
          new TextEncoder().encode(c)
        ), s(c, a), n.step.resolve(n.stepContinueWaitForEstablishWait());
      },
      () => {
        r.close(), n.step.resolve(
          Ot(
            "Cancelling login",
            "Cancelling login request, please wait"
          )
        );
      },
      h
    );
  }
};
class I0 extends Yu {
  /**
   * constructor
   *
   * @param {command.Info} info
   * @param {config} config
   * @param {object} session
   * @param {Array<string>} keptSessions
   * @param {streams.Streams} streams
   * @param {subscribe.Subscribe} subs
   * @param {controls.Controls} controls
   * @param {history.History} history
   *
   */
  constructor(t, r, i, s, n, o, a, h) {
    super(
      t,
      Uu(),
      i,
      s,
      n,
      o,
      a,
      h
    ), this.config = r;
  }
  stepInitialPrompt() {
    const t = this;
    return t.hasStarted = !0, t.streams.request(La, (r) => t.buildCommand(
      r,
      {
        user: t.config.user,
        authentication: t.config.authentication,
        host: t.config.host,
        charset: t.config.charset ? t.config.charset : "utf-8",
        tabColor: t.config.tabColor ? t.config.tabColor : "",
        fingerprint: t.config.fingerprint
      },
      t.session
    )), t.stepWaitForAcceptWait();
  }
}
let N0 = class {
  constructor() {
  }
  id() {
    return La;
  }
  name() {
    return "SSH";
  }
  description() {
    return "Secure Shell Host";
  }
  color() {
    return "#3c8";
  }
  wizard(t, r, i, s, n, o, a, h) {
    return new Yu(
      t,
      r,
      i,
      s,
      n,
      o,
      a,
      h
    );
  }
  execute(t, r, i, s, n, o, a, h) {
    return new I0(
      t,
      r,
      i,
      s,
      n,
      o,
      a,
      h
    );
  }
  launch(t, r, i, s, n, o) {
    const a = r.split("|", 3);
    if (a.length < 2)
      throw new oe('Given launcher "' + r + '" was invalid');
    const h = a[0].match(new RegExp("^(.*)\\@(.*)$"));
    if (!h || h.length !== 3)
      throw new oe('Given launcher "' + r + '" was malformed');
    let l = h[1], c = h[2], u = a[1], p = a.length >= 3 && a[2] ? a[2] : "utf-8";
    try {
      hr.User.verify(l), hr.Host.verify(c), hr.Authentication.verify(u), hr.Encoding.verify(p);
    } catch (_) {
      throw new oe(
        'Given launcher "' + r + '" was malformed ' + _
      );
    }
    return this.execute(
      t,
      {
        user: l,
        host: c,
        authentication: u,
        charset: p
      },
      null,
      null,
      i,
      s,
      n,
      o
    );
  }
  launcher(t) {
    return t.user + "@" + t.host + "|" + t.authentication + "|" + (t.charset ? t.charset : "utf-8");
  }
  represet(t) {
    const r = t.host();
    return r.length > 0 && t.insertMeta("Host", r), t;
  }
};
const Pa = 0, F0 = 1, U0 = 0, H0 = 1, W0 = 2, z0 = 3, Xu = 23, q0 = 3;
let j0 = class {
  /**
   * constructor
   *
   * @param {stream.Sender} sd Stream sender
   * @param {object} config configuration
   * @param {object} callbacks Event callbacks
   *
   */
  constructor(t, r, i) {
    this.sender = t, this.config = r, this.connected = !1, this.events = new qu(
      [
        "initialization.failed",
        "initialized",
        "hook.before_connected",
        "connect.failed",
        "connect.succeed",
        "@inband",
        "close",
        "@completed"
      ],
      i
    );
  }
  /**
   * Send intial request
   *
   * @param {stream.InitialSender} initialSender Initial stream request sender
   *
   */
  run(t) {
    let r = new fs(
      this.config.host.type,
      this.config.host.address,
      this.config.host.port
    ), i = r.buffer(), s = new Uint8Array(i.length);
    s.set(i, 0), t.send(s);
  }
  /**
   * Receive the initial stream request
   *
   * @param {header.InitialStream} streamInitialHeader Server respond on the
   *                                                   initial stream request
   *
   */
  initialize(t) {
    if (!t.success()) {
      this.events.fire("initialization.failed", t);
      return;
    }
    this.events.fire("initialized", t);
  }
  /**
   * Tick the command
   *
   * @param {header.Stream} streamHeader Stream data header
   * @param {reader.Limited} rd Data reader
   *
   * @returns {any} The result of the ticking
   *
   * @throws {Exception} When the stream header type is unknown
   *
   */
  tick(t, r) {
    switch (t.marker()) {
      case z0:
        if (!this.connected)
          return this.connected = !0, this.events.fire("connect.succeed", r, this);
        break;
      case W0:
        if (!this.connected)
          return this.events.fire("connect.failed", r);
        break;
      case H0:
        if (!this.connected)
          return this.events.fire("hook.before_connected", r);
        break;
      case U0:
        if (this.connected)
          return this.events.fire("inband", r);
        break;
    }
    throw new oe("Unknown stream header marker");
  }
  /**
   * Send close signal to remote
   *
   */
  sendClose() {
    return this.sender.close();
  }
  /**
   * Send data to remote
   *
   * @param {Uint8Array} data
   *
   */
  sendData(t) {
    return this.sender.sendData(0, t);
  }
  /**
   * Close the command
   *
   */
  close() {
    return this.sendClose(), this.events.fire("close");
  }
  /**
   * Tear down the command completely
   *
   */
  completed() {
    return this.events.fire("completed");
  }
};
const Ro = {
  Host: {
    name: "Host",
    description: 'Looking for server to connect&quest; Checkout <a href="http://www.telnet.org/htm/places.htm" target="blank">telnet.org</a> for public servers.',
    type: "text",
    value: "",
    example: "telnet.nirui.org:23",
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      if (e.length <= 0)
        throw new Error("Hostname must be specified");
      let t = Ra(e, Xu);
      if (t.addr.length <= 0)
        throw new Error("Cannot be empty");
      if (t.addr.length > Lr)
        throw new Error(
          "Can no longer than " + Lr + " bytes"
        );
      if (t.port <= 0)
        throw new Error("Port must be specified");
      return "Look like " + t.type + " address";
    }
  },
  Encoding: {
    name: "Encoding",
    description: "The character encoding of the server",
    type: "select",
    value: "utf-8",
    example: Ar.join(","),
    readonly: !1,
    suggestions(e) {
      return [];
    },
    verify(e) {
      for (let t in Ar)
        if (Ar[t] === e)
          return "";
      throw new Error('The character encoding "' + e + '" is not supported');
    }
  }
};
class Ju {
  /**
   * constructor
   *
   * @param {command.Info} info
   * @param {presets.Preset} preset
   * @param {object} session
   * @param {Array<string>} keptSessions
   * @param {streams.Streams} streams
   * @param {subscribe.Subscribe} subs
   * @param {controls.Controls} controls
   * @param {history.History} history
   *
   */
  constructor(t, r, i, s, n, o, a, h) {
    this.info = t, this.preset = r, this.hasStarted = !1, this.streams = n, this.session = i, this.keptSessions = s, this.step = o, this.controls = a.get("Telnet"), this.history = h;
  }
  run() {
    this.step.resolve(this.stepInitialPrompt());
  }
  started() {
    return this.hasStarted;
  }
  control() {
    return this.controls;
  }
  close() {
    this.step.resolve(
      this.stepErrorDone(
        "Action cancelled",
        "Action has been cancelled without reach any success"
      )
    );
  }
  stepErrorDone(t, r) {
    return ts(!1, null, t, r);
  }
  stepHookOutputPrompt(t, r) {
    return Ot(
      t,
      $u(
        r,
        Pu,
        Mu
      )
    );
  }
  stepSuccessfulDone(t) {
    return ts(
      !0,
      t,
      "Success!",
      "We have connected to the remote"
    );
  }
  stepWaitForAcceptWait() {
    return Ot(
      "Requesting",
      "Waiting for the request to be accepted by the backend"
    );
  }
  stepWaitForEstablishWait(t) {
    return Ot(
      "Connecting to " + t,
      "Establishing connection with the remote host, may take a while"
    );
  }
  /**
   *
   * @param {stream.Sender} sender
   * @param {object} configInput
   * @param {object} sessionData
   *
   */
  buildCommand(t, r, i) {
    let s = this, n = {
      host: Fu(r.host, Xu),
      charset: r.charset
    }, o = s.keptSessions ? [].concat(...s.keptSessions) : [];
    return new j0(t, n, {
      "initialization.failed"(a) {
        switch (a.data()) {
          case F0:
            s.step.resolve(
              s.stepErrorDone("Request rejected", "Invalid address")
            );
            return;
        }
        s.step.resolve(
          s.stepErrorDone(
            "Request rejected",
            "Unknown error code: " + a.data()
          )
        );
      },
      initialized(a) {
        s.step.resolve(s.stepWaitForEstablishWait(r.host));
      },
      async "hook.before_connected"(a) {
        const h = new TextDecoder("utf-8").decode(
          await kt(a)
        );
        s.step.resolve(
          s.stepHookOutputPrompt("Waiting for server hook", h)
        );
      },
      "connect.succeed"(a, h) {
        s.step.resolve(
          s.stepSuccessfulDone(
            new Hu(
              r.host,
              s.info,
              s.controls.build({
                charset: n.charset,
                tabColor: r.tabColor,
                send(l) {
                  return h.sendData(l);
                },
                close() {
                  return h.sendClose();
                },
                events: h.events
              }),
              s.controls.ui()
            )
          )
        ), s.history.save(
          s.info.name() + ":" + r.host,
          r.host,
          /* @__PURE__ */ new Date(),
          s.info,
          r,
          i,
          o
        );
      },
      async "connect.failed"(a) {
        let h = await kt(a), l = new TextDecoder("utf-8").decode(h.buffer);
        s.step.resolve(s.stepErrorDone("Connection failed", l));
      },
      "@inband"(a) {
      },
      close() {
      },
      "@completed"() {
      }
    });
  }
  stepInitialPrompt() {
    const t = this;
    return Hi(
      "Telnet",
      "Teletype Network",
      "Connect",
      (r) => {
        t.hasStarted = !0, t.streams.request(Pa, (i) => t.buildCommand(
          i,
          {
            host: r.host,
            charset: r.encoding,
            tabColor: t.preset ? t.preset.tabColor() : ""
          },
          t.session
        )), t.step.resolve(t.stepWaitForAcceptWait());
      },
      () => {
      },
      Bo(
        Ro,
        [
          {
            name: "Host",
            suggestions(r) {
              const i = t.history.search(
                "Telnet",
                "host",
                r,
                q0
              );
              let s = [];
              for (let n = 0; n < i.length; n++)
                s.push({
                  title: i[n].title,
                  value: i[n].data.host,
                  meta: {
                    Encoding: i[n].data.charset
                  }
                });
              return s;
            }
          },
          { name: "Encoding" }
        ],
        t.preset,
        (r) => {
        }
      )
    );
  }
}
class $0 extends Ju {
  /**
   * constructor
   *
   * @param {command.Info} info
   * @param {object} config
   * @param {object} session
   * @param {Array<string>} keptSessions
   * @param {streams.Streams} streams
   * @param {subscribe.Subscribe} subs
   * @param {controls.Controls} controls
   * @param {history.History} history
   *
   */
  constructor(t, r, i, s, n, o, a, h) {
    super(
      t,
      Uu(),
      i,
      s,
      n,
      o,
      a,
      h
    ), this.config = r;
  }
  stepInitialPrompt() {
    const t = this;
    return t.hasStarted = !0, t.streams.request(Pa, (r) => t.buildCommand(
      r,
      {
        host: t.config.host,
        charset: t.config.charset ? t.config.charset : "utf-8",
        tabColor: t.config.tabColor ? t.config.tabColor : ""
      },
      t.session
    )), t.stepWaitForAcceptWait();
  }
}
class K0 {
  constructor() {
  }
  id() {
    return Pa;
  }
  name() {
    return "Telnet";
  }
  description() {
    return "Teletype Network";
  }
  color() {
    return "#6ac";
  }
  wizard(t, r, i, s, n, o, a, h) {
    return new Ju(
      t,
      r,
      i,
      s,
      n,
      o,
      a,
      h
    );
  }
  execute(t, r, i, s, n, o, a, h) {
    return new $0(
      t,
      r,
      i,
      s,
      n,
      o,
      a,
      h
    );
  }
  launch(t, r, i, s, n, o) {
    const a = r.split("|", 2);
    if (a.length <= 0)
      throw new oe('Given launcher "' + r + '" was invalid');
    try {
      Ro.Host.verify(a[0]);
    } catch (l) {
      throw new oe(
        'Given launcher "' + r + '" was invalid: ' + l
      );
    }
    let h = "utf-8";
    if (a.length > 1)
      try {
        Ro.Encoding.verify(a[1]), h = a[1];
      } catch (l) {
        throw new oe(
          'Given launcher "' + r + '" was invalid: ' + l
        );
      }
    return this.execute(
      t,
      {
        host: a[0],
        charset: h
      },
      null,
      null,
      i,
      s,
      n,
      o
    );
  }
  launcher(t) {
    return t.host + "|" + (t.charset ? t.charset : "utf-8");
  }
  represet(t) {
    const r = t.host();
    return r.length > 0 && t.insertMeta("Host", r), t;
  }
}
function to(e) {
  let t = Math.round(e).toString(16);
  return t.length % 2 === 0 ? t : "0" + t;
}
function ro(e) {
  return Math.round(parseInt(e, 16));
}
const V0 = "^([a-f0-9]+)$";
function G0(e) {
  if (!e.toLowerCase().match(V0))
    return "";
  switch (e.length) {
    case 6:
      return e;
    case 5:
      return e + e[4];
    case 4:
      return e[0] + e[1] + e[2] + e[2] + e[3] + e[3];
    case 3:
      return e[0] + e[0] + e[1] + e[1] + e[2] + e[2];
    case 2:
      return e[0] + e[0] + e[1] + e[1] + e[1] + e[1];
    case 1:
      return e[0] + e[0] + e[0] + e[0] + e[0] + e[0];
    case 0:
      return "";
    default:
      return e.slice(0, 6);
  }
}
class Zu {
  /**
   * constructor
   *
   * @param {number} r value of Red channel
   * @param {number} g value of Green channel
   * @param {number} b value of Blue channel
   *
   */
  constructor(t, r, i) {
    this.r = t, this.g = r, this.b = i;
  }
  hex() {
    return "#" + to(this.r) + to(this.g) + to(this.b);
  }
}
function io(e, t) {
  return e + Math.random() * (t - e);
}
function Y0(e, t) {
  return new Zu(
    io(e, t),
    io(e, t),
    io(e, t)
  );
}
class X0 {
  /**
   * constructor
   *
   * @param {RGB} color value of Red channel
   *
   */
  constructor(t) {
    this.color = t;
  }
  hex() {
    return this.color.hex();
  }
  forget() {
  }
}
class J0 {
  /**
   * constructor
   *
   * @param {RGB} color value of Red channel
   * @param {Colors} returner the color manager
   *
   */
  constructor(t, r) {
    this.color = t, this.returner = r;
  }
  hex() {
    return this.color.hex();
  }
  forget() {
    this.returner.forget(this);
  }
}
const Z0 = 17, Q0 = 34;
class eg {
  /**
   * constructor
   */
  constructor() {
    this.assignedColors = {};
  }
  /**
   * Dispenses one color
   *
   * @returns {DispensedColor} Color code
   *
   */
  dispense() {
    let r = 0;
    for (; ; ) {
      let i = Y0(Z0, Q0), s = i.hex();
      if (!(this.assignedColors[s] && (r++, r < 10)))
        return this.assignedColors[s] = !0, new J0(i, this);
    }
  }
  /**
   * Forget the specified color so it can be dispensed again
   *
   * @param {RGB} color value of Red channel
   *
   */
  forget(t) {
    delete this.assignedColors[t.hex()];
  }
  /**
   * Dispense random color or creates one out of given customColorHex
   *
   * @param {string} customColorHex custom RGB color hex
   *
   * @returns {DispensedColor|Color} Color code
   *
   */
  get(t) {
    return t = G0(t), t.length <= 0 ? this.dispense() : new X0(
      new Zu(
        ro(t[0] + t[1]),
        ro(t[2] + t[3]),
        ro(t[4] + t[5])
      )
    );
  }
}
let tg = class {
  constructor(t, r) {
    this.background = r, this.charset = t.charset, this.charsetDecoder = (s) => Zr.decode(s, this.charset), this.charsetEncoder = (s) => Zr.encode(s, this.charset), this.enable = !1, this.sender = t.send, this.closer = t.close, this.resizer = t.resize, this.subs = new er();
    let i = this;
    t.events.place("stdout", async (s) => {
      try {
        i.subs.resolve(i.charsetDecoder(await kt(s)));
      } catch {
      }
    }), t.events.place("stderr", async (s) => {
      try {
        i.subs.resolve(i.charsetDecoder(await kt(s)));
      } catch {
      }
    }), t.events.place("completed", () => {
      i.closed = !0, i.background.forget(), i.subs.reject("Remote connection has been terminated");
    });
  }
  echo() {
    return !1;
  }
  resize(t) {
    this.closed || this.resizer(t.rows, t.cols);
  }
  enabled() {
    this.enable = !0;
  }
  disabled() {
    this.enable = !1;
  }
  retap(t) {
  }
  receive() {
    return this.subs.subscribe();
  }
  send(t) {
    if (!this.closed)
      return this.sender(this.charsetEncoder(t));
  }
  sendBinary(t) {
    if (!this.closed)
      return this.sender(Nu(t));
  }
  color() {
    return this.background.hex();
  }
  close() {
    if (this.closer === null)
      return;
    let t = this.closer;
    return this.closer = null, t();
  }
};
class rg {
  /**
   * constructor
   *
   * @param {color.Colors} c
   */
  constructor(t) {
    this.colors = t;
  }
  type() {
    return "SSH";
  }
  ui() {
    return "Console";
  }
  build(t) {
    return new tg(t, this.colors.get(t.tabColor));
  }
}
const so = 240, ig = 249, no = 250, Vt = 251, sr = 252, Gt = 253, Sr = 254, yt = 255, sg = 1, ng = 3, oo = 24, Bi = 31, og = 0, ag = 1, lg = new Uint8Array([
  og,
  88,
  84,
  69,
  82,
  77
]);
class hg {
  constructor(t, r, i) {
    this.sender = t, this.flusher = r, this.callbacks = i, this.reader = new Eo(() => {
    }), this.options = {
      echoEnabled: !1,
      suppressGoAhead: !1,
      nawsAccpeted: !1
    }, this.current = 0;
  }
  sendNego(t, r) {
    return this.sender(new Uint8Array([yt, t, r]));
  }
  sendDeny(t, r) {
    switch (t) {
      case Gt:
        return this.sendNego(sr, r);
      case sr:
        return this.sendNego(Sr, r);
    }
  }
  sendWillSubNego(t, r, i) {
    let s = new Uint8Array(6 + r.length + 2);
    return s.set([yt, t, i, yt, no, i], 0), s.set(r, 6), s.set([yt, so], r.length + 6), this.sender(s);
  }
  sendSubNego(t, r) {
    let i = new Uint8Array(3 + t.length + 2);
    return i.set([yt, no, r], 0), i.set(t, 3), i.set([yt, so], t.length + 3), this.sender(i);
  }
  async handleTermTypeSubNego(t) {
    if ((await It(t))[0] !== ag)
      return null;
    let i = this;
    return () => {
      i.sendSubNego(lg, oo);
    };
  }
  async handleSubNego(t) {
    let r = null;
    for (; ; ) {
      switch ((await It(t))[0]) {
        case oo:
          r = await this.handleTermTypeSubNego(t);
          continue;
        case yt:
          break;
        default:
          continue;
      }
      if ((await It(t))[0] === so) {
        r !== null && r();
        return;
      }
    }
  }
  handleOption(t, r, i, s) {
    switch (t) {
      case Vt:
        i || this.sendNego(Gt, r), s(!0, Vt);
        return;
      case sr:
        i && this.sendNego(Sr, r), s(!1, sr);
        return;
      case Gt:
        i || this.sendNego(Vt, r), s(!0, Gt);
        return;
      case Sr:
        i && this.sendNego(sr, r), s(!1, Sr);
        return;
    }
  }
  async handleCmd(t) {
    let r = await It(t);
    switch (r[0]) {
      case Vt:
      case sr:
      case Gt:
      case Sr:
        break;
      case yt:
        this.flusher(r);
        return;
      case ig:
        return;
      case no:
        await this.handleSubNego(t);
        return;
      default:
        throw new oe("Unknown command");
    }
    let i = await It(t);
    switch (i[0]) {
      case sg:
        return this.handleOption(
          r[0],
          i[0],
          this.options.echoEnabled,
          (s, n) => {
            switch (this.options.echoEnabled = s, n) {
              case Vt:
              case Sr:
                this.callbacks.setEcho(!1);
                break;
              case sr:
              case Gt:
                this.callbacks.setEcho(!0);
                break;
            }
          }
        );
      case ng:
        return this.handleOption(
          r[0],
          i[0],
          this.options.suppressGoAhead,
          (s, n) => {
            this.options.suppressGoAhead = s;
          }
        );
      case Bi:
        if (r[0] !== Gt) {
          this.sendDeny(r[0], i[0]);
          return;
        }
        {
          let s = this.callbacks.getWindowDim(), n = new DataView(new ArrayBuffer(4));
          n.setUint16(0, s.cols), n.setUint16(2, s.rows);
          let o = new Uint8Array(n.buffer);
          if (this.options.nawsAccpeted) {
            this.sendSubNego(o, Bi);
            return;
          }
          this.options.nawsAccpeted = !0, this.sendWillSubNego(Vt, o, Bi);
        }
        return;
      case oo:
        if (r[0] !== Gt) {
          this.sendDeny(r[0], i[0]);
          return;
        }
        this.sendNego(Vt, i[0]);
        return;
    }
    this.sendDeny(r[0], i[0]);
  }
  requestWindowResize() {
    this.options.nawsAccpeted = !0, this.sendNego(Vt, Bi);
  }
  async run() {
    try {
      for (; ; ) {
        let t = await Vd(this.reader, yt);
        if (!t.found) {
          this.flusher(t.data);
          continue;
        }
        t.data.length > 1 && this.flusher(t.data.slice(0, t.data.length - 1)), await this.handleCmd(this.reader);
      }
    } catch {
    }
  }
  feed(t, r) {
    this.reader.feed(t, r);
  }
  close() {
    this.reader.close();
  }
}
class cg {
  constructor(t, r) {
    this.background = r, this.charset = t.charset, this.charsetDecoder = (n) => Zr.decode(n, this.charset), this.charsetEncoder = (n) => Zr.encode(n, this.charset), this.sender = t.send, this.closer = t.close, this.closed = !1, this.localEchoEnabled = !0, this.subs = new er(), this.enable = !1, this.windowDim = {
      cols: 65535,
      rows: 65535
    };
    let i = this;
    this.parser = new hg(
      this.sender,
      (n) => {
        i.subs.resolve(this.charsetDecoder(n));
      },
      {
        setEcho(n) {
          i.localEchoEnabled = n;
        },
        getWindowDim() {
          return i.windowDim;
        }
      }
    );
    let s = this.parser.run();
    t.events.place("inband", (n) => new Promise((o, a) => {
      i.parser.feed(n, () => {
        o(!0);
      });
    })), t.events.place("completed", async () => {
      i.parser.close(), i.closed = !0, i.background.forget(), await s, i.subs.reject("Remote connection has been terminated");
    });
  }
  echo() {
    return this.localEchoEnabled;
  }
  resize(t) {
    this.closed || (this.windowDim.cols = t.cols, this.windowDim.rows = t.rows, this.parser.requestWindowResize());
  }
  enabled() {
    this.enable = !0;
  }
  disabled() {
    this.enable = !1;
  }
  retap(t) {
  }
  receive() {
    return this.subs.subscribe();
  }
  searchNextIAC(t, r) {
    for (let i = t; i < r.length; i++)
      if (r[i] === yt)
        return i;
    return -1;
  }
  sendSeg(t) {
    let r = 0;
    for (; r < t.length; ) {
      const i = this.searchNextIAC(r, t);
      if (i < 0) {
        this.sender(t.slice(r, t.length));
        return;
      }
      this.sender(t.slice(r, i + 1)), this.sender(t.slice(i, i + 1)), r = i + 1;
    }
  }
  send(t) {
    this.closed || this.sendSeg(this.charsetEncoder(t));
  }
  sendBinary(t) {
    if (!this.closed)
      return this.sendSeg(Nu(t));
  }
  color() {
    return this.background.hex();
  }
  close() {
    if (this.closer === null)
      return;
    let t = this.closer;
    return this.closer = null, t();
  }
}
class ug {
  /**
   * constructor
   *
   * @param {color.Colors} c
   */
  constructor(t) {
    this.colors = t;
  }
  type() {
    return "Telnet";
  }
  ui() {
    return "Console";
  }
  build(t) {
    return new cg(t, this.colors.get(t.tabColor));
  }
}
const Ao = "/sshwifty/socket", fg = Ao + "/verify", dg = 100 * 1e3;
function pg() {
  return Number(
    Math.trunc((/* @__PURE__ */ new Date()).getTime() / dg)
  ).toString();
}
async function _g(e) {
  return new Uint8Array(
    await au(
      nl(e),
      nl(pg())
    )
  ).slice(0, 16);
}
async function gg(e) {
  const t = new TextEncoder(), r = Number(Math.trunc((/* @__PURE__ */ new Date()).getTime() / 1e5)), i = e.length <= 0 ? "DEFAULT VERIFY KEY" : e;
  return new Uint8Array(
    await au(t.encode(i), t.encode(String(r)))
  ).slice(0, 32);
}
async function Do(e, t, r) {
  let i = null;
  t && r && (i = await gg(t));
  const s = i ? btoa(String.fromCharCode.apply(null, i)) : "", n = await lp(e + fg, { "X-Key": s });
  return {
    status: n.status,
    mixerKey: n.getResponseHeader("X-Key") || "",
    timeout: parseFloat(n.getResponseHeader("X-Timeout") || "120"),
    heartbeat: parseFloat(n.getResponseHeader("X-Heartbeat") || "15"),
    data: n.responseText
  };
}
function vg(e) {
  const t = e.replace(/\/$/, ""), r = t.startsWith("https") ? "wss" : "ws";
  return {
    webSocket: t.replace(/^https?/, r) + Ao,
    keepAlive: t + Ao
  };
}
function mg(e, t, r, i) {
  const s = vg(e), n = {
    async fetch() {
      const o = await Do(e, t, !!t);
      if (o.status !== 200)
        throw new Error("Auth refresh failed: status " + o.status);
      const a = atob(o.mixerKey), h = t ? a + "+" + t : a + "+";
      return await _g(h);
    }
  };
  return new up(s, n, r * 1e3, i * 1e3);
}
class yg {
  constructor() {
    this.sessions = /* @__PURE__ */ new Map();
  }
  createSession(t, r) {
    this.sessions.set(t, {
      state: "idle",
      statusMsg: "Initializing...",
      errorMsg: "",
      config: r,
      socketInstance: null,
      sshControl: null,
      destroyed: !1,
      dataCallbacks: [],
      binaryCallbacks: [],
      resizeCallbacks: [],
      stateChangeCallbacks: []
    });
  }
  getSession(t) {
    return this.sessions.get(t) || null;
  }
  getSessionState(t) {
    const r = this.sessions.get(t);
    return r ? r.state : "idle";
  }
  getSessionStatus(t) {
    const r = this.sessions.get(t);
    return r ? r.statusMsg : "";
  }
  getSessionError(t) {
    const r = this.sessions.get(t);
    return r ? r.errorMsg : "";
  }
  registerStateChangeCallback(t, r) {
    const i = this.sessions.get(t);
    i && i.stateChangeCallbacks.push(r);
  }
  updateSessionState(t, r) {
    const i = this.sessions.get(t);
    i && (i.state = r, i.stateChangeCallbacks.forEach((s) => s()));
  }
  updateSessionStatus(t, r) {
    const i = this.sessions.get(t);
    i && (i.statusMsg = r, i.stateChangeCallbacks.forEach((s) => s()));
  }
  updateSessionError(t, r) {
    const i = this.sessions.get(t);
    i && (i.errorMsg = r, i.stateChangeCallbacks.forEach((s) => s()));
  }
  async connect(t) {
    const r = this.sessions.get(t);
    if (!r)
      throw new Error("Session not found: " + t);
    if (!r.destroyed) {
      this.updateSessionState(t, "connecting"), this.updateSessionStatus(t, "Authenticating..."), this.updateSessionError(t, "");
      try {
        const { config: i } = r, { backendUrl: s, sharedKey: n } = i;
        let o = await Do(s || "", "", !1);
        if (o.status === 403) {
          if (!n)
            throw new Error(
              "Backend requires SharedKey (web access password) but it was not provided"
            );
          if (o = await Do(s || "", n, !0), o.status !== 200)
            throw new Error(
              "Authentication failed (status " + o.status + ")"
            );
        } else if (o.status !== 200)
          throw new Error("Backend returned status " + o.status);
        if (r.destroyed) return;
        this.updateSessionStatus(t, "Connecting to backend...");
        const a = mg(
          s || "",
          n || "",
          o.timeout,
          o.heartbeat
        );
        r.socketInstance = a;
        const h = {
          connecting: () => {
            this.updateSessionStatus(t, "Opening WebSocket...");
          },
          connected: () => {
            this.updateSessionStatus(
              t,
              "WebSocket connected, requesting SSH stream..."
            );
          },
          traffic: () => {
          },
          echo: () => {
          },
          close: (S) => {
            !r.destroyed && r.state === "connected" && (this.updateSessionState(t, "error"), this.updateSessionError(
              t,
              "Connection closed" + (S ? ": " + S : "")
            ));
          },
          failed: (S) => {
            r.destroyed || (this.updateSessionState(t, "error"), this.updateSessionError(t, "Connection failed: " + S));
          }
        }, l = await a.get(h);
        if (r.destroyed) return;
        this.updateSessionStatus(t, "Starting SSH session...");
        const c = new eg(), u = new d0([
          new ug(c),
          new rg(c)
        ]), p = new f0([new K0(), new N0()]), _ = new _0([], () => {
        }, 0), m = p.select(1), g = i.authMethod === "Password" ? i.password : i.authMethod === "Private Key" ? i.privateKey : "", w = m.execute(
          l,
          u,
          _,
          {
            user: i.username,
            host: i.host,
            authentication: i.authMethod,
            charset: i.encoding,
            tabColor: "",
            fingerprint: ""
          },
          { credential: g },
          [],
          () => {
          }
        );
        let y = null;
        for (; ; ) {
          if (r.destroyed) {
            w.close();
            return;
          }
          const S = await w.next(), v = S.type(), k = S.data();
          if (v === Da) {
            this.updateSessionStatus(t, k.title() + "...");
            continue;
          }
          if (v === Aa) {
            const R = k.inputs();
            if (R.some(
              (Z) => Z.name === "Fingerprint"
            ))
              if (i.acceptFingerprint) {
                this.updateSessionStatus(
                  t,
                  "Accepting server fingerprint..."
                ), k.submit({});
                continue;
              } else {
                const Z = R.find((K) => K.name === "Fingerprint"), ie = Z ? Z.value : "";
                throw k.cancel(), new Error(
                  "Server fingerprint not accepted (auto-accept disabled): " + ie
                );
              }
            const N = R.some((Z) => Z.name === "Password"), W = R.some((Z) => Z.name === "Private Key");
            if (N && i.password) {
              k.submit({ Password: i.password });
              continue;
            }
            if (W && i.privateKey) {
              k.submit({ "Private Key": i.privateKey });
              continue;
            }
            throw k.cancel(), new Error("Unexpected prompt from server: " + k.title());
          }
          if (v === ds) {
            if (!k.success())
              throw new Error(k.error() + ": " + k.message());
            y = k.data();
            break;
          }
        }
        if (r.destroyed || !y) return;
        const E = y.control;
        r.sshControl = E, this.updateSessionState(t, "connected"), (async () => {
          try {
            for (; !r.destroyed; ) {
              const S = await E.receive();
              r.dataCallbacks.forEach((v) => v(S));
            }
          } catch (S) {
            r.destroyed || (this.updateSessionState(t, "error"), this.updateSessionError(t, "Connection lost: " + S));
          }
        })();
      } catch (i) {
        r.destroyed || (this.updateSessionState(t, "error"), this.updateSessionError(t, String(i)));
      }
    }
  }
  async disconnect(t) {
    const r = this.sessions.get(t);
    if (r) {
      if (r.sshControl)
        try {
          await r.sshControl.close();
        } catch {
        }
      r.sshControl = null, this.updateSessionState(t, "idle");
    }
  }
  sendData(t, r) {
    const i = this.sessions.get(t);
    i != null && i.sshControl && !i.destroyed && i.sshControl.send(r);
  }
  sendBinary(t, r) {
    const i = this.sessions.get(t);
    i != null && i.sshControl && !i.destroyed && i.sshControl.sendBinary(r);
  }
  resize(t, r, i) {
    const s = this.sessions.get(t);
    s != null && s.sshControl && !s.destroyed && r && i && s.sshControl.resize({ rows: r, cols: i });
  }
  registerDataCallback(t, r) {
    const i = this.sessions.get(t);
    i && i.dataCallbacks.push(r);
  }
  registerBinaryCallback(t, r) {
    const i = this.sessions.get(t);
    i && i.binaryCallbacks.push(r);
  }
  registerResizeCallback(t, r) {
    const i = this.sessions.get(t);
    i && i.resizeCallbacks.push(r);
  }
  destroySession(t) {
    const r = this.sessions.get(t);
    r && (r.destroyed = !0, this.disconnect(t), this.sessions.delete(t));
  }
}
/**
 * Copyright (c) 2014-2024 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * @license MIT
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 */
var Qu = Object.defineProperty, bg = Object.getOwnPropertyDescriptor, wg = (e, t) => {
  for (var r in t) Qu(e, r, { get: t[r], enumerable: !0 });
}, Ae = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? bg(t, r) : t, n = e.length - 1, o; n >= 0; n--) (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && Qu(t, r, s), s;
}, re = (e, t) => (r, i) => t(r, i, e), Qh = "Terminal input", To = { get: () => Qh, set: (e) => Qh = e }, ec = "Too much output to announce, navigate to rows manually to read", Lo = { get: () => ec, set: (e) => ec = e };
function Sg(e) {
  return e.replace(/\r?\n/g, "\r");
}
function Cg(e, t) {
  return t ? "\x1B[200~" + e + "\x1B[201~" : e;
}
function Eg(e, t) {
  e.clipboardData && e.clipboardData.setData("text/plain", t.selectionText), e.preventDefault();
}
function xg(e, t, r, i) {
  if (e.stopPropagation(), e.clipboardData) {
    let s = e.clipboardData.getData("text/plain");
    ef(s, t, r, i);
  }
}
function ef(e, t, r, i) {
  e = Sg(e), e = Cg(e, r.decPrivateModes.bracketedPasteMode && i.rawOptions.ignoreBracketedPasteMode !== !0), r.triggerDataEvent(e, !0), t.value = "";
}
function tf(e, t, r) {
  let i = r.getBoundingClientRect(), s = e.clientX - i.left - 10, n = e.clientY - i.top - 10;
  t.style.width = "20px", t.style.height = "20px", t.style.left = `${s}px`, t.style.top = `${n}px`, t.style.zIndex = "1000", t.focus();
}
function tc(e, t, r, i, s) {
  tf(e, t, r), s && i.rightClickSelect(e), t.value = i.selectionText, t.select();
}
function Zt(e) {
  return e > 65535 ? (e -= 65536, String.fromCharCode((e >> 10) + 55296) + String.fromCharCode(e % 1024 + 56320)) : String.fromCharCode(e);
}
function ps(e, t = 0, r = e.length) {
  let i = "";
  for (let s = t; s < r; ++s) {
    let n = e[s];
    n > 65535 ? (n -= 65536, i += String.fromCharCode((n >> 10) + 55296) + String.fromCharCode(n % 1024 + 56320)) : i += String.fromCharCode(n);
  }
  return i;
}
var kg = class {
  constructor() {
    this._interim = 0;
  }
  clear() {
    this._interim = 0;
  }
  decode(e, t) {
    let r = e.length;
    if (!r) return 0;
    let i = 0, s = 0;
    if (this._interim) {
      let n = e.charCodeAt(s++);
      56320 <= n && n <= 57343 ? t[i++] = (this._interim - 55296) * 1024 + n - 56320 + 65536 : (t[i++] = this._interim, t[i++] = n), this._interim = 0;
    }
    for (let n = s; n < r; ++n) {
      let o = e.charCodeAt(n);
      if (55296 <= o && o <= 56319) {
        if (++n >= r) return this._interim = o, i;
        let a = e.charCodeAt(n);
        56320 <= a && a <= 57343 ? t[i++] = (o - 55296) * 1024 + a - 56320 + 65536 : (t[i++] = o, t[i++] = a);
        continue;
      }
      o !== 65279 && (t[i++] = o);
    }
    return i;
  }
}, Bg = class {
  constructor() {
    this.interim = new Uint8Array(3);
  }
  clear() {
    this.interim.fill(0);
  }
  decode(e, t) {
    let r = e.length;
    if (!r) return 0;
    let i = 0, s, n, o, a, h = 0, l = 0;
    if (this.interim[0]) {
      let p = !1, _ = this.interim[0];
      _ &= (_ & 224) === 192 ? 31 : (_ & 240) === 224 ? 15 : 7;
      let m = 0, g;
      for (; (g = this.interim[++m] & 63) && m < 4; ) _ <<= 6, _ |= g;
      let w = (this.interim[0] & 224) === 192 ? 2 : (this.interim[0] & 240) === 224 ? 3 : 4, y = w - m;
      for (; l < y; ) {
        if (l >= r) return 0;
        if (g = e[l++], (g & 192) !== 128) {
          l--, p = !0;
          break;
        } else this.interim[m++] = g, _ <<= 6, _ |= g & 63;
      }
      p || (w === 2 ? _ < 128 ? l-- : t[i++] = _ : w === 3 ? _ < 2048 || _ >= 55296 && _ <= 57343 || _ === 65279 || (t[i++] = _) : _ < 65536 || _ > 1114111 || (t[i++] = _)), this.interim.fill(0);
    }
    let c = r - 4, u = l;
    for (; u < r; ) {
      for (; u < c && !((s = e[u]) & 128) && !((n = e[u + 1]) & 128) && !((o = e[u + 2]) & 128) && !((a = e[u + 3]) & 128); ) t[i++] = s, t[i++] = n, t[i++] = o, t[i++] = a, u += 4;
      if (s = e[u++], s < 128) t[i++] = s;
      else if ((s & 224) === 192) {
        if (u >= r) return this.interim[0] = s, i;
        if (n = e[u++], (n & 192) !== 128) {
          u--;
          continue;
        }
        if (h = (s & 31) << 6 | n & 63, h < 128) {
          u--;
          continue;
        }
        t[i++] = h;
      } else if ((s & 240) === 224) {
        if (u >= r) return this.interim[0] = s, i;
        if (n = e[u++], (n & 192) !== 128) {
          u--;
          continue;
        }
        if (u >= r) return this.interim[0] = s, this.interim[1] = n, i;
        if (o = e[u++], (o & 192) !== 128) {
          u--;
          continue;
        }
        if (h = (s & 15) << 12 | (n & 63) << 6 | o & 63, h < 2048 || h >= 55296 && h <= 57343 || h === 65279) continue;
        t[i++] = h;
      } else if ((s & 248) === 240) {
        if (u >= r) return this.interim[0] = s, i;
        if (n = e[u++], (n & 192) !== 128) {
          u--;
          continue;
        }
        if (u >= r) return this.interim[0] = s, this.interim[1] = n, i;
        if (o = e[u++], (o & 192) !== 128) {
          u--;
          continue;
        }
        if (u >= r) return this.interim[0] = s, this.interim[1] = n, this.interim[2] = o, i;
        if (a = e[u++], (a & 192) !== 128) {
          u--;
          continue;
        }
        if (h = (s & 7) << 18 | (n & 63) << 12 | (o & 63) << 6 | a & 63, h < 65536 || h > 1114111) continue;
        t[i++] = h;
      }
    }
    return i;
  }
}, rf = "", Qt = " ", oi = class sf {
  constructor() {
    this.fg = 0, this.bg = 0, this.extended = new rs();
  }
  static toColorRGB(t) {
    return [t >>> 16 & 255, t >>> 8 & 255, t & 255];
  }
  static fromColorRGB(t) {
    return (t[0] & 255) << 16 | (t[1] & 255) << 8 | t[2] & 255;
  }
  clone() {
    let t = new sf();
    return t.fg = this.fg, t.bg = this.bg, t.extended = this.extended.clone(), t;
  }
  isInverse() {
    return this.fg & 67108864;
  }
  isBold() {
    return this.fg & 134217728;
  }
  isUnderline() {
    return this.hasExtendedAttrs() && this.extended.underlineStyle !== 0 ? 1 : this.fg & 268435456;
  }
  isBlink() {
    return this.fg & 536870912;
  }
  isInvisible() {
    return this.fg & 1073741824;
  }
  isItalic() {
    return this.bg & 67108864;
  }
  isDim() {
    return this.bg & 134217728;
  }
  isStrikethrough() {
    return this.fg & 2147483648;
  }
  isProtected() {
    return this.bg & 536870912;
  }
  isOverline() {
    return this.bg & 1073741824;
  }
  getFgColorMode() {
    return this.fg & 50331648;
  }
  getBgColorMode() {
    return this.bg & 50331648;
  }
  isFgRGB() {
    return (this.fg & 50331648) === 50331648;
  }
  isBgRGB() {
    return (this.bg & 50331648) === 50331648;
  }
  isFgPalette() {
    return (this.fg & 50331648) === 16777216 || (this.fg & 50331648) === 33554432;
  }
  isBgPalette() {
    return (this.bg & 50331648) === 16777216 || (this.bg & 50331648) === 33554432;
  }
  isFgDefault() {
    return (this.fg & 50331648) === 0;
  }
  isBgDefault() {
    return (this.bg & 50331648) === 0;
  }
  isAttributeDefault() {
    return this.fg === 0 && this.bg === 0;
  }
  getFgColor() {
    switch (this.fg & 50331648) {
      case 16777216:
      case 33554432:
        return this.fg & 255;
      case 50331648:
        return this.fg & 16777215;
      default:
        return -1;
    }
  }
  getBgColor() {
    switch (this.bg & 50331648) {
      case 16777216:
      case 33554432:
        return this.bg & 255;
      case 50331648:
        return this.bg & 16777215;
      default:
        return -1;
    }
  }
  hasExtendedAttrs() {
    return this.bg & 268435456;
  }
  updateExtended() {
    this.extended.isEmpty() ? this.bg &= -268435457 : this.bg |= 268435456;
  }
  getUnderlineColor() {
    if (this.bg & 268435456 && ~this.extended.underlineColor) switch (this.extended.underlineColor & 50331648) {
      case 16777216:
      case 33554432:
        return this.extended.underlineColor & 255;
      case 50331648:
        return this.extended.underlineColor & 16777215;
      default:
        return this.getFgColor();
    }
    return this.getFgColor();
  }
  getUnderlineColorMode() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? this.extended.underlineColor & 50331648 : this.getFgColorMode();
  }
  isUnderlineColorRGB() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? (this.extended.underlineColor & 50331648) === 50331648 : this.isFgRGB();
  }
  isUnderlineColorPalette() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? (this.extended.underlineColor & 50331648) === 16777216 || (this.extended.underlineColor & 50331648) === 33554432 : this.isFgPalette();
  }
  isUnderlineColorDefault() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? (this.extended.underlineColor & 50331648) === 0 : this.isFgDefault();
  }
  getUnderlineStyle() {
    return this.fg & 268435456 ? this.bg & 268435456 ? this.extended.underlineStyle : 1 : 0;
  }
  getUnderlineVariantOffset() {
    return this.extended.underlineVariantOffset;
  }
}, rs = class nf {
  constructor(t = 0, r = 0) {
    this._ext = 0, this._urlId = 0, this._ext = t, this._urlId = r;
  }
  get ext() {
    return this._urlId ? this._ext & -469762049 | this.underlineStyle << 26 : this._ext;
  }
  set ext(t) {
    this._ext = t;
  }
  get underlineStyle() {
    return this._urlId ? 5 : (this._ext & 469762048) >> 26;
  }
  set underlineStyle(t) {
    this._ext &= -469762049, this._ext |= t << 26 & 469762048;
  }
  get underlineColor() {
    return this._ext & 67108863;
  }
  set underlineColor(t) {
    this._ext &= -67108864, this._ext |= t & 67108863;
  }
  get urlId() {
    return this._urlId;
  }
  set urlId(t) {
    this._urlId = t;
  }
  get underlineVariantOffset() {
    let t = (this._ext & 3758096384) >> 29;
    return t < 0 ? t ^ 4294967288 : t;
  }
  set underlineVariantOffset(t) {
    this._ext &= 536870911, this._ext |= t << 29 & 3758096384;
  }
  clone() {
    return new nf(this._ext, this._urlId);
  }
  isEmpty() {
    return this.underlineStyle === 0 && this._urlId === 0;
  }
}, pt = class of extends oi {
  constructor() {
    super(...arguments), this.content = 0, this.fg = 0, this.bg = 0, this.extended = new rs(), this.combinedData = "";
  }
  static fromCharData(t) {
    let r = new of();
    return r.setFromCharData(t), r;
  }
  isCombined() {
    return this.content & 2097152;
  }
  getWidth() {
    return this.content >> 22;
  }
  getChars() {
    return this.content & 2097152 ? this.combinedData : this.content & 2097151 ? Zt(this.content & 2097151) : "";
  }
  getCode() {
    return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : this.content & 2097151;
  }
  setFromCharData(t) {
    this.fg = t[0], this.bg = 0;
    let r = !1;
    if (t[1].length > 2) r = !0;
    else if (t[1].length === 2) {
      let i = t[1].charCodeAt(0);
      if (55296 <= i && i <= 56319) {
        let s = t[1].charCodeAt(1);
        56320 <= s && s <= 57343 ? this.content = (i - 55296) * 1024 + s - 56320 + 65536 | t[2] << 22 : r = !0;
      } else r = !0;
    } else this.content = t[1].charCodeAt(0) | t[2] << 22;
    r && (this.combinedData = t[1], this.content = 2097152 | t[2] << 22);
  }
  getAsCharData() {
    return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
  }
}, rc = "di$target", Po = "di$dependencies", ao = /* @__PURE__ */ new Map();
function Rg(e) {
  return e[Po] || [];
}
function ze(e) {
  if (ao.has(e)) return ao.get(e);
  let t = function(r, i, s) {
    if (arguments.length !== 3) throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
    Ag(t, r, s);
  };
  return t._id = e, ao.set(e, t), t;
}
function Ag(e, t, r) {
  t[rc] === t ? t[Po].push({ id: e, index: r }) : (t[Po] = [{ id: e, index: r }], t[rc] = t);
}
var Ye = ze("BufferService"), af = ze("CoreMouseService"), vr = ze("CoreService"), Dg = ze("CharsetService"), Ma = ze("InstantiationService"), lf = ze("LogService"), Xe = ze("OptionsService"), hf = ze("OscLinkService"), Tg = ze("UnicodeService"), ai = ze("DecorationService"), Mo = class {
  constructor(e, t, r) {
    this._bufferService = e, this._optionsService = t, this._oscLinkService = r;
  }
  provideLinks(e, t) {
    var c;
    let r = this._bufferService.buffer.lines.get(e - 1);
    if (!r) {
      t(void 0);
      return;
    }
    let i = [], s = this._optionsService.rawOptions.linkHandler, n = new pt(), o = r.getTrimmedLength(), a = -1, h = -1, l = !1;
    for (let u = 0; u < o; u++) if (!(h === -1 && !r.hasContent(u))) {
      if (r.loadCell(u, n), n.hasExtendedAttrs() && n.extended.urlId) if (h === -1) {
        h = u, a = n.extended.urlId;
        continue;
      } else l = n.extended.urlId !== a;
      else h !== -1 && (l = !0);
      if (l || h !== -1 && u === o - 1) {
        let p = (c = this._oscLinkService.getLinkData(a)) == null ? void 0 : c.uri;
        if (p) {
          let _ = { start: { x: h + 1, y: e }, end: { x: u + (!l && u === o - 1 ? 1 : 0), y: e } }, m = !1;
          if (!(s != null && s.allowNonHttpProtocols)) try {
            let g = new URL(p);
            ["http:", "https:"].includes(g.protocol) || (m = !0);
          } catch {
            m = !0;
          }
          m || i.push({ text: p, range: _, activate: (g, w) => s ? s.activate(g, w, _) : Lg(g, w), hover: (g, w) => {
            var y;
            return (y = s == null ? void 0 : s.hover) == null ? void 0 : y.call(s, g, w, _);
          }, leave: (g, w) => {
            var y;
            return (y = s == null ? void 0 : s.leave) == null ? void 0 : y.call(s, g, w, _);
          } });
        }
        l = !1, n.hasExtendedAttrs() && n.extended.urlId ? (h = u, a = n.extended.urlId) : (h = -1, a = -1);
      }
    }
    t(i);
  }
};
Mo = Ae([re(0, Ye), re(1, Xe), re(2, hf)], Mo);
function Lg(e, t) {
  if (confirm(`Do you want to navigate to ${t}?

WARNING: This link could potentially be dangerous`)) {
    let r = window.open();
    if (r) {
      try {
        r.opener = null;
      } catch {
      }
      r.location.href = t;
    } else console.warn("Opening link blocked as opener could not be cleared");
  }
}
var _s = ze("CharSizeService"), zt = ze("CoreBrowserService"), Oa = ze("MouseService"), qt = ze("RenderService"), Pg = ze("SelectionService"), cf = ze("CharacterJoinerService"), Ir = ze("ThemeService"), uf = ze("LinkProviderService"), Mg = class {
  constructor() {
    this.listeners = [], this.unexpectedErrorHandler = function(e) {
      setTimeout(() => {
        throw e.stack ? ic.isErrorNoTelemetry(e) ? new ic(e.message + `

` + e.stack) : new Error(e.message + `

` + e.stack) : e;
      }, 0);
    };
  }
  addListener(e) {
    return this.listeners.push(e), () => {
      this._removeListener(e);
    };
  }
  emit(e) {
    this.listeners.forEach((t) => {
      t(e);
    });
  }
  _removeListener(e) {
    this.listeners.splice(this.listeners.indexOf(e), 1);
  }
  setUnexpectedErrorHandler(e) {
    this.unexpectedErrorHandler = e;
  }
  getUnexpectedErrorHandler() {
    return this.unexpectedErrorHandler;
  }
  onUnexpectedError(e) {
    this.unexpectedErrorHandler(e), this.emit(e);
  }
  onUnexpectedExternalError(e) {
    this.unexpectedErrorHandler(e);
  }
}, Og = new Mg();
function Wi(e) {
  Ig(e) || Og.onUnexpectedError(e);
}
var Oo = "Canceled";
function Ig(e) {
  return e instanceof Ng ? !0 : e instanceof Error && e.name === Oo && e.message === Oo;
}
var Ng = class extends Error {
  constructor() {
    super(Oo), this.name = this.message;
  }
};
function Fg(e) {
  return new Error(`Illegal argument: ${e}`);
}
var ic = class Io extends Error {
  constructor(t) {
    super(t), this.name = "CodeExpectedError";
  }
  static fromError(t) {
    if (t instanceof Io) return t;
    let r = new Io();
    return r.message = t.message, r.stack = t.stack, r;
  }
  static isErrorNoTelemetry(t) {
    return t.name === "CodeExpectedError";
  }
}, No = class ff extends Error {
  constructor(t) {
    super(t || "An unexpected bug occurred."), Object.setPrototypeOf(this, ff.prototype);
  }
};
function st(e, t = 0) {
  return e[e.length - (1 + t)];
}
var Ug;
((e) => {
  function t(n) {
    return n < 0;
  }
  e.isLessThan = t;
  function r(n) {
    return n <= 0;
  }
  e.isLessThanOrEqual = r;
  function i(n) {
    return n > 0;
  }
  e.isGreaterThan = i;
  function s(n) {
    return n === 0;
  }
  e.isNeitherLessOrGreaterThan = s, e.greaterThan = 1, e.lessThan = -1, e.neitherLessOrGreaterThan = 0;
})(Ug || (Ug = {}));
function Hg(e, t) {
  let r = this, i = !1, s;
  return function() {
    return i || (i = !0, t || (s = e.apply(r, arguments))), s;
  };
}
var df;
((e) => {
  function t(v) {
    return v && typeof v == "object" && typeof v[Symbol.iterator] == "function";
  }
  e.is = t;
  let r = Object.freeze([]);
  function i() {
    return r;
  }
  e.empty = i;
  function* s(v) {
    yield v;
  }
  e.single = s;
  function n(v) {
    return t(v) ? v : s(v);
  }
  e.wrap = n;
  function o(v) {
    return v || r;
  }
  e.from = o;
  function* a(v) {
    for (let k = v.length - 1; k >= 0; k--) yield v[k];
  }
  e.reverse = a;
  function h(v) {
    return !v || v[Symbol.iterator]().next().done === !0;
  }
  e.isEmpty = h;
  function l(v) {
    return v[Symbol.iterator]().next().value;
  }
  e.first = l;
  function c(v, k) {
    let R = 0;
    for (let O of v) if (k(O, R++)) return !0;
    return !1;
  }
  e.some = c;
  function u(v, k) {
    for (let R of v) if (k(R)) return R;
  }
  e.find = u;
  function* p(v, k) {
    for (let R of v) k(R) && (yield R);
  }
  e.filter = p;
  function* _(v, k) {
    let R = 0;
    for (let O of v) yield k(O, R++);
  }
  e.map = _;
  function* m(v, k) {
    let R = 0;
    for (let O of v) yield* k(O, R++);
  }
  e.flatMap = m;
  function* g(...v) {
    for (let k of v) yield* k;
  }
  e.concat = g;
  function w(v, k, R) {
    let O = R;
    for (let N of v) O = k(O, N);
    return O;
  }
  e.reduce = w;
  function* y(v, k, R = v.length) {
    for (k < 0 && (k += v.length), R < 0 ? R += v.length : R > v.length && (R = v.length); k < R; k++) yield v[k];
  }
  e.slice = y;
  function E(v, k = Number.POSITIVE_INFINITY) {
    let R = [];
    if (k === 0) return [R, v];
    let O = v[Symbol.iterator]();
    for (let N = 0; N < k; N++) {
      let W = O.next();
      if (W.done) return [R, e.empty()];
      R.push(W.value);
    }
    return [R, { [Symbol.iterator]() {
      return O;
    } }];
  }
  e.consume = E;
  async function S(v) {
    let k = [];
    for await (let R of v) k.push(R);
    return Promise.resolve(k);
  }
  e.asyncToArray = S;
})(df || (df = {}));
function pr(e) {
  if (df.is(e)) {
    let t = [];
    for (let r of e) if (r) try {
      r.dispose();
    } catch (i) {
      t.push(i);
    }
    if (t.length === 1) throw t[0];
    if (t.length > 1) throw new AggregateError(t, "Encountered errors while disposing of store");
    return Array.isArray(e) ? [] : e;
  } else if (e) return e.dispose(), e;
}
function Wg(...e) {
  return Se(() => pr(e));
}
function Se(e) {
  return { dispose: Hg(() => {
    e();
  }) };
}
var pf = class _f {
  constructor() {
    this._toDispose = /* @__PURE__ */ new Set(), this._isDisposed = !1;
  }
  dispose() {
    this._isDisposed || (this._isDisposed = !0, this.clear());
  }
  get isDisposed() {
    return this._isDisposed;
  }
  clear() {
    if (this._toDispose.size !== 0) try {
      pr(this._toDispose);
    } finally {
      this._toDispose.clear();
    }
  }
  add(t) {
    if (!t) return t;
    if (t === this) throw new Error("Cannot register a disposable on itself!");
    return this._isDisposed ? _f.DISABLE_DISPOSED_WARNING || console.warn(new Error("Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!").stack) : this._toDispose.add(t), t;
  }
  delete(t) {
    if (t) {
      if (t === this) throw new Error("Cannot dispose a disposable on itself!");
      this._toDispose.delete(t), t.dispose();
    }
  }
  deleteAndLeak(t) {
    t && this._toDispose.has(t) && (this._toDispose.delete(t), void 0);
  }
};
pf.DISABLE_DISPOSED_WARNING = !1;
var tr = pf, de = class {
  constructor() {
    this._store = new tr(), this._store;
  }
  dispose() {
    this._store.dispose();
  }
  _register(e) {
    if (e === this) throw new Error("Cannot register a disposable on itself!");
    return this._store.add(e);
  }
};
de.None = Object.freeze({ dispose() {
} });
var Pr = class {
  constructor() {
    this._isDisposed = !1;
  }
  get value() {
    return this._isDisposed ? void 0 : this._value;
  }
  set value(e) {
    var t;
    this._isDisposed || e === this._value || ((t = this._value) == null || t.dispose(), this._value = e);
  }
  clear() {
    this.value = void 0;
  }
  dispose() {
    var e;
    this._isDisposed = !0, (e = this._value) == null || e.dispose(), this._value = void 0;
  }
  clearAndLeak() {
    let e = this._value;
    return this._value = void 0, e;
  }
}, Ft = typeof window == "object" ? window : globalThis, Fo = class Uo {
  constructor(t) {
    this.element = t, this.next = Uo.Undefined, this.prev = Uo.Undefined;
  }
};
Fo.Undefined = new Fo(void 0);
var Ee = Fo, sc = class {
  constructor() {
    this._first = Ee.Undefined, this._last = Ee.Undefined, this._size = 0;
  }
  get size() {
    return this._size;
  }
  isEmpty() {
    return this._first === Ee.Undefined;
  }
  clear() {
    let e = this._first;
    for (; e !== Ee.Undefined; ) {
      let t = e.next;
      e.prev = Ee.Undefined, e.next = Ee.Undefined, e = t;
    }
    this._first = Ee.Undefined, this._last = Ee.Undefined, this._size = 0;
  }
  unshift(e) {
    return this._insert(e, !1);
  }
  push(e) {
    return this._insert(e, !0);
  }
  _insert(e, t) {
    let r = new Ee(e);
    if (this._first === Ee.Undefined) this._first = r, this._last = r;
    else if (t) {
      let s = this._last;
      this._last = r, r.prev = s, s.next = r;
    } else {
      let s = this._first;
      this._first = r, r.next = s, s.prev = r;
    }
    this._size += 1;
    let i = !1;
    return () => {
      i || (i = !0, this._remove(r));
    };
  }
  shift() {
    if (this._first !== Ee.Undefined) {
      let e = this._first.element;
      return this._remove(this._first), e;
    }
  }
  pop() {
    if (this._last !== Ee.Undefined) {
      let e = this._last.element;
      return this._remove(this._last), e;
    }
  }
  _remove(e) {
    if (e.prev !== Ee.Undefined && e.next !== Ee.Undefined) {
      let t = e.prev;
      t.next = e.next, e.next.prev = t;
    } else e.prev === Ee.Undefined && e.next === Ee.Undefined ? (this._first = Ee.Undefined, this._last = Ee.Undefined) : e.next === Ee.Undefined ? (this._last = this._last.prev, this._last.next = Ee.Undefined) : e.prev === Ee.Undefined && (this._first = this._first.next, this._first.prev = Ee.Undefined);
    this._size -= 1;
  }
  *[Symbol.iterator]() {
    let e = this._first;
    for (; e !== Ee.Undefined; ) yield e.element, e = e.next;
  }
}, zg = globalThis.performance && typeof globalThis.performance.now == "function", qg = class gf {
  static create(t) {
    return new gf(t);
  }
  constructor(t) {
    this._now = zg && t === !1 ? Date.now : globalThis.performance.now.bind(globalThis.performance), this._startTime = this._now(), this._stopTime = -1;
  }
  stop() {
    this._stopTime = this._now();
  }
  reset() {
    this._startTime = this._now(), this._stopTime = -1;
  }
  elapsed() {
    return this._stopTime !== -1 ? this._stopTime - this._startTime : this._now() - this._startTime;
  }
}, je;
((e) => {
  e.None = () => de.None;
  function t(K, H) {
    return u(K, () => {
    }, 0, void 0, !0, void 0, H);
  }
  e.defer = t;
  function r(K) {
    return (H, G = null, J) => {
      let ee = !1, se;
      return se = K((Y) => {
        if (!ee) return se ? se.dispose() : ee = !0, H.call(G, Y);
      }, null, J), ee && se.dispose(), se;
    };
  }
  e.once = r;
  function i(K, H, G) {
    return l((J, ee = null, se) => K((Y) => J.call(ee, H(Y)), null, se), G);
  }
  e.map = i;
  function s(K, H, G) {
    return l((J, ee = null, se) => K((Y) => {
      H(Y), J.call(ee, Y);
    }, null, se), G);
  }
  e.forEach = s;
  function n(K, H, G) {
    return l((J, ee = null, se) => K((Y) => H(Y) && J.call(ee, Y), null, se), G);
  }
  e.filter = n;
  function o(K) {
    return K;
  }
  e.signal = o;
  function a(...K) {
    return (H, G = null, J) => {
      let ee = Wg(...K.map((se) => se((Y) => H.call(G, Y))));
      return c(ee, J);
    };
  }
  e.any = a;
  function h(K, H, G, J) {
    let ee = G;
    return i(K, (se) => (ee = H(ee, se), ee), J);
  }
  e.reduce = h;
  function l(K, H) {
    let G, J = { onWillAddFirstListener() {
      G = K(ee.fire, ee);
    }, onDidRemoveLastListener() {
      G == null || G.dispose();
    } }, ee = new Q(J);
    return H == null || H.add(ee), ee.event;
  }
  function c(K, H) {
    return H instanceof Array ? H.push(K) : H && H.add(K), K;
  }
  function u(K, H, G = 100, J = !1, ee = !1, se, Y) {
    let ae, ve, Ce, L = 0, I, U = { leakWarningThreshold: se, onWillAddFirstListener() {
      ae = K((A) => {
        L++, ve = H(ve, A), J && !Ce && (te.fire(ve), ve = void 0), I = () => {
          let D = ve;
          ve = void 0, Ce = void 0, (!J || L > 1) && te.fire(D), L = 0;
        }, typeof G == "number" ? (clearTimeout(Ce), Ce = setTimeout(I, G)) : Ce === void 0 && (Ce = 0, queueMicrotask(I));
      });
    }, onWillRemoveListener() {
      ee && L > 0 && (I == null || I());
    }, onDidRemoveLastListener() {
      I = void 0, ae.dispose();
    } }, te = new Q(U);
    return Y == null || Y.add(te), te.event;
  }
  e.debounce = u;
  function p(K, H = 0, G) {
    return e.debounce(K, (J, ee) => J ? (J.push(ee), J) : [ee], H, void 0, !0, void 0, G);
  }
  e.accumulate = p;
  function _(K, H = (J, ee) => J === ee, G) {
    let J = !0, ee;
    return n(K, (se) => {
      let Y = J || !H(se, ee);
      return J = !1, ee = se, Y;
    }, G);
  }
  e.latch = _;
  function m(K, H, G) {
    return [e.filter(K, H, G), e.filter(K, (J) => !H(J), G)];
  }
  e.split = m;
  function g(K, H = !1, G = [], J) {
    let ee = G.slice(), se = K((ve) => {
      ee ? ee.push(ve) : ae.fire(ve);
    });
    J && J.add(se);
    let Y = () => {
      ee == null || ee.forEach((ve) => ae.fire(ve)), ee = null;
    }, ae = new Q({ onWillAddFirstListener() {
      se || (se = K((ve) => ae.fire(ve)), J && J.add(se));
    }, onDidAddFirstListener() {
      ee && (H ? setTimeout(Y) : Y());
    }, onDidRemoveLastListener() {
      se && se.dispose(), se = null;
    } });
    return J && J.add(ae), ae.event;
  }
  e.buffer = g;
  function w(K, H) {
    return (G, J, ee) => {
      let se = H(new E());
      return K(function(Y) {
        let ae = se.evaluate(Y);
        ae !== y && G.call(J, ae);
      }, void 0, ee);
    };
  }
  e.chain = w;
  let y = Symbol("HaltChainable");
  class E {
    constructor() {
      this.steps = [];
    }
    map(H) {
      return this.steps.push(H), this;
    }
    forEach(H) {
      return this.steps.push((G) => (H(G), G)), this;
    }
    filter(H) {
      return this.steps.push((G) => H(G) ? G : y), this;
    }
    reduce(H, G) {
      let J = G;
      return this.steps.push((ee) => (J = H(J, ee), J)), this;
    }
    latch(H = (G, J) => G === J) {
      let G = !0, J;
      return this.steps.push((ee) => {
        let se = G || !H(ee, J);
        return G = !1, J = ee, se ? ee : y;
      }), this;
    }
    evaluate(H) {
      for (let G of this.steps) if (H = G(H), H === y) break;
      return H;
    }
  }
  function S(K, H, G = (J) => J) {
    let J = (...ae) => Y.fire(G(...ae)), ee = () => K.on(H, J), se = () => K.removeListener(H, J), Y = new Q({ onWillAddFirstListener: ee, onDidRemoveLastListener: se });
    return Y.event;
  }
  e.fromNodeEventEmitter = S;
  function v(K, H, G = (J) => J) {
    let J = (...ae) => Y.fire(G(...ae)), ee = () => K.addEventListener(H, J), se = () => K.removeEventListener(H, J), Y = new Q({ onWillAddFirstListener: ee, onDidRemoveLastListener: se });
    return Y.event;
  }
  e.fromDOMEventEmitter = v;
  function k(K) {
    return new Promise((H) => r(K)(H));
  }
  e.toPromise = k;
  function R(K) {
    let H = new Q();
    return K.then((G) => {
      H.fire(G);
    }, () => {
      H.fire(void 0);
    }).finally(() => {
      H.dispose();
    }), H.event;
  }
  e.fromPromise = R;
  function O(K, H) {
    return K((G) => H.fire(G));
  }
  e.forward = O;
  function N(K, H, G) {
    return H(G), K((J) => H(J));
  }
  e.runAndSubscribe = N;
  class W {
    constructor(H, G) {
      this._observable = H, this._counter = 0, this._hasChanged = !1;
      let J = { onWillAddFirstListener: () => {
        H.addObserver(this);
      }, onDidRemoveLastListener: () => {
        H.removeObserver(this);
      } };
      this.emitter = new Q(J), G && G.add(this.emitter);
    }
    beginUpdate(H) {
      this._counter++;
    }
    handlePossibleChange(H) {
    }
    handleChange(H, G) {
      this._hasChanged = !0;
    }
    endUpdate(H) {
      this._counter--, this._counter === 0 && (this._observable.reportChanges(), this._hasChanged && (this._hasChanged = !1, this.emitter.fire(this._observable.get())));
    }
  }
  function Z(K, H) {
    return new W(K, H).emitter.event;
  }
  e.fromObservable = Z;
  function ie(K) {
    return (H, G, J) => {
      let ee = 0, se = !1, Y = { beginUpdate() {
        ee++;
      }, endUpdate() {
        ee--, ee === 0 && (K.reportChanges(), se && (se = !1, H.call(G)));
      }, handlePossibleChange() {
      }, handleChange() {
        se = !0;
      } };
      K.addObserver(Y), K.reportChanges();
      let ae = { dispose() {
        K.removeObserver(Y);
      } };
      return J instanceof tr ? J.add(ae) : Array.isArray(J) && J.push(ae), ae;
    };
  }
  e.fromObservableLight = ie;
})(je || (je = {}));
var Ho = class Wo {
  constructor(t) {
    this.listenerCount = 0, this.invocationCount = 0, this.elapsedOverall = 0, this.durations = [], this.name = `${t}_${Wo._idPool++}`, Wo.all.add(this);
  }
  start(t) {
    this._stopWatch = new qg(), this.listenerCount = t;
  }
  stop() {
    if (this._stopWatch) {
      let t = this._stopWatch.elapsed();
      this.durations.push(t), this.elapsedOverall += t, this.invocationCount += 1, this._stopWatch = void 0;
    }
  }
};
Ho.all = /* @__PURE__ */ new Set(), Ho._idPool = 0;
var jg = Ho, $g = -1, vf = class mf {
  constructor(t, r, i = (mf._idPool++).toString(16).padStart(3, "0")) {
    this._errorHandler = t, this.threshold = r, this.name = i, this._warnCountdown = 0;
  }
  dispose() {
    var t;
    (t = this._stacks) == null || t.clear();
  }
  check(t, r) {
    let i = this.threshold;
    if (i <= 0 || r < i) return;
    this._stacks || (this._stacks = /* @__PURE__ */ new Map());
    let s = this._stacks.get(t.value) || 0;
    if (this._stacks.set(t.value, s + 1), this._warnCountdown -= 1, this._warnCountdown <= 0) {
      this._warnCountdown = i * 0.5;
      let [n, o] = this.getMostFrequentStack(), a = `[${this.name}] potential listener LEAK detected, having ${r} listeners already. MOST frequent listener (${o}):`;
      console.warn(a), console.warn(n);
      let h = new Gg(a, n);
      this._errorHandler(h);
    }
    return () => {
      let n = this._stacks.get(t.value) || 0;
      this._stacks.set(t.value, n - 1);
    };
  }
  getMostFrequentStack() {
    if (!this._stacks) return;
    let t, r = 0;
    for (let [i, s] of this._stacks) (!t || r < s) && (t = [i, s], r = s);
    return t;
  }
};
vf._idPool = 1;
var Kg = vf, Vg = class yf {
  constructor(t) {
    this.value = t;
  }
  static create() {
    let t = new Error();
    return new yf(t.stack ?? "");
  }
  print() {
    console.warn(this.value.split(`
`).slice(2).join(`
`));
  }
}, Gg = class extends Error {
  constructor(e, t) {
    super(e), this.name = "ListenerLeakError", this.stack = t;
  }
}, Yg = class extends Error {
  constructor(e, t) {
    super(e), this.name = "ListenerRefusalError", this.stack = t;
  }
}, Xg = 0, lo = class {
  constructor(e) {
    this.value = e, this.id = Xg++;
  }
}, Jg = 2, Zg, Q = class {
  constructor(t) {
    var r, i, s, n;
    this._size = 0, this._options = t, this._leakageMon = (r = this._options) != null && r.leakWarningThreshold ? new Kg((t == null ? void 0 : t.onListenerError) ?? Wi, ((i = this._options) == null ? void 0 : i.leakWarningThreshold) ?? $g) : void 0, this._perfMon = (s = this._options) != null && s._profName ? new jg(this._options._profName) : void 0, this._deliveryQueue = (n = this._options) == null ? void 0 : n.deliveryQueue;
  }
  dispose() {
    var t, r, i, s;
    this._disposed || (this._disposed = !0, ((t = this._deliveryQueue) == null ? void 0 : t.current) === this && this._deliveryQueue.reset(), this._listeners && (this._listeners = void 0, this._size = 0), (i = (r = this._options) == null ? void 0 : r.onDidRemoveLastListener) == null || i.call(r), (s = this._leakageMon) == null || s.dispose());
  }
  get event() {
    return this._event ?? (this._event = (t, r, i) => {
      var a, h, l, c, u;
      if (this._leakageMon && this._size > this._leakageMon.threshold ** 2) {
        let p = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
        console.warn(p);
        let _ = this._leakageMon.getMostFrequentStack() ?? ["UNKNOWN stack", -1], m = new Yg(`${p}. HINT: Stack shows most frequent listener (${_[1]}-times)`, _[0]);
        return (((a = this._options) == null ? void 0 : a.onListenerError) || Wi)(m), de.None;
      }
      if (this._disposed) return de.None;
      r && (t = t.bind(r));
      let s = new lo(t), n;
      this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2) && (s.stack = Vg.create(), n = this._leakageMon.check(s.stack, this._size + 1)), this._listeners ? this._listeners instanceof lo ? (this._deliveryQueue ?? (this._deliveryQueue = new Qg()), this._listeners = [this._listeners, s]) : this._listeners.push(s) : ((l = (h = this._options) == null ? void 0 : h.onWillAddFirstListener) == null || l.call(h, this), this._listeners = s, (u = (c = this._options) == null ? void 0 : c.onDidAddFirstListener) == null || u.call(c, this)), this._size++;
      let o = Se(() => {
        n == null || n(), this._removeListener(s);
      });
      return i instanceof tr ? i.add(o) : Array.isArray(i) && i.push(o), o;
    }), this._event;
  }
  _removeListener(t) {
    var n, o, a, h;
    if ((o = (n = this._options) == null ? void 0 : n.onWillRemoveListener) == null || o.call(n, this), !this._listeners) return;
    if (this._size === 1) {
      this._listeners = void 0, (h = (a = this._options) == null ? void 0 : a.onDidRemoveLastListener) == null || h.call(a, this), this._size = 0;
      return;
    }
    let r = this._listeners, i = r.indexOf(t);
    if (i === -1) throw console.log("disposed?", this._disposed), console.log("size?", this._size), console.log("arr?", JSON.stringify(this._listeners)), new Error("Attempted to dispose unknown listener");
    this._size--, r[i] = void 0;
    let s = this._deliveryQueue.current === this;
    if (this._size * Jg <= r.length) {
      let l = 0;
      for (let c = 0; c < r.length; c++) r[c] ? r[l++] = r[c] : s && (this._deliveryQueue.end--, l < this._deliveryQueue.i && this._deliveryQueue.i--);
      r.length = l;
    }
  }
  _deliver(t, r) {
    var s;
    if (!t) return;
    let i = ((s = this._options) == null ? void 0 : s.onListenerError) || Wi;
    if (!i) {
      t.value(r);
      return;
    }
    try {
      t.value(r);
    } catch (n) {
      i(n);
    }
  }
  _deliverQueue(t) {
    let r = t.current._listeners;
    for (; t.i < t.end; ) this._deliver(r[t.i++], t.value);
    t.reset();
  }
  fire(t) {
    var r, i, s, n;
    if ((r = this._deliveryQueue) != null && r.current && (this._deliverQueue(this._deliveryQueue), (i = this._perfMon) == null || i.stop()), (s = this._perfMon) == null || s.start(this._size), this._listeners) if (this._listeners instanceof lo) this._deliver(this._listeners, t);
    else {
      let o = this._deliveryQueue;
      o.enqueue(this, t, this._listeners.length), this._deliverQueue(o);
    }
    (n = this._perfMon) == null || n.stop();
  }
  hasListeners() {
    return this._size > 0;
  }
}, Qg = class {
  constructor() {
    this.i = -1, this.end = 0;
  }
  enqueue(e, t, r) {
    this.i = 0, this.end = r, this.current = e, this.value = t;
  }
  reset() {
    this.i = this.end, this.current = void 0, this.value = void 0;
  }
}, zo = class {
  constructor() {
    this.mapWindowIdToZoomLevel = /* @__PURE__ */ new Map(), this._onDidChangeZoomLevel = new Q(), this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event, this.mapWindowIdToZoomFactor = /* @__PURE__ */ new Map(), this._onDidChangeFullscreen = new Q(), this.onDidChangeFullscreen = this._onDidChangeFullscreen.event, this.mapWindowIdToFullScreen = /* @__PURE__ */ new Map();
  }
  getZoomLevel(t) {
    return this.mapWindowIdToZoomLevel.get(this.getWindowId(t)) ?? 0;
  }
  setZoomLevel(t, r) {
    if (this.getZoomLevel(r) === t) return;
    let i = this.getWindowId(r);
    this.mapWindowIdToZoomLevel.set(i, t), this._onDidChangeZoomLevel.fire(i);
  }
  getZoomFactor(t) {
    return this.mapWindowIdToZoomFactor.get(this.getWindowId(t)) ?? 1;
  }
  setZoomFactor(t, r) {
    this.mapWindowIdToZoomFactor.set(this.getWindowId(r), t);
  }
  setFullscreen(t, r) {
    if (this.isFullscreen(r) === t) return;
    let i = this.getWindowId(r);
    this.mapWindowIdToFullScreen.set(i, t), this._onDidChangeFullscreen.fire(i);
  }
  isFullscreen(t) {
    return !!this.mapWindowIdToFullScreen.get(this.getWindowId(t));
  }
  getWindowId(t) {
    return t.vscodeWindowId;
  }
};
zo.INSTANCE = new zo();
var Ia = zo;
function ev(e, t, r) {
  typeof t == "string" && (t = e.matchMedia(t)), t.addEventListener("change", r);
}
Ia.INSTANCE.onDidChangeZoomLevel;
function tv(e) {
  return Ia.INSTANCE.getZoomFactor(e);
}
Ia.INSTANCE.onDidChangeFullscreen;
var Nr = typeof navigator == "object" ? navigator.userAgent : "", qo = Nr.indexOf("Firefox") >= 0, rv = Nr.indexOf("AppleWebKit") >= 0, Na = Nr.indexOf("Chrome") >= 0, iv = !Na && Nr.indexOf("Safari") >= 0;
Nr.indexOf("Electron/") >= 0;
Nr.indexOf("Android") >= 0;
var ho = !1;
if (typeof Ft.matchMedia == "function") {
  let e = Ft.matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)"), t = Ft.matchMedia("(display-mode: fullscreen)");
  ho = e.matches, ev(Ft, e, ({ matches: r }) => {
    ho && t.matches || (ho = r);
  });
}
var xr = "en", jo = !1, $o = !1, zi = !1, bf = !1, Ri, qi = xr, nc = xr, sv, gt, fr = globalThis, qe, Vc;
typeof fr.vscode < "u" && typeof fr.vscode.process < "u" ? qe = fr.vscode.process : typeof le < "u" && typeof ((Vc = le == null ? void 0 : le.versions) == null ? void 0 : Vc.node) == "string" && (qe = le);
var Gc, nv = typeof ((Gc = qe == null ? void 0 : qe.versions) == null ? void 0 : Gc.electron) == "string", ov = nv && (qe == null ? void 0 : qe.type) === "renderer", Yc;
if (typeof qe == "object") {
  jo = qe.platform === "win32", $o = qe.platform === "darwin", zi = qe.platform === "linux", zi && qe.env.SNAP && qe.env.SNAP_REVISION, qe.env.CI || qe.env.BUILD_ARTIFACTSTAGINGDIRECTORY, Ri = xr, qi = xr;
  let e = qe.env.VSCODE_NLS_CONFIG;
  if (e) try {
    let t = JSON.parse(e);
    Ri = t.userLocale, nc = t.osLocale, qi = t.resolvedLanguage || xr, sv = (Yc = t.languagePack) == null ? void 0 : Yc.translationsConfigFile;
  } catch {
  }
  bf = !0;
} else typeof navigator == "object" && !ov ? (gt = navigator.userAgent, jo = gt.indexOf("Windows") >= 0, $o = gt.indexOf("Macintosh") >= 0, (gt.indexOf("Macintosh") >= 0 || gt.indexOf("iPad") >= 0 || gt.indexOf("iPhone") >= 0) && navigator.maxTouchPoints && navigator.maxTouchPoints > 0, zi = gt.indexOf("Linux") >= 0, (gt == null ? void 0 : gt.indexOf("Mobi")) >= 0, qi = globalThis._VSCODE_NLS_LANGUAGE || xr, Ri = navigator.language.toLowerCase(), nc = Ri) : console.error("Unable to resolve platform.");
var wf = jo, Bt = $o, av = zi, oc = bf, Rt = gt, Yt = qi, lv;
((e) => {
  function t() {
    return Yt;
  }
  e.value = t;
  function r() {
    return Yt.length === 2 ? Yt === "en" : Yt.length >= 3 ? Yt[0] === "e" && Yt[1] === "n" && Yt[2] === "-" : !1;
  }
  e.isDefaultVariant = r;
  function i() {
    return Yt === "en";
  }
  e.isDefault = i;
})(lv || (lv = {}));
var hv = typeof fr.postMessage == "function" && !fr.importScripts;
(() => {
  if (hv) {
    let e = [];
    fr.addEventListener("message", (r) => {
      if (r.data && r.data.vscodeScheduleAsyncWork) for (let i = 0, s = e.length; i < s; i++) {
        let n = e[i];
        if (n.id === r.data.vscodeScheduleAsyncWork) {
          e.splice(i, 1), n.callback();
          return;
        }
      }
    });
    let t = 0;
    return (r) => {
      let i = ++t;
      e.push({ id: i, callback: r }), fr.postMessage({ vscodeScheduleAsyncWork: i }, "*");
    };
  }
  return (e) => setTimeout(e);
})();
var cv = !!(Rt && Rt.indexOf("Chrome") >= 0);
Rt && Rt.indexOf("Firefox") >= 0;
!cv && Rt && Rt.indexOf("Safari") >= 0;
Rt && Rt.indexOf("Edg/") >= 0;
Rt && Rt.indexOf("Android") >= 0;
var Cr = typeof navigator == "object" ? navigator : {};
oc || document.queryCommandSupported && document.queryCommandSupported("copy") || Cr && Cr.clipboard && Cr.clipboard.writeText, oc || Cr && Cr.clipboard && Cr.clipboard.readText;
var Fa = class {
  constructor() {
    this._keyCodeToStr = [], this._strToKeyCode = /* @__PURE__ */ Object.create(null);
  }
  define(e, t) {
    this._keyCodeToStr[e] = t, this._strToKeyCode[t.toLowerCase()] = e;
  }
  keyCodeToStr(e) {
    return this._keyCodeToStr[e];
  }
  strToKeyCode(e) {
    return this._strToKeyCode[e.toLowerCase()] || 0;
  }
}, co = new Fa(), ac = new Fa(), lc = new Fa(), uv = new Array(230), Sf;
((e) => {
  function t(a) {
    return co.keyCodeToStr(a);
  }
  e.toString = t;
  function r(a) {
    return co.strToKeyCode(a);
  }
  e.fromString = r;
  function i(a) {
    return ac.keyCodeToStr(a);
  }
  e.toUserSettingsUS = i;
  function s(a) {
    return lc.keyCodeToStr(a);
  }
  e.toUserSettingsGeneral = s;
  function n(a) {
    return ac.strToKeyCode(a) || lc.strToKeyCode(a);
  }
  e.fromUserSettings = n;
  function o(a) {
    if (a >= 98 && a <= 113) return null;
    switch (a) {
      case 16:
        return "Up";
      case 18:
        return "Down";
      case 15:
        return "Left";
      case 17:
        return "Right";
    }
    return co.keyCodeToStr(a);
  }
  e.toElectronAccelerator = o;
})(Sf || (Sf = {}));
var fv = class Cf {
  constructor(t, r, i, s, n) {
    this.ctrlKey = t, this.shiftKey = r, this.altKey = i, this.metaKey = s, this.keyCode = n;
  }
  equals(t) {
    return t instanceof Cf && this.ctrlKey === t.ctrlKey && this.shiftKey === t.shiftKey && this.altKey === t.altKey && this.metaKey === t.metaKey && this.keyCode === t.keyCode;
  }
  getHashCode() {
    let t = this.ctrlKey ? "1" : "0", r = this.shiftKey ? "1" : "0", i = this.altKey ? "1" : "0", s = this.metaKey ? "1" : "0";
    return `K${t}${r}${i}${s}${this.keyCode}`;
  }
  isModifierKey() {
    return this.keyCode === 0 || this.keyCode === 5 || this.keyCode === 57 || this.keyCode === 6 || this.keyCode === 4;
  }
  toKeybinding() {
    return new dv([this]);
  }
  isDuplicateModifierCase() {
    return this.ctrlKey && this.keyCode === 5 || this.shiftKey && this.keyCode === 4 || this.altKey && this.keyCode === 6 || this.metaKey && this.keyCode === 57;
  }
}, dv = class {
  constructor(e) {
    if (e.length === 0) throw Fg("chords");
    this.chords = e;
  }
  getHashCode() {
    let e = "";
    for (let t = 0, r = this.chords.length; t < r; t++) t !== 0 && (e += ";"), e += this.chords[t].getHashCode();
    return e;
  }
  equals(e) {
    if (e === null || this.chords.length !== e.chords.length) return !1;
    for (let t = 0; t < this.chords.length; t++) if (!this.chords[t].equals(e.chords[t])) return !1;
    return !0;
  }
};
function pv(e) {
  if (e.charCode) {
    let r = String.fromCharCode(e.charCode).toUpperCase();
    return Sf.fromString(r);
  }
  let t = e.keyCode;
  if (t === 3) return 7;
  if (qo) switch (t) {
    case 59:
      return 85;
    case 60:
      if (av) return 97;
      break;
    case 61:
      return 86;
    case 107:
      return 109;
    case 109:
      return 111;
    case 173:
      return 88;
    case 224:
      if (Bt) return 57;
      break;
  }
  else if (rv && (Bt && t === 93 || !Bt && t === 92))
    return 57;
  return uv[t] || 0;
}
var _v = Bt ? 256 : 2048, gv = 512, vv = 1024, mv = Bt ? 2048 : 256, hc = class {
  constructor(e) {
    var r;
    this._standardKeyboardEventBrand = !0;
    let t = e;
    this.browserEvent = t, this.target = t.target, this.ctrlKey = t.ctrlKey, this.shiftKey = t.shiftKey, this.altKey = t.altKey, this.metaKey = t.metaKey, this.altGraphKey = (r = t.getModifierState) == null ? void 0 : r.call(t, "AltGraph"), this.keyCode = pv(t), this.code = t.code, this.ctrlKey = this.ctrlKey || this.keyCode === 5, this.altKey = this.altKey || this.keyCode === 6, this.shiftKey = this.shiftKey || this.keyCode === 4, this.metaKey = this.metaKey || this.keyCode === 57, this._asKeybinding = this._computeKeybinding(), this._asKeyCodeChord = this._computeKeyCodeChord();
  }
  preventDefault() {
    this.browserEvent && this.browserEvent.preventDefault && this.browserEvent.preventDefault();
  }
  stopPropagation() {
    this.browserEvent && this.browserEvent.stopPropagation && this.browserEvent.stopPropagation();
  }
  toKeyCodeChord() {
    return this._asKeyCodeChord;
  }
  equals(e) {
    return this._asKeybinding === e;
  }
  _computeKeybinding() {
    let e = 0;
    this.keyCode !== 5 && this.keyCode !== 4 && this.keyCode !== 6 && this.keyCode !== 57 && (e = this.keyCode);
    let t = 0;
    return this.ctrlKey && (t |= _v), this.altKey && (t |= gv), this.shiftKey && (t |= vv), this.metaKey && (t |= mv), t |= e, t;
  }
  _computeKeyCodeChord() {
    let e = 0;
    return this.keyCode !== 5 && this.keyCode !== 4 && this.keyCode !== 6 && this.keyCode !== 57 && (e = this.keyCode), new fv(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, e);
  }
}, cc = /* @__PURE__ */ new WeakMap();
function yv(e) {
  if (!e.parent || e.parent === e) return null;
  try {
    let t = e.location, r = e.parent.location;
    if (t.origin !== "null" && r.origin !== "null" && t.origin !== r.origin) return null;
  } catch {
    return null;
  }
  return e.parent;
}
var bv = class {
  static getSameOriginWindowChain(e) {
    let t = cc.get(e);
    if (!t) {
      t = [], cc.set(e, t);
      let r = e, i;
      do
        i = yv(r), i ? t.push({ window: new WeakRef(r), iframeElement: r.frameElement || null }) : t.push({ window: new WeakRef(r), iframeElement: null }), r = i;
      while (r);
    }
    return t.slice(0);
  }
  static getPositionOfChildWindowRelativeToAncestorWindow(e, t) {
    if (!t || e === t) return { top: 0, left: 0 };
    let r = 0, i = 0, s = this.getSameOriginWindowChain(e);
    for (let n of s) {
      let o = n.window.deref();
      if (r += (o == null ? void 0 : o.scrollY) ?? 0, i += (o == null ? void 0 : o.scrollX) ?? 0, o === t || !n.iframeElement) break;
      let a = n.iframeElement.getBoundingClientRect();
      r += a.top, i += a.left;
    }
    return { top: r, left: i };
  }
}, Ai = class {
  constructor(e, t) {
    this.timestamp = Date.now(), this.browserEvent = t, this.leftButton = t.button === 0, this.middleButton = t.button === 1, this.rightButton = t.button === 2, this.buttons = t.buttons, this.target = t.target, this.detail = t.detail || 1, t.type === "dblclick" && (this.detail = 2), this.ctrlKey = t.ctrlKey, this.shiftKey = t.shiftKey, this.altKey = t.altKey, this.metaKey = t.metaKey, typeof t.pageX == "number" ? (this.posx = t.pageX, this.posy = t.pageY) : (this.posx = t.clientX + this.target.ownerDocument.body.scrollLeft + this.target.ownerDocument.documentElement.scrollLeft, this.posy = t.clientY + this.target.ownerDocument.body.scrollTop + this.target.ownerDocument.documentElement.scrollTop);
    let r = bv.getPositionOfChildWindowRelativeToAncestorWindow(e, t.view);
    this.posx -= r.left, this.posy -= r.top;
  }
  preventDefault() {
    this.browserEvent.preventDefault();
  }
  stopPropagation() {
    this.browserEvent.stopPropagation();
  }
}, uc = class {
  constructor(e, t = 0, r = 0) {
    var s;
    this.browserEvent = e || null, this.target = e ? e.target || e.targetNode || e.srcElement : null, this.deltaY = r, this.deltaX = t;
    let i = !1;
    if (Na) {
      let n = navigator.userAgent.match(/Chrome\/(\d+)/);
      i = (n ? parseInt(n[1]) : 123) <= 122;
    }
    if (e) {
      let n = e, o = e, a = ((s = e.view) == null ? void 0 : s.devicePixelRatio) || 1;
      if (typeof n.wheelDeltaY < "u") i ? this.deltaY = n.wheelDeltaY / (120 * a) : this.deltaY = n.wheelDeltaY / 120;
      else if (typeof o.VERTICAL_AXIS < "u" && o.axis === o.VERTICAL_AXIS) this.deltaY = -o.detail / 3;
      else if (e.type === "wheel") {
        let h = e;
        h.deltaMode === h.DOM_DELTA_LINE ? qo && !Bt ? this.deltaY = -e.deltaY / 3 : this.deltaY = -e.deltaY : this.deltaY = -e.deltaY / 40;
      }
      if (typeof n.wheelDeltaX < "u") iv && wf ? this.deltaX = -(n.wheelDeltaX / 120) : i ? this.deltaX = n.wheelDeltaX / (120 * a) : this.deltaX = n.wheelDeltaX / 120;
      else if (typeof o.HORIZONTAL_AXIS < "u" && o.axis === o.HORIZONTAL_AXIS) this.deltaX = -e.detail / 3;
      else if (e.type === "wheel") {
        let h = e;
        h.deltaMode === h.DOM_DELTA_LINE ? qo && !Bt ? this.deltaX = -e.deltaX / 3 : this.deltaX = -e.deltaX : this.deltaX = -e.deltaX / 40;
      }
      this.deltaY === 0 && this.deltaX === 0 && e.wheelDelta && (i ? this.deltaY = e.wheelDelta / (120 * a) : this.deltaY = e.wheelDelta / 120);
    }
  }
  preventDefault() {
    var e;
    (e = this.browserEvent) == null || e.preventDefault();
  }
  stopPropagation() {
    var e;
    (e = this.browserEvent) == null || e.stopPropagation();
  }
}, Ef = Object.freeze(function(e, t) {
  let r = setTimeout(e.bind(t), 0);
  return { dispose() {
    clearTimeout(r);
  } };
}), wv;
((e) => {
  function t(r) {
    return r === e.None || r === e.Cancelled || r instanceof Sv ? !0 : !r || typeof r != "object" ? !1 : typeof r.isCancellationRequested == "boolean" && typeof r.onCancellationRequested == "function";
  }
  e.isCancellationToken = t, e.None = Object.freeze({ isCancellationRequested: !1, onCancellationRequested: je.None }), e.Cancelled = Object.freeze({ isCancellationRequested: !0, onCancellationRequested: Ef });
})(wv || (wv = {}));
var Sv = class {
  constructor() {
    this._isCancelled = !1, this._emitter = null;
  }
  cancel() {
    this._isCancelled || (this._isCancelled = !0, this._emitter && (this._emitter.fire(void 0), this.dispose()));
  }
  get isCancellationRequested() {
    return this._isCancelled;
  }
  get onCancellationRequested() {
    return this._isCancelled ? Ef : (this._emitter || (this._emitter = new Q()), this._emitter.event);
  }
  dispose() {
    this._emitter && (this._emitter.dispose(), this._emitter = null);
  }
}, Ua = class {
  constructor(e, t) {
    this._isDisposed = !1, this._token = -1, typeof e == "function" && typeof t == "number" && this.setIfNotSet(e, t);
  }
  dispose() {
    this.cancel(), this._isDisposed = !0;
  }
  cancel() {
    this._token !== -1 && (clearTimeout(this._token), this._token = -1);
  }
  cancelAndSet(e, t) {
    if (this._isDisposed) throw new No("Calling 'cancelAndSet' on a disposed TimeoutTimer");
    this.cancel(), this._token = setTimeout(() => {
      this._token = -1, e();
    }, t);
  }
  setIfNotSet(e, t) {
    if (this._isDisposed) throw new No("Calling 'setIfNotSet' on a disposed TimeoutTimer");
    this._token === -1 && (this._token = setTimeout(() => {
      this._token = -1, e();
    }, t));
  }
}, Cv = class {
  constructor() {
    this.disposable = void 0, this.isDisposed = !1;
  }
  cancel() {
    var e;
    (e = this.disposable) == null || e.dispose(), this.disposable = void 0;
  }
  cancelAndSet(e, t, r = globalThis) {
    if (this.isDisposed) throw new No("Calling 'cancelAndSet' on a disposed IntervalTimer");
    this.cancel();
    let i = r.setInterval(() => {
      e();
    }, t);
    this.disposable = Se(() => {
      r.clearInterval(i), this.disposable = void 0;
    });
  }
  dispose() {
    this.cancel(), this.isDisposed = !0;
  }
}, Ev;
((e) => {
  async function t(i) {
    let s, n = await Promise.all(i.map((o) => o.then((a) => a, (a) => {
      s || (s = a);
    })));
    if (typeof s < "u") throw s;
    return n;
  }
  e.settled = t;
  function r(i) {
    return new Promise(async (s, n) => {
      try {
        await i(s, n);
      } catch (o) {
        n(o);
      }
    });
  }
  e.withAsyncBody = r;
})(Ev || (Ev = {}));
var fc = class lt {
  static fromArray(t) {
    return new lt((r) => {
      r.emitMany(t);
    });
  }
  static fromPromise(t) {
    return new lt(async (r) => {
      r.emitMany(await t);
    });
  }
  static fromPromises(t) {
    return new lt(async (r) => {
      await Promise.all(t.map(async (i) => r.emitOne(await i)));
    });
  }
  static merge(t) {
    return new lt(async (r) => {
      await Promise.all(t.map(async (i) => {
        for await (let s of i) r.emitOne(s);
      }));
    });
  }
  constructor(t, r) {
    this._state = 0, this._results = [], this._error = null, this._onReturn = r, this._onStateChanged = new Q(), queueMicrotask(async () => {
      let i = { emitOne: (s) => this.emitOne(s), emitMany: (s) => this.emitMany(s), reject: (s) => this.reject(s) };
      try {
        await Promise.resolve(t(i)), this.resolve();
      } catch (s) {
        this.reject(s);
      } finally {
        i.emitOne = void 0, i.emitMany = void 0, i.reject = void 0;
      }
    });
  }
  [Symbol.asyncIterator]() {
    let t = 0;
    return { next: async () => {
      do {
        if (this._state === 2) throw this._error;
        if (t < this._results.length) return { done: !1, value: this._results[t++] };
        if (this._state === 1) return { done: !0, value: void 0 };
        await je.toPromise(this._onStateChanged.event);
      } while (!0);
    }, return: async () => {
      var r;
      return (r = this._onReturn) == null || r.call(this), { done: !0, value: void 0 };
    } };
  }
  static map(t, r) {
    return new lt(async (i) => {
      for await (let s of t) i.emitOne(r(s));
    });
  }
  map(t) {
    return lt.map(this, t);
  }
  static filter(t, r) {
    return new lt(async (i) => {
      for await (let s of t) r(s) && i.emitOne(s);
    });
  }
  filter(t) {
    return lt.filter(this, t);
  }
  static coalesce(t) {
    return lt.filter(t, (r) => !!r);
  }
  coalesce() {
    return lt.coalesce(this);
  }
  static async toPromise(t) {
    let r = [];
    for await (let i of t) r.push(i);
    return r;
  }
  toPromise() {
    return lt.toPromise(this);
  }
  emitOne(t) {
    this._state === 0 && (this._results.push(t), this._onStateChanged.fire());
  }
  emitMany(t) {
    this._state === 0 && (this._results = this._results.concat(t), this._onStateChanged.fire());
  }
  resolve() {
    this._state === 0 && (this._state = 1, this._onStateChanged.fire());
  }
  reject(t) {
    this._state === 0 && (this._state = 2, this._error = t, this._onStateChanged.fire());
  }
};
fc.EMPTY = fc.fromArray([]);
var { getWindow: xt, getWindowId: xv, onDidRegisterWindow: kv } = function() {
  let e = /* @__PURE__ */ new Map(), t = { window: Ft, disposables: new tr() };
  e.set(Ft.vscodeWindowId, t);
  let r = new Q(), i = new Q(), s = new Q();
  function n(o, a) {
    return (typeof o == "number" ? e.get(o) : void 0) ?? (a ? t : void 0);
  }
  return { onDidRegisterWindow: r.event, onWillUnregisterWindow: s.event, onDidUnregisterWindow: i.event, registerWindow(o) {
    if (e.has(o.vscodeWindowId)) return de.None;
    let a = new tr(), h = { window: o, disposables: a.add(new tr()) };
    return e.set(o.vscodeWindowId, h), a.add(Se(() => {
      e.delete(o.vscodeWindowId), i.fire(o);
    })), a.add(he(o, Fe.BEFORE_UNLOAD, () => {
      s.fire(o);
    })), r.fire(h), a;
  }, getWindows() {
    return e.values();
  }, getWindowsCount() {
    return e.size;
  }, getWindowId(o) {
    return o.vscodeWindowId;
  }, hasWindow(o) {
    return e.has(o);
  }, getWindowById: n, getWindow(o) {
    var l;
    let a = o;
    if ((l = a == null ? void 0 : a.ownerDocument) != null && l.defaultView) return a.ownerDocument.defaultView.window;
    let h = o;
    return h != null && h.view ? h.view.window : Ft;
  }, getDocument(o) {
    return xt(o).document;
  } };
}(), Bv = class {
  constructor(e, t, r, i) {
    this._node = e, this._type = t, this._handler = r, this._options = i || !1, this._node.addEventListener(this._type, this._handler, this._options);
  }
  dispose() {
    this._handler && (this._node.removeEventListener(this._type, this._handler, this._options), this._node = null, this._handler = null);
  }
};
function he(e, t, r, i) {
  return new Bv(e, t, r, i);
}
var dc = function(e, t, r, i) {
  return he(e, t, r, i);
}, Ha, Rv = class extends Cv {
  constructor(e) {
    super(), this.defaultTarget = e && xt(e);
  }
  cancelAndSet(e, t, r) {
    return super.cancelAndSet(e, t, r ?? this.defaultTarget);
  }
}, pc = class {
  constructor(e, t = 0) {
    this._runner = e, this.priority = t, this._canceled = !1;
  }
  dispose() {
    this._canceled = !0;
  }
  execute() {
    if (!this._canceled) try {
      this._runner();
    } catch (e) {
      Wi(e);
    }
  }
  static sort(e, t) {
    return t.priority - e.priority;
  }
};
(function() {
  let e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), s = (n) => {
    r.set(n, !1);
    let o = e.get(n) ?? [];
    for (t.set(n, o), e.set(n, []), i.set(n, !0); o.length > 0; ) o.sort(pc.sort), o.shift().execute();
    i.set(n, !1);
  };
  Ha = (n, o, a = 0) => {
    let h = xv(n), l = new pc(o, a), c = e.get(h);
    return c || (c = [], e.set(h, c)), c.push(l), r.get(h) || (r.set(h, !0), n.requestAnimationFrame(() => s(h))), l;
  };
})();
function Av(e) {
  let t = e.getBoundingClientRect(), r = xt(e);
  return { left: t.left + r.scrollX, top: t.top + r.scrollY, width: t.width, height: t.height };
}
var Fe = { CLICK: "click", MOUSE_DOWN: "mousedown", MOUSE_OVER: "mouseover", MOUSE_LEAVE: "mouseleave", MOUSE_WHEEL: "wheel", POINTER_UP: "pointerup", POINTER_DOWN: "pointerdown", POINTER_MOVE: "pointermove", KEY_DOWN: "keydown", KEY_UP: "keyup", BEFORE_UNLOAD: "beforeunload", CHANGE: "change", FOCUS: "focus", BLUR: "blur", INPUT: "input" }, Dv = class {
  constructor(e) {
    this.domNode = e, this._maxWidth = "", this._width = "", this._height = "", this._top = "", this._left = "", this._bottom = "", this._right = "", this._paddingTop = "", this._paddingLeft = "", this._paddingBottom = "", this._paddingRight = "", this._fontFamily = "", this._fontWeight = "", this._fontSize = "", this._fontStyle = "", this._fontFeatureSettings = "", this._fontVariationSettings = "", this._textDecoration = "", this._lineHeight = "", this._letterSpacing = "", this._className = "", this._display = "", this._position = "", this._visibility = "", this._color = "", this._backgroundColor = "", this._layerHint = !1, this._contain = "none", this._boxShadow = "";
  }
  setMaxWidth(e) {
    let t = tt(e);
    this._maxWidth !== t && (this._maxWidth = t, this.domNode.style.maxWidth = this._maxWidth);
  }
  setWidth(e) {
    let t = tt(e);
    this._width !== t && (this._width = t, this.domNode.style.width = this._width);
  }
  setHeight(e) {
    let t = tt(e);
    this._height !== t && (this._height = t, this.domNode.style.height = this._height);
  }
  setTop(e) {
    let t = tt(e);
    this._top !== t && (this._top = t, this.domNode.style.top = this._top);
  }
  setLeft(e) {
    let t = tt(e);
    this._left !== t && (this._left = t, this.domNode.style.left = this._left);
  }
  setBottom(e) {
    let t = tt(e);
    this._bottom !== t && (this._bottom = t, this.domNode.style.bottom = this._bottom);
  }
  setRight(e) {
    let t = tt(e);
    this._right !== t && (this._right = t, this.domNode.style.right = this._right);
  }
  setPaddingTop(e) {
    let t = tt(e);
    this._paddingTop !== t && (this._paddingTop = t, this.domNode.style.paddingTop = this._paddingTop);
  }
  setPaddingLeft(e) {
    let t = tt(e);
    this._paddingLeft !== t && (this._paddingLeft = t, this.domNode.style.paddingLeft = this._paddingLeft);
  }
  setPaddingBottom(e) {
    let t = tt(e);
    this._paddingBottom !== t && (this._paddingBottom = t, this.domNode.style.paddingBottom = this._paddingBottom);
  }
  setPaddingRight(e) {
    let t = tt(e);
    this._paddingRight !== t && (this._paddingRight = t, this.domNode.style.paddingRight = this._paddingRight);
  }
  setFontFamily(e) {
    this._fontFamily !== e && (this._fontFamily = e, this.domNode.style.fontFamily = this._fontFamily);
  }
  setFontWeight(e) {
    this._fontWeight !== e && (this._fontWeight = e, this.domNode.style.fontWeight = this._fontWeight);
  }
  setFontSize(e) {
    let t = tt(e);
    this._fontSize !== t && (this._fontSize = t, this.domNode.style.fontSize = this._fontSize);
  }
  setFontStyle(e) {
    this._fontStyle !== e && (this._fontStyle = e, this.domNode.style.fontStyle = this._fontStyle);
  }
  setFontFeatureSettings(e) {
    this._fontFeatureSettings !== e && (this._fontFeatureSettings = e, this.domNode.style.fontFeatureSettings = this._fontFeatureSettings);
  }
  setFontVariationSettings(e) {
    this._fontVariationSettings !== e && (this._fontVariationSettings = e, this.domNode.style.fontVariationSettings = this._fontVariationSettings);
  }
  setTextDecoration(e) {
    this._textDecoration !== e && (this._textDecoration = e, this.domNode.style.textDecoration = this._textDecoration);
  }
  setLineHeight(e) {
    let t = tt(e);
    this._lineHeight !== t && (this._lineHeight = t, this.domNode.style.lineHeight = this._lineHeight);
  }
  setLetterSpacing(e) {
    let t = tt(e);
    this._letterSpacing !== t && (this._letterSpacing = t, this.domNode.style.letterSpacing = this._letterSpacing);
  }
  setClassName(e) {
    this._className !== e && (this._className = e, this.domNode.className = this._className);
  }
  toggleClassName(e, t) {
    this.domNode.classList.toggle(e, t), this._className = this.domNode.className;
  }
  setDisplay(e) {
    this._display !== e && (this._display = e, this.domNode.style.display = this._display);
  }
  setPosition(e) {
    this._position !== e && (this._position = e, this.domNode.style.position = this._position);
  }
  setVisibility(e) {
    this._visibility !== e && (this._visibility = e, this.domNode.style.visibility = this._visibility);
  }
  setColor(e) {
    this._color !== e && (this._color = e, this.domNode.style.color = this._color);
  }
  setBackgroundColor(e) {
    this._backgroundColor !== e && (this._backgroundColor = e, this.domNode.style.backgroundColor = this._backgroundColor);
  }
  setLayerHinting(e) {
    this._layerHint !== e && (this._layerHint = e, this.domNode.style.transform = this._layerHint ? "translate3d(0px, 0px, 0px)" : "");
  }
  setBoxShadow(e) {
    this._boxShadow !== e && (this._boxShadow = e, this.domNode.style.boxShadow = e);
  }
  setContain(e) {
    this._contain !== e && (this._contain = e, this.domNode.style.contain = this._contain);
  }
  setAttribute(e, t) {
    this.domNode.setAttribute(e, t);
  }
  removeAttribute(e) {
    this.domNode.removeAttribute(e);
  }
  appendChild(e) {
    this.domNode.appendChild(e.domNode);
  }
  removeChild(e) {
    this.domNode.removeChild(e.domNode);
  }
};
function tt(e) {
  return typeof e == "number" ? `${e}px` : e;
}
function Jr(e) {
  return new Dv(e);
}
var xf = class {
  constructor() {
    this._hooks = new tr(), this._pointerMoveCallback = null, this._onStopCallback = null;
  }
  dispose() {
    this.stopMonitoring(!1), this._hooks.dispose();
  }
  stopMonitoring(e, t) {
    if (!this.isMonitoring()) return;
    this._hooks.clear(), this._pointerMoveCallback = null;
    let r = this._onStopCallback;
    this._onStopCallback = null, e && r && r(t);
  }
  isMonitoring() {
    return !!this._pointerMoveCallback;
  }
  startMonitoring(e, t, r, i, s) {
    this.isMonitoring() && this.stopMonitoring(!1), this._pointerMoveCallback = i, this._onStopCallback = s;
    let n = e;
    try {
      e.setPointerCapture(t), this._hooks.add(Se(() => {
        try {
          e.releasePointerCapture(t);
        } catch {
        }
      }));
    } catch {
      n = xt(e);
    }
    this._hooks.add(he(n, Fe.POINTER_MOVE, (o) => {
      if (o.buttons !== r) {
        this.stopMonitoring(!0);
        return;
      }
      o.preventDefault(), this._pointerMoveCallback(o);
    })), this._hooks.add(he(n, Fe.POINTER_UP, (o) => this.stopMonitoring(!0)));
  }
};
function Tv(e, t, r) {
  let i = null, s = null;
  if (typeof r.value == "function" ? (i = "value", s = r.value, s.length !== 0 && console.warn("Memoize should only be used in functions with zero parameters")) : typeof r.get == "function" && (i = "get", s = r.get), !s) throw new Error("not supported");
  let n = `$memoize$${t}`;
  r[i] = function(...o) {
    return this.hasOwnProperty(n) || Object.defineProperty(this, n, { configurable: !1, enumerable: !1, writable: !1, value: s.apply(this, o) }), this[n];
  };
}
var bt;
((e) => (e.Tap = "-xterm-gesturetap", e.Change = "-xterm-gesturechange", e.Start = "-xterm-gesturestart", e.End = "-xterm-gesturesend", e.Contextmenu = "-xterm-gesturecontextmenu"))(bt || (bt = {}));
var Kr = class Ke extends de {
  constructor() {
    super(), this.dispatched = !1, this.targets = new sc(), this.ignoreTargets = new sc(), this.activeTouches = {}, this.handle = null, this._lastSetTapCountTime = 0, this._register(je.runAndSubscribe(kv, ({ window: t, disposables: r }) => {
      r.add(he(t.document, "touchstart", (i) => this.onTouchStart(i), { passive: !1 })), r.add(he(t.document, "touchend", (i) => this.onTouchEnd(t, i))), r.add(he(t.document, "touchmove", (i) => this.onTouchMove(i), { passive: !1 }));
    }, { window: Ft, disposables: this._store }));
  }
  static addTarget(t) {
    if (!Ke.isTouchDevice()) return de.None;
    Ke.INSTANCE || (Ke.INSTANCE = new Ke());
    let r = Ke.INSTANCE.targets.push(t);
    return Se(r);
  }
  static ignoreTarget(t) {
    if (!Ke.isTouchDevice()) return de.None;
    Ke.INSTANCE || (Ke.INSTANCE = new Ke());
    let r = Ke.INSTANCE.ignoreTargets.push(t);
    return Se(r);
  }
  static isTouchDevice() {
    return "ontouchstart" in Ft || navigator.maxTouchPoints > 0;
  }
  dispose() {
    this.handle && (this.handle.dispose(), this.handle = null), super.dispose();
  }
  onTouchStart(t) {
    let r = Date.now();
    this.handle && (this.handle.dispose(), this.handle = null);
    for (let i = 0, s = t.targetTouches.length; i < s; i++) {
      let n = t.targetTouches.item(i);
      this.activeTouches[n.identifier] = { id: n.identifier, initialTarget: n.target, initialTimeStamp: r, initialPageX: n.pageX, initialPageY: n.pageY, rollingTimestamps: [r], rollingPageX: [n.pageX], rollingPageY: [n.pageY] };
      let o = this.newGestureEvent(bt.Start, n.target);
      o.pageX = n.pageX, o.pageY = n.pageY, this.dispatchEvent(o);
    }
    this.dispatched && (t.preventDefault(), t.stopPropagation(), this.dispatched = !1);
  }
  onTouchEnd(t, r) {
    let i = Date.now(), s = Object.keys(this.activeTouches).length;
    for (let n = 0, o = r.changedTouches.length; n < o; n++) {
      let a = r.changedTouches.item(n);
      if (!this.activeTouches.hasOwnProperty(String(a.identifier))) {
        console.warn("move of an UNKNOWN touch", a);
        continue;
      }
      let h = this.activeTouches[a.identifier], l = Date.now() - h.initialTimeStamp;
      if (l < Ke.HOLD_DELAY && Math.abs(h.initialPageX - st(h.rollingPageX)) < 30 && Math.abs(h.initialPageY - st(h.rollingPageY)) < 30) {
        let c = this.newGestureEvent(bt.Tap, h.initialTarget);
        c.pageX = st(h.rollingPageX), c.pageY = st(h.rollingPageY), this.dispatchEvent(c);
      } else if (l >= Ke.HOLD_DELAY && Math.abs(h.initialPageX - st(h.rollingPageX)) < 30 && Math.abs(h.initialPageY - st(h.rollingPageY)) < 30) {
        let c = this.newGestureEvent(bt.Contextmenu, h.initialTarget);
        c.pageX = st(h.rollingPageX), c.pageY = st(h.rollingPageY), this.dispatchEvent(c);
      } else if (s === 1) {
        let c = st(h.rollingPageX), u = st(h.rollingPageY), p = st(h.rollingTimestamps) - h.rollingTimestamps[0], _ = c - h.rollingPageX[0], m = u - h.rollingPageY[0], g = [...this.targets].filter((w) => h.initialTarget instanceof Node && w.contains(h.initialTarget));
        this.inertia(t, g, i, Math.abs(_) / p, _ > 0 ? 1 : -1, c, Math.abs(m) / p, m > 0 ? 1 : -1, u);
      }
      this.dispatchEvent(this.newGestureEvent(bt.End, h.initialTarget)), delete this.activeTouches[a.identifier];
    }
    this.dispatched && (r.preventDefault(), r.stopPropagation(), this.dispatched = !1);
  }
  newGestureEvent(t, r) {
    let i = document.createEvent("CustomEvent");
    return i.initEvent(t, !1, !0), i.initialTarget = r, i.tapCount = 0, i;
  }
  dispatchEvent(t) {
    if (t.type === bt.Tap) {
      let r = (/* @__PURE__ */ new Date()).getTime(), i = 0;
      r - this._lastSetTapCountTime > Ke.CLEAR_TAP_COUNT_TIME ? i = 1 : i = 2, this._lastSetTapCountTime = r, t.tapCount = i;
    } else (t.type === bt.Change || t.type === bt.Contextmenu) && (this._lastSetTapCountTime = 0);
    if (t.initialTarget instanceof Node) {
      for (let i of this.ignoreTargets) if (i.contains(t.initialTarget)) return;
      let r = [];
      for (let i of this.targets) if (i.contains(t.initialTarget)) {
        let s = 0, n = t.initialTarget;
        for (; n && n !== i; ) s++, n = n.parentElement;
        r.push([s, i]);
      }
      r.sort((i, s) => i[0] - s[0]);
      for (let [i, s] of r) s.dispatchEvent(t), this.dispatched = !0;
    }
  }
  inertia(t, r, i, s, n, o, a, h, l) {
    this.handle = Ha(t, () => {
      let c = Date.now(), u = c - i, p = 0, _ = 0, m = !0;
      s += Ke.SCROLL_FRICTION * u, a += Ke.SCROLL_FRICTION * u, s > 0 && (m = !1, p = n * s * u), a > 0 && (m = !1, _ = h * a * u);
      let g = this.newGestureEvent(bt.Change);
      g.translationX = p, g.translationY = _, r.forEach((w) => w.dispatchEvent(g)), m || this.inertia(t, r, c, s, n, o + p, a, h, l + _);
    });
  }
  onTouchMove(t) {
    let r = Date.now();
    for (let i = 0, s = t.changedTouches.length; i < s; i++) {
      let n = t.changedTouches.item(i);
      if (!this.activeTouches.hasOwnProperty(String(n.identifier))) {
        console.warn("end of an UNKNOWN touch", n);
        continue;
      }
      let o = this.activeTouches[n.identifier], a = this.newGestureEvent(bt.Change, o.initialTarget);
      a.translationX = n.pageX - st(o.rollingPageX), a.translationY = n.pageY - st(o.rollingPageY), a.pageX = n.pageX, a.pageY = n.pageY, this.dispatchEvent(a), o.rollingPageX.length > 3 && (o.rollingPageX.shift(), o.rollingPageY.shift(), o.rollingTimestamps.shift()), o.rollingPageX.push(n.pageX), o.rollingPageY.push(n.pageY), o.rollingTimestamps.push(r);
    }
    this.dispatched && (t.preventDefault(), t.stopPropagation(), this.dispatched = !1);
  }
};
Kr.SCROLL_FRICTION = -5e-3, Kr.HOLD_DELAY = 700, Kr.CLEAR_TAP_COUNT_TIME = 400, Ae([Tv], Kr, "isTouchDevice", 1);
var Lv = Kr, Wa = class extends de {
  onclick(e, t) {
    this._register(he(e, Fe.CLICK, (r) => t(new Ai(xt(e), r))));
  }
  onmousedown(e, t) {
    this._register(he(e, Fe.MOUSE_DOWN, (r) => t(new Ai(xt(e), r))));
  }
  onmouseover(e, t) {
    this._register(he(e, Fe.MOUSE_OVER, (r) => t(new Ai(xt(e), r))));
  }
  onmouseleave(e, t) {
    this._register(he(e, Fe.MOUSE_LEAVE, (r) => t(new Ai(xt(e), r))));
  }
  onkeydown(e, t) {
    this._register(he(e, Fe.KEY_DOWN, (r) => t(new hc(r))));
  }
  onkeyup(e, t) {
    this._register(he(e, Fe.KEY_UP, (r) => t(new hc(r))));
  }
  oninput(e, t) {
    this._register(he(e, Fe.INPUT, t));
  }
  onblur(e, t) {
    this._register(he(e, Fe.BLUR, t));
  }
  onfocus(e, t) {
    this._register(he(e, Fe.FOCUS, t));
  }
  onchange(e, t) {
    this._register(he(e, Fe.CHANGE, t));
  }
  ignoreGesture(e) {
    return Lv.ignoreTarget(e);
  }
}, _c = 11, Pv = class extends Wa {
  constructor(e) {
    super(), this._onActivate = e.onActivate, this.bgDomNode = document.createElement("div"), this.bgDomNode.className = "arrow-background", this.bgDomNode.style.position = "absolute", this.bgDomNode.style.width = e.bgWidth + "px", this.bgDomNode.style.height = e.bgHeight + "px", typeof e.top < "u" && (this.bgDomNode.style.top = "0px"), typeof e.left < "u" && (this.bgDomNode.style.left = "0px"), typeof e.bottom < "u" && (this.bgDomNode.style.bottom = "0px"), typeof e.right < "u" && (this.bgDomNode.style.right = "0px"), this.domNode = document.createElement("div"), this.domNode.className = e.className, this.domNode.style.position = "absolute", this.domNode.style.width = _c + "px", this.domNode.style.height = _c + "px", typeof e.top < "u" && (this.domNode.style.top = e.top + "px"), typeof e.left < "u" && (this.domNode.style.left = e.left + "px"), typeof e.bottom < "u" && (this.domNode.style.bottom = e.bottom + "px"), typeof e.right < "u" && (this.domNode.style.right = e.right + "px"), this._pointerMoveMonitor = this._register(new xf()), this._register(dc(this.bgDomNode, Fe.POINTER_DOWN, (t) => this._arrowPointerDown(t))), this._register(dc(this.domNode, Fe.POINTER_DOWN, (t) => this._arrowPointerDown(t))), this._pointerdownRepeatTimer = this._register(new Rv()), this._pointerdownScheduleRepeatTimer = this._register(new Ua());
  }
  _arrowPointerDown(e) {
    if (!e.target || !(e.target instanceof Element)) return;
    let t = () => {
      this._pointerdownRepeatTimer.cancelAndSet(() => this._onActivate(), 1e3 / 24, xt(e));
    };
    this._onActivate(), this._pointerdownRepeatTimer.cancel(), this._pointerdownScheduleRepeatTimer.cancelAndSet(t, 200), this._pointerMoveMonitor.startMonitoring(e.target, e.pointerId, e.buttons, (r) => {
    }, () => {
      this._pointerdownRepeatTimer.cancel(), this._pointerdownScheduleRepeatTimer.cancel();
    }), e.preventDefault();
  }
}, Mv = class Ko {
  constructor(t, r, i, s, n, o, a) {
    this._forceIntegerValues = t, this._scrollStateBrand = void 0, this._forceIntegerValues && (r = r | 0, i = i | 0, s = s | 0, n = n | 0, o = o | 0, a = a | 0), this.rawScrollLeft = s, this.rawScrollTop = a, r < 0 && (r = 0), s + r > i && (s = i - r), s < 0 && (s = 0), n < 0 && (n = 0), a + n > o && (a = o - n), a < 0 && (a = 0), this.width = r, this.scrollWidth = i, this.scrollLeft = s, this.height = n, this.scrollHeight = o, this.scrollTop = a;
  }
  equals(t) {
    return this.rawScrollLeft === t.rawScrollLeft && this.rawScrollTop === t.rawScrollTop && this.width === t.width && this.scrollWidth === t.scrollWidth && this.scrollLeft === t.scrollLeft && this.height === t.height && this.scrollHeight === t.scrollHeight && this.scrollTop === t.scrollTop;
  }
  withScrollDimensions(t, r) {
    return new Ko(this._forceIntegerValues, typeof t.width < "u" ? t.width : this.width, typeof t.scrollWidth < "u" ? t.scrollWidth : this.scrollWidth, r ? this.rawScrollLeft : this.scrollLeft, typeof t.height < "u" ? t.height : this.height, typeof t.scrollHeight < "u" ? t.scrollHeight : this.scrollHeight, r ? this.rawScrollTop : this.scrollTop);
  }
  withScrollPosition(t) {
    return new Ko(this._forceIntegerValues, this.width, this.scrollWidth, typeof t.scrollLeft < "u" ? t.scrollLeft : this.rawScrollLeft, this.height, this.scrollHeight, typeof t.scrollTop < "u" ? t.scrollTop : this.rawScrollTop);
  }
  createScrollEvent(t, r) {
    let i = this.width !== t.width, s = this.scrollWidth !== t.scrollWidth, n = this.scrollLeft !== t.scrollLeft, o = this.height !== t.height, a = this.scrollHeight !== t.scrollHeight, h = this.scrollTop !== t.scrollTop;
    return { inSmoothScrolling: r, oldWidth: t.width, oldScrollWidth: t.scrollWidth, oldScrollLeft: t.scrollLeft, width: this.width, scrollWidth: this.scrollWidth, scrollLeft: this.scrollLeft, oldHeight: t.height, oldScrollHeight: t.scrollHeight, oldScrollTop: t.scrollTop, height: this.height, scrollHeight: this.scrollHeight, scrollTop: this.scrollTop, widthChanged: i, scrollWidthChanged: s, scrollLeftChanged: n, heightChanged: o, scrollHeightChanged: a, scrollTopChanged: h };
  }
}, Ov = class extends de {
  constructor(e) {
    super(), this._scrollableBrand = void 0, this._onScroll = this._register(new Q()), this.onScroll = this._onScroll.event, this._smoothScrollDuration = e.smoothScrollDuration, this._scheduleAtNextAnimationFrame = e.scheduleAtNextAnimationFrame, this._state = new Mv(e.forceIntegerValues, 0, 0, 0, 0, 0, 0), this._smoothScrolling = null;
  }
  dispose() {
    this._smoothScrolling && (this._smoothScrolling.dispose(), this._smoothScrolling = null), super.dispose();
  }
  setSmoothScrollDuration(e) {
    this._smoothScrollDuration = e;
  }
  validateScrollPosition(e) {
    return this._state.withScrollPosition(e);
  }
  getScrollDimensions() {
    return this._state;
  }
  setScrollDimensions(e, t) {
    var i;
    let r = this._state.withScrollDimensions(e, t);
    this._setState(r, !!this._smoothScrolling), (i = this._smoothScrolling) == null || i.acceptScrollDimensions(this._state);
  }
  getFutureScrollPosition() {
    return this._smoothScrolling ? this._smoothScrolling.to : this._state;
  }
  getCurrentScrollPosition() {
    return this._state;
  }
  setScrollPositionNow(e) {
    let t = this._state.withScrollPosition(e);
    this._smoothScrolling && (this._smoothScrolling.dispose(), this._smoothScrolling = null), this._setState(t, !1);
  }
  setScrollPositionSmooth(e, t) {
    if (this._smoothScrollDuration === 0) return this.setScrollPositionNow(e);
    if (this._smoothScrolling) {
      e = { scrollLeft: typeof e.scrollLeft > "u" ? this._smoothScrolling.to.scrollLeft : e.scrollLeft, scrollTop: typeof e.scrollTop > "u" ? this._smoothScrolling.to.scrollTop : e.scrollTop };
      let r = this._state.withScrollPosition(e);
      if (this._smoothScrolling.to.scrollLeft === r.scrollLeft && this._smoothScrolling.to.scrollTop === r.scrollTop) return;
      let i;
      t ? i = new vc(this._smoothScrolling.from, r, this._smoothScrolling.startTime, this._smoothScrolling.duration) : i = this._smoothScrolling.combine(this._state, r, this._smoothScrollDuration), this._smoothScrolling.dispose(), this._smoothScrolling = i;
    } else {
      let r = this._state.withScrollPosition(e);
      this._smoothScrolling = vc.start(this._state, r, this._smoothScrollDuration);
    }
    this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(() => {
      this._smoothScrolling && (this._smoothScrolling.animationFrameDisposable = null, this._performSmoothScrolling());
    });
  }
  hasPendingScrollAnimation() {
    return !!this._smoothScrolling;
  }
  _performSmoothScrolling() {
    if (!this._smoothScrolling) return;
    let e = this._smoothScrolling.tick(), t = this._state.withScrollPosition(e);
    if (this._setState(t, !0), !!this._smoothScrolling) {
      if (e.isDone) {
        this._smoothScrolling.dispose(), this._smoothScrolling = null;
        return;
      }
      this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(() => {
        this._smoothScrolling && (this._smoothScrolling.animationFrameDisposable = null, this._performSmoothScrolling());
      });
    }
  }
  _setState(e, t) {
    let r = this._state;
    r.equals(e) || (this._state = e, this._onScroll.fire(this._state.createScrollEvent(r, t)));
  }
}, gc = class {
  constructor(e, t, r) {
    this.scrollLeft = e, this.scrollTop = t, this.isDone = r;
  }
};
function uo(e, t) {
  let r = t - e;
  return function(i) {
    return e + r * Fv(i);
  };
}
function Iv(e, t, r) {
  return function(i) {
    return i < r ? e(i / r) : t((i - r) / (1 - r));
  };
}
var vc = class Vo {
  constructor(t, r, i, s) {
    this.from = t, this.to = r, this.duration = s, this.startTime = i, this.animationFrameDisposable = null, this._initAnimations();
  }
  _initAnimations() {
    this.scrollLeft = this._initAnimation(this.from.scrollLeft, this.to.scrollLeft, this.to.width), this.scrollTop = this._initAnimation(this.from.scrollTop, this.to.scrollTop, this.to.height);
  }
  _initAnimation(t, r, i) {
    if (Math.abs(t - r) > 2.5 * i) {
      let s, n;
      return t < r ? (s = t + 0.75 * i, n = r - 0.75 * i) : (s = t - 0.75 * i, n = r + 0.75 * i), Iv(uo(t, s), uo(n, r), 0.33);
    }
    return uo(t, r);
  }
  dispose() {
    this.animationFrameDisposable !== null && (this.animationFrameDisposable.dispose(), this.animationFrameDisposable = null);
  }
  acceptScrollDimensions(t) {
    this.to = t.withScrollPosition(this.to), this._initAnimations();
  }
  tick() {
    return this._tick(Date.now());
  }
  _tick(t) {
    let r = (t - this.startTime) / this.duration;
    if (r < 1) {
      let i = this.scrollLeft(r), s = this.scrollTop(r);
      return new gc(i, s, !1);
    }
    return new gc(this.to.scrollLeft, this.to.scrollTop, !0);
  }
  combine(t, r, i) {
    return Vo.start(t, r, i);
  }
  static start(t, r, i) {
    i = i + 10;
    let s = Date.now() - 10;
    return new Vo(t, r, s, i);
  }
};
function Nv(e) {
  return Math.pow(e, 3);
}
function Fv(e) {
  return 1 - Nv(1 - e);
}
var Uv = class extends de {
  constructor(e, t, r) {
    super(), this._visibility = e, this._visibleClassName = t, this._invisibleClassName = r, this._domNode = null, this._isVisible = !1, this._isNeeded = !1, this._rawShouldBeVisible = !1, this._shouldBeVisible = !1, this._revealTimer = this._register(new Ua());
  }
  setVisibility(e) {
    this._visibility !== e && (this._visibility = e, this._updateShouldBeVisible());
  }
  setShouldBeVisible(e) {
    this._rawShouldBeVisible = e, this._updateShouldBeVisible();
  }
  _applyVisibilitySetting() {
    return this._visibility === 2 ? !1 : this._visibility === 3 ? !0 : this._rawShouldBeVisible;
  }
  _updateShouldBeVisible() {
    let e = this._applyVisibilitySetting();
    this._shouldBeVisible !== e && (this._shouldBeVisible = e, this.ensureVisibility());
  }
  setIsNeeded(e) {
    this._isNeeded !== e && (this._isNeeded = e, this.ensureVisibility());
  }
  setDomNode(e) {
    this._domNode = e, this._domNode.setClassName(this._invisibleClassName), this.setShouldBeVisible(!1);
  }
  ensureVisibility() {
    if (!this._isNeeded) {
      this._hide(!1);
      return;
    }
    this._shouldBeVisible ? this._reveal() : this._hide(!0);
  }
  _reveal() {
    this._isVisible || (this._isVisible = !0, this._revealTimer.setIfNotSet(() => {
      var e;
      (e = this._domNode) == null || e.setClassName(this._visibleClassName);
    }, 0));
  }
  _hide(e) {
    var t;
    this._revealTimer.cancel(), this._isVisible && (this._isVisible = !1, (t = this._domNode) == null || t.setClassName(this._invisibleClassName + (e ? " fade" : "")));
  }
}, Hv = 140, kf = class extends Wa {
  constructor(e) {
    super(), this._lazyRender = e.lazyRender, this._host = e.host, this._scrollable = e.scrollable, this._scrollByPage = e.scrollByPage, this._scrollbarState = e.scrollbarState, this._visibilityController = this._register(new Uv(e.visibility, "visible scrollbar " + e.extraScrollbarClassName, "invisible scrollbar " + e.extraScrollbarClassName)), this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._pointerMoveMonitor = this._register(new xf()), this._shouldRender = !0, this.domNode = Jr(document.createElement("div")), this.domNode.setAttribute("role", "presentation"), this.domNode.setAttribute("aria-hidden", "true"), this._visibilityController.setDomNode(this.domNode), this.domNode.setPosition("absolute"), this._register(he(this.domNode.domNode, Fe.POINTER_DOWN, (t) => this._domNodePointerDown(t)));
  }
  _createArrow(e) {
    let t = this._register(new Pv(e));
    this.domNode.domNode.appendChild(t.bgDomNode), this.domNode.domNode.appendChild(t.domNode);
  }
  _createSlider(e, t, r, i) {
    this.slider = Jr(document.createElement("div")), this.slider.setClassName("slider"), this.slider.setPosition("absolute"), this.slider.setTop(e), this.slider.setLeft(t), typeof r == "number" && this.slider.setWidth(r), typeof i == "number" && this.slider.setHeight(i), this.slider.setLayerHinting(!0), this.slider.setContain("strict"), this.domNode.domNode.appendChild(this.slider.domNode), this._register(he(this.slider.domNode, Fe.POINTER_DOWN, (s) => {
      s.button === 0 && (s.preventDefault(), this._sliderPointerDown(s));
    })), this.onclick(this.slider.domNode, (s) => {
      s.leftButton && s.stopPropagation();
    });
  }
  _onElementSize(e) {
    return this._scrollbarState.setVisibleSize(e) && (this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._shouldRender = !0, this._lazyRender || this.render()), this._shouldRender;
  }
  _onElementScrollSize(e) {
    return this._scrollbarState.setScrollSize(e) && (this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._shouldRender = !0, this._lazyRender || this.render()), this._shouldRender;
  }
  _onElementScrollPosition(e) {
    return this._scrollbarState.setScrollPosition(e) && (this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._shouldRender = !0, this._lazyRender || this.render()), this._shouldRender;
  }
  beginReveal() {
    this._visibilityController.setShouldBeVisible(!0);
  }
  beginHide() {
    this._visibilityController.setShouldBeVisible(!1);
  }
  render() {
    this._shouldRender && (this._shouldRender = !1, this._renderDomNode(this._scrollbarState.getRectangleLargeSize(), this._scrollbarState.getRectangleSmallSize()), this._updateSlider(this._scrollbarState.getSliderSize(), this._scrollbarState.getArrowSize() + this._scrollbarState.getSliderPosition()));
  }
  _domNodePointerDown(e) {
    e.target === this.domNode.domNode && this._onPointerDown(e);
  }
  delegatePointerDown(e) {
    let t = this.domNode.domNode.getClientRects()[0].top, r = t + this._scrollbarState.getSliderPosition(), i = t + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize(), s = this._sliderPointerPosition(e);
    r <= s && s <= i ? e.button === 0 && (e.preventDefault(), this._sliderPointerDown(e)) : this._onPointerDown(e);
  }
  _onPointerDown(e) {
    let t, r;
    if (e.target === this.domNode.domNode && typeof e.offsetX == "number" && typeof e.offsetY == "number") t = e.offsetX, r = e.offsetY;
    else {
      let s = Av(this.domNode.domNode);
      t = e.pageX - s.left, r = e.pageY - s.top;
    }
    let i = this._pointerDownRelativePosition(t, r);
    this._setDesiredScrollPositionNow(this._scrollByPage ? this._scrollbarState.getDesiredScrollPositionFromOffsetPaged(i) : this._scrollbarState.getDesiredScrollPositionFromOffset(i)), e.button === 0 && (e.preventDefault(), this._sliderPointerDown(e));
  }
  _sliderPointerDown(e) {
    if (!e.target || !(e.target instanceof Element)) return;
    let t = this._sliderPointerPosition(e), r = this._sliderOrthogonalPointerPosition(e), i = this._scrollbarState.clone();
    this.slider.toggleClassName("active", !0), this._pointerMoveMonitor.startMonitoring(e.target, e.pointerId, e.buttons, (s) => {
      let n = this._sliderOrthogonalPointerPosition(s), o = Math.abs(n - r);
      if (wf && o > Hv) {
        this._setDesiredScrollPositionNow(i.getScrollPosition());
        return;
      }
      let a = this._sliderPointerPosition(s) - t;
      this._setDesiredScrollPositionNow(i.getDesiredScrollPositionFromDelta(a));
    }, () => {
      this.slider.toggleClassName("active", !1), this._host.onDragEnd();
    }), this._host.onDragStart();
  }
  _setDesiredScrollPositionNow(e) {
    let t = {};
    this.writeScrollPosition(t, e), this._scrollable.setScrollPositionNow(t);
  }
  updateScrollbarSize(e) {
    this._updateScrollbarSize(e), this._scrollbarState.setScrollbarSize(e), this._shouldRender = !0, this._lazyRender || this.render();
  }
  isNeeded() {
    return this._scrollbarState.isNeeded();
  }
}, Bf = class Go {
  constructor(t, r, i, s, n, o) {
    this._scrollbarSize = Math.round(r), this._oppositeScrollbarSize = Math.round(i), this._arrowSize = Math.round(t), this._visibleSize = s, this._scrollSize = n, this._scrollPosition = o, this._computedAvailableSize = 0, this._computedIsNeeded = !1, this._computedSliderSize = 0, this._computedSliderRatio = 0, this._computedSliderPosition = 0, this._refreshComputedValues();
  }
  clone() {
    return new Go(this._arrowSize, this._scrollbarSize, this._oppositeScrollbarSize, this._visibleSize, this._scrollSize, this._scrollPosition);
  }
  setVisibleSize(t) {
    let r = Math.round(t);
    return this._visibleSize !== r ? (this._visibleSize = r, this._refreshComputedValues(), !0) : !1;
  }
  setScrollSize(t) {
    let r = Math.round(t);
    return this._scrollSize !== r ? (this._scrollSize = r, this._refreshComputedValues(), !0) : !1;
  }
  setScrollPosition(t) {
    let r = Math.round(t);
    return this._scrollPosition !== r ? (this._scrollPosition = r, this._refreshComputedValues(), !0) : !1;
  }
  setScrollbarSize(t) {
    this._scrollbarSize = Math.round(t);
  }
  setOppositeScrollbarSize(t) {
    this._oppositeScrollbarSize = Math.round(t);
  }
  static _computeValues(t, r, i, s, n) {
    let o = Math.max(0, i - t), a = Math.max(0, o - 2 * r), h = s > 0 && s > i;
    if (!h) return { computedAvailableSize: Math.round(o), computedIsNeeded: h, computedSliderSize: Math.round(a), computedSliderRatio: 0, computedSliderPosition: 0 };
    let l = Math.round(Math.max(20, Math.floor(i * a / s))), c = (a - l) / (s - i), u = n * c;
    return { computedAvailableSize: Math.round(o), computedIsNeeded: h, computedSliderSize: Math.round(l), computedSliderRatio: c, computedSliderPosition: Math.round(u) };
  }
  _refreshComputedValues() {
    let t = Go._computeValues(this._oppositeScrollbarSize, this._arrowSize, this._visibleSize, this._scrollSize, this._scrollPosition);
    this._computedAvailableSize = t.computedAvailableSize, this._computedIsNeeded = t.computedIsNeeded, this._computedSliderSize = t.computedSliderSize, this._computedSliderRatio = t.computedSliderRatio, this._computedSliderPosition = t.computedSliderPosition;
  }
  getArrowSize() {
    return this._arrowSize;
  }
  getScrollPosition() {
    return this._scrollPosition;
  }
  getRectangleLargeSize() {
    return this._computedAvailableSize;
  }
  getRectangleSmallSize() {
    return this._scrollbarSize;
  }
  isNeeded() {
    return this._computedIsNeeded;
  }
  getSliderSize() {
    return this._computedSliderSize;
  }
  getSliderPosition() {
    return this._computedSliderPosition;
  }
  getDesiredScrollPositionFromOffset(t) {
    if (!this._computedIsNeeded) return 0;
    let r = t - this._arrowSize - this._computedSliderSize / 2;
    return Math.round(r / this._computedSliderRatio);
  }
  getDesiredScrollPositionFromOffsetPaged(t) {
    if (!this._computedIsNeeded) return 0;
    let r = t - this._arrowSize, i = this._scrollPosition;
    return r < this._computedSliderPosition ? i -= this._visibleSize : i += this._visibleSize, i;
  }
  getDesiredScrollPositionFromDelta(t) {
    if (!this._computedIsNeeded) return 0;
    let r = this._computedSliderPosition + t;
    return Math.round(r / this._computedSliderRatio);
  }
}, Wv = class extends kf {
  constructor(e, t, r) {
    let i = e.getScrollDimensions(), s = e.getCurrentScrollPosition();
    if (super({ lazyRender: t.lazyRender, host: r, scrollbarState: new Bf(t.horizontalHasArrows ? t.arrowSize : 0, t.horizontal === 2 ? 0 : t.horizontalScrollbarSize, t.vertical === 2 ? 0 : t.verticalScrollbarSize, i.width, i.scrollWidth, s.scrollLeft), visibility: t.horizontal, extraScrollbarClassName: "horizontal", scrollable: e, scrollByPage: t.scrollByPage }), t.horizontalHasArrows) throw new Error("horizontalHasArrows is not supported in xterm.js");
    this._createSlider(Math.floor((t.horizontalScrollbarSize - t.horizontalSliderSize) / 2), 0, void 0, t.horizontalSliderSize);
  }
  _updateSlider(e, t) {
    this.slider.setWidth(e), this.slider.setLeft(t);
  }
  _renderDomNode(e, t) {
    this.domNode.setWidth(e), this.domNode.setHeight(t), this.domNode.setLeft(0), this.domNode.setBottom(0);
  }
  onDidScroll(e) {
    return this._shouldRender = this._onElementScrollSize(e.scrollWidth) || this._shouldRender, this._shouldRender = this._onElementScrollPosition(e.scrollLeft) || this._shouldRender, this._shouldRender = this._onElementSize(e.width) || this._shouldRender, this._shouldRender;
  }
  _pointerDownRelativePosition(e, t) {
    return e;
  }
  _sliderPointerPosition(e) {
    return e.pageX;
  }
  _sliderOrthogonalPointerPosition(e) {
    return e.pageY;
  }
  _updateScrollbarSize(e) {
    this.slider.setHeight(e);
  }
  writeScrollPosition(e, t) {
    e.scrollLeft = t;
  }
  updateOptions(e) {
    this.updateScrollbarSize(e.horizontal === 2 ? 0 : e.horizontalScrollbarSize), this._scrollbarState.setOppositeScrollbarSize(e.vertical === 2 ? 0 : e.verticalScrollbarSize), this._visibilityController.setVisibility(e.horizontal), this._scrollByPage = e.scrollByPage;
  }
}, zv = class extends kf {
  constructor(e, t, r) {
    let i = e.getScrollDimensions(), s = e.getCurrentScrollPosition();
    if (super({ lazyRender: t.lazyRender, host: r, scrollbarState: new Bf(t.verticalHasArrows ? t.arrowSize : 0, t.vertical === 2 ? 0 : t.verticalScrollbarSize, 0, i.height, i.scrollHeight, s.scrollTop), visibility: t.vertical, extraScrollbarClassName: "vertical", scrollable: e, scrollByPage: t.scrollByPage }), t.verticalHasArrows) throw new Error("horizontalHasArrows is not supported in xterm.js");
    this._createSlider(0, Math.floor((t.verticalScrollbarSize - t.verticalSliderSize) / 2), t.verticalSliderSize, void 0);
  }
  _updateSlider(e, t) {
    this.slider.setHeight(e), this.slider.setTop(t);
  }
  _renderDomNode(e, t) {
    this.domNode.setWidth(t), this.domNode.setHeight(e), this.domNode.setRight(0), this.domNode.setTop(0);
  }
  onDidScroll(e) {
    return this._shouldRender = this._onElementScrollSize(e.scrollHeight) || this._shouldRender, this._shouldRender = this._onElementScrollPosition(e.scrollTop) || this._shouldRender, this._shouldRender = this._onElementSize(e.height) || this._shouldRender, this._shouldRender;
  }
  _pointerDownRelativePosition(e, t) {
    return t;
  }
  _sliderPointerPosition(e) {
    return e.pageY;
  }
  _sliderOrthogonalPointerPosition(e) {
    return e.pageX;
  }
  _updateScrollbarSize(e) {
    this.slider.setWidth(e);
  }
  writeScrollPosition(e, t) {
    e.scrollTop = t;
  }
  updateOptions(e) {
    this.updateScrollbarSize(e.vertical === 2 ? 0 : e.verticalScrollbarSize), this._scrollbarState.setOppositeScrollbarSize(0), this._visibilityController.setVisibility(e.vertical), this._scrollByPage = e.scrollByPage;
  }
}, qv = 500, mc = 50, jv = class {
  constructor(e, t, r) {
    this.timestamp = e, this.deltaX = t, this.deltaY = r, this.score = 0;
  }
}, Yo = class {
  constructor() {
    this._capacity = 5, this._memory = [], this._front = -1, this._rear = -1;
  }
  isPhysicalMouseWheel() {
    if (this._front === -1 && this._rear === -1) return !1;
    let t = 1, r = 0, i = 1, s = this._rear;
    do {
      let n = s === this._front ? t : Math.pow(2, -i);
      if (t -= n, r += this._memory[s].score * n, s === this._front) break;
      s = (this._capacity + s - 1) % this._capacity, i++;
    } while (!0);
    return r <= 0.5;
  }
  acceptStandardWheelEvent(t) {
    if (Na) {
      let r = xt(t.browserEvent), i = tv(r);
      this.accept(Date.now(), t.deltaX * i, t.deltaY * i);
    } else this.accept(Date.now(), t.deltaX, t.deltaY);
  }
  accept(t, r, i) {
    let s = null, n = new jv(t, r, i);
    this._front === -1 && this._rear === -1 ? (this._memory[0] = n, this._front = 0, this._rear = 0) : (s = this._memory[this._rear], this._rear = (this._rear + 1) % this._capacity, this._rear === this._front && (this._front = (this._front + 1) % this._capacity), this._memory[this._rear] = n), n.score = this._computeScore(n, s);
  }
  _computeScore(t, r) {
    if (Math.abs(t.deltaX) > 0 && Math.abs(t.deltaY) > 0) return 1;
    let i = 0.5;
    if ((!this._isAlmostInt(t.deltaX) || !this._isAlmostInt(t.deltaY)) && (i += 0.25), r) {
      let s = Math.abs(t.deltaX), n = Math.abs(t.deltaY), o = Math.abs(r.deltaX), a = Math.abs(r.deltaY), h = Math.max(Math.min(s, o), 1), l = Math.max(Math.min(n, a), 1), c = Math.max(s, o), u = Math.max(n, a);
      c % h === 0 && u % l === 0 && (i -= 0.5);
    }
    return Math.min(Math.max(i, 0), 1);
  }
  _isAlmostInt(t) {
    return Math.abs(Math.round(t) - t) < 0.01;
  }
};
Yo.INSTANCE = new Yo();
var $v = Yo, Kv = class extends Wa {
  constructor(e, t, r) {
    super(), this._onScroll = this._register(new Q()), this.onScroll = this._onScroll.event, this._onWillScroll = this._register(new Q()), this.onWillScroll = this._onWillScroll.event, this._options = Gv(t), this._scrollable = r, this._register(this._scrollable.onScroll((s) => {
      this._onWillScroll.fire(s), this._onDidScroll(s), this._onScroll.fire(s);
    }));
    let i = { onMouseWheel: (s) => this._onMouseWheel(s), onDragStart: () => this._onDragStart(), onDragEnd: () => this._onDragEnd() };
    this._verticalScrollbar = this._register(new zv(this._scrollable, this._options, i)), this._horizontalScrollbar = this._register(new Wv(this._scrollable, this._options, i)), this._domNode = document.createElement("div"), this._domNode.className = "xterm-scrollable-element " + this._options.className, this._domNode.setAttribute("role", "presentation"), this._domNode.style.position = "relative", this._domNode.appendChild(e), this._domNode.appendChild(this._horizontalScrollbar.domNode.domNode), this._domNode.appendChild(this._verticalScrollbar.domNode.domNode), this._options.useShadows ? (this._leftShadowDomNode = Jr(document.createElement("div")), this._leftShadowDomNode.setClassName("shadow"), this._domNode.appendChild(this._leftShadowDomNode.domNode), this._topShadowDomNode = Jr(document.createElement("div")), this._topShadowDomNode.setClassName("shadow"), this._domNode.appendChild(this._topShadowDomNode.domNode), this._topLeftShadowDomNode = Jr(document.createElement("div")), this._topLeftShadowDomNode.setClassName("shadow"), this._domNode.appendChild(this._topLeftShadowDomNode.domNode)) : (this._leftShadowDomNode = null, this._topShadowDomNode = null, this._topLeftShadowDomNode = null), this._listenOnDomNode = this._options.listenOnDomNode || this._domNode, this._mouseWheelToDispose = [], this._setListeningToMouseWheel(this._options.handleMouseWheel), this.onmouseover(this._listenOnDomNode, (s) => this._onMouseOver(s)), this.onmouseleave(this._listenOnDomNode, (s) => this._onMouseLeave(s)), this._hideTimeout = this._register(new Ua()), this._isDragging = !1, this._mouseIsOver = !1, this._shouldRender = !0, this._revealOnScroll = !0;
  }
  get options() {
    return this._options;
  }
  dispose() {
    this._mouseWheelToDispose = pr(this._mouseWheelToDispose), super.dispose();
  }
  getDomNode() {
    return this._domNode;
  }
  getOverviewRulerLayoutInfo() {
    return { parent: this._domNode, insertBefore: this._verticalScrollbar.domNode.domNode };
  }
  delegateVerticalScrollbarPointerDown(e) {
    this._verticalScrollbar.delegatePointerDown(e);
  }
  getScrollDimensions() {
    return this._scrollable.getScrollDimensions();
  }
  setScrollDimensions(e) {
    this._scrollable.setScrollDimensions(e, !1);
  }
  updateClassName(e) {
    this._options.className = e, Bt && (this._options.className += " mac"), this._domNode.className = "xterm-scrollable-element " + this._options.className;
  }
  updateOptions(e) {
    typeof e.handleMouseWheel < "u" && (this._options.handleMouseWheel = e.handleMouseWheel, this._setListeningToMouseWheel(this._options.handleMouseWheel)), typeof e.mouseWheelScrollSensitivity < "u" && (this._options.mouseWheelScrollSensitivity = e.mouseWheelScrollSensitivity), typeof e.fastScrollSensitivity < "u" && (this._options.fastScrollSensitivity = e.fastScrollSensitivity), typeof e.scrollPredominantAxis < "u" && (this._options.scrollPredominantAxis = e.scrollPredominantAxis), typeof e.horizontal < "u" && (this._options.horizontal = e.horizontal), typeof e.vertical < "u" && (this._options.vertical = e.vertical), typeof e.horizontalScrollbarSize < "u" && (this._options.horizontalScrollbarSize = e.horizontalScrollbarSize), typeof e.verticalScrollbarSize < "u" && (this._options.verticalScrollbarSize = e.verticalScrollbarSize), typeof e.scrollByPage < "u" && (this._options.scrollByPage = e.scrollByPage), this._horizontalScrollbar.updateOptions(this._options), this._verticalScrollbar.updateOptions(this._options), this._options.lazyRender || this._render();
  }
  setRevealOnScroll(e) {
    this._revealOnScroll = e;
  }
  delegateScrollFromMouseWheelEvent(e) {
    this._onMouseWheel(new uc(e));
  }
  _setListeningToMouseWheel(e) {
    if (this._mouseWheelToDispose.length > 0 !== e && (this._mouseWheelToDispose = pr(this._mouseWheelToDispose), e)) {
      let t = (r) => {
        this._onMouseWheel(new uc(r));
      };
      this._mouseWheelToDispose.push(he(this._listenOnDomNode, Fe.MOUSE_WHEEL, t, { passive: !1 }));
    }
  }
  _onMouseWheel(e) {
    var s;
    if ((s = e.browserEvent) != null && s.defaultPrevented) return;
    let t = $v.INSTANCE;
    t.acceptStandardWheelEvent(e);
    let r = !1;
    if (e.deltaY || e.deltaX) {
      let n = e.deltaY * this._options.mouseWheelScrollSensitivity, o = e.deltaX * this._options.mouseWheelScrollSensitivity;
      this._options.scrollPredominantAxis && (this._options.scrollYToX && o + n === 0 ? o = n = 0 : Math.abs(n) >= Math.abs(o) ? o = 0 : n = 0), this._options.flipAxes && ([n, o] = [o, n]);
      let a = !Bt && e.browserEvent && e.browserEvent.shiftKey;
      (this._options.scrollYToX || a) && !o && (o = n, n = 0), e.browserEvent && e.browserEvent.altKey && (o = o * this._options.fastScrollSensitivity, n = n * this._options.fastScrollSensitivity);
      let h = this._scrollable.getFutureScrollPosition(), l = {};
      if (n) {
        let c = mc * n, u = h.scrollTop - (c < 0 ? Math.floor(c) : Math.ceil(c));
        this._verticalScrollbar.writeScrollPosition(l, u);
      }
      if (o) {
        let c = mc * o, u = h.scrollLeft - (c < 0 ? Math.floor(c) : Math.ceil(c));
        this._horizontalScrollbar.writeScrollPosition(l, u);
      }
      l = this._scrollable.validateScrollPosition(l), (h.scrollLeft !== l.scrollLeft || h.scrollTop !== l.scrollTop) && (this._options.mouseWheelSmoothScroll && t.isPhysicalMouseWheel() ? this._scrollable.setScrollPositionSmooth(l) : this._scrollable.setScrollPositionNow(l), r = !0);
    }
    let i = r;
    !i && this._options.alwaysConsumeMouseWheel && (i = !0), !i && this._options.consumeMouseWheelIfScrollbarIsNeeded && (this._verticalScrollbar.isNeeded() || this._horizontalScrollbar.isNeeded()) && (i = !0), i && (e.preventDefault(), e.stopPropagation());
  }
  _onDidScroll(e) {
    this._shouldRender = this._horizontalScrollbar.onDidScroll(e) || this._shouldRender, this._shouldRender = this._verticalScrollbar.onDidScroll(e) || this._shouldRender, this._options.useShadows && (this._shouldRender = !0), this._revealOnScroll && this._reveal(), this._options.lazyRender || this._render();
  }
  renderNow() {
    if (!this._options.lazyRender) throw new Error("Please use `lazyRender` together with `renderNow`!");
    this._render();
  }
  _render() {
    if (this._shouldRender && (this._shouldRender = !1, this._horizontalScrollbar.render(), this._verticalScrollbar.render(), this._options.useShadows)) {
      let e = this._scrollable.getCurrentScrollPosition(), t = e.scrollTop > 0, r = e.scrollLeft > 0, i = r ? " left" : "", s = t ? " top" : "", n = r || t ? " top-left-corner" : "";
      this._leftShadowDomNode.setClassName(`shadow${i}`), this._topShadowDomNode.setClassName(`shadow${s}`), this._topLeftShadowDomNode.setClassName(`shadow${n}${s}${i}`);
    }
  }
  _onDragStart() {
    this._isDragging = !0, this._reveal();
  }
  _onDragEnd() {
    this._isDragging = !1, this._hide();
  }
  _onMouseLeave(e) {
    this._mouseIsOver = !1, this._hide();
  }
  _onMouseOver(e) {
    this._mouseIsOver = !0, this._reveal();
  }
  _reveal() {
    this._verticalScrollbar.beginReveal(), this._horizontalScrollbar.beginReveal(), this._scheduleHide();
  }
  _hide() {
    !this._mouseIsOver && !this._isDragging && (this._verticalScrollbar.beginHide(), this._horizontalScrollbar.beginHide());
  }
  _scheduleHide() {
    !this._mouseIsOver && !this._isDragging && this._hideTimeout.cancelAndSet(() => this._hide(), qv);
  }
}, Vv = class extends Kv {
  constructor(e, t, r) {
    super(e, t, r);
  }
  setScrollPosition(e) {
    e.reuseAnimation ? this._scrollable.setScrollPositionSmooth(e, e.reuseAnimation) : this._scrollable.setScrollPositionNow(e);
  }
  getScrollPosition() {
    return this._scrollable.getCurrentScrollPosition();
  }
};
function Gv(e) {
  let t = { lazyRender: typeof e.lazyRender < "u" ? e.lazyRender : !1, className: typeof e.className < "u" ? e.className : "", useShadows: typeof e.useShadows < "u" ? e.useShadows : !0, handleMouseWheel: typeof e.handleMouseWheel < "u" ? e.handleMouseWheel : !0, flipAxes: typeof e.flipAxes < "u" ? e.flipAxes : !1, consumeMouseWheelIfScrollbarIsNeeded: typeof e.consumeMouseWheelIfScrollbarIsNeeded < "u" ? e.consumeMouseWheelIfScrollbarIsNeeded : !1, alwaysConsumeMouseWheel: typeof e.alwaysConsumeMouseWheel < "u" ? e.alwaysConsumeMouseWheel : !1, scrollYToX: typeof e.scrollYToX < "u" ? e.scrollYToX : !1, mouseWheelScrollSensitivity: typeof e.mouseWheelScrollSensitivity < "u" ? e.mouseWheelScrollSensitivity : 1, fastScrollSensitivity: typeof e.fastScrollSensitivity < "u" ? e.fastScrollSensitivity : 5, scrollPredominantAxis: typeof e.scrollPredominantAxis < "u" ? e.scrollPredominantAxis : !0, mouseWheelSmoothScroll: typeof e.mouseWheelSmoothScroll < "u" ? e.mouseWheelSmoothScroll : !0, arrowSize: typeof e.arrowSize < "u" ? e.arrowSize : 11, listenOnDomNode: typeof e.listenOnDomNode < "u" ? e.listenOnDomNode : null, horizontal: typeof e.horizontal < "u" ? e.horizontal : 1, horizontalScrollbarSize: typeof e.horizontalScrollbarSize < "u" ? e.horizontalScrollbarSize : 10, horizontalSliderSize: typeof e.horizontalSliderSize < "u" ? e.horizontalSliderSize : 0, horizontalHasArrows: typeof e.horizontalHasArrows < "u" ? e.horizontalHasArrows : !1, vertical: typeof e.vertical < "u" ? e.vertical : 1, verticalScrollbarSize: typeof e.verticalScrollbarSize < "u" ? e.verticalScrollbarSize : 10, verticalHasArrows: typeof e.verticalHasArrows < "u" ? e.verticalHasArrows : !1, verticalSliderSize: typeof e.verticalSliderSize < "u" ? e.verticalSliderSize : 0, scrollByPage: typeof e.scrollByPage < "u" ? e.scrollByPage : !1 };
  return t.horizontalSliderSize = typeof e.horizontalSliderSize < "u" ? e.horizontalSliderSize : t.horizontalScrollbarSize, t.verticalSliderSize = typeof e.verticalSliderSize < "u" ? e.verticalSliderSize : t.verticalScrollbarSize, Bt && (t.className += " mac"), t;
}
var Xo = class extends de {
  constructor(e, t, r, i, s, n, o, a) {
    super(), this._bufferService = r, this._optionsService = o, this._renderService = a, this._onRequestScrollLines = this._register(new Q()), this.onRequestScrollLines = this._onRequestScrollLines.event, this._isSyncing = !1, this._isHandlingScroll = !1, this._suppressOnScrollHandler = !1;
    let h = this._register(new Ov({ forceIntegerValues: !1, smoothScrollDuration: this._optionsService.rawOptions.smoothScrollDuration, scheduleAtNextAnimationFrame: (l) => Ha(i.window, l) }));
    this._register(this._optionsService.onSpecificOptionChange("smoothScrollDuration", () => {
      h.setSmoothScrollDuration(this._optionsService.rawOptions.smoothScrollDuration);
    })), this._scrollableElement = this._register(new Vv(t, { vertical: 1, horizontal: 2, useShadows: !1, mouseWheelSmoothScroll: !0, ...this._getChangeOptions() }, h)), this._register(this._optionsService.onMultipleOptionChange(["scrollSensitivity", "fastScrollSensitivity", "overviewRuler"], () => this._scrollableElement.updateOptions(this._getChangeOptions()))), this._register(s.onProtocolChange((l) => {
      this._scrollableElement.updateOptions({ handleMouseWheel: !(l & 16) });
    })), this._scrollableElement.setScrollDimensions({ height: 0, scrollHeight: 0 }), this._register(je.runAndSubscribe(n.onChangeColors, () => {
      this._scrollableElement.getDomNode().style.backgroundColor = n.colors.background.css;
    })), e.appendChild(this._scrollableElement.getDomNode()), this._register(Se(() => this._scrollableElement.getDomNode().remove())), this._styleElement = i.mainDocument.createElement("style"), t.appendChild(this._styleElement), this._register(Se(() => this._styleElement.remove())), this._register(je.runAndSubscribe(n.onChangeColors, () => {
      this._styleElement.textContent = [".xterm .xterm-scrollable-element > .scrollbar > .slider {", `  background: ${n.colors.scrollbarSliderBackground.css};`, "}", ".xterm .xterm-scrollable-element > .scrollbar > .slider:hover {", `  background: ${n.colors.scrollbarSliderHoverBackground.css};`, "}", ".xterm .xterm-scrollable-element > .scrollbar > .slider.active {", `  background: ${n.colors.scrollbarSliderActiveBackground.css};`, "}"].join(`
`);
    })), this._register(this._bufferService.onResize(() => this.queueSync())), this._register(this._bufferService.buffers.onBufferActivate(() => {
      this._latestYDisp = void 0, this.queueSync();
    })), this._register(this._bufferService.onScroll(() => this._sync())), this._register(this._scrollableElement.onScroll((l) => this._handleScroll(l)));
  }
  scrollLines(e) {
    let t = this._scrollableElement.getScrollPosition();
    this._scrollableElement.setScrollPosition({ reuseAnimation: !0, scrollTop: t.scrollTop + e * this._renderService.dimensions.css.cell.height });
  }
  scrollToLine(e, t) {
    t && (this._latestYDisp = e), this._scrollableElement.setScrollPosition({ reuseAnimation: !t, scrollTop: e * this._renderService.dimensions.css.cell.height });
  }
  _getChangeOptions() {
    var e;
    return { mouseWheelScrollSensitivity: this._optionsService.rawOptions.scrollSensitivity, fastScrollSensitivity: this._optionsService.rawOptions.fastScrollSensitivity, verticalScrollbarSize: ((e = this._optionsService.rawOptions.overviewRuler) == null ? void 0 : e.width) || 14 };
  }
  queueSync(e) {
    e !== void 0 && (this._latestYDisp = e), this._queuedAnimationFrame === void 0 && (this._queuedAnimationFrame = this._renderService.addRefreshCallback(() => {
      this._queuedAnimationFrame = void 0, this._sync(this._latestYDisp);
    }));
  }
  _sync(e = this._bufferService.buffer.ydisp) {
    !this._renderService || this._isSyncing || (this._isSyncing = !0, this._suppressOnScrollHandler = !0, this._scrollableElement.setScrollDimensions({ height: this._renderService.dimensions.css.canvas.height, scrollHeight: this._renderService.dimensions.css.cell.height * this._bufferService.buffer.lines.length }), this._suppressOnScrollHandler = !1, e !== this._latestYDisp && this._scrollableElement.setScrollPosition({ scrollTop: e * this._renderService.dimensions.css.cell.height }), this._isSyncing = !1);
  }
  _handleScroll(e) {
    if (!this._renderService || this._isHandlingScroll || this._suppressOnScrollHandler) return;
    this._isHandlingScroll = !0;
    let t = Math.round(e.scrollTop / this._renderService.dimensions.css.cell.height), r = t - this._bufferService.buffer.ydisp;
    r !== 0 && (this._latestYDisp = t, this._onRequestScrollLines.fire(r)), this._isHandlingScroll = !1;
  }
};
Xo = Ae([re(2, Ye), re(3, zt), re(4, af), re(5, Ir), re(6, Xe), re(7, qt)], Xo);
var Jo = class extends de {
  constructor(e, t, r, i, s) {
    super(), this._screenElement = e, this._bufferService = t, this._coreBrowserService = r, this._decorationService = i, this._renderService = s, this._decorationElements = /* @__PURE__ */ new Map(), this._altBufferIsActive = !1, this._dimensionsChanged = !1, this._container = document.createElement("div"), this._container.classList.add("xterm-decoration-container"), this._screenElement.appendChild(this._container), this._register(this._renderService.onRenderedViewportChange(() => this._doRefreshDecorations())), this._register(this._renderService.onDimensionsChange(() => {
      this._dimensionsChanged = !0, this._queueRefresh();
    })), this._register(this._coreBrowserService.onDprChange(() => this._queueRefresh())), this._register(this._bufferService.buffers.onBufferActivate(() => {
      this._altBufferIsActive = this._bufferService.buffer === this._bufferService.buffers.alt;
    })), this._register(this._decorationService.onDecorationRegistered(() => this._queueRefresh())), this._register(this._decorationService.onDecorationRemoved((n) => this._removeDecoration(n))), this._register(Se(() => {
      this._container.remove(), this._decorationElements.clear();
    }));
  }
  _queueRefresh() {
    this._animationFrame === void 0 && (this._animationFrame = this._renderService.addRefreshCallback(() => {
      this._doRefreshDecorations(), this._animationFrame = void 0;
    }));
  }
  _doRefreshDecorations() {
    for (let e of this._decorationService.decorations) this._renderDecoration(e);
    this._dimensionsChanged = !1;
  }
  _renderDecoration(e) {
    this._refreshStyle(e), this._dimensionsChanged && this._refreshXPosition(e);
  }
  _createElement(e) {
    var i;
    let t = this._coreBrowserService.mainDocument.createElement("div");
    t.classList.add("xterm-decoration"), t.classList.toggle("xterm-decoration-top-layer", ((i = e == null ? void 0 : e.options) == null ? void 0 : i.layer) === "top"), t.style.width = `${Math.round((e.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, t.style.height = `${(e.options.height || 1) * this._renderService.dimensions.css.cell.height}px`, t.style.top = `${(e.marker.line - this._bufferService.buffers.active.ydisp) * this._renderService.dimensions.css.cell.height}px`, t.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`;
    let r = e.options.x ?? 0;
    return r && r > this._bufferService.cols && (t.style.display = "none"), this._refreshXPosition(e, t), t;
  }
  _refreshStyle(e) {
    let t = e.marker.line - this._bufferService.buffers.active.ydisp;
    if (t < 0 || t >= this._bufferService.rows) e.element && (e.element.style.display = "none", e.onRenderEmitter.fire(e.element));
    else {
      let r = this._decorationElements.get(e);
      r || (r = this._createElement(e), e.element = r, this._decorationElements.set(e, r), this._container.appendChild(r), e.onDispose(() => {
        this._decorationElements.delete(e), r.remove();
      })), r.style.display = this._altBufferIsActive ? "none" : "block", this._altBufferIsActive || (r.style.width = `${Math.round((e.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, r.style.height = `${(e.options.height || 1) * this._renderService.dimensions.css.cell.height}px`, r.style.top = `${t * this._renderService.dimensions.css.cell.height}px`, r.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`), e.onRenderEmitter.fire(r);
    }
  }
  _refreshXPosition(e, t = e.element) {
    if (!t) return;
    let r = e.options.x ?? 0;
    (e.options.anchor || "left") === "right" ? t.style.right = r ? `${r * this._renderService.dimensions.css.cell.width}px` : "" : t.style.left = r ? `${r * this._renderService.dimensions.css.cell.width}px` : "";
  }
  _removeDecoration(e) {
    var t;
    (t = this._decorationElements.get(e)) == null || t.remove(), this._decorationElements.delete(e), e.dispose();
  }
};
Jo = Ae([re(1, Ye), re(2, zt), re(3, ai), re(4, qt)], Jo);
var Yv = class {
  constructor() {
    this._zones = [], this._zonePool = [], this._zonePoolIndex = 0, this._linePadding = { full: 0, left: 0, center: 0, right: 0 };
  }
  get zones() {
    return this._zonePool.length = Math.min(this._zonePool.length, this._zones.length), this._zones;
  }
  clear() {
    this._zones.length = 0, this._zonePoolIndex = 0;
  }
  addDecoration(e) {
    if (e.options.overviewRulerOptions) {
      for (let t of this._zones) if (t.color === e.options.overviewRulerOptions.color && t.position === e.options.overviewRulerOptions.position) {
        if (this._lineIntersectsZone(t, e.marker.line)) return;
        if (this._lineAdjacentToZone(t, e.marker.line, e.options.overviewRulerOptions.position)) {
          this._addLineToZone(t, e.marker.line);
          return;
        }
      }
      if (this._zonePoolIndex < this._zonePool.length) {
        this._zonePool[this._zonePoolIndex].color = e.options.overviewRulerOptions.color, this._zonePool[this._zonePoolIndex].position = e.options.overviewRulerOptions.position, this._zonePool[this._zonePoolIndex].startBufferLine = e.marker.line, this._zonePool[this._zonePoolIndex].endBufferLine = e.marker.line, this._zones.push(this._zonePool[this._zonePoolIndex++]);
        return;
      }
      this._zones.push({ color: e.options.overviewRulerOptions.color, position: e.options.overviewRulerOptions.position, startBufferLine: e.marker.line, endBufferLine: e.marker.line }), this._zonePool.push(this._zones[this._zones.length - 1]), this._zonePoolIndex++;
    }
  }
  setPadding(e) {
    this._linePadding = e;
  }
  _lineIntersectsZone(e, t) {
    return t >= e.startBufferLine && t <= e.endBufferLine;
  }
  _lineAdjacentToZone(e, t, r) {
    return t >= e.startBufferLine - this._linePadding[r || "full"] && t <= e.endBufferLine + this._linePadding[r || "full"];
  }
  _addLineToZone(e, t) {
    e.startBufferLine = Math.min(e.startBufferLine, t), e.endBufferLine = Math.max(e.endBufferLine, t);
  }
}, vt = { full: 0, left: 0, center: 0, right: 0 }, Xt = { full: 0, left: 0, center: 0, right: 0 }, Ur = { full: 0, left: 0, center: 0, right: 0 }, is = class extends de {
  constructor(e, t, r, i, s, n, o, a) {
    var l;
    super(), this._viewportElement = e, this._screenElement = t, this._bufferService = r, this._decorationService = i, this._renderService = s, this._optionsService = n, this._themeService = o, this._coreBrowserService = a, this._colorZoneStore = new Yv(), this._shouldUpdateDimensions = !0, this._shouldUpdateAnchor = !0, this._lastKnownBufferLength = 0, this._canvas = this._coreBrowserService.mainDocument.createElement("canvas"), this._canvas.classList.add("xterm-decoration-overview-ruler"), this._refreshCanvasDimensions(), (l = this._viewportElement.parentElement) == null || l.insertBefore(this._canvas, this._viewportElement), this._register(Se(() => {
      var c;
      return (c = this._canvas) == null ? void 0 : c.remove();
    }));
    let h = this._canvas.getContext("2d");
    if (h) this._ctx = h;
    else throw new Error("Ctx cannot be null");
    this._register(this._decorationService.onDecorationRegistered(() => this._queueRefresh(void 0, !0))), this._register(this._decorationService.onDecorationRemoved(() => this._queueRefresh(void 0, !0))), this._register(this._renderService.onRenderedViewportChange(() => this._queueRefresh())), this._register(this._bufferService.buffers.onBufferActivate(() => {
      this._canvas.style.display = this._bufferService.buffer === this._bufferService.buffers.alt ? "none" : "block";
    })), this._register(this._bufferService.onScroll(() => {
      this._lastKnownBufferLength !== this._bufferService.buffers.normal.lines.length && (this._refreshDrawHeightConstants(), this._refreshColorZonePadding());
    })), this._register(this._renderService.onRender(() => {
      (!this._containerHeight || this._containerHeight !== this._screenElement.clientHeight) && (this._queueRefresh(!0), this._containerHeight = this._screenElement.clientHeight);
    })), this._register(this._coreBrowserService.onDprChange(() => this._queueRefresh(!0))), this._register(this._optionsService.onSpecificOptionChange("overviewRuler", () => this._queueRefresh(!0))), this._register(this._themeService.onChangeColors(() => this._queueRefresh())), this._queueRefresh(!0);
  }
  get _width() {
    var e;
    return ((e = this._optionsService.options.overviewRuler) == null ? void 0 : e.width) || 0;
  }
  _refreshDrawConstants() {
    let e = Math.floor((this._canvas.width - 1) / 3), t = Math.ceil((this._canvas.width - 1) / 3);
    Xt.full = this._canvas.width, Xt.left = e, Xt.center = t, Xt.right = e, this._refreshDrawHeightConstants(), Ur.full = 1, Ur.left = 1, Ur.center = 1 + Xt.left, Ur.right = 1 + Xt.left + Xt.center;
  }
  _refreshDrawHeightConstants() {
    vt.full = Math.round(2 * this._coreBrowserService.dpr);
    let e = this._canvas.height / this._bufferService.buffer.lines.length, t = Math.round(Math.max(Math.min(e, 12), 6) * this._coreBrowserService.dpr);
    vt.left = t, vt.center = t, vt.right = t;
  }
  _refreshColorZonePadding() {
    this._colorZoneStore.setPadding({ full: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * vt.full), left: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * vt.left), center: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * vt.center), right: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * vt.right) }), this._lastKnownBufferLength = this._bufferService.buffers.normal.lines.length;
  }
  _refreshCanvasDimensions() {
    this._canvas.style.width = `${this._width}px`, this._canvas.width = Math.round(this._width * this._coreBrowserService.dpr), this._canvas.style.height = `${this._screenElement.clientHeight}px`, this._canvas.height = Math.round(this._screenElement.clientHeight * this._coreBrowserService.dpr), this._refreshDrawConstants(), this._refreshColorZonePadding();
  }
  _refreshDecorations() {
    this._shouldUpdateDimensions && this._refreshCanvasDimensions(), this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height), this._colorZoneStore.clear();
    for (let t of this._decorationService.decorations) this._colorZoneStore.addDecoration(t);
    this._ctx.lineWidth = 1, this._renderRulerOutline();
    let e = this._colorZoneStore.zones;
    for (let t of e) t.position !== "full" && this._renderColorZone(t);
    for (let t of e) t.position === "full" && this._renderColorZone(t);
    this._shouldUpdateDimensions = !1, this._shouldUpdateAnchor = !1;
  }
  _renderRulerOutline() {
    this._ctx.fillStyle = this._themeService.colors.overviewRulerBorder.css, this._ctx.fillRect(0, 0, 1, this._canvas.height), this._optionsService.rawOptions.overviewRuler.showTopBorder && this._ctx.fillRect(1, 0, this._canvas.width - 1, 1), this._optionsService.rawOptions.overviewRuler.showBottomBorder && this._ctx.fillRect(1, this._canvas.height - 1, this._canvas.width - 1, this._canvas.height);
  }
  _renderColorZone(e) {
    this._ctx.fillStyle = e.color, this._ctx.fillRect(Ur[e.position || "full"], Math.round((this._canvas.height - 1) * (e.startBufferLine / this._bufferService.buffers.active.lines.length) - vt[e.position || "full"] / 2), Xt[e.position || "full"], Math.round((this._canvas.height - 1) * ((e.endBufferLine - e.startBufferLine) / this._bufferService.buffers.active.lines.length) + vt[e.position || "full"]));
  }
  _queueRefresh(e, t) {
    this._shouldUpdateDimensions = e || this._shouldUpdateDimensions, this._shouldUpdateAnchor = t || this._shouldUpdateAnchor, this._animationFrame === void 0 && (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
      this._refreshDecorations(), this._animationFrame = void 0;
    }));
  }
};
is = Ae([re(2, Ye), re(3, ai), re(4, qt), re(5, Xe), re(6, Ir), re(7, zt)], is);
var q;
((e) => (e.NUL = "\0", e.SOH = "", e.STX = "", e.ETX = "", e.EOT = "", e.ENQ = "", e.ACK = "", e.BEL = "\x07", e.BS = "\b", e.HT = "	", e.LF = `
`, e.VT = "\v", e.FF = "\f", e.CR = "\r", e.SO = "", e.SI = "", e.DLE = "", e.DC1 = "", e.DC2 = "", e.DC3 = "", e.DC4 = "", e.NAK = "", e.SYN = "", e.ETB = "", e.CAN = "", e.EM = "", e.SUB = "", e.ESC = "\x1B", e.FS = "", e.GS = "", e.RS = "", e.US = "", e.SP = " ", e.DEL = ""))(q || (q = {}));
var ji;
((e) => (e.PAD = "", e.HOP = "", e.BPH = "", e.NBH = "", e.IND = "", e.NEL = "", e.SSA = "", e.ESA = "", e.HTS = "", e.HTJ = "", e.VTS = "", e.PLD = "", e.PLU = "", e.RI = "", e.SS2 = "", e.SS3 = "", e.DCS = "", e.PU1 = "", e.PU2 = "", e.STS = "", e.CCH = "", e.MW = "", e.SPA = "", e.EPA = "", e.SOS = "", e.SGCI = "", e.SCI = "", e.CSI = "", e.ST = "", e.OSC = "", e.PM = "", e.APC = ""))(ji || (ji = {}));
var Rf;
((e) => e.ST = `${q.ESC}\\`)(Rf || (Rf = {}));
var Zo = class {
  constructor(e, t, r, i, s, n) {
    this._textarea = e, this._compositionView = t, this._bufferService = r, this._optionsService = i, this._coreService = s, this._renderService = n, this._isComposing = !1, this._isSendingComposition = !1, this._compositionPosition = { start: 0, end: 0 }, this._dataAlreadySent = "";
  }
  get isComposing() {
    return this._isComposing;
  }
  compositionstart() {
    this._isComposing = !0, this._compositionPosition.start = this._textarea.value.length, this._compositionView.textContent = "", this._dataAlreadySent = "", this._compositionView.classList.add("active");
  }
  compositionupdate(e) {
    this._compositionView.textContent = e.data, this.updateCompositionElements(), setTimeout(() => {
      this._compositionPosition.end = this._textarea.value.length;
    }, 0);
  }
  compositionend() {
    this._finalizeComposition(!0);
  }
  keydown(e) {
    if (this._isComposing || this._isSendingComposition) {
      if (e.keyCode === 20 || e.keyCode === 229 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18) return !1;
      this._finalizeComposition(!1);
    }
    return e.keyCode === 229 ? (this._handleAnyTextareaChanges(), !1) : !0;
  }
  _finalizeComposition(e) {
    if (this._compositionView.classList.remove("active"), this._isComposing = !1, e) {
      let t = { start: this._compositionPosition.start, end: this._compositionPosition.end };
      this._isSendingComposition = !0, setTimeout(() => {
        if (this._isSendingComposition) {
          this._isSendingComposition = !1;
          let r;
          t.start += this._dataAlreadySent.length, this._isComposing ? r = this._textarea.value.substring(t.start, this._compositionPosition.start) : r = this._textarea.value.substring(t.start), r.length > 0 && this._coreService.triggerDataEvent(r, !0);
        }
      }, 0);
    } else {
      this._isSendingComposition = !1;
      let t = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
      this._coreService.triggerDataEvent(t, !0);
    }
  }
  _handleAnyTextareaChanges() {
    let e = this._textarea.value;
    setTimeout(() => {
      if (!this._isComposing) {
        let t = this._textarea.value, r = t.replace(e, "");
        this._dataAlreadySent = r, t.length > e.length ? this._coreService.triggerDataEvent(r, !0) : t.length < e.length ? this._coreService.triggerDataEvent(`${q.DEL}`, !0) : t.length === e.length && t !== e && this._coreService.triggerDataEvent(t, !0);
      }
    }, 0);
  }
  updateCompositionElements(e) {
    if (this._isComposing) {
      if (this._bufferService.buffer.isCursorInViewport) {
        let t = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1), r = this._renderService.dimensions.css.cell.height, i = this._bufferService.buffer.y * this._renderService.dimensions.css.cell.height, s = t * this._renderService.dimensions.css.cell.width;
        this._compositionView.style.left = s + "px", this._compositionView.style.top = i + "px", this._compositionView.style.height = r + "px", this._compositionView.style.lineHeight = r + "px", this._compositionView.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._compositionView.style.fontSize = this._optionsService.rawOptions.fontSize + "px";
        let n = this._compositionView.getBoundingClientRect();
        this._textarea.style.left = s + "px", this._textarea.style.top = i + "px", this._textarea.style.width = Math.max(n.width, 1) + "px", this._textarea.style.height = Math.max(n.height, 1) + "px", this._textarea.style.lineHeight = n.height + "px";
      }
      e || setTimeout(() => this.updateCompositionElements(!0), 0);
    }
  }
};
Zo = Ae([re(2, Ye), re(3, Xe), re(4, vr), re(5, qt)], Zo);
var Ue = 0, He = 0, We = 0, Re = 0, yc = { css: "#00000000", rgba: 0 }, Pe;
((e) => {
  function t(s, n, o, a) {
    return a !== void 0 ? `#${nr(s)}${nr(n)}${nr(o)}${nr(a)}` : `#${nr(s)}${nr(n)}${nr(o)}`;
  }
  e.toCss = t;
  function r(s, n, o, a = 255) {
    return (s << 24 | n << 16 | o << 8 | a) >>> 0;
  }
  e.toRgba = r;
  function i(s, n, o, a) {
    return { css: e.toCss(s, n, o, a), rgba: e.toRgba(s, n, o, a) };
  }
  e.toColor = i;
})(Pe || (Pe = {}));
var be;
((e) => {
  function t(h, l) {
    if (Re = (l.rgba & 255) / 255, Re === 1) return { css: l.css, rgba: l.rgba };
    let c = l.rgba >> 24 & 255, u = l.rgba >> 16 & 255, p = l.rgba >> 8 & 255, _ = h.rgba >> 24 & 255, m = h.rgba >> 16 & 255, g = h.rgba >> 8 & 255;
    Ue = _ + Math.round((c - _) * Re), He = m + Math.round((u - m) * Re), We = g + Math.round((p - g) * Re);
    let w = Pe.toCss(Ue, He, We), y = Pe.toRgba(Ue, He, We);
    return { css: w, rgba: y };
  }
  e.blend = t;
  function r(h) {
    return (h.rgba & 255) === 255;
  }
  e.isOpaque = r;
  function i(h, l, c) {
    let u = $i.ensureContrastRatio(h.rgba, l.rgba, c);
    if (u) return Pe.toColor(u >> 24 & 255, u >> 16 & 255, u >> 8 & 255);
  }
  e.ensureContrastRatio = i;
  function s(h) {
    let l = (h.rgba | 255) >>> 0;
    return [Ue, He, We] = $i.toChannels(l), { css: Pe.toCss(Ue, He, We), rgba: l };
  }
  e.opaque = s;
  function n(h, l) {
    return Re = Math.round(l * 255), [Ue, He, We] = $i.toChannels(h.rgba), { css: Pe.toCss(Ue, He, We, Re), rgba: Pe.toRgba(Ue, He, We, Re) };
  }
  e.opacity = n;
  function o(h, l) {
    return Re = h.rgba & 255, n(h, Re * l / 255);
  }
  e.multiplyOpacity = o;
  function a(h) {
    return [h.rgba >> 24 & 255, h.rgba >> 16 & 255, h.rgba >> 8 & 255];
  }
  e.toColorRGB = a;
})(be || (be = {}));
var xe;
((e) => {
  let t, r;
  try {
    let s = document.createElement("canvas");
    s.width = 1, s.height = 1;
    let n = s.getContext("2d", { willReadFrequently: !0 });
    n && (t = n, t.globalCompositeOperation = "copy", r = t.createLinearGradient(0, 0, 1, 1));
  } catch {
  }
  function i(s) {
    if (s.match(/#[\da-f]{3,8}/i)) switch (s.length) {
      case 4:
        return Ue = parseInt(s.slice(1, 2).repeat(2), 16), He = parseInt(s.slice(2, 3).repeat(2), 16), We = parseInt(s.slice(3, 4).repeat(2), 16), Pe.toColor(Ue, He, We);
      case 5:
        return Ue = parseInt(s.slice(1, 2).repeat(2), 16), He = parseInt(s.slice(2, 3).repeat(2), 16), We = parseInt(s.slice(3, 4).repeat(2), 16), Re = parseInt(s.slice(4, 5).repeat(2), 16), Pe.toColor(Ue, He, We, Re);
      case 7:
        return { css: s, rgba: (parseInt(s.slice(1), 16) << 8 | 255) >>> 0 };
      case 9:
        return { css: s, rgba: parseInt(s.slice(1), 16) >>> 0 };
    }
    let n = s.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
    if (n) return Ue = parseInt(n[1]), He = parseInt(n[2]), We = parseInt(n[3]), Re = Math.round((n[5] === void 0 ? 1 : parseFloat(n[5])) * 255), Pe.toColor(Ue, He, We, Re);
    if (!t || !r) throw new Error("css.toColor: Unsupported css format");
    if (t.fillStyle = r, t.fillStyle = s, typeof t.fillStyle != "string") throw new Error("css.toColor: Unsupported css format");
    if (t.fillRect(0, 0, 1, 1), [Ue, He, We, Re] = t.getImageData(0, 0, 1, 1).data, Re !== 255) throw new Error("css.toColor: Unsupported css format");
    return { rgba: Pe.toRgba(Ue, He, We, Re), css: s };
  }
  e.toColor = i;
})(xe || (xe = {}));
var Ge;
((e) => {
  function t(i) {
    return r(i >> 16 & 255, i >> 8 & 255, i & 255);
  }
  e.relativeLuminance = t;
  function r(i, s, n) {
    let o = i / 255, a = s / 255, h = n / 255, l = o <= 0.03928 ? o / 12.92 : Math.pow((o + 0.055) / 1.055, 2.4), c = a <= 0.03928 ? a / 12.92 : Math.pow((a + 0.055) / 1.055, 2.4), u = h <= 0.03928 ? h / 12.92 : Math.pow((h + 0.055) / 1.055, 2.4);
    return l * 0.2126 + c * 0.7152 + u * 0.0722;
  }
  e.relativeLuminance2 = r;
})(Ge || (Ge = {}));
var $i;
((e) => {
  function t(o, a) {
    if (Re = (a & 255) / 255, Re === 1) return a;
    let h = a >> 24 & 255, l = a >> 16 & 255, c = a >> 8 & 255, u = o >> 24 & 255, p = o >> 16 & 255, _ = o >> 8 & 255;
    return Ue = u + Math.round((h - u) * Re), He = p + Math.round((l - p) * Re), We = _ + Math.round((c - _) * Re), Pe.toRgba(Ue, He, We);
  }
  e.blend = t;
  function r(o, a, h) {
    let l = Ge.relativeLuminance(o >> 8), c = Ge.relativeLuminance(a >> 8);
    if (Pt(l, c) < h) {
      if (c < l) {
        let _ = i(o, a, h), m = Pt(l, Ge.relativeLuminance(_ >> 8));
        if (m < h) {
          let g = s(o, a, h), w = Pt(l, Ge.relativeLuminance(g >> 8));
          return m > w ? _ : g;
        }
        return _;
      }
      let u = s(o, a, h), p = Pt(l, Ge.relativeLuminance(u >> 8));
      if (p < h) {
        let _ = i(o, a, h), m = Pt(l, Ge.relativeLuminance(_ >> 8));
        return p > m ? u : _;
      }
      return u;
    }
  }
  e.ensureContrastRatio = r;
  function i(o, a, h) {
    let l = o >> 24 & 255, c = o >> 16 & 255, u = o >> 8 & 255, p = a >> 24 & 255, _ = a >> 16 & 255, m = a >> 8 & 255, g = Pt(Ge.relativeLuminance2(p, _, m), Ge.relativeLuminance2(l, c, u));
    for (; g < h && (p > 0 || _ > 0 || m > 0); ) p -= Math.max(0, Math.ceil(p * 0.1)), _ -= Math.max(0, Math.ceil(_ * 0.1)), m -= Math.max(0, Math.ceil(m * 0.1)), g = Pt(Ge.relativeLuminance2(p, _, m), Ge.relativeLuminance2(l, c, u));
    return (p << 24 | _ << 16 | m << 8 | 255) >>> 0;
  }
  e.reduceLuminance = i;
  function s(o, a, h) {
    let l = o >> 24 & 255, c = o >> 16 & 255, u = o >> 8 & 255, p = a >> 24 & 255, _ = a >> 16 & 255, m = a >> 8 & 255, g = Pt(Ge.relativeLuminance2(p, _, m), Ge.relativeLuminance2(l, c, u));
    for (; g < h && (p < 255 || _ < 255 || m < 255); ) p = Math.min(255, p + Math.ceil((255 - p) * 0.1)), _ = Math.min(255, _ + Math.ceil((255 - _) * 0.1)), m = Math.min(255, m + Math.ceil((255 - m) * 0.1)), g = Pt(Ge.relativeLuminance2(p, _, m), Ge.relativeLuminance2(l, c, u));
    return (p << 24 | _ << 16 | m << 8 | 255) >>> 0;
  }
  e.increaseLuminance = s;
  function n(o) {
    return [o >> 24 & 255, o >> 16 & 255, o >> 8 & 255, o & 255];
  }
  e.toChannels = n;
})($i || ($i = {}));
function nr(e) {
  let t = e.toString(16);
  return t.length < 2 ? "0" + t : t;
}
function Pt(e, t) {
  return e < t ? (t + 0.05) / (e + 0.05) : (e + 0.05) / (t + 0.05);
}
var Xv = class extends oi {
  constructor(e, t, r) {
    super(), this.content = 0, this.combinedData = "", this.fg = e.fg, this.bg = e.bg, this.combinedData = t, this._width = r;
  }
  isCombined() {
    return 2097152;
  }
  getWidth() {
    return this._width;
  }
  getChars() {
    return this.combinedData;
  }
  getCode() {
    return 2097151;
  }
  setFromCharData(e) {
    throw new Error("not implemented");
  }
  getAsCharData() {
    return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
  }
}, ss = class {
  constructor(e) {
    this._bufferService = e, this._characterJoiners = [], this._nextCharacterJoinerId = 0, this._workCell = new pt();
  }
  register(e) {
    let t = { id: this._nextCharacterJoinerId++, handler: e };
    return this._characterJoiners.push(t), t.id;
  }
  deregister(e) {
    for (let t = 0; t < this._characterJoiners.length; t++) if (this._characterJoiners[t].id === e) return this._characterJoiners.splice(t, 1), !0;
    return !1;
  }
  getJoinedCharacters(e) {
    if (this._characterJoiners.length === 0) return [];
    let t = this._bufferService.buffer.lines.get(e);
    if (!t || t.length === 0) return [];
    let r = [], i = t.translateToString(!0), s = 0, n = 0, o = 0, a = t.getFg(0), h = t.getBg(0);
    for (let l = 0; l < t.getTrimmedLength(); l++) if (t.loadCell(l, this._workCell), this._workCell.getWidth() !== 0) {
      if (this._workCell.fg !== a || this._workCell.bg !== h) {
        if (l - s > 1) {
          let c = this._getJoinedRanges(i, o, n, t, s);
          for (let u = 0; u < c.length; u++) r.push(c[u]);
        }
        s = l, o = n, a = this._workCell.fg, h = this._workCell.bg;
      }
      n += this._workCell.getChars().length || Qt.length;
    }
    if (this._bufferService.cols - s > 1) {
      let l = this._getJoinedRanges(i, o, n, t, s);
      for (let c = 0; c < l.length; c++) r.push(l[c]);
    }
    return r;
  }
  _getJoinedRanges(e, t, r, i, s) {
    let n = e.substring(t, r), o = [];
    try {
      o = this._characterJoiners[0].handler(n);
    } catch (a) {
      console.error(a);
    }
    for (let a = 1; a < this._characterJoiners.length; a++) try {
      let h = this._characterJoiners[a].handler(n);
      for (let l = 0; l < h.length; l++) ss._mergeRanges(o, h[l]);
    } catch (h) {
      console.error(h);
    }
    return this._stringRangesToCellRanges(o, i, s), o;
  }
  _stringRangesToCellRanges(e, t, r) {
    let i = 0, s = !1, n = 0, o = e[i];
    if (o) {
      for (let a = r; a < this._bufferService.cols; a++) {
        let h = t.getWidth(a), l = t.getString(a).length || Qt.length;
        if (h !== 0) {
          if (!s && o[0] <= n && (o[0] = a, s = !0), o[1] <= n) {
            if (o[1] = a, o = e[++i], !o) break;
            o[0] <= n ? (o[0] = a, s = !0) : s = !1;
          }
          n += l;
        }
      }
      o && (o[1] = this._bufferService.cols);
    }
  }
  static _mergeRanges(e, t) {
    let r = !1;
    for (let i = 0; i < e.length; i++) {
      let s = e[i];
      if (r) {
        if (t[1] <= s[0]) return e[i - 1][1] = t[1], e;
        if (t[1] <= s[1]) return e[i - 1][1] = Math.max(t[1], s[1]), e.splice(i, 1), e;
        e.splice(i, 1), i--;
      } else {
        if (t[1] <= s[0]) return e.splice(i, 0, t), e;
        if (t[1] <= s[1]) return s[0] = Math.min(t[0], s[0]), e;
        t[0] < s[1] && (s[0] = Math.min(t[0], s[0]), r = !0);
        continue;
      }
    }
    return r ? e[e.length - 1][1] = t[1] : e.push(t), e;
  }
};
ss = Ae([re(0, Ye)], ss);
function Jv(e) {
  return 57508 <= e && e <= 57558;
}
function Zv(e) {
  return 9472 <= e && e <= 9631;
}
function Qv(e) {
  return Jv(e) || Zv(e);
}
function e1() {
  return { css: { canvas: Di(), cell: Di() }, device: { canvas: Di(), cell: Di(), char: { width: 0, height: 0, left: 0, top: 0 } } };
}
function Di() {
  return { width: 0, height: 0 };
}
var Qo = class {
  constructor(e, t, r, i, s, n, o) {
    this._document = e, this._characterJoinerService = t, this._optionsService = r, this._coreBrowserService = i, this._coreService = s, this._decorationService = n, this._themeService = o, this._workCell = new pt(), this._columnSelectMode = !1, this.defaultSpacing = 0;
  }
  handleSelectionChanged(e, t, r) {
    this._selectionStart = e, this._selectionEnd = t, this._columnSelectMode = r;
  }
  createRow(e, t, r, i, s, n, o, a, h, l, c) {
    let u = [], p = this._characterJoinerService.getJoinedCharacters(t), _ = this._themeService.colors, m = e.getNoBgTrimmedLength();
    r && m < n + 1 && (m = n + 1);
    let g, w = 0, y = "", E = 0, S = 0, v = 0, k = 0, R = !1, O = 0, N = !1, W = 0, Z = 0, ie = [], K = l !== -1 && c !== -1;
    for (let H = 0; H < m; H++) {
      e.loadCell(H, this._workCell);
      let G = this._workCell.getWidth();
      if (G === 0) continue;
      let J = !1, ee = H >= Z, se = H, Y = this._workCell;
      if (p.length > 0 && H === p[0][0] && ee) {
        let P = p.shift(), X = this._isCellInSelection(P[0], t);
        for (E = P[0] + 1; E < P[1]; E++) ee && (ee = X === this._isCellInSelection(E, t));
        ee && (ee = !r || n < P[0] || n >= P[1]), ee ? (J = !0, Y = new Xv(this._workCell, e.translateToString(!0, P[0], P[1]), P[1] - P[0]), se = P[1] - 1, G = Y.getWidth()) : Z = P[1];
      }
      let ae = this._isCellInSelection(H, t), ve = r && H === n, Ce = K && H >= l && H <= c, L = !1;
      this._decorationService.forEachDecorationAtCell(H, t, void 0, (P) => {
        L = !0;
      });
      let I = Y.getChars() || Qt;
      if (I === " " && (Y.isUnderline() || Y.isOverline()) && (I = " "), W = G * a - h.get(I, Y.isBold(), Y.isItalic()), !g) g = this._document.createElement("span");
      else if (w && (ae && N || !ae && !N && Y.bg === S) && (ae && N && _.selectionForeground || Y.fg === v) && Y.extended.ext === k && Ce === R && W === O && !ve && !J && !L && ee) {
        Y.isInvisible() ? y += Qt : y += I, w++;
        continue;
      } else w && (g.textContent = y), g = this._document.createElement("span"), w = 0, y = "";
      if (S = Y.bg, v = Y.fg, k = Y.extended.ext, R = Ce, O = W, N = ae, J && n >= H && n <= se && (n = H), !this._coreService.isCursorHidden && ve && this._coreService.isCursorInitialized) {
        if (ie.push("xterm-cursor"), this._coreBrowserService.isFocused) o && ie.push("xterm-cursor-blink"), ie.push(i === "bar" ? "xterm-cursor-bar" : i === "underline" ? "xterm-cursor-underline" : "xterm-cursor-block");
        else if (s) switch (s) {
          case "outline":
            ie.push("xterm-cursor-outline");
            break;
          case "block":
            ie.push("xterm-cursor-block");
            break;
          case "bar":
            ie.push("xterm-cursor-bar");
            break;
          case "underline":
            ie.push("xterm-cursor-underline");
            break;
        }
      }
      if (Y.isBold() && ie.push("xterm-bold"), Y.isItalic() && ie.push("xterm-italic"), Y.isDim() && ie.push("xterm-dim"), Y.isInvisible() ? y = Qt : y = Y.getChars() || Qt, Y.isUnderline() && (ie.push(`xterm-underline-${Y.extended.underlineStyle}`), y === " " && (y = " "), !Y.isUnderlineColorDefault())) if (Y.isUnderlineColorRGB()) g.style.textDecorationColor = `rgb(${oi.toColorRGB(Y.getUnderlineColor()).join(",")})`;
      else {
        let P = Y.getUnderlineColor();
        this._optionsService.rawOptions.drawBoldTextInBrightColors && Y.isBold() && P < 8 && (P += 8), g.style.textDecorationColor = _.ansi[P].css;
      }
      Y.isOverline() && (ie.push("xterm-overline"), y === " " && (y = " ")), Y.isStrikethrough() && ie.push("xterm-strikethrough"), Ce && (g.style.textDecoration = "underline");
      let U = Y.getFgColor(), te = Y.getFgColorMode(), A = Y.getBgColor(), D = Y.getBgColorMode(), F = !!Y.isInverse();
      if (F) {
        let P = U;
        U = A, A = P;
        let X = te;
        te = D, D = X;
      }
      let $, V, C = !1;
      this._decorationService.forEachDecorationAtCell(H, t, void 0, (P) => {
        P.options.layer !== "top" && C || (P.backgroundColorRGB && (D = 50331648, A = P.backgroundColorRGB.rgba >> 8 & 16777215, $ = P.backgroundColorRGB), P.foregroundColorRGB && (te = 50331648, U = P.foregroundColorRGB.rgba >> 8 & 16777215, V = P.foregroundColorRGB), C = P.options.layer === "top");
      }), !C && ae && ($ = this._coreBrowserService.isFocused ? _.selectionBackgroundOpaque : _.selectionInactiveBackgroundOpaque, A = $.rgba >> 8 & 16777215, D = 50331648, C = !0, _.selectionForeground && (te = 50331648, U = _.selectionForeground.rgba >> 8 & 16777215, V = _.selectionForeground)), C && ie.push("xterm-decoration-top");
      let x;
      switch (D) {
        case 16777216:
        case 33554432:
          x = _.ansi[A], ie.push(`xterm-bg-${A}`);
          break;
        case 50331648:
          x = Pe.toColor(A >> 16, A >> 8 & 255, A & 255), this._addStyle(g, `background-color:#${bc((A >>> 0).toString(16), "0", 6)}`);
          break;
        case 0:
        default:
          F ? (x = _.foreground, ie.push("xterm-bg-257")) : x = _.background;
      }
      switch ($ || Y.isDim() && ($ = be.multiplyOpacity(x, 0.5)), te) {
        case 16777216:
        case 33554432:
          Y.isBold() && U < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors && (U += 8), this._applyMinimumContrast(g, x, _.ansi[U], Y, $, void 0) || ie.push(`xterm-fg-${U}`);
          break;
        case 50331648:
          let P = Pe.toColor(U >> 16 & 255, U >> 8 & 255, U & 255);
          this._applyMinimumContrast(g, x, P, Y, $, V) || this._addStyle(g, `color:#${bc(U.toString(16), "0", 6)}`);
          break;
        case 0:
        default:
          this._applyMinimumContrast(g, x, _.foreground, Y, $, V) || F && ie.push("xterm-fg-257");
      }
      ie.length && (g.className = ie.join(" "), ie.length = 0), !ve && !J && !L && ee ? w++ : g.textContent = y, W !== this.defaultSpacing && (g.style.letterSpacing = `${W}px`), u.push(g), H = se;
    }
    return g && w && (g.textContent = y), u;
  }
  _applyMinimumContrast(e, t, r, i, s, n) {
    if (this._optionsService.rawOptions.minimumContrastRatio === 1 || Qv(i.getCode())) return !1;
    let o = this._getContrastCache(i), a;
    if (!s && !n && (a = o.getColor(t.rgba, r.rgba)), a === void 0) {
      let h = this._optionsService.rawOptions.minimumContrastRatio / (i.isDim() ? 2 : 1);
      a = be.ensureContrastRatio(s || t, n || r, h), o.setColor((s || t).rgba, (n || r).rgba, a ?? null);
    }
    return a ? (this._addStyle(e, `color:${a.css}`), !0) : !1;
  }
  _getContrastCache(e) {
    return e.isDim() ? this._themeService.colors.halfContrastCache : this._themeService.colors.contrastCache;
  }
  _addStyle(e, t) {
    e.setAttribute("style", `${e.getAttribute("style") || ""}${t};`);
  }
  _isCellInSelection(e, t) {
    let r = this._selectionStart, i = this._selectionEnd;
    return !r || !i ? !1 : this._columnSelectMode ? r[0] <= i[0] ? e >= r[0] && t >= r[1] && e < i[0] && t <= i[1] : e < r[0] && t >= r[1] && e >= i[0] && t <= i[1] : t > r[1] && t < i[1] || r[1] === i[1] && t === r[1] && e >= r[0] && e < i[0] || r[1] < i[1] && t === i[1] && e < i[0] || r[1] < i[1] && t === r[1] && e >= r[0];
  }
};
Qo = Ae([re(1, cf), re(2, Xe), re(3, zt), re(4, vr), re(5, ai), re(6, Ir)], Qo);
function bc(e, t, r) {
  for (; e.length < r; ) e = t + e;
  return e;
}
var t1 = class {
  constructor(e, t) {
    this._flat = new Float32Array(256), this._font = "", this._fontSize = 0, this._weight = "normal", this._weightBold = "bold", this._measureElements = [], this._container = e.createElement("div"), this._container.classList.add("xterm-width-cache-measure-container"), this._container.setAttribute("aria-hidden", "true"), this._container.style.whiteSpace = "pre", this._container.style.fontKerning = "none";
    let r = e.createElement("span");
    r.classList.add("xterm-char-measure-element");
    let i = e.createElement("span");
    i.classList.add("xterm-char-measure-element"), i.style.fontWeight = "bold";
    let s = e.createElement("span");
    s.classList.add("xterm-char-measure-element"), s.style.fontStyle = "italic";
    let n = e.createElement("span");
    n.classList.add("xterm-char-measure-element"), n.style.fontWeight = "bold", n.style.fontStyle = "italic", this._measureElements = [r, i, s, n], this._container.appendChild(r), this._container.appendChild(i), this._container.appendChild(s), this._container.appendChild(n), t.appendChild(this._container), this.clear();
  }
  dispose() {
    this._container.remove(), this._measureElements.length = 0, this._holey = void 0;
  }
  clear() {
    this._flat.fill(-9999), this._holey = /* @__PURE__ */ new Map();
  }
  setFont(e, t, r, i) {
    e === this._font && t === this._fontSize && r === this._weight && i === this._weightBold || (this._font = e, this._fontSize = t, this._weight = r, this._weightBold = i, this._container.style.fontFamily = this._font, this._container.style.fontSize = `${this._fontSize}px`, this._measureElements[0].style.fontWeight = `${r}`, this._measureElements[1].style.fontWeight = `${i}`, this._measureElements[2].style.fontWeight = `${r}`, this._measureElements[3].style.fontWeight = `${i}`, this.clear());
  }
  get(e, t, r) {
    let i = 0;
    if (!t && !r && e.length === 1 && (i = e.charCodeAt(0)) < 256) {
      if (this._flat[i] !== -9999) return this._flat[i];
      let o = this._measure(e, 0);
      return o > 0 && (this._flat[i] = o), o;
    }
    let s = e;
    t && (s += "B"), r && (s += "I");
    let n = this._holey.get(s);
    if (n === void 0) {
      let o = 0;
      t && (o |= 1), r && (o |= 2), n = this._measure(e, o), n > 0 && this._holey.set(s, n);
    }
    return n;
  }
  _measure(e, t) {
    let r = this._measureElements[t];
    return r.textContent = e.repeat(32), r.offsetWidth / 32;
  }
}, r1 = class {
  constructor() {
    this.clear();
  }
  clear() {
    this.hasSelection = !1, this.columnSelectMode = !1, this.viewportStartRow = 0, this.viewportEndRow = 0, this.viewportCappedStartRow = 0, this.viewportCappedEndRow = 0, this.startCol = 0, this.endCol = 0, this.selectionStart = void 0, this.selectionEnd = void 0;
  }
  update(e, t, r, i = !1) {
    if (this.selectionStart = t, this.selectionEnd = r, !t || !r || t[0] === r[0] && t[1] === r[1]) {
      this.clear();
      return;
    }
    let s = e.buffers.active.ydisp, n = t[1] - s, o = r[1] - s, a = Math.max(n, 0), h = Math.min(o, e.rows - 1);
    if (a >= e.rows || h < 0) {
      this.clear();
      return;
    }
    this.hasSelection = !0, this.columnSelectMode = i, this.viewportStartRow = n, this.viewportEndRow = o, this.viewportCappedStartRow = a, this.viewportCappedEndRow = h, this.startCol = t[0], this.endCol = r[0];
  }
  isCellSelected(e, t, r) {
    return this.hasSelection ? (r -= e.buffer.active.viewportY, this.columnSelectMode ? this.startCol <= this.endCol ? t >= this.startCol && r >= this.viewportCappedStartRow && t < this.endCol && r <= this.viewportCappedEndRow : t < this.startCol && r >= this.viewportCappedStartRow && t >= this.endCol && r <= this.viewportCappedEndRow : r > this.viewportStartRow && r < this.viewportEndRow || this.viewportStartRow === this.viewportEndRow && r === this.viewportStartRow && t >= this.startCol && t < this.endCol || this.viewportStartRow < this.viewportEndRow && r === this.viewportEndRow && t < this.endCol || this.viewportStartRow < this.viewportEndRow && r === this.viewportStartRow && t >= this.startCol) : !1;
  }
};
function i1() {
  return new r1();
}
var fo = "xterm-dom-renderer-owner-", at = "xterm-rows", Ti = "xterm-fg-", wc = "xterm-bg-", Hr = "xterm-focus", Li = "xterm-selection", s1 = 1, ea = class extends de {
  constructor(e, t, r, i, s, n, o, a, h, l, c, u, p, _) {
    super(), this._terminal = e, this._document = t, this._element = r, this._screenElement = i, this._viewportElement = s, this._helperContainer = n, this._linkifier2 = o, this._charSizeService = h, this._optionsService = l, this._bufferService = c, this._coreService = u, this._coreBrowserService = p, this._themeService = _, this._terminalClass = s1++, this._rowElements = [], this._selectionRenderModel = i1(), this.onRequestRedraw = this._register(new Q()).event, this._rowContainer = this._document.createElement("div"), this._rowContainer.classList.add(at), this._rowContainer.style.lineHeight = "normal", this._rowContainer.setAttribute("aria-hidden", "true"), this._refreshRowElements(this._bufferService.cols, this._bufferService.rows), this._selectionContainer = this._document.createElement("div"), this._selectionContainer.classList.add(Li), this._selectionContainer.setAttribute("aria-hidden", "true"), this.dimensions = e1(), this._updateDimensions(), this._register(this._optionsService.onOptionChange(() => this._handleOptionsChanged())), this._register(this._themeService.onChangeColors((m) => this._injectCss(m))), this._injectCss(this._themeService.colors), this._rowFactory = a.createInstance(Qo, document), this._element.classList.add(fo + this._terminalClass), this._screenElement.appendChild(this._rowContainer), this._screenElement.appendChild(this._selectionContainer), this._register(this._linkifier2.onShowLinkUnderline((m) => this._handleLinkHover(m))), this._register(this._linkifier2.onHideLinkUnderline((m) => this._handleLinkLeave(m))), this._register(Se(() => {
      this._element.classList.remove(fo + this._terminalClass), this._rowContainer.remove(), this._selectionContainer.remove(), this._widthCache.dispose(), this._themeStyleElement.remove(), this._dimensionsStyleElement.remove();
    })), this._widthCache = new t1(this._document, this._helperContainer), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
  }
  _updateDimensions() {
    let e = this._coreBrowserService.dpr;
    this.dimensions.device.char.width = this._charSizeService.width * e, this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * e), this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing), this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight), this.dimensions.device.char.left = 0, this.dimensions.device.char.top = 0, this.dimensions.device.canvas.width = this.dimensions.device.cell.width * this._bufferService.cols, this.dimensions.device.canvas.height = this.dimensions.device.cell.height * this._bufferService.rows, this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / e), this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / e), this.dimensions.css.cell.width = this.dimensions.css.canvas.width / this._bufferService.cols, this.dimensions.css.cell.height = this.dimensions.css.canvas.height / this._bufferService.rows;
    for (let r of this._rowElements) r.style.width = `${this.dimensions.css.canvas.width}px`, r.style.height = `${this.dimensions.css.cell.height}px`, r.style.lineHeight = `${this.dimensions.css.cell.height}px`, r.style.overflow = "hidden";
    this._dimensionsStyleElement || (this._dimensionsStyleElement = this._document.createElement("style"), this._screenElement.appendChild(this._dimensionsStyleElement));
    let t = `${this._terminalSelector} .${at} span { display: inline-block; height: 100%; vertical-align: top;}`;
    this._dimensionsStyleElement.textContent = t, this._selectionContainer.style.height = this._viewportElement.style.height, this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`, this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
  }
  _injectCss(e) {
    this._themeStyleElement || (this._themeStyleElement = this._document.createElement("style"), this._screenElement.appendChild(this._themeStyleElement));
    let t = `${this._terminalSelector} .${at} { pointer-events: none; color: ${e.foreground.css}; font-family: ${this._optionsService.rawOptions.fontFamily}; font-size: ${this._optionsService.rawOptions.fontSize}px; font-kerning: none; white-space: pre}`;
    t += `${this._terminalSelector} .${at} .xterm-dim { color: ${be.multiplyOpacity(e.foreground, 0.5).css};}`, t += `${this._terminalSelector} span:not(.xterm-bold) { font-weight: ${this._optionsService.rawOptions.fontWeight};}${this._terminalSelector} span.xterm-bold { font-weight: ${this._optionsService.rawOptions.fontWeightBold};}${this._terminalSelector} span.xterm-italic { font-style: italic;}`;
    let r = `blink_underline_${this._terminalClass}`, i = `blink_bar_${this._terminalClass}`, s = `blink_block_${this._terminalClass}`;
    t += `@keyframes ${r} { 50% {  border-bottom-style: hidden; }}`, t += `@keyframes ${i} { 50% {  box-shadow: none; }}`, t += `@keyframes ${s} { 0% {  background-color: ${e.cursor.css};  color: ${e.cursorAccent.css}; } 50% {  background-color: inherit;  color: ${e.cursor.css}; }}`, t += `${this._terminalSelector} .${at}.${Hr} .xterm-cursor.xterm-cursor-blink.xterm-cursor-underline { animation: ${r} 1s step-end infinite;}${this._terminalSelector} .${at}.${Hr} .xterm-cursor.xterm-cursor-blink.xterm-cursor-bar { animation: ${i} 1s step-end infinite;}${this._terminalSelector} .${at}.${Hr} .xterm-cursor.xterm-cursor-blink.xterm-cursor-block { animation: ${s} 1s step-end infinite;}${this._terminalSelector} .${at} .xterm-cursor.xterm-cursor-block { background-color: ${e.cursor.css}; color: ${e.cursorAccent.css};}${this._terminalSelector} .${at} .xterm-cursor.xterm-cursor-block:not(.xterm-cursor-blink) { background-color: ${e.cursor.css} !important; color: ${e.cursorAccent.css} !important;}${this._terminalSelector} .${at} .xterm-cursor.xterm-cursor-outline { outline: 1px solid ${e.cursor.css}; outline-offset: -1px;}${this._terminalSelector} .${at} .xterm-cursor.xterm-cursor-bar { box-shadow: ${this._optionsService.rawOptions.cursorWidth}px 0 0 ${e.cursor.css} inset;}${this._terminalSelector} .${at} .xterm-cursor.xterm-cursor-underline { border-bottom: 1px ${e.cursor.css}; border-bottom-style: solid; height: calc(100% - 1px);}`, t += `${this._terminalSelector} .${Li} { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;}${this._terminalSelector}.focus .${Li} div { position: absolute; background-color: ${e.selectionBackgroundOpaque.css};}${this._terminalSelector} .${Li} div { position: absolute; background-color: ${e.selectionInactiveBackgroundOpaque.css};}`;
    for (let [n, o] of e.ansi.entries()) t += `${this._terminalSelector} .${Ti}${n} { color: ${o.css}; }${this._terminalSelector} .${Ti}${n}.xterm-dim { color: ${be.multiplyOpacity(o, 0.5).css}; }${this._terminalSelector} .${wc}${n} { background-color: ${o.css}; }`;
    t += `${this._terminalSelector} .${Ti}257 { color: ${be.opaque(e.background).css}; }${this._terminalSelector} .${Ti}257.xterm-dim { color: ${be.multiplyOpacity(be.opaque(e.background), 0.5).css}; }${this._terminalSelector} .${wc}257 { background-color: ${e.foreground.css}; }`, this._themeStyleElement.textContent = t;
  }
  _setDefaultSpacing() {
    let e = this.dimensions.css.cell.width - this._widthCache.get("W", !1, !1);
    this._rowContainer.style.letterSpacing = `${e}px`, this._rowFactory.defaultSpacing = e;
  }
  handleDevicePixelRatioChange() {
    this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
  }
  _refreshRowElements(e, t) {
    for (let r = this._rowElements.length; r <= t; r++) {
      let i = this._document.createElement("div");
      this._rowContainer.appendChild(i), this._rowElements.push(i);
    }
    for (; this._rowElements.length > t; ) this._rowContainer.removeChild(this._rowElements.pop());
  }
  handleResize(e, t) {
    this._refreshRowElements(e, t), this._updateDimensions(), this.handleSelectionChanged(this._selectionRenderModel.selectionStart, this._selectionRenderModel.selectionEnd, this._selectionRenderModel.columnSelectMode);
  }
  handleCharSizeChanged() {
    this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
  }
  handleBlur() {
    this._rowContainer.classList.remove(Hr), this.renderRows(0, this._bufferService.rows - 1);
  }
  handleFocus() {
    this._rowContainer.classList.add(Hr), this.renderRows(this._bufferService.buffer.y, this._bufferService.buffer.y);
  }
  handleSelectionChanged(e, t, r) {
    if (this._selectionContainer.replaceChildren(), this._rowFactory.handleSelectionChanged(e, t, r), this.renderRows(0, this._bufferService.rows - 1), !e || !t || (this._selectionRenderModel.update(this._terminal, e, t, r), !this._selectionRenderModel.hasSelection)) return;
    let i = this._selectionRenderModel.viewportStartRow, s = this._selectionRenderModel.viewportEndRow, n = this._selectionRenderModel.viewportCappedStartRow, o = this._selectionRenderModel.viewportCappedEndRow, a = this._document.createDocumentFragment();
    if (r) {
      let h = e[0] > t[0];
      a.appendChild(this._createSelectionElement(n, h ? t[0] : e[0], h ? e[0] : t[0], o - n + 1));
    } else {
      let h = i === n ? e[0] : 0, l = n === s ? t[0] : this._bufferService.cols;
      a.appendChild(this._createSelectionElement(n, h, l));
      let c = o - n - 1;
      if (a.appendChild(this._createSelectionElement(n + 1, 0, this._bufferService.cols, c)), n !== o) {
        let u = s === o ? t[0] : this._bufferService.cols;
        a.appendChild(this._createSelectionElement(o, 0, u));
      }
    }
    this._selectionContainer.appendChild(a);
  }
  _createSelectionElement(e, t, r, i = 1) {
    let s = this._document.createElement("div"), n = t * this.dimensions.css.cell.width, o = this.dimensions.css.cell.width * (r - t);
    return n + o > this.dimensions.css.canvas.width && (o = this.dimensions.css.canvas.width - n), s.style.height = `${i * this.dimensions.css.cell.height}px`, s.style.top = `${e * this.dimensions.css.cell.height}px`, s.style.left = `${n}px`, s.style.width = `${o}px`, s;
  }
  handleCursorMove() {
  }
  _handleOptionsChanged() {
    this._updateDimensions(), this._injectCss(this._themeService.colors), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
  }
  clear() {
    for (let e of this._rowElements) e.replaceChildren();
  }
  renderRows(e, t) {
    let r = this._bufferService.buffer, i = r.ybase + r.y, s = Math.min(r.x, this._bufferService.cols - 1), n = this._coreService.decPrivateModes.cursorBlink ?? this._optionsService.rawOptions.cursorBlink, o = this._coreService.decPrivateModes.cursorStyle ?? this._optionsService.rawOptions.cursorStyle, a = this._optionsService.rawOptions.cursorInactiveStyle;
    for (let h = e; h <= t; h++) {
      let l = h + r.ydisp, c = this._rowElements[h], u = r.lines.get(l);
      if (!c || !u) break;
      c.replaceChildren(...this._rowFactory.createRow(u, l, l === i, o, a, s, n, this.dimensions.css.cell.width, this._widthCache, -1, -1));
    }
  }
  get _terminalSelector() {
    return `.${fo}${this._terminalClass}`;
  }
  _handleLinkHover(e) {
    this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, !0);
  }
  _handleLinkLeave(e) {
    this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, !1);
  }
  _setCellUnderline(e, t, r, i, s, n) {
    r < 0 && (e = 0), i < 0 && (t = 0);
    let o = this._bufferService.rows - 1;
    r = Math.max(Math.min(r, o), 0), i = Math.max(Math.min(i, o), 0), s = Math.min(s, this._bufferService.cols);
    let a = this._bufferService.buffer, h = a.ybase + a.y, l = Math.min(a.x, s - 1), c = this._optionsService.rawOptions.cursorBlink, u = this._optionsService.rawOptions.cursorStyle, p = this._optionsService.rawOptions.cursorInactiveStyle;
    for (let _ = r; _ <= i; ++_) {
      let m = _ + a.ydisp, g = this._rowElements[_], w = a.lines.get(m);
      if (!g || !w) break;
      g.replaceChildren(...this._rowFactory.createRow(w, m, m === h, u, p, l, c, this.dimensions.css.cell.width, this._widthCache, n ? _ === r ? e : 0 : -1, n ? (_ === i ? t : s) - 1 : -1));
    }
  }
};
ea = Ae([re(7, Ma), re(8, _s), re(9, Xe), re(10, Ye), re(11, vr), re(12, zt), re(13, Ir)], ea);
var ta = class extends de {
  constructor(e, t, r) {
    super(), this._optionsService = r, this.width = 0, this.height = 0, this._onCharSizeChange = this._register(new Q()), this.onCharSizeChange = this._onCharSizeChange.event;
    try {
      this._measureStrategy = this._register(new o1(this._optionsService));
    } catch {
      this._measureStrategy = this._register(new n1(e, t, this._optionsService));
    }
    this._register(this._optionsService.onMultipleOptionChange(["fontFamily", "fontSize"], () => this.measure()));
  }
  get hasValidSize() {
    return this.width > 0 && this.height > 0;
  }
  measure() {
    let e = this._measureStrategy.measure();
    (e.width !== this.width || e.height !== this.height) && (this.width = e.width, this.height = e.height, this._onCharSizeChange.fire());
  }
};
ta = Ae([re(2, Xe)], ta);
var Af = class extends de {
  constructor() {
    super(...arguments), this._result = { width: 0, height: 0 };
  }
  _validateAndSet(e, t) {
    e !== void 0 && e > 0 && t !== void 0 && t > 0 && (this._result.width = e, this._result.height = t);
  }
}, n1 = class extends Af {
  constructor(e, t, r) {
    super(), this._document = e, this._parentElement = t, this._optionsService = r, this._measureElement = this._document.createElement("span"), this._measureElement.classList.add("xterm-char-measure-element"), this._measureElement.textContent = "W".repeat(32), this._measureElement.setAttribute("aria-hidden", "true"), this._measureElement.style.whiteSpace = "pre", this._measureElement.style.fontKerning = "none", this._parentElement.appendChild(this._measureElement);
  }
  measure() {
    return this._measureElement.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._measureElement.style.fontSize = `${this._optionsService.rawOptions.fontSize}px`, this._validateAndSet(Number(this._measureElement.offsetWidth) / 32, Number(this._measureElement.offsetHeight)), this._result;
  }
}, o1 = class extends Af {
  constructor(e) {
    super(), this._optionsService = e, this._canvas = new OffscreenCanvas(100, 100), this._ctx = this._canvas.getContext("2d");
    let t = this._ctx.measureText("W");
    if (!("width" in t && "fontBoundingBoxAscent" in t && "fontBoundingBoxDescent" in t)) throw new Error("Required font metrics not supported");
  }
  measure() {
    this._ctx.font = `${this._optionsService.rawOptions.fontSize}px ${this._optionsService.rawOptions.fontFamily}`;
    let e = this._ctx.measureText("W");
    return this._validateAndSet(e.width, e.fontBoundingBoxAscent + e.fontBoundingBoxDescent), this._result;
  }
}, a1 = class extends de {
  constructor(e, t, r) {
    super(), this._textarea = e, this._window = t, this.mainDocument = r, this._isFocused = !1, this._cachedIsFocused = void 0, this._screenDprMonitor = this._register(new l1(this._window)), this._onDprChange = this._register(new Q()), this.onDprChange = this._onDprChange.event, this._onWindowChange = this._register(new Q()), this.onWindowChange = this._onWindowChange.event, this._register(this.onWindowChange((i) => this._screenDprMonitor.setWindow(i))), this._register(je.forward(this._screenDprMonitor.onDprChange, this._onDprChange)), this._register(he(this._textarea, "focus", () => this._isFocused = !0)), this._register(he(this._textarea, "blur", () => this._isFocused = !1));
  }
  get window() {
    return this._window;
  }
  set window(e) {
    this._window !== e && (this._window = e, this._onWindowChange.fire(this._window));
  }
  get dpr() {
    return this.window.devicePixelRatio;
  }
  get isFocused() {
    return this._cachedIsFocused === void 0 && (this._cachedIsFocused = this._isFocused && this._textarea.ownerDocument.hasFocus(), queueMicrotask(() => this._cachedIsFocused = void 0)), this._cachedIsFocused;
  }
}, l1 = class extends de {
  constructor(e) {
    super(), this._parentWindow = e, this._windowResizeListener = this._register(new Pr()), this._onDprChange = this._register(new Q()), this.onDprChange = this._onDprChange.event, this._outerListener = () => this._setDprAndFireIfDiffers(), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._updateDpr(), this._setWindowResizeListener(), this._register(Se(() => this.clearListener()));
  }
  setWindow(e) {
    this._parentWindow = e, this._setWindowResizeListener(), this._setDprAndFireIfDiffers();
  }
  _setWindowResizeListener() {
    this._windowResizeListener.value = he(this._parentWindow, "resize", () => this._setDprAndFireIfDiffers());
  }
  _setDprAndFireIfDiffers() {
    this._parentWindow.devicePixelRatio !== this._currentDevicePixelRatio && this._onDprChange.fire(this._parentWindow.devicePixelRatio), this._updateDpr();
  }
  _updateDpr() {
    var e;
    this._outerListener && ((e = this._resolutionMediaMatchList) == null || e.removeListener(this._outerListener), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`), this._resolutionMediaMatchList.addListener(this._outerListener));
  }
  clearListener() {
    !this._resolutionMediaMatchList || !this._outerListener || (this._resolutionMediaMatchList.removeListener(this._outerListener), this._resolutionMediaMatchList = void 0, this._outerListener = void 0);
  }
}, h1 = class extends de {
  constructor() {
    super(), this.linkProviders = [], this._register(Se(() => this.linkProviders.length = 0));
  }
  registerLinkProvider(e) {
    return this.linkProviders.push(e), { dispose: () => {
      let t = this.linkProviders.indexOf(e);
      t !== -1 && this.linkProviders.splice(t, 1);
    } };
  }
};
function za(e, t, r) {
  let i = r.getBoundingClientRect(), s = e.getComputedStyle(r), n = parseInt(s.getPropertyValue("padding-left")), o = parseInt(s.getPropertyValue("padding-top"));
  return [t.clientX - i.left - n, t.clientY - i.top - o];
}
function c1(e, t, r, i, s, n, o, a, h) {
  if (!n) return;
  let l = za(e, t, r);
  if (l) return l[0] = Math.ceil((l[0] + (h ? o / 2 : 0)) / o), l[1] = Math.ceil(l[1] / a), l[0] = Math.min(Math.max(l[0], 1), i + (h ? 1 : 0)), l[1] = Math.min(Math.max(l[1], 1), s), l;
}
var ra = class {
  constructor(e, t) {
    this._renderService = e, this._charSizeService = t;
  }
  getCoords(e, t, r, i, s) {
    return c1(window, e, t, r, i, this._charSizeService.hasValidSize, this._renderService.dimensions.css.cell.width, this._renderService.dimensions.css.cell.height, s);
  }
  getMouseReportCoords(e, t) {
    let r = za(window, e, t);
    if (this._charSizeService.hasValidSize) return r[0] = Math.min(Math.max(r[0], 0), this._renderService.dimensions.css.canvas.width - 1), r[1] = Math.min(Math.max(r[1], 0), this._renderService.dimensions.css.canvas.height - 1), { col: Math.floor(r[0] / this._renderService.dimensions.css.cell.width), row: Math.floor(r[1] / this._renderService.dimensions.css.cell.height), x: Math.floor(r[0]), y: Math.floor(r[1]) };
  }
};
ra = Ae([re(0, qt), re(1, _s)], ra);
var u1 = class {
  constructor(e, t) {
    this._renderCallback = e, this._coreBrowserService = t, this._refreshCallbacks = [];
  }
  dispose() {
    this._animationFrame && (this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
  }
  addRefreshCallback(e) {
    return this._refreshCallbacks.push(e), this._animationFrame || (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh())), this._animationFrame;
  }
  refresh(e, t, r) {
    this._rowCount = r, e = e !== void 0 ? e : 0, t = t !== void 0 ? t : this._rowCount - 1, this._rowStart = this._rowStart !== void 0 ? Math.min(this._rowStart, e) : e, this._rowEnd = this._rowEnd !== void 0 ? Math.max(this._rowEnd, t) : t, !this._animationFrame && (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh()));
  }
  _innerRefresh() {
    if (this._animationFrame = void 0, this._rowStart === void 0 || this._rowEnd === void 0 || this._rowCount === void 0) {
      this._runRefreshCallbacks();
      return;
    }
    let e = Math.max(this._rowStart, 0), t = Math.min(this._rowEnd, this._rowCount - 1);
    this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e, t), this._runRefreshCallbacks();
  }
  _runRefreshCallbacks() {
    for (let e of this._refreshCallbacks) e(0);
    this._refreshCallbacks = [];
  }
}, Df = {};
wg(Df, { getSafariVersion: () => d1, isChromeOS: () => Mf, isFirefox: () => Tf, isIpad: () => p1, isIphone: () => _1, isLegacyEdge: () => f1, isLinux: () => qa, isMac: () => ns, isNode: () => gs, isSafari: () => Lf, isWindows: () => Pf });
var gs = typeof le < "u" && "title" in le, li = gs ? "node" : navigator.userAgent, hi = gs ? "node" : navigator.platform, Tf = li.includes("Firefox"), f1 = li.includes("Edge"), Lf = /^((?!chrome|android).)*safari/i.test(li);
function d1() {
  if (!Lf) return 0;
  let e = li.match(/Version\/(\d+)/);
  return e === null || e.length < 2 ? 0 : parseInt(e[1]);
}
var ns = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].includes(hi), p1 = hi === "iPad", _1 = hi === "iPhone", Pf = ["Windows", "Win16", "Win32", "WinCE"].includes(hi), qa = hi.indexOf("Linux") >= 0, Mf = /\bCrOS\b/.test(li), Of = class {
  constructor() {
    this._tasks = [], this._i = 0;
  }
  enqueue(e) {
    this._tasks.push(e), this._start();
  }
  flush() {
    for (; this._i < this._tasks.length; ) this._tasks[this._i]() || this._i++;
    this.clear();
  }
  clear() {
    this._idleCallback && (this._cancelCallback(this._idleCallback), this._idleCallback = void 0), this._i = 0, this._tasks.length = 0;
  }
  _start() {
    this._idleCallback || (this._idleCallback = this._requestCallback(this._process.bind(this)));
  }
  _process(e) {
    this._idleCallback = void 0;
    let t = 0, r = 0, i = e.timeRemaining(), s = 0;
    for (; this._i < this._tasks.length; ) {
      if (t = performance.now(), this._tasks[this._i]() || this._i++, t = Math.max(1, performance.now() - t), r = Math.max(t, r), s = e.timeRemaining(), r * 1.5 > s) {
        i - t < -20 && console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(i - t))}ms`), this._start();
        return;
      }
      i = s;
    }
    this.clear();
  }
}, g1 = class extends Of {
  _requestCallback(e) {
    return setTimeout(() => e(this._createDeadline(16)));
  }
  _cancelCallback(e) {
    clearTimeout(e);
  }
  _createDeadline(e) {
    let t = performance.now() + e;
    return { timeRemaining: () => Math.max(0, t - performance.now()) };
  }
}, v1 = class extends Of {
  _requestCallback(e) {
    return requestIdleCallback(e);
  }
  _cancelCallback(e) {
    cancelIdleCallback(e);
  }
}, os = !gs && "requestIdleCallback" in window ? v1 : g1, m1 = class {
  constructor() {
    this._queue = new os();
  }
  set(e) {
    this._queue.clear(), this._queue.enqueue(e);
  }
  flush() {
    this._queue.flush();
  }
}, ia = class extends de {
  constructor(e, t, r, i, s, n, o, a, h) {
    super(), this._rowCount = e, this._optionsService = r, this._charSizeService = i, this._coreService = s, this._coreBrowserService = a, this._renderer = this._register(new Pr()), this._pausedResizeTask = new m1(), this._observerDisposable = this._register(new Pr()), this._isPaused = !1, this._needsFullRefresh = !1, this._isNextRenderRedrawOnly = !0, this._needsSelectionRefresh = !1, this._canvasWidth = 0, this._canvasHeight = 0, this._selectionState = { start: void 0, end: void 0, columnSelectMode: !1 }, this._onDimensionsChange = this._register(new Q()), this.onDimensionsChange = this._onDimensionsChange.event, this._onRenderedViewportChange = this._register(new Q()), this.onRenderedViewportChange = this._onRenderedViewportChange.event, this._onRender = this._register(new Q()), this.onRender = this._onRender.event, this._onRefreshRequest = this._register(new Q()), this.onRefreshRequest = this._onRefreshRequest.event, this._renderDebouncer = new u1((l, c) => this._renderRows(l, c), this._coreBrowserService), this._register(this._renderDebouncer), this._syncOutputHandler = new y1(this._coreBrowserService, this._coreService, () => this._fullRefresh()), this._register(Se(() => this._syncOutputHandler.dispose())), this._register(this._coreBrowserService.onDprChange(() => this.handleDevicePixelRatioChange())), this._register(o.onResize(() => this._fullRefresh())), this._register(o.buffers.onBufferActivate(() => {
      var l;
      return (l = this._renderer.value) == null ? void 0 : l.clear();
    })), this._register(this._optionsService.onOptionChange(() => this._handleOptionsChanged())), this._register(this._charSizeService.onCharSizeChange(() => this.handleCharSizeChanged())), this._register(n.onDecorationRegistered(() => this._fullRefresh())), this._register(n.onDecorationRemoved(() => this._fullRefresh())), this._register(this._optionsService.onMultipleOptionChange(["customGlyphs", "drawBoldTextInBrightColors", "letterSpacing", "lineHeight", "fontFamily", "fontSize", "fontWeight", "fontWeightBold", "minimumContrastRatio", "rescaleOverlappingGlyphs"], () => {
      this.clear(), this.handleResize(o.cols, o.rows), this._fullRefresh();
    })), this._register(this._optionsService.onMultipleOptionChange(["cursorBlink", "cursorStyle"], () => this.refreshRows(o.buffer.y, o.buffer.y, !0))), this._register(h.onChangeColors(() => this._fullRefresh())), this._registerIntersectionObserver(this._coreBrowserService.window, t), this._register(this._coreBrowserService.onWindowChange((l) => this._registerIntersectionObserver(l, t)));
  }
  get dimensions() {
    return this._renderer.value.dimensions;
  }
  _registerIntersectionObserver(e, t) {
    if ("IntersectionObserver" in e) {
      let r = new e.IntersectionObserver((i) => this._handleIntersectionChange(i[i.length - 1]), { threshold: 0 });
      r.observe(t), this._observerDisposable.value = Se(() => r.disconnect());
    }
  }
  _handleIntersectionChange(e) {
    this._isPaused = e.isIntersecting === void 0 ? e.intersectionRatio === 0 : !e.isIntersecting, !this._isPaused && !this._charSizeService.hasValidSize && this._charSizeService.measure(), !this._isPaused && this._needsFullRefresh && (this._pausedResizeTask.flush(), this.refreshRows(0, this._rowCount - 1), this._needsFullRefresh = !1);
  }
  refreshRows(e, t, r = !1) {
    if (this._isPaused) {
      this._needsFullRefresh = !0;
      return;
    }
    if (this._coreService.decPrivateModes.synchronizedOutput) {
      this._syncOutputHandler.bufferRows(e, t);
      return;
    }
    let i = this._syncOutputHandler.flush();
    i && (e = Math.min(e, i.start), t = Math.max(t, i.end)), r || (this._isNextRenderRedrawOnly = !1), this._renderDebouncer.refresh(e, t, this._rowCount);
  }
  _renderRows(e, t) {
    if (this._renderer.value) {
      if (this._coreService.decPrivateModes.synchronizedOutput) {
        this._syncOutputHandler.bufferRows(e, t);
        return;
      }
      e = Math.min(e, this._rowCount - 1), t = Math.min(t, this._rowCount - 1), this._renderer.value.renderRows(e, t), this._needsSelectionRefresh && (this._renderer.value.handleSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode), this._needsSelectionRefresh = !1), this._isNextRenderRedrawOnly || this._onRenderedViewportChange.fire({ start: e, end: t }), this._onRender.fire({ start: e, end: t }), this._isNextRenderRedrawOnly = !0;
    }
  }
  resize(e, t) {
    this._rowCount = t, this._fireOnCanvasResize();
  }
  _handleOptionsChanged() {
    this._renderer.value && (this.refreshRows(0, this._rowCount - 1), this._fireOnCanvasResize());
  }
  _fireOnCanvasResize() {
    this._renderer.value && (this._renderer.value.dimensions.css.canvas.width === this._canvasWidth && this._renderer.value.dimensions.css.canvas.height === this._canvasHeight || this._onDimensionsChange.fire(this._renderer.value.dimensions));
  }
  hasRenderer() {
    return !!this._renderer.value;
  }
  setRenderer(e) {
    this._renderer.value = e, this._renderer.value && (this._renderer.value.onRequestRedraw((t) => this.refreshRows(t.start, t.end, !0)), this._needsSelectionRefresh = !0, this._fullRefresh());
  }
  addRefreshCallback(e) {
    return this._renderDebouncer.addRefreshCallback(e);
  }
  _fullRefresh() {
    this._isPaused ? this._needsFullRefresh = !0 : this.refreshRows(0, this._rowCount - 1);
  }
  clearTextureAtlas() {
    var e, t;
    this._renderer.value && ((t = (e = this._renderer.value).clearTextureAtlas) == null || t.call(e), this._fullRefresh());
  }
  handleDevicePixelRatioChange() {
    this._charSizeService.measure(), this._renderer.value && (this._renderer.value.handleDevicePixelRatioChange(), this.refreshRows(0, this._rowCount - 1));
  }
  handleResize(e, t) {
    this._renderer.value && (this._isPaused ? this._pausedResizeTask.set(() => {
      var r;
      return (r = this._renderer.value) == null ? void 0 : r.handleResize(e, t);
    }) : this._renderer.value.handleResize(e, t), this._fullRefresh());
  }
  handleCharSizeChanged() {
    var e;
    (e = this._renderer.value) == null || e.handleCharSizeChanged();
  }
  handleBlur() {
    var e;
    (e = this._renderer.value) == null || e.handleBlur();
  }
  handleFocus() {
    var e;
    (e = this._renderer.value) == null || e.handleFocus();
  }
  handleSelectionChanged(e, t, r) {
    var i;
    this._selectionState.start = e, this._selectionState.end = t, this._selectionState.columnSelectMode = r, (i = this._renderer.value) == null || i.handleSelectionChanged(e, t, r);
  }
  handleCursorMove() {
    var e;
    (e = this._renderer.value) == null || e.handleCursorMove();
  }
  clear() {
    var e;
    (e = this._renderer.value) == null || e.clear();
  }
};
ia = Ae([re(2, Xe), re(3, _s), re(4, vr), re(5, ai), re(6, Ye), re(7, zt), re(8, Ir)], ia);
var y1 = class {
  constructor(e, t, r) {
    this._coreBrowserService = e, this._coreService = t, this._onTimeout = r, this._start = 0, this._end = 0, this._isBuffering = !1;
  }
  bufferRows(e, t) {
    this._isBuffering ? (this._start = Math.min(this._start, e), this._end = Math.max(this._end, t)) : (this._start = e, this._end = t, this._isBuffering = !0), this._timeout === void 0 && (this._timeout = this._coreBrowserService.window.setTimeout(() => {
      this._timeout = void 0, this._coreService.decPrivateModes.synchronizedOutput = !1, this._onTimeout();
    }, 1e3));
  }
  flush() {
    if (this._timeout !== void 0 && (this._coreBrowserService.window.clearTimeout(this._timeout), this._timeout = void 0), !this._isBuffering) return;
    let e = { start: this._start, end: this._end };
    return this._isBuffering = !1, e;
  }
  dispose() {
    this._timeout !== void 0 && (this._coreBrowserService.window.clearTimeout(this._timeout), this._timeout = void 0);
  }
};
function b1(e, t, r, i) {
  let s = r.buffer.x, n = r.buffer.y;
  if (!r.buffer.hasScrollback) return C1(s, n, e, t, r, i) + vs(n, t, r, i) + E1(s, n, e, t, r, i);
  let o;
  if (n === t) return o = s > e ? "D" : "C", ei(Math.abs(s - e), Qr(o, i));
  o = n > t ? "D" : "C";
  let a = Math.abs(n - t), h = S1(n > t ? e : s, r) + (a - 1) * r.cols + 1 + w1(n > t ? s : e);
  return ei(h, Qr(o, i));
}
function w1(e, t) {
  return e - 1;
}
function S1(e, t) {
  return t.cols - e;
}
function C1(e, t, r, i, s, n) {
  return vs(t, i, s, n).length === 0 ? "" : ei(Nf(e, t, e, t - _r(t, s), !1, s).length, Qr("D", n));
}
function vs(e, t, r, i) {
  let s = e - _r(e, r), n = t - _r(t, r), o = Math.abs(s - n) - x1(e, t, r);
  return ei(o, Qr(If(e, t), i));
}
function E1(e, t, r, i, s, n) {
  let o;
  vs(t, i, s, n).length > 0 ? o = i - _r(i, s) : o = t;
  let a = i, h = k1(e, t, r, i, s, n);
  return ei(Nf(e, o, r, a, h === "C", s).length, Qr(h, n));
}
function x1(e, t, r) {
  var o;
  let i = 0, s = e - _r(e, r), n = t - _r(t, r);
  for (let a = 0; a < Math.abs(s - n); a++) {
    let h = If(e, t) === "A" ? -1 : 1;
    (o = r.buffer.lines.get(s + h * a)) != null && o.isWrapped && i++;
  }
  return i;
}
function _r(e, t) {
  let r = 0, i = t.buffer.lines.get(e), s = i == null ? void 0 : i.isWrapped;
  for (; s && e >= 0 && e < t.rows; ) r++, i = t.buffer.lines.get(--e), s = i == null ? void 0 : i.isWrapped;
  return r;
}
function k1(e, t, r, i, s, n) {
  let o;
  return vs(r, i, s, n).length > 0 ? o = i - _r(i, s) : o = t, e < r && o <= i || e >= r && o < i ? "C" : "D";
}
function If(e, t) {
  return e > t ? "A" : "B";
}
function Nf(e, t, r, i, s, n) {
  let o = e, a = t, h = "";
  for (; (o !== r || a !== i) && a >= 0 && a < n.buffer.lines.length; ) o += s ? 1 : -1, s && o > n.cols - 1 ? (h += n.buffer.translateBufferLineToString(a, !1, e, o), o = 0, e = 0, a++) : !s && o < 0 && (h += n.buffer.translateBufferLineToString(a, !1, 0, e + 1), o = n.cols - 1, e = o, a--);
  return h + n.buffer.translateBufferLineToString(a, !1, e, o);
}
function Qr(e, t) {
  let r = t ? "O" : "[";
  return q.ESC + r + e;
}
function ei(e, t) {
  e = Math.floor(e);
  let r = "";
  for (let i = 0; i < e; i++) r += t;
  return r;
}
var B1 = class {
  constructor(e) {
    this._bufferService = e, this.isSelectAllActive = !1, this.selectionStartLength = 0;
  }
  clearSelection() {
    this.selectionStart = void 0, this.selectionEnd = void 0, this.isSelectAllActive = !1, this.selectionStartLength = 0;
  }
  get finalSelectionStart() {
    return this.isSelectAllActive ? [0, 0] : !this.selectionEnd || !this.selectionStart ? this.selectionStart : this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
  }
  get finalSelectionEnd() {
    if (this.isSelectAllActive) return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
    if (this.selectionStart) {
      if (!this.selectionEnd || this.areSelectionValuesReversed()) {
        let e = this.selectionStart[0] + this.selectionStartLength;
        return e > this._bufferService.cols ? e % this._bufferService.cols === 0 ? [this._bufferService.cols, this.selectionStart[1] + Math.floor(e / this._bufferService.cols) - 1] : [e % this._bufferService.cols, this.selectionStart[1] + Math.floor(e / this._bufferService.cols)] : [e, this.selectionStart[1]];
      }
      if (this.selectionStartLength && this.selectionEnd[1] === this.selectionStart[1]) {
        let e = this.selectionStart[0] + this.selectionStartLength;
        return e > this._bufferService.cols ? [e % this._bufferService.cols, this.selectionStart[1] + Math.floor(e / this._bufferService.cols)] : [Math.max(e, this.selectionEnd[0]), this.selectionEnd[1]];
      }
      return this.selectionEnd;
    }
  }
  areSelectionValuesReversed() {
    let e = this.selectionStart, t = this.selectionEnd;
    return !e || !t ? !1 : e[1] > t[1] || e[1] === t[1] && e[0] > t[0];
  }
  handleTrim(e) {
    return this.selectionStart && (this.selectionStart[1] -= e), this.selectionEnd && (this.selectionEnd[1] -= e), this.selectionEnd && this.selectionEnd[1] < 0 ? (this.clearSelection(), !0) : (this.selectionStart && this.selectionStart[1] < 0 && (this.selectionStart[1] = 0), !1);
  }
};
function Sc(e, t) {
  if (e.start.y > e.end.y) throw new Error(`Buffer range end (${e.end.x}, ${e.end.y}) cannot be before start (${e.start.x}, ${e.start.y})`);
  return t * (e.end.y - e.start.y) + (e.end.x - e.start.x + 1);
}
var po = 50, R1 = 15, A1 = 50, D1 = 500, T1 = " ", L1 = new RegExp(T1, "g"), sa = class extends de {
  constructor(e, t, r, i, s, n, o, a, h) {
    super(), this._element = e, this._screenElement = t, this._linkifier = r, this._bufferService = i, this._coreService = s, this._mouseService = n, this._optionsService = o, this._renderService = a, this._coreBrowserService = h, this._dragScrollAmount = 0, this._enabled = !0, this._workCell = new pt(), this._mouseDownTimeStamp = 0, this._oldHasSelection = !1, this._oldSelectionStart = void 0, this._oldSelectionEnd = void 0, this._onLinuxMouseSelection = this._register(new Q()), this.onLinuxMouseSelection = this._onLinuxMouseSelection.event, this._onRedrawRequest = this._register(new Q()), this.onRequestRedraw = this._onRedrawRequest.event, this._onSelectionChange = this._register(new Q()), this.onSelectionChange = this._onSelectionChange.event, this._onRequestScrollLines = this._register(new Q()), this.onRequestScrollLines = this._onRequestScrollLines.event, this._mouseMoveListener = (l) => this._handleMouseMove(l), this._mouseUpListener = (l) => this._handleMouseUp(l), this._coreService.onUserInput(() => {
      this.hasSelection && this.clearSelection();
    }), this._trimListener = this._bufferService.buffer.lines.onTrim((l) => this._handleTrim(l)), this._register(this._bufferService.buffers.onBufferActivate((l) => this._handleBufferActivate(l))), this.enable(), this._model = new B1(this._bufferService), this._activeSelectionMode = 0, this._register(Se(() => {
      this._removeMouseDownListeners();
    })), this._register(this._bufferService.onResize((l) => {
      l.rowsChanged && this.clearSelection();
    }));
  }
  reset() {
    this.clearSelection();
  }
  disable() {
    this.clearSelection(), this._enabled = !1;
  }
  enable() {
    this._enabled = !0;
  }
  get selectionStart() {
    return this._model.finalSelectionStart;
  }
  get selectionEnd() {
    return this._model.finalSelectionEnd;
  }
  get hasSelection() {
    let e = this._model.finalSelectionStart, t = this._model.finalSelectionEnd;
    return !e || !t ? !1 : e[0] !== t[0] || e[1] !== t[1];
  }
  get selectionText() {
    let e = this._model.finalSelectionStart, t = this._model.finalSelectionEnd;
    if (!e || !t) return "";
    let r = this._bufferService.buffer, i = [];
    if (this._activeSelectionMode === 3) {
      if (e[0] === t[0]) return "";
      let s = e[0] < t[0] ? e[0] : t[0], n = e[0] < t[0] ? t[0] : e[0];
      for (let o = e[1]; o <= t[1]; o++) {
        let a = r.translateBufferLineToString(o, !0, s, n);
        i.push(a);
      }
    } else {
      let s = e[1] === t[1] ? t[0] : void 0;
      i.push(r.translateBufferLineToString(e[1], !0, e[0], s));
      for (let n = e[1] + 1; n <= t[1] - 1; n++) {
        let o = r.lines.get(n), a = r.translateBufferLineToString(n, !0);
        o != null && o.isWrapped ? i[i.length - 1] += a : i.push(a);
      }
      if (e[1] !== t[1]) {
        let n = r.lines.get(t[1]), o = r.translateBufferLineToString(t[1], !0, 0, t[0]);
        n && n.isWrapped ? i[i.length - 1] += o : i.push(o);
      }
    }
    return i.map((s) => s.replace(L1, " ")).join(Pf ? `\r
` : `
`);
  }
  clearSelection() {
    this._model.clearSelection(), this._removeMouseDownListeners(), this.refresh(), this._onSelectionChange.fire();
  }
  refresh(e) {
    this._refreshAnimationFrame || (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._refresh())), qa && e && this.selectionText.length && this._onLinuxMouseSelection.fire(this.selectionText);
  }
  _refresh() {
    this._refreshAnimationFrame = void 0, this._onRedrawRequest.fire({ start: this._model.finalSelectionStart, end: this._model.finalSelectionEnd, columnSelectMode: this._activeSelectionMode === 3 });
  }
  _isClickInSelection(e) {
    let t = this._getMouseBufferCoords(e), r = this._model.finalSelectionStart, i = this._model.finalSelectionEnd;
    return !r || !i || !t ? !1 : this._areCoordsInSelection(t, r, i);
  }
  isCellInSelection(e, t) {
    let r = this._model.finalSelectionStart, i = this._model.finalSelectionEnd;
    return !r || !i ? !1 : this._areCoordsInSelection([e, t], r, i);
  }
  _areCoordsInSelection(e, t, r) {
    return e[1] > t[1] && e[1] < r[1] || t[1] === r[1] && e[1] === t[1] && e[0] >= t[0] && e[0] < r[0] || t[1] < r[1] && e[1] === r[1] && e[0] < r[0] || t[1] < r[1] && e[1] === t[1] && e[0] >= t[0];
  }
  _selectWordAtCursor(e, t) {
    var s, n;
    let r = (n = (s = this._linkifier.currentLink) == null ? void 0 : s.link) == null ? void 0 : n.range;
    if (r) return this._model.selectionStart = [r.start.x - 1, r.start.y - 1], this._model.selectionStartLength = Sc(r, this._bufferService.cols), this._model.selectionEnd = void 0, !0;
    let i = this._getMouseBufferCoords(e);
    return i ? (this._selectWordAt(i, t), this._model.selectionEnd = void 0, !0) : !1;
  }
  selectAll() {
    this._model.isSelectAllActive = !0, this.refresh(), this._onSelectionChange.fire();
  }
  selectLines(e, t) {
    this._model.clearSelection(), e = Math.max(e, 0), t = Math.min(t, this._bufferService.buffer.lines.length - 1), this._model.selectionStart = [0, e], this._model.selectionEnd = [this._bufferService.cols, t], this.refresh(), this._onSelectionChange.fire();
  }
  _handleTrim(e) {
    this._model.handleTrim(e) && this.refresh();
  }
  _getMouseBufferCoords(e) {
    let t = this._mouseService.getCoords(e, this._screenElement, this._bufferService.cols, this._bufferService.rows, !0);
    if (t) return t[0]--, t[1]--, t[1] += this._bufferService.buffer.ydisp, t;
  }
  _getMouseEventScrollAmount(e) {
    let t = za(this._coreBrowserService.window, e, this._screenElement)[1], r = this._renderService.dimensions.css.canvas.height;
    return t >= 0 && t <= r ? 0 : (t > r && (t -= r), t = Math.min(Math.max(t, -po), po), t /= po, t / Math.abs(t) + Math.round(t * (R1 - 1)));
  }
  shouldForceSelection(e) {
    return ns ? e.altKey && this._optionsService.rawOptions.macOptionClickForcesSelection : e.shiftKey;
  }
  handleMouseDown(e) {
    if (this._mouseDownTimeStamp = e.timeStamp, !(e.button === 2 && this.hasSelection) && e.button === 0) {
      if (!this._enabled) {
        if (!this.shouldForceSelection(e)) return;
        e.stopPropagation();
      }
      e.preventDefault(), this._dragScrollAmount = 0, this._enabled && e.shiftKey ? this._handleIncrementalClick(e) : e.detail === 1 ? this._handleSingleClick(e) : e.detail === 2 ? this._handleDoubleClick(e) : e.detail === 3 && this._handleTripleClick(e), this._addMouseDownListeners(), this.refresh(!0);
    }
  }
  _addMouseDownListeners() {
    this._screenElement.ownerDocument && (this._screenElement.ownerDocument.addEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.addEventListener("mouseup", this._mouseUpListener)), this._dragScrollIntervalTimer = this._coreBrowserService.window.setInterval(() => this._dragScroll(), A1);
  }
  _removeMouseDownListeners() {
    this._screenElement.ownerDocument && (this._screenElement.ownerDocument.removeEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.removeEventListener("mouseup", this._mouseUpListener)), this._coreBrowserService.window.clearInterval(this._dragScrollIntervalTimer), this._dragScrollIntervalTimer = void 0;
  }
  _handleIncrementalClick(e) {
    this._model.selectionStart && (this._model.selectionEnd = this._getMouseBufferCoords(e));
  }
  _handleSingleClick(e) {
    if (this._model.selectionStartLength = 0, this._model.isSelectAllActive = !1, this._activeSelectionMode = this.shouldColumnSelect(e) ? 3 : 0, this._model.selectionStart = this._getMouseBufferCoords(e), !this._model.selectionStart) return;
    this._model.selectionEnd = void 0;
    let t = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
    t && t.length !== this._model.selectionStart[0] && t.hasWidth(this._model.selectionStart[0]) === 0 && this._model.selectionStart[0]++;
  }
  _handleDoubleClick(e) {
    this._selectWordAtCursor(e, !0) && (this._activeSelectionMode = 1);
  }
  _handleTripleClick(e) {
    let t = this._getMouseBufferCoords(e);
    t && (this._activeSelectionMode = 2, this._selectLineAt(t[1]));
  }
  shouldColumnSelect(e) {
    return e.altKey && !(ns && this._optionsService.rawOptions.macOptionClickForcesSelection);
  }
  _handleMouseMove(e) {
    if (e.stopImmediatePropagation(), !this._model.selectionStart) return;
    let t = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
    if (this._model.selectionEnd = this._getMouseBufferCoords(e), !this._model.selectionEnd) {
      this.refresh(!0);
      return;
    }
    this._activeSelectionMode === 2 ? this._model.selectionEnd[1] < this._model.selectionStart[1] ? this._model.selectionEnd[0] = 0 : this._model.selectionEnd[0] = this._bufferService.cols : this._activeSelectionMode === 1 && this._selectToWordAt(this._model.selectionEnd), this._dragScrollAmount = this._getMouseEventScrollAmount(e), this._activeSelectionMode !== 3 && (this._dragScrollAmount > 0 ? this._model.selectionEnd[0] = this._bufferService.cols : this._dragScrollAmount < 0 && (this._model.selectionEnd[0] = 0));
    let r = this._bufferService.buffer;
    if (this._model.selectionEnd[1] < r.lines.length) {
      let i = r.lines.get(this._model.selectionEnd[1]);
      i && i.hasWidth(this._model.selectionEnd[0]) === 0 && this._model.selectionEnd[0] < this._bufferService.cols && this._model.selectionEnd[0]++;
    }
    (!t || t[0] !== this._model.selectionEnd[0] || t[1] !== this._model.selectionEnd[1]) && this.refresh(!0);
  }
  _dragScroll() {
    if (!(!this._model.selectionEnd || !this._model.selectionStart) && this._dragScrollAmount) {
      this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: !1 });
      let e = this._bufferService.buffer;
      this._dragScrollAmount > 0 ? (this._activeSelectionMode !== 3 && (this._model.selectionEnd[0] = this._bufferService.cols), this._model.selectionEnd[1] = Math.min(e.ydisp + this._bufferService.rows, e.lines.length - 1)) : (this._activeSelectionMode !== 3 && (this._model.selectionEnd[0] = 0), this._model.selectionEnd[1] = e.ydisp), this.refresh();
    }
  }
  _handleMouseUp(e) {
    let t = e.timeStamp - this._mouseDownTimeStamp;
    if (this._removeMouseDownListeners(), this.selectionText.length <= 1 && t < D1 && e.altKey && this._optionsService.rawOptions.altClickMovesCursor) {
      if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
        let r = this._mouseService.getCoords(e, this._element, this._bufferService.cols, this._bufferService.rows, !1);
        if (r && r[0] !== void 0 && r[1] !== void 0) {
          let i = b1(r[0] - 1, r[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
          this._coreService.triggerDataEvent(i, !0);
        }
      }
    } else this._fireEventIfSelectionChanged();
  }
  _fireEventIfSelectionChanged() {
    let e = this._model.finalSelectionStart, t = this._model.finalSelectionEnd, r = !!e && !!t && (e[0] !== t[0] || e[1] !== t[1]);
    if (!r) {
      this._oldHasSelection && this._fireOnSelectionChange(e, t, r);
      return;
    }
    !e || !t || (!this._oldSelectionStart || !this._oldSelectionEnd || e[0] !== this._oldSelectionStart[0] || e[1] !== this._oldSelectionStart[1] || t[0] !== this._oldSelectionEnd[0] || t[1] !== this._oldSelectionEnd[1]) && this._fireOnSelectionChange(e, t, r);
  }
  _fireOnSelectionChange(e, t, r) {
    this._oldSelectionStart = e, this._oldSelectionEnd = t, this._oldHasSelection = r, this._onSelectionChange.fire();
  }
  _handleBufferActivate(e) {
    this.clearSelection(), this._trimListener.dispose(), this._trimListener = e.activeBuffer.lines.onTrim((t) => this._handleTrim(t));
  }
  _convertViewportColToCharacterIndex(e, t) {
    let r = t;
    for (let i = 0; t >= i; i++) {
      let s = e.loadCell(i, this._workCell).getChars().length;
      this._workCell.getWidth() === 0 ? r-- : s > 1 && t !== i && (r += s - 1);
    }
    return r;
  }
  setSelection(e, t, r) {
    this._model.clearSelection(), this._removeMouseDownListeners(), this._model.selectionStart = [e, t], this._model.selectionStartLength = r, this.refresh(), this._fireEventIfSelectionChanged();
  }
  rightClickSelect(e) {
    this._isClickInSelection(e) || (this._selectWordAtCursor(e, !1) && this.refresh(!0), this._fireEventIfSelectionChanged());
  }
  _getWordAt(e, t, r = !0, i = !0) {
    if (e[0] >= this._bufferService.cols) return;
    let s = this._bufferService.buffer, n = s.lines.get(e[1]);
    if (!n) return;
    let o = s.translateBufferLineToString(e[1], !1), a = this._convertViewportColToCharacterIndex(n, e[0]), h = a, l = e[0] - a, c = 0, u = 0, p = 0, _ = 0;
    if (o.charAt(a) === " ") {
      for (; a > 0 && o.charAt(a - 1) === " "; ) a--;
      for (; h < o.length && o.charAt(h + 1) === " "; ) h++;
    } else {
      let w = e[0], y = e[0];
      n.getWidth(w) === 0 && (c++, w--), n.getWidth(y) === 2 && (u++, y++);
      let E = n.getString(y).length;
      for (E > 1 && (_ += E - 1, h += E - 1); w > 0 && a > 0 && !this._isCharWordSeparator(n.loadCell(w - 1, this._workCell)); ) {
        n.loadCell(w - 1, this._workCell);
        let S = this._workCell.getChars().length;
        this._workCell.getWidth() === 0 ? (c++, w--) : S > 1 && (p += S - 1, a -= S - 1), a--, w--;
      }
      for (; y < n.length && h + 1 < o.length && !this._isCharWordSeparator(n.loadCell(y + 1, this._workCell)); ) {
        n.loadCell(y + 1, this._workCell);
        let S = this._workCell.getChars().length;
        this._workCell.getWidth() === 2 ? (u++, y++) : S > 1 && (_ += S - 1, h += S - 1), h++, y++;
      }
    }
    h++;
    let m = a + l - c + p, g = Math.min(this._bufferService.cols, h - a + c + u - p - _);
    if (!(!t && o.slice(a, h).trim() === "")) {
      if (r && m === 0 && n.getCodePoint(0) !== 32) {
        let w = s.lines.get(e[1] - 1);
        if (w && n.isWrapped && w.getCodePoint(this._bufferService.cols - 1) !== 32) {
          let y = this._getWordAt([this._bufferService.cols - 1, e[1] - 1], !1, !0, !1);
          if (y) {
            let E = this._bufferService.cols - y.start;
            m -= E, g += E;
          }
        }
      }
      if (i && m + g === this._bufferService.cols && n.getCodePoint(this._bufferService.cols - 1) !== 32) {
        let w = s.lines.get(e[1] + 1);
        if (w != null && w.isWrapped && w.getCodePoint(0) !== 32) {
          let y = this._getWordAt([0, e[1] + 1], !1, !1, !0);
          y && (g += y.length);
        }
      }
      return { start: m, length: g };
    }
  }
  _selectWordAt(e, t) {
    let r = this._getWordAt(e, t);
    if (r) {
      for (; r.start < 0; ) r.start += this._bufferService.cols, e[1]--;
      this._model.selectionStart = [r.start, e[1]], this._model.selectionStartLength = r.length;
    }
  }
  _selectToWordAt(e) {
    let t = this._getWordAt(e, !0);
    if (t) {
      let r = e[1];
      for (; t.start < 0; ) t.start += this._bufferService.cols, r--;
      if (!this._model.areSelectionValuesReversed()) for (; t.start + t.length > this._bufferService.cols; ) t.length -= this._bufferService.cols, r++;
      this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? t.start : t.start + t.length, r];
    }
  }
  _isCharWordSeparator(e) {
    return e.getWidth() === 0 ? !1 : this._optionsService.rawOptions.wordSeparator.indexOf(e.getChars()) >= 0;
  }
  _selectLineAt(e) {
    let t = this._bufferService.buffer.getWrappedRangeForLine(e), r = { start: { x: 0, y: t.first }, end: { x: this._bufferService.cols - 1, y: t.last } };
    this._model.selectionStart = [0, t.first], this._model.selectionEnd = void 0, this._model.selectionStartLength = Sc(r, this._bufferService.cols);
  }
};
sa = Ae([re(3, Ye), re(4, vr), re(5, Oa), re(6, Xe), re(7, qt), re(8, zt)], sa);
var Cc = class {
  constructor() {
    this._data = {};
  }
  set(e, t, r) {
    this._data[e] || (this._data[e] = {}), this._data[e][t] = r;
  }
  get(e, t) {
    return this._data[e] ? this._data[e][t] : void 0;
  }
  clear() {
    this._data = {};
  }
}, Ec = class {
  constructor() {
    this._color = new Cc(), this._css = new Cc();
  }
  setCss(e, t, r) {
    this._css.set(e, t, r);
  }
  getCss(e, t) {
    return this._css.get(e, t);
  }
  setColor(e, t, r) {
    this._color.set(e, t, r);
  }
  getColor(e, t) {
    return this._color.get(e, t);
  }
  clear() {
    this._color.clear(), this._css.clear();
  }
}, Me = Object.freeze((() => {
  let e = [xe.toColor("#2e3436"), xe.toColor("#cc0000"), xe.toColor("#4e9a06"), xe.toColor("#c4a000"), xe.toColor("#3465a4"), xe.toColor("#75507b"), xe.toColor("#06989a"), xe.toColor("#d3d7cf"), xe.toColor("#555753"), xe.toColor("#ef2929"), xe.toColor("#8ae234"), xe.toColor("#fce94f"), xe.toColor("#729fcf"), xe.toColor("#ad7fa8"), xe.toColor("#34e2e2"), xe.toColor("#eeeeec")], t = [0, 95, 135, 175, 215, 255];
  for (let r = 0; r < 216; r++) {
    let i = t[r / 36 % 6 | 0], s = t[r / 6 % 6 | 0], n = t[r % 6];
    e.push({ css: Pe.toCss(i, s, n), rgba: Pe.toRgba(i, s, n) });
  }
  for (let r = 0; r < 24; r++) {
    let i = 8 + r * 10;
    e.push({ css: Pe.toCss(i, i, i), rgba: Pe.toRgba(i, i, i) });
  }
  return e;
})()), or = xe.toColor("#ffffff"), Vr = xe.toColor("#000000"), xc = xe.toColor("#ffffff"), kc = Vr, Wr = { css: "rgba(255, 255, 255, 0.3)", rgba: 4294967117 }, P1 = or, na = class extends de {
  constructor(e) {
    super(), this._optionsService = e, this._contrastCache = new Ec(), this._halfContrastCache = new Ec(), this._onChangeColors = this._register(new Q()), this.onChangeColors = this._onChangeColors.event, this._colors = { foreground: or, background: Vr, cursor: xc, cursorAccent: kc, selectionForeground: void 0, selectionBackgroundTransparent: Wr, selectionBackgroundOpaque: be.blend(Vr, Wr), selectionInactiveBackgroundTransparent: Wr, selectionInactiveBackgroundOpaque: be.blend(Vr, Wr), scrollbarSliderBackground: be.opacity(or, 0.2), scrollbarSliderHoverBackground: be.opacity(or, 0.4), scrollbarSliderActiveBackground: be.opacity(or, 0.5), overviewRulerBorder: or, ansi: Me.slice(), contrastCache: this._contrastCache, halfContrastCache: this._halfContrastCache }, this._updateRestoreColors(), this._setTheme(this._optionsService.rawOptions.theme), this._register(this._optionsService.onSpecificOptionChange("minimumContrastRatio", () => this._contrastCache.clear())), this._register(this._optionsService.onSpecificOptionChange("theme", () => this._setTheme(this._optionsService.rawOptions.theme)));
  }
  get colors() {
    return this._colors;
  }
  _setTheme(e = {}) {
    let t = this._colors;
    if (t.foreground = me(e.foreground, or), t.background = me(e.background, Vr), t.cursor = be.blend(t.background, me(e.cursor, xc)), t.cursorAccent = be.blend(t.background, me(e.cursorAccent, kc)), t.selectionBackgroundTransparent = me(e.selectionBackground, Wr), t.selectionBackgroundOpaque = be.blend(t.background, t.selectionBackgroundTransparent), t.selectionInactiveBackgroundTransparent = me(e.selectionInactiveBackground, t.selectionBackgroundTransparent), t.selectionInactiveBackgroundOpaque = be.blend(t.background, t.selectionInactiveBackgroundTransparent), t.selectionForeground = e.selectionForeground ? me(e.selectionForeground, yc) : void 0, t.selectionForeground === yc && (t.selectionForeground = void 0), be.isOpaque(t.selectionBackgroundTransparent) && (t.selectionBackgroundTransparent = be.opacity(t.selectionBackgroundTransparent, 0.3)), be.isOpaque(t.selectionInactiveBackgroundTransparent) && (t.selectionInactiveBackgroundTransparent = be.opacity(t.selectionInactiveBackgroundTransparent, 0.3)), t.scrollbarSliderBackground = me(e.scrollbarSliderBackground, be.opacity(t.foreground, 0.2)), t.scrollbarSliderHoverBackground = me(e.scrollbarSliderHoverBackground, be.opacity(t.foreground, 0.4)), t.scrollbarSliderActiveBackground = me(e.scrollbarSliderActiveBackground, be.opacity(t.foreground, 0.5)), t.overviewRulerBorder = me(e.overviewRulerBorder, P1), t.ansi = Me.slice(), t.ansi[0] = me(e.black, Me[0]), t.ansi[1] = me(e.red, Me[1]), t.ansi[2] = me(e.green, Me[2]), t.ansi[3] = me(e.yellow, Me[3]), t.ansi[4] = me(e.blue, Me[4]), t.ansi[5] = me(e.magenta, Me[5]), t.ansi[6] = me(e.cyan, Me[6]), t.ansi[7] = me(e.white, Me[7]), t.ansi[8] = me(e.brightBlack, Me[8]), t.ansi[9] = me(e.brightRed, Me[9]), t.ansi[10] = me(e.brightGreen, Me[10]), t.ansi[11] = me(e.brightYellow, Me[11]), t.ansi[12] = me(e.brightBlue, Me[12]), t.ansi[13] = me(e.brightMagenta, Me[13]), t.ansi[14] = me(e.brightCyan, Me[14]), t.ansi[15] = me(e.brightWhite, Me[15]), e.extendedAnsi) {
      let r = Math.min(t.ansi.length - 16, e.extendedAnsi.length);
      for (let i = 0; i < r; i++) t.ansi[i + 16] = me(e.extendedAnsi[i], Me[i + 16]);
    }
    this._contrastCache.clear(), this._halfContrastCache.clear(), this._updateRestoreColors(), this._onChangeColors.fire(this.colors);
  }
  restoreColor(e) {
    this._restoreColor(e), this._onChangeColors.fire(this.colors);
  }
  _restoreColor(e) {
    if (e === void 0) {
      for (let t = 0; t < this._restoreColors.ansi.length; ++t) this._colors.ansi[t] = this._restoreColors.ansi[t];
      return;
    }
    switch (e) {
      case 256:
        this._colors.foreground = this._restoreColors.foreground;
        break;
      case 257:
        this._colors.background = this._restoreColors.background;
        break;
      case 258:
        this._colors.cursor = this._restoreColors.cursor;
        break;
      default:
        this._colors.ansi[e] = this._restoreColors.ansi[e];
    }
  }
  modifyColors(e) {
    e(this._colors), this._onChangeColors.fire(this.colors);
  }
  _updateRestoreColors() {
    this._restoreColors = { foreground: this._colors.foreground, background: this._colors.background, cursor: this._colors.cursor, ansi: this._colors.ansi.slice() };
  }
};
na = Ae([re(0, Xe)], na);
function me(e, t) {
  if (e !== void 0) try {
    return xe.toColor(e);
  } catch {
  }
  return t;
}
var M1 = class {
  constructor(...e) {
    this._entries = /* @__PURE__ */ new Map();
    for (let [t, r] of e) this.set(t, r);
  }
  set(e, t) {
    let r = this._entries.get(e);
    return this._entries.set(e, t), r;
  }
  forEach(e) {
    for (let [t, r] of this._entries.entries()) e(t, r);
  }
  has(e) {
    return this._entries.has(e);
  }
  get(e) {
    return this._entries.get(e);
  }
}, O1 = class {
  constructor() {
    this._services = new M1(), this._services.set(Ma, this);
  }
  setService(e, t) {
    this._services.set(e, t);
  }
  getService(e) {
    return this._services.get(e);
  }
  createInstance(e, ...t) {
    let r = Rg(e).sort((n, o) => n.index - o.index), i = [];
    for (let n of r) {
      let o = this._services.get(n.id);
      if (!o) throw new Error(`[createInstance] ${e.name} depends on UNKNOWN service ${n.id._id}.`);
      i.push(o);
    }
    let s = r.length > 0 ? r[0].index : t.length;
    if (t.length !== s) throw new Error(`[createInstance] First service dependency of ${e.name} at position ${s + 1} conflicts with ${t.length} static arguments`);
    return new e(...t, ...i);
  }
}, I1 = { trace: 0, debug: 1, info: 2, warn: 3, error: 4, off: 5 }, N1 = "xterm.js: ", oa = class extends de {
  constructor(e) {
    super(), this._optionsService = e, this._logLevel = 5, this._updateLogLevel(), this._register(this._optionsService.onSpecificOptionChange("logLevel", () => this._updateLogLevel()));
  }
  get logLevel() {
    return this._logLevel;
  }
  _updateLogLevel() {
    this._logLevel = I1[this._optionsService.rawOptions.logLevel];
  }
  _evalLazyOptionalParams(e) {
    for (let t = 0; t < e.length; t++) typeof e[t] == "function" && (e[t] = e[t]());
  }
  _log(e, t, r) {
    this._evalLazyOptionalParams(r), e.call(console, (this._optionsService.options.logger ? "" : N1) + t, ...r);
  }
  trace(e, ...t) {
    var r;
    this._logLevel <= 0 && this._log(((r = this._optionsService.options.logger) == null ? void 0 : r.trace.bind(this._optionsService.options.logger)) ?? console.log, e, t);
  }
  debug(e, ...t) {
    var r;
    this._logLevel <= 1 && this._log(((r = this._optionsService.options.logger) == null ? void 0 : r.debug.bind(this._optionsService.options.logger)) ?? console.log, e, t);
  }
  info(e, ...t) {
    var r;
    this._logLevel <= 2 && this._log(((r = this._optionsService.options.logger) == null ? void 0 : r.info.bind(this._optionsService.options.logger)) ?? console.info, e, t);
  }
  warn(e, ...t) {
    var r;
    this._logLevel <= 3 && this._log(((r = this._optionsService.options.logger) == null ? void 0 : r.warn.bind(this._optionsService.options.logger)) ?? console.warn, e, t);
  }
  error(e, ...t) {
    var r;
    this._logLevel <= 4 && this._log(((r = this._optionsService.options.logger) == null ? void 0 : r.error.bind(this._optionsService.options.logger)) ?? console.error, e, t);
  }
};
oa = Ae([re(0, Xe)], oa);
var Bc = class extends de {
  constructor(e) {
    super(), this._maxLength = e, this.onDeleteEmitter = this._register(new Q()), this.onDelete = this.onDeleteEmitter.event, this.onInsertEmitter = this._register(new Q()), this.onInsert = this.onInsertEmitter.event, this.onTrimEmitter = this._register(new Q()), this.onTrim = this.onTrimEmitter.event, this._array = new Array(this._maxLength), this._startIndex = 0, this._length = 0;
  }
  get maxLength() {
    return this._maxLength;
  }
  set maxLength(e) {
    if (this._maxLength === e) return;
    let t = new Array(e);
    for (let r = 0; r < Math.min(e, this.length); r++) t[r] = this._array[this._getCyclicIndex(r)];
    this._array = t, this._maxLength = e, this._startIndex = 0;
  }
  get length() {
    return this._length;
  }
  set length(e) {
    if (e > this._length) for (let t = this._length; t < e; t++) this._array[t] = void 0;
    this._length = e;
  }
  get(e) {
    return this._array[this._getCyclicIndex(e)];
  }
  set(e, t) {
    this._array[this._getCyclicIndex(e)] = t;
  }
  push(e) {
    this._array[this._getCyclicIndex(this._length)] = e, this._length === this._maxLength ? (this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1)) : this._length++;
  }
  recycle() {
    if (this._length !== this._maxLength) throw new Error("Can only recycle when the buffer is full");
    return this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1), this._array[this._getCyclicIndex(this._length - 1)];
  }
  get isFull() {
    return this._length === this._maxLength;
  }
  pop() {
    return this._array[this._getCyclicIndex(this._length-- - 1)];
  }
  splice(e, t, ...r) {
    if (t) {
      for (let i = e; i < this._length - t; i++) this._array[this._getCyclicIndex(i)] = this._array[this._getCyclicIndex(i + t)];
      this._length -= t, this.onDeleteEmitter.fire({ index: e, amount: t });
    }
    for (let i = this._length - 1; i >= e; i--) this._array[this._getCyclicIndex(i + r.length)] = this._array[this._getCyclicIndex(i)];
    for (let i = 0; i < r.length; i++) this._array[this._getCyclicIndex(e + i)] = r[i];
    if (r.length && this.onInsertEmitter.fire({ index: e, amount: r.length }), this._length + r.length > this._maxLength) {
      let i = this._length + r.length - this._maxLength;
      this._startIndex += i, this._length = this._maxLength, this.onTrimEmitter.fire(i);
    } else this._length += r.length;
  }
  trimStart(e) {
    e > this._length && (e = this._length), this._startIndex += e, this._length -= e, this.onTrimEmitter.fire(e);
  }
  shiftElements(e, t, r) {
    if (!(t <= 0)) {
      if (e < 0 || e >= this._length) throw new Error("start argument out of range");
      if (e + r < 0) throw new Error("Cannot shift elements in list beyond index 0");
      if (r > 0) {
        for (let s = t - 1; s >= 0; s--) this.set(e + s + r, this.get(e + s));
        let i = e + t + r - this._length;
        if (i > 0) for (this._length += i; this._length > this._maxLength; ) this._length--, this._startIndex++, this.onTrimEmitter.fire(1);
      } else for (let i = 0; i < t; i++) this.set(e + i + r, this.get(e + i));
    }
  }
  _getCyclicIndex(e) {
    return (this._startIndex + e) % this._maxLength;
  }
}, fe = 3, Le = Object.freeze(new oi()), Pi = 0, _o = 2, Gr = class Ff {
  constructor(t, r, i = !1) {
    this.isWrapped = i, this._combined = {}, this._extendedAttrs = {}, this._data = new Uint32Array(t * fe);
    let s = r || pt.fromCharData([0, rf, 1, 0]);
    for (let n = 0; n < t; ++n) this.setCell(n, s);
    this.length = t;
  }
  get(t) {
    let r = this._data[t * fe + 0], i = r & 2097151;
    return [this._data[t * fe + 1], r & 2097152 ? this._combined[t] : i ? Zt(i) : "", r >> 22, r & 2097152 ? this._combined[t].charCodeAt(this._combined[t].length - 1) : i];
  }
  set(t, r) {
    this._data[t * fe + 1] = r[0], r[1].length > 1 ? (this._combined[t] = r[1], this._data[t * fe + 0] = t | 2097152 | r[2] << 22) : this._data[t * fe + 0] = r[1].charCodeAt(0) | r[2] << 22;
  }
  getWidth(t) {
    return this._data[t * fe + 0] >> 22;
  }
  hasWidth(t) {
    return this._data[t * fe + 0] & 12582912;
  }
  getFg(t) {
    return this._data[t * fe + 1];
  }
  getBg(t) {
    return this._data[t * fe + 2];
  }
  hasContent(t) {
    return this._data[t * fe + 0] & 4194303;
  }
  getCodePoint(t) {
    let r = this._data[t * fe + 0];
    return r & 2097152 ? this._combined[t].charCodeAt(this._combined[t].length - 1) : r & 2097151;
  }
  isCombined(t) {
    return this._data[t * fe + 0] & 2097152;
  }
  getString(t) {
    let r = this._data[t * fe + 0];
    return r & 2097152 ? this._combined[t] : r & 2097151 ? Zt(r & 2097151) : "";
  }
  isProtected(t) {
    return this._data[t * fe + 2] & 536870912;
  }
  loadCell(t, r) {
    return Pi = t * fe, r.content = this._data[Pi + 0], r.fg = this._data[Pi + 1], r.bg = this._data[Pi + 2], r.content & 2097152 && (r.combinedData = this._combined[t]), r.bg & 268435456 && (r.extended = this._extendedAttrs[t]), r;
  }
  setCell(t, r) {
    r.content & 2097152 && (this._combined[t] = r.combinedData), r.bg & 268435456 && (this._extendedAttrs[t] = r.extended), this._data[t * fe + 0] = r.content, this._data[t * fe + 1] = r.fg, this._data[t * fe + 2] = r.bg;
  }
  setCellFromCodepoint(t, r, i, s) {
    s.bg & 268435456 && (this._extendedAttrs[t] = s.extended), this._data[t * fe + 0] = r | i << 22, this._data[t * fe + 1] = s.fg, this._data[t * fe + 2] = s.bg;
  }
  addCodepointToCell(t, r, i) {
    let s = this._data[t * fe + 0];
    s & 2097152 ? this._combined[t] += Zt(r) : s & 2097151 ? (this._combined[t] = Zt(s & 2097151) + Zt(r), s &= -2097152, s |= 2097152) : s = r | 1 << 22, i && (s &= -12582913, s |= i << 22), this._data[t * fe + 0] = s;
  }
  insertCells(t, r, i) {
    if (t %= this.length, t && this.getWidth(t - 1) === 2 && this.setCellFromCodepoint(t - 1, 0, 1, i), r < this.length - t) {
      let s = new pt();
      for (let n = this.length - t - r - 1; n >= 0; --n) this.setCell(t + r + n, this.loadCell(t + n, s));
      for (let n = 0; n < r; ++n) this.setCell(t + n, i);
    } else for (let s = t; s < this.length; ++s) this.setCell(s, i);
    this.getWidth(this.length - 1) === 2 && this.setCellFromCodepoint(this.length - 1, 0, 1, i);
  }
  deleteCells(t, r, i) {
    if (t %= this.length, r < this.length - t) {
      let s = new pt();
      for (let n = 0; n < this.length - t - r; ++n) this.setCell(t + n, this.loadCell(t + r + n, s));
      for (let n = this.length - r; n < this.length; ++n) this.setCell(n, i);
    } else for (let s = t; s < this.length; ++s) this.setCell(s, i);
    t && this.getWidth(t - 1) === 2 && this.setCellFromCodepoint(t - 1, 0, 1, i), this.getWidth(t) === 0 && !this.hasContent(t) && this.setCellFromCodepoint(t, 0, 1, i);
  }
  replaceCells(t, r, i, s = !1) {
    if (s) {
      for (t && this.getWidth(t - 1) === 2 && !this.isProtected(t - 1) && this.setCellFromCodepoint(t - 1, 0, 1, i), r < this.length && this.getWidth(r - 1) === 2 && !this.isProtected(r) && this.setCellFromCodepoint(r, 0, 1, i); t < r && t < this.length; ) this.isProtected(t) || this.setCell(t, i), t++;
      return;
    }
    for (t && this.getWidth(t - 1) === 2 && this.setCellFromCodepoint(t - 1, 0, 1, i), r < this.length && this.getWidth(r - 1) === 2 && this.setCellFromCodepoint(r, 0, 1, i); t < r && t < this.length; ) this.setCell(t++, i);
  }
  resize(t, r) {
    if (t === this.length) return this._data.length * 4 * _o < this._data.buffer.byteLength;
    let i = t * fe;
    if (t > this.length) {
      if (this._data.buffer.byteLength >= i * 4) this._data = new Uint32Array(this._data.buffer, 0, i);
      else {
        let s = new Uint32Array(i);
        s.set(this._data), this._data = s;
      }
      for (let s = this.length; s < t; ++s) this.setCell(s, r);
    } else {
      this._data = this._data.subarray(0, i);
      let s = Object.keys(this._combined);
      for (let o = 0; o < s.length; o++) {
        let a = parseInt(s[o], 10);
        a >= t && delete this._combined[a];
      }
      let n = Object.keys(this._extendedAttrs);
      for (let o = 0; o < n.length; o++) {
        let a = parseInt(n[o], 10);
        a >= t && delete this._extendedAttrs[a];
      }
    }
    return this.length = t, i * 4 * _o < this._data.buffer.byteLength;
  }
  cleanupMemory() {
    if (this._data.length * 4 * _o < this._data.buffer.byteLength) {
      let t = new Uint32Array(this._data.length);
      return t.set(this._data), this._data = t, 1;
    }
    return 0;
  }
  fill(t, r = !1) {
    if (r) {
      for (let i = 0; i < this.length; ++i) this.isProtected(i) || this.setCell(i, t);
      return;
    }
    this._combined = {}, this._extendedAttrs = {};
    for (let i = 0; i < this.length; ++i) this.setCell(i, t);
  }
  copyFrom(t) {
    this.length !== t.length ? this._data = new Uint32Array(t._data) : this._data.set(t._data), this.length = t.length, this._combined = {};
    for (let r in t._combined) this._combined[r] = t._combined[r];
    this._extendedAttrs = {};
    for (let r in t._extendedAttrs) this._extendedAttrs[r] = t._extendedAttrs[r];
    this.isWrapped = t.isWrapped;
  }
  clone() {
    let t = new Ff(0);
    t._data = new Uint32Array(this._data), t.length = this.length;
    for (let r in this._combined) t._combined[r] = this._combined[r];
    for (let r in this._extendedAttrs) t._extendedAttrs[r] = this._extendedAttrs[r];
    return t.isWrapped = this.isWrapped, t;
  }
  getTrimmedLength() {
    for (let t = this.length - 1; t >= 0; --t) if (this._data[t * fe + 0] & 4194303) return t + (this._data[t * fe + 0] >> 22);
    return 0;
  }
  getNoBgTrimmedLength() {
    for (let t = this.length - 1; t >= 0; --t) if (this._data[t * fe + 0] & 4194303 || this._data[t * fe + 2] & 50331648) return t + (this._data[t * fe + 0] >> 22);
    return 0;
  }
  copyCellsFrom(t, r, i, s, n) {
    let o = t._data;
    if (n) for (let h = s - 1; h >= 0; h--) {
      for (let l = 0; l < fe; l++) this._data[(i + h) * fe + l] = o[(r + h) * fe + l];
      o[(r + h) * fe + 2] & 268435456 && (this._extendedAttrs[i + h] = t._extendedAttrs[r + h]);
    }
    else for (let h = 0; h < s; h++) {
      for (let l = 0; l < fe; l++) this._data[(i + h) * fe + l] = o[(r + h) * fe + l];
      o[(r + h) * fe + 2] & 268435456 && (this._extendedAttrs[i + h] = t._extendedAttrs[r + h]);
    }
    let a = Object.keys(t._combined);
    for (let h = 0; h < a.length; h++) {
      let l = parseInt(a[h], 10);
      l >= r && (this._combined[l - r + i] = t._combined[l]);
    }
  }
  translateToString(t, r, i, s) {
    r = r ?? 0, i = i ?? this.length, t && (i = Math.min(i, this.getTrimmedLength())), s && (s.length = 0);
    let n = "";
    for (; r < i; ) {
      let o = this._data[r * fe + 0], a = o & 2097151, h = o & 2097152 ? this._combined[r] : a ? Zt(a) : Qt;
      if (n += h, s) for (let l = 0; l < h.length; ++l) s.push(r);
      r += o >> 22 || 1;
    }
    return s && s.push(r), n;
  }
};
function F1(e, t, r, i, s, n) {
  let o = [];
  for (let a = 0; a < e.length - 1; a++) {
    let h = a, l = e.get(++h);
    if (!l.isWrapped) continue;
    let c = [e.get(a)];
    for (; h < e.length && l.isWrapped; ) c.push(l), l = e.get(++h);
    if (!n && i >= a && i < h) {
      a += c.length - 1;
      continue;
    }
    let u = 0, p = ti(c, u, t), _ = 1, m = 0;
    for (; _ < c.length; ) {
      let w = ti(c, _, t), y = w - m, E = r - p, S = Math.min(y, E);
      c[u].copyCellsFrom(c[_], m, p, S, !1), p += S, p === r && (u++, p = 0), m += S, m === w && (_++, m = 0), p === 0 && u !== 0 && c[u - 1].getWidth(r - 1) === 2 && (c[u].copyCellsFrom(c[u - 1], r - 1, p++, 1, !1), c[u - 1].setCell(r - 1, s));
    }
    c[u].replaceCells(p, r, s);
    let g = 0;
    for (let w = c.length - 1; w > 0 && (w > u || c[w].getTrimmedLength() === 0); w--) g++;
    g > 0 && (o.push(a + c.length - g), o.push(g)), a += c.length - 1;
  }
  return o;
}
function U1(e, t) {
  let r = [], i = 0, s = t[i], n = 0;
  for (let o = 0; o < e.length; o++) if (s === o) {
    let a = t[++i];
    e.onDeleteEmitter.fire({ index: o - n, amount: a }), o += a - 1, n += a, s = t[++i];
  } else r.push(o);
  return { layout: r, countRemoved: n };
}
function H1(e, t) {
  let r = [];
  for (let i = 0; i < t.length; i++) r.push(e.get(t[i]));
  for (let i = 0; i < r.length; i++) e.set(i, r[i]);
  e.length = t.length;
}
function W1(e, t, r) {
  let i = [], s = e.map((h, l) => ti(e, l, t)).reduce((h, l) => h + l), n = 0, o = 0, a = 0;
  for (; a < s; ) {
    if (s - a < r) {
      i.push(s - a);
      break;
    }
    n += r;
    let h = ti(e, o, t);
    n > h && (n -= h, o++);
    let l = e[o].getWidth(n - 1) === 2;
    l && n--;
    let c = l ? r - 1 : r;
    i.push(c), a += c;
  }
  return i;
}
function ti(e, t, r) {
  if (t === e.length - 1) return e[t].getTrimmedLength();
  let i = !e[t].hasContent(r - 1) && e[t].getWidth(r - 1) === 1, s = e[t + 1].getWidth(0) === 2;
  return i && s ? r - 1 : r;
}
var Uf = class Hf {
  constructor(t) {
    this.line = t, this.isDisposed = !1, this._disposables = [], this._id = Hf._nextId++, this._onDispose = this.register(new Q()), this.onDispose = this._onDispose.event;
  }
  get id() {
    return this._id;
  }
  dispose() {
    this.isDisposed || (this.isDisposed = !0, this.line = -1, this._onDispose.fire(), pr(this._disposables), this._disposables.length = 0);
  }
  register(t) {
    return this._disposables.push(t), t;
  }
};
Uf._nextId = 1;
var z1 = Uf, Ie = {}, ar = Ie.B;
Ie[0] = { "`": "◆", a: "▒", b: "␉", c: "␌", d: "␍", e: "␊", f: "°", g: "±", h: "␤", i: "␋", j: "┘", k: "┐", l: "┌", m: "└", n: "┼", o: "⎺", p: "⎻", q: "─", r: "⎼", s: "⎽", t: "├", u: "┤", v: "┴", w: "┬", x: "│", y: "≤", z: "≥", "{": "π", "|": "≠", "}": "£", "~": "·" };
Ie.A = { "#": "£" };
Ie.B = void 0;
Ie[4] = { "#": "£", "@": "¾", "[": "ij", "\\": "½", "]": "|", "{": "¨", "|": "f", "}": "¼", "~": "´" };
Ie.C = Ie[5] = { "[": "Ä", "\\": "Ö", "]": "Å", "^": "Ü", "`": "é", "{": "ä", "|": "ö", "}": "å", "~": "ü" };
Ie.R = { "#": "£", "@": "à", "[": "°", "\\": "ç", "]": "§", "{": "é", "|": "ù", "}": "è", "~": "¨" };
Ie.Q = { "@": "à", "[": "â", "\\": "ç", "]": "ê", "^": "î", "`": "ô", "{": "é", "|": "ù", "}": "è", "~": "û" };
Ie.K = { "@": "§", "[": "Ä", "\\": "Ö", "]": "Ü", "{": "ä", "|": "ö", "}": "ü", "~": "ß" };
Ie.Y = { "#": "£", "@": "§", "[": "°", "\\": "ç", "]": "é", "`": "ù", "{": "à", "|": "ò", "}": "è", "~": "ì" };
Ie.E = Ie[6] = { "@": "Ä", "[": "Æ", "\\": "Ø", "]": "Å", "^": "Ü", "`": "ä", "{": "æ", "|": "ø", "}": "å", "~": "ü" };
Ie.Z = { "#": "£", "@": "§", "[": "¡", "\\": "Ñ", "]": "¿", "{": "°", "|": "ñ", "}": "ç" };
Ie.H = Ie[7] = { "@": "É", "[": "Ä", "\\": "Ö", "]": "Å", "^": "Ü", "`": "é", "{": "ä", "|": "ö", "}": "å", "~": "ü" };
Ie["="] = { "#": "ù", "@": "à", "[": "é", "\\": "ç", "]": "ê", "^": "î", _: "è", "`": "ô", "{": "ä", "|": "ö", "}": "ü", "~": "û" };
var Rc = 4294967295, Ac = class {
  constructor(e, t, r) {
    this._hasScrollback = e, this._optionsService = t, this._bufferService = r, this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.tabs = {}, this.savedY = 0, this.savedX = 0, this.savedCurAttrData = Le.clone(), this.savedCharset = ar, this.markers = [], this._nullCell = pt.fromCharData([0, rf, 1, 0]), this._whitespaceCell = pt.fromCharData([0, Qt, 1, 32]), this._isClearing = !1, this._memoryCleanupQueue = new os(), this._memoryCleanupPosition = 0, this._cols = this._bufferService.cols, this._rows = this._bufferService.rows, this.lines = new Bc(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
  }
  getNullCell(e) {
    return e ? (this._nullCell.fg = e.fg, this._nullCell.bg = e.bg, this._nullCell.extended = e.extended) : (this._nullCell.fg = 0, this._nullCell.bg = 0, this._nullCell.extended = new rs()), this._nullCell;
  }
  getWhitespaceCell(e) {
    return e ? (this._whitespaceCell.fg = e.fg, this._whitespaceCell.bg = e.bg, this._whitespaceCell.extended = e.extended) : (this._whitespaceCell.fg = 0, this._whitespaceCell.bg = 0, this._whitespaceCell.extended = new rs()), this._whitespaceCell;
  }
  getBlankLine(e, t) {
    return new Gr(this._bufferService.cols, this.getNullCell(e), t);
  }
  get hasScrollback() {
    return this._hasScrollback && this.lines.maxLength > this._rows;
  }
  get isCursorInViewport() {
    let e = this.ybase + this.y - this.ydisp;
    return e >= 0 && e < this._rows;
  }
  _getCorrectBufferLength(e) {
    if (!this._hasScrollback) return e;
    let t = e + this._optionsService.rawOptions.scrollback;
    return t > Rc ? Rc : t;
  }
  fillViewportRows(e) {
    if (this.lines.length === 0) {
      e === void 0 && (e = Le);
      let t = this._rows;
      for (; t--; ) this.lines.push(this.getBlankLine(e));
    }
  }
  clear() {
    this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.lines = new Bc(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
  }
  resize(e, t) {
    let r = this.getNullCell(Le), i = 0, s = this._getCorrectBufferLength(t);
    if (s > this.lines.maxLength && (this.lines.maxLength = s), this.lines.length > 0) {
      if (this._cols < e) for (let o = 0; o < this.lines.length; o++) i += +this.lines.get(o).resize(e, r);
      let n = 0;
      if (this._rows < t) for (let o = this._rows; o < t; o++) this.lines.length < t + this.ybase && (this._optionsService.rawOptions.windowsMode || this._optionsService.rawOptions.windowsPty.backend !== void 0 || this._optionsService.rawOptions.windowsPty.buildNumber !== void 0 ? this.lines.push(new Gr(e, r)) : this.ybase > 0 && this.lines.length <= this.ybase + this.y + n + 1 ? (this.ybase--, n++, this.ydisp > 0 && this.ydisp--) : this.lines.push(new Gr(e, r)));
      else for (let o = this._rows; o > t; o--) this.lines.length > t + this.ybase && (this.lines.length > this.ybase + this.y + 1 ? this.lines.pop() : (this.ybase++, this.ydisp++));
      if (s < this.lines.maxLength) {
        let o = this.lines.length - s;
        o > 0 && (this.lines.trimStart(o), this.ybase = Math.max(this.ybase - o, 0), this.ydisp = Math.max(this.ydisp - o, 0), this.savedY = Math.max(this.savedY - o, 0)), this.lines.maxLength = s;
      }
      this.x = Math.min(this.x, e - 1), this.y = Math.min(this.y, t - 1), n && (this.y += n), this.savedX = Math.min(this.savedX, e - 1), this.scrollTop = 0;
    }
    if (this.scrollBottom = t - 1, this._isReflowEnabled && (this._reflow(e, t), this._cols > e)) for (let n = 0; n < this.lines.length; n++) i += +this.lines.get(n).resize(e, r);
    this._cols = e, this._rows = t, this._memoryCleanupQueue.clear(), i > 0.1 * this.lines.length && (this._memoryCleanupPosition = 0, this._memoryCleanupQueue.enqueue(() => this._batchedMemoryCleanup()));
  }
  _batchedMemoryCleanup() {
    let e = !0;
    this._memoryCleanupPosition >= this.lines.length && (this._memoryCleanupPosition = 0, e = !1);
    let t = 0;
    for (; this._memoryCleanupPosition < this.lines.length; ) if (t += this.lines.get(this._memoryCleanupPosition++).cleanupMemory(), t > 100) return !0;
    return e;
  }
  get _isReflowEnabled() {
    let e = this._optionsService.rawOptions.windowsPty;
    return e && e.buildNumber ? this._hasScrollback && e.backend === "conpty" && e.buildNumber >= 21376 : this._hasScrollback && !this._optionsService.rawOptions.windowsMode;
  }
  _reflow(e, t) {
    this._cols !== e && (e > this._cols ? this._reflowLarger(e, t) : this._reflowSmaller(e, t));
  }
  _reflowLarger(e, t) {
    let r = this._optionsService.rawOptions.reflowCursorLine, i = F1(this.lines, this._cols, e, this.ybase + this.y, this.getNullCell(Le), r);
    if (i.length > 0) {
      let s = U1(this.lines, i);
      H1(this.lines, s.layout), this._reflowLargerAdjustViewport(e, t, s.countRemoved);
    }
  }
  _reflowLargerAdjustViewport(e, t, r) {
    let i = this.getNullCell(Le), s = r;
    for (; s-- > 0; ) this.ybase === 0 ? (this.y > 0 && this.y--, this.lines.length < t && this.lines.push(new Gr(e, i))) : (this.ydisp === this.ybase && this.ydisp--, this.ybase--);
    this.savedY = Math.max(this.savedY - r, 0);
  }
  _reflowSmaller(e, t) {
    let r = this._optionsService.rawOptions.reflowCursorLine, i = this.getNullCell(Le), s = [], n = 0;
    for (let o = this.lines.length - 1; o >= 0; o--) {
      let a = this.lines.get(o);
      if (!a || !a.isWrapped && a.getTrimmedLength() <= e) continue;
      let h = [a];
      for (; a.isWrapped && o > 0; ) a = this.lines.get(--o), h.unshift(a);
      if (!r) {
        let S = this.ybase + this.y;
        if (S >= o && S < o + h.length) continue;
      }
      let l = h[h.length - 1].getTrimmedLength(), c = W1(h, this._cols, e), u = c.length - h.length, p;
      this.ybase === 0 && this.y !== this.lines.length - 1 ? p = Math.max(0, this.y - this.lines.maxLength + u) : p = Math.max(0, this.lines.length - this.lines.maxLength + u);
      let _ = [];
      for (let S = 0; S < u; S++) {
        let v = this.getBlankLine(Le, !0);
        _.push(v);
      }
      _.length > 0 && (s.push({ start: o + h.length + n, newLines: _ }), n += _.length), h.push(..._);
      let m = c.length - 1, g = c[m];
      g === 0 && (m--, g = c[m]);
      let w = h.length - u - 1, y = l;
      for (; w >= 0; ) {
        let S = Math.min(y, g);
        if (h[m] === void 0) break;
        if (h[m].copyCellsFrom(h[w], y - S, g - S, S, !0), g -= S, g === 0 && (m--, g = c[m]), y -= S, y === 0) {
          w--;
          let v = Math.max(w, 0);
          y = ti(h, v, this._cols);
        }
      }
      for (let S = 0; S < h.length; S++) c[S] < e && h[S].setCell(c[S], i);
      let E = u - p;
      for (; E-- > 0; ) this.ybase === 0 ? this.y < t - 1 ? (this.y++, this.lines.pop()) : (this.ybase++, this.ydisp++) : this.ybase < Math.min(this.lines.maxLength, this.lines.length + n) - t && (this.ybase === this.ydisp && this.ydisp++, this.ybase++);
      this.savedY = Math.min(this.savedY + u, this.ybase + t - 1);
    }
    if (s.length > 0) {
      let o = [], a = [];
      for (let g = 0; g < this.lines.length; g++) a.push(this.lines.get(g));
      let h = this.lines.length, l = h - 1, c = 0, u = s[c];
      this.lines.length = Math.min(this.lines.maxLength, this.lines.length + n);
      let p = 0;
      for (let g = Math.min(this.lines.maxLength - 1, h + n - 1); g >= 0; g--) if (u && u.start > l + p) {
        for (let w = u.newLines.length - 1; w >= 0; w--) this.lines.set(g--, u.newLines[w]);
        g++, o.push({ index: l + 1, amount: u.newLines.length }), p += u.newLines.length, u = s[++c];
      } else this.lines.set(g, a[l--]);
      let _ = 0;
      for (let g = o.length - 1; g >= 0; g--) o[g].index += _, this.lines.onInsertEmitter.fire(o[g]), _ += o[g].amount;
      let m = Math.max(0, h + n - this.lines.maxLength);
      m > 0 && this.lines.onTrimEmitter.fire(m);
    }
  }
  translateBufferLineToString(e, t, r = 0, i) {
    let s = this.lines.get(e);
    return s ? s.translateToString(t, r, i) : "";
  }
  getWrappedRangeForLine(e) {
    let t = e, r = e;
    for (; t > 0 && this.lines.get(t).isWrapped; ) t--;
    for (; r + 1 < this.lines.length && this.lines.get(r + 1).isWrapped; ) r++;
    return { first: t, last: r };
  }
  setupTabStops(e) {
    for (e != null ? this.tabs[e] || (e = this.prevStop(e)) : (this.tabs = {}, e = 0); e < this._cols; e += this._optionsService.rawOptions.tabStopWidth) this.tabs[e] = !0;
  }
  prevStop(e) {
    for (e == null && (e = this.x); !this.tabs[--e] && e > 0; ) ;
    return e >= this._cols ? this._cols - 1 : e < 0 ? 0 : e;
  }
  nextStop(e) {
    for (e == null && (e = this.x); !this.tabs[++e] && e < this._cols; ) ;
    return e >= this._cols ? this._cols - 1 : e < 0 ? 0 : e;
  }
  clearMarkers(e) {
    this._isClearing = !0;
    for (let t = 0; t < this.markers.length; t++) this.markers[t].line === e && (this.markers[t].dispose(), this.markers.splice(t--, 1));
    this._isClearing = !1;
  }
  clearAllMarkers() {
    this._isClearing = !0;
    for (let e = 0; e < this.markers.length; e++) this.markers[e].dispose();
    this.markers.length = 0, this._isClearing = !1;
  }
  addMarker(e) {
    let t = new z1(e);
    return this.markers.push(t), t.register(this.lines.onTrim((r) => {
      t.line -= r, t.line < 0 && t.dispose();
    })), t.register(this.lines.onInsert((r) => {
      t.line >= r.index && (t.line += r.amount);
    })), t.register(this.lines.onDelete((r) => {
      t.line >= r.index && t.line < r.index + r.amount && t.dispose(), t.line > r.index && (t.line -= r.amount);
    })), t.register(t.onDispose(() => this._removeMarker(t))), t;
  }
  _removeMarker(e) {
    this._isClearing || this.markers.splice(this.markers.indexOf(e), 1);
  }
}, q1 = class extends de {
  constructor(e, t) {
    super(), this._optionsService = e, this._bufferService = t, this._onBufferActivate = this._register(new Q()), this.onBufferActivate = this._onBufferActivate.event, this.reset(), this._register(this._optionsService.onSpecificOptionChange("scrollback", () => this.resize(this._bufferService.cols, this._bufferService.rows))), this._register(this._optionsService.onSpecificOptionChange("tabStopWidth", () => this.setupTabStops()));
  }
  reset() {
    this._normal = new Ac(!0, this._optionsService, this._bufferService), this._normal.fillViewportRows(), this._alt = new Ac(!1, this._optionsService, this._bufferService), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }), this.setupTabStops();
  }
  get alt() {
    return this._alt;
  }
  get active() {
    return this._activeBuffer;
  }
  get normal() {
    return this._normal;
  }
  activateNormalBuffer() {
    this._activeBuffer !== this._normal && (this._normal.x = this._alt.x, this._normal.y = this._alt.y, this._alt.clearAllMarkers(), this._alt.clear(), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }));
  }
  activateAltBuffer(e) {
    this._activeBuffer !== this._alt && (this._alt.fillViewportRows(e), this._alt.x = this._normal.x, this._alt.y = this._normal.y, this._activeBuffer = this._alt, this._onBufferActivate.fire({ activeBuffer: this._alt, inactiveBuffer: this._normal }));
  }
  resize(e, t) {
    this._normal.resize(e, t), this._alt.resize(e, t), this.setupTabStops(e);
  }
  setupTabStops(e) {
    this._normal.setupTabStops(e), this._alt.setupTabStops(e);
  }
}, Wf = 2, zf = 1, aa = class extends de {
  constructor(e) {
    super(), this.isUserScrolling = !1, this._onResize = this._register(new Q()), this.onResize = this._onResize.event, this._onScroll = this._register(new Q()), this.onScroll = this._onScroll.event, this.cols = Math.max(e.rawOptions.cols || 0, Wf), this.rows = Math.max(e.rawOptions.rows || 0, zf), this.buffers = this._register(new q1(e, this)), this._register(this.buffers.onBufferActivate((t) => {
      this._onScroll.fire(t.activeBuffer.ydisp);
    }));
  }
  get buffer() {
    return this.buffers.active;
  }
  resize(e, t) {
    let r = this.cols !== e, i = this.rows !== t;
    this.cols = e, this.rows = t, this.buffers.resize(e, t), this._onResize.fire({ cols: e, rows: t, colsChanged: r, rowsChanged: i });
  }
  reset() {
    this.buffers.reset(), this.isUserScrolling = !1;
  }
  scroll(e, t = !1) {
    let r = this.buffer, i;
    i = this._cachedBlankLine, (!i || i.length !== this.cols || i.getFg(0) !== e.fg || i.getBg(0) !== e.bg) && (i = r.getBlankLine(e, t), this._cachedBlankLine = i), i.isWrapped = t;
    let s = r.ybase + r.scrollTop, n = r.ybase + r.scrollBottom;
    if (r.scrollTop === 0) {
      let o = r.lines.isFull;
      n === r.lines.length - 1 ? o ? r.lines.recycle().copyFrom(i) : r.lines.push(i.clone()) : r.lines.splice(n + 1, 0, i.clone()), o ? this.isUserScrolling && (r.ydisp = Math.max(r.ydisp - 1, 0)) : (r.ybase++, this.isUserScrolling || r.ydisp++);
    } else {
      let o = n - s + 1;
      r.lines.shiftElements(s + 1, o - 1, -1), r.lines.set(n, i.clone());
    }
    this.isUserScrolling || (r.ydisp = r.ybase), this._onScroll.fire(r.ydisp);
  }
  scrollLines(e, t) {
    let r = this.buffer;
    if (e < 0) {
      if (r.ydisp === 0) return;
      this.isUserScrolling = !0;
    } else e + r.ydisp >= r.ybase && (this.isUserScrolling = !1);
    let i = r.ydisp;
    r.ydisp = Math.max(Math.min(r.ydisp + e, r.ybase), 0), i !== r.ydisp && (t || this._onScroll.fire(r.ydisp));
  }
};
aa = Ae([re(0, Xe)], aa);
var Er = { cols: 80, rows: 24, cursorBlink: !1, cursorStyle: "block", cursorWidth: 1, cursorInactiveStyle: "outline", customGlyphs: !0, drawBoldTextInBrightColors: !0, documentOverride: null, fastScrollModifier: "alt", fastScrollSensitivity: 5, fontFamily: "monospace", fontSize: 15, fontWeight: "normal", fontWeightBold: "bold", ignoreBracketedPasteMode: !1, lineHeight: 1, letterSpacing: 0, linkHandler: null, logLevel: "info", logger: null, scrollback: 1e3, scrollOnEraseInDisplay: !1, scrollOnUserInput: !0, scrollSensitivity: 1, screenReaderMode: !1, smoothScrollDuration: 0, macOptionIsMeta: !1, macOptionClickForcesSelection: !1, minimumContrastRatio: 1, disableStdin: !1, allowProposedApi: !1, allowTransparency: !1, tabStopWidth: 8, theme: {}, reflowCursorLine: !1, rescaleOverlappingGlyphs: !1, rightClickSelectsWord: ns, windowOptions: {}, windowsMode: !1, windowsPty: {}, wordSeparator: " ()[]{}',\"`", altClickMovesCursor: !0, convertEol: !1, termName: "xterm", cancelEvents: !1, overviewRuler: {} }, j1 = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"], $1 = class extends de {
  constructor(e) {
    super(), this._onOptionChange = this._register(new Q()), this.onOptionChange = this._onOptionChange.event;
    let t = { ...Er };
    for (let r in e) if (r in t) try {
      let i = e[r];
      t[r] = this._sanitizeAndValidateOption(r, i);
    } catch (i) {
      console.error(i);
    }
    this.rawOptions = t, this.options = { ...t }, this._setupOptions(), this._register(Se(() => {
      this.rawOptions.linkHandler = null, this.rawOptions.documentOverride = null;
    }));
  }
  onSpecificOptionChange(e, t) {
    return this.onOptionChange((r) => {
      r === e && t(this.rawOptions[e]);
    });
  }
  onMultipleOptionChange(e, t) {
    return this.onOptionChange((r) => {
      e.indexOf(r) !== -1 && t();
    });
  }
  _setupOptions() {
    let e = (r) => {
      if (!(r in Er)) throw new Error(`No option with key "${r}"`);
      return this.rawOptions[r];
    }, t = (r, i) => {
      if (!(r in Er)) throw new Error(`No option with key "${r}"`);
      i = this._sanitizeAndValidateOption(r, i), this.rawOptions[r] !== i && (this.rawOptions[r] = i, this._onOptionChange.fire(r));
    };
    for (let r in this.rawOptions) {
      let i = { get: e.bind(this, r), set: t.bind(this, r) };
      Object.defineProperty(this.options, r, i);
    }
  }
  _sanitizeAndValidateOption(e, t) {
    switch (e) {
      case "cursorStyle":
        if (t || (t = Er[e]), !K1(t)) throw new Error(`"${t}" is not a valid value for ${e}`);
        break;
      case "wordSeparator":
        t || (t = Er[e]);
        break;
      case "fontWeight":
      case "fontWeightBold":
        if (typeof t == "number" && 1 <= t && t <= 1e3) break;
        t = j1.includes(t) ? t : Er[e];
        break;
      case "cursorWidth":
        t = Math.floor(t);
      case "lineHeight":
      case "tabStopWidth":
        if (t < 1) throw new Error(`${e} cannot be less than 1, value: ${t}`);
        break;
      case "minimumContrastRatio":
        t = Math.max(1, Math.min(21, Math.round(t * 10) / 10));
        break;
      case "scrollback":
        if (t = Math.min(t, 4294967295), t < 0) throw new Error(`${e} cannot be less than 0, value: ${t}`);
        break;
      case "fastScrollSensitivity":
      case "scrollSensitivity":
        if (t <= 0) throw new Error(`${e} cannot be less than or equal to 0, value: ${t}`);
        break;
      case "rows":
      case "cols":
        if (!t && t !== 0) throw new Error(`${e} must be numeric, value: ${t}`);
        break;
      case "windowsPty":
        t = t ?? {};
        break;
    }
    return t;
  }
};
function K1(e) {
  return e === "block" || e === "underline" || e === "bar";
}
function Yr(e, t = 5) {
  if (typeof e != "object") return e;
  let r = Array.isArray(e) ? [] : {};
  for (let i in e) r[i] = t <= 1 ? e[i] : e[i] && Yr(e[i], t - 1);
  return r;
}
var Dc = Object.freeze({ insertMode: !1 }), Tc = Object.freeze({ applicationCursorKeys: !1, applicationKeypad: !1, bracketedPasteMode: !1, cursorBlink: void 0, cursorStyle: void 0, origin: !1, reverseWraparound: !1, sendFocus: !1, synchronizedOutput: !1, wraparound: !0 }), la = class extends de {
  constructor(e, t, r) {
    super(), this._bufferService = e, this._logService = t, this._optionsService = r, this.isCursorInitialized = !1, this.isCursorHidden = !1, this._onData = this._register(new Q()), this.onData = this._onData.event, this._onUserInput = this._register(new Q()), this.onUserInput = this._onUserInput.event, this._onBinary = this._register(new Q()), this.onBinary = this._onBinary.event, this._onRequestScrollToBottom = this._register(new Q()), this.onRequestScrollToBottom = this._onRequestScrollToBottom.event, this.modes = Yr(Dc), this.decPrivateModes = Yr(Tc);
  }
  reset() {
    this.modes = Yr(Dc), this.decPrivateModes = Yr(Tc);
  }
  triggerDataEvent(e, t = !1) {
    if (this._optionsService.rawOptions.disableStdin) return;
    let r = this._bufferService.buffer;
    t && this._optionsService.rawOptions.scrollOnUserInput && r.ybase !== r.ydisp && this._onRequestScrollToBottom.fire(), t && this._onUserInput.fire(), this._logService.debug(`sending data "${e}"`), this._logService.trace("sending data (codes)", () => e.split("").map((i) => i.charCodeAt(0))), this._onData.fire(e);
  }
  triggerBinaryEvent(e) {
    this._optionsService.rawOptions.disableStdin || (this._logService.debug(`sending binary "${e}"`), this._logService.trace("sending binary (codes)", () => e.split("").map((t) => t.charCodeAt(0))), this._onBinary.fire(e));
  }
};
la = Ae([re(0, Ye), re(1, lf), re(2, Xe)], la);
var Lc = { NONE: { events: 0, restrict: () => !1 }, X10: { events: 1, restrict: (e) => e.button === 4 || e.action !== 1 ? !1 : (e.ctrl = !1, e.alt = !1, e.shift = !1, !0) }, VT200: { events: 19, restrict: (e) => e.action !== 32 }, DRAG: { events: 23, restrict: (e) => !(e.action === 32 && e.button === 3) }, ANY: { events: 31, restrict: (e) => !0 } };
function go(e, t) {
  let r = (e.ctrl ? 16 : 0) | (e.shift ? 4 : 0) | (e.alt ? 8 : 0);
  return e.button === 4 ? (r |= 64, r |= e.action) : (r |= e.button & 3, e.button & 4 && (r |= 64), e.button & 8 && (r |= 128), e.action === 32 ? r |= 32 : e.action === 0 && !t && (r |= 3)), r;
}
var vo = String.fromCharCode, Pc = { DEFAULT: (e) => {
  let t = [go(e, !1) + 32, e.col + 32, e.row + 32];
  return t[0] > 255 || t[1] > 255 || t[2] > 255 ? "" : `\x1B[M${vo(t[0])}${vo(t[1])}${vo(t[2])}`;
}, SGR: (e) => {
  let t = e.action === 0 && e.button !== 4 ? "m" : "M";
  return `\x1B[<${go(e, !0)};${e.col};${e.row}${t}`;
}, SGR_PIXELS: (e) => {
  let t = e.action === 0 && e.button !== 4 ? "m" : "M";
  return `\x1B[<${go(e, !0)};${e.x};${e.y}${t}`;
} }, ha = class extends de {
  constructor(e, t, r) {
    super(), this._bufferService = e, this._coreService = t, this._optionsService = r, this._protocols = {}, this._encodings = {}, this._activeProtocol = "", this._activeEncoding = "", this._lastEvent = null, this._wheelPartialScroll = 0, this._onProtocolChange = this._register(new Q()), this.onProtocolChange = this._onProtocolChange.event;
    for (let i of Object.keys(Lc)) this.addProtocol(i, Lc[i]);
    for (let i of Object.keys(Pc)) this.addEncoding(i, Pc[i]);
    this.reset();
  }
  addProtocol(e, t) {
    this._protocols[e] = t;
  }
  addEncoding(e, t) {
    this._encodings[e] = t;
  }
  get activeProtocol() {
    return this._activeProtocol;
  }
  get areMouseEventsActive() {
    return this._protocols[this._activeProtocol].events !== 0;
  }
  set activeProtocol(e) {
    if (!this._protocols[e]) throw new Error(`unknown protocol "${e}"`);
    this._activeProtocol = e, this._onProtocolChange.fire(this._protocols[e].events);
  }
  get activeEncoding() {
    return this._activeEncoding;
  }
  set activeEncoding(e) {
    if (!this._encodings[e]) throw new Error(`unknown encoding "${e}"`);
    this._activeEncoding = e;
  }
  reset() {
    this.activeProtocol = "NONE", this.activeEncoding = "DEFAULT", this._lastEvent = null, this._wheelPartialScroll = 0;
  }
  consumeWheelEvent(e, t, r) {
    if (e.deltaY === 0 || e.shiftKey || t === void 0 || r === void 0) return 0;
    let i = t / r, s = this._applyScrollModifier(e.deltaY, e);
    return e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? (s /= i + 0, Math.abs(e.deltaY) < 50 && (s *= 0.3), this._wheelPartialScroll += s, s = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1), this._wheelPartialScroll %= 1) : e.deltaMode === WheelEvent.DOM_DELTA_PAGE && (s *= this._bufferService.rows), s;
  }
  _applyScrollModifier(e, t) {
    return t.altKey || t.ctrlKey || t.shiftKey ? e * this._optionsService.rawOptions.fastScrollSensitivity * this._optionsService.rawOptions.scrollSensitivity : e * this._optionsService.rawOptions.scrollSensitivity;
  }
  triggerMouseEvent(e) {
    if (e.col < 0 || e.col >= this._bufferService.cols || e.row < 0 || e.row >= this._bufferService.rows || e.button === 4 && e.action === 32 || e.button === 3 && e.action !== 32 || e.button !== 4 && (e.action === 2 || e.action === 3) || (e.col++, e.row++, e.action === 32 && this._lastEvent && this._equalEvents(this._lastEvent, e, this._activeEncoding === "SGR_PIXELS")) || !this._protocols[this._activeProtocol].restrict(e)) return !1;
    let t = this._encodings[this._activeEncoding](e);
    return t && (this._activeEncoding === "DEFAULT" ? this._coreService.triggerBinaryEvent(t) : this._coreService.triggerDataEvent(t, !0)), this._lastEvent = e, !0;
  }
  explainEvents(e) {
    return { down: !!(e & 1), up: !!(e & 2), drag: !!(e & 4), move: !!(e & 8), wheel: !!(e & 16) };
  }
  _equalEvents(e, t, r) {
    if (r) {
      if (e.x !== t.x || e.y !== t.y) return !1;
    } else if (e.col !== t.col || e.row !== t.row) return !1;
    return !(e.button !== t.button || e.action !== t.action || e.ctrl !== t.ctrl || e.alt !== t.alt || e.shift !== t.shift);
  }
};
ha = Ae([re(0, Ye), re(1, vr), re(2, Xe)], ha);
var mo = [[768, 879], [1155, 1158], [1160, 1161], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1536, 1539], [1552, 1557], [1611, 1630], [1648, 1648], [1750, 1764], [1767, 1768], [1770, 1773], [1807, 1807], [1809, 1809], [1840, 1866], [1958, 1968], [2027, 2035], [2305, 2306], [2364, 2364], [2369, 2376], [2381, 2381], [2385, 2388], [2402, 2403], [2433, 2433], [2492, 2492], [2497, 2500], [2509, 2509], [2530, 2531], [2561, 2562], [2620, 2620], [2625, 2626], [2631, 2632], [2635, 2637], [2672, 2673], [2689, 2690], [2748, 2748], [2753, 2757], [2759, 2760], [2765, 2765], [2786, 2787], [2817, 2817], [2876, 2876], [2879, 2879], [2881, 2883], [2893, 2893], [2902, 2902], [2946, 2946], [3008, 3008], [3021, 3021], [3134, 3136], [3142, 3144], [3146, 3149], [3157, 3158], [3260, 3260], [3263, 3263], [3270, 3270], [3276, 3277], [3298, 3299], [3393, 3395], [3405, 3405], [3530, 3530], [3538, 3540], [3542, 3542], [3633, 3633], [3636, 3642], [3655, 3662], [3761, 3761], [3764, 3769], [3771, 3772], [3784, 3789], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3966], [3968, 3972], [3974, 3975], [3984, 3991], [3993, 4028], [4038, 4038], [4141, 4144], [4146, 4146], [4150, 4151], [4153, 4153], [4184, 4185], [4448, 4607], [4959, 4959], [5906, 5908], [5938, 5940], [5970, 5971], [6002, 6003], [6068, 6069], [6071, 6077], [6086, 6086], [6089, 6099], [6109, 6109], [6155, 6157], [6313, 6313], [6432, 6434], [6439, 6440], [6450, 6450], [6457, 6459], [6679, 6680], [6912, 6915], [6964, 6964], [6966, 6970], [6972, 6972], [6978, 6978], [7019, 7027], [7616, 7626], [7678, 7679], [8203, 8207], [8234, 8238], [8288, 8291], [8298, 8303], [8400, 8431], [12330, 12335], [12441, 12442], [43014, 43014], [43019, 43019], [43045, 43046], [64286, 64286], [65024, 65039], [65056, 65059], [65279, 65279], [65529, 65531]], V1 = [[68097, 68099], [68101, 68102], [68108, 68111], [68152, 68154], [68159, 68159], [119143, 119145], [119155, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [917505, 917505], [917536, 917631], [917760, 917999]], Oe;
function G1(e, t) {
  let r = 0, i = t.length - 1, s;
  if (e < t[0][0] || e > t[i][1]) return !1;
  for (; i >= r; ) if (s = r + i >> 1, e > t[s][1]) r = s + 1;
  else if (e < t[s][0]) i = s - 1;
  else return !0;
  return !1;
}
var Y1 = class {
  constructor() {
    if (this.version = "6", !Oe) {
      Oe = new Uint8Array(65536), Oe.fill(1), Oe[0] = 0, Oe.fill(0, 1, 32), Oe.fill(0, 127, 160), Oe.fill(2, 4352, 4448), Oe[9001] = 2, Oe[9002] = 2, Oe.fill(2, 11904, 42192), Oe[12351] = 1, Oe.fill(2, 44032, 55204), Oe.fill(2, 63744, 64256), Oe.fill(2, 65040, 65050), Oe.fill(2, 65072, 65136), Oe.fill(2, 65280, 65377), Oe.fill(2, 65504, 65511);
      for (let e = 0; e < mo.length; ++e) Oe.fill(0, mo[e][0], mo[e][1] + 1);
    }
  }
  wcwidth(e) {
    return e < 32 ? 0 : e < 127 ? 1 : e < 65536 ? Oe[e] : G1(e, V1) ? 0 : e >= 131072 && e <= 196605 || e >= 196608 && e <= 262141 ? 2 : 1;
  }
  charProperties(e, t) {
    let r = this.wcwidth(e), i = r === 0 && t !== 0;
    if (i) {
      let s = cr.extractWidth(t);
      s === 0 ? i = !1 : s > r && (r = s);
    }
    return cr.createPropertyValue(0, r, i);
  }
}, cr = class Ki {
  constructor() {
    this._providers = /* @__PURE__ */ Object.create(null), this._active = "", this._onChange = new Q(), this.onChange = this._onChange.event;
    let t = new Y1();
    this.register(t), this._active = t.version, this._activeProvider = t;
  }
  static extractShouldJoin(t) {
    return (t & 1) !== 0;
  }
  static extractWidth(t) {
    return t >> 1 & 3;
  }
  static extractCharKind(t) {
    return t >> 3;
  }
  static createPropertyValue(t, r, i = !1) {
    return (t & 16777215) << 3 | (r & 3) << 1 | (i ? 1 : 0);
  }
  dispose() {
    this._onChange.dispose();
  }
  get versions() {
    return Object.keys(this._providers);
  }
  get activeVersion() {
    return this._active;
  }
  set activeVersion(t) {
    if (!this._providers[t]) throw new Error(`unknown Unicode version "${t}"`);
    this._active = t, this._activeProvider = this._providers[t], this._onChange.fire(t);
  }
  register(t) {
    this._providers[t.version] = t;
  }
  wcwidth(t) {
    return this._activeProvider.wcwidth(t);
  }
  getStringCellWidth(t) {
    let r = 0, i = 0, s = t.length;
    for (let n = 0; n < s; ++n) {
      let o = t.charCodeAt(n);
      if (55296 <= o && o <= 56319) {
        if (++n >= s) return r + this.wcwidth(o);
        let l = t.charCodeAt(n);
        56320 <= l && l <= 57343 ? o = (o - 55296) * 1024 + l - 56320 + 65536 : r += this.wcwidth(l);
      }
      let a = this.charProperties(o, i), h = Ki.extractWidth(a);
      Ki.extractShouldJoin(a) && (h -= Ki.extractWidth(i)), r += h, i = a;
    }
    return r;
  }
  charProperties(t, r) {
    return this._activeProvider.charProperties(t, r);
  }
}, X1 = class {
  constructor() {
    this.glevel = 0, this._charsets = [];
  }
  reset() {
    this.charset = void 0, this._charsets = [], this.glevel = 0;
  }
  setgLevel(e) {
    this.glevel = e, this.charset = this._charsets[e];
  }
  setgCharset(e, t) {
    this._charsets[e] = t, this.glevel === e && (this.charset = t);
  }
};
function Mc(e) {
  var i;
  let t = (i = e.buffer.lines.get(e.buffer.ybase + e.buffer.y - 1)) == null ? void 0 : i.get(e.cols - 1), r = e.buffer.lines.get(e.buffer.ybase + e.buffer.y);
  r && t && (r.isWrapped = t[3] !== 0 && t[3] !== 32);
}
var zr = 2147483647, J1 = 256, qf = class ca {
  constructor(t = 32, r = 32) {
    if (this.maxLength = t, this.maxSubParamsLength = r, r > J1) throw new Error("maxSubParamsLength must not be greater than 256");
    this.params = new Int32Array(t), this.length = 0, this._subParams = new Int32Array(r), this._subParamsLength = 0, this._subParamsIdx = new Uint16Array(t), this._rejectDigits = !1, this._rejectSubDigits = !1, this._digitIsSub = !1;
  }
  static fromArray(t) {
    let r = new ca();
    if (!t.length) return r;
    for (let i = Array.isArray(t[0]) ? 1 : 0; i < t.length; ++i) {
      let s = t[i];
      if (Array.isArray(s)) for (let n = 0; n < s.length; ++n) r.addSubParam(s[n]);
      else r.addParam(s);
    }
    return r;
  }
  clone() {
    let t = new ca(this.maxLength, this.maxSubParamsLength);
    return t.params.set(this.params), t.length = this.length, t._subParams.set(this._subParams), t._subParamsLength = this._subParamsLength, t._subParamsIdx.set(this._subParamsIdx), t._rejectDigits = this._rejectDigits, t._rejectSubDigits = this._rejectSubDigits, t._digitIsSub = this._digitIsSub, t;
  }
  toArray() {
    let t = [];
    for (let r = 0; r < this.length; ++r) {
      t.push(this.params[r]);
      let i = this._subParamsIdx[r] >> 8, s = this._subParamsIdx[r] & 255;
      s - i > 0 && t.push(Array.prototype.slice.call(this._subParams, i, s));
    }
    return t;
  }
  reset() {
    this.length = 0, this._subParamsLength = 0, this._rejectDigits = !1, this._rejectSubDigits = !1, this._digitIsSub = !1;
  }
  addParam(t) {
    if (this._digitIsSub = !1, this.length >= this.maxLength) {
      this._rejectDigits = !0;
      return;
    }
    if (t < -1) throw new Error("values lesser than -1 are not allowed");
    this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength, this.params[this.length++] = t > zr ? zr : t;
  }
  addSubParam(t) {
    if (this._digitIsSub = !0, !!this.length) {
      if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength) {
        this._rejectSubDigits = !0;
        return;
      }
      if (t < -1) throw new Error("values lesser than -1 are not allowed");
      this._subParams[this._subParamsLength++] = t > zr ? zr : t, this._subParamsIdx[this.length - 1]++;
    }
  }
  hasSubParams(t) {
    return (this._subParamsIdx[t] & 255) - (this._subParamsIdx[t] >> 8) > 0;
  }
  getSubParams(t) {
    let r = this._subParamsIdx[t] >> 8, i = this._subParamsIdx[t] & 255;
    return i - r > 0 ? this._subParams.subarray(r, i) : null;
  }
  getSubParamsAll() {
    let t = {};
    for (let r = 0; r < this.length; ++r) {
      let i = this._subParamsIdx[r] >> 8, s = this._subParamsIdx[r] & 255;
      s - i > 0 && (t[r] = this._subParams.slice(i, s));
    }
    return t;
  }
  addDigit(t) {
    let r;
    if (this._rejectDigits || !(r = this._digitIsSub ? this._subParamsLength : this.length) || this._digitIsSub && this._rejectSubDigits) return;
    let i = this._digitIsSub ? this._subParams : this.params, s = i[r - 1];
    i[r - 1] = ~s ? Math.min(s * 10 + t, zr) : t;
  }
}, qr = [], Z1 = class {
  constructor() {
    this._state = 0, this._active = qr, this._id = -1, this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
    }, this._stack = { paused: !1, loopPosition: 0, fallThrough: !1 };
  }
  registerHandler(e, t) {
    this._handlers[e] === void 0 && (this._handlers[e] = []);
    let r = this._handlers[e];
    return r.push(t), { dispose: () => {
      let i = r.indexOf(t);
      i !== -1 && r.splice(i, 1);
    } };
  }
  clearHandler(e) {
    this._handlers[e] && delete this._handlers[e];
  }
  setHandlerFallback(e) {
    this._handlerFb = e;
  }
  dispose() {
    this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
    }, this._active = qr;
  }
  reset() {
    if (this._state === 2) for (let e = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e >= 0; --e) this._active[e].end(!1);
    this._stack.paused = !1, this._active = qr, this._id = -1, this._state = 0;
  }
  _start() {
    if (this._active = this._handlers[this._id] || qr, !this._active.length) this._handlerFb(this._id, "START");
    else for (let e = this._active.length - 1; e >= 0; e--) this._active[e].start();
  }
  _put(e, t, r) {
    if (!this._active.length) this._handlerFb(this._id, "PUT", ps(e, t, r));
    else for (let i = this._active.length - 1; i >= 0; i--) this._active[i].put(e, t, r);
  }
  start() {
    this.reset(), this._state = 1;
  }
  put(e, t, r) {
    if (this._state !== 3) {
      if (this._state === 1) for (; t < r; ) {
        let i = e[t++];
        if (i === 59) {
          this._state = 2, this._start();
          break;
        }
        if (i < 48 || 57 < i) {
          this._state = 3;
          return;
        }
        this._id === -1 && (this._id = 0), this._id = this._id * 10 + i - 48;
      }
      this._state === 2 && r - t > 0 && this._put(e, t, r);
    }
  }
  end(e, t = !0) {
    if (this._state !== 0) {
      if (this._state !== 3) if (this._state === 1 && this._start(), !this._active.length) this._handlerFb(this._id, "END", e);
      else {
        let r = !1, i = this._active.length - 1, s = !1;
        if (this._stack.paused && (i = this._stack.loopPosition - 1, r = t, s = this._stack.fallThrough, this._stack.paused = !1), !s && r === !1) {
          for (; i >= 0 && (r = this._active[i].end(e), r !== !0); i--) if (r instanceof Promise) return this._stack.paused = !0, this._stack.loopPosition = i, this._stack.fallThrough = !1, r;
          i--;
        }
        for (; i >= 0; i--) if (r = this._active[i].end(!1), r instanceof Promise) return this._stack.paused = !0, this._stack.loopPosition = i, this._stack.fallThrough = !0, r;
      }
      this._active = qr, this._id = -1, this._state = 0;
    }
  }
}, nt = class {
  constructor(e) {
    this._handler = e, this._data = "", this._hitLimit = !1;
  }
  start() {
    this._data = "", this._hitLimit = !1;
  }
  put(e, t, r) {
    this._hitLimit || (this._data += ps(e, t, r), this._data.length > 1e7 && (this._data = "", this._hitLimit = !0));
  }
  end(e) {
    let t = !1;
    if (this._hitLimit) t = !1;
    else if (e && (t = this._handler(this._data), t instanceof Promise)) return t.then((r) => (this._data = "", this._hitLimit = !1, r));
    return this._data = "", this._hitLimit = !1, t;
  }
}, jr = [], Q1 = class {
  constructor() {
    this._handlers = /* @__PURE__ */ Object.create(null), this._active = jr, this._ident = 0, this._handlerFb = () => {
    }, this._stack = { paused: !1, loopPosition: 0, fallThrough: !1 };
  }
  dispose() {
    this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
    }, this._active = jr;
  }
  registerHandler(e, t) {
    this._handlers[e] === void 0 && (this._handlers[e] = []);
    let r = this._handlers[e];
    return r.push(t), { dispose: () => {
      let i = r.indexOf(t);
      i !== -1 && r.splice(i, 1);
    } };
  }
  clearHandler(e) {
    this._handlers[e] && delete this._handlers[e];
  }
  setHandlerFallback(e) {
    this._handlerFb = e;
  }
  reset() {
    if (this._active.length) for (let e = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e >= 0; --e) this._active[e].unhook(!1);
    this._stack.paused = !1, this._active = jr, this._ident = 0;
  }
  hook(e, t) {
    if (this.reset(), this._ident = e, this._active = this._handlers[e] || jr, !this._active.length) this._handlerFb(this._ident, "HOOK", t);
    else for (let r = this._active.length - 1; r >= 0; r--) this._active[r].hook(t);
  }
  put(e, t, r) {
    if (!this._active.length) this._handlerFb(this._ident, "PUT", ps(e, t, r));
    else for (let i = this._active.length - 1; i >= 0; i--) this._active[i].put(e, t, r);
  }
  unhook(e, t = !0) {
    if (!this._active.length) this._handlerFb(this._ident, "UNHOOK", e);
    else {
      let r = !1, i = this._active.length - 1, s = !1;
      if (this._stack.paused && (i = this._stack.loopPosition - 1, r = t, s = this._stack.fallThrough, this._stack.paused = !1), !s && r === !1) {
        for (; i >= 0 && (r = this._active[i].unhook(e), r !== !0); i--) if (r instanceof Promise) return this._stack.paused = !0, this._stack.loopPosition = i, this._stack.fallThrough = !1, r;
        i--;
      }
      for (; i >= 0; i--) if (r = this._active[i].unhook(!1), r instanceof Promise) return this._stack.paused = !0, this._stack.loopPosition = i, this._stack.fallThrough = !0, r;
    }
    this._active = jr, this._ident = 0;
  }
}, Xr = new qf();
Xr.addParam(0);
var Oc = class {
  constructor(e) {
    this._handler = e, this._data = "", this._params = Xr, this._hitLimit = !1;
  }
  hook(e) {
    this._params = e.length > 1 || e.params[0] ? e.clone() : Xr, this._data = "", this._hitLimit = !1;
  }
  put(e, t, r) {
    this._hitLimit || (this._data += ps(e, t, r), this._data.length > 1e7 && (this._data = "", this._hitLimit = !0));
  }
  unhook(e) {
    let t = !1;
    if (this._hitLimit) t = !1;
    else if (e && (t = this._handler(this._data, this._params), t instanceof Promise)) return t.then((r) => (this._params = Xr, this._data = "", this._hitLimit = !1, r));
    return this._params = Xr, this._data = "", this._hitLimit = !1, t;
  }
}, em = class {
  constructor(e) {
    this.table = new Uint8Array(e);
  }
  setDefault(e, t) {
    this.table.fill(e << 4 | t);
  }
  add(e, t, r, i) {
    this.table[t << 8 | e] = r << 4 | i;
  }
  addMany(e, t, r, i) {
    for (let s = 0; s < e.length; s++) this.table[t << 8 | e[s]] = r << 4 | i;
  }
}, ut = 160, tm = function() {
  let e = new em(4095), t = Array.apply(null, Array(256)).map((a, h) => h), r = (a, h) => t.slice(a, h), i = r(32, 127), s = r(0, 24);
  s.push(25), s.push.apply(s, r(28, 32));
  let n = r(0, 14), o;
  e.setDefault(1, 0), e.addMany(i, 0, 2, 0);
  for (o in n) e.addMany([24, 26, 153, 154], o, 3, 0), e.addMany(r(128, 144), o, 3, 0), e.addMany(r(144, 152), o, 3, 0), e.add(156, o, 0, 0), e.add(27, o, 11, 1), e.add(157, o, 4, 8), e.addMany([152, 158, 159], o, 0, 7), e.add(155, o, 11, 3), e.add(144, o, 11, 9);
  return e.addMany(s, 0, 3, 0), e.addMany(s, 1, 3, 1), e.add(127, 1, 0, 1), e.addMany(s, 8, 0, 8), e.addMany(s, 3, 3, 3), e.add(127, 3, 0, 3), e.addMany(s, 4, 3, 4), e.add(127, 4, 0, 4), e.addMany(s, 6, 3, 6), e.addMany(s, 5, 3, 5), e.add(127, 5, 0, 5), e.addMany(s, 2, 3, 2), e.add(127, 2, 0, 2), e.add(93, 1, 4, 8), e.addMany(i, 8, 5, 8), e.add(127, 8, 5, 8), e.addMany([156, 27, 24, 26, 7], 8, 6, 0), e.addMany(r(28, 32), 8, 0, 8), e.addMany([88, 94, 95], 1, 0, 7), e.addMany(i, 7, 0, 7), e.addMany(s, 7, 0, 7), e.add(156, 7, 0, 0), e.add(127, 7, 0, 7), e.add(91, 1, 11, 3), e.addMany(r(64, 127), 3, 7, 0), e.addMany(r(48, 60), 3, 8, 4), e.addMany([60, 61, 62, 63], 3, 9, 4), e.addMany(r(48, 60), 4, 8, 4), e.addMany(r(64, 127), 4, 7, 0), e.addMany([60, 61, 62, 63], 4, 0, 6), e.addMany(r(32, 64), 6, 0, 6), e.add(127, 6, 0, 6), e.addMany(r(64, 127), 6, 0, 0), e.addMany(r(32, 48), 3, 9, 5), e.addMany(r(32, 48), 5, 9, 5), e.addMany(r(48, 64), 5, 0, 6), e.addMany(r(64, 127), 5, 7, 0), e.addMany(r(32, 48), 4, 9, 5), e.addMany(r(32, 48), 1, 9, 2), e.addMany(r(32, 48), 2, 9, 2), e.addMany(r(48, 127), 2, 10, 0), e.addMany(r(48, 80), 1, 10, 0), e.addMany(r(81, 88), 1, 10, 0), e.addMany([89, 90, 92], 1, 10, 0), e.addMany(r(96, 127), 1, 10, 0), e.add(80, 1, 11, 9), e.addMany(s, 9, 0, 9), e.add(127, 9, 0, 9), e.addMany(r(28, 32), 9, 0, 9), e.addMany(r(32, 48), 9, 9, 12), e.addMany(r(48, 60), 9, 8, 10), e.addMany([60, 61, 62, 63], 9, 9, 10), e.addMany(s, 11, 0, 11), e.addMany(r(32, 128), 11, 0, 11), e.addMany(r(28, 32), 11, 0, 11), e.addMany(s, 10, 0, 10), e.add(127, 10, 0, 10), e.addMany(r(28, 32), 10, 0, 10), e.addMany(r(48, 60), 10, 8, 10), e.addMany([60, 61, 62, 63], 10, 0, 11), e.addMany(r(32, 48), 10, 9, 12), e.addMany(s, 12, 0, 12), e.add(127, 12, 0, 12), e.addMany(r(28, 32), 12, 0, 12), e.addMany(r(32, 48), 12, 9, 12), e.addMany(r(48, 64), 12, 0, 11), e.addMany(r(64, 127), 12, 12, 13), e.addMany(r(64, 127), 10, 12, 13), e.addMany(r(64, 127), 9, 12, 13), e.addMany(s, 13, 13, 13), e.addMany(i, 13, 13, 13), e.add(127, 13, 0, 13), e.addMany([27, 156, 24, 26], 13, 14, 0), e.add(ut, 0, 2, 0), e.add(ut, 8, 5, 8), e.add(ut, 6, 0, 6), e.add(ut, 11, 0, 11), e.add(ut, 13, 13, 13), e;
}(), rm = class extends de {
  constructor(e = tm) {
    super(), this._transitions = e, this._parseStack = { state: 0, handlers: [], handlerPos: 0, transition: 0, chunkPos: 0 }, this.initialState = 0, this.currentState = this.initialState, this._params = new qf(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0, this._printHandlerFb = (t, r, i) => {
    }, this._executeHandlerFb = (t) => {
    }, this._csiHandlerFb = (t, r) => {
    }, this._escHandlerFb = (t) => {
    }, this._errorHandlerFb = (t) => t, this._printHandler = this._printHandlerFb, this._executeHandlers = /* @__PURE__ */ Object.create(null), this._csiHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null), this._register(Se(() => {
      this._csiHandlers = /* @__PURE__ */ Object.create(null), this._executeHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null);
    })), this._oscParser = this._register(new Z1()), this._dcsParser = this._register(new Q1()), this._errorHandler = this._errorHandlerFb, this.registerEscHandler({ final: "\\" }, () => !0);
  }
  _identifier(e, t = [64, 126]) {
    let r = 0;
    if (e.prefix) {
      if (e.prefix.length > 1) throw new Error("only one byte as prefix supported");
      if (r = e.prefix.charCodeAt(0), r && 60 > r || r > 63) throw new Error("prefix must be in range 0x3c .. 0x3f");
    }
    if (e.intermediates) {
      if (e.intermediates.length > 2) throw new Error("only two bytes as intermediates are supported");
      for (let s = 0; s < e.intermediates.length; ++s) {
        let n = e.intermediates.charCodeAt(s);
        if (32 > n || n > 47) throw new Error("intermediate must be in range 0x20 .. 0x2f");
        r <<= 8, r |= n;
      }
    }
    if (e.final.length !== 1) throw new Error("final must be a single byte");
    let i = e.final.charCodeAt(0);
    if (t[0] > i || i > t[1]) throw new Error(`final must be in range ${t[0]} .. ${t[1]}`);
    return r <<= 8, r |= i, r;
  }
  identToString(e) {
    let t = [];
    for (; e; ) t.push(String.fromCharCode(e & 255)), e >>= 8;
    return t.reverse().join("");
  }
  setPrintHandler(e) {
    this._printHandler = e;
  }
  clearPrintHandler() {
    this._printHandler = this._printHandlerFb;
  }
  registerEscHandler(e, t) {
    let r = this._identifier(e, [48, 126]);
    this._escHandlers[r] === void 0 && (this._escHandlers[r] = []);
    let i = this._escHandlers[r];
    return i.push(t), { dispose: () => {
      let s = i.indexOf(t);
      s !== -1 && i.splice(s, 1);
    } };
  }
  clearEscHandler(e) {
    this._escHandlers[this._identifier(e, [48, 126])] && delete this._escHandlers[this._identifier(e, [48, 126])];
  }
  setEscHandlerFallback(e) {
    this._escHandlerFb = e;
  }
  setExecuteHandler(e, t) {
    this._executeHandlers[e.charCodeAt(0)] = t;
  }
  clearExecuteHandler(e) {
    this._executeHandlers[e.charCodeAt(0)] && delete this._executeHandlers[e.charCodeAt(0)];
  }
  setExecuteHandlerFallback(e) {
    this._executeHandlerFb = e;
  }
  registerCsiHandler(e, t) {
    let r = this._identifier(e);
    this._csiHandlers[r] === void 0 && (this._csiHandlers[r] = []);
    let i = this._csiHandlers[r];
    return i.push(t), { dispose: () => {
      let s = i.indexOf(t);
      s !== -1 && i.splice(s, 1);
    } };
  }
  clearCsiHandler(e) {
    this._csiHandlers[this._identifier(e)] && delete this._csiHandlers[this._identifier(e)];
  }
  setCsiHandlerFallback(e) {
    this._csiHandlerFb = e;
  }
  registerDcsHandler(e, t) {
    return this._dcsParser.registerHandler(this._identifier(e), t);
  }
  clearDcsHandler(e) {
    this._dcsParser.clearHandler(this._identifier(e));
  }
  setDcsHandlerFallback(e) {
    this._dcsParser.setHandlerFallback(e);
  }
  registerOscHandler(e, t) {
    return this._oscParser.registerHandler(e, t);
  }
  clearOscHandler(e) {
    this._oscParser.clearHandler(e);
  }
  setOscHandlerFallback(e) {
    this._oscParser.setHandlerFallback(e);
  }
  setErrorHandler(e) {
    this._errorHandler = e;
  }
  clearErrorHandler() {
    this._errorHandler = this._errorHandlerFb;
  }
  reset() {
    this.currentState = this.initialState, this._oscParser.reset(), this._dcsParser.reset(), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0, this._parseStack.state !== 0 && (this._parseStack.state = 2, this._parseStack.handlers = []);
  }
  _preserveStack(e, t, r, i, s) {
    this._parseStack.state = e, this._parseStack.handlers = t, this._parseStack.handlerPos = r, this._parseStack.transition = i, this._parseStack.chunkPos = s;
  }
  parse(e, t, r) {
    let i = 0, s = 0, n = 0, o;
    if (this._parseStack.state) if (this._parseStack.state === 2) this._parseStack.state = 0, n = this._parseStack.chunkPos + 1;
    else {
      if (r === void 0 || this._parseStack.state === 1) throw this._parseStack.state = 1, new Error("improper continuation due to previous async handler, giving up parsing");
      let a = this._parseStack.handlers, h = this._parseStack.handlerPos - 1;
      switch (this._parseStack.state) {
        case 3:
          if (r === !1 && h > -1) {
            for (; h >= 0 && (o = a[h](this._params), o !== !0); h--) if (o instanceof Promise) return this._parseStack.handlerPos = h, o;
          }
          this._parseStack.handlers = [];
          break;
        case 4:
          if (r === !1 && h > -1) {
            for (; h >= 0 && (o = a[h](), o !== !0); h--) if (o instanceof Promise) return this._parseStack.handlerPos = h, o;
          }
          this._parseStack.handlers = [];
          break;
        case 6:
          if (i = e[this._parseStack.chunkPos], o = this._dcsParser.unhook(i !== 24 && i !== 26, r), o) return o;
          i === 27 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
          break;
        case 5:
          if (i = e[this._parseStack.chunkPos], o = this._oscParser.end(i !== 24 && i !== 26, r), o) return o;
          i === 27 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
          break;
      }
      this._parseStack.state = 0, n = this._parseStack.chunkPos + 1, this.precedingJoinState = 0, this.currentState = this._parseStack.transition & 15;
    }
    for (let a = n; a < t; ++a) {
      switch (i = e[a], s = this._transitions.table[this.currentState << 8 | (i < 160 ? i : ut)], s >> 4) {
        case 2:
          for (let p = a + 1; ; ++p) {
            if (p >= t || (i = e[p]) < 32 || i > 126 && i < ut) {
              this._printHandler(e, a, p), a = p - 1;
              break;
            }
            if (++p >= t || (i = e[p]) < 32 || i > 126 && i < ut) {
              this._printHandler(e, a, p), a = p - 1;
              break;
            }
            if (++p >= t || (i = e[p]) < 32 || i > 126 && i < ut) {
              this._printHandler(e, a, p), a = p - 1;
              break;
            }
            if (++p >= t || (i = e[p]) < 32 || i > 126 && i < ut) {
              this._printHandler(e, a, p), a = p - 1;
              break;
            }
          }
          break;
        case 3:
          this._executeHandlers[i] ? this._executeHandlers[i]() : this._executeHandlerFb(i), this.precedingJoinState = 0;
          break;
        case 0:
          break;
        case 1:
          if (this._errorHandler({ position: a, code: i, currentState: this.currentState, collect: this._collect, params: this._params, abort: !1 }).abort) return;
          break;
        case 7:
          let h = this._csiHandlers[this._collect << 8 | i], l = h ? h.length - 1 : -1;
          for (; l >= 0 && (o = h[l](this._params), o !== !0); l--) if (o instanceof Promise) return this._preserveStack(3, h, l, s, a), o;
          l < 0 && this._csiHandlerFb(this._collect << 8 | i, this._params), this.precedingJoinState = 0;
          break;
        case 8:
          do
            switch (i) {
              case 59:
                this._params.addParam(0);
                break;
              case 58:
                this._params.addSubParam(-1);
                break;
              default:
                this._params.addDigit(i - 48);
            }
          while (++a < t && (i = e[a]) > 47 && i < 60);
          a--;
          break;
        case 9:
          this._collect <<= 8, this._collect |= i;
          break;
        case 10:
          let c = this._escHandlers[this._collect << 8 | i], u = c ? c.length - 1 : -1;
          for (; u >= 0 && (o = c[u](), o !== !0); u--) if (o instanceof Promise) return this._preserveStack(4, c, u, s, a), o;
          u < 0 && this._escHandlerFb(this._collect << 8 | i), this.precedingJoinState = 0;
          break;
        case 11:
          this._params.reset(), this._params.addParam(0), this._collect = 0;
          break;
        case 12:
          this._dcsParser.hook(this._collect << 8 | i, this._params);
          break;
        case 13:
          for (let p = a + 1; ; ++p) if (p >= t || (i = e[p]) === 24 || i === 26 || i === 27 || i > 127 && i < ut) {
            this._dcsParser.put(e, a, p), a = p - 1;
            break;
          }
          break;
        case 14:
          if (o = this._dcsParser.unhook(i !== 24 && i !== 26), o) return this._preserveStack(6, [], 0, s, a), o;
          i === 27 && (s |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0;
          break;
        case 4:
          this._oscParser.start();
          break;
        case 5:
          for (let p = a + 1; ; p++) if (p >= t || (i = e[p]) < 32 || i > 127 && i < ut) {
            this._oscParser.put(e, a, p), a = p - 1;
            break;
          }
          break;
        case 6:
          if (o = this._oscParser.end(i !== 24 && i !== 26), o) return this._preserveStack(5, [], 0, s, a), o;
          i === 27 && (s |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0;
          break;
      }
      this.currentState = s & 15;
    }
  }
}, im = /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/, sm = /^[\da-f]+$/;
function Ic(e) {
  if (!e) return;
  let t = e.toLowerCase();
  if (t.indexOf("rgb:") === 0) {
    t = t.slice(4);
    let r = im.exec(t);
    if (r) {
      let i = r[1] ? 15 : r[4] ? 255 : r[7] ? 4095 : 65535;
      return [Math.round(parseInt(r[1] || r[4] || r[7] || r[10], 16) / i * 255), Math.round(parseInt(r[2] || r[5] || r[8] || r[11], 16) / i * 255), Math.round(parseInt(r[3] || r[6] || r[9] || r[12], 16) / i * 255)];
    }
  } else if (t.indexOf("#") === 0 && (t = t.slice(1), sm.exec(t) && [3, 6, 9, 12].includes(t.length))) {
    let r = t.length / 3, i = [0, 0, 0];
    for (let s = 0; s < 3; ++s) {
      let n = parseInt(t.slice(r * s, r * s + r), 16);
      i[s] = r === 1 ? n << 4 : r === 2 ? n : r === 3 ? n >> 4 : n >> 8;
    }
    return i;
  }
}
function yo(e, t) {
  let r = e.toString(16), i = r.length < 2 ? "0" + r : r;
  switch (t) {
    case 4:
      return r[0];
    case 8:
      return i;
    case 12:
      return (i + i).slice(0, 3);
    default:
      return i + i;
  }
}
function nm(e, t = 16) {
  let [r, i, s] = e;
  return `rgb:${yo(r, t)}/${yo(i, t)}/${yo(s, t)}`;
}
var om = { "(": 0, ")": 1, "*": 2, "+": 3, "-": 1, ".": 2 }, Jt = 131072, Nc = 10;
function Fc(e, t) {
  if (e > 24) return t.setWinLines || !1;
  switch (e) {
    case 1:
      return !!t.restoreWin;
    case 2:
      return !!t.minimizeWin;
    case 3:
      return !!t.setWinPosition;
    case 4:
      return !!t.setWinSizePixels;
    case 5:
      return !!t.raiseWin;
    case 6:
      return !!t.lowerWin;
    case 7:
      return !!t.refreshWin;
    case 8:
      return !!t.setWinSizeChars;
    case 9:
      return !!t.maximizeWin;
    case 10:
      return !!t.fullscreenWin;
    case 11:
      return !!t.getWinState;
    case 13:
      return !!t.getWinPosition;
    case 14:
      return !!t.getWinSizePixels;
    case 15:
      return !!t.getScreenSizePixels;
    case 16:
      return !!t.getCellSizePixels;
    case 18:
      return !!t.getWinSizeChars;
    case 19:
      return !!t.getScreenSizeChars;
    case 20:
      return !!t.getIconTitle;
    case 21:
      return !!t.getWinTitle;
    case 22:
      return !!t.pushTitle;
    case 23:
      return !!t.popTitle;
    case 24:
      return !!t.setWinLines;
  }
  return !1;
}
var Uc = 5e3, Hc = 0, am = class extends de {
  constructor(e, t, r, i, s, n, o, a, h = new rm()) {
    super(), this._bufferService = e, this._charsetService = t, this._coreService = r, this._logService = i, this._optionsService = s, this._oscLinkService = n, this._coreMouseService = o, this._unicodeService = a, this._parser = h, this._parseBuffer = new Uint32Array(4096), this._stringDecoder = new kg(), this._utf8Decoder = new Bg(), this._windowTitle = "", this._iconName = "", this._windowTitleStack = [], this._iconNameStack = [], this._curAttrData = Le.clone(), this._eraseAttrDataInternal = Le.clone(), this._onRequestBell = this._register(new Q()), this.onRequestBell = this._onRequestBell.event, this._onRequestRefreshRows = this._register(new Q()), this.onRequestRefreshRows = this._onRequestRefreshRows.event, this._onRequestReset = this._register(new Q()), this.onRequestReset = this._onRequestReset.event, this._onRequestSendFocus = this._register(new Q()), this.onRequestSendFocus = this._onRequestSendFocus.event, this._onRequestSyncScrollBar = this._register(new Q()), this.onRequestSyncScrollBar = this._onRequestSyncScrollBar.event, this._onRequestWindowsOptionsReport = this._register(new Q()), this.onRequestWindowsOptionsReport = this._onRequestWindowsOptionsReport.event, this._onA11yChar = this._register(new Q()), this.onA11yChar = this._onA11yChar.event, this._onA11yTab = this._register(new Q()), this.onA11yTab = this._onA11yTab.event, this._onCursorMove = this._register(new Q()), this.onCursorMove = this._onCursorMove.event, this._onLineFeed = this._register(new Q()), this.onLineFeed = this._onLineFeed.event, this._onScroll = this._register(new Q()), this.onScroll = this._onScroll.event, this._onTitleChange = this._register(new Q()), this.onTitleChange = this._onTitleChange.event, this._onColor = this._register(new Q()), this.onColor = this._onColor.event, this._parseStack = { paused: !1, cursorStartX: 0, cursorStartY: 0, decodedLength: 0, position: 0 }, this._specialColors = [256, 257, 258], this._register(this._parser), this._dirtyRowTracker = new ua(this._bufferService), this._activeBuffer = this._bufferService.buffer, this._register(this._bufferService.buffers.onBufferActivate((l) => this._activeBuffer = l.activeBuffer)), this._parser.setCsiHandlerFallback((l, c) => {
      this._logService.debug("Unknown CSI code: ", { identifier: this._parser.identToString(l), params: c.toArray() });
    }), this._parser.setEscHandlerFallback((l) => {
      this._logService.debug("Unknown ESC code: ", { identifier: this._parser.identToString(l) });
    }), this._parser.setExecuteHandlerFallback((l) => {
      this._logService.debug("Unknown EXECUTE code: ", { code: l });
    }), this._parser.setOscHandlerFallback((l, c, u) => {
      this._logService.debug("Unknown OSC code: ", { identifier: l, action: c, data: u });
    }), this._parser.setDcsHandlerFallback((l, c, u) => {
      c === "HOOK" && (u = u.toArray()), this._logService.debug("Unknown DCS code: ", { identifier: this._parser.identToString(l), action: c, payload: u });
    }), this._parser.setPrintHandler((l, c, u) => this.print(l, c, u)), this._parser.registerCsiHandler({ final: "@" }, (l) => this.insertChars(l)), this._parser.registerCsiHandler({ intermediates: " ", final: "@" }, (l) => this.scrollLeft(l)), this._parser.registerCsiHandler({ final: "A" }, (l) => this.cursorUp(l)), this._parser.registerCsiHandler({ intermediates: " ", final: "A" }, (l) => this.scrollRight(l)), this._parser.registerCsiHandler({ final: "B" }, (l) => this.cursorDown(l)), this._parser.registerCsiHandler({ final: "C" }, (l) => this.cursorForward(l)), this._parser.registerCsiHandler({ final: "D" }, (l) => this.cursorBackward(l)), this._parser.registerCsiHandler({ final: "E" }, (l) => this.cursorNextLine(l)), this._parser.registerCsiHandler({ final: "F" }, (l) => this.cursorPrecedingLine(l)), this._parser.registerCsiHandler({ final: "G" }, (l) => this.cursorCharAbsolute(l)), this._parser.registerCsiHandler({ final: "H" }, (l) => this.cursorPosition(l)), this._parser.registerCsiHandler({ final: "I" }, (l) => this.cursorForwardTab(l)), this._parser.registerCsiHandler({ final: "J" }, (l) => this.eraseInDisplay(l, !1)), this._parser.registerCsiHandler({ prefix: "?", final: "J" }, (l) => this.eraseInDisplay(l, !0)), this._parser.registerCsiHandler({ final: "K" }, (l) => this.eraseInLine(l, !1)), this._parser.registerCsiHandler({ prefix: "?", final: "K" }, (l) => this.eraseInLine(l, !0)), this._parser.registerCsiHandler({ final: "L" }, (l) => this.insertLines(l)), this._parser.registerCsiHandler({ final: "M" }, (l) => this.deleteLines(l)), this._parser.registerCsiHandler({ final: "P" }, (l) => this.deleteChars(l)), this._parser.registerCsiHandler({ final: "S" }, (l) => this.scrollUp(l)), this._parser.registerCsiHandler({ final: "T" }, (l) => this.scrollDown(l)), this._parser.registerCsiHandler({ final: "X" }, (l) => this.eraseChars(l)), this._parser.registerCsiHandler({ final: "Z" }, (l) => this.cursorBackwardTab(l)), this._parser.registerCsiHandler({ final: "`" }, (l) => this.charPosAbsolute(l)), this._parser.registerCsiHandler({ final: "a" }, (l) => this.hPositionRelative(l)), this._parser.registerCsiHandler({ final: "b" }, (l) => this.repeatPrecedingCharacter(l)), this._parser.registerCsiHandler({ final: "c" }, (l) => this.sendDeviceAttributesPrimary(l)), this._parser.registerCsiHandler({ prefix: ">", final: "c" }, (l) => this.sendDeviceAttributesSecondary(l)), this._parser.registerCsiHandler({ final: "d" }, (l) => this.linePosAbsolute(l)), this._parser.registerCsiHandler({ final: "e" }, (l) => this.vPositionRelative(l)), this._parser.registerCsiHandler({ final: "f" }, (l) => this.hVPosition(l)), this._parser.registerCsiHandler({ final: "g" }, (l) => this.tabClear(l)), this._parser.registerCsiHandler({ final: "h" }, (l) => this.setMode(l)), this._parser.registerCsiHandler({ prefix: "?", final: "h" }, (l) => this.setModePrivate(l)), this._parser.registerCsiHandler({ final: "l" }, (l) => this.resetMode(l)), this._parser.registerCsiHandler({ prefix: "?", final: "l" }, (l) => this.resetModePrivate(l)), this._parser.registerCsiHandler({ final: "m" }, (l) => this.charAttributes(l)), this._parser.registerCsiHandler({ final: "n" }, (l) => this.deviceStatus(l)), this._parser.registerCsiHandler({ prefix: "?", final: "n" }, (l) => this.deviceStatusPrivate(l)), this._parser.registerCsiHandler({ intermediates: "!", final: "p" }, (l) => this.softReset(l)), this._parser.registerCsiHandler({ intermediates: " ", final: "q" }, (l) => this.setCursorStyle(l)), this._parser.registerCsiHandler({ final: "r" }, (l) => this.setScrollRegion(l)), this._parser.registerCsiHandler({ final: "s" }, (l) => this.saveCursor(l)), this._parser.registerCsiHandler({ final: "t" }, (l) => this.windowOptions(l)), this._parser.registerCsiHandler({ final: "u" }, (l) => this.restoreCursor(l)), this._parser.registerCsiHandler({ intermediates: "'", final: "}" }, (l) => this.insertColumns(l)), this._parser.registerCsiHandler({ intermediates: "'", final: "~" }, (l) => this.deleteColumns(l)), this._parser.registerCsiHandler({ intermediates: '"', final: "q" }, (l) => this.selectProtected(l)), this._parser.registerCsiHandler({ intermediates: "$", final: "p" }, (l) => this.requestMode(l, !0)), this._parser.registerCsiHandler({ prefix: "?", intermediates: "$", final: "p" }, (l) => this.requestMode(l, !1)), this._parser.setExecuteHandler(q.BEL, () => this.bell()), this._parser.setExecuteHandler(q.LF, () => this.lineFeed()), this._parser.setExecuteHandler(q.VT, () => this.lineFeed()), this._parser.setExecuteHandler(q.FF, () => this.lineFeed()), this._parser.setExecuteHandler(q.CR, () => this.carriageReturn()), this._parser.setExecuteHandler(q.BS, () => this.backspace()), this._parser.setExecuteHandler(q.HT, () => this.tab()), this._parser.setExecuteHandler(q.SO, () => this.shiftOut()), this._parser.setExecuteHandler(q.SI, () => this.shiftIn()), this._parser.setExecuteHandler(ji.IND, () => this.index()), this._parser.setExecuteHandler(ji.NEL, () => this.nextLine()), this._parser.setExecuteHandler(ji.HTS, () => this.tabSet()), this._parser.registerOscHandler(0, new nt((l) => (this.setTitle(l), this.setIconName(l), !0))), this._parser.registerOscHandler(1, new nt((l) => this.setIconName(l))), this._parser.registerOscHandler(2, new nt((l) => this.setTitle(l))), this._parser.registerOscHandler(4, new nt((l) => this.setOrReportIndexedColor(l))), this._parser.registerOscHandler(8, new nt((l) => this.setHyperlink(l))), this._parser.registerOscHandler(10, new nt((l) => this.setOrReportFgColor(l))), this._parser.registerOscHandler(11, new nt((l) => this.setOrReportBgColor(l))), this._parser.registerOscHandler(12, new nt((l) => this.setOrReportCursorColor(l))), this._parser.registerOscHandler(104, new nt((l) => this.restoreIndexedColor(l))), this._parser.registerOscHandler(110, new nt((l) => this.restoreFgColor(l))), this._parser.registerOscHandler(111, new nt((l) => this.restoreBgColor(l))), this._parser.registerOscHandler(112, new nt((l) => this.restoreCursorColor(l))), this._parser.registerEscHandler({ final: "7" }, () => this.saveCursor()), this._parser.registerEscHandler({ final: "8" }, () => this.restoreCursor()), this._parser.registerEscHandler({ final: "D" }, () => this.index()), this._parser.registerEscHandler({ final: "E" }, () => this.nextLine()), this._parser.registerEscHandler({ final: "H" }, () => this.tabSet()), this._parser.registerEscHandler({ final: "M" }, () => this.reverseIndex()), this._parser.registerEscHandler({ final: "=" }, () => this.keypadApplicationMode()), this._parser.registerEscHandler({ final: ">" }, () => this.keypadNumericMode()), this._parser.registerEscHandler({ final: "c" }, () => this.fullReset()), this._parser.registerEscHandler({ final: "n" }, () => this.setgLevel(2)), this._parser.registerEscHandler({ final: "o" }, () => this.setgLevel(3)), this._parser.registerEscHandler({ final: "|" }, () => this.setgLevel(3)), this._parser.registerEscHandler({ final: "}" }, () => this.setgLevel(2)), this._parser.registerEscHandler({ final: "~" }, () => this.setgLevel(1)), this._parser.registerEscHandler({ intermediates: "%", final: "@" }, () => this.selectDefaultCharset()), this._parser.registerEscHandler({ intermediates: "%", final: "G" }, () => this.selectDefaultCharset());
    for (let l in Ie) this._parser.registerEscHandler({ intermediates: "(", final: l }, () => this.selectCharset("(" + l)), this._parser.registerEscHandler({ intermediates: ")", final: l }, () => this.selectCharset(")" + l)), this._parser.registerEscHandler({ intermediates: "*", final: l }, () => this.selectCharset("*" + l)), this._parser.registerEscHandler({ intermediates: "+", final: l }, () => this.selectCharset("+" + l)), this._parser.registerEscHandler({ intermediates: "-", final: l }, () => this.selectCharset("-" + l)), this._parser.registerEscHandler({ intermediates: ".", final: l }, () => this.selectCharset("." + l)), this._parser.registerEscHandler({ intermediates: "/", final: l }, () => this.selectCharset("/" + l));
    this._parser.registerEscHandler({ intermediates: "#", final: "8" }, () => this.screenAlignmentPattern()), this._parser.setErrorHandler((l) => (this._logService.error("Parsing error: ", l), l)), this._parser.registerDcsHandler({ intermediates: "$", final: "q" }, new Oc((l, c) => this.requestStatusString(l, c)));
  }
  getAttrData() {
    return this._curAttrData;
  }
  _preserveStack(e, t, r, i) {
    this._parseStack.paused = !0, this._parseStack.cursorStartX = e, this._parseStack.cursorStartY = t, this._parseStack.decodedLength = r, this._parseStack.position = i;
  }
  _logSlowResolvingAsync(e) {
    this._logService.logLevel <= 3 && Promise.race([e, new Promise((t, r) => setTimeout(() => r("#SLOW_TIMEOUT"), Uc))]).catch((t) => {
      if (t !== "#SLOW_TIMEOUT") throw t;
      console.warn(`async parser handler taking longer than ${Uc} ms`);
    });
  }
  _getCurrentLinkId() {
    return this._curAttrData.extended.urlId;
  }
  parse(e, t) {
    let r, i = this._activeBuffer.x, s = this._activeBuffer.y, n = 0, o = this._parseStack.paused;
    if (o) {
      if (r = this._parser.parse(this._parseBuffer, this._parseStack.decodedLength, t)) return this._logSlowResolvingAsync(r), r;
      i = this._parseStack.cursorStartX, s = this._parseStack.cursorStartY, this._parseStack.paused = !1, e.length > Jt && (n = this._parseStack.position + Jt);
    }
    if (this._logService.logLevel <= 1 && this._logService.debug(`parsing data ${typeof e == "string" ? ` "${e}"` : ` "${Array.prototype.map.call(e, (l) => String.fromCharCode(l)).join("")}"`}`), this._logService.logLevel === 0 && this._logService.trace("parsing data (codes)", typeof e == "string" ? e.split("").map((l) => l.charCodeAt(0)) : e), this._parseBuffer.length < e.length && this._parseBuffer.length < Jt && (this._parseBuffer = new Uint32Array(Math.min(e.length, Jt))), o || this._dirtyRowTracker.clearRange(), e.length > Jt) for (let l = n; l < e.length; l += Jt) {
      let c = l + Jt < e.length ? l + Jt : e.length, u = typeof e == "string" ? this._stringDecoder.decode(e.substring(l, c), this._parseBuffer) : this._utf8Decoder.decode(e.subarray(l, c), this._parseBuffer);
      if (r = this._parser.parse(this._parseBuffer, u)) return this._preserveStack(i, s, u, l), this._logSlowResolvingAsync(r), r;
    }
    else if (!o) {
      let l = typeof e == "string" ? this._stringDecoder.decode(e, this._parseBuffer) : this._utf8Decoder.decode(e, this._parseBuffer);
      if (r = this._parser.parse(this._parseBuffer, l)) return this._preserveStack(i, s, l, 0), this._logSlowResolvingAsync(r), r;
    }
    (this._activeBuffer.x !== i || this._activeBuffer.y !== s) && this._onCursorMove.fire();
    let a = this._dirtyRowTracker.end + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp), h = this._dirtyRowTracker.start + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
    h < this._bufferService.rows && this._onRequestRefreshRows.fire({ start: Math.min(h, this._bufferService.rows - 1), end: Math.min(a, this._bufferService.rows - 1) });
  }
  print(e, t, r) {
    let i, s, n = this._charsetService.charset, o = this._optionsService.rawOptions.screenReaderMode, a = this._bufferService.cols, h = this._coreService.decPrivateModes.wraparound, l = this._coreService.modes.insertMode, c = this._curAttrData, u = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._activeBuffer.x && r - t > 0 && u.getWidth(this._activeBuffer.x - 1) === 2 && u.setCellFromCodepoint(this._activeBuffer.x - 1, 0, 1, c);
    let p = this._parser.precedingJoinState;
    for (let _ = t; _ < r; ++_) {
      if (i = e[_], i < 127 && n) {
        let y = n[String.fromCharCode(i)];
        y && (i = y.charCodeAt(0));
      }
      let m = this._unicodeService.charProperties(i, p);
      s = cr.extractWidth(m);
      let g = cr.extractShouldJoin(m), w = g ? cr.extractWidth(p) : 0;
      if (p = m, o && this._onA11yChar.fire(Zt(i)), this._getCurrentLinkId() && this._oscLinkService.addLineToLink(this._getCurrentLinkId(), this._activeBuffer.ybase + this._activeBuffer.y), this._activeBuffer.x + s - w > a) {
        if (h) {
          let y = u, E = this._activeBuffer.x - w;
          for (this._activeBuffer.x = w, this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData(), !0)) : (this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = !0), u = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y), w > 0 && u instanceof Gr && u.copyCellsFrom(y, E, 0, w, !1); E < a; ) y.setCellFromCodepoint(E++, 0, 1, c);
        } else if (this._activeBuffer.x = a - 1, s === 2) continue;
      }
      if (g && this._activeBuffer.x) {
        let y = u.getWidth(this._activeBuffer.x - 1) ? 1 : 2;
        u.addCodepointToCell(this._activeBuffer.x - y, i, s);
        for (let E = s - w; --E >= 0; ) u.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, c);
        continue;
      }
      if (l && (u.insertCells(this._activeBuffer.x, s - w, this._activeBuffer.getNullCell(c)), u.getWidth(a - 1) === 2 && u.setCellFromCodepoint(a - 1, 0, 1, c)), u.setCellFromCodepoint(this._activeBuffer.x++, i, s, c), s > 0) for (; --s; ) u.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, c);
    }
    this._parser.precedingJoinState = p, this._activeBuffer.x < a && r - t > 0 && u.getWidth(this._activeBuffer.x) === 0 && !u.hasContent(this._activeBuffer.x) && u.setCellFromCodepoint(this._activeBuffer.x, 0, 1, c), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
  }
  registerCsiHandler(e, t) {
    return e.final === "t" && !e.prefix && !e.intermediates ? this._parser.registerCsiHandler(e, (r) => Fc(r.params[0], this._optionsService.rawOptions.windowOptions) ? t(r) : !0) : this._parser.registerCsiHandler(e, t);
  }
  registerDcsHandler(e, t) {
    return this._parser.registerDcsHandler(e, new Oc(t));
  }
  registerEscHandler(e, t) {
    return this._parser.registerEscHandler(e, t);
  }
  registerOscHandler(e, t) {
    return this._parser.registerOscHandler(e, new nt(t));
  }
  bell() {
    return this._onRequestBell.fire(), !0;
  }
  lineFeed() {
    return this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._optionsService.rawOptions.convertEol && (this._activeBuffer.x = 0), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows ? this._activeBuffer.y = this._bufferService.rows - 1 : this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = !1, this._activeBuffer.x >= this._bufferService.cols && this._activeBuffer.x--, this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._onLineFeed.fire(), !0;
  }
  carriageReturn() {
    return this._activeBuffer.x = 0, !0;
  }
  backspace() {
    var e;
    if (!this._coreService.decPrivateModes.reverseWraparound) return this._restrictCursor(), this._activeBuffer.x > 0 && this._activeBuffer.x--, !0;
    if (this._restrictCursor(this._bufferService.cols), this._activeBuffer.x > 0) this._activeBuffer.x--;
    else if (this._activeBuffer.x === 0 && this._activeBuffer.y > this._activeBuffer.scrollTop && this._activeBuffer.y <= this._activeBuffer.scrollBottom && ((e = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y)) != null && e.isWrapped)) {
      this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = !1, this._activeBuffer.y--, this._activeBuffer.x = this._bufferService.cols - 1;
      let t = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
      t.hasWidth(this._activeBuffer.x) && !t.hasContent(this._activeBuffer.x) && this._activeBuffer.x--;
    }
    return this._restrictCursor(), !0;
  }
  tab() {
    if (this._activeBuffer.x >= this._bufferService.cols) return !0;
    let e = this._activeBuffer.x;
    return this._activeBuffer.x = this._activeBuffer.nextStop(), this._optionsService.rawOptions.screenReaderMode && this._onA11yTab.fire(this._activeBuffer.x - e), !0;
  }
  shiftOut() {
    return this._charsetService.setgLevel(1), !0;
  }
  shiftIn() {
    return this._charsetService.setgLevel(0), !0;
  }
  _restrictCursor(e = this._bufferService.cols - 1) {
    this._activeBuffer.x = Math.min(e, Math.max(0, this._activeBuffer.x)), this._activeBuffer.y = this._coreService.decPrivateModes.origin ? Math.min(this._activeBuffer.scrollBottom, Math.max(this._activeBuffer.scrollTop, this._activeBuffer.y)) : Math.min(this._bufferService.rows - 1, Math.max(0, this._activeBuffer.y)), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
  }
  _setCursor(e, t) {
    this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._coreService.decPrivateModes.origin ? (this._activeBuffer.x = e, this._activeBuffer.y = this._activeBuffer.scrollTop + t) : (this._activeBuffer.x = e, this._activeBuffer.y = t), this._restrictCursor(), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
  }
  _moveCursor(e, t) {
    this._restrictCursor(), this._setCursor(this._activeBuffer.x + e, this._activeBuffer.y + t);
  }
  cursorUp(e) {
    let t = this._activeBuffer.y - this._activeBuffer.scrollTop;
    return t >= 0 ? this._moveCursor(0, -Math.min(t, e.params[0] || 1)) : this._moveCursor(0, -(e.params[0] || 1)), !0;
  }
  cursorDown(e) {
    let t = this._activeBuffer.scrollBottom - this._activeBuffer.y;
    return t >= 0 ? this._moveCursor(0, Math.min(t, e.params[0] || 1)) : this._moveCursor(0, e.params[0] || 1), !0;
  }
  cursorForward(e) {
    return this._moveCursor(e.params[0] || 1, 0), !0;
  }
  cursorBackward(e) {
    return this._moveCursor(-(e.params[0] || 1), 0), !0;
  }
  cursorNextLine(e) {
    return this.cursorDown(e), this._activeBuffer.x = 0, !0;
  }
  cursorPrecedingLine(e) {
    return this.cursorUp(e), this._activeBuffer.x = 0, !0;
  }
  cursorCharAbsolute(e) {
    return this._setCursor((e.params[0] || 1) - 1, this._activeBuffer.y), !0;
  }
  cursorPosition(e) {
    return this._setCursor(e.length >= 2 ? (e.params[1] || 1) - 1 : 0, (e.params[0] || 1) - 1), !0;
  }
  charPosAbsolute(e) {
    return this._setCursor((e.params[0] || 1) - 1, this._activeBuffer.y), !0;
  }
  hPositionRelative(e) {
    return this._moveCursor(e.params[0] || 1, 0), !0;
  }
  linePosAbsolute(e) {
    return this._setCursor(this._activeBuffer.x, (e.params[0] || 1) - 1), !0;
  }
  vPositionRelative(e) {
    return this._moveCursor(0, e.params[0] || 1), !0;
  }
  hVPosition(e) {
    return this.cursorPosition(e), !0;
  }
  tabClear(e) {
    let t = e.params[0];
    return t === 0 ? delete this._activeBuffer.tabs[this._activeBuffer.x] : t === 3 && (this._activeBuffer.tabs = {}), !0;
  }
  cursorForwardTab(e) {
    if (this._activeBuffer.x >= this._bufferService.cols) return !0;
    let t = e.params[0] || 1;
    for (; t--; ) this._activeBuffer.x = this._activeBuffer.nextStop();
    return !0;
  }
  cursorBackwardTab(e) {
    if (this._activeBuffer.x >= this._bufferService.cols) return !0;
    let t = e.params[0] || 1;
    for (; t--; ) this._activeBuffer.x = this._activeBuffer.prevStop();
    return !0;
  }
  selectProtected(e) {
    let t = e.params[0];
    return t === 1 && (this._curAttrData.bg |= 536870912), (t === 2 || t === 0) && (this._curAttrData.bg &= -536870913), !0;
  }
  _eraseInBufferLine(e, t, r, i = !1, s = !1) {
    let n = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
    n.replaceCells(t, r, this._activeBuffer.getNullCell(this._eraseAttrData()), s), i && (n.isWrapped = !1);
  }
  _resetBufferLine(e, t = !1) {
    let r = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
    r && (r.fill(this._activeBuffer.getNullCell(this._eraseAttrData()), t), this._bufferService.buffer.clearMarkers(this._activeBuffer.ybase + e), r.isWrapped = !1);
  }
  eraseInDisplay(e, t = !1) {
    var i;
    this._restrictCursor(this._bufferService.cols);
    let r;
    switch (e.params[0]) {
      case 0:
        for (r = this._activeBuffer.y, this._dirtyRowTracker.markDirty(r), this._eraseInBufferLine(r++, this._activeBuffer.x, this._bufferService.cols, this._activeBuffer.x === 0, t); r < this._bufferService.rows; r++) this._resetBufferLine(r, t);
        this._dirtyRowTracker.markDirty(r);
        break;
      case 1:
        for (r = this._activeBuffer.y, this._dirtyRowTracker.markDirty(r), this._eraseInBufferLine(r, 0, this._activeBuffer.x + 1, !0, t), this._activeBuffer.x + 1 >= this._bufferService.cols && (this._activeBuffer.lines.get(r + 1).isWrapped = !1); r--; ) this._resetBufferLine(r, t);
        this._dirtyRowTracker.markDirty(0);
        break;
      case 2:
        if (this._optionsService.rawOptions.scrollOnEraseInDisplay) {
          for (r = this._bufferService.rows, this._dirtyRowTracker.markRangeDirty(0, r - 1); r-- && !((i = this._activeBuffer.lines.get(this._activeBuffer.ybase + r)) != null && i.getTrimmedLength()); ) ;
          for (; r >= 0; r--) this._bufferService.scroll(this._eraseAttrData());
        } else {
          for (r = this._bufferService.rows, this._dirtyRowTracker.markDirty(r - 1); r--; ) this._resetBufferLine(r, t);
          this._dirtyRowTracker.markDirty(0);
        }
        break;
      case 3:
        let s = this._activeBuffer.lines.length - this._bufferService.rows;
        s > 0 && (this._activeBuffer.lines.trimStart(s), this._activeBuffer.ybase = Math.max(this._activeBuffer.ybase - s, 0), this._activeBuffer.ydisp = Math.max(this._activeBuffer.ydisp - s, 0), this._onScroll.fire(0));
        break;
    }
    return !0;
  }
  eraseInLine(e, t = !1) {
    switch (this._restrictCursor(this._bufferService.cols), e.params[0]) {
      case 0:
        this._eraseInBufferLine(this._activeBuffer.y, this._activeBuffer.x, this._bufferService.cols, this._activeBuffer.x === 0, t);
        break;
      case 1:
        this._eraseInBufferLine(this._activeBuffer.y, 0, this._activeBuffer.x + 1, !1, t);
        break;
      case 2:
        this._eraseInBufferLine(this._activeBuffer.y, 0, this._bufferService.cols, !0, t);
        break;
    }
    return this._dirtyRowTracker.markDirty(this._activeBuffer.y), !0;
  }
  insertLines(e) {
    this._restrictCursor();
    let t = e.params[0] || 1;
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
    let r = this._activeBuffer.ybase + this._activeBuffer.y, i = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, s = this._bufferService.rows - 1 + this._activeBuffer.ybase - i + 1;
    for (; t--; ) this._activeBuffer.lines.splice(s - 1, 1), this._activeBuffer.lines.splice(r, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, !0;
  }
  deleteLines(e) {
    this._restrictCursor();
    let t = e.params[0] || 1;
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
    let r = this._activeBuffer.ybase + this._activeBuffer.y, i;
    for (i = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, i = this._bufferService.rows - 1 + this._activeBuffer.ybase - i; t--; ) this._activeBuffer.lines.splice(r, 1), this._activeBuffer.lines.splice(i, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, !0;
  }
  insertChars(e) {
    this._restrictCursor();
    let t = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    return t && (t.insertCells(this._activeBuffer.x, e.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), !0;
  }
  deleteChars(e) {
    this._restrictCursor();
    let t = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    return t && (t.deleteCells(this._activeBuffer.x, e.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), !0;
  }
  scrollUp(e) {
    let t = e.params[0] || 1;
    for (; t--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
  }
  scrollDown(e) {
    let t = e.params[0] || 1;
    for (; t--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 0, this._activeBuffer.getBlankLine(Le));
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
  }
  scrollLeft(e) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
    let t = e.params[0] || 1;
    for (let r = this._activeBuffer.scrollTop; r <= this._activeBuffer.scrollBottom; ++r) {
      let i = this._activeBuffer.lines.get(this._activeBuffer.ybase + r);
      i.deleteCells(0, t, this._activeBuffer.getNullCell(this._eraseAttrData())), i.isWrapped = !1;
    }
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
  }
  scrollRight(e) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
    let t = e.params[0] || 1;
    for (let r = this._activeBuffer.scrollTop; r <= this._activeBuffer.scrollBottom; ++r) {
      let i = this._activeBuffer.lines.get(this._activeBuffer.ybase + r);
      i.insertCells(0, t, this._activeBuffer.getNullCell(this._eraseAttrData())), i.isWrapped = !1;
    }
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
  }
  insertColumns(e) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
    let t = e.params[0] || 1;
    for (let r = this._activeBuffer.scrollTop; r <= this._activeBuffer.scrollBottom; ++r) {
      let i = this._activeBuffer.lines.get(this._activeBuffer.ybase + r);
      i.insertCells(this._activeBuffer.x, t, this._activeBuffer.getNullCell(this._eraseAttrData())), i.isWrapped = !1;
    }
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
  }
  deleteColumns(e) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
    let t = e.params[0] || 1;
    for (let r = this._activeBuffer.scrollTop; r <= this._activeBuffer.scrollBottom; ++r) {
      let i = this._activeBuffer.lines.get(this._activeBuffer.ybase + r);
      i.deleteCells(this._activeBuffer.x, t, this._activeBuffer.getNullCell(this._eraseAttrData())), i.isWrapped = !1;
    }
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
  }
  eraseChars(e) {
    this._restrictCursor();
    let t = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    return t && (t.replaceCells(this._activeBuffer.x, this._activeBuffer.x + (e.params[0] || 1), this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), !0;
  }
  repeatPrecedingCharacter(e) {
    let t = this._parser.precedingJoinState;
    if (!t) return !0;
    let r = e.params[0] || 1, i = cr.extractWidth(t), s = this._activeBuffer.x - i, n = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).getString(s), o = new Uint32Array(n.length * r), a = 0;
    for (let l = 0; l < n.length; ) {
      let c = n.codePointAt(l) || 0;
      o[a++] = c, l += c > 65535 ? 2 : 1;
    }
    let h = a;
    for (let l = 1; l < r; ++l) o.copyWithin(h, 0, a), h += a;
    return this.print(o, 0, h), !0;
  }
  sendDeviceAttributesPrimary(e) {
    return e.params[0] > 0 || (this._is("xterm") || this._is("rxvt-unicode") || this._is("screen") ? this._coreService.triggerDataEvent(q.ESC + "[?1;2c") : this._is("linux") && this._coreService.triggerDataEvent(q.ESC + "[?6c")), !0;
  }
  sendDeviceAttributesSecondary(e) {
    return e.params[0] > 0 || (this._is("xterm") ? this._coreService.triggerDataEvent(q.ESC + "[>0;276;0c") : this._is("rxvt-unicode") ? this._coreService.triggerDataEvent(q.ESC + "[>85;95;0c") : this._is("linux") ? this._coreService.triggerDataEvent(e.params[0] + "c") : this._is("screen") && this._coreService.triggerDataEvent(q.ESC + "[>83;40003;0c")), !0;
  }
  _is(e) {
    return (this._optionsService.rawOptions.termName + "").indexOf(e) === 0;
  }
  setMode(e) {
    for (let t = 0; t < e.length; t++) switch (e.params[t]) {
      case 4:
        this._coreService.modes.insertMode = !0;
        break;
      case 20:
        this._optionsService.options.convertEol = !0;
        break;
    }
    return !0;
  }
  setModePrivate(e) {
    for (let t = 0; t < e.length; t++) switch (e.params[t]) {
      case 1:
        this._coreService.decPrivateModes.applicationCursorKeys = !0;
        break;
      case 2:
        this._charsetService.setgCharset(0, ar), this._charsetService.setgCharset(1, ar), this._charsetService.setgCharset(2, ar), this._charsetService.setgCharset(3, ar);
        break;
      case 3:
        this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(132, this._bufferService.rows), this._onRequestReset.fire());
        break;
      case 6:
        this._coreService.decPrivateModes.origin = !0, this._setCursor(0, 0);
        break;
      case 7:
        this._coreService.decPrivateModes.wraparound = !0;
        break;
      case 12:
        this._optionsService.options.cursorBlink = !0;
        break;
      case 45:
        this._coreService.decPrivateModes.reverseWraparound = !0;
        break;
      case 66:
        this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = !0, this._onRequestSyncScrollBar.fire();
        break;
      case 9:
        this._coreMouseService.activeProtocol = "X10";
        break;
      case 1e3:
        this._coreMouseService.activeProtocol = "VT200";
        break;
      case 1002:
        this._coreMouseService.activeProtocol = "DRAG";
        break;
      case 1003:
        this._coreMouseService.activeProtocol = "ANY";
        break;
      case 1004:
        this._coreService.decPrivateModes.sendFocus = !0, this._onRequestSendFocus.fire();
        break;
      case 1005:
        this._logService.debug("DECSET 1005 not supported (see #2507)");
        break;
      case 1006:
        this._coreMouseService.activeEncoding = "SGR";
        break;
      case 1015:
        this._logService.debug("DECSET 1015 not supported (see #2507)");
        break;
      case 1016:
        this._coreMouseService.activeEncoding = "SGR_PIXELS";
        break;
      case 25:
        this._coreService.isCursorHidden = !1;
        break;
      case 1048:
        this.saveCursor();
        break;
      case 1049:
        this.saveCursor();
      case 47:
      case 1047:
        this._bufferService.buffers.activateAltBuffer(this._eraseAttrData()), this._coreService.isCursorInitialized = !0, this._onRequestRefreshRows.fire(void 0), this._onRequestSyncScrollBar.fire();
        break;
      case 2004:
        this._coreService.decPrivateModes.bracketedPasteMode = !0;
        break;
      case 2026:
        this._coreService.decPrivateModes.synchronizedOutput = !0;
        break;
    }
    return !0;
  }
  resetMode(e) {
    for (let t = 0; t < e.length; t++) switch (e.params[t]) {
      case 4:
        this._coreService.modes.insertMode = !1;
        break;
      case 20:
        this._optionsService.options.convertEol = !1;
        break;
    }
    return !0;
  }
  resetModePrivate(e) {
    for (let t = 0; t < e.length; t++) switch (e.params[t]) {
      case 1:
        this._coreService.decPrivateModes.applicationCursorKeys = !1;
        break;
      case 3:
        this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(80, this._bufferService.rows), this._onRequestReset.fire());
        break;
      case 6:
        this._coreService.decPrivateModes.origin = !1, this._setCursor(0, 0);
        break;
      case 7:
        this._coreService.decPrivateModes.wraparound = !1;
        break;
      case 12:
        this._optionsService.options.cursorBlink = !1;
        break;
      case 45:
        this._coreService.decPrivateModes.reverseWraparound = !1;
        break;
      case 66:
        this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = !1, this._onRequestSyncScrollBar.fire();
        break;
      case 9:
      case 1e3:
      case 1002:
      case 1003:
        this._coreMouseService.activeProtocol = "NONE";
        break;
      case 1004:
        this._coreService.decPrivateModes.sendFocus = !1;
        break;
      case 1005:
        this._logService.debug("DECRST 1005 not supported (see #2507)");
        break;
      case 1006:
        this._coreMouseService.activeEncoding = "DEFAULT";
        break;
      case 1015:
        this._logService.debug("DECRST 1015 not supported (see #2507)");
        break;
      case 1016:
        this._coreMouseService.activeEncoding = "DEFAULT";
        break;
      case 25:
        this._coreService.isCursorHidden = !0;
        break;
      case 1048:
        this.restoreCursor();
        break;
      case 1049:
      case 47:
      case 1047:
        this._bufferService.buffers.activateNormalBuffer(), e.params[t] === 1049 && this.restoreCursor(), this._coreService.isCursorInitialized = !0, this._onRequestRefreshRows.fire(void 0), this._onRequestSyncScrollBar.fire();
        break;
      case 2004:
        this._coreService.decPrivateModes.bracketedPasteMode = !1;
        break;
      case 2026:
        this._coreService.decPrivateModes.synchronizedOutput = !1, this._onRequestRefreshRows.fire(void 0);
        break;
    }
    return !0;
  }
  requestMode(e, t) {
    ((g) => (g[g.NOT_RECOGNIZED = 0] = "NOT_RECOGNIZED", g[g.SET = 1] = "SET", g[g.RESET = 2] = "RESET", g[g.PERMANENTLY_SET = 3] = "PERMANENTLY_SET", g[g.PERMANENTLY_RESET = 4] = "PERMANENTLY_RESET"))(void 0 || (r = {}));
    let i = this._coreService.decPrivateModes, { activeProtocol: s, activeEncoding: n } = this._coreMouseService, o = this._coreService, { buffers: a, cols: h } = this._bufferService, { active: l, alt: c } = a, u = this._optionsService.rawOptions, p = (g, w) => (o.triggerDataEvent(`${q.ESC}[${t ? "" : "?"}${g};${w}$y`), !0), _ = (g) => g ? 1 : 2, m = e.params[0];
    return t ? m === 2 ? p(m, 4) : m === 4 ? p(m, _(o.modes.insertMode)) : m === 12 ? p(m, 3) : m === 20 ? p(m, _(u.convertEol)) : p(m, 0) : m === 1 ? p(m, _(i.applicationCursorKeys)) : m === 3 ? p(m, u.windowOptions.setWinLines ? h === 80 ? 2 : h === 132 ? 1 : 0 : 0) : m === 6 ? p(m, _(i.origin)) : m === 7 ? p(m, _(i.wraparound)) : m === 8 ? p(m, 3) : m === 9 ? p(m, _(s === "X10")) : m === 12 ? p(m, _(u.cursorBlink)) : m === 25 ? p(m, _(!o.isCursorHidden)) : m === 45 ? p(m, _(i.reverseWraparound)) : m === 66 ? p(m, _(i.applicationKeypad)) : m === 67 ? p(m, 4) : m === 1e3 ? p(m, _(s === "VT200")) : m === 1002 ? p(m, _(s === "DRAG")) : m === 1003 ? p(m, _(s === "ANY")) : m === 1004 ? p(m, _(i.sendFocus)) : m === 1005 ? p(m, 4) : m === 1006 ? p(m, _(n === "SGR")) : m === 1015 ? p(m, 4) : m === 1016 ? p(m, _(n === "SGR_PIXELS")) : m === 1048 ? p(m, 1) : m === 47 || m === 1047 || m === 1049 ? p(m, _(l === c)) : m === 2004 ? p(m, _(i.bracketedPasteMode)) : m === 2026 ? p(m, _(i.synchronizedOutput)) : p(m, 0);
  }
  _updateAttrColor(e, t, r, i, s) {
    return t === 2 ? (e |= 50331648, e &= -16777216, e |= oi.fromColorRGB([r, i, s])) : t === 5 && (e &= -50331904, e |= 33554432 | r & 255), e;
  }
  _extractColor(e, t, r) {
    let i = [0, 0, -1, 0, 0, 0], s = 0, n = 0;
    do {
      if (i[n + s] = e.params[t + n], e.hasSubParams(t + n)) {
        let o = e.getSubParams(t + n), a = 0;
        do
          i[1] === 5 && (s = 1), i[n + a + 1 + s] = o[a];
        while (++a < o.length && a + n + 1 + s < i.length);
        break;
      }
      if (i[1] === 5 && n + s >= 2 || i[1] === 2 && n + s >= 5) break;
      i[1] && (s = 1);
    } while (++n + t < e.length && n + s < i.length);
    for (let o = 2; o < i.length; ++o) i[o] === -1 && (i[o] = 0);
    switch (i[0]) {
      case 38:
        r.fg = this._updateAttrColor(r.fg, i[1], i[3], i[4], i[5]);
        break;
      case 48:
        r.bg = this._updateAttrColor(r.bg, i[1], i[3], i[4], i[5]);
        break;
      case 58:
        r.extended = r.extended.clone(), r.extended.underlineColor = this._updateAttrColor(r.extended.underlineColor, i[1], i[3], i[4], i[5]);
    }
    return n;
  }
  _processUnderline(e, t) {
    t.extended = t.extended.clone(), (!~e || e > 5) && (e = 1), t.extended.underlineStyle = e, t.fg |= 268435456, e === 0 && (t.fg &= -268435457), t.updateExtended();
  }
  _processSGR0(e) {
    e.fg = Le.fg, e.bg = Le.bg, e.extended = e.extended.clone(), e.extended.underlineStyle = 0, e.extended.underlineColor &= -67108864, e.updateExtended();
  }
  charAttributes(e) {
    if (e.length === 1 && e.params[0] === 0) return this._processSGR0(this._curAttrData), !0;
    let t = e.length, r, i = this._curAttrData;
    for (let s = 0; s < t; s++) r = e.params[s], r >= 30 && r <= 37 ? (i.fg &= -50331904, i.fg |= 16777216 | r - 30) : r >= 40 && r <= 47 ? (i.bg &= -50331904, i.bg |= 16777216 | r - 40) : r >= 90 && r <= 97 ? (i.fg &= -50331904, i.fg |= 16777216 | r - 90 | 8) : r >= 100 && r <= 107 ? (i.bg &= -50331904, i.bg |= 16777216 | r - 100 | 8) : r === 0 ? this._processSGR0(i) : r === 1 ? i.fg |= 134217728 : r === 3 ? i.bg |= 67108864 : r === 4 ? (i.fg |= 268435456, this._processUnderline(e.hasSubParams(s) ? e.getSubParams(s)[0] : 1, i)) : r === 5 ? i.fg |= 536870912 : r === 7 ? i.fg |= 67108864 : r === 8 ? i.fg |= 1073741824 : r === 9 ? i.fg |= 2147483648 : r === 2 ? i.bg |= 134217728 : r === 21 ? this._processUnderline(2, i) : r === 22 ? (i.fg &= -134217729, i.bg &= -134217729) : r === 23 ? i.bg &= -67108865 : r === 24 ? (i.fg &= -268435457, this._processUnderline(0, i)) : r === 25 ? i.fg &= -536870913 : r === 27 ? i.fg &= -67108865 : r === 28 ? i.fg &= -1073741825 : r === 29 ? i.fg &= 2147483647 : r === 39 ? (i.fg &= -67108864, i.fg |= Le.fg & 16777215) : r === 49 ? (i.bg &= -67108864, i.bg |= Le.bg & 16777215) : r === 38 || r === 48 || r === 58 ? s += this._extractColor(e, s, i) : r === 53 ? i.bg |= 1073741824 : r === 55 ? i.bg &= -1073741825 : r === 59 ? (i.extended = i.extended.clone(), i.extended.underlineColor = -1, i.updateExtended()) : r === 100 ? (i.fg &= -67108864, i.fg |= Le.fg & 16777215, i.bg &= -67108864, i.bg |= Le.bg & 16777215) : this._logService.debug("Unknown SGR attribute: %d.", r);
    return !0;
  }
  deviceStatus(e) {
    switch (e.params[0]) {
      case 5:
        this._coreService.triggerDataEvent(`${q.ESC}[0n`);
        break;
      case 6:
        let t = this._activeBuffer.y + 1, r = this._activeBuffer.x + 1;
        this._coreService.triggerDataEvent(`${q.ESC}[${t};${r}R`);
        break;
    }
    return !0;
  }
  deviceStatusPrivate(e) {
    switch (e.params[0]) {
      case 6:
        let t = this._activeBuffer.y + 1, r = this._activeBuffer.x + 1;
        this._coreService.triggerDataEvent(`${q.ESC}[?${t};${r}R`);
        break;
    }
    return !0;
  }
  softReset(e) {
    return this._coreService.isCursorHidden = !1, this._onRequestSyncScrollBar.fire(), this._activeBuffer.scrollTop = 0, this._activeBuffer.scrollBottom = this._bufferService.rows - 1, this._curAttrData = Le.clone(), this._coreService.reset(), this._charsetService.reset(), this._activeBuffer.savedX = 0, this._activeBuffer.savedY = this._activeBuffer.ybase, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, this._coreService.decPrivateModes.origin = !1, !0;
  }
  setCursorStyle(e) {
    let t = e.length === 0 ? 1 : e.params[0];
    if (t === 0) this._coreService.decPrivateModes.cursorStyle = void 0, this._coreService.decPrivateModes.cursorBlink = void 0;
    else {
      switch (t) {
        case 1:
        case 2:
          this._coreService.decPrivateModes.cursorStyle = "block";
          break;
        case 3:
        case 4:
          this._coreService.decPrivateModes.cursorStyle = "underline";
          break;
        case 5:
        case 6:
          this._coreService.decPrivateModes.cursorStyle = "bar";
          break;
      }
      let r = t % 2 === 1;
      this._coreService.decPrivateModes.cursorBlink = r;
    }
    return !0;
  }
  setScrollRegion(e) {
    let t = e.params[0] || 1, r;
    return (e.length < 2 || (r = e.params[1]) > this._bufferService.rows || r === 0) && (r = this._bufferService.rows), r > t && (this._activeBuffer.scrollTop = t - 1, this._activeBuffer.scrollBottom = r - 1, this._setCursor(0, 0)), !0;
  }
  windowOptions(e) {
    if (!Fc(e.params[0], this._optionsService.rawOptions.windowOptions)) return !0;
    let t = e.length > 1 ? e.params[1] : 0;
    switch (e.params[0]) {
      case 14:
        t !== 2 && this._onRequestWindowsOptionsReport.fire(0);
        break;
      case 16:
        this._onRequestWindowsOptionsReport.fire(1);
        break;
      case 18:
        this._bufferService && this._coreService.triggerDataEvent(`${q.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`);
        break;
      case 22:
        (t === 0 || t === 2) && (this._windowTitleStack.push(this._windowTitle), this._windowTitleStack.length > Nc && this._windowTitleStack.shift()), (t === 0 || t === 1) && (this._iconNameStack.push(this._iconName), this._iconNameStack.length > Nc && this._iconNameStack.shift());
        break;
      case 23:
        (t === 0 || t === 2) && this._windowTitleStack.length && this.setTitle(this._windowTitleStack.pop()), (t === 0 || t === 1) && this._iconNameStack.length && this.setIconName(this._iconNameStack.pop());
        break;
    }
    return !0;
  }
  saveCursor(e) {
    return this._activeBuffer.savedX = this._activeBuffer.x, this._activeBuffer.savedY = this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, !0;
  }
  restoreCursor(e) {
    return this._activeBuffer.x = this._activeBuffer.savedX || 0, this._activeBuffer.y = Math.max(this._activeBuffer.savedY - this._activeBuffer.ybase, 0), this._curAttrData.fg = this._activeBuffer.savedCurAttrData.fg, this._curAttrData.bg = this._activeBuffer.savedCurAttrData.bg, this._charsetService.charset = this._savedCharset, this._activeBuffer.savedCharset && (this._charsetService.charset = this._activeBuffer.savedCharset), this._restrictCursor(), !0;
  }
  setTitle(e) {
    return this._windowTitle = e, this._onTitleChange.fire(e), !0;
  }
  setIconName(e) {
    return this._iconName = e, !0;
  }
  setOrReportIndexedColor(e) {
    let t = [], r = e.split(";");
    for (; r.length > 1; ) {
      let i = r.shift(), s = r.shift();
      if (/^\d+$/.exec(i)) {
        let n = parseInt(i);
        if (Wc(n)) if (s === "?") t.push({ type: 0, index: n });
        else {
          let o = Ic(s);
          o && t.push({ type: 1, index: n, color: o });
        }
      }
    }
    return t.length && this._onColor.fire(t), !0;
  }
  setHyperlink(e) {
    let t = e.indexOf(";");
    if (t === -1) return !0;
    let r = e.slice(0, t).trim(), i = e.slice(t + 1);
    return i ? this._createHyperlink(r, i) : r.trim() ? !1 : this._finishHyperlink();
  }
  _createHyperlink(e, t) {
    this._getCurrentLinkId() && this._finishHyperlink();
    let r = e.split(":"), i, s = r.findIndex((n) => n.startsWith("id="));
    return s !== -1 && (i = r[s].slice(3) || void 0), this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = this._oscLinkService.registerLink({ id: i, uri: t }), this._curAttrData.updateExtended(), !0;
  }
  _finishHyperlink() {
    return this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = 0, this._curAttrData.updateExtended(), !0;
  }
  _setOrReportSpecialColor(e, t) {
    let r = e.split(";");
    for (let i = 0; i < r.length && !(t >= this._specialColors.length); ++i, ++t) if (r[i] === "?") this._onColor.fire([{ type: 0, index: this._specialColors[t] }]);
    else {
      let s = Ic(r[i]);
      s && this._onColor.fire([{ type: 1, index: this._specialColors[t], color: s }]);
    }
    return !0;
  }
  setOrReportFgColor(e) {
    return this._setOrReportSpecialColor(e, 0);
  }
  setOrReportBgColor(e) {
    return this._setOrReportSpecialColor(e, 1);
  }
  setOrReportCursorColor(e) {
    return this._setOrReportSpecialColor(e, 2);
  }
  restoreIndexedColor(e) {
    if (!e) return this._onColor.fire([{ type: 2 }]), !0;
    let t = [], r = e.split(";");
    for (let i = 0; i < r.length; ++i) if (/^\d+$/.exec(r[i])) {
      let s = parseInt(r[i]);
      Wc(s) && t.push({ type: 2, index: s });
    }
    return t.length && this._onColor.fire(t), !0;
  }
  restoreFgColor(e) {
    return this._onColor.fire([{ type: 2, index: 256 }]), !0;
  }
  restoreBgColor(e) {
    return this._onColor.fire([{ type: 2, index: 257 }]), !0;
  }
  restoreCursorColor(e) {
    return this._onColor.fire([{ type: 2, index: 258 }]), !0;
  }
  nextLine() {
    return this._activeBuffer.x = 0, this.index(), !0;
  }
  keypadApplicationMode() {
    return this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = !0, this._onRequestSyncScrollBar.fire(), !0;
  }
  keypadNumericMode() {
    return this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = !1, this._onRequestSyncScrollBar.fire(), !0;
  }
  selectDefaultCharset() {
    return this._charsetService.setgLevel(0), this._charsetService.setgCharset(0, ar), !0;
  }
  selectCharset(e) {
    return e.length !== 2 ? (this.selectDefaultCharset(), !0) : (e[0] === "/" || this._charsetService.setgCharset(om[e[0]], Ie[e[1]] || ar), !0);
  }
  index() {
    return this._restrictCursor(), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._restrictCursor(), !0;
  }
  tabSet() {
    return this._activeBuffer.tabs[this._activeBuffer.x] = !0, !0;
  }
  reverseIndex() {
    if (this._restrictCursor(), this._activeBuffer.y === this._activeBuffer.scrollTop) {
      let e = this._activeBuffer.scrollBottom - this._activeBuffer.scrollTop;
      this._activeBuffer.lines.shiftElements(this._activeBuffer.ybase + this._activeBuffer.y, e, 1), this._activeBuffer.lines.set(this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.getBlankLine(this._eraseAttrData())), this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
    } else this._activeBuffer.y--, this._restrictCursor();
    return !0;
  }
  fullReset() {
    return this._parser.reset(), this._onRequestReset.fire(), !0;
  }
  reset() {
    this._curAttrData = Le.clone(), this._eraseAttrDataInternal = Le.clone();
  }
  _eraseAttrData() {
    return this._eraseAttrDataInternal.bg &= -67108864, this._eraseAttrDataInternal.bg |= this._curAttrData.bg & 67108863, this._eraseAttrDataInternal;
  }
  setgLevel(e) {
    return this._charsetService.setgLevel(e), !0;
  }
  screenAlignmentPattern() {
    let e = new pt();
    e.content = 1 << 22 | 69, e.fg = this._curAttrData.fg, e.bg = this._curAttrData.bg, this._setCursor(0, 0);
    for (let t = 0; t < this._bufferService.rows; ++t) {
      let r = this._activeBuffer.ybase + this._activeBuffer.y + t, i = this._activeBuffer.lines.get(r);
      i && (i.fill(e), i.isWrapped = !1);
    }
    return this._dirtyRowTracker.markAllDirty(), this._setCursor(0, 0), !0;
  }
  requestStatusString(e, t) {
    let r = (o) => (this._coreService.triggerDataEvent(`${q.ESC}${o}${q.ESC}\\`), !0), i = this._bufferService.buffer, s = this._optionsService.rawOptions;
    return r(e === '"q' ? `P1$r${this._curAttrData.isProtected() ? 1 : 0}"q` : e === '"p' ? 'P1$r61;1"p' : e === "r" ? `P1$r${i.scrollTop + 1};${i.scrollBottom + 1}r` : e === "m" ? "P1$r0m" : e === " q" ? `P1$r${{ block: 2, underline: 4, bar: 6 }[s.cursorStyle] - (s.cursorBlink ? 1 : 0)} q` : "P0$r");
  }
  markRangeDirty(e, t) {
    this._dirtyRowTracker.markRangeDirty(e, t);
  }
}, ua = class {
  constructor(e) {
    this._bufferService = e, this.clearRange();
  }
  clearRange() {
    this.start = this._bufferService.buffer.y, this.end = this._bufferService.buffer.y;
  }
  markDirty(e) {
    e < this.start ? this.start = e : e > this.end && (this.end = e);
  }
  markRangeDirty(e, t) {
    e > t && (Hc = e, e = t, t = Hc), e < this.start && (this.start = e), t > this.end && (this.end = t);
  }
  markAllDirty() {
    this.markRangeDirty(0, this._bufferService.rows - 1);
  }
};
ua = Ae([re(0, Ye)], ua);
function Wc(e) {
  return 0 <= e && e < 256;
}
var lm = 5e7, zc = 12, hm = 50, cm = class extends de {
  constructor(e) {
    super(), this._action = e, this._writeBuffer = [], this._callbacks = [], this._pendingData = 0, this._bufferOffset = 0, this._isSyncWriting = !1, this._syncCalls = 0, this._didUserInput = !1, this._onWriteParsed = this._register(new Q()), this.onWriteParsed = this._onWriteParsed.event;
  }
  handleUserInput() {
    this._didUserInput = !0;
  }
  writeSync(e, t) {
    if (t !== void 0 && this._syncCalls > t) {
      this._syncCalls = 0;
      return;
    }
    if (this._pendingData += e.length, this._writeBuffer.push(e), this._callbacks.push(void 0), this._syncCalls++, this._isSyncWriting) return;
    this._isSyncWriting = !0;
    let r;
    for (; r = this._writeBuffer.shift(); ) {
      this._action(r);
      let i = this._callbacks.shift();
      i && i();
    }
    this._pendingData = 0, this._bufferOffset = 2147483647, this._isSyncWriting = !1, this._syncCalls = 0;
  }
  write(e, t) {
    if (this._pendingData > lm) throw new Error("write data discarded, use flow control to avoid losing data");
    if (!this._writeBuffer.length) {
      if (this._bufferOffset = 0, this._didUserInput) {
        this._didUserInput = !1, this._pendingData += e.length, this._writeBuffer.push(e), this._callbacks.push(t), this._innerWrite();
        return;
      }
      setTimeout(() => this._innerWrite());
    }
    this._pendingData += e.length, this._writeBuffer.push(e), this._callbacks.push(t);
  }
  _innerWrite(e = 0, t = !0) {
    let r = e || performance.now();
    for (; this._writeBuffer.length > this._bufferOffset; ) {
      let i = this._writeBuffer[this._bufferOffset], s = this._action(i, t);
      if (s) {
        let o = (a) => performance.now() - r >= zc ? setTimeout(() => this._innerWrite(0, a)) : this._innerWrite(r, a);
        s.catch((a) => (queueMicrotask(() => {
          throw a;
        }), Promise.resolve(!1))).then(o);
        return;
      }
      let n = this._callbacks[this._bufferOffset];
      if (n && n(), this._bufferOffset++, this._pendingData -= i.length, performance.now() - r >= zc) break;
    }
    this._writeBuffer.length > this._bufferOffset ? (this._bufferOffset > hm && (this._writeBuffer = this._writeBuffer.slice(this._bufferOffset), this._callbacks = this._callbacks.slice(this._bufferOffset), this._bufferOffset = 0), setTimeout(() => this._innerWrite())) : (this._writeBuffer.length = 0, this._callbacks.length = 0, this._pendingData = 0, this._bufferOffset = 0), this._onWriteParsed.fire();
  }
}, fa = class {
  constructor(e) {
    this._bufferService = e, this._nextId = 1, this._entriesWithId = /* @__PURE__ */ new Map(), this._dataByLinkId = /* @__PURE__ */ new Map();
  }
  registerLink(e) {
    let t = this._bufferService.buffer;
    if (e.id === void 0) {
      let a = t.addMarker(t.ybase + t.y), h = { data: e, id: this._nextId++, lines: [a] };
      return a.onDispose(() => this._removeMarkerFromLink(h, a)), this._dataByLinkId.set(h.id, h), h.id;
    }
    let r = e, i = this._getEntryIdKey(r), s = this._entriesWithId.get(i);
    if (s) return this.addLineToLink(s.id, t.ybase + t.y), s.id;
    let n = t.addMarker(t.ybase + t.y), o = { id: this._nextId++, key: this._getEntryIdKey(r), data: r, lines: [n] };
    return n.onDispose(() => this._removeMarkerFromLink(o, n)), this._entriesWithId.set(o.key, o), this._dataByLinkId.set(o.id, o), o.id;
  }
  addLineToLink(e, t) {
    let r = this._dataByLinkId.get(e);
    if (r && r.lines.every((i) => i.line !== t)) {
      let i = this._bufferService.buffer.addMarker(t);
      r.lines.push(i), i.onDispose(() => this._removeMarkerFromLink(r, i));
    }
  }
  getLinkData(e) {
    var t;
    return (t = this._dataByLinkId.get(e)) == null ? void 0 : t.data;
  }
  _getEntryIdKey(e) {
    return `${e.id};;${e.uri}`;
  }
  _removeMarkerFromLink(e, t) {
    let r = e.lines.indexOf(t);
    r !== -1 && (e.lines.splice(r, 1), e.lines.length === 0 && (e.data.id !== void 0 && this._entriesWithId.delete(e.key), this._dataByLinkId.delete(e.id)));
  }
};
fa = Ae([re(0, Ye)], fa);
var qc = !1, um = class extends de {
  constructor(e) {
    super(), this._windowsWrappingHeuristics = this._register(new Pr()), this._onBinary = this._register(new Q()), this.onBinary = this._onBinary.event, this._onData = this._register(new Q()), this.onData = this._onData.event, this._onLineFeed = this._register(new Q()), this.onLineFeed = this._onLineFeed.event, this._onResize = this._register(new Q()), this.onResize = this._onResize.event, this._onWriteParsed = this._register(new Q()), this.onWriteParsed = this._onWriteParsed.event, this._onScroll = this._register(new Q()), this._instantiationService = new O1(), this.optionsService = this._register(new $1(e)), this._instantiationService.setService(Xe, this.optionsService), this._bufferService = this._register(this._instantiationService.createInstance(aa)), this._instantiationService.setService(Ye, this._bufferService), this._logService = this._register(this._instantiationService.createInstance(oa)), this._instantiationService.setService(lf, this._logService), this.coreService = this._register(this._instantiationService.createInstance(la)), this._instantiationService.setService(vr, this.coreService), this.coreMouseService = this._register(this._instantiationService.createInstance(ha)), this._instantiationService.setService(af, this.coreMouseService), this.unicodeService = this._register(this._instantiationService.createInstance(cr)), this._instantiationService.setService(Tg, this.unicodeService), this._charsetService = this._instantiationService.createInstance(X1), this._instantiationService.setService(Dg, this._charsetService), this._oscLinkService = this._instantiationService.createInstance(fa), this._instantiationService.setService(hf, this._oscLinkService), this._inputHandler = this._register(new am(this._bufferService, this._charsetService, this.coreService, this._logService, this.optionsService, this._oscLinkService, this.coreMouseService, this.unicodeService)), this._register(je.forward(this._inputHandler.onLineFeed, this._onLineFeed)), this._register(this._inputHandler), this._register(je.forward(this._bufferService.onResize, this._onResize)), this._register(je.forward(this.coreService.onData, this._onData)), this._register(je.forward(this.coreService.onBinary, this._onBinary)), this._register(this.coreService.onRequestScrollToBottom(() => this.scrollToBottom(!0))), this._register(this.coreService.onUserInput(() => this._writeBuffer.handleUserInput())), this._register(this.optionsService.onMultipleOptionChange(["windowsMode", "windowsPty"], () => this._handleWindowsPtyOptionChange())), this._register(this._bufferService.onScroll(() => {
      this._onScroll.fire({ position: this._bufferService.buffer.ydisp }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
    })), this._writeBuffer = this._register(new cm((t, r) => this._inputHandler.parse(t, r))), this._register(je.forward(this._writeBuffer.onWriteParsed, this._onWriteParsed));
  }
  get onScroll() {
    return this._onScrollApi || (this._onScrollApi = this._register(new Q()), this._onScroll.event((e) => {
      var t;
      (t = this._onScrollApi) == null || t.fire(e.position);
    })), this._onScrollApi.event;
  }
  get cols() {
    return this._bufferService.cols;
  }
  get rows() {
    return this._bufferService.rows;
  }
  get buffers() {
    return this._bufferService.buffers;
  }
  get options() {
    return this.optionsService.options;
  }
  set options(e) {
    for (let t in e) this.optionsService.options[t] = e[t];
  }
  write(e, t) {
    this._writeBuffer.write(e, t);
  }
  writeSync(e, t) {
    this._logService.logLevel <= 3 && !qc && (this._logService.warn("writeSync is unreliable and will be removed soon."), qc = !0), this._writeBuffer.writeSync(e, t);
  }
  input(e, t = !0) {
    this.coreService.triggerDataEvent(e, t);
  }
  resize(e, t) {
    isNaN(e) || isNaN(t) || (e = Math.max(e, Wf), t = Math.max(t, zf), this._bufferService.resize(e, t));
  }
  scroll(e, t = !1) {
    this._bufferService.scroll(e, t);
  }
  scrollLines(e, t) {
    this._bufferService.scrollLines(e, t);
  }
  scrollPages(e) {
    this.scrollLines(e * (this.rows - 1));
  }
  scrollToTop() {
    this.scrollLines(-this._bufferService.buffer.ydisp);
  }
  scrollToBottom(e) {
    this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
  }
  scrollToLine(e) {
    let t = e - this._bufferService.buffer.ydisp;
    t !== 0 && this.scrollLines(t);
  }
  registerEscHandler(e, t) {
    return this._inputHandler.registerEscHandler(e, t);
  }
  registerDcsHandler(e, t) {
    return this._inputHandler.registerDcsHandler(e, t);
  }
  registerCsiHandler(e, t) {
    return this._inputHandler.registerCsiHandler(e, t);
  }
  registerOscHandler(e, t) {
    return this._inputHandler.registerOscHandler(e, t);
  }
  _setup() {
    this._handleWindowsPtyOptionChange();
  }
  reset() {
    this._inputHandler.reset(), this._bufferService.reset(), this._charsetService.reset(), this.coreService.reset(), this.coreMouseService.reset();
  }
  _handleWindowsPtyOptionChange() {
    let e = !1, t = this.optionsService.rawOptions.windowsPty;
    t && t.buildNumber !== void 0 && t.buildNumber !== void 0 ? e = t.backend === "conpty" && t.buildNumber < 21376 : this.optionsService.rawOptions.windowsMode && (e = !0), e ? this._enableWindowsWrappingHeuristics() : this._windowsWrappingHeuristics.clear();
  }
  _enableWindowsWrappingHeuristics() {
    if (!this._windowsWrappingHeuristics.value) {
      let e = [];
      e.push(this.onLineFeed(Mc.bind(null, this._bufferService))), e.push(this.registerCsiHandler({ final: "H" }, () => (Mc(this._bufferService), !1))), this._windowsWrappingHeuristics.value = Se(() => {
        for (let t of e) t.dispose();
      });
    }
  }
}, fm = { 48: ["0", ")"], 49: ["1", "!"], 50: ["2", "@"], 51: ["3", "#"], 52: ["4", "$"], 53: ["5", "%"], 54: ["6", "^"], 55: ["7", "&"], 56: ["8", "*"], 57: ["9", "("], 186: [";", ":"], 187: ["=", "+"], 188: [",", "<"], 189: ["-", "_"], 190: [".", ">"], 191: ["/", "?"], 192: ["`", "~"], 219: ["[", "{"], 220: ["\\", "|"], 221: ["]", "}"], 222: ["'", '"'] };
function dm(e, t, r, i) {
  var o;
  let s = { type: 0, cancel: !1, key: void 0 }, n = (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4 : 0) | (e.metaKey ? 8 : 0);
  switch (e.keyCode) {
    case 0:
      e.key === "UIKeyInputUpArrow" ? t ? s.key = q.ESC + "OA" : s.key = q.ESC + "[A" : e.key === "UIKeyInputLeftArrow" ? t ? s.key = q.ESC + "OD" : s.key = q.ESC + "[D" : e.key === "UIKeyInputRightArrow" ? t ? s.key = q.ESC + "OC" : s.key = q.ESC + "[C" : e.key === "UIKeyInputDownArrow" && (t ? s.key = q.ESC + "OB" : s.key = q.ESC + "[B");
      break;
    case 8:
      s.key = e.ctrlKey ? "\b" : q.DEL, e.altKey && (s.key = q.ESC + s.key);
      break;
    case 9:
      if (e.shiftKey) {
        s.key = q.ESC + "[Z";
        break;
      }
      s.key = q.HT, s.cancel = !0;
      break;
    case 13:
      s.key = e.altKey ? q.ESC + q.CR : q.CR, s.cancel = !0;
      break;
    case 27:
      s.key = q.ESC, e.altKey && (s.key = q.ESC + q.ESC), s.cancel = !0;
      break;
    case 37:
      if (e.metaKey) break;
      n ? s.key = q.ESC + "[1;" + (n + 1) + "D" : t ? s.key = q.ESC + "OD" : s.key = q.ESC + "[D";
      break;
    case 39:
      if (e.metaKey) break;
      n ? s.key = q.ESC + "[1;" + (n + 1) + "C" : t ? s.key = q.ESC + "OC" : s.key = q.ESC + "[C";
      break;
    case 38:
      if (e.metaKey) break;
      n ? s.key = q.ESC + "[1;" + (n + 1) + "A" : t ? s.key = q.ESC + "OA" : s.key = q.ESC + "[A";
      break;
    case 40:
      if (e.metaKey) break;
      n ? s.key = q.ESC + "[1;" + (n + 1) + "B" : t ? s.key = q.ESC + "OB" : s.key = q.ESC + "[B";
      break;
    case 45:
      !e.shiftKey && !e.ctrlKey && (s.key = q.ESC + "[2~");
      break;
    case 46:
      n ? s.key = q.ESC + "[3;" + (n + 1) + "~" : s.key = q.ESC + "[3~";
      break;
    case 36:
      n ? s.key = q.ESC + "[1;" + (n + 1) + "H" : t ? s.key = q.ESC + "OH" : s.key = q.ESC + "[H";
      break;
    case 35:
      n ? s.key = q.ESC + "[1;" + (n + 1) + "F" : t ? s.key = q.ESC + "OF" : s.key = q.ESC + "[F";
      break;
    case 33:
      e.shiftKey ? s.type = 2 : e.ctrlKey ? s.key = q.ESC + "[5;" + (n + 1) + "~" : s.key = q.ESC + "[5~";
      break;
    case 34:
      e.shiftKey ? s.type = 3 : e.ctrlKey ? s.key = q.ESC + "[6;" + (n + 1) + "~" : s.key = q.ESC + "[6~";
      break;
    case 112:
      n ? s.key = q.ESC + "[1;" + (n + 1) + "P" : s.key = q.ESC + "OP";
      break;
    case 113:
      n ? s.key = q.ESC + "[1;" + (n + 1) + "Q" : s.key = q.ESC + "OQ";
      break;
    case 114:
      n ? s.key = q.ESC + "[1;" + (n + 1) + "R" : s.key = q.ESC + "OR";
      break;
    case 115:
      n ? s.key = q.ESC + "[1;" + (n + 1) + "S" : s.key = q.ESC + "OS";
      break;
    case 116:
      n ? s.key = q.ESC + "[15;" + (n + 1) + "~" : s.key = q.ESC + "[15~";
      break;
    case 117:
      n ? s.key = q.ESC + "[17;" + (n + 1) + "~" : s.key = q.ESC + "[17~";
      break;
    case 118:
      n ? s.key = q.ESC + "[18;" + (n + 1) + "~" : s.key = q.ESC + "[18~";
      break;
    case 119:
      n ? s.key = q.ESC + "[19;" + (n + 1) + "~" : s.key = q.ESC + "[19~";
      break;
    case 120:
      n ? s.key = q.ESC + "[20;" + (n + 1) + "~" : s.key = q.ESC + "[20~";
      break;
    case 121:
      n ? s.key = q.ESC + "[21;" + (n + 1) + "~" : s.key = q.ESC + "[21~";
      break;
    case 122:
      n ? s.key = q.ESC + "[23;" + (n + 1) + "~" : s.key = q.ESC + "[23~";
      break;
    case 123:
      n ? s.key = q.ESC + "[24;" + (n + 1) + "~" : s.key = q.ESC + "[24~";
      break;
    default:
      if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) e.keyCode >= 65 && e.keyCode <= 90 ? s.key = String.fromCharCode(e.keyCode - 64) : e.keyCode === 32 ? s.key = q.NUL : e.keyCode >= 51 && e.keyCode <= 55 ? s.key = String.fromCharCode(e.keyCode - 51 + 27) : e.keyCode === 56 ? s.key = q.DEL : e.keyCode === 219 ? s.key = q.ESC : e.keyCode === 220 ? s.key = q.FS : e.keyCode === 221 && (s.key = q.GS);
      else if ((!r || i) && e.altKey && !e.metaKey) {
        let a = (o = fm[e.keyCode]) == null ? void 0 : o[e.shiftKey ? 1 : 0];
        if (a) s.key = q.ESC + a;
        else if (e.keyCode >= 65 && e.keyCode <= 90) {
          let h = e.ctrlKey ? e.keyCode - 64 : e.keyCode + 32, l = String.fromCharCode(h);
          e.shiftKey && (l = l.toUpperCase()), s.key = q.ESC + l;
        } else if (e.keyCode === 32) s.key = q.ESC + (e.ctrlKey ? q.NUL : " ");
        else if (e.key === "Dead" && e.code.startsWith("Key")) {
          let h = e.code.slice(3, 4);
          e.shiftKey || (h = h.toLowerCase()), s.key = q.ESC + h, s.cancel = !0;
        }
      } else r && !e.altKey && !e.ctrlKey && !e.shiftKey && e.metaKey ? e.keyCode === 65 && (s.type = 1) : e.key && !e.ctrlKey && !e.altKey && !e.metaKey && e.keyCode >= 48 && e.key.length === 1 ? s.key = e.key : e.key && e.ctrlKey && (e.key === "_" && (s.key = q.US), e.key === "@" && (s.key = q.NUL));
      break;
  }
  return s;
}
var De = 0, pm = class {
  constructor(e) {
    this._getKey = e, this._array = [], this._insertedValues = [], this._flushInsertedTask = new os(), this._isFlushingInserted = !1, this._deletedIndices = [], this._flushDeletedTask = new os(), this._isFlushingDeleted = !1;
  }
  clear() {
    this._array.length = 0, this._insertedValues.length = 0, this._flushInsertedTask.clear(), this._isFlushingInserted = !1, this._deletedIndices.length = 0, this._flushDeletedTask.clear(), this._isFlushingDeleted = !1;
  }
  insert(e) {
    this._flushCleanupDeleted(), this._insertedValues.length === 0 && this._flushInsertedTask.enqueue(() => this._flushInserted()), this._insertedValues.push(e);
  }
  _flushInserted() {
    let e = this._insertedValues.sort((s, n) => this._getKey(s) - this._getKey(n)), t = 0, r = 0, i = new Array(this._array.length + this._insertedValues.length);
    for (let s = 0; s < i.length; s++) r >= this._array.length || this._getKey(e[t]) <= this._getKey(this._array[r]) ? (i[s] = e[t], t++) : i[s] = this._array[r++];
    this._array = i, this._insertedValues.length = 0;
  }
  _flushCleanupInserted() {
    !this._isFlushingInserted && this._insertedValues.length > 0 && this._flushInsertedTask.flush();
  }
  delete(e) {
    if (this._flushCleanupInserted(), this._array.length === 0) return !1;
    let t = this._getKey(e);
    if (t === void 0 || (De = this._search(t), De === -1) || this._getKey(this._array[De]) !== t) return !1;
    do
      if (this._array[De] === e) return this._deletedIndices.length === 0 && this._flushDeletedTask.enqueue(() => this._flushDeleted()), this._deletedIndices.push(De), !0;
    while (++De < this._array.length && this._getKey(this._array[De]) === t);
    return !1;
  }
  _flushDeleted() {
    this._isFlushingDeleted = !0;
    let e = this._deletedIndices.sort((s, n) => s - n), t = 0, r = new Array(this._array.length - e.length), i = 0;
    for (let s = 0; s < this._array.length; s++) e[t] === s ? t++ : r[i++] = this._array[s];
    this._array = r, this._deletedIndices.length = 0, this._isFlushingDeleted = !1;
  }
  _flushCleanupDeleted() {
    !this._isFlushingDeleted && this._deletedIndices.length > 0 && this._flushDeletedTask.flush();
  }
  *getKeyIterator(e) {
    if (this._flushCleanupInserted(), this._flushCleanupDeleted(), this._array.length !== 0 && (De = this._search(e), !(De < 0 || De >= this._array.length) && this._getKey(this._array[De]) === e)) do
      yield this._array[De];
    while (++De < this._array.length && this._getKey(this._array[De]) === e);
  }
  forEachByKey(e, t) {
    if (this._flushCleanupInserted(), this._flushCleanupDeleted(), this._array.length !== 0 && (De = this._search(e), !(De < 0 || De >= this._array.length) && this._getKey(this._array[De]) === e)) do
      t(this._array[De]);
    while (++De < this._array.length && this._getKey(this._array[De]) === e);
  }
  values() {
    return this._flushCleanupInserted(), this._flushCleanupDeleted(), [...this._array].values();
  }
  _search(e) {
    let t = 0, r = this._array.length - 1;
    for (; r >= t; ) {
      let i = t + r >> 1, s = this._getKey(this._array[i]);
      if (s > e) r = i - 1;
      else if (s < e) t = i + 1;
      else {
        for (; i > 0 && this._getKey(this._array[i - 1]) === e; ) i--;
        return i;
      }
    }
    return t;
  }
}, bo = 0, jc = 0, _m = class extends de {
  constructor() {
    super(), this._decorations = new pm((e) => e == null ? void 0 : e.marker.line), this._onDecorationRegistered = this._register(new Q()), this.onDecorationRegistered = this._onDecorationRegistered.event, this._onDecorationRemoved = this._register(new Q()), this.onDecorationRemoved = this._onDecorationRemoved.event, this._register(Se(() => this.reset()));
  }
  get decorations() {
    return this._decorations.values();
  }
  registerDecoration(e) {
    if (e.marker.isDisposed) return;
    let t = new gm(e);
    if (t) {
      let r = t.marker.onDispose(() => t.dispose()), i = t.onDispose(() => {
        i.dispose(), t && (this._decorations.delete(t) && this._onDecorationRemoved.fire(t), r.dispose());
      });
      this._decorations.insert(t), this._onDecorationRegistered.fire(t);
    }
    return t;
  }
  reset() {
    for (let e of this._decorations.values()) e.dispose();
    this._decorations.clear();
  }
  *getDecorationsAtCell(e, t, r) {
    let i = 0, s = 0;
    for (let n of this._decorations.getKeyIterator(t)) i = n.options.x ?? 0, s = i + (n.options.width ?? 1), e >= i && e < s && (!r || (n.options.layer ?? "bottom") === r) && (yield n);
  }
  forEachDecorationAtCell(e, t, r, i) {
    this._decorations.forEachByKey(t, (s) => {
      bo = s.options.x ?? 0, jc = bo + (s.options.width ?? 1), e >= bo && e < jc && (!r || (s.options.layer ?? "bottom") === r) && i(s);
    });
  }
}, gm = class extends tr {
  constructor(e) {
    super(), this.options = e, this.onRenderEmitter = this.add(new Q()), this.onRender = this.onRenderEmitter.event, this._onDispose = this.add(new Q()), this.onDispose = this._onDispose.event, this._cachedBg = null, this._cachedFg = null, this.marker = e.marker, this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position && (this.options.overviewRulerOptions.position = "full");
  }
  get backgroundColorRGB() {
    return this._cachedBg === null && (this.options.backgroundColor ? this._cachedBg = xe.toColor(this.options.backgroundColor) : this._cachedBg = void 0), this._cachedBg;
  }
  get foregroundColorRGB() {
    return this._cachedFg === null && (this.options.foregroundColor ? this._cachedFg = xe.toColor(this.options.foregroundColor) : this._cachedFg = void 0), this._cachedFg;
  }
  dispose() {
    this._onDispose.fire(), super.dispose();
  }
}, vm = 1e3, mm = class {
  constructor(e, t = vm) {
    this._renderCallback = e, this._debounceThresholdMS = t, this._lastRefreshMs = 0, this._additionalRefreshRequested = !1;
  }
  dispose() {
    this._refreshTimeoutID && clearTimeout(this._refreshTimeoutID);
  }
  refresh(e, t, r) {
    this._rowCount = r, e = e !== void 0 ? e : 0, t = t !== void 0 ? t : this._rowCount - 1, this._rowStart = this._rowStart !== void 0 ? Math.min(this._rowStart, e) : e, this._rowEnd = this._rowEnd !== void 0 ? Math.max(this._rowEnd, t) : t;
    let i = performance.now();
    if (i - this._lastRefreshMs >= this._debounceThresholdMS) this._lastRefreshMs = i, this._innerRefresh();
    else if (!this._additionalRefreshRequested) {
      let s = i - this._lastRefreshMs, n = this._debounceThresholdMS - s;
      this._additionalRefreshRequested = !0, this._refreshTimeoutID = window.setTimeout(() => {
        this._lastRefreshMs = performance.now(), this._innerRefresh(), this._additionalRefreshRequested = !1, this._refreshTimeoutID = void 0;
      }, n);
    }
  }
  _innerRefresh() {
    if (this._rowStart === void 0 || this._rowEnd === void 0 || this._rowCount === void 0) return;
    let e = Math.max(this._rowStart, 0), t = Math.min(this._rowEnd, this._rowCount - 1);
    this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e, t);
  }
}, $c = 20, as = class extends de {
  constructor(e, t, r, i) {
    super(), this._terminal = e, this._coreBrowserService = r, this._renderService = i, this._rowColumns = /* @__PURE__ */ new WeakMap(), this._liveRegionLineCount = 0, this._charsToConsume = [], this._charsToAnnounce = "";
    let s = this._coreBrowserService.mainDocument;
    this._accessibilityContainer = s.createElement("div"), this._accessibilityContainer.classList.add("xterm-accessibility"), this._rowContainer = s.createElement("div"), this._rowContainer.setAttribute("role", "list"), this._rowContainer.classList.add("xterm-accessibility-tree"), this._rowElements = [];
    for (let n = 0; n < this._terminal.rows; n++) this._rowElements[n] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[n]);
    if (this._topBoundaryFocusListener = (n) => this._handleBoundaryFocus(n, 0), this._bottomBoundaryFocusListener = (n) => this._handleBoundaryFocus(n, 1), this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._accessibilityContainer.appendChild(this._rowContainer), this._liveRegion = s.createElement("div"), this._liveRegion.classList.add("live-region"), this._liveRegion.setAttribute("aria-live", "assertive"), this._accessibilityContainer.appendChild(this._liveRegion), this._liveRegionDebouncer = this._register(new mm(this._renderRows.bind(this))), !this._terminal.element) throw new Error("Cannot enable accessibility before Terminal.open");
    this._terminal.element.insertAdjacentElement("afterbegin", this._accessibilityContainer), this._register(this._terminal.onResize((n) => this._handleResize(n.rows))), this._register(this._terminal.onRender((n) => this._refreshRows(n.start, n.end))), this._register(this._terminal.onScroll(() => this._refreshRows())), this._register(this._terminal.onA11yChar((n) => this._handleChar(n))), this._register(this._terminal.onLineFeed(() => this._handleChar(`
`))), this._register(this._terminal.onA11yTab((n) => this._handleTab(n))), this._register(this._terminal.onKey((n) => this._handleKey(n.key))), this._register(this._terminal.onBlur(() => this._clearLiveRegion())), this._register(this._renderService.onDimensionsChange(() => this._refreshRowsDimensions())), this._register(he(s, "selectionchange", () => this._handleSelectionChange())), this._register(this._coreBrowserService.onDprChange(() => this._refreshRowsDimensions())), this._refreshRowsDimensions(), this._refreshRows(), this._register(Se(() => {
      this._accessibilityContainer.remove(), this._rowElements.length = 0;
    }));
  }
  _handleTab(e) {
    for (let t = 0; t < e; t++) this._handleChar(" ");
  }
  _handleChar(e) {
    this._liveRegionLineCount < $c + 1 && (this._charsToConsume.length > 0 ? this._charsToConsume.shift() !== e && (this._charsToAnnounce += e) : this._charsToAnnounce += e, e === `
` && (this._liveRegionLineCount++, this._liveRegionLineCount === $c + 1 && (this._liveRegion.textContent += Lo.get())));
  }
  _clearLiveRegion() {
    this._liveRegion.textContent = "", this._liveRegionLineCount = 0;
  }
  _handleKey(e) {
    this._clearLiveRegion(), new RegExp("\\p{Control}", "u").test(e) || this._charsToConsume.push(e);
  }
  _refreshRows(e, t) {
    this._liveRegionDebouncer.refresh(e, t, this._terminal.rows);
  }
  _renderRows(e, t) {
    let r = this._terminal.buffer, i = r.lines.length.toString();
    for (let s = e; s <= t; s++) {
      let n = r.lines.get(r.ydisp + s), o = [], a = (n == null ? void 0 : n.translateToString(!0, void 0, void 0, o)) || "", h = (r.ydisp + s + 1).toString(), l = this._rowElements[s];
      l && (a.length === 0 ? (l.textContent = " ", this._rowColumns.set(l, [0, 1])) : (l.textContent = a, this._rowColumns.set(l, o)), l.setAttribute("aria-posinset", h), l.setAttribute("aria-setsize", i), this._alignRowWidth(l));
    }
    this._announceCharacters();
  }
  _announceCharacters() {
    this._charsToAnnounce.length !== 0 && (this._liveRegion.textContent += this._charsToAnnounce, this._charsToAnnounce = "");
  }
  _handleBoundaryFocus(e, t) {
    let r = e.target, i = this._rowElements[t === 0 ? 1 : this._rowElements.length - 2], s = r.getAttribute("aria-posinset"), n = t === 0 ? "1" : `${this._terminal.buffer.lines.length}`;
    if (s === n || e.relatedTarget !== i) return;
    let o, a;
    if (t === 0 ? (o = r, a = this._rowElements.pop(), this._rowContainer.removeChild(a)) : (o = this._rowElements.shift(), a = r, this._rowContainer.removeChild(o)), o.removeEventListener("focus", this._topBoundaryFocusListener), a.removeEventListener("focus", this._bottomBoundaryFocusListener), t === 0) {
      let h = this._createAccessibilityTreeNode();
      this._rowElements.unshift(h), this._rowContainer.insertAdjacentElement("afterbegin", h);
    } else {
      let h = this._createAccessibilityTreeNode();
      this._rowElements.push(h), this._rowContainer.appendChild(h);
    }
    this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._terminal.scrollLines(t === 0 ? -1 : 1), this._rowElements[t === 0 ? 1 : this._rowElements.length - 2].focus(), e.preventDefault(), e.stopImmediatePropagation();
  }
  _handleSelectionChange() {
    var a;
    if (this._rowElements.length === 0) return;
    let e = this._coreBrowserService.mainDocument.getSelection();
    if (!e) return;
    if (e.isCollapsed) {
      this._rowContainer.contains(e.anchorNode) && this._terminal.clearSelection();
      return;
    }
    if (!e.anchorNode || !e.focusNode) {
      console.error("anchorNode and/or focusNode are null");
      return;
    }
    let t = { node: e.anchorNode, offset: e.anchorOffset }, r = { node: e.focusNode, offset: e.focusOffset };
    if ((t.node.compareDocumentPosition(r.node) & Node.DOCUMENT_POSITION_PRECEDING || t.node === r.node && t.offset > r.offset) && ([t, r] = [r, t]), t.node.compareDocumentPosition(this._rowElements[0]) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING) && (t = { node: this._rowElements[0].childNodes[0], offset: 0 }), !this._rowContainer.contains(t.node)) return;
    let i = this._rowElements.slice(-1)[0];
    if (r.node.compareDocumentPosition(i) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_PRECEDING) && (r = { node: i, offset: ((a = i.textContent) == null ? void 0 : a.length) ?? 0 }), !this._rowContainer.contains(r.node)) return;
    let s = ({ node: h, offset: l }) => {
      let c = h instanceof Text ? h.parentNode : h, u = parseInt(c == null ? void 0 : c.getAttribute("aria-posinset"), 10) - 1;
      if (isNaN(u)) return console.warn("row is invalid. Race condition?"), null;
      let p = this._rowColumns.get(c);
      if (!p) return console.warn("columns is null. Race condition?"), null;
      let _ = l < p.length ? p[l] : p.slice(-1)[0] + 1;
      return _ >= this._terminal.cols && (++u, _ = 0), { row: u, column: _ };
    }, n = s(t), o = s(r);
    if (!(!n || !o)) {
      if (n.row > o.row || n.row === o.row && n.column >= o.column) throw new Error("invalid range");
      this._terminal.select(n.column, n.row, (o.row - n.row) * this._terminal.cols - n.column + o.column);
    }
  }
  _handleResize(e) {
    this._rowElements[this._rowElements.length - 1].removeEventListener("focus", this._bottomBoundaryFocusListener);
    for (let t = this._rowContainer.children.length; t < this._terminal.rows; t++) this._rowElements[t] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[t]);
    for (; this._rowElements.length > e; ) this._rowContainer.removeChild(this._rowElements.pop());
    this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions();
  }
  _createAccessibilityTreeNode() {
    let e = this._coreBrowserService.mainDocument.createElement("div");
    return e.setAttribute("role", "listitem"), e.tabIndex = -1, this._refreshRowDimensions(e), e;
  }
  _refreshRowsDimensions() {
    if (this._renderService.dimensions.css.cell.height) {
      Object.assign(this._accessibilityContainer.style, { width: `${this._renderService.dimensions.css.canvas.width}px`, fontSize: `${this._terminal.options.fontSize}px` }), this._rowElements.length !== this._terminal.rows && this._handleResize(this._terminal.rows);
      for (let e = 0; e < this._terminal.rows; e++) this._refreshRowDimensions(this._rowElements[e]), this._alignRowWidth(this._rowElements[e]);
    }
  }
  _refreshRowDimensions(e) {
    e.style.height = `${this._renderService.dimensions.css.cell.height}px`;
  }
  _alignRowWidth(e) {
    var s, n;
    e.style.transform = "";
    let t = e.getBoundingClientRect().width, r = (n = (s = this._rowColumns.get(e)) == null ? void 0 : s.slice(-1)) == null ? void 0 : n[0];
    if (!r) return;
    let i = r * this._renderService.dimensions.css.cell.width;
    e.style.transform = `scaleX(${i / t})`;
  }
};
as = Ae([re(1, Ma), re(2, zt), re(3, qt)], as);
var da = class extends de {
  constructor(e, t, r, i, s) {
    super(), this._element = e, this._mouseService = t, this._renderService = r, this._bufferService = i, this._linkProviderService = s, this._linkCacheDisposables = [], this._isMouseOut = !0, this._wasResized = !1, this._activeLine = -1, this._onShowLinkUnderline = this._register(new Q()), this.onShowLinkUnderline = this._onShowLinkUnderline.event, this._onHideLinkUnderline = this._register(new Q()), this.onHideLinkUnderline = this._onHideLinkUnderline.event, this._register(Se(() => {
      var n;
      pr(this._linkCacheDisposables), this._linkCacheDisposables.length = 0, this._lastMouseEvent = void 0, (n = this._activeProviderReplies) == null || n.clear();
    })), this._register(this._bufferService.onResize(() => {
      this._clearCurrentLink(), this._wasResized = !0;
    })), this._register(he(this._element, "mouseleave", () => {
      this._isMouseOut = !0, this._clearCurrentLink();
    })), this._register(he(this._element, "mousemove", this._handleMouseMove.bind(this))), this._register(he(this._element, "mousedown", this._handleMouseDown.bind(this))), this._register(he(this._element, "mouseup", this._handleMouseUp.bind(this)));
  }
  get currentLink() {
    return this._currentLink;
  }
  _handleMouseMove(e) {
    this._lastMouseEvent = e;
    let t = this._positionFromMouseEvent(e, this._element, this._mouseService);
    if (!t) return;
    this._isMouseOut = !1;
    let r = e.composedPath();
    for (let i = 0; i < r.length; i++) {
      let s = r[i];
      if (s.classList.contains("xterm")) break;
      if (s.classList.contains("xterm-hover")) return;
    }
    (!this._lastBufferCell || t.x !== this._lastBufferCell.x || t.y !== this._lastBufferCell.y) && (this._handleHover(t), this._lastBufferCell = t);
  }
  _handleHover(e) {
    if (this._activeLine !== e.y || this._wasResized) {
      this._clearCurrentLink(), this._askForLink(e, !1), this._wasResized = !1;
      return;
    }
    this._currentLink && this._linkAtPosition(this._currentLink.link, e) || (this._clearCurrentLink(), this._askForLink(e, !0));
  }
  _askForLink(e, t) {
    var i, s;
    (!this._activeProviderReplies || !t) && ((i = this._activeProviderReplies) == null || i.forEach((n) => {
      n == null || n.forEach((o) => {
        o.link.dispose && o.link.dispose();
      });
    }), this._activeProviderReplies = /* @__PURE__ */ new Map(), this._activeLine = e.y);
    let r = !1;
    for (let [n, o] of this._linkProviderService.linkProviders.entries()) t ? (s = this._activeProviderReplies) != null && s.get(n) && (r = this._checkLinkProviderResult(n, e, r)) : o.provideLinks(e.y, (a) => {
      var l, c;
      if (this._isMouseOut) return;
      let h = a == null ? void 0 : a.map((u) => ({ link: u }));
      (l = this._activeProviderReplies) == null || l.set(n, h), r = this._checkLinkProviderResult(n, e, r), ((c = this._activeProviderReplies) == null ? void 0 : c.size) === this._linkProviderService.linkProviders.length && this._removeIntersectingLinks(e.y, this._activeProviderReplies);
    });
  }
  _removeIntersectingLinks(e, t) {
    let r = /* @__PURE__ */ new Set();
    for (let i = 0; i < t.size; i++) {
      let s = t.get(i);
      if (s) for (let n = 0; n < s.length; n++) {
        let o = s[n], a = o.link.range.start.y < e ? 0 : o.link.range.start.x, h = o.link.range.end.y > e ? this._bufferService.cols : o.link.range.end.x;
        for (let l = a; l <= h; l++) {
          if (r.has(l)) {
            s.splice(n--, 1);
            break;
          }
          r.add(l);
        }
      }
    }
  }
  _checkLinkProviderResult(e, t, r) {
    var n;
    if (!this._activeProviderReplies) return r;
    let i = this._activeProviderReplies.get(e), s = !1;
    for (let o = 0; o < e; o++) (!this._activeProviderReplies.has(o) || this._activeProviderReplies.get(o)) && (s = !0);
    if (!s && i) {
      let o = i.find((a) => this._linkAtPosition(a.link, t));
      o && (r = !0, this._handleNewLink(o));
    }
    if (this._activeProviderReplies.size === this._linkProviderService.linkProviders.length && !r) for (let o = 0; o < this._activeProviderReplies.size; o++) {
      let a = (n = this._activeProviderReplies.get(o)) == null ? void 0 : n.find((h) => this._linkAtPosition(h.link, t));
      if (a) {
        r = !0, this._handleNewLink(a);
        break;
      }
    }
    return r;
  }
  _handleMouseDown() {
    this._mouseDownLink = this._currentLink;
  }
  _handleMouseUp(e) {
    if (!this._currentLink) return;
    let t = this._positionFromMouseEvent(e, this._element, this._mouseService);
    t && this._mouseDownLink && ym(this._mouseDownLink.link, this._currentLink.link) && this._linkAtPosition(this._currentLink.link, t) && this._currentLink.link.activate(e, this._currentLink.link.text);
  }
  _clearCurrentLink(e, t) {
    !this._currentLink || !this._lastMouseEvent || (!e || !t || this._currentLink.link.range.start.y >= e && this._currentLink.link.range.end.y <= t) && (this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent), this._currentLink = void 0, pr(this._linkCacheDisposables), this._linkCacheDisposables.length = 0);
  }
  _handleNewLink(e) {
    if (!this._lastMouseEvent) return;
    let t = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
    t && this._linkAtPosition(e.link, t) && (this._currentLink = e, this._currentLink.state = { decorations: { underline: e.link.decorations === void 0 ? !0 : e.link.decorations.underline, pointerCursor: e.link.decorations === void 0 ? !0 : e.link.decorations.pointerCursor }, isHovered: !0 }, this._linkHover(this._element, e.link, this._lastMouseEvent), e.link.decorations = {}, Object.defineProperties(e.link.decorations, { pointerCursor: { get: () => {
      var r, i;
      return (i = (r = this._currentLink) == null ? void 0 : r.state) == null ? void 0 : i.decorations.pointerCursor;
    }, set: (r) => {
      var i;
      (i = this._currentLink) != null && i.state && this._currentLink.state.decorations.pointerCursor !== r && (this._currentLink.state.decorations.pointerCursor = r, this._currentLink.state.isHovered && this._element.classList.toggle("xterm-cursor-pointer", r));
    } }, underline: { get: () => {
      var r, i;
      return (i = (r = this._currentLink) == null ? void 0 : r.state) == null ? void 0 : i.decorations.underline;
    }, set: (r) => {
      var i, s, n;
      (i = this._currentLink) != null && i.state && ((n = (s = this._currentLink) == null ? void 0 : s.state) == null ? void 0 : n.decorations.underline) !== r && (this._currentLink.state.decorations.underline = r, this._currentLink.state.isHovered && this._fireUnderlineEvent(e.link, r));
    } } }), this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange((r) => {
      if (!this._currentLink) return;
      let i = r.start === 0 ? 0 : r.start + 1 + this._bufferService.buffer.ydisp, s = this._bufferService.buffer.ydisp + 1 + r.end;
      if (this._currentLink.link.range.start.y >= i && this._currentLink.link.range.end.y <= s && (this._clearCurrentLink(i, s), this._lastMouseEvent)) {
        let n = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
        n && this._askForLink(n, !1);
      }
    })));
  }
  _linkHover(e, t, r) {
    var i;
    (i = this._currentLink) != null && i.state && (this._currentLink.state.isHovered = !0, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t, !0), this._currentLink.state.decorations.pointerCursor && e.classList.add("xterm-cursor-pointer")), t.hover && t.hover(r, t.text);
  }
  _fireUnderlineEvent(e, t) {
    let r = e.range, i = this._bufferService.buffer.ydisp, s = this._createLinkUnderlineEvent(r.start.x - 1, r.start.y - i - 1, r.end.x, r.end.y - i - 1, void 0);
    (t ? this._onShowLinkUnderline : this._onHideLinkUnderline).fire(s);
  }
  _linkLeave(e, t, r) {
    var i;
    (i = this._currentLink) != null && i.state && (this._currentLink.state.isHovered = !1, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t, !1), this._currentLink.state.decorations.pointerCursor && e.classList.remove("xterm-cursor-pointer")), t.leave && t.leave(r, t.text);
  }
  _linkAtPosition(e, t) {
    let r = e.range.start.y * this._bufferService.cols + e.range.start.x, i = e.range.end.y * this._bufferService.cols + e.range.end.x, s = t.y * this._bufferService.cols + t.x;
    return r <= s && s <= i;
  }
  _positionFromMouseEvent(e, t, r) {
    let i = r.getCoords(e, t, this._bufferService.cols, this._bufferService.rows);
    if (i) return { x: i[0], y: i[1] + this._bufferService.buffer.ydisp };
  }
  _createLinkUnderlineEvent(e, t, r, i, s) {
    return { x1: e, y1: t, x2: r, y2: i, cols: this._bufferService.cols, fg: s };
  }
};
da = Ae([re(1, Oa), re(2, qt), re(3, Ye), re(4, uf)], da);
function ym(e, t) {
  return e.text === t.text && e.range.start.x === t.range.start.x && e.range.start.y === t.range.start.y && e.range.end.x === t.range.end.x && e.range.end.y === t.range.end.y;
}
var bm = class extends um {
  constructor(e = {}) {
    super(e), this._linkifier = this._register(new Pr()), this.browser = Df, this._keyDownHandled = !1, this._keyDownSeen = !1, this._keyPressHandled = !1, this._unprocessedDeadKey = !1, this._accessibilityManager = this._register(new Pr()), this._onCursorMove = this._register(new Q()), this.onCursorMove = this._onCursorMove.event, this._onKey = this._register(new Q()), this.onKey = this._onKey.event, this._onRender = this._register(new Q()), this.onRender = this._onRender.event, this._onSelectionChange = this._register(new Q()), this.onSelectionChange = this._onSelectionChange.event, this._onTitleChange = this._register(new Q()), this.onTitleChange = this._onTitleChange.event, this._onBell = this._register(new Q()), this.onBell = this._onBell.event, this._onFocus = this._register(new Q()), this._onBlur = this._register(new Q()), this._onA11yCharEmitter = this._register(new Q()), this._onA11yTabEmitter = this._register(new Q()), this._onWillOpen = this._register(new Q()), this._setup(), this._decorationService = this._instantiationService.createInstance(_m), this._instantiationService.setService(ai, this._decorationService), this._linkProviderService = this._instantiationService.createInstance(h1), this._instantiationService.setService(uf, this._linkProviderService), this._linkProviderService.registerLinkProvider(this._instantiationService.createInstance(Mo)), this._register(this._inputHandler.onRequestBell(() => this._onBell.fire())), this._register(this._inputHandler.onRequestRefreshRows((t) => this.refresh((t == null ? void 0 : t.start) ?? 0, (t == null ? void 0 : t.end) ?? this.rows - 1))), this._register(this._inputHandler.onRequestSendFocus(() => this._reportFocus())), this._register(this._inputHandler.onRequestReset(() => this.reset())), this._register(this._inputHandler.onRequestWindowsOptionsReport((t) => this._reportWindowsOptions(t))), this._register(this._inputHandler.onColor((t) => this._handleColorEvent(t))), this._register(je.forward(this._inputHandler.onCursorMove, this._onCursorMove)), this._register(je.forward(this._inputHandler.onTitleChange, this._onTitleChange)), this._register(je.forward(this._inputHandler.onA11yChar, this._onA11yCharEmitter)), this._register(je.forward(this._inputHandler.onA11yTab, this._onA11yTabEmitter)), this._register(this._bufferService.onResize((t) => this._afterResize(t.cols, t.rows))), this._register(Se(() => {
      var t, r;
      this._customKeyEventHandler = void 0, (r = (t = this.element) == null ? void 0 : t.parentNode) == null || r.removeChild(this.element);
    }));
  }
  get linkifier() {
    return this._linkifier.value;
  }
  get onFocus() {
    return this._onFocus.event;
  }
  get onBlur() {
    return this._onBlur.event;
  }
  get onA11yChar() {
    return this._onA11yCharEmitter.event;
  }
  get onA11yTab() {
    return this._onA11yTabEmitter.event;
  }
  get onWillOpen() {
    return this._onWillOpen.event;
  }
  _handleColorEvent(e) {
    if (this._themeService) for (let t of e) {
      let r, i = "";
      switch (t.index) {
        case 256:
          r = "foreground", i = "10";
          break;
        case 257:
          r = "background", i = "11";
          break;
        case 258:
          r = "cursor", i = "12";
          break;
        default:
          r = "ansi", i = "4;" + t.index;
      }
      switch (t.type) {
        case 0:
          let s = be.toColorRGB(r === "ansi" ? this._themeService.colors.ansi[t.index] : this._themeService.colors[r]);
          this.coreService.triggerDataEvent(`${q.ESC}]${i};${nm(s)}${Rf.ST}`);
          break;
        case 1:
          if (r === "ansi") this._themeService.modifyColors((n) => n.ansi[t.index] = Pe.toColor(...t.color));
          else {
            let n = r;
            this._themeService.modifyColors((o) => o[n] = Pe.toColor(...t.color));
          }
          break;
        case 2:
          this._themeService.restoreColor(t.index);
          break;
      }
    }
  }
  _setup() {
    super._setup(), this._customKeyEventHandler = void 0;
  }
  get buffer() {
    return this.buffers.active;
  }
  focus() {
    this.textarea && this.textarea.focus({ preventScroll: !0 });
  }
  _handleScreenReaderModeOptionChange(e) {
    e ? !this._accessibilityManager.value && this._renderService && (this._accessibilityManager.value = this._instantiationService.createInstance(as, this)) : this._accessibilityManager.clear();
  }
  _handleTextAreaFocus(e) {
    this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(q.ESC + "[I"), this.element.classList.add("focus"), this._showCursor(), this._onFocus.fire();
  }
  blur() {
    var e;
    return (e = this.textarea) == null ? void 0 : e.blur();
  }
  _handleTextAreaBlur() {
    this.textarea.value = "", this.refresh(this.buffer.y, this.buffer.y), this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(q.ESC + "[O"), this.element.classList.remove("focus"), this._onBlur.fire();
  }
  _syncTextArea() {
    if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService) return;
    let e = this.buffer.ybase + this.buffer.y, t = this.buffer.lines.get(e);
    if (!t) return;
    let r = Math.min(this.buffer.x, this.cols - 1), i = this._renderService.dimensions.css.cell.height, s = t.getWidth(r), n = this._renderService.dimensions.css.cell.width * s, o = this.buffer.y * this._renderService.dimensions.css.cell.height, a = r * this._renderService.dimensions.css.cell.width;
    this.textarea.style.left = a + "px", this.textarea.style.top = o + "px", this.textarea.style.width = n + "px", this.textarea.style.height = i + "px", this.textarea.style.lineHeight = i + "px", this.textarea.style.zIndex = "-5";
  }
  _initGlobal() {
    this._bindKeys(), this._register(he(this.element, "copy", (t) => {
      this.hasSelection() && Eg(t, this._selectionService);
    }));
    let e = (t) => xg(t, this.textarea, this.coreService, this.optionsService);
    this._register(he(this.textarea, "paste", e)), this._register(he(this.element, "paste", e)), Tf ? this._register(he(this.element, "mousedown", (t) => {
      t.button === 2 && tc(t, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
    })) : this._register(he(this.element, "contextmenu", (t) => {
      tc(t, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
    })), qa && this._register(he(this.element, "auxclick", (t) => {
      t.button === 1 && tf(t, this.textarea, this.screenElement);
    }));
  }
  _bindKeys() {
    this._register(he(this.textarea, "keyup", (e) => this._keyUp(e), !0)), this._register(he(this.textarea, "keydown", (e) => this._keyDown(e), !0)), this._register(he(this.textarea, "keypress", (e) => this._keyPress(e), !0)), this._register(he(this.textarea, "compositionstart", () => this._compositionHelper.compositionstart())), this._register(he(this.textarea, "compositionupdate", (e) => this._compositionHelper.compositionupdate(e))), this._register(he(this.textarea, "compositionend", () => this._compositionHelper.compositionend())), this._register(he(this.textarea, "input", (e) => this._inputEvent(e), !0)), this._register(this.onRender(() => this._compositionHelper.updateCompositionElements()));
  }
  open(e) {
    var s;
    if (!e) throw new Error("Terminal requires a parent element.");
    if (e.isConnected || this._logService.debug("Terminal.open was called on an element that was not attached to the DOM"), ((s = this.element) == null ? void 0 : s.ownerDocument.defaultView) && this._coreBrowserService) {
      this.element.ownerDocument.defaultView !== this._coreBrowserService.window && (this._coreBrowserService.window = this.element.ownerDocument.defaultView);
      return;
    }
    this._document = e.ownerDocument, this.options.documentOverride && this.options.documentOverride instanceof Document && (this._document = this.optionsService.rawOptions.documentOverride), this.element = this._document.createElement("div"), this.element.dir = "ltr", this.element.classList.add("terminal"), this.element.classList.add("xterm"), e.appendChild(this.element);
    let t = this._document.createDocumentFragment();
    this._viewportElement = this._document.createElement("div"), this._viewportElement.classList.add("xterm-viewport"), t.appendChild(this._viewportElement), this.screenElement = this._document.createElement("div"), this.screenElement.classList.add("xterm-screen"), this._register(he(this.screenElement, "mousemove", (n) => this.updateCursorStyle(n))), this._helperContainer = this._document.createElement("div"), this._helperContainer.classList.add("xterm-helpers"), this.screenElement.appendChild(this._helperContainer), t.appendChild(this.screenElement);
    let r = this.textarea = this._document.createElement("textarea");
    this.textarea.classList.add("xterm-helper-textarea"), this.textarea.setAttribute("aria-label", To.get()), Mf || this.textarea.setAttribute("aria-multiline", "false"), this.textarea.setAttribute("autocorrect", "off"), this.textarea.setAttribute("autocapitalize", "off"), this.textarea.setAttribute("spellcheck", "false"), this.textarea.tabIndex = 0, this._register(this.optionsService.onSpecificOptionChange("disableStdin", () => r.readOnly = this.optionsService.rawOptions.disableStdin)), this.textarea.readOnly = this.optionsService.rawOptions.disableStdin, this._coreBrowserService = this._register(this._instantiationService.createInstance(a1, this.textarea, e.ownerDocument.defaultView ?? window, this._document ?? typeof window < "u" ? window.document : null)), this._instantiationService.setService(zt, this._coreBrowserService), this._register(he(this.textarea, "focus", (n) => this._handleTextAreaFocus(n))), this._register(he(this.textarea, "blur", () => this._handleTextAreaBlur())), this._helperContainer.appendChild(this.textarea), this._charSizeService = this._instantiationService.createInstance(ta, this._document, this._helperContainer), this._instantiationService.setService(_s, this._charSizeService), this._themeService = this._instantiationService.createInstance(na), this._instantiationService.setService(Ir, this._themeService), this._characterJoinerService = this._instantiationService.createInstance(ss), this._instantiationService.setService(cf, this._characterJoinerService), this._renderService = this._register(this._instantiationService.createInstance(ia, this.rows, this.screenElement)), this._instantiationService.setService(qt, this._renderService), this._register(this._renderService.onRenderedViewportChange((n) => this._onRender.fire(n))), this.onResize((n) => this._renderService.resize(n.cols, n.rows)), this._compositionView = this._document.createElement("div"), this._compositionView.classList.add("composition-view"), this._compositionHelper = this._instantiationService.createInstance(Zo, this.textarea, this._compositionView), this._helperContainer.appendChild(this._compositionView), this._mouseService = this._instantiationService.createInstance(ra), this._instantiationService.setService(Oa, this._mouseService);
    let i = this._linkifier.value = this._register(this._instantiationService.createInstance(da, this.screenElement));
    this.element.appendChild(t);
    try {
      this._onWillOpen.fire(this.element);
    } catch {
    }
    this._renderService.hasRenderer() || this._renderService.setRenderer(this._createRenderer()), this._register(this.onCursorMove(() => {
      this._renderService.handleCursorMove(), this._syncTextArea();
    })), this._register(this.onResize(() => this._renderService.handleResize(this.cols, this.rows))), this._register(this.onBlur(() => this._renderService.handleBlur())), this._register(this.onFocus(() => this._renderService.handleFocus())), this._viewport = this._register(this._instantiationService.createInstance(Xo, this.element, this.screenElement)), this._register(this._viewport.onRequestScrollLines((n) => {
      super.scrollLines(n, !1), this.refresh(0, this.rows - 1);
    })), this._selectionService = this._register(this._instantiationService.createInstance(sa, this.element, this.screenElement, i)), this._instantiationService.setService(Pg, this._selectionService), this._register(this._selectionService.onRequestScrollLines((n) => this.scrollLines(n.amount, n.suppressScrollEvent))), this._register(this._selectionService.onSelectionChange(() => this._onSelectionChange.fire())), this._register(this._selectionService.onRequestRedraw((n) => this._renderService.handleSelectionChanged(n.start, n.end, n.columnSelectMode))), this._register(this._selectionService.onLinuxMouseSelection((n) => {
      this.textarea.value = n, this.textarea.focus(), this.textarea.select();
    })), this._register(je.any(this._onScroll.event, this._inputHandler.onScroll)(() => {
      var n;
      this._selectionService.refresh(), (n = this._viewport) == null || n.queueSync();
    })), this._register(this._instantiationService.createInstance(Jo, this.screenElement)), this._register(he(this.element, "mousedown", (n) => this._selectionService.handleMouseDown(n))), this.coreMouseService.areMouseEventsActive ? (this._selectionService.disable(), this.element.classList.add("enable-mouse-events")) : this._selectionService.enable(), this.options.screenReaderMode && (this._accessibilityManager.value = this._instantiationService.createInstance(as, this)), this._register(this.optionsService.onSpecificOptionChange("screenReaderMode", (n) => this._handleScreenReaderModeOptionChange(n))), this.options.overviewRuler.width && (this._overviewRulerRenderer = this._register(this._instantiationService.createInstance(is, this._viewportElement, this.screenElement))), this.optionsService.onSpecificOptionChange("overviewRuler", (n) => {
      !this._overviewRulerRenderer && n && this._viewportElement && this.screenElement && (this._overviewRulerRenderer = this._register(this._instantiationService.createInstance(is, this._viewportElement, this.screenElement)));
    }), this._charSizeService.measure(), this.refresh(0, this.rows - 1), this._initGlobal(), this.bindMouse();
  }
  _createRenderer() {
    return this._instantiationService.createInstance(ea, this, this._document, this.element, this.screenElement, this._viewportElement, this._helperContainer, this.linkifier);
  }
  bindMouse() {
    let e = this, t = this.element;
    function r(n) {
      var l, c, u, p, _;
      let o = e._mouseService.getMouseReportCoords(n, e.screenElement);
      if (!o) return !1;
      let a, h;
      switch (n.overrideType || n.type) {
        case "mousemove":
          h = 32, n.buttons === void 0 ? (a = 3, n.button !== void 0 && (a = n.button < 3 ? n.button : 3)) : a = n.buttons & 1 ? 0 : n.buttons & 4 ? 1 : n.buttons & 2 ? 2 : 3;
          break;
        case "mouseup":
          h = 0, a = n.button < 3 ? n.button : 3;
          break;
        case "mousedown":
          h = 1, a = n.button < 3 ? n.button : 3;
          break;
        case "wheel":
          if (e._customWheelEventHandler && e._customWheelEventHandler(n) === !1) return !1;
          let m = n.deltaY;
          if (m === 0 || e.coreMouseService.consumeWheelEvent(n, (p = (u = (c = (l = e._renderService) == null ? void 0 : l.dimensions) == null ? void 0 : c.device) == null ? void 0 : u.cell) == null ? void 0 : p.height, (_ = e._coreBrowserService) == null ? void 0 : _.dpr) === 0) return !1;
          h = m < 0 ? 0 : 1, a = 4;
          break;
        default:
          return !1;
      }
      return h === void 0 || a === void 0 || a > 4 ? !1 : e.coreMouseService.triggerMouseEvent({ col: o.col, row: o.row, x: o.x, y: o.y, button: a, action: h, ctrl: n.ctrlKey, alt: n.altKey, shift: n.shiftKey });
    }
    let i = { mouseup: null, wheel: null, mousedrag: null, mousemove: null }, s = { mouseup: (n) => (r(n), n.buttons || (this._document.removeEventListener("mouseup", i.mouseup), i.mousedrag && this._document.removeEventListener("mousemove", i.mousedrag)), this.cancel(n)), wheel: (n) => (r(n), this.cancel(n, !0)), mousedrag: (n) => {
      n.buttons && r(n);
    }, mousemove: (n) => {
      n.buttons || r(n);
    } };
    this._register(this.coreMouseService.onProtocolChange((n) => {
      n ? (this.optionsService.rawOptions.logLevel === "debug" && this._logService.debug("Binding to mouse events:", this.coreMouseService.explainEvents(n)), this.element.classList.add("enable-mouse-events"), this._selectionService.disable()) : (this._logService.debug("Unbinding from mouse events."), this.element.classList.remove("enable-mouse-events"), this._selectionService.enable()), n & 8 ? i.mousemove || (t.addEventListener("mousemove", s.mousemove), i.mousemove = s.mousemove) : (t.removeEventListener("mousemove", i.mousemove), i.mousemove = null), n & 16 ? i.wheel || (t.addEventListener("wheel", s.wheel, { passive: !1 }), i.wheel = s.wheel) : (t.removeEventListener("wheel", i.wheel), i.wheel = null), n & 2 ? i.mouseup || (i.mouseup = s.mouseup) : (this._document.removeEventListener("mouseup", i.mouseup), i.mouseup = null), n & 4 ? i.mousedrag || (i.mousedrag = s.mousedrag) : (this._document.removeEventListener("mousemove", i.mousedrag), i.mousedrag = null);
    })), this.coreMouseService.activeProtocol = this.coreMouseService.activeProtocol, this._register(he(t, "mousedown", (n) => {
      if (n.preventDefault(), this.focus(), !(!this.coreMouseService.areMouseEventsActive || this._selectionService.shouldForceSelection(n))) return r(n), i.mouseup && this._document.addEventListener("mouseup", i.mouseup), i.mousedrag && this._document.addEventListener("mousemove", i.mousedrag), this.cancel(n);
    })), this._register(he(t, "wheel", (n) => {
      var o, a, h, l, c;
      if (!i.wheel) {
        if (this._customWheelEventHandler && this._customWheelEventHandler(n) === !1) return !1;
        if (!this.buffer.hasScrollback) {
          if (n.deltaY === 0) return !1;
          if (e.coreMouseService.consumeWheelEvent(n, (l = (h = (a = (o = e._renderService) == null ? void 0 : o.dimensions) == null ? void 0 : a.device) == null ? void 0 : h.cell) == null ? void 0 : l.height, (c = e._coreBrowserService) == null ? void 0 : c.dpr) === 0) return this.cancel(n, !0);
          let u = q.ESC + (this.coreService.decPrivateModes.applicationCursorKeys ? "O" : "[") + (n.deltaY < 0 ? "A" : "B");
          return this.coreService.triggerDataEvent(u, !0), this.cancel(n, !0);
        }
      }
    }, { passive: !1 }));
  }
  refresh(e, t) {
    var r;
    (r = this._renderService) == null || r.refreshRows(e, t);
  }
  updateCursorStyle(e) {
    var t;
    (t = this._selectionService) != null && t.shouldColumnSelect(e) ? this.element.classList.add("column-select") : this.element.classList.remove("column-select");
  }
  _showCursor() {
    this.coreService.isCursorInitialized || (this.coreService.isCursorInitialized = !0, this.refresh(this.buffer.y, this.buffer.y));
  }
  scrollLines(e, t) {
    this._viewport ? this._viewport.scrollLines(e) : super.scrollLines(e, t), this.refresh(0, this.rows - 1);
  }
  scrollPages(e) {
    this.scrollLines(e * (this.rows - 1));
  }
  scrollToTop() {
    this.scrollLines(-this._bufferService.buffer.ydisp);
  }
  scrollToBottom(e) {
    e && this._viewport ? this._viewport.scrollToLine(this.buffer.ybase, !0) : this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
  }
  scrollToLine(e) {
    let t = e - this._bufferService.buffer.ydisp;
    t !== 0 && this.scrollLines(t);
  }
  paste(e) {
    ef(e, this.textarea, this.coreService, this.optionsService);
  }
  attachCustomKeyEventHandler(e) {
    this._customKeyEventHandler = e;
  }
  attachCustomWheelEventHandler(e) {
    this._customWheelEventHandler = e;
  }
  registerLinkProvider(e) {
    return this._linkProviderService.registerLinkProvider(e);
  }
  registerCharacterJoiner(e) {
    if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
    let t = this._characterJoinerService.register(e);
    return this.refresh(0, this.rows - 1), t;
  }
  deregisterCharacterJoiner(e) {
    if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
    this._characterJoinerService.deregister(e) && this.refresh(0, this.rows - 1);
  }
  get markers() {
    return this.buffer.markers;
  }
  registerMarker(e) {
    return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + e);
  }
  registerDecoration(e) {
    return this._decorationService.registerDecoration(e);
  }
  hasSelection() {
    return this._selectionService ? this._selectionService.hasSelection : !1;
  }
  select(e, t, r) {
    this._selectionService.setSelection(e, t, r);
  }
  getSelection() {
    return this._selectionService ? this._selectionService.selectionText : "";
  }
  getSelectionPosition() {
    if (!(!this._selectionService || !this._selectionService.hasSelection)) return { start: { x: this._selectionService.selectionStart[0], y: this._selectionService.selectionStart[1] }, end: { x: this._selectionService.selectionEnd[0], y: this._selectionService.selectionEnd[1] } };
  }
  clearSelection() {
    var e;
    (e = this._selectionService) == null || e.clearSelection();
  }
  selectAll() {
    var e;
    (e = this._selectionService) == null || e.selectAll();
  }
  selectLines(e, t) {
    var r;
    (r = this._selectionService) == null || r.selectLines(e, t);
  }
  _keyDown(e) {
    if (this._keyDownHandled = !1, this._keyDownSeen = !0, this._customKeyEventHandler && this._customKeyEventHandler(e) === !1) return !1;
    let t = this.browser.isMac && this.options.macOptionIsMeta && e.altKey;
    if (!t && !this._compositionHelper.keydown(e)) return this.options.scrollOnUserInput && this.buffer.ybase !== this.buffer.ydisp && this.scrollToBottom(!0), !1;
    !t && (e.key === "Dead" || e.key === "AltGraph") && (this._unprocessedDeadKey = !0);
    let r = dm(e, this.coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
    if (this.updateCursorStyle(e), r.type === 3 || r.type === 2) {
      let i = this.rows - 1;
      return this.scrollLines(r.type === 2 ? -i : i), this.cancel(e, !0);
    }
    if (r.type === 1 && this.selectAll(), this._isThirdLevelShift(this.browser, e) || (r.cancel && this.cancel(e, !0), !r.key) || e.key && !e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1 && e.key.charCodeAt(0) >= 65 && e.key.charCodeAt(0) <= 90) return !0;
    if (this._unprocessedDeadKey) return this._unprocessedDeadKey = !1, !0;
    if ((r.key === q.ETX || r.key === q.CR) && (this.textarea.value = ""), this._onKey.fire({ key: r.key, domEvent: e }), this._showCursor(), this.coreService.triggerDataEvent(r.key, !0), !this.optionsService.rawOptions.screenReaderMode || e.altKey || e.ctrlKey) return this.cancel(e, !0);
    this._keyDownHandled = !0;
  }
  _isThirdLevelShift(e, t) {
    let r = e.isMac && !this.options.macOptionIsMeta && t.altKey && !t.ctrlKey && !t.metaKey || e.isWindows && t.altKey && t.ctrlKey && !t.metaKey || e.isWindows && t.getModifierState("AltGraph");
    return t.type === "keypress" ? r : r && (!t.keyCode || t.keyCode > 47);
  }
  _keyUp(e) {
    this._keyDownSeen = !1, !(this._customKeyEventHandler && this._customKeyEventHandler(e) === !1) && (wm(e) || this.focus(), this.updateCursorStyle(e), this._keyPressHandled = !1);
  }
  _keyPress(e) {
    let t;
    if (this._keyPressHandled = !1, this._keyDownHandled || this._customKeyEventHandler && this._customKeyEventHandler(e) === !1) return !1;
    if (this.cancel(e), e.charCode) t = e.charCode;
    else if (e.which === null || e.which === void 0) t = e.keyCode;
    else if (e.which !== 0 && e.charCode !== 0) t = e.which;
    else return !1;
    return !t || (e.altKey || e.ctrlKey || e.metaKey) && !this._isThirdLevelShift(this.browser, e) ? !1 : (t = String.fromCharCode(t), this._onKey.fire({ key: t, domEvent: e }), this._showCursor(), this.coreService.triggerDataEvent(t, !0), this._keyPressHandled = !0, this._unprocessedDeadKey = !1, !0);
  }
  _inputEvent(e) {
    if (e.data && e.inputType === "insertText" && (!e.composed || !this._keyDownSeen) && !this.optionsService.rawOptions.screenReaderMode) {
      if (this._keyPressHandled) return !1;
      this._unprocessedDeadKey = !1;
      let t = e.data;
      return this.coreService.triggerDataEvent(t, !0), this.cancel(e), !0;
    }
    return !1;
  }
  resize(e, t) {
    if (e === this.cols && t === this.rows) {
      this._charSizeService && !this._charSizeService.hasValidSize && this._charSizeService.measure();
      return;
    }
    super.resize(e, t);
  }
  _afterResize(e, t) {
    var r;
    (r = this._charSizeService) == null || r.measure();
  }
  clear() {
    if (!(this.buffer.ybase === 0 && this.buffer.y === 0)) {
      this.buffer.clearAllMarkers(), this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y)), this.buffer.lines.length = 1, this.buffer.ydisp = 0, this.buffer.ybase = 0, this.buffer.y = 0;
      for (let e = 1; e < this.rows; e++) this.buffer.lines.push(this.buffer.getBlankLine(Le));
      this._onScroll.fire({ position: this.buffer.ydisp }), this.refresh(0, this.rows - 1);
    }
  }
  reset() {
    var t;
    this.options.rows = this.rows, this.options.cols = this.cols;
    let e = this._customKeyEventHandler;
    this._setup(), super.reset(), (t = this._selectionService) == null || t.reset(), this._decorationService.reset(), this._customKeyEventHandler = e, this.refresh(0, this.rows - 1);
  }
  clearTextureAtlas() {
    var e;
    (e = this._renderService) == null || e.clearTextureAtlas();
  }
  _reportFocus() {
    var e;
    (e = this.element) != null && e.classList.contains("focus") ? this.coreService.triggerDataEvent(q.ESC + "[I") : this.coreService.triggerDataEvent(q.ESC + "[O");
  }
  _reportWindowsOptions(e) {
    if (this._renderService) switch (e) {
      case 0:
        let t = this._renderService.dimensions.css.canvas.width.toFixed(0), r = this._renderService.dimensions.css.canvas.height.toFixed(0);
        this.coreService.triggerDataEvent(`${q.ESC}[4;${r};${t}t`);
        break;
      case 1:
        let i = this._renderService.dimensions.css.cell.width.toFixed(0), s = this._renderService.dimensions.css.cell.height.toFixed(0);
        this.coreService.triggerDataEvent(`${q.ESC}[6;${s};${i}t`);
        break;
    }
  }
  cancel(e, t) {
    if (!(!this.options.cancelEvents && !t)) return e.preventDefault(), e.stopPropagation(), !1;
  }
};
function wm(e) {
  return e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18;
}
var Sm = class {
  constructor() {
    this._addons = [];
  }
  dispose() {
    for (let e = this._addons.length - 1; e >= 0; e--) this._addons[e].instance.dispose();
  }
  loadAddon(e, t) {
    let r = { instance: t, dispose: t.dispose, isDisposed: !1 };
    this._addons.push(r), t.dispose = () => this._wrappedAddonDispose(r), t.activate(e);
  }
  _wrappedAddonDispose(e) {
    if (e.isDisposed) return;
    let t = -1;
    for (let r = 0; r < this._addons.length; r++) if (this._addons[r] === e) {
      t = r;
      break;
    }
    if (t === -1) throw new Error("Could not dispose an addon that has not been loaded");
    e.isDisposed = !0, e.dispose.apply(e.instance), this._addons.splice(t, 1);
  }
}, Cm = class {
  constructor(e) {
    this._line = e;
  }
  get isWrapped() {
    return this._line.isWrapped;
  }
  get length() {
    return this._line.length;
  }
  getCell(e, t) {
    if (!(e < 0 || e >= this._line.length)) return t ? (this._line.loadCell(e, t), t) : this._line.loadCell(e, new pt());
  }
  translateToString(e, t, r) {
    return this._line.translateToString(e, t, r);
  }
}, Kc = class {
  constructor(e, t) {
    this._buffer = e, this.type = t;
  }
  init(e) {
    return this._buffer = e, this;
  }
  get cursorY() {
    return this._buffer.y;
  }
  get cursorX() {
    return this._buffer.x;
  }
  get viewportY() {
    return this._buffer.ydisp;
  }
  get baseY() {
    return this._buffer.ybase;
  }
  get length() {
    return this._buffer.lines.length;
  }
  getLine(e) {
    let t = this._buffer.lines.get(e);
    if (t) return new Cm(t);
  }
  getNullCell() {
    return new pt();
  }
}, Em = class extends de {
  constructor(e) {
    super(), this._core = e, this._onBufferChange = this._register(new Q()), this.onBufferChange = this._onBufferChange.event, this._normal = new Kc(this._core.buffers.normal, "normal"), this._alternate = new Kc(this._core.buffers.alt, "alternate"), this._core.buffers.onBufferActivate(() => this._onBufferChange.fire(this.active));
  }
  get active() {
    if (this._core.buffers.active === this._core.buffers.normal) return this.normal;
    if (this._core.buffers.active === this._core.buffers.alt) return this.alternate;
    throw new Error("Active buffer is neither normal nor alternate");
  }
  get normal() {
    return this._normal.init(this._core.buffers.normal);
  }
  get alternate() {
    return this._alternate.init(this._core.buffers.alt);
  }
}, xm = class {
  constructor(e) {
    this._core = e;
  }
  registerCsiHandler(e, t) {
    return this._core.registerCsiHandler(e, (r) => t(r.toArray()));
  }
  addCsiHandler(e, t) {
    return this.registerCsiHandler(e, t);
  }
  registerDcsHandler(e, t) {
    return this._core.registerDcsHandler(e, (r, i) => t(r, i.toArray()));
  }
  addDcsHandler(e, t) {
    return this.registerDcsHandler(e, t);
  }
  registerEscHandler(e, t) {
    return this._core.registerEscHandler(e, t);
  }
  addEscHandler(e, t) {
    return this.registerEscHandler(e, t);
  }
  registerOscHandler(e, t) {
    return this._core.registerOscHandler(e, t);
  }
  addOscHandler(e, t) {
    return this.registerOscHandler(e, t);
  }
}, km = class {
  constructor(e) {
    this._core = e;
  }
  register(e) {
    this._core.unicodeService.register(e);
  }
  get versions() {
    return this._core.unicodeService.versions;
  }
  get activeVersion() {
    return this._core.unicodeService.activeVersion;
  }
  set activeVersion(e) {
    this._core.unicodeService.activeVersion = e;
  }
}, Bm = ["cols", "rows"], mt = 0, Rm = class extends de {
  constructor(e) {
    super(), this._core = this._register(new bm(e)), this._addonManager = this._register(new Sm()), this._publicOptions = { ...this._core.options };
    let t = (i) => this._core.options[i], r = (i, s) => {
      this._checkReadonlyOptions(i), this._core.options[i] = s;
    };
    for (let i in this._core.options) {
      let s = { get: t.bind(this, i), set: r.bind(this, i) };
      Object.defineProperty(this._publicOptions, i, s);
    }
  }
  _checkReadonlyOptions(e) {
    if (Bm.includes(e)) throw new Error(`Option "${e}" can only be set in the constructor`);
  }
  _checkProposedApi() {
    if (!this._core.optionsService.rawOptions.allowProposedApi) throw new Error("You must set the allowProposedApi option to true to use proposed API");
  }
  get onBell() {
    return this._core.onBell;
  }
  get onBinary() {
    return this._core.onBinary;
  }
  get onCursorMove() {
    return this._core.onCursorMove;
  }
  get onData() {
    return this._core.onData;
  }
  get onKey() {
    return this._core.onKey;
  }
  get onLineFeed() {
    return this._core.onLineFeed;
  }
  get onRender() {
    return this._core.onRender;
  }
  get onResize() {
    return this._core.onResize;
  }
  get onScroll() {
    return this._core.onScroll;
  }
  get onSelectionChange() {
    return this._core.onSelectionChange;
  }
  get onTitleChange() {
    return this._core.onTitleChange;
  }
  get onWriteParsed() {
    return this._core.onWriteParsed;
  }
  get element() {
    return this._core.element;
  }
  get parser() {
    return this._parser || (this._parser = new xm(this._core)), this._parser;
  }
  get unicode() {
    return this._checkProposedApi(), new km(this._core);
  }
  get textarea() {
    return this._core.textarea;
  }
  get rows() {
    return this._core.rows;
  }
  get cols() {
    return this._core.cols;
  }
  get buffer() {
    return this._buffer || (this._buffer = this._register(new Em(this._core))), this._buffer;
  }
  get markers() {
    return this._checkProposedApi(), this._core.markers;
  }
  get modes() {
    let e = this._core.coreService.decPrivateModes, t = "none";
    switch (this._core.coreMouseService.activeProtocol) {
      case "X10":
        t = "x10";
        break;
      case "VT200":
        t = "vt200";
        break;
      case "DRAG":
        t = "drag";
        break;
      case "ANY":
        t = "any";
        break;
    }
    return { applicationCursorKeysMode: e.applicationCursorKeys, applicationKeypadMode: e.applicationKeypad, bracketedPasteMode: e.bracketedPasteMode, insertMode: this._core.coreService.modes.insertMode, mouseTrackingMode: t, originMode: e.origin, reverseWraparoundMode: e.reverseWraparound, sendFocusMode: e.sendFocus, synchronizedOutputMode: e.synchronizedOutput, wraparoundMode: e.wraparound };
  }
  get options() {
    return this._publicOptions;
  }
  set options(e) {
    for (let t in e) this._publicOptions[t] = e[t];
  }
  blur() {
    this._core.blur();
  }
  focus() {
    this._core.focus();
  }
  input(e, t = !0) {
    this._core.input(e, t);
  }
  resize(e, t) {
    this._verifyIntegers(e, t), this._core.resize(e, t);
  }
  open(e) {
    this._core.open(e);
  }
  attachCustomKeyEventHandler(e) {
    this._core.attachCustomKeyEventHandler(e);
  }
  attachCustomWheelEventHandler(e) {
    this._core.attachCustomWheelEventHandler(e);
  }
  registerLinkProvider(e) {
    return this._core.registerLinkProvider(e);
  }
  registerCharacterJoiner(e) {
    return this._checkProposedApi(), this._core.registerCharacterJoiner(e);
  }
  deregisterCharacterJoiner(e) {
    this._checkProposedApi(), this._core.deregisterCharacterJoiner(e);
  }
  registerMarker(e = 0) {
    return this._verifyIntegers(e), this._core.registerMarker(e);
  }
  registerDecoration(e) {
    return this._checkProposedApi(), this._verifyPositiveIntegers(e.x ?? 0, e.width ?? 0, e.height ?? 0), this._core.registerDecoration(e);
  }
  hasSelection() {
    return this._core.hasSelection();
  }
  select(e, t, r) {
    this._verifyIntegers(e, t, r), this._core.select(e, t, r);
  }
  getSelection() {
    return this._core.getSelection();
  }
  getSelectionPosition() {
    return this._core.getSelectionPosition();
  }
  clearSelection() {
    this._core.clearSelection();
  }
  selectAll() {
    this._core.selectAll();
  }
  selectLines(e, t) {
    this._verifyIntegers(e, t), this._core.selectLines(e, t);
  }
  dispose() {
    super.dispose();
  }
  scrollLines(e) {
    this._verifyIntegers(e), this._core.scrollLines(e);
  }
  scrollPages(e) {
    this._verifyIntegers(e), this._core.scrollPages(e);
  }
  scrollToTop() {
    this._core.scrollToTop();
  }
  scrollToBottom() {
    this._core.scrollToBottom();
  }
  scrollToLine(e) {
    this._verifyIntegers(e), this._core.scrollToLine(e);
  }
  clear() {
    this._core.clear();
  }
  write(e, t) {
    this._core.write(e, t);
  }
  writeln(e, t) {
    this._core.write(e), this._core.write(`\r
`, t);
  }
  paste(e) {
    this._core.paste(e);
  }
  refresh(e, t) {
    this._verifyIntegers(e, t), this._core.refresh(e, t);
  }
  reset() {
    this._core.reset();
  }
  clearTextureAtlas() {
    this._core.clearTextureAtlas();
  }
  loadAddon(e) {
    this._addonManager.loadAddon(this, e);
  }
  static get strings() {
    return { get promptLabel() {
      return To.get();
    }, set promptLabel(e) {
      To.set(e);
    }, get tooMuchOutput() {
      return Lo.get();
    }, set tooMuchOutput(e) {
      Lo.set(e);
    } };
  }
  _verifyIntegers(...e) {
    for (mt of e) if (mt === 1 / 0 || isNaN(mt) || mt % 1 !== 0) throw new Error("This API only accepts integers");
  }
  _verifyPositiveIntegers(...e) {
    for (mt of e) if (mt && (mt === 1 / 0 || isNaN(mt) || mt % 1 !== 0 || mt < 0)) throw new Error("This API only accepts positive integers");
  }
};
/**
 * Copyright (c) 2014-2024 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * @license MIT
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 */
var Am = 2, Dm = 1, Tm = class {
  activate(e) {
    this._terminal = e;
  }
  dispose() {
  }
  fit() {
    let e = this.proposeDimensions();
    if (!e || !this._terminal || isNaN(e.cols) || isNaN(e.rows)) return;
    let t = this._terminal._core;
    (this._terminal.rows !== e.rows || this._terminal.cols !== e.cols) && (t._renderService.clear(), this._terminal.resize(e.cols, e.rows));
  }
  proposeDimensions() {
    var u;
    if (!this._terminal || !this._terminal.element || !this._terminal.element.parentElement) return;
    let e = this._terminal._core._renderService.dimensions;
    if (e.css.cell.width === 0 || e.css.cell.height === 0) return;
    let t = this._terminal.options.scrollback === 0 ? 0 : ((u = this._terminal.options.overviewRuler) == null ? void 0 : u.width) || 14, r = window.getComputedStyle(this._terminal.element.parentElement), i = parseInt(r.getPropertyValue("height")), s = Math.max(0, parseInt(r.getPropertyValue("width"))), n = window.getComputedStyle(this._terminal.element), o = { top: parseInt(n.getPropertyValue("padding-top")), bottom: parseInt(n.getPropertyValue("padding-bottom")), right: parseInt(n.getPropertyValue("padding-right")), left: parseInt(n.getPropertyValue("padding-left")) }, a = o.top + o.bottom, h = o.right + o.left, l = i - a, c = s - h - t;
    return { cols: Math.max(Am, Math.floor(c / e.css.cell.width)), rows: Math.max(Dm, Math.floor(l / e.css.cell.height)) };
  }
};
/**
 * Copyright (c) 2014-2024 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * @license MIT
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 */
var Lm = class {
  constructor(e, t, r, i = {}) {
    this._terminal = e, this._regex = t, this._handler = r, this._options = i;
  }
  provideLinks(e, t) {
    let r = Mm.computeLink(e, this._regex, this._terminal, this._handler);
    t(this._addCallbacks(r));
  }
  _addCallbacks(e) {
    return e.map((t) => (t.leave = this._options.leave, t.hover = (r, i) => {
      if (this._options.hover) {
        let { range: s } = t;
        this._options.hover(r, i, s);
      }
    }, t));
  }
};
function Pm(e) {
  try {
    let t = new URL(e), r = t.password && t.username ? `${t.protocol}//${t.username}:${t.password}@${t.host}` : t.username ? `${t.protocol}//${t.username}@${t.host}` : `${t.protocol}//${t.host}`;
    return e.toLocaleLowerCase().startsWith(r.toLocaleLowerCase());
  } catch {
    return !1;
  }
}
var Mm = class Vi {
  static computeLink(t, r, i, s) {
    let n = new RegExp(r.source, (r.flags || "") + "g"), [o, a] = Vi._getWindowedLineStrings(t - 1, i), h = o.join(""), l, c = [];
    for (; l = n.exec(h); ) {
      let u = l[0];
      if (!Pm(u)) continue;
      let [p, _] = Vi._mapStrIdx(i, a, 0, l.index), [m, g] = Vi._mapStrIdx(i, p, _, u.length);
      if (p === -1 || _ === -1 || m === -1 || g === -1) continue;
      let w = { start: { x: _ + 1, y: p + 1 }, end: { x: g, y: m + 1 } };
      c.push({ range: w, text: u, activate: s });
    }
    return c;
  }
  static _getWindowedLineStrings(t, r) {
    let i, s = t, n = t, o = 0, a = "", h = [];
    if (i = r.buffer.active.getLine(t)) {
      let l = i.translateToString(!0);
      if (i.isWrapped && l[0] !== " ") {
        for (o = 0; (i = r.buffer.active.getLine(--s)) && o < 2048 && (a = i.translateToString(!0), o += a.length, h.push(a), !(!i.isWrapped || a.indexOf(" ") !== -1)); ) ;
        h.reverse();
      }
      for (h.push(l), o = 0; (i = r.buffer.active.getLine(++n)) && i.isWrapped && o < 2048 && (a = i.translateToString(!0), o += a.length, h.push(a), a.indexOf(" ") === -1); ) ;
    }
    return [h, s];
  }
  static _mapStrIdx(t, r, i, s) {
    let n = t.buffer.active, o = n.getNullCell(), a = i;
    for (; s; ) {
      let h = n.getLine(r);
      if (!h) return [-1, -1];
      for (let l = a; l < h.length; ++l) {
        h.getCell(l, o);
        let c = o.getChars();
        if (o.getWidth() && (s -= c.length || 1, l === h.length - 1 && c === "")) {
          let u = n.getLine(r + 1);
          u && u.isWrapped && (u.getCell(0, o), o.getWidth() === 2 && (s += 1));
        }
        if (s < 0) return [r, l];
      }
      r++, a = 0;
    }
    return [r, a];
  }
}, Om = /(https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]/;
function Im(e, t) {
  let r = window.open();
  if (r) {
    try {
      r.opener = null;
    } catch {
    }
    r.location.href = t;
  } else console.warn("Opening link blocked as opener could not be cleared");
}
var Nm = class {
  constructor(e = Im, t = {}) {
    this._handler = e, this._options = t;
  }
  activate(e) {
    this._terminal = e;
    let t = this._options, r = t.urlRegex || Om;
    this._linkProvider = this._terminal.registerLinkProvider(new Lm(this._terminal, r, this._handler, t));
  }
  dispose() {
    var e;
    (e = this._linkProvider) == null || e.dispose();
  }
};
const Fm = (e, t) => {
  const r = e.__vccOpts || e;
  for (const [i, s] of t)
    r[i] = s;
  return r;
}, Um = {
  key: 0,
  class: "ssh-terminal-overlay"
}, Hm = {
  key: 0,
  class: "ssh-terminal-error"
}, Wm = {
  key: 1,
  class: "ssh-terminal-connecting"
}, zm = {
  __name: "SshTerminal",
  props: {
    backendUrl: { type: String, required: !0 },
    host: { type: String, required: !0 },
    username: { type: String, required: !0 },
    password: { type: String, required: !0 }
  },
  emits: ["connected", "disconnected", "error", "status-change"],
  setup(e, { expose: t, emit: r }) {
    const i = e, s = r;
    t({
      connect: w,
      disconnect: y,
      fit: () => c == null ? void 0 : c.fit()
    });
    const n = new yg(), o = ms(null), a = ms(`ssh-${Date.now()}-${Math.random()}`), h = ms(0);
    let l = null, c = null, u = null;
    const p = ys(() => (h.value, n.getSessionState(a.value))), _ = ys(() => (h.value, n.getSessionStatus(a.value))), m = ys(() => (h.value, n.getSessionError(a.value)));
    function g() {
      l && l.dispose(), l = new Rm({
        allowProposedApi: !0,
        cursorBlink: !0,
        cursorStyle: "block",
        fontFamily: '"Cascadia Code", "Fira Code", "Hack", monospace',
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 1.2,
        theme: {
          background: "#1a1a2e"
        }
      }), c = new Tm(), l.loadAddon(c), l.loadAddon(new Nm()), l.open(o.value), $a(() => {
        c.fit();
      }), l.onData((v) => {
        n.sendData(a.value, v);
      }), l.onBinary((v) => {
        n.sendBinary(a.value, v);
      });
      let S = null;
      l.onResize((v) => {
        !v.cols || !v.rows || (clearTimeout(S), S = setTimeout(() => {
          n.resize(a.value, v.rows, v.cols);
        }, 300));
      }), u && u.disconnect(), u = new ResizeObserver(() => {
        c && p.value === "connected" && c.fit();
      }), u.observe(o.value);
    }
    async function w() {
      try {
        n.createSession(a.value, {
          backendUrl: i.backendUrl,
          host: i.host,
          username: i.username,
          password: i.password,
          privateKey: "",
          authMethod: "Password",
          sharedKey: "",
          encoding: "utf-8",
          acceptFingerprint: !0
        }), n.registerStateChangeCallback(a.value, () => {
          h.value++;
        }), n.registerDataCallback(a.value, (S) => {
          l && l.write(S);
        }), await n.connect(a.value);
      } catch (S) {
        s("error", String(S));
      }
    }
    async function y() {
      await n.disconnect(a.value), s("disconnected", "manual");
    }
    function E() {
      w();
    }
    return ja(p, (S, v) => {
      S === "connected" && v !== "connected" ? ($a(() => {
        c == null || c.fit(), l == null || l.focus();
      }), s("connected", { name: a.value })) : S === "error" && v !== "error" && s("error", m.value), s("status-change", { state: S, status: _.value });
    }), ja(_, (S, v) => {
      s("status-change", { state: p.value, status: S });
    }), Vf(() => {
      g(), w();
    }), Gf(() => {
      u && (u.disconnect(), u = null), l && (l.dispose(), l = null), n.destroySession(a.value);
    }), (S, v) => (ci(), ui("div", {
      ref_key: "containerRef",
      ref: o,
      class: "ssh-terminal"
    }, [
      p.value !== "connected" ? (ci(), ui("div", Um, [
        p.value === "error" ? (ci(), ui("div", Hm, [
          Yf(Ka(m.value) + " ", 1),
          Xf("button", {
            onClick: v[0] || (v[0] = (k) => E())
          }, "Reconnect")
        ])) : (ci(), ui("div", Wm, Ka(_.value), 1))
      ])) : Jf("", !0)
    ], 512));
  }
}, qm = /* @__PURE__ */ Fm(zm, [["__scopeId", "data-v-a02afb8c"]]), ay = {
  install(e) {
    e.component("SshTerminal", qm);
  }
};
export {
  qm as SshTerminal,
  ay as default
};
