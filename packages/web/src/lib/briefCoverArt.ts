/**
 * report レイアウトの表紙グラフィック（点格子＋ライムの「回路」）。
 *
 * 承認済みモック（032_v8）のブラウザ側 JS をそのまま TS に移したもの。種は
 * `brief_no` だけで、乱数は mulberry32。ビルド時に BriefTemplate の
 * frontmatter から呼んで静的な SVG を出す（クライアント JS は不要）。同じ
 * brief_no からは常に同じ絵が出る。
 *
 * 絵の作法を変えるときは、既存の report Brief の表紙が全部変わる点に注意。
 */

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface CoverArt {
  readonly viewBox: string;
  readonly preserveAspectRatio: string;
  /** `<svg>` の中身（defs＋図形）。set:html で流し込む。 */
  readonly inner: string;
}

export function briefCoverArt(briefNo: number): CoverArt {
  const seed = briefNo || 1;
  const r = mulberry32(seed * 9973);
  const W = 1000;
  const H = 420;
  const S = 22;
  const cols = Math.floor(W / S);
  const rows = Math.floor(H / S);
  const x0 = W * 0.66;

  const gx = x0 + (W - x0) * (0.35 + r() * 0.4);
  const gy = H * (0.18 + r() * 0.4);

  let out =
    `<defs><radialGradient id="g${seed}"><stop offset="0" stop-color="#a8e010" stop-opacity=".26"/><stop offset="1" stop-color="#a8e010" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="f${seed}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity="1"/></linearGradient>` +
    `<mask id="m${seed}"><rect width="${W}" height="${H}" fill="url(#f${seed})"/></mask></defs>`;
  out += `<circle cx="${gx}" cy="${gy}" r="260" fill="url(#g${seed})"/>`;

  let g = `<g mask="url(#m${seed})">`;
  const lit: Array<[number, number]> = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * S + S / 2;
      const y = j * S + S / 2;
      if (x < x0 - 160) continue;
      const d = Math.hypot(x - gx, y - gy);
      const p = r();
      if (x > x0 + 70 && y < H * 0.7 && p < 0.035) {
        lit.push([x, y]);
        continue;
      }
      const op = (0.1 + 0.22 * Math.max(0, 1 - d / 520)).toFixed(2);
      g += `<circle cx="${x}" cy="${y}" r="1.1" fill="#cfd8c4" opacity="${op}"/>`;
    }
  }

  lit.sort(
    (a, b) =>
      Math.hypot(a[0] - gx, a[1] - gy) - Math.hypot(b[0] - gx, b[1] - gy),
  );
  const hub = lit.slice(0, 5);
  let path = "";
  hub.forEach((p, k) => {
    if (!k) {
      path = `M${p[0]} ${p[1]}`;
      return;
    }
    const q = hub[k - 1];
    path += ` L${p[0]} ${q[1]} L${p[0]} ${p[1]}`;
  });
  if (path) {
    g += `<path d="${path}" fill="none" stroke="#a8e010" stroke-opacity=".35" stroke-width="1"/>`;
  }
  lit.forEach((p, k) => {
    g += `<circle cx="${p[0]}" cy="${p[1]}" r="${k < 5 ? 2.6 : 1.6}" fill="#a8e010" opacity="${k < 5 ? 0.9 : 0.35}"/>`;
  });
  g += "</g>";

  return {
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "xMaxYMid slice",
    inner: out + g,
  };
}
