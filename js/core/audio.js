// WebAudio로 합성하는 효과음. 음원 파일 없음.
(function (G) {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = 'sine', vol = 0.15, slide = 0, delay = 0 } = {}) {
    if (muted) return;
    const a = ac();
    if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  const seq = (notes, type, vol) =>
    notes.forEach(([f, d, delay]) => tone(f, d, { type, vol, delay }));

  G.audio = {
    setMuted(m) { muted = m; },
    isMuted() { return muted; },
    unlock() { ac(); },
    tap() { tone(660 + Math.random() * 200, 0.08, { type: 'triangle', vol: 0.12 }); },
    coin() { seq([[988, 0.07, 0], [1319, 0.15, 0.07]], 'square', 0.06); },
    bad() { tone(220, 0.25, { type: 'sawtooth', vol: 0.08, slide: -120 }); },
    click() { tone(440, 0.05, { type: 'triangle', vol: 0.08 }); },
    promote() { seq([[523, 0.12, 0], [659, 0.12, 0.12], [784, 0.12, 0.24], [1047, 0.35, 0.36]], 'square', 0.07); },
    death() { seq([[392, 0.3, 0], [370, 0.3, 0.3], [349, 0.3, 0.6], [330, 0.8, 0.9]], 'triangle', 0.14); },
    fever() { seq([[784, 0.08, 0], [988, 0.08, 0.08], [1175, 0.08, 0.16], [1568, 0.25, 0.24]], 'square', 0.06); },
    event() { seq([[880, 0.1, 0], [660, 0.15, 0.1]], 'sine', 0.12); },
    ending() { seq([[523, 0.2, 0], [659, 0.2, 0.2], [784, 0.2, 0.4], [1047, 0.2, 0.6], [784, 0.2, 0.8], [1047, 0.6, 1.0]], 'triangle', 0.12); },
  };
})(globalThis.G);
