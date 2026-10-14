(function (G) {
  // 화면에 떠다니는 업무. tier가 (직급 + 업무 다양화 레벨) 이하일 때 등장.
  G.TASKS = [
    { id: 'mail',    icon: '📧', name: '메일 확인',     tier: 0, value: 1 },
    { id: 'paper',   icon: '📄', name: '서류 정리',     tier: 0, value: 2 },
    { id: 'phone',   icon: '☎️', name: '전화 받기',     tier: 1, value: 7 },
    { id: 'excel',   icon: '📊', name: '엑셀 작업',     tier: 2, value: 40 },
    { id: 'report',  icon: '📝', name: '보고서 작성',   tier: 3, value: 260 },
    { id: 'meeting', icon: '💼', name: '거래처 미팅',   tier: 4, value: 1500 },
    { id: 'present', icon: '📈', name: '실적 발표',     tier: 5, value: 9000 },
    { id: 'deal',    icon: '🤝', name: 'M&A 계약',      tier: 6, value: 55000 },
    { id: 'empire',  icon: '🏢', name: '계열사 인수',   tier: 7, value: 330000 },
    { id: 'global',  icon: '🌏', name: '글로벌 진출',   tier: 8, value: 2000000 },
  ];

  // 함정 업무: 터치(tap) 또는 무시(expire)하면 퇴사할 수 있다. 대신 보상이 크다.
  G.TRAPS = [
    { id: 'cake',      icon: '🍰', name: '냉장고 속 케이크', tier: 0, risk: 'tap',    p: 0.35, death: 'trap_cake',      mult: 4 },
    { id: 'ink',       icon: '🖨️', name: '잉크 부족',       tier: 0, risk: 'tap',    p: 0.3,  death: 'trap_ink',       mult: 4 },
    { id: 'replyall',  icon: '📨', name: '전체답장',         tier: 1, risk: 'tap',    p: 0.35, death: 'trap_replyall',  mult: 5 },
    { id: 'bosskakao', icon: '📱', name: '부장님 카톡',      tier: 1, risk: 'expire', p: 0.4,  death: 'trap_readignore', mult: 4 },
    { id: 'meeting',   icon: '📅', name: '회의 초대',        tier: 2, risk: 'tap',    p: 0.3,  death: 'trap_meeting',   mult: 5 },
    { id: 'card',      icon: '🧾', name: '법카 영수증',      tier: 3, risk: 'tap',    p: 0.3,  death: 'trap_card',      mult: 5 },
    { id: 'rolling',   icon: '💌', name: '롤링페이퍼',       tier: 3, risk: 'tap',    p: 0.35, death: 'trap_rolling',   mult: 5 },
    { id: 'urgent',    icon: '🔥', name: '긴급!!',           tier: 4, risk: 'expire', p: 0.35, death: 'trap_urgent',    mult: 5 },
    { id: 'toast',     icon: '🎤', name: '즉석 건배사',      tier: 5, risk: 'tap',    p: 0.35, death: 'trap_toast',     mult: 6 },
    { id: 'chaircall', icon: '📞', name: '회장님 전화',      tier: 6, risk: 'expire', p: 0.4,  death: 'trap_chaircall', mult: 6 },
  ];

  // 휴식 장소. 휴식할 때마다 랜덤으로 하나.
  G.REST_SPOTS = [
    { name: '탕비실', deaths: ['rest_snack', 'rest_coffee', 'rest_boss'] },
    { name: '화장실', deaths: ['rest_toilet', 'rest_mirror'] },
    { name: '옥상',   deaths: ['rest_roof', 'rest_pigeon'] },
    { name: '정수기 앞', deaths: ['rest_water'] },
  ];
})(globalThis.G);
