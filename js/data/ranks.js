(function (G) {
  // need: 이번 생애 누적 실적이 이 값 이상이면 해당 직급으로 승진
  // bonus: 승진 시 받는 퇴직금(영구 화폐). 처음 도달할 때만 전액, 이후 20%
  G.RANKS = [
    { name: '인턴', need: 0,        bonus: 0,     color: '#9aa5b1', title: '아직 사원증도 없다' },
    { name: '사원', need: 150,       bonus: 5,     color: '#6fa8dc', title: '사원증 목걸이가 생겼다' },
    { name: '대리', need: 1500,      bonus: 15,    color: '#5cb85c', title: '"대리님~" 소리를 듣는다' },
    { name: '과장', need: 15000,     bonus: 40,    color: '#e6a23c', title: '결재 도장이 생겼다' },
    { name: '차장', need: 150000,    bonus: 90,    color: '#e67e22', title: '뭐 하는 직급인지 모른다' },
    { name: '부장', need: 1500000,   bonus: 200,   color: '#d9534f', title: '창가 자리를 얻었다' },
    { name: '이사', need: 25000000,  bonus: 450,   color: '#8e44ad', title: '개인 사무실이 생겼다' },
    { name: '사장', need: 1200000000, bonus: 1000,  color: '#2c3e50', title: '전용 엘리베이터가 생겼다' },
    { name: '회장', need: 12000000000, bonus: 2500,  color: '#c9a227', title: '회사가 곧 나다' },
  ];
  G.MAX_RANK = G.RANKS.length - 1;
})(globalThis.G);
