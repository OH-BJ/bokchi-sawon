(function (G) {
  // 랜덤 이벤트.
  // min/max: 등장 직급 범위. cond(state): 추가 조건. special: 랜덤 풀에서 제외(규칙이 직접 호출)
  // choices[].o: 결과 후보 [{w: 가중치, ...효과}]
  //   효과: perf(직급 구간 비율), money, stress, coffee, death, msg, ending, vlog
  //   death가 있는 결과의 가중치는 내성/처세술에 따라 줄어든다.
  const E = [];
  const ev = (o) => E.push(o);

  // ── 인턴~사원 ────────────────────────────────────────
  ev({ id: 'elevator', min: 0, max: 2, icon: '🛗', title: '엘리베이터의 아저씨',
    text: "엘리베이터에서 처음 보는 아저씨가 묻는다.\n\"자네, 신입인가?\"",
    choices: [
      { t: '네! 신입 복치입니다!', o: [{ w: 1, perf: 0.15, msg: '알고 보니 대표님이었다. 인상이 좋았다고 한다.' }] },
      { t: '아뇨, 택배 기사인데요', o: [{ w: 1, death: 'e_elevator_ceo' }, { w: 1, stress: 5, msg: '아저씨가 껄껄 웃었다. 다행히 아무 일도 없었다.' }] },
    ] });
  ev({ id: 'coffee_order', min: 0, max: 1, icon: '☕', title: '커피 심부름',
    text: '선배가 말했다.\n"복치 씨, 커피 좀 타 와요~"',
    choices: [
      { t: '아아 샷 추가로 대령합니다', o: [{ w: 1, perf: 0.1, stress: 5, msg: '선배가 만족했다.' }] },
      { t: '선배님이 제 것도 타 주시면요', o: [{ w: 3, death: 'e_coffee_back' }, { w: 2, money: 15, msg: '선배가 진짜 타 줬다. 사내에 전설로 남았다.' }] },
      { t: '대표님 것도 같이 타 간다', o: [{ w: 1, death: 'e_coffee_spill' }, { w: 2, perf: 0.2, msg: '센스 있다는 평을 들었다.' }] },
    ] });
  ev({ id: 'lunch_menu', min: 0, max: 3, icon: '🍚', title: '점심 메뉴',
    text: '"복치 씨, 점심 뭐 먹을래요?"\n모두가 나를 쳐다본다.',
    choices: [
      { t: '아무거나요', o: [{ w: 1, death: 'e_anything' }, { w: 1, stress: 10, msg: '결국 아무거나 먹었다.' }] },
      { t: '회 어떠세요?', o: [{ w: 7, death: 'e_sashimi' }, { w: 3, perf: 0.1, msg: '광어가 맛있었다. ...괜찮다. 남이다.' }] },
      { t: '김치찌개요', o: [{ w: 1, stress: -15, perf: 0.05, msg: '무난함의 승리.' }] },
    ] });
  ev({ id: 'dress', min: 0, max: 2, icon: '👔', title: '드레스 코드',
    text: "오늘부터 사내 드레스 코드가 '비즈니스 캐주얼'이란다.",
    choices: [
      { t: '평소대로 정장', o: [{ w: 1, stress: -5, msg: '개복치는 원래 정장 핏이다. 아무도 몰랐다.' }] },
      { t: '하와이안 셔츠', o: [{ w: 3, death: 'e_hawaii' }, { w: 2, perf: 0.2, msg: '센스 있다고 칭찬받았다!' }] },
    ] });
  ev({ id: 'nickname', min: 0, max: 1, icon: '🏷️', title: '영어 이름',
    text: '수평적 문화를 위해 영어 이름을 쓰자고 한다.',
    choices: [
      { t: 'Mola로 할게요', o: [{ w: 1, perf: 0.1, msg: '"Hi, Mola!" 나쁘지 않다.' }] },
      { t: 'Boss로 할게요', o: [{ w: 4, death: 'e_boss_name' }, { w: 1, money: 20, msg: '다들 웃어 넘겼다.' }] },
      { t: '그냥 복치요', o: [{ w: 1, stress: 8, msg: '재미없는 신입으로 찍혔다.' }] },
    ] });
  ev({ id: 'mbti', min: 0, max: 2, icon: '🔤', title: 'MBTI',
    text: '선배: "복치 씨 MBTI 뭐예요?"',
    choices: [
      { t: 'INFJ요', o: [{ w: 1, perf: 0.05, msg: '희귀하다고 신기해했다.' }] },
      { t: 'MBTI 안 믿어요', o: [{ w: 3, death: 'e_mbti_none' }, { w: 2, stress: 5, msg: '"오~ 완전 T네~"' }] },
      { t: '개복치요', o: [{ w: 1, money: 15, msg: '선배가 빵 터졌다.' }] },
    ] });
  ev({ id: 'rsvp', min: 1, max: 3, icon: '📋', title: '회식 참석 조사',
    text: '금요일 회식 참석 여부를 조사 중이다.',
    choices: [
      { t: '무조건 참석!', o: [{ w: 1, perf: 0.15, stress: 15, msg: '3차까지 갔다.' }] },
      { t: '선약이 있어서...', o: [{ w: 1, death: 'e_excuse' }, { w: 1, stress: -15, msg: '집에서 푹 쉬었다.' }] },
    ] });
  ev({ id: 'groupchat', min: 0, max: 2, icon: '💬', title: '단톡방 실수',
    text: "실수로 팀 단톡방에\n'아 진짜 출근하기 싫다'를 보냈다.",
    choices: [
      { t: '빛의 속도로 삭제', o: [{ w: 1, death: 'e_deleted' }, { w: 1, msg: '아무도 못 본 것 같다. ...아마도.' }] },
      { t: "'ㅋㅋ 농담~' 추가", o: [{ w: 1, stress: 10, msg: '다들 ㅋㅋ로 받아 줬다.' }] },
      { t: '그냥 둔다', o: [{ w: 2, death: 'e_honest' }, { w: 3, perf: 0.1, msg: '팀장님: "나도."' }] },
    ] });
  ev({ id: 'printer', min: 0, max: 2, icon: '🖨️', title: '프린터 속 종이',
    text: '프린터에서 누군가의 연봉 계약서가 나왔다.',
    choices: [
      { t: '안 보고 인사팀에 전달', o: [{ w: 1, perf: 0.15, msg: '정직한 신입으로 소문났다.' }] },
      { t: '슬쩍 본다', o: [{ w: 4, death: 'e_salary_peek' }, { w: 1, stress: 20, msg: '...보지 말걸.' }] },
    ] });
  ev({ id: 'birthday', min: 0, max: 4, icon: '🎂', title: '팀원 생일',
    text: '오늘은 팀원 생일! 케이크 초에 불이 붙었다.',
    choices: [
      { t: '노래를 선창한다', o: [{ w: 2, death: 'e_birthday_song' }, { w: 3, perf: 0.1, msg: '분위기 메이커 등극!' }] },
      { t: '조용히 박수만', o: [{ w: 1, stress: -5, msg: '케이크가 맛있었다.' }] },
    ] });
  ev({ id: 'advice', min: 0, max: 2, icon: '👴', title: '선배의 조언',
    text: '선배가 시작했다.\n"내가 신입 때는 말이야~"',
    choices: [
      { t: '경청한다', o: [{ w: 1, perf: 0.2, stress: 20, msg: '40분이 흘렀다.' }] },
      { t: '화장실 간다고 한다', o: [{ w: 1, stress: -5, msg: '탈출 성공.' }] },
      { t: '선배님 신입 때가 몇 년도예요?', o: [{ w: 3, death: 'e_year' }, { w: 2, money: 10, msg: '선배가 나이를 말 안 해 줬다.' }] },
    ] });
  ev({ id: 'manito', min: 0, max: 5, icon: '🎁', title: '사내 마니또',
    text: '사내 마니또 이벤트! 선물을 준비해야 한다.',
    choices: [
      { t: '정성껏 준비한다', o: [{ w: 1, perf: 0.1, stress: 5, msg: '받은 사람이 감동했다.' }] },
      { t: '다이소에서 대충', o: [{ w: 2, death: 'e_manito' }, { w: 3, money: 10, msg: '가성비 최고.' }] },
    ] });
  ev({ id: 'coffee_spill', min: 0, max: 1, icon: '🧊', title: '커피 배달',
    text: '아아 10잔을 들고 회의실 문 앞에 섰다.\n문이 안 열린다.',
    choices: [
      { t: '발로 연다', o: [{ w: 1, death: 'e_coffee_spill' }, { w: 2, perf: 0.15, msg: '한 방울도 안 흘렸다!' }] },
      { t: '노크한다 (이마로)', o: [{ w: 1, stress: 10, perf: 0.1, msg: '대표님이 문을 열어 줬다.' }] },
    ] });

  // ── 사원~과장 ───────────────────────────────────────
  ev({ id: 'macro', min: 2, max: 4, icon: '🧩', title: '수상한 엑셀 파일',
    text: "'업무자동화_최종_진짜최종.xlsm'\n파일을 받았다.",
    choices: [
      { t: '실행해 본다', o: [{ w: 1, death: 'e_macro' }, { w: 1, perf: 0.4, msg: '업무 자동화 성공! 칼퇴했다.' }] },
      { t: 'IT팀에 문의', o: [{ w: 1, perf: 0.05, stress: 10, msg: 'IT팀: "그거 제가 보낸 건데요?"' }] },
    ] });
  ev({ id: 'junior', min: 2, max: 5, icon: '🐣', title: '후임의 질문',
    text: '후임: "대리님, 이거 왜 해야 돼요?"',
    choices: [
      { t: '원래 그런 거야', o: [{ w: 2, death: 'e_kkondae' }, { w: 3, stress: 5, msg: '후임이 고개를 끄덕였다. 눈은 안 그랬다.' }] },
      { t: '같이 이유를 찾아보자', o: [{ w: 1, perf: 0.2, stress: 10, msg: '이유는 못 찾았지만 친해졌다.' }] },
      { t: '나도 몰라', o: [{ w: 1, money: 30, msg: '후임과 진한 동지애가 생겼다.' }] },
    ] });
  ev({ id: 'wfh', min: 2, max: 6, icon: '🏠', title: '재택 화상회의',
    text: '재택근무 중 갑자기 화상회의!\n"카메라 켜 주세요~"',
    choices: [
      { t: '카메라를 켠다', o: [{ w: 1, death: 'e_cam_swim' }, { w: 1, perf: 0.15, msg: '정장 상의 덕분에 무사했다.' }] },
      { t: '카메라 고장이라고 한다', o: [{ w: 1, death: 'e_cam_frozen' }, { w: 2, stress: -10, msg: '편하게 회의했다.' }] },
    ] });
  ev({ id: 'rumor_promo', min: 2, max: 5, icon: '📣', title: '동기의 승진',
    text: '동기가 먼저 승진한다는 소문이 돈다.',
    choices: [
      { t: '진심으로 축하한다', o: [{ w: 1, perf: 0.1, stress: 15, msg: '마음이 넓어졌다. 위장은 좁아졌다.' }] },
      { t: '질투한다', o: [{ w: 1, death: 'e_jealous' }, { w: 1, stress: 25, msg: '질투는 힘이 된다?' }] },
      { t: '더 열심히 일한다', o: [{ w: 1, perf: 0.3, stress: 25, msg: '실적이 올랐다. 머리카락이 빠졌다.' }] },
    ] });
  ev({ id: 'anon', min: 2, max: 7, icon: '🕵️', title: '익명 설문',
    text: "'회사에 바라는 점을 솔직하게 써 주세요.\n(익명 보장)'",
    choices: [
      { t: '솔직하게 쓴다', o: [{ w: 3, death: 'e_anon' }, { w: 2, money: 25, msg: '진짜 익명이었다. 놀랍다.' }] },
      { t: "'만족합니다' 체크", o: [{ w: 1, stress: 5, perf: 0.05, msg: '모범 답안.' }] },
    ] });
  ev({ id: 'ot_food', min: 1, max: 5, icon: '🍗', title: '야근 식대',
    text: '야근 식대 지원 공지가 떴다!',
    choices: [
      { t: '치킨 시킨다', o: [{ w: 1, stress: -15, msg: '치킨은 옳다.' }] },
      { t: '1인 1랍스터', o: [{ w: 1, death: 'e_lobster' }, { w: 1, money: 25, stress: -25, msg: '총무팀이 못 봤다.' }] },
    ] });
  ev({ id: 'health', min: 1, max: 6, icon: '⚖️', title: '건강검진 결과',
    text: "건강검진 결과지: '체중 감량 필요'",
    choices: [
      { t: '사내 헬스장 등록', o: [{ w: 1, perf: 0.1, stress: 10, msg: '러닝머신 위에서 헤엄쳤다.' }] },
      { t: '개복치는 원래 무겁다', o: [{ w: 1, death: 'e_weight' }, { w: 2, stress: -10, msg: '자기 긍정 성공.' }] },
    ] });
  ev({ id: 'password', min: 1, max: 4, icon: '🔐', title: '보안 점검',
    text: '보안팀: "비밀번호를 변경해 주세요."',
    choices: [
      { t: '부장님싫어1!', o: [{ w: 1, death: 'e_password' }, { w: 1, stress: -10, msg: '쓸 때마다 기분이 좋다.' }] },
      { t: 'Bokchi1234!', o: [{ w: 1, perf: 0.05, msg: '보안팀: "...좀 더 어렵게요."' }] },
    ] });
  ev({ id: 'rumor', min: 2, max: 5, icon: '🗣️', title: '사내 소문',
    text: '탕비실에서 내 얘기가 들린다.\n"복치 씨 사실..."',
    choices: [
      { t: '엿듣는다', o: [{ w: 1, death: 'e_rumor' }, { w: 1, perf: 0.1, msg: '"...일 잘한대." 기분 좋다!' }] },
      { t: '헛기침하며 등장', o: [{ w: 1, stress: 10, msg: '모두가 조용해졌다.' }] },
    ] });
  ev({ id: 'trip_day', min: 1, max: 6, icon: '🎤', title: '야유회 장기자랑',
    text: '회사 야유회 장기자랑에 차출됐다!',
    choices: [
      { t: '춤을 춘다', o: [{ w: 2, death: 'e_dance' }, { w: 3, perf: 0.25, money: 30, msg: '1등! 상품은 문화상품권.' }] },
      { t: '사회를 본다', o: [{ w: 1, perf: 0.15, stress: 10, msg: '무난하게 끝났다.' }] },
    ] });

  // ── 과장 이상 ──────────────────────────────────────
  ev({ id: 'free_idea', min: 3, max: 6, icon: '🧠', title: '자유로운 회의',
    text: '"자, 아무 아이디어나 편하게 말해 보세요~"',
    choices: [
      { t: '진짜 편하게 말한다', o: [{ w: 1, death: 'e_free_idea' }, { w: 1, perf: 0.3, msg: '채택됐다! 담당자도 됐다.' }] },
      { t: '침묵한다', o: [{ w: 1, stress: 15, msg: '정적이 7분 이어졌다.' }] },
      { t: '부장님 의견에 동의합니다', o: [{ w: 1, perf: 0.1, msg: '아직 부장님 의견이 없었다.' }] },
    ] });
  ev({ id: 'parking', min: 3, max: 6, icon: '🚗', title: '주차장 사고',
    text: '주차하다 대표님 차를 살짝 긁었다.',
    choices: [
      { t: '쪽지를 남긴다', o: [{ w: 1, perf: 0.15, stress: 10, msg: '대표님이 정직함에 감동했다.' }] },
      { t: '조용히 사라진다', o: [{ w: 4, death: 'e_cctv' }, { w: 1, stress: 20, msg: '들키지 않았다. 양심이 아프다.' }] },
    ] });
  ev({ id: 'gift', min: 3, max: 7, icon: '🎁', title: '명절 선물',
    text: '명절 선물 세트를 고를 수 있다.',
    choices: [
      { t: '스팸 세트', o: [{ w: 1, stress: -10, msg: '스팸은 진리.' }] },
      { t: '참치 세트', o: [{ w: 3, death: 'e_tuna' }, { w: 2, stress: -10, msg: '맛있었다. 묵념.' }] },
      { t: '중고로 판다', o: [{ w: 1, money: 40, msg: '쏠쏠하다.' }] },
    ] });
  ev({ id: 'ceo_joke', min: 3, max: 7, icon: '🤡', title: '대표님 아재개그',
    text: '대표님: "회사에 오면 회~사하다! 허허"',
    choices: [
      { t: '박장대소', o: [{ w: 1, perf: 0.2, stress: 10, msg: '대표님 기분이 좋아졌다.' }] },
      { t: '정색', o: [{ w: 3, death: 'e_straight_face' }, { w: 2, stress: 10, msg: '대표님이 머쓱해했다.' }] },
      { t: '더 웃긴 개그로 받아친다', o: [{ w: 1, death: 'e_better_joke' }, { w: 1, money: 60, msg: '대표님이 웃다가 보너스를 줬다.' }] },
    ] });
  ev({ id: 'ai', min: 3, max: 7, icon: '🤖', title: 'AI 비서 도입',
    text: '회사에 AI 비서가 도입되었다.',
    choices: [
      { t: '적극 활용한다', o: [{ w: 1, perf: 0.3, msg: '보고서가 3분 만에 끝났다.' }] },
      { t: 'AI에게 업무를 전부 맡긴다', o: [{ w: 3, death: 'e_ai_replace' }, { w: 2, stress: -30, msg: 'AI가 일하는 동안 낮잠을 잤다.' }] },
    ] });
  ev({ id: 'promo_treat', min: 3, max: 7, icon: '🥩', title: '승진 턱',
    text: '"승진 턱 언제 쏴요~?"',
    choices: [
      { t: '삼겹살 쏜다', o: [{ w: 1, perf: 0.15, money: -10, msg: '팀 분위기가 좋아졌다.' }] },
      { t: '다음에 쏠게~', o: [{ w: 1, death: 'e_no_treat' }, { w: 1, stress: 10, msg: '눈총을 받았다.' }] },
    ] });
  ev({ id: 'reorg', min: 3, max: 7, icon: '🏗️', title: '조직 개편',
    text: '조직 개편! 새 팀 이름을 정해야 한다.',
    choices: [
      { t: '혁신성장TF', o: [{ w: 1, perf: 0.1, msg: '어디서 본 이름이다.' }] },
      { t: '개복치팀', o: [{ w: 1, death: 'e_team_name' }, { w: 1, money: 40, msg: '팀원들이 좋아했다. 굿즈도 나왔다.' }] },
    ] });
  ev({ id: 'stock', min: 4, max: 7, icon: '📉', title: '우리사주 청약',
    text: '직원 대상 우리사주 청약이 열렸다!',
    choices: [
      { t: '영끌 매수', o: [{ w: 1, death: 'e_stock_crash' }, { w: 1, money: 150, msg: '두 배가 됐다!!' }] },
      { t: '안 산다', o: [{ w: 1, death: 'e_stock_moon' }, { w: 2, stress: -5, msg: '그대로였다. 안도.' }] },
    ] });
  ev({ id: 'headhunt', min: 4, max: 7, icon: '📞', title: '헤드헌터의 연락',
    text: '"경쟁사에서 연봉 두 배를 제안합니다."',
    choices: [
      { t: '고민해 본다고 한다', o: [{ w: 1, perf: 0.1, msg: '몸값이 올라간 느낌.' }] },
      { t: '바로 수락!', o: [{ w: 1, death: 'e_headhunt' }] },
      { t: '회사에 자랑한다', o: [{ w: 1, death: 'e_bragging' }, { w: 1, money: 100, msg: '연봉이 올랐다!' }] },
    ] });
  ev({ id: 'golf_invite', min: 4, max: 7, icon: '🏌️', title: '주말 골프 초대',
    text: '"이번 주말 골프 어때?"',
    choices: [
      { t: '간다', o: [{ w: 1, perf: 0.3, stress: 20, msg: '새벽 4시 기상. 공은 다 물에 빠졌다.' }] },
      { t: '주말엔 바다에 갑니다', o: [{ w: 2, death: 'e_weekend_sea' }, { w: 3, stress: -25, msg: '바다는 좋았다. 월요일이 왔다.' }] },
    ] });
  ev({ id: 'interview', min: 4, max: 7, icon: '🧑‍💼', title: '신입 면접',
    text: '신입 면접관으로 들어갔다.\n지원자 이력서가 화려하다.',
    choices: [
      { t: '압박 질문을 한다', o: [{ w: 1, death: 'e_interview' }, { w: 1, perf: 0.15, msg: '지원자가 땀을 흘렸다. 나도.' }] },
      { t: '편하게 대화한다', o: [{ w: 1, perf: 0.1, stress: -5, msg: '좋은 인재를 뽑았다.' }] },
    ] });
  ev({ id: 'speech', min: 5, max: 7, icon: '🎙️', title: '신입 환영사',
    text: '신입사원 환영사를 맡았다.',
    choices: [
      { t: '"내가 신입 때는~"', o: [{ w: 1, death: 'e_speech' }, { w: 1, stress: 10, msg: '신입들의 눈빛이 흐려졌다.' }] },
      { t: '짧게 끝낸다', o: [{ w: 1, perf: 0.2, msg: '역대 최고의 환영사로 기록되었다.' }] },
    ] });
  ev({ id: 'parking_spot', min: 5, max: 7, icon: '🅿️', title: '부장 전용 주차석',
    text: '드디어 생긴 전용 주차석에\n누군가의 차가 있다.',
    choices: [
      { t: '경비실에 신고', o: [{ w: 1, death: 'e_parking_spot' }, { w: 1, perf: 0.1, msg: '총무팀장 차였다.' }] },
      { t: '옆에 대충 댄다', o: [{ w: 1, stress: 10, msg: '불법주차 딱지를 받았다.' }] },
    ] });
  ev({ id: 'dog', min: 6, max: 7, icon: '🐕', title: '회장님 강아지',
    text: '회장님이 강아지 산책을 부탁했다.',
    choices: [
      { t: '정성껏 산책', o: [{ w: 1, perf: 0.3, stress: 10, msg: '회장님이 흡족해했다.' }] },
      { t: '강아지 명함을 본다', o: [{ w: 1, death: 'e_dog' }, { w: 1, money: 80, msg: '명함엔 "멍"이라고만 쓰여 있었다.' }] },
    ] });

  // ── 전 직급 공통 ────────────────────────────────────
  ev({ id: 'fire', min: 0, max: 7, icon: '🚨', title: '소방훈련',
    text: '비상벨이 울린다!\n"이것은 훈련 상황입니다."',
    choices: [
      { t: '계단으로 대피', o: [{ w: 1, perf: 0.05, stress: 5, msg: '17층에서 걸어 내려갔다.' }] },
      { t: '진짜 불인 줄 알고 소리 지른다', o: [{ w: 1, death: 'e_fire_drill' }, { w: 1, stress: 15, msg: '목이 쉬었다.' }] },
      { t: '자리에서 계속 일한다', o: [{ w: 1, death: 'e_fire_ignore' }, { w: 2, perf: 0.2, msg: '조용한 사무실. 집중이 잘 됐다.' }] },
    ] });
  ev({ id: 'lottery', min: 0, max: 7, icon: '🎫', title: '탕비실 복권',
    text: '동료들과 재미로 복권을 샀다.',
    choices: [
      { t: '당첨 확인', o: [{ w: 1, death: 'e_lottery' }, { w: 4, stress: 5, money: 5, msg: '5천 원 당첨. 역시 회사가 최고다.' }] },
      { t: '안 본다', o: [{ w: 1, stress: -5, msg: '꿈은 꿈으로 남겨둔다.' }] },
    ] });
  ev({ id: 'tarot', min: 0, max: 7, icon: '🔮', title: '사내 타로',
    text: '사내 타로 동아리에서 운세를 봐 준다.',
    choices: [
      { t: '본다', o: [{ w: 1, death: 'e_tarot' }, { w: 3, coffee: 1, msg: '행운의 아이템: 커피. 커피 +1!' }] },
      { t: '안 본다', o: [{ w: 1, msg: '운명은 스스로 개척한다.' }] },
    ] });
  ev({ id: 'snack', min: 0, max: 7, icon: '🍪', title: '고급 간식',
    text: '누군가 탕비실에 고급 간식을 채워 놨다!',
    choices: [
      { t: '먹는다', o: [{ w: 1, stress: -25, msg: '행복은 가까이에 있다.' }] },
      { t: '커피랑 바꾼다', o: [{ w: 1, coffee: 1, msg: '커피 +1' }] },
    ] });
  ev({ id: 'praise', min: 0, max: 7, icon: '👏', title: '칭찬',
    text: '팀장님이 지나가며 말했다.\n"수고했어."',
    choices: [
      { t: '감동한다', o: [{ w: 1, stress: -30, msg: '눈물이 났다. 바닷물 맛이다.' }] },
      { t: '녹음해 둔다', o: [{ w: 1, money: 15, msg: '힘들 때마다 들어야지.' }] },
    ] });
  ev({ id: 'bonus', min: 1, max: 7, icon: '💸', title: '성과급',
    text: '성과급이 나왔다!',
    choices: [
      { t: '저축한다', o: [{ w: 1, money: 30, msg: '퇴직금이 늘었다.' }] },
      { t: '팀에 쏜다', o: [{ w: 1, perf: 0.2, msg: '인기가 올라갔다.' }] },
    ] });
  ev({ id: 'vlog', min: 0, max: 7, icon: '📹', title: '직장인 브이로그',
    text: "점심시간에 '직장인 브이로그'를 찍어 볼까?",
    choices: [
      { t: '찍는다', o: [{ w: 1, death: 'e_vlog_leak' }, { w: 3, vlog: 1, money: 10, msg: '업로드 완료. 조회수 12회. 그중 10회는 본인.' }] },
      { t: '안 찍는다', o: [{ w: 1, stress: 3, msg: '평범한 점심이었다.' }] },
    ] });

  // ── 엔딩 관련 ───────────────────────────────────────
  ev({ id: 'aquarium', min: 5, max: 7, icon: '🐠', title: '수족관 워크숍',
    text: '올해 워크숍 장소는 대형 수족관이다.\n수조 너머 개복치 한 마리가 이쪽을 본다.',
    choices: [
      { t: '팀원들과 관람한다', o: [{ w: 1, stress: -15, perf: 0.1, msg: '즐거운 워크숍이었다.' }] },
      { t: '수조 앞에 한참 서 있는다', o: [{ w: 1, stress: -30, msg: '파도 소리가 들린다... 저 개복치가 손을(지느러미를) 흔든다.' }] },
      { t: '넥타이를 푼다', o: [{ w: 1, ending: 'ocean' }] },
    ] });
  ev({ id: 'chicken', min: 0, max: 7, icon: '🍗', title: '옛 동기의 연락',
    text: '먼저 퇴사한 동기에게 연락이 왔다.\n"야, 우리 같이 치킨집 할래?"',
    cond: (s) => s.stats.deaths >= 30,
    choices: [
      { t: '콜!', o: [{ w: 1, ending: 'chicken' }] },
      { t: '아직은 회사가 좋아', o: [{ w: 1, stress: -10, perf: 0.1, msg: '"그래, 생각 바뀌면 연락해."' }] },
    ] });
  ev({ id: 'dream', min: 0, max: 7, icon: '💭', title: '이상한 아침',
    text: '어느 날 아침, 모든 게 이상하게 익숙하다.\n이 사무실, 이 책상, 이 넥타이...\n전에도 수백 번 본 것 같다.',
    cond: (s) => s.endings.chairman && G.rules.dexRatio(s) >= 0.8,
    choices: [
      { t: '눈을 뜬다', o: [{ w: 1, ending: 'dream' }] },
      { t: '다시 잔다', o: [{ w: 1, stress: -20, msg: '5분만 더...' }] },
    ] });

  // ── 특수 (규칙에서 직접 호출) ─────────────────────────
  ev({ id: 'monday', special: true, icon: '😩', title: '월요일',
    text: '월요일 아침이다.',
    choices: [
      { t: '출근한다', o: [{ w: 1, death: 'h_monday' }, { w: 2, stress: 15, msg: '살아남았다. 아직 화요일이 남았다.' }] },
      { t: '월요일을 부정한다', o: [{ w: 1, stress: -5, msg: '...그래도 월요일이다.' }] },
    ] });
  ev({ id: 'dawn', special: true, icon: '🌃', title: '새벽 알림',
    text: '새벽인데 업무 알림이 울렸다.',
    choices: [
      { t: '확인한다', o: [{ w: 1, death: 'h_dawn' }, { w: 1, perf: 0.2, msg: '급한 건 아니었다.' }] },
      { t: '무시하고 잔다', o: [{ w: 1, stress: -20, msg: '잘 잤다.' }] },
    ] });
  ev({ id: 'friday', special: true, icon: '🕔', title: '금요일 5시 59분',
    text: '금요일 오후 5시 59분.\n부장님이 서류를 들고 다가온다.',
    choices: [
      { t: '받는다', o: [{ w: 3, death: 'h_friday' }, { w: 2, perf: 0.3, msg: '주말이 사라졌다.' }] },
      { t: '모니터를 끄고 도망친다', o: [{ w: 1, stress: -20, money: 10, msg: '불금이다!' }] },
    ] });

  G.EVENTS = E;
  G.EVENT_BY_ID = Object.fromEntries(E.map((e) => [e.id, e]));
})(globalThis.G);
