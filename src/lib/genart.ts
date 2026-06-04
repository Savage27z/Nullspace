function nsHashSeed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function nsMulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const HUE_TEAL = 168
const HUE_MAGENTA = 332

export function vaultArtURI(seed: string): string {
  const rnd = nsMulberry32(nsHashSeed(seed))
  const pick = (min: number, max: number) => min + (max - min) * rnd()
  const hueA = HUE_TEAL
  const hueB = HUE_MAGENTA
  const baseH = rnd() < 0.62 ? hueA : hueB
  const base = `oklch(28% 0.08 ${baseH})`
  let ell = ""
  for (let i = 0; i < 6; i++) {
    const h = i % 2 === 0 ? hueA : hueB
    const l = i % 2 === 0 ? 34 : 54
    const c = i % 2 === 0 ? 0.1 : 0.15
    const cx = Math.round(pick(0, 400)),
      cy = Math.round(pick(0, 400))
    const rx = Math.round(pick(80, 235)),
      ry = Math.round(pick(95, 224))
    const op = pick(0.5, 0.9).toFixed(2)
    ell += `<ellipse cx='${cx}' cy='${cy}' rx='${rx}' ry='${ry}' fill='oklch(${l}% ${c} ${h})' opacity='${op}'/>`
  }
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' preserveAspectRatio='xMidYMid slice'>` +
    `<defs><filter id='b'><feGaussianBlur stdDeviation='42'/></filter>` +
    `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.3' numOctaves='2'/>` +
    `<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.13 0'/></filter></defs>` +
    `<rect width='400' height='400' fill='${base}'/>` +
    `<g filter='url(#b)'>${ell}</g>` +
    `<rect width='400' height='400' filter='url(#n)' opacity='0.55'/>` +
    `</svg>`
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg)
}

export function heroArtURI(): string {
  const rnd = nsMulberry32(nsHashSeed("nullspace-hero-v3"))
  const pick = (min: number, max: number) => min + (max - min) * rnd()
  let ell = ""
  const hues = [168, 332, 200, 168, 332, 168, 200, 332, 168, 332, 168, 200]
  for (let i = 0; i < 12; i++) {
    const h = hues[i]
    const l = pick(22, 58)
    const c = pick(0.08, 0.19)
    const cx = Math.round(pick(0, 1200)),
      cy = Math.round(pick(0, 600))
    const rx = Math.round(pick(100, 400)),
      ry = Math.round(pick(80, 350))
    const op = pick(0.35, 0.9).toFixed(2)
    ell += `<ellipse cx='${cx}' cy='${cy}' rx='${rx}' ry='${ry}' fill='oklch(${l}% ${c} ${h})' opacity='${op}'/>`
  }
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600' preserveAspectRatio='xMidYMid slice'>` +
    `<defs><filter id='hb3'><feGaussianBlur stdDeviation='55'/></filter>` +
    `<filter id='hn3'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/>` +
    `<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0'/></filter></defs>` +
    `<rect width='1200' height='600' fill='oklch(16% 0.04 200)'/>` +
    `<g filter='url(#hb3)'>${ell}</g>` +
    `<rect width='1200' height='600' filter='url(#hn3)' opacity='0.5'/>` +
    `</svg>`
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg)
}
