// 프로젝트 미니게임. done(성공률 보너스, 결과 문구) 호출로 끝난다.
(function (G) {
  const U = G.U;

  const TIMING_TEXT = {
    copier: ['종이가 걸린 순간을 노려 문을 연다!', '🖨️'],
    intro: ['정적이 오기 전에 인사!', '🙋'],
    dinner: ['건배 타이밍을 맞춰라!', '🍻'],
    golf: ['적당히... 아주 적당히 친다!', '🏌️'],
    pt: ['다음 슬라이드로 넘길 타이밍!', '📽️'],
    trip: ['비행기 탑승 마감 직전 도착!', '🛫'],
    restruct: ['울기 전에 발표를 끝내라!', '🎤'],
    award: ['수상자 이름을 정확히!', '🏆'],
    chairman: ['회장님이 수저를 든 직후에!', '🥢'],
  };
  const MASH_TEXT = {
    overtime: ['키보드를 두드려라!', '⌨️'],
    excel: ['셀을 채워라!', '📊'],
    newbiz: ['슬라이드를 찍어내라!', '💡'],
    agm: ['질문에 대답해라!', '🙋‍♂️'],
    press: ['플래시를 버텨라!', '📸'],
  };

  function timing(s, p, done) {
    const [help, icon] = TIMING_TEXT[p.id] || ['타이밍을 맞춰라!', '🎯'];
    const speed = 1.2 + 0.18 * p.rank;       // 초당 왕복 비율
    const perfectW = Math.max(0.05, 0.1 - 0.007 * p.rank);
    const goodW = perfectW + 0.13;
    const center = U.rand(0.3, 0.7);
    const body = document.createElement('div');
    body.innerHTML = `
      <div class="event-icon">${icon}</div>
      <div class="mg-title">${p.name}</div>
      <div class="mg-help">${help}<br>초록색에서 멈추면 대성공! (터치 / 스페이스)</div>
      <div class="timing-bar">
        <div class="good" style="left:${(center - goodW / 2) * 100}%;width:${goodW * 100}%"></div>
        <div class="perfect" style="left:${(center - perfectW / 2) * 100}%;width:${perfectW * 100}%"></div>
        <div class="cursor"></div>
      </div>
      <div class="mg-result"></div>
      <button class="btn block" data-stop>멈춰!</button>`;
    G.modal.open({ title: '', body, closable: false });
    const cursor = body.querySelector('.cursor');
    const result = body.querySelector('.mg-result');
    let x = 0, dir = 1, last = performance.now(), stopped = false, raf;

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      x += dir * speed * dt * 2;
      if (x > 1) { x = 1; dir = -1; }
      if (x < 0) { x = 0; dir = 1; }
      cursor.style.left = x * 100 + '%';
      if (!stopped) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const stop = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      const d = Math.abs(x - center);
      let bonus, label;
      if (d <= perfectW / 2) { bonus = 0.25; label = '🌟 완벽! 성공률 +25%'; G.audio.coin(); }
      else if (d <= goodW / 2) { bonus = 0.12; label = '👍 좋아! 성공률 +12%'; G.audio.tap(); }
      else { bonus = -0.05; label = '😅 빗나감... 성공률 -5%'; G.audio.bad(); }
      result.textContent = label;
      setTimeout(() => done(bonus, label), 750);
    };
    const onKey = (e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); stop(); } };
    document.addEventListener('keydown', onKey);
    body.querySelector('[data-stop]').addEventListener('pointerdown', (e) => { e.preventDefault(); stop(); });
  }

  function mash(s, p, done) {
    const [help, icon] = MASH_TEXT[p.id] || ['연타!', '👆'];
    const target = 26 + p.rank * 3;
    const TIME = 5;
    const body = document.createElement('div');
    body.innerHTML = `
      <div class="mg-title">${p.name}</div>
      <div class="mg-help">${help} ${TIME}초 안에 ${target}번! (터치 / 스페이스)</div>
      <button class="mash-btn">${icon}</button>
      <div class="mash-meter"><div></div></div>
      <div class="mg-result">준비...</div>`;
    G.modal.open({ title: '', body, closable: false });
    const btn = body.querySelector('.mash-btn');
    const meter = body.querySelector('.mash-meter > div');
    const result = body.querySelector('.mg-result');
    let count = 0, started = false, ended = false, t0 = 0, timer;

    const hit = () => {
      if (ended) return;
      if (!started) {
        started = true; t0 = performance.now();
        timer = setInterval(() => {
          const left = TIME - (performance.now() - t0) / 1000;
          if (left <= 0) end(); else result.textContent = `${count} / ${target} · ${left.toFixed(1)}초`;
        }, 100);
      }
      count++;
      G.audio.tap();
      meter.style.width = Math.min(100, (count / target) * 100) + '%';
      result.textContent = `${count} / ${target}`;
    };
    const end = () => {
      ended = true;
      clearInterval(timer);
      document.removeEventListener('keydown', onKey);
      const r = count / target;
      let bonus, label;
      if (r >= 1) { bonus = 0.25; label = `🌟 ${count}회! 성공률 +25%`; G.audio.coin(); }
      else if (r >= 0.7) { bonus = 0.12; label = `👍 ${count}회! 성공률 +12%`; }
      else if (r >= 0.4) { bonus = 0.04; label = `🙂 ${count}회. 성공률 +4%`; }
      else { bonus = -0.05; label = `😴 ${count}회... 성공률 -5%`; G.audio.bad(); }
      result.textContent = label;
      setTimeout(() => done(bonus, label), 800);
    };
    const onKey = (e) => { if ((e.code === 'Space' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); hit(); } };
    document.addEventListener('keydown', onKey);
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); hit(); });
    result.textContent = '버튼을 누르면 시작!';
  }

  G.minigames = { timing, mash };
})(globalThis.G);
