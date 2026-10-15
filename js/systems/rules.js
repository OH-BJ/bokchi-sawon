// 게임 규칙. DOM에 의존하지 않는다. tick()은 UI가 처리할 신호(signal) 목록을 돌려준다.
(function (G) {
  const U = G.U;
  const E = G.econ;

  // 테스트/시뮬레이션에서 바꿀 수 있는 현재 시각
  G.clock = () => new Date();

  const R = {};

  // ── 진행 ────────────────────────────────────────────
  R.addPerf = function (s, amount, out) {
    const L = s.life;
    L.perf += amount;
    while (L.rank < G.MAX_RANK && L.perf >= G.RANKS[L.rank + 1].need) {
      L.rank++;
      const first = L.rank > s.stats.bestRank;
      const bonus = Math.floor(G.RANKS[L.rank].bonus * (first ? 1 : 0.2));
      s.money += bonus;
      s.stats.promotions++;
      if (first) s.stats.bestRank = L.rank;
      out.push({ type: 'promote', rank: L.rank, bonus, first });
      if (L.rank === G.MAX_RANK) {
        out.push({ type: 'ending', id: 'chairman' });
        break;
      }
    }
  };

  R.addStress = function (s, amount, out) {
    const L = s.life;
    L.stress = U.clamp(L.stress + amount, 0, 100);
    if (L.stress >= 100) out.push({ type: 'death', id: 'bo_' + Math.min(L.rank, 7) });
  };

  // 사망 판정 공통: 기본 확률 × 내성
  R.rollDeath = function (s, deathId, p) {
    return U.chance(p * E.resist(s, deathId));
  };

  R.touch = function (s) { s.life.idleT = 0; };

  // ── 매 프레임 ────────────────────────────────────────
  R.tick = function (s, dt) {
    const out = [];
    const L = s.life;
    L.time += dt;
    s.stats.playTime += dt;

    // 커피 충전
    const cmax = E.coffeeMax(s);
    if (L.coffee < cmax) {
      L.coffeeT += dt;
      const need = E.coffeeRegen(s);
      while (L.coffeeT >= need && L.coffee < cmax) { L.coffeeT -= need; L.coffee++; }
    } else L.coffeeT = 0;

    if (L.restCd > 0) L.restCd = Math.max(0, L.restCd - dt);
    if (L.fever > 0) {
      L.fever = Math.max(0, L.fever - dt);
      if (L.fever === 0) out.push({ type: 'feverEnd' });
    }

    L.stress = Math.max(0, L.stress - E.stressDecay * dt);

    const auto = E.autoRate(s);
    if (auto > 0) R.addPerf(s, auto * dt, out);

    // 이벤트
    L.nextEvent -= dt;
    if (L.nextEvent <= 0) {
      L.nextEvent = E.eventInterval();
      const ev = R.pickEvent(s);
      if (ev) out.push({ type: 'event', id: ev.id });
    }

    // 월급날 피버 봉투
    L.nextFever -= dt;
    if (L.nextFever <= 0) {
      L.nextFever = E.feverInterval(s);
      out.push({ type: 'feverSpawn' });
    }

    // 돌연 퇴사
    L.nextHazard -= dt;
    if (L.nextHazard <= 0) {
      L.nextHazard = E.randomHazardEvery;
      if (L.time > 40 && U.chance(E.randomHazard)) {
        const id = U.pick(G.RANDOM_DEATHS);
        if (R.rollDeath(s, id, 1)) out.push({ type: 'death', id });
      }
    }

    // 돌발 상황
    if (L.alert) {
      L.alert.left -= dt;
      if (L.alert.left <= 0) out.push(...R.alertTimeout(s));
    } else if (L.time > 30) {
      L.nextAlert -= dt;
      if (L.nextAlert <= 0) {
        L.nextAlert = E.alertInterval();
        out.push(R.startAlert(s));
      }
    }

    // 방치
    L.idleT += dt;
    if (L.idleT > E.idleLimit) {
      L.idleT = 0;
      if (R.rollDeath(s, 'care_idle', 1)) out.push({ type: 'death', id: 'care_idle' });
    }

    return out;
  };

  // ── 업무 ────────────────────────────────────────────
  R.tapTask = function (s, task) {
    const out = R.alertTouch(s, true);
    if (out.some((x) => x.type === 'death')) return { gain: 0, out };
    const gain = E.taskValue(s, task);
    R.addPerf(s, gain, out);
    R.addStress(s, E.stressPerTap(s), out);
    return { gain, out };
  };

  R.tapTrap = function (s, trap) {
    const out = R.alertTouch(s, true);
    if (out.some((x) => x.type === 'death')) return { gain: 0, out };
    if (trap.risk === 'tap' && R.rollDeath(s, trap.death, trap.p)) {
      out.push({ type: 'death', id: trap.death });
      return { gain: 0, out };
    }
    const gain = E.bestTaskValue(s) * trap.mult;
    R.addPerf(s, gain, out);
    R.addStress(s, E.stressPerTap(s) * 3, out);
    return { gain, out };
  };

  R.expireTrap = function (s, trap) {
    if (trap.risk === 'expire' && R.rollDeath(s, trap.death, trap.p)) return [{ type: 'death', id: trap.death }];
    return [];
  };

  // ── 돌발 상황 ───────────────────────────────────────
  // patrol: 부장님 순찰 (제한시간 안에 업무 1개) / ceo: 대표님 등장 (업무 2개, 과장부터)
  // silence: 정적 타임 (제한시간 동안 아무것도 누르면 안 됨)
  R.ALERTS = {
    patrol:  { icon: '👀', title: '부장님 순찰 중!', help: '바쁜 척! 업무를 처리해라', need: 1, time: 3,   death: 'al_patrol' },
    ceo:     { icon: '🕴️', title: '대표님 등장!',    help: '업무 2개를 처리해라',       need: 2, time: 3.2, death: 'al_ceo' },
    silence: { icon: '🤫', title: '쉿... 정적 타임',  help: '아무것도 누르지 마!',       need: 0, time: 2.5, death: 'al_silence' },
  };
  R.startAlert = function (s) {
    const L = s.life;
    const kinds = ['patrol', 'silence'];
    if (L.rank >= 3) kinds.push('ceo');
    const kind = U.pick(kinds);
    L.alert = { kind, left: R.ALERTS[kind].time, count: 0 };
    return { type: 'alert', kind };
  };
  R.endAlert = function (s, ok) {
    const kind = s.life.alert.kind;
    s.life.alert = null;
    return { type: 'alertEnd', kind, ok };
  };
  // 무언가를 눌렀을 때. isTask: 업무 아이콘인지
  R.alertTouch = function (s, isTask) {
    const A = s.life.alert;
    if (!A) return [];
    const def = R.ALERTS[A.kind];
    if (A.kind === 'silence') {
      const out = [R.endAlert(s, false)];
      if (R.rollDeath(s, def.death, E.alertDeathP)) out.push({ type: 'death', id: def.death });
      else R.addStress(s, 20, out);
      return out;
    }
    if (!isTask) return [];
    A.count++;
    if (A.count < def.need) return [];
    const out = [R.endAlert(s, true)];
    R.addPerf(s, E.bestTaskValue(s) * 8, out);
    return out;
  };
  R.alertTimeout = function (s) {
    const A = s.life.alert;
    const def = R.ALERTS[A.kind];
    if (A.kind === 'silence') {
      const out = [R.endAlert(s, true)];
      s.life.stress = Math.max(0, s.life.stress - 15);
      return out;
    }
    const out = [R.endAlert(s, false)];
    if (R.rollDeath(s, def.death, E.alertDeathP)) out.push({ type: 'death', id: def.death });
    else R.addStress(s, 25, out);
    return out;
  };

  R.startFever = function (s) {
    s.life.fever = E.feverDuration(s);
  };

  // ── 휴식 ────────────────────────────────────────────
  R.rest = function (s) {
    const L = s.life;
    if (L.restCd > 0) return null;
    const out = R.alertTouch(s, false);
    if (out.some((x) => x.type === 'death')) return { spot: U.pick(G.REST_SPOTS), out };
    const spot = U.pick(G.REST_SPOTS);
    L.restCd = E.restCooldown(s);
    if (L.stress < 15 && R.rollDeath(s, 'care_rest_spam', 0.5)) {
      out.push({ type: 'death', id: 'care_rest_spam' });
      return { spot, out };
    }
    const id = U.pick(spot.deaths);
    if (R.rollDeath(s, id, E.restDeathP)) {
      out.push({ type: 'death', id });
      return { spot, out };
    }
    L.stress = Math.max(0, L.stress - E.restRelief(s));
    return { spot, out };
  };

  // ── 캐릭터 쓰다듬기 ──────────────────────────────────
  R.pet = function (s, now) {
    const L = s.life;
    const noise = R.alertTouch(s, false);
    if (noise.length) return noise;
    L.pets = L.pets.filter((t) => now - t < 3000);
    L.pets.push(now);
    L.stress = Math.max(0, L.stress - 1);
    if (L.pets.length >= E.petLimit) {
      L.pets = [];
      if (R.rollDeath(s, 'care_pet', 1)) return [{ type: 'death', id: 'care_pet' }];
    }
    return [];
  };

  // ── 숨겨진 상호작용 (시계, 창문, 선인장, 화면 회전, 음소거) ──
  R.HIDDEN_TAPS = { h_clock: 10, h_window: 7, h_plant: 3 };
  R.hiddenTap = function (s, id) {
    const L = s.life;
    const noise = R.alertTouch(s, false);
    if (noise.length) return noise;
    L.hiddenTaps[id] = (L.hiddenTaps[id] || 0) + 1;
    if (L.hiddenTaps[id] >= R.HIDDEN_TAPS[id]) {
      L.hiddenTaps[id] = 0;
      if (R.rollDeath(s, id, 1)) return [{ type: 'death', id }];
    }
    return [];
  };
  R.hiddenTrigger = function (s, id, p) {
    if (s.life.time < 5) return [];
    return R.rollDeath(s, id, p) ? [{ type: 'death', id }] : [];
  };

  // ── 프로젝트 ────────────────────────────────────────
  R.availableProjects = function (s) {
    return G.PROJECTS.filter((p) => p.rank <= s.life.rank);
  };

  R.resolveProject = function (s, pid, miniBonus) {
    const p = G.PROJECT_BY_ID[pid];
    const L = s.life;
    const out = [];
    if (L.coffee < 1) return null;
    L.coffee--;
    const chance = E.projectChance(s, p, miniBonus);
    if (U.chance(chance)) {
      const gain = E.projectReward(s, p);
      R.addPerf(s, gain, out);
      return { success: true, gain, chance, out };
    }
    if (U.chance(Math.min(0.95, p.fail + E.projectFailExtra))) {
      // 아직 못 본 사유를 우선
      const fresh = p.deaths.filter((id) => !s.dex[id]);
      const id = U.pick(fresh.length ? fresh : p.deaths);
      s.projDeaths[p.id] = (s.projDeaths[p.id] || 0) + 1;
      out.push({ type: 'death', id });
      return { success: false, death: id, chance, out };
    }
    R.addStress(s, 35, out);
    return { success: false, chance, out };
  };

  // ── 이벤트 ──────────────────────────────────────────
  R.pickEvent = function (s) {
    const L = s.life;
    const now = G.clock();
    const day = now.getDay(), hour = now.getHours();
    const special = (id, ok) => {
      if (ok && !L.specialDone[id]) { L.specialDone[id] = true; return G.EVENT_BY_ID[id]; }
      return null;
    };
    const sp = special('dawn', hour >= 2 && hour < 5)
      || special('monday', day === 1)
      || special('friday', day === 5 && hour === 17);
    if (sp) return sp;

    // 엔딩 이벤트는 조건이 맞으면 일정 확률로 우선 등장
    for (const id of ['dream', 'chicken']) {
      const ev = G.EVENT_BY_ID[id];
      if (!s.endings[id] && ev.cond(s) && U.chance(0.35)) return ev;
    }

    const pool = G.EVENTS.filter((e) =>
      !e.special && !e.cond && e.min <= L.rank && L.rank <= e.max && !L.recentEvents.includes(e.id));
    if (!pool.length) return null;
    const ev = U.pick(pool);
    L.recentEvents.push(ev.id);
    if (L.recentEvents.length > 6) L.recentEvents.shift();
    return ev;
  };

  R.resolveChoice = function (s, evId, idx) {
    const ev = G.EVENT_BY_ID[evId];
    const choice = ev.choices[idx];
    const mult = E.eventDeathMult(s);
    const weighted = choice.o.map((o) => ({ o, w: o.death ? o.w * E.eventDeathBase * mult * E.resist(s, o.death) : o.w }));
    const o = U.weighted(weighted).o;
    const out = [];
    const res = { o, out, perf: 0, money: 0 };
    if (o.death) { out.push({ type: 'death', id: o.death }); return res; }
    if (o.ending) { out.push({ type: 'ending', id: o.ending }); return res; }
    if (o.perf) { res.perf = E.eventPerf(s, o.perf); R.addPerf(s, res.perf, out); }
    if (o.money) { res.money = E.eventMoney(s, o.money); s.money = Math.max(0, s.money + res.money); }
    if (o.coffee) s.life.coffee += o.coffee;
    if (o.stress) R.addStress(s, o.stress, out);
    if (o.vlog) {
      s.stats.vlog += o.vlog;
      if (s.stats.vlog >= 3 && !s.endings.youtuber) out.push({ type: 'ending', id: 'youtuber' });
    }
    return res;
  };

  // ── 퇴사 / 엔딩 ─────────────────────────────────────
  R.die = function (s, deathId) {
    const L = s.life;
    const isNew = !s.dex[deathId];
    const money = E.deathMoney(s, isNew);
    s.dex[deathId] = (s.dex[deathId] || 0) + 1;
    s.money += money;
    s.stats.deaths++;
    return { id: deathId, isNew, money, rank: L.rank, time: L.time, perf: L.perf, life: L.n };
  };

  R.reachEnding = function (s, id) {
    const first = !s.endings[id];
    if (first) s.endings[id] = Date.now();
    const money = first ? 500 * (1 + s.life.rank) : 50;
    s.money += money;
    return { id, first, money };
  };

  R.dexRatio = function (s) {
    const found = G.DEATHS.filter((d) => s.dex[d.id]).length;
    return found / G.DEATHS.length;
  };

  // ── 자기계발 ────────────────────────────────────────
  R.canBuy = function (s, id) {
    const u = G.UPGRADE_BY_ID[id];
    const level = s.up[id];
    return level < u.max && s.money >= E.upgradeCost(id, level);
  };
  R.buy = function (s, id) {
    if (!R.canBuy(s, id)) return false;
    s.money -= E.upgradeCost(id, s.up[id]);
    s.up[id]++;
    if (id === 'coffee') s.life.coffee++;
    return true;
  };

  G.rules = R;
})(globalThis.G);
