(function (G) {
  // cost = base * growth^level. 효과 수치는 economy.js에서 사용.
  G.UPGRADES = [
    { id: 'skill',   icon: '⌨️', name: '업무 숙련',       desc: '업무 실적 +30%',                     base: 12,   growth: 1.65, max: 30 },
    { id: 'auto',    icon: '🤖', name: '자동 업무',       desc: '가만히 있어도 실적이 오른다',        base: 40,   growth: 1.85, max: 20 },
    { id: 'mental',  icon: '🧘', name: '멘탈 강화',       desc: '스트레스 증가 -10%',                 base: 20,   growth: 1.65, max: 12 },
    { id: 'rest',    icon: '🛋️', name: '탕비실 리모델링', desc: '휴식 대기시간 -3초, 회복량 +5',      base: 25,   growth: 1.8,  max: 6 },
    { id: 'multi',   icon: '🐙', name: '멀티태스킹',      desc: '동시에 뜨는 업무 +1, 등장 속도 ↑',   base: 30,   growth: 2.1,  max: 5 },
    { id: 'plan',    icon: '🗂️', name: '기획력',          desc: '프로젝트 성공률 +3%p',               base: 40,   growth: 1.7,  max: 10 },
    { id: 'coffee',  icon: '☕', name: '커피 머신',       desc: '커피 최대치 +1, 충전 -4초',          base: 45,   growth: 2.0,  max: 5 },
    { id: 'social',  icon: '🍻', name: '처세술',          desc: '이벤트 위험 -15%, 보상 +15%',        base: 60,   growth: 1.8,  max: 8 },
    { id: 'variety', icon: '📚', name: '업무 다양화',     desc: '직급보다 한 단계 높은 업무가 뜬다',  base: 300,  growth: 8,    max: 2 },
    { id: 'para',    icon: '🪂', name: '낙하산',          desc: '재입사 시 한 직급 높게 시작',        base: 800,  growth: 5.5,  max: 4 },
  ];
  G.UPGRADE_BY_ID = Object.fromEntries(G.UPGRADES.map((u) => [u.id, u]));
})(globalThis.G);
