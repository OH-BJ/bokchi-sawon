// 정장 입은 개복치 '복치' SVG. 표정: normal | happy | stress | panic | dead
(function (G) {
  const EYES = {
    normal: '<circle cx="62" cy="92" r="12" fill="#fff" stroke="#2a3446" stroke-width="2.5"/><circle cx="58" cy="93" r="5.5" fill="#1d2433"/><circle cx="56" cy="91" r="1.8" fill="#fff"/>',
    happy:  '<path d="M50 95 Q62 80 74 95" fill="none" stroke="#1d2433" stroke-width="4" stroke-linecap="round"/>',
    stress: '<circle cx="62" cy="92" r="12" fill="#fff" stroke="#2a3446" stroke-width="2.5"/><circle cx="60" cy="93" r="3" fill="#1d2433"/><path d="M48 76 L74 82" stroke="#1d2433" stroke-width="3.5" stroke-linecap="round"/>',
    panic:  '<circle cx="62" cy="92" r="14" fill="#fff" stroke="#2a3446" stroke-width="2.5"/><circle cx="62" cy="92" r="2.2" fill="#1d2433"/><path d="M46 74 L76 78" stroke="#1d2433" stroke-width="3.5" stroke-linecap="round"/>',
    dead:   '<path d="M52 84 L72 102 M72 84 L52 102" stroke="#1d2433" stroke-width="4.5" stroke-linecap="round"/>',
  };
  const MOUTHS = {
    normal: '<path d="M30 118 Q36 121 42 118" fill="none" stroke="#1d2433" stroke-width="3" stroke-linecap="round"/>',
    happy:  '<path d="M28 114 Q36 128 45 114 Z" fill="#c2464a" stroke="#1d2433" stroke-width="2.5" stroke-linejoin="round"/>',
    stress: '<path d="M27 120 Q31 115 35 120 Q39 125 43 120" fill="none" stroke="#1d2433" stroke-width="3" stroke-linecap="round"/>',
    panic:  '<ellipse cx="36" cy="120" rx="6" ry="8" fill="#5a1e24" stroke="#1d2433" stroke-width="2.5"/>',
    dead:   '<ellipse cx="36" cy="119" rx="5" ry="5" fill="none" stroke="#1d2433" stroke-width="3"/>',
  };
  const EXTRA = {
    normal: '',
    happy: '<ellipse cx="78" cy="110" rx="9" ry="5" fill="#ff9fb0" opacity="0.7"/>',
    stress: '<path d="M88 62 q5 8 0 12 q-5 -4 0 -12z" fill="#7cc6f2"/>',
    panic: '<path d="M88 58 q6 9 0 14 q-6 -5 0 -14z" fill="#7cc6f2"/><path d="M100 72 q5 8 0 12 q-5 -4 0 -12z" fill="#7cc6f2"/>',
    dead: '<text x="96" y="40" font-size="22">👻</text>',
  };

  function svg(mood = 'normal', opts = {}) {
    const body = opts.dead ? '#b7c0cb' : '#9fb4c9';
    const belly = opts.dead ? '#dfe3e8' : '#d6e2ee';
    const tie = opts.tie || '#d6463a';
    return `
<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><clipPath id="bodyclip${opts.id || ''}"><ellipse cx="100" cy="112" rx="74" ry="64"/></clipPath></defs>
  <!-- 등지느러미 / 뒷지느러미 -->
  <path d="M96 58 Q104 4 132 10 Q126 40 128 60 Z" fill="${body}" stroke="#56677c" stroke-width="3" stroke-linejoin="round"/>
  <path d="M96 166 Q104 214 132 210 Q126 182 128 162 Z" fill="${body}" stroke="#56677c" stroke-width="3" stroke-linejoin="round"/>
  <!-- 꼬리(키지느러미) -->
  <path d="M166 70 Q186 78 180 92 Q192 104 180 116 Q192 128 180 140 Q186 154 166 156 Z" fill="${body}" stroke="#56677c" stroke-width="3" stroke-linejoin="round"/>
  <!-- 몸통 -->
  <ellipse cx="100" cy="112" rx="74" ry="64" fill="${body}" stroke="#56677c" stroke-width="3"/>
  <g clip-path="url(#bodyclip${opts.id || ''})">
    <ellipse cx="80" cy="150" rx="70" ry="34" fill="${belly}"/>
    <!-- 정장 -->
    <path d="M58 128 L150 128 L176 190 L40 190 Z" fill="#2f3b59"/>
    <path d="M92 128 L120 128 L106 162 Z" fill="#fff"/>
    <path d="M92 128 L106 162 L86 150 L80 130 Z" fill="#3c4a6e"/>
    <path d="M120 128 L106 162 L126 150 L132 130 Z" fill="#3c4a6e"/>
    <path d="M102 132 L110 132 L112 156 L106 166 L100 156 Z" fill="${tie}"/>
    <path d="M101 128 L111 128 L109 134 L103 134 Z" fill="${tie}" stroke="#8e2a22" stroke-width="1"/>
    <rect x="128" y="142" width="14" height="4" rx="1.5" fill="#fff" opacity="0.8"/>
  </g>
  <ellipse cx="100" cy="112" rx="74" ry="64" fill="none" stroke="#56677c" stroke-width="3"/>
  <!-- 가슴지느러미 -->
  <path d="M118 104 Q136 92 140 106 Q134 116 118 112 Z" fill="${body}" stroke="#56677c" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- 얼굴 -->
  ${EYES[mood] || EYES.normal}
  ${MOUTHS[mood] || MOUTHS.normal}
  ${EXTRA[mood] || ''}
</svg>`;
  }

  G.character = { svg };
})(globalThis.G);
