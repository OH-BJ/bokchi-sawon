// 퇴사 카드를 PNG로 그려서 공유(모바일) 또는 다운로드(PC)
(function (G) {
  const U = G.U;
  const W = 720, H = 900;

  // 구형 브라우저용 roundRect 대체
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
  }

  function wrap(ctx, text, maxW) {
    const lines = [];
    let line = '';
    for (const ch of text) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxW && line) {
        // 가능한 한 띄어쓰기에서 줄바꿈
        const sp = line.lastIndexOf(' ');
        if (sp > line.length * 0.5) { lines.push(line.slice(0, sp)); line = line.slice(sp + 1) + ch; }
        else { lines.push(line); line = ch; }
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function loadSvg(svgText) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
    });
  }

  async function render(sentence, flavor, rep) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const font = getComputedStyle(document.body).fontFamily;

    ctx.fillStyle = '#2b3a55'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fffdf7';
    ctx.beginPath(); ctx.roundRect(40, 40, W - 80, H - 80, 28); ctx.fill();

    ctx.fillStyle = '#5b6b80'; ctx.textAlign = 'center';
    ctx.font = `800 26px ${font}`;
    ctx.fillText('퇴 사 통 보 서', W / 2, 110);

    try {
      const img = await loadSvg(G.character.svg('dead', { id: 'share', dead: true }));
      ctx.drawImage(img, W / 2 - 110, 140, 220, 242);
    } catch (e) { /* 그림 없이 진행 */ }

    ctx.save();
    ctx.translate(W - 170, 190); ctx.rotate(0.25);
    ctx.strokeStyle = '#e0503f'; ctx.lineWidth = 7; ctx.fillStyle = '#e0503f';
    ctx.strokeRect(-70, -36, 140, 72);
    ctx.font = `900 46px ${font}`; ctx.fillText('퇴사', 0, 17);
    ctx.restore();

    ctx.fillStyle = '#1f2a3a';
    ctx.font = `900 36px ${font}`;
    let y = 450;
    for (const l of wrap(ctx, sentence, W - 160)) { ctx.fillText(l, W / 2, y); y += 50; }
    ctx.fillStyle = '#5b6b80';
    ctx.font = `italic 500 25px ${font}`;
    y += 10;
    for (const l of wrap(ctx, `"${flavor}"`, W - 180)) { ctx.fillText(l, W / 2, y); y += 36; }

    const stats = [['근속', U.fmtTime(rep.time)], ['직급', G.RANKS[rep.rank].name], [`${rep.life}대째`, '복치']];
    const bw = (W - 160 - 20) / 3;
    stats.forEach(([k, v], i) => {
      const x = 80 + i * (bw + 10);
      ctx.fillStyle = '#f3f6fa';
      ctx.beginPath(); ctx.roundRect(x, H - 250, bw, 90, 16); ctx.fill();
      ctx.fillStyle = '#5b6b80'; ctx.font = `600 20px ${font}`; ctx.fillText(k, x + bw / 2, H - 215);
      ctx.fillStyle = '#1f2a3a'; ctx.font = `900 26px ${font}`; ctx.fillText(v, x + bw / 2, H - 180);
    });

    ctx.fillStyle = '#3b6ea5'; ctx.font = `900 28px ${font}`;
    ctx.fillText('🐟 개복치 신입사원', W / 2, H - 95);
    return new Promise((res) => c.toBlob(res, 'image/png'));
  }

  async function share(sentence, flavor, rep) {
    const text = `${sentence}\n"${flavor}"\n#개복치신입사원`;
    let blob = null;
    try { blob = await render(sentence, flavor, rep); } catch (e) { /* 텍스트만 공유 */ }
    const file = blob ? new File([blob], 'bokchi-퇴사.png', { type: 'image/png' }) : null;
    try {
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
      if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        await navigator.share({ text });
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
    if (blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'bokchi-퇴사.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
    try { await navigator.clipboard.writeText(text); } catch (e) { /* 무시 */ }
    G.screens.toast('📸 퇴사 카드를 저장했어요! (문구도 복사됨)');
  }

  G.sharecard = { share, render };
})(globalThis.G);
