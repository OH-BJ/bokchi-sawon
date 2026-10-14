(function (G) {
  const U = {};

  U.rng = Math.random;
  U.rand = (a, b) => a + U.rng() * (b - a);
  U.randInt = (a, b) => Math.floor(U.rand(a, b + 1));
  U.chance = (p) => U.rng() < p;
  U.pick = (arr) => arr[Math.floor(U.rng() * arr.length)];
  U.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // [{w: 가중치, ...}] 중 하나를 고른다
  U.weighted = (items, wKey = 'w') => {
    const total = items.reduce((s, it) => s + Math.max(0, it[wKey]), 0);
    if (total <= 0) return items[0];
    let r = U.rng() * total;
    for (const it of items) {
      r -= Math.max(0, it[wKey]);
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  };

  // 한국식 큰 수 표기: 1.2만, 3.4억
  U.fmt = (n) => {
    n = Math.floor(n);
    const abs = Math.abs(n);
    if (abs < 10000) return n.toLocaleString('ko-KR');
    const units = [['경', 1e16], ['조', 1e12], ['억', 1e8], ['만', 1e4]];
    for (const [u, v] of units) {
      if (abs >= v) {
        const x = n / v;
        return (x >= 100 ? Math.floor(x) : x.toFixed(1).replace(/\.0$/, '')) + u;
      }
    }
    return String(n);
  };

  U.fmtTime = (sec) => {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return `${h}시간 ${m}분`;
    if (m > 0) return `${m}분 ${s}초`;
    return `${s}초`;
  };

  // 한글 받침에 따라 조사 선택: josa('복치', '은', '는')
  U.josa = (word, a, b) => {
    const c = word.charCodeAt(word.length - 1);
    if (c < 0xac00 || c > 0xd7a3) return word + b;
    return word + ((c - 0xac00) % 28 ? a : b);
  };

  G.U = U;
})(globalThis.G);
