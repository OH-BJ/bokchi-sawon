// 모달 공통 + 각 화면
(function (G) {
  const U = G.U, E = G.econ, R = G.rules;

  // ── 모달 공통 ────────────────────────────────────────
  let current = null;

  function open({ title = '', body = '', foot = '', closable = true, onClose = null, cls = '' }) {
    close(true);
    const root = document.getElementById('modal-root');
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `
      <div class="modal ${cls}" role="dialog" aria-modal="true">
        ${title ? `<div class="modal-head"><h2>${title}</h2>${closable ? '<button class="close" data-close aria-label="닫기">✕</button>' : ''}</div>` : ''}
        <div class="modal-body"></div>
        ${foot ? '<div class="modal-foot"></div>' : ''}
      </div>`;
    const bodyEl = ov.querySelector('.modal-body');
    const footEl = ov.querySelector('.modal-foot');
    typeof body === 'string' ? (bodyEl.innerHTML = body) : bodyEl.appendChild(body);
    if (footEl) typeof foot === 'string' ? (footEl.innerHTML = foot) : footEl.appendChild(foot);
    root.appendChild(ov);
    const m = { ov, body: bodyEl, foot: footEl, closable, onClose };
    ov.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) { G.audio.click(); close(); }
    });
    current = m;
    G.game.setModal(true);
    return m;
  }

  function close(silent) {
    if (!current) return;
    const m = current;
    current = null;
    m.ov.remove();
    G.game.setModal(false);
    if (!silent && m.onClose) m.onClose();
  }

  // 키보드: 1~4 선택지, Esc 닫기
  document.addEventListener('keydown', (e) => {
    if (!current) return;
    if (e.key === 'Escape' && current.closable) close();
    const k = current.ov.querySelector(`[data-key="${e.key}"]`);
    if (k && !k.disabled) { e.preventDefault(); k.click(); }
  });

  G.modal = { open, close, isOpen: () => !!current };

  // ── 공용 조각 ────────────────────────────────────────
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const gainLine = (r) => {
    const parts = [];
    if (r.perf) parts.push(`<span class="p">실적 +${U.fmt(r.perf)}</span>`);
    if (r.money) parts.push(`<span class="m">퇴직금 ${r.money > 0 ? '+' : ''}${U.fmt(r.money)}</span>`);
    if (r.stress > 0) parts.push(`<span class="s">스트레스 +${r.stress}</span>`);
    if (r.stress < 0) parts.push(`<span class="r">스트레스 ${r.stress}</span>`);
    if (r.coffee) parts.push(`<span class="r">커피 +${r.coffee}</span>`);
    return parts.length ? `<div class="gain-line">${parts.join('')}</div>` : '';
  };

  const S = {};

  // ── 인트로 ──────────────────────────────────────────
  S.intro = function (onDone) {
    const m = open({
      title: '🐟 개복치 신입사원',
      closable: false,
      body: `
        <div class="intro">
          <div style="width:120px;margin:0 auto 8px">${G.character.svg('happy', { id: 'intro' })}</div>
          <p><b>복치</b>는 오늘 입사한 신입사원입니다.<br>
          그리고 <b>세상에서 가장 예민한 직장인</b>입니다.</p>
          <p>사소한 일로 퇴사합니다. 정말 사소한 일로.<br>
          하지만 퇴사할수록 강해집니다.</p>
          <ul>
            <li>떠다니는 <b>업무</b>를 터치해 실적을 쌓고 승진하세요.</li>
            <li><b>스트레스</b>가 100이 되면 번아웃 퇴사. 틈틈이 <b>휴식</b>!</li>
            <li><b>프로젝트</b>는 한방이 크지만, 실패하면...</li>
            <li>퇴사하면 <b>퇴직금</b>으로 <b>자기계발</b>을 하고 재입사!</li>
            <li>빨갛게 테두리 친 업무는 <b>수상한 업무</b>입니다.</li>
          </ul>
          <p class="muted center">목표: 인턴에서 <b>회장</b>까지. 그리고 퇴사 도감 완성.</p>
        </div>`,
      foot: '<button class="btn block" data-key="1" data-go>출근하기</button>',
    });
    m.foot.querySelector('[data-go]').onclick = () => { G.audio.unlock(); G.audio.click(); close(); onDone(); };
  };

  // ── 이벤트 ──────────────────────────────────────────
  S.event = function (s, evId) {
    const ev = G.EVENT_BY_ID[evId];
    G.audio.event();
    const body = h(`<div>
      <div class="event-icon">${ev.icon}</div>
      <div class="event-title">${ev.title}</div>
      <div class="event-text">${ev.text}</div>
      <div class="btn-col"></div>
    </div>`);
    const col = body.querySelector('.btn-col');
    ev.choices.forEach((c, i) => {
      const risky = c.o.some((o) => o.death && s.dex[o.death]);
      const b = h(`<button class="btn choice ${risky ? 'risky' : ''}" data-key="${i + 1}"><span class="k">${i + 1}</span>${c.t}</button>`);
      b.onclick = () => choose(i);
      col.appendChild(b);
    });
    const m = open({ title: '', body, closable: false });

    function choose(i) {
      G.audio.click();
      const before = { stress: s.life.stress, coffee: s.life.coffee };
      const res = R.resolveChoice(s, evId, i);
      const o = res.o;
      if (o.death || o.ending) { close(true); G.game.handle(res.out); return; }
      const shown = {
        perf: res.perf, money: res.money,
        stress: Math.round(s.life.stress - before.stress), coffee: s.life.coffee - before.coffee,
      };
      m.body.innerHTML = `
        <div class="event-icon">${ev.icon}</div>
        <div class="result-box">${o.msg || '별일 없었다.'}${gainLine(shown)}</div>`;
      const ok = h('<button class="btn block" data-key="1" style="margin-top:14px">확인</button>');
      ok.onclick = () => { G.audio.click(); close(); G.game.handle(res.out); };
      m.body.appendChild(ok);
    }
  };

  // ── 프로젝트 ────────────────────────────────────────
  S.projects = function (s) {
    const body = h('<div></div>');
    const L = s.life;
    body.appendChild(h(`<p class="muted center" style="margin-bottom:10px">커피 ☕ 1잔으로 도전. 성공하면 큰 실적, 실패하면... 퇴사할 수도.<br>같은 프로젝트로 퇴사할수록 성공률이 오른다.</p>`));
    G.PROJECTS.forEach((p) => {
      const locked = p.rank > L.rank;
      const ch = E.projectChance(s, p, 0);
      const cls = ch >= 0.7 ? 'hi' : ch >= 0.5 ? 'mid' : 'lo';
      const deaths = s.projDeaths[p.id] || 0;
      const row = h(`<div class="proj ${locked ? 'locked' : ''}">
        <div class="pic">${locked ? '🔒' : p.icon}</div>
        <div class="pinfo">
          <div class="pname">${p.name}</div>
          <div class="pdesc">${locked ? `${G.RANKS[p.rank].name}부터 가능` : p.desc}</div>
          ${locked ? '' : `<div class="pmeta">
            <span>성공률 <span class="chance ${cls}">${Math.round(ch * 100)}%</span>${p.mini ? ' +α' : ''}</span>
            <span>보상 <b>${U.fmt(E.projectReward(s, p))}</b></span>
            ${p.mini ? `<span class="tag">${p.mini === 'timing' ? '🎯 타이밍' : '👆 연타'}</span>` : ''}
            ${deaths ? `<span class="tag">💀×${deaths}</span>` : ''}
          </div>`}
        </div>
        ${locked ? '' : `<button class="btn small" ${L.coffee < 1 ? 'disabled' : ''}>☕ 도전</button>`}
      </div>`);
      const b = row.querySelector('button');
      if (b) b.onclick = () => { G.audio.click(); close(true); S.runProject(s, p); };
      body.appendChild(row);
    });
    open({ title: `📋 프로젝트 <small class="muted">☕ ${L.coffee}잔</small>`, body });
  };

  S.runProject = function (s, p) {
    const finish = (bonus, label) => {
      const res = R.resolveProject(s, p.id, bonus);
      if (!res) { close(); return; }
      if (res.death) { close(true); G.game.handle(res.out); return; }
      const msg = res.success
        ? `<b style="font-size:20px">🎉 성공!</b><br>${p.name} 프로젝트를 해냈다.`
        : `<b style="font-size:20px">😓 실패...</b><br>다행히 퇴사는 면했다.<br>시말서를 썼다.`;
      if (res.success) G.audio.coin(); else G.audio.bad();
      const m = open({
        title: '', closable: false,
        body: `<div class="event-icon">${p.icon}</div>
          ${label ? `<p class="muted center" style="margin-bottom:6px">${label}</p>` : ''}
          <div class="result-box">${msg}${gainLine({ perf: res.success ? res.gain : 0, stress: res.success ? 0 : 35 })}
          <div class="muted" style="margin-top:6px">성공률 ${Math.round(res.chance * 100)}%</div></div>`,
        foot: '<button class="btn block" data-key="1">확인</button>',
      });
      m.foot.querySelector('button').onclick = () => { G.audio.click(); close(); G.game.handle(res.out); };
    };
    if (p.mini) G.minigames[p.mini](s, p, finish);
    else finish(0, '');
  };

  // ── 자기계발 ────────────────────────────────────────
  S.upgrades = function (s, opts = {}) {
    const body = h('<div></div>');
    const render = () => {
      body.innerHTML = `<div class="money-big">💰 ${U.fmt(s.money)}</div>
        <p class="muted center" style="margin-bottom:10px">퇴직금으로 자기계발하면 다음 생에도 유지된다.</p>`;
      G.UPGRADES.forEach((u) => {
        const lvl = s.up[u.id];
        const maxed = lvl >= u.max;
        const cost = E.upgradeCost(u.id, lvl);
        const row = h(`<div class="upg">
          <div class="uic">${u.icon}</div>
          <div class="uinfo"><div class="uname">${u.name}<span class="ulv">Lv.${lvl}${maxed ? ' MAX' : ''}</span></div><div class="udesc">${u.desc}</div></div>
          <button class="btn small ${maxed ? 'ghost' : 'gold'}" ${maxed || s.money < cost ? 'disabled' : ''}>${maxed ? '완료' : '💰 ' + U.fmt(cost)}</button>
        </div>`);
        row.querySelector('button').onclick = () => {
          if (R.buy(s, u.id)) { G.audio.coin(); render(); G.game.save(); }
        };
        body.appendChild(row);
      });
    };
    render();
    if (opts.rejoin) {
      const m = open({ title: '📚 자기계발', body, closable: false, foot: '<button class="btn block" data-key="Enter">🏢 재입사하기</button>' });
      m.foot.querySelector('button').onclick = () => { G.audio.click(); close(); opts.rejoin(); };
    } else {
      open({ title: '📚 자기계발', body });
    }
  };

  // ── 도감 ────────────────────────────────────────────
  const SRC_TABS = [
    ['all', '전체'], ['burnout', '번아웃'], ['project', '프로젝트'], ['event', '이벤트'], ['trap', '함정'],
    ['rest', '휴식'], ['alert', '돌발'], ['random', '돌연'], ['care', '돌봄'], ['hidden', '히든'], ['special', '특수'], ['ending', '🏁 엔딩'],
  ];
  S.dex = function (s) {
    let tab = 'all';
    const body = h('<div></div>');
    const render = () => {
      const found = G.DEATHS.filter((d) => s.dex[d.id]).length;
      const pct = Math.round((found / G.DEATHS.length) * 100);
      const endN = Object.keys(s.endings).length;
      body.innerHTML = `
        <div class="muted">퇴사 도감 <b>${found} / ${G.DEATHS.length}</b> (${pct}%) · 엔딩 <b>${endN} / ${G.ENDINGS.length}</b></div>
        <div class="progress"><div style="width:${pct}%"></div></div>
        <div class="tabs">${SRC_TABS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
        <div class="list"></div>`;
      const list = body.querySelector('.list');
      if (tab === 'ending') {
        G.ENDINGS.forEach((e) => {
          const got = s.endings[e.id];
          list.appendChild(h(`<div class="dex-item ending-item ${got ? '' : 'locked'}">
            <div class="eic">${got ? e.icon : '❓'}</div>
            <div><div class="dwhy">${got ? e.name : '???'}</div><div class="dfl">${got ? '달성!' : '힌트: ' + e.hint}</div></div></div>`));
        });
      } else {
        G.DEATHS.filter((d) => tab === 'all' || d.src === tab).forEach((d) => {
          const n = s.dex[d.id];
          list.appendChild(h(n
            ? `<div class="dex-item"><div class="dwhy">${d.why} 퇴사</div><div class="dfl">${d.flavor}</div><div class="dmeta">💀 ${n}회 · 내성 ${Math.round((1 - E.resist(s, d.id)) * 100)}%</div></div>`
            : `<div class="dex-item locked"><div class="dwhy">??? </div><div class="dfl">힌트: ${d.hint}</div></div>`));
        });
      }
      body.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; G.audio.click(); render(); }));
    };
    render();
    open({ title: '📖 퇴사 도감', body });
  };

  // ── 퇴사 카드 ───────────────────────────────────────
  S.death = function (s, rep, onRejoin) {
    const d = G.DEATH_BY_ID[rep.id];
    const rankName = G.RANKS[rep.rank].name;
    const sentence = `${U.josa('복치 ' + rankName, '은', '는')} ${d.why} 퇴사했습니다.`;
    G.audio.death();
    const body = `
      <div class="death-card">
        <div class="stamp">퇴사</div>
        <div class="dc-head">퇴 사 통 보 서</div>
        <div class="dc-face">${G.character.svg('dead', { id: 'card', dead: true })}</div>
        ${rep.isNew ? '<span class="new-badge">NEW! 도감 등록</span>' : `<span class="muted">${s.dex[rep.id]}번째 같은 이유 (내성 ↑)</span>`}
        <div class="dc-why">${sentence}</div>
        <div class="dc-flavor">"${d.flavor}"</div>
        <div class="dc-stats">
          <div>근속<b>${U.fmtTime(rep.time)}</b></div>
          <div>최종 직급<b>${rankName}</b></div>
          <div>실적<b>${U.fmt(rep.perf)}</b></div>
        </div>
        <div class="reward-line">💰 퇴직금 +${U.fmt(rep.money)}</div>
      </div>`;
    const m = open({
      title: '', closable: false, body,
      foot: `<div class="btn-col">
        <button class="btn gold block" data-key="1" data-up>📚 자기계발 하러 가기</button>
        <div class="btn-row">
          <button class="btn ghost" data-key="2" data-share>📤 공유</button>
          <button class="btn" data-key="3" data-rejoin>🏢 재입사</button>
        </div></div>`,
    });
    m.foot.querySelector('[data-up]').onclick = () => { G.audio.click(); S.upgrades(s, { rejoin: onRejoin }); };
    m.foot.querySelector('[data-rejoin]').onclick = () => { G.audio.click(); close(); onRejoin(); };
    m.foot.querySelector('[data-share]').onclick = () => { G.audio.click(); G.sharecard.share(sentence, d.flavor, rep); };
  };

  // ── 엔딩 ────────────────────────────────────────────
  S.ending = function (s, endRes, onDone) {
    const e = G.ENDING_BY_ID[endRes.id];
    G.audio.ending();
    const body = h(`<div class="ending-screen"><div class="eicon">${e.icon}</div><div class="ename">ENDING · ${e.name}</div><div class="lines"></div></div>`);
    const m = open({ title: '', closable: false, body, foot: '<button class="btn block" data-key="1">다음</button>' });
    const lines = body.querySelector('.lines');
    const btn = m.foot.querySelector('button');
    let i = 0;
    const next = () => {
      G.audio.click();
      if (i < e.lines.length) {
        lines.appendChild(h(`<p>${e.lines[i]}</p>`));
        i++;
        if (i === e.lines.length) btn.textContent = '마치기';
        m.body.scrollTop = m.body.scrollHeight;
        return;
      }
      const ends = Object.keys(s.endings).length;
      body.innerHTML = `<div class="eicon">${e.icon}</div><div class="ename">${endRes.first ? '🎊 엔딩 달성!' : '엔딩 재관람'}</div>
        <p>${e.name}</p><p class="muted">엔딩 ${ends} / ${G.ENDINGS.length} 달성</p>
        <div class="reward-line">💰 보너스 퇴직금 +${U.fmt(endRes.money)}</div>
        ${ends < G.ENDINGS.length ? '<p class="muted" style="margin-top:12px">아직 보지 못한 엔딩이 있다...</p>' : '<p style="margin-top:12px"><b>모든 엔딩을 봤습니다. 정말 수고하셨습니다!</b></p>'}`;
      btn.textContent = '계속하기';
      btn.onclick = () => { G.audio.click(); close(); onDone(); };
    };
    btn.onclick = next;
    next();
  };

  // ── 메뉴 ────────────────────────────────────────────
  S.menu = function (s) {
    const st = s.stats;
    const body = h(`<div>
      <div class="stat-grid">
        <div>총 플레이<b>${U.fmtTime(st.playTime)}</b></div>
        <div>총 퇴사<b>${st.deaths}회</b></div>
        <div>최고 직급<b>${G.RANKS[st.bestRank].name}</b></div>
        <div>도감<b>${Math.round(R.dexRatio(s) * 100)}%</b></div>
      </div>
      <div class="btn-col">
        <button class="btn ghost block" data-sound>${G.audio.isMuted() ? '🔇 소리 켜기' : '🔊 소리 끄기'}</button>
        <button class="btn ghost block" data-help>❓ 게임 방법</button>
        <button class="btn danger block" data-reset>🗑️ 처음부터 다시 하기</button>
      </div>
      <p class="muted center" style="margin-top:14px">진행 상황은 이 기기 브라우저에 자동 저장됩니다.</p>
    </div>`);
    open({ title: '⚙️ 메뉴', body });
    body.querySelector('[data-sound]').onclick = () => {
      const muted = !G.audio.isMuted();
      G.audio.setMuted(muted);
      s.meta.muted = muted;
      G.game.save();
      close();
      if (muted) G.game.handle(R.hiddenTrigger(s, 'h_mute', 0.3));
    };
    body.querySelector('[data-help]').onclick = () => S.intro(() => {});
    body.querySelector('[data-reset]').onclick = (e) => {
      const b = e.currentTarget;
      if (b.dataset.armed) { G.game.reset(); return; }
      b.dataset.armed = '1';
      b.textContent = '⚠️ 정말요? 한 번 더 누르면 모든 기록이 지워집니다';
    };
  };

  // ── 토스트 ──────────────────────────────────────────
  S.toast = function (text, cls = '') {
    const root = document.getElementById('toast-root');
    const t = h(`<div class="toast ${cls}">${text}</div>`);
    root.appendChild(t);
    setTimeout(() => t.remove(), 2900);
  };

  G.screens = S;
})(globalThis.G);
