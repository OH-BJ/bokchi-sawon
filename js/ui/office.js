// 사무실 화면: 업무 아이콘 스폰/터치, 떠오르는 숫자, 월급날 봉투, 말풍선, 숨겨진 오브젝트
(function (G) {
  const U = G.U, E = G.econ, R = G.rules;
  const $ = (id) => document.getElementById(id);

  let office, layer, fx, speechEl, banner;
  let items = [];
  let spawnT = 0;
  let speechTimer = null;
  let uid = 0;

  const IDLE_LINES = ['출근하기 싫다...', '오늘 점심 뭐지', '바다 보고 싶다', '부장님이 보고 있다', '퇴근까지 7시간...', '월급날 언제지', '넥타이가 꽉 낀다', '나는 할 수 있다 (아님)'];
  const PET_LINES = ['헤헤', '...?', '왜요?', '부, 부담스러워요', '그만...!'];
  const TAP_LINES = ['처리 완료!', '휴...', '이건 또 뭐야', '야근각...', '오 이거 쉬운데?'];

  function init() {
    office = $('office'); layer = $('tasks'); fx = $('fx');
    speechEl = $('speech'); banner = $('fever-banner');

    $('bokchi').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (G.game.paused()) return;
      const s = G.game.state;
      R.touch(s);
      G.audio.click();
      const el = $('bokchi');
      el.classList.remove('squish'); void el.offsetWidth; el.classList.add('squish');
      const sig = R.pet(s, performance.now());
      const n = s.life.pets.length;
      if (n >= 6) say(PET_LINES[Math.min(PET_LINES.length - 1, n - 6 + 2)], 900);
      else if (n === 1 && U.chance(0.4)) say(PET_LINES[U.randInt(0, 1)], 900);
      G.game.handle(sig);
    });

    const hidden = (elId, deathId, lines) => {
      $(elId).addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (G.game.paused()) return;
        const s = G.game.state;
        R.touch(s);
        G.audio.click();
        const count = (s.life.hiddenTaps[deathId] || 0) + 1;
        if (count >= 2) say(lines[Math.min(lines.length - 1, count - 2)], 1000);
        G.game.handle(R.hiddenTap(s, deathId));
      });
    };
    hidden('obj-clock', 'h_clock', ['아직 10시...', '시간이 안 가', '왜 아직도 10시야', '시계 고장 났나?', '...', '부장님이 쳐다본다', '눈 마주쳤다', '...!']);
    hidden('obj-window', 'h_window', ['날씨 좋다', '나가고 싶다', '바다 가고 싶다', '저 구름 부럽다', '...']);
    hidden('obj-plant', 'h_plant', ['따끔', '아야!']);
  }

  function pos() {
    const w = office.clientWidth, h = office.clientHeight;
    let best = null;
    for (let i = 0; i < 10; i++) {
      const x = U.rand(0.12, 0.88) * w;
      const y = U.rand(0.1, 0.72) * h;
      const minD = items.reduce((m, it) => Math.min(m, Math.hypot(it.x - x, it.y - y)), Infinity);
      if (!best || minD > best.d) best = { x, y, d: minD };
      if (minD > 80) break;
    }
    return best;
  }

  function spawn(s) {
    const isTrap = s.life.fever === 0 && U.chance(E.trapChance) && E.availableTraps(s).length;
    let def;
    if (isTrap) def = U.pick(E.availableTraps(s));
    else def = U.weighted(E.taskWeights(E.availableTasks(s))).t;
    const p = pos();
    const el = document.createElement('button');
    el.className = 'task' + (isTrap ? ' trap' : '');
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    el.innerHTML = `${def.icon}<span class="lbl">${def.name}</span>`;
    const it = { id: ++uid, el, def, trap: !!isTrap, age: 0, x: p.x, y: p.y };
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); tap(it); });
    layer.appendChild(el);
    items.push(it);
  }

  function remove(it) {
    items = items.filter((x) => x !== it);
    it.el.classList.add('gone');
    setTimeout(() => it.el.remove(), 200);
  }

  function tap(it) {
    if (G.game.paused() || !items.includes(it)) return;
    const s = G.game.state;
    R.touch(s);
    remove(it);
    const res = it.trap ? R.tapTrap(s, it.def) : R.tapTask(s, it.def);
    if (res.gain > 0) {
      floater(it.x, it.y, '+' + U.fmt(res.gain), it.trap ? 'gold' : '');
      G.audio.tap();
      if (it.trap) say('휴, 무사했다!', 900);
      else if (U.chance(0.04)) say(U.pick(TAP_LINES), 900);
    }
    G.game.handle(res.out);
  }

  function update(s, dt) {
    spawnT -= dt;
    if (spawnT <= 0) {
      spawnT = E.spawnInterval(s);
      if (items.length < E.maxTasks(s) + (s.life.fever > 0 ? 4 : 0)) spawn(s);
    }
    for (const it of [...items]) {
      it.age += dt;
      if (it.age > E.taskLife - 1.5) it.el.classList.add('expiring');
      if (it.age > E.taskLife) {
        remove(it);
        if (it.trap) {
          const sig = R.expireTrap(s, it.def);
          if (sig.length) { G.game.handle(sig); return; }
        }
      }
    }
    updateAlert(s);
    office.classList.toggle('fever', s.life.fever > 0);
    banner.classList.toggle('hidden', !(s.life.fever > 0));
    if (!s.life.alert && U.chance(dt / 25) && speechEl.classList.contains('hidden')) say(U.pick(IDLE_LINES), 1800);
  }

  function clear() {
    items.forEach((it) => it.el.remove());
    items = [];
    layer.innerHTML = '';
    office.querySelectorAll('.envelope').forEach((x) => x.remove());
    clearAlert();
    spawnT = 0.5;
  }

  function floater(x, y, text, cls = '') {
    const f = document.createElement('div');
    f.className = 'floater ' + cls;
    f.style.left = x + 'px';
    f.style.top = y + 'px';
    f.textContent = text;
    fx.appendChild(f);
    setTimeout(() => f.remove(), 950);
  }
  function floaterCenter(text, cls) {
    floater(office.clientWidth / 2, office.clientHeight * 0.35, text, cls);
  }

  function say(text, ms = 1500) {
    speechEl.textContent = text;
    speechEl.classList.remove('hidden');
    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => speechEl.classList.add('hidden'), ms);
  }

  function envelope() {
    const el = document.createElement('button');
    el.className = 'envelope';
    el.textContent = '💰';
    el.setAttribute('aria-label', '월급 봉투');
    el.style.top = U.rand(10, 45) + '%';
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (G.game.paused()) return;
      el.remove();
      const noise = R.alertTouch(G.game.state, false);
      if (noise.length) { G.game.handle(noise); if (noise.some((x) => x.type === 'death')) return; }
      R.startFever(G.game.state);
      G.audio.fever();
      say('월급이다!!!', 1500);
    });
    el.addEventListener('animationend', () => el.remove());
    office.appendChild(el);
  }

  // ── 돌발 상황 표시 ──
  let alertHideT = null;
  function showAlert(kind) {
    const def = G.rules.ALERTS[kind];
    const box = $('alert-box');
    clearTimeout(alertHideT);
    box.className = 'alert-box' + (kind === 'silence' ? ' silence' : '');
    $('alert-icon').textContent = def.icon;
    $('alert-title').textContent = def.title;
    $('alert-help').textContent = def.help;
    office.classList.toggle('silence', kind === 'silence');
    if (kind !== 'silence') {
      const w = $('walker');
      w.textContent = kind === 'ceo' ? '🕴️' : '🚶‍♂️';
      w.classList.remove('hidden');
      w.style.animation = 'none'; void w.offsetWidth; w.style.animation = '';
      say(kind === 'ceo' ? '대, 대표님...!' : '헉 부장님이다', 1200);
    }
    G.audio.event();
  }
  function updateAlert(s) {
    const A = s.life.alert;
    if (!A) return;
    const def = G.rules.ALERTS[A.kind];
    $('alert-fill').style.width = Math.max(0, A.left / def.time) * 100 + '%';
    if (def.need > 1) $('alert-help').textContent = `${def.help} (${A.count}/${def.need})`;
  }
  function hideAlert(kind, ok) {
    const box = $('alert-box');
    office.classList.remove('silence');
    $('walker').classList.add('hidden');
    box.classList.add(ok ? 'ok' : 'fail');
    $('alert-help').textContent = ok
      ? (kind === 'silence' ? '무사히 넘겼다. 스트레스 -15' : '열일 인정! 실적 보너스')
      : (kind === 'silence' ? '탁! ...다들 쳐다본다' : '딴짓하다 걸렸다...');
    $('alert-fill').style.width = '0';
    if (ok) G.audio.coin(); else G.audio.bad();
    alertHideT = setTimeout(() => box.classList.add('hidden'), 1100);
  }
  function clearAlert() {
    clearTimeout(alertHideT);
    $('alert-box').classList.add('hidden');
    $('walker').classList.add('hidden');
    office.classList.remove('silence');
  }

  function setPaused(p) {
    $('walker').style.animationPlayState = p ? 'paused' : 'running';
    office.querySelectorAll('.envelope').forEach((x) => (x.style.animationPlayState = p ? 'paused' : 'running'));
  }

  G.office = { init, update, clear, floater, floaterCenter, say, envelope, setPaused, showAlert, hideAlert };
})(globalThis.G);
