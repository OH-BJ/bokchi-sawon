(function (G) {
  const SAVE_VERSION = 1;

  function newState() {
    const s = {
      v: SAVE_VERSION,
      meta: { created: Date.now(), savedAt: Date.now(), muted: false, tutorial: false },
      money: 0,
      up: Object.fromEntries(G.UPGRADES.map((u) => [u.id, 0])),
      dex: {},          // 퇴사 사유 id → 횟수
      endings: {},      // 엔딩 id → 달성 시각
      projDeaths: {},   // 프로젝트 id → 그 프로젝트로 퇴사한 횟수
      stats: { deaths: 0, playTime: 0, bestRank: 0, vlog: 0, promotions: 0 },
      life: null,
    };
    G.state.newLife(s);
    return s;
  }

  function newLife(s) {
    const startRank = Math.min(s.up.para || 0, G.MAX_RANK - 1);
    const n = s.life ? s.life.n + 1 : 1;
    s.life = {
      n,
      rank: startRank,
      perf: G.RANKS[startRank].need,
      stress: 0,
      coffee: G.econ.coffeeMax(s),
      coffeeT: 0,
      time: 0,
      fever: 0,
      restCd: 0,
      idleT: 0,
      nextEvent: n === 1 ? 25 : G.econ.eventInterval(),
      nextFever: G.econ.feverInterval(s),
      nextHazard: G.econ.randomHazardEvery,
      nextAlert: G.econ.alertInterval(),
      alert: null,
      recentEvents: [],
      specialDone: {},
      pets: [],
      hiddenTaps: {},
    };
  }

  function migrate(s) {
    if (!s || typeof s !== 'object' || !s.life) return null;
    // 새로 추가된 업그레이드/필드 보정
    for (const u of G.UPGRADES) if (s.up[u.id] == null) s.up[u.id] = 0;
    const fresh = { stats: { deaths: 0, playTime: 0, bestRank: 0, vlog: 0, promotions: 0 } };
    s.stats = Object.assign({}, fresh.stats, s.stats);
    s.life.specialDone = s.life.specialDone || {};
    s.life.hiddenTaps = s.life.hiddenTaps || {};
    s.life.pets = [];
    if (s.life.nextAlert == null) s.life.nextAlert = G.econ.alertInterval();
    s.life.alert = null;
    s.v = SAVE_VERSION;
    return s;
  }

  G.state = { newState, newLife, migrate };
})(globalThis.G);
