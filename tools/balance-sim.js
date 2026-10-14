// 밸런스 시뮬레이터: node tools/balance-sim.js [회차수]
// 게임과 동일한 data/systems 코드를 불러와 '평범한 플레이어'를 흉내 낸다.
const path = require('path');
const root = path.join(__dirname, '..', 'js');
[
  'core/ns.js', 'core/util.js',
  'data/ranks.js', 'data/tasks.js', 'data/upgrades.js', 'data/projects.js',
  'data/deaths.js', 'data/events.js', 'data/endings.js',
  'systems/economy.js', 'systems/state.js', 'systems/rules.js',
].forEach((f) => require(path.join(root, f)));

const G = globalThis.G;
const U = G.U, E = G.econ, R = G.rules;
G.clock = () => new Date(2026, 9, 14, 12, 0); // 수요일 정오 (특수 이벤트 제외)

const RUNS = Number(process.argv[2] || 30);
const DT = 0.1;
const TAP_RATE = 1.6;       // 초당 터치 수
const MINI_BONUS = 0.1;     // 미니게임 평균 보너스
const OVERHEAD = 1.15;      // 모달/퇴사 화면/고민 시간 보정
const LIMIT = 6 * 3600;

function avgTaskValue(s) {
  const ws = E.taskWeights(E.availableTasks(s));
  const tot = ws.reduce((a, x) => a + x.w, 0);
  return ws.reduce((a, x) => a + x.w * E.taskValue(s, x.t), 0) / tot;
}

function knownRisky(s, choice) {
  return choice.o.some((o) => o.death && s.dex[o.death]);
}

function buyUpgrades(s) {
  let bought = true;
  while (bought) {
    bought = false;
    const opts = G.UPGRADES.filter((u) => R.canBuy(s, u.id))
      .map((u) => ({ id: u.id, cost: E.upgradeCost(u.id, s.up[u.id]) * (u.id === 'para' ? 0.5 : 1) }))
      .sort((a, b) => a.cost - b.cost);
    if (opts.length) { R.buy(s, opts[0].id); bought = true; }
  }
}

function runOne() {
  const s = G.state.newState();
  const firstRank = Array(G.RANKS.length).fill(null);
  firstRank[0] = 0;
  let t = 0, tapAcc = 0, chairmanAt = null, deathsAtChairman = 0, dexAtChairman = 0;
  const lifeLens = [];

  const handle = (signals) => {
    for (const sig of signals) {
      if (sig.type === 'promote' && firstRank[sig.rank] == null) firstRank[sig.rank] = t;
      if (sig.type === 'feverSpawn' && U.chance(0.8)) R.startFever(s);
      if (sig.type === 'alert') {
        // 사람의 돌발 상황 성공률 가정
        const ok = U.chance({ patrol: 0.9, ceo: 0.8, silence: 0.85 }[sig.kind]);
        let r;
        if (sig.kind === 'silence') r = ok ? R.alertTimeout(s) : R.alertTouch(s, false);
        else if (ok) { r = []; for (let i = 0; i < 2 && s.life.alert; i++) r.push(...R.alertTouch(s, true)); }
        else r = R.alertTimeout(s);
        if (handle(r)) return true;
      }
      if (sig.type === 'event') {
        const ev = G.EVENT_BY_ID[sig.id];
        const safe = ev.choices.map((c, i) => i).filter((i) => !knownRisky(s, ev.choices[i]));
        const idx = U.pick(safe.length ? safe : ev.choices.map((c, i) => i));
        const r = R.resolveChoice(s, sig.id, idx);
        if (handle(r.out)) return true;
      }
      if (sig.type === 'ending') {
        if (sig.id === 'chairman' && chairmanAt == null) {
          chairmanAt = t; deathsAtChairman = s.stats.deaths; dexAtChairman = R.dexRatio(s);
        }
        R.reachEnding(s, sig.id);
        if (sig.id === 'chairman') R.die(s, 'retire');
        endLife(); return true;
      }
      if (sig.type === 'death') { R.die(s, sig.id); endLife(); return true; }
    }
    return false;
  };
  const endLife = () => { lifeLens.push(s.life.time); buyUpgrades(s); G.state.newLife(s); };

  while (t < LIMIT && chairmanAt == null) {
    t += DT * OVERHEAD;
    if (handle(R.tick(s, DT))) continue;
    R.touch(s);
    const L = s.life;

    // 휴식
    if (L.stress > 65 && L.restCd === 0) { const r = R.rest(s); if (handle(r.out)) continue; }

    // 프로젝트
    const projs = R.availableProjects(s);
    if (L.coffee >= 1 && projs.length) {
      const best = projs.map((p) => ({ p, c: E.projectChance(s, p, MINI_BONUS) })).sort((a, b) => b.c - a.c)[0];
      if (best.c >= 0.6 || L.coffee >= E.coffeeMax(s)) {
        const r = R.resolveProject(s, best.p.id, MINI_BONUS);
        if (handle(r.out)) continue;
      }
    }

    // 업무 터치
    if (L.stress > 88 && L.fever === 0) continue;
    const rate = Math.min(TAP_RATE, 1 / E.spawnInterval(s));
    tapAcc += rate * DT;
    while (tapAcc >= 1) {
      tapAcc--;
      if (U.chance(E.trapChance)) {
        const traps = E.availableTraps(s);
        const trap = U.pick(traps);
        const known = s.dex[trap.death];
        const r = trap.risk === 'tap'
          ? (known ? { out: [] } : R.tapTrap(s, trap))
          : R.tapTrap(s, trap);
        if (handle(r.out)) break;
      } else {
        const out = [];
        R.addPerf(s, avgTaskValue(s), out);
        R.addStress(s, E.stressPerTap(s), out);
        if (handle(out)) break;
      }
    }
  }
  if (process.env.DBG) console.log(JSON.stringify(s.up), "money", Math.floor(s.money), "deaths", s.stats.deaths);
  return { firstRank, chairmanAt, deaths: deathsAtChairman || s.stats.deaths, dex: dexAtChairman || R.dexRatio(s), lifeLens };
}

const results = [];
for (let i = 0; i < RUNS; i++) results.push(runOne());

const med = (arr) => {
  const a = arr.filter((x) => x != null).sort((x, y) => x - y);
  return a.length ? a[Math.floor(a.length / 2)] : null;
};
const m = (sec) => (sec == null ? '  -  ' : (sec / 60).toFixed(1).padStart(5) + '분');

console.log(`\n시뮬레이션 ${RUNS}회 (중앙값)\n`);
G.RANKS.forEach((r, i) => {
  const times = results.map((x) => x.firstRank[i]);
  const reached = times.filter((x) => x != null).length;
  console.log(`${r.name.padEnd(3)} 첫 도달: ${m(med(times))}   (${reached}/${RUNS})`);
});
console.log(`\n회장 도달 시 퇴사 횟수: ${med(results.map((x) => x.deaths))}`);
console.log(`회장 도달 시 도감 달성률: ${(med(results.map((x) => x.dex)) * 100).toFixed(0)}%`);
const lens = results.flatMap((x) => x.lifeLens.slice(0, 5));
console.log(`초반 5생애 평균 수명: ${(lens.reduce((a, b) => a + b, 0) / lens.length).toFixed(0)}초`);
const all = results.flatMap((x) => x.lifeLens);
console.log(`전체 평균 수명: ${(all.reduce((a, b) => a + b, 0) / all.length).toFixed(0)}초, 총 퇴사 데이터 ${G.DEATHS.length}종`);
