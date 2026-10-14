// 초기화 + 게임 루프 + 신호(signal) 처리
(function (G) {
  const U = G.U, E = G.econ, R = G.rules, S = G.screens;

  G.ui = { forcedMood: null };

  let state = G.state.migrate(G.storage.load()) || G.state.newState();
  let modalOpen = false;
  let hiddenTab = false;
  let lifeOver = false;
  let saveT = 0, hudT = 0;
  // 테스트용 배속: index.html?speed=5
  const SPEED = Math.min(20, Number(new URLSearchParams(location.search).get('speed')) || 1);

  const game = {
    get state() { return state; },
    paused: () => modalOpen || hiddenTab || lifeOver,
    setModal(v) { modalOpen = v; G.office.setPaused(game.paused()); },
    save: () => G.storage.save(state),
    reset() {
      G.storage.wipe();
      state = G.state.newState();
      G.modal.close(true);
      startLife(true);
      S.intro(() => { state.meta.tutorial = true; game.save(); });
    },
    handle,
  };
  G.game = game;

  // ── 신호 처리 ───────────────────────────────────────
  function handle(signals) {
    if (!signals || !signals.length || lifeOver) return;
    // 퇴사/엔딩이 섞여 있으면 그것만 처리
    const fatal = signals.find((x) => x.type === 'death' || x.type === 'ending');
    for (const sig of signals) {
      if (sig.type === 'promote') onPromote(sig);
      else if (sig.type === 'alertEnd') G.office.hideAlert(sig.kind, sig.ok);
    }
    if (fatal) {
      if (fatal.type === 'death') onDeath(fatal.id);
      else onEnding(fatal.id);
      return;
    }
    for (const sig of signals) {
      if (sig.type === 'event' && !modalOpen) S.event(state, sig.id);
      else if (sig.type === 'feverSpawn') G.office.envelope();
      else if (sig.type === 'alert') G.office.showAlert(sig.kind);
    }
  }

  function onPromote(sig) {
    const r = G.RANKS[sig.rank];
    G.audio.promote();
    S.toast(`🎉 승진! <b>${r.name}</b> · ${r.title}${sig.bonus ? ` (💰+${U.fmt(sig.bonus)})` : ''}`, 'promo');
    G.office.say(sig.first ? '내가 ' + r.name + '라니...!' : r.name + ' 다시 달성!', 1600);
    const el = document.getElementById('bokchi');
    G.ui.forcedMood = 'happy'; G.hud.refreshMood();
    setTimeout(() => { G.ui.forcedMood = null; G.hud.refreshMood(); }, 1500);
    el.classList.remove('squish'); void el.offsetWidth; el.classList.add('squish');
  }

  function onDeath(id) {
    lifeOver = true;
    G.modal.close(true);
    const rep = R.die(state, id);
    game.save();
    G.ui.forcedMood = 'dead'; G.hud.refreshMood(); G.hud.render(state);
    const el = document.getElementById('bokchi');
    el.classList.add('shake');
    G.office.say('...퇴사하겠습니다', 1500);
    setTimeout(() => {
      el.classList.remove('shake');
      S.death(state, rep, () => startLife());
    }, 900);
  }

  function onEnding(id) {
    lifeOver = true;
    G.modal.close(true);
    const res = R.reachEnding(state, id);
    game.save();
    setTimeout(() => S.ending(state, res, () => {
      if (id === 'chairman') {
        const rep = R.die(state, 'retire');
        game.save();
        S.death(state, rep, () => startLife());
      } else startLife();
    }), 600);
  }

  function startLife(fresh) {
    if (!fresh) G.state.newLife(state);
    lifeOver = false;
    G.ui.forcedMood = null;
    G.office.clear();
    G.hud.refreshMood();
    G.hud.render(state);
    game.save();
    if (state.life.n > 1) {
      const r = G.RANKS[state.life.rank];
      S.toast(`🏢 ${state.life.n}대 복치, ${r.name}(으)로 입사!`);
      G.office.say(U.pick(['오늘부터 출근합니다!', '이번엔 오래 다닐 거예요', '안녕하세요... (긴장)', '전생의 기억이...?']), 1800);
    }
  }

  // ── 루프 ───────────────────────────────────────────
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000) * SPEED;
    last = now;
    if (!game.paused()) {
      const sig = R.tick(state, dt);
      if (sig.length) handle(sig);
      if (!game.paused()) G.office.update(state, dt);
    }
    hudT -= dt;
    if (hudT <= 0) { hudT = 0.1; G.hud.render(state); }
    saveT += dt;
    if (saveT > 5) { saveT = 0; game.save(); }
    requestAnimationFrame(frame);
  }

  // ── 입력 ───────────────────────────────────────────
  function bindActions() {
    document.getElementById('actions').addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b || lifeOver) return;
      G.audio.unlock();
      R.touch(state);
      const act = b.dataset.act;
      if (act === 'rest') {
        const r = R.rest(state);
        if (!r) { G.audio.bad(); G.office.say('아직 쉴 수 없다...', 900); return; }
        G.audio.click();
        if (!r.out.length) {
          G.office.say(`${r.spot.name}에서 숨 돌리는 중...`, 1300);
          G.office.floaterCenter(`스트레스 -${E.restRelief(state)}`, '');
        } else G.office.say(`${r.spot.name}에서...!`, 900);
        handle(r.out);
        return;
      }
      G.audio.click();
      // 정적 타임에 메뉴를 여는 것도 소음
      const noise = R.alertTouch(state, false);
      if (noise.length) { handle(noise); if (lifeOver) return; }
      if (act === 'project') S.projects(state);
      else if (act === 'upgrade') S.upgrades(state);
      else if (act === 'dex') S.dex(state);
      else if (act === 'menu') S.menu(state);
    });

    document.addEventListener('pointerdown', () => R.touch(state), { passive: true });

    document.addEventListener('visibilitychange', () => {
      hiddenTab = document.hidden;
      G.office.setPaused(game.paused());
      if (document.hidden) game.save();
      else last = performance.now();
    });
    window.addEventListener('pagehide', () => game.save());

    const onRotate = () => { if (!game.paused()) handle(R.hiddenTrigger(state, 'h_rotate', 0.3)); };
    if (screen.orientation) screen.orientation.addEventListener('change', onRotate);
    else window.addEventListener('orientationchange', onRotate);
  }

  // 앱을 닫아 둔 동안 커피 충전 (최대치까지)
  function offlineCatchUp() {
    const away = (Date.now() - (state.meta.savedAt || Date.now())) / 1000;
    if (away < 10) return;
    const L = state.life;
    const max = E.coffeeMax(state);
    const gain = Math.floor((away + L.coffeeT) / E.coffeeRegen(state));
    if (L.coffee < max && gain > 0) {
      L.coffee = Math.min(max, L.coffee + gain);
      S.toast(`☕ 쉬는 동안 커피가 충전됐어요 (${L.coffee}/${max})`);
    }
    L.stress = Math.max(0, L.stress - away * E.stressDecay);
  }

  // ── 시작 ───────────────────────────────────────────
  function boot() {
    G.audio.setMuted(!!state.meta.muted);
    G.hud.init();
    G.office.init();
    bindActions();
    offlineCatchUp();
    G.hud.render(state);
    if (!state.meta.tutorial) {
      S.intro(() => { state.meta.tutorial = true; game.save(); });
    }
    requestAnimationFrame(frame);

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  boot();
})(globalThis.G);
