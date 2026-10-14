(function (G) {
  const U = G.U, E = G.econ;
  const $ = (id) => document.getElementById(id);
  let el = null;
  let lastMood = null;
  let lastMoney = null;

  function init() {
    el = {
      badge: $('rank-badge'), life: $('hud-life'), money: $('hud-money'),
      perfFill: $('perf-fill'), perfText: $('perf-text'),
      stressFill: $('stress-fill'), stressText: $('stress-text'),
      coffee: $('coffee-row'), time: $('life-time'),
      restCd: $('rest-cd'), restLabel: $('rest-label'), upgradeDot: $('upgrade-dot'),
      bokchi: $('bokchi'),
    };
  }

  function mood(s) {
    const st = s.life.stress;
    if (G.ui && G.ui.forcedMood) return G.ui.forcedMood;
    if (st >= 85) return 'panic';
    if (st >= 60) return 'stress';
    if (s.life.fever > 0) return 'happy';
    return 'normal';
  }

  function render(s) {
    const L = s.life;
    const r = G.RANKS[L.rank];
    el.badge.textContent = r.name;
    el.badge.style.background = r.color;
    el.life.textContent = `${L.n}대 복치`;

    if (lastMoney !== null && Math.floor(s.money) > lastMoney) {
      el.money.parentElement.classList.remove('bump');
      void el.money.offsetWidth;
      el.money.parentElement.classList.add('bump');
    }
    lastMoney = Math.floor(s.money);
    el.money.textContent = U.fmt(s.money);

    if (L.rank < G.MAX_RANK) {
      const lo = r.need, hi = G.RANKS[L.rank + 1].need;
      const pct = U.clamp((L.perf - lo) / (hi - lo), 0, 1) * 100;
      el.perfFill.style.width = pct + '%';
      el.perfText.textContent = `${U.fmt(L.perf)} / ${U.fmt(hi)} → ${G.RANKS[L.rank + 1].name}`;
    } else {
      el.perfFill.style.width = '100%';
      el.perfText.textContent = '정상에 올랐다';
    }

    el.stressFill.style.width = L.stress + '%';
    el.stressText.textContent = Math.floor(L.stress);
    el.stressFill.parentElement.classList.toggle('danger', L.stress >= 80);

    const max = E.coffeeMax(s);
    let html = '';
    for (let i = 0; i < Math.max(max, L.coffee); i++) html += `<span class="${i < L.coffee ? '' : 'empty'}">☕</span>`;
    if (L.coffee < max) html += `<small>${Math.ceil(E.coffeeRegen(s) - L.coffeeT)}초</small>`;
    el.coffee.innerHTML = html;
    el.time.textContent = `근속 ${U.fmtTime(L.time)}`;

    const cd = L.restCd, cdMax = E.restCooldown(s);
    el.restCd.style.width = cd > 0 ? (cd / cdMax) * 100 + '%' : '0';
    el.restLabel.textContent = cd > 0 ? `${Math.ceil(cd)}초` : '휴식';
    el.restCd.parentElement.classList.toggle('disabled', cd > 0);
    el.restCd.parentElement.classList.toggle('glow', cd === 0 && L.stress >= 70);

    el.upgradeDot.classList.toggle('hidden', !G.UPGRADES.some((u) => G.rules.canBuy(s, u.id)));

    const m = mood(s);
    if (m !== lastMood) {
      el.bokchi.innerHTML = G.character.svg(m, { id: 'main' });
      el.bokchi.classList.toggle('panic', m === 'panic');
      lastMood = m;
    }
  }

  G.hud = { init, render, refreshMood() { lastMood = null; } };
})(globalThis.G);
