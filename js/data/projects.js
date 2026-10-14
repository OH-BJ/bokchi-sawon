(function (G) {
  // 프로젝트 = 원작의 '모험'. 커피 1잔 소모.
  // base: 기본 성공률, reward: 현재 직급 구간(다음 직급 need - 현재 need)의 비율
  // mini: 'timing' | 'mash' | null  (미니게임 결과에 따라 성공률 보너스)
  // fail: 실패 시 퇴사 확률 (나머지는 시말서 + 스트레스)
  G.PROJECTS = [
    { id: 'copier',   icon: '🖨️', name: '복사기 수리',       rank: 0, base: 0.6,  reward: 0.3,  mini: 'timing', fail: 0.7,
      desc: '종이가 걸렸다. 아무도 고칠 줄 모른다.', deaths: ['p_copier_tie', 'p_copier_a3'] },
    { id: 'intro',    icon: '🙋', name: '첫 자기소개',        rank: 0, base: 0.55, reward: 0.35, mini: 'timing', fail: 0.7,
      desc: '전 직원 앞에서 30초 자기소개.', deaths: ['p_intro_mbti', 'p_intro_hobby'] },
    { id: 'dinner',   icon: '🍺', name: '회식 참석',          rank: 1, base: 0.5,  reward: 0.4,  mini: 'timing', fail: 0.75,
      desc: '건배 타이밍이 생명이다.', deaths: ['p_bomb_shot', 'p_karaoke', 'p_meat'] },
    { id: 'overtime', icon: '🌙', name: '야근',               rank: 1, base: 0.55, reward: 0.35, mini: 'mash',   fail: 0.7,
      desc: '밤 11시까지 키보드를 두드린다.', deaths: ['p_ot_light', 'p_ot_guard'] },
    { id: 'excel',    icon: '📊', name: '엑셀 마감',          rank: 2, base: 0.5,  reward: 0.4,  mini: 'mash',   fail: 0.7,
      desc: '셀 4만 개를 오늘까지.', deaths: ['p_vlookup', 'p_excel_crash'] },
    { id: 'golf',     icon: '⛳', name: '거래처 골프 접대',   rank: 2, base: 0.45, reward: 0.45, mini: 'timing', fail: 0.75,
      desc: '적당히 못 쳐야 한다. 그게 어렵다.', deaths: ['p_golf_glass', 'p_golf_win'] },
    { id: 'pt',       icon: '📽️', name: 'PT 발표',            rank: 3, base: 0.5,  reward: 0.4,  mini: 'timing', fail: 0.7,
      desc: '대표님 앞에서 20분 발표.', deaths: ['p_pt_mic', 'p_pt_tab', 'p_pt_laser'] },
    { id: 'workshop', icon: '🏕️', name: '워크숍 기획',        rank: 3, base: 0.55, reward: 0.35, mini: null,     fail: 0.65,
      desc: '1박 2일 레크리에이션 포함.', deaths: ['p_ws_rain', 'p_ws_game'] },
    { id: 'newbiz',   icon: '💡', name: '신사업 기획안',      rank: 4, base: 0.45, reward: 0.45, mini: 'mash',   fail: 0.75,
      desc: '혁신적이면서 안전한 걸로.', deaths: ['p_newbiz_ai', 'p_newbiz_copy'] },
    { id: 'trip',     icon: '✈️', name: '해외 출장',          rank: 4, base: 0.5,  reward: 0.4,  mini: 'timing', fail: 0.7,
      desc: '3박 5일, 미팅 9개.', deaths: ['p_trip_passport', 'p_trip_jetlag'] },
    { id: 'restruct', icon: '✂️', name: '구조조정 발표',      rank: 5, base: 0.45, reward: 0.45, mini: 'timing', fail: 0.75,
      desc: '누군가는 해야 하는 일.', deaths: ['p_restruct_self', 'p_restruct_tear'] },
    { id: 'award',    icon: '🏆', name: '연말 시상식 사회',   rank: 5, base: 0.5,  reward: 0.4,  mini: 'timing', fail: 0.7,
      desc: '마이크를 잡으면 사람이 바뀐다.', deaths: ['p_award_name', 'p_award_joke'] },
    { id: 'agm',      icon: '🏛️', name: '주주총회',           rank: 6, base: 0.45, reward: 0.45, mini: 'mash',   fail: 0.75,
      desc: '소액주주 3천 명이 왔다.', deaths: ['p_agm_question', 'p_agm_gavel'] },
    { id: 'chairman', icon: '🍱', name: '회장님 독대 오찬',   rank: 7, base: 0.4,  reward: 0.5,  mini: 'timing', fail: 0.8,
      desc: '회장님과 단둘이 점심.', deaths: ['p_chair_tie', 'p_chair_spoon', 'p_chair_sashimi'] },
    { id: 'press',    icon: '🎙️', name: '대국민 기자회견',    rank: 7, base: 0.4,  reward: 0.5,  mini: 'mash',   fail: 0.8,
      desc: '전국 생방송.', deaths: ['p_press_flash', 'p_press_yawn'] },
  ];
  G.PROJECT_BY_ID = Object.fromEntries(G.PROJECTS.map((p) => [p.id, p]));
})(globalThis.G);
