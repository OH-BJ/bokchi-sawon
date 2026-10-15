// 밸런스 수식은 전부 여기에. 수치 조정은 이 파일만 고치면 된다.
(function (G) {
  const U = G.U;
  const lv = (s, id) => s.up[id] || 0;

  const E = {
    // 현재 직급 → 다음 직급까지 필요한 실적
    rankSpan(rank) {
      const r = Math.min(rank, G.MAX_RANK - 1);
      return G.RANKS[r + 1].need - G.RANKS[r].need;
    },

    maxTier(s) {
      return Math.min(G.MAX_RANK, s.life.rank + lv(s, 'variety'));
    },
    availableTasks(s) {
      const t = E.maxTier(s);
      return G.TASKS.filter((x) => x.tier <= t);
    },
    availableTraps(s) {
      return G.TRAPS.filter((x) => x.tier <= s.life.rank);
    },
    // 높은 업무일수록 잘 뜬다 (상위 3종 위주)
    taskWeights(tasks) {
      const top = tasks.length - 1;
      return tasks.map((t, i) => ({ t, w: i === top ? 5 : i === top - 1 ? 3 : i === top - 2 ? 1.5 : 0.4 }));
    },
    // 화면에 뜨는 업무의 평균 가치 (등장 가중치 반영)
    avgTaskValue(s) {
      const ws = E.taskWeights(E.availableTasks(s));
      const tot = ws.reduce((a, x) => a + x.w, 0);
      return ws.reduce((a, x) => a + x.w * E.taskValue(s, x.t), 0) / tot;
    },
    bestTaskValue(s) {
      const tasks = E.availableTasks(s);
      return E.taskValue(s, tasks[tasks.length - 1]);
    },
    taskValue(s, task) {
      return task.value * Math.pow(1.3, lv(s, 'skill')) * (s.life.fever > 0 ? 2 : 1);
    },

    maxTasks(s) { return 3 + lv(s, 'multi'); },
    spawnInterval(s) { return s.life.fever > 0 ? 0.28 : 1.3 * Math.pow(0.88, lv(s, 'multi')); },
    taskLife: 6,
    trapChance: 0.15,

    stressPerTap(s) {
      if (s.life.fever > 0) return 0;
      return 1.4 * Math.pow(0.9, lv(s, 'mental')) * (1 + 0.06 * s.life.rank);
    },
    stressDecay: 0.35,

    // 자동 업무 = 평균 업무를 초당 (레벨 × 0.06)개 대신 처리. 직접 터치(초당 약 1.2개)보다 약하게.
    autoTasksPerSec(s) { return lv(s, 'auto') * 0.06; },
    autoRate(s) { return E.autoTasksPerSec(s) * E.avgTaskValue(s) / (s.life.fever > 0 ? 2 : 1); },

    coffeeMax(s) { return 3 + lv(s, 'coffee'); },
    coffeeRegen(s) { return 45 - 4 * lv(s, 'coffee'); },

    restCooldown(s) { return 28 - 3 * lv(s, 'rest'); },
    restRelief(s) { return 30 + 5 * lv(s, 'rest'); },
    restDeathP: 0.08,

    projectChance(s, p, miniBonus = 0) {
      const deaths = s.projDeaths[p.id] || 0;
      return U.clamp(p.base + 0.1 * deaths + 0.03 * lv(s, 'plan') + miniBonus, 0.05, 0.95);
    },
    // 프로젝트/이벤트 보상은 '최고 업무 N번' 기준 → 업그레이드가 곧 진행 속도
    projectReward(s, p) { return p.reward * 100 * E.bestTaskValue(s) / (s.life.fever > 0 ? 2 : 1); },

    eventPerf(s, frac) { return frac * 100 * E.bestTaskValue(s) * (1 + 0.15 * lv(s, 'social')) / (s.life.fever > 0 ? 2 : 1); },
    eventMoney(s, m) { return m > 0 ? Math.round(m * (1 + 0.15 * lv(s, 'social')) * (1 + 0.5 * s.life.rank)) : m; },
    eventDeathMult(s) { return Math.pow(0.85, lv(s, 'social')); },
    eventInterval() { return U.rand(28, 50); },
    // 이벤트 위험 선택지 가중치 배율 (난이도)
    eventDeathBase: 1.4,
    // 프로젝트 실패 시 퇴사 확률 추가분 (난이도)
    projectFailExtra: 0.12,

    // 돌발 상황 (부장님 순찰/정적 타임/대표님 등장)
    alertInterval() { return U.rand(45, 80); },
    alertDeathP: 0.6,

    feverInterval(s) { return U.rand(80, 140) * Math.pow(0.9, lv(s, 'payday')); },
    feverDuration(s) { return 12 + 2 * lv(s, 'bonus'); },

    // 20초마다 굴리는 '돌연 퇴사' 확률
    randomHazard: 0.025,
    randomHazardEvery: 20,

    idleLimit: 100,
    petLimit: 7,

    // 같은 사유로 퇴사한 횟수만큼 위험 감소
    resist(s, deathId) { return Math.pow(0.5, s.dex[deathId] || 0); },

    // 퇴직금 정산서. 항목별로 돌려준다 (퇴사 화면에 그대로 표시)
    deathPay(s, isNew, dexAfter) {
      const L = s.life;
      const r = L.rank;
      const lines = [
        ['기본 퇴직금', Math.floor(1.2 + 1.0 * Math.pow(1 + r, 1.5))],
        ['근속 수당', Math.floor(1.5 * Math.sqrt(L.time / 10) * (1 + 0.5 * r))],
        ['신규 퇴사 사유 발견', isNew ? 4 * (1 + r) : 0],
        ['돌발 상황 대처', Math.floor(L.bonus.alert)],
        ['월급 봉투', Math.floor(L.bonus.fever)],
      ];
      // 도감 10개마다 마일스톤 보너스
      if (isNew && dexAfter % 10 === 0) lines.push([`📖 도감 ${dexAfter}개 달성`, E.dexMilestone(dexAfter)]);
      const items = lines.filter(([, v]) => v > 0);
      return { items, total: items.reduce((a, [, v]) => a + v, 0) };
    },
    dexMilestone(n) { return 2 * n; },
    alertBonus(s) { return 1 + s.life.rank; },
    feverBonus(s) { return 1 + s.life.rank; },

    upgradeCost(id, level) {
      const u = G.UPGRADE_BY_ID[id];
      return Math.floor(u.base * Math.pow(u.growth, level));
    },
  };

  G.econ = E;
})(globalThis.G);
