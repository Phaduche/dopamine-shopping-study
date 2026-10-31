// ============================================================
// 설문 문항 설정
// ------------------------------------------------------------
// 흐름: 동의 → PRE_SURVEY(기본 정보) → 조건 배정 → 쇼핑 → POST_SURVEY(기분·구매욕구·습관)
// 문항을 바꾸려면 이 파일만 고치면 된다. 각 문항의 id가 CSV의 열 이름이 된다
// (PRE는 pre_, POST는 post_ 접두사가 붙는다).
//
// type:
//   choice  보기 중 하나 선택          options: [...]
//   likert  n점 척도                   points, left, right (양 끝 라벨)
//   slider  0~100 시각아날로그 척도      left, right
//
// ⚠️ 정서·충동구매 문항은 화면 구성을 위한 예시다.
//    본 연구 전에 검증된 척도(사용허가·한국어 타당화 확인)로 교체해야 한다 (v6 §16).
// ============================================================

// 쇼핑 전: 기본 정보만 (짧게)
const PRE_SURVEY = [
  {
    title: "기본 정보",
    desc: "이름이나 연락처는 묻지 않습니다. 결과는 무작위 연구 ID로만 저장됩니다.",
    questions: [
      { id: "grade", type: "choice", text: "학년", options: ["고1", "고2", "고3", "기타"] },
      { id: "gender", type: "choice", text: "성별", options: ["남", "여", "응답하지 않음"] },
      { id: "shop_freq", type: "choice", text: "평소 온라인 쇼핑을 얼마나 자주 하나요?",
        options: ["거의 안 함", "한 달에 1~2번", "일주일에 1번", "일주일에 여러 번", "거의 매일"] },
      { id: "allowance", type: "choice", text: "한 달에 자유롭게 쓸 수 있는 용돈은 어느 정도인가요?",
        options: ["5만원 미만", "5~10만원", "10~20만원", "20만원 이상", "잘 모르겠음"] },
    ],
  },
];

// 쇼핑 후: 지금 기분·구매욕구·평소 습관
const POST_SURVEY = [
  {
    title: "지금 기분",
    desc: "방금 쇼핑 화면을 보고 난 지금, 이 순간 느끼는 정도를 골라 주세요.",
    questions: [
      { id: "aff_happy", type: "likert", points: 7, text: "기쁘다", left: "전혀 아니다", right: "매우 그렇다" },
      { id: "aff_calm", type: "likert", points: 7, text: "편안하다", left: "전혀 아니다", right: "매우 그렇다" },
      { id: "aff_sad", type: "likert", points: 7, text: "우울하다", left: "전혀 아니다", right: "매우 그렇다" },
      { id: "aff_anxious", type: "likert", points: 7, text: "불안하다", left: "전혀 아니다", right: "매우 그렇다" },
      { id: "aff_irritated", type: "likert", points: 7, text: "짜증 난다", left: "전혀 아니다", right: "매우 그렇다" },
      { id: "stress", type: "likert", points: 7, text: "요즘 스트레스를 받고 있다", left: "전혀 아니다", right: "매우 그렇다" },
      { id: "control", type: "likert", points: 7, text: "지금 내 일을 스스로 통제할 수 있다고 느낀다", left: "전혀 아니다", right: "매우 그렇다" },
    ],
  },
  {
    title: "지금 구매하고 싶은 마음",
    desc: "막대를 움직여 지금 느끼는 정도를 표시해 주세요.",
    questions: [
      { id: "desire_want", type: "slider", text: "지금 꼭 필요하지 않은 물건이라도 사고 싶은 정도", left: "전혀 없음", right: "매우 강함" },
      { id: "desire_pay", type: "slider", text: "지금 바로 결제할 가능성", left: "전혀 없음", right: "매우 높음" },
      { id: "desire_delay", type: "slider", text: "사고 싶은 것을 나중으로 미루기 어려운 정도", left: "전혀 어렵지 않음", right: "매우 어려움" },
    ],
  },
  {
    title: "평소 쇼핑 습관",
    desc: "평소의 나와 가까운 정도를 골라 주세요.",
    questions: [
      { id: "imp_1", type: "likert", points: 5, text: "물건을 보면 별 생각 없이 사는 편이다", left: "전혀 아니다", right: "매우 그렇다" },
      { id: "imp_2", type: "likert", points: 5, text: "사고 싶은 것이 생기면 바로 사야 마음이 편하다", left: "전혀 아니다", right: "매우 그렇다" },
      { id: "imp_3", type: "likert", points: 5, text: "계획에 없던 물건을 자주 산다", left: "전혀 아니다", right: "매우 그렇다" },
      { id: "imp_4", type: "likert", points: 5, text: "그 순간의 기분에 따라 물건을 사곤 한다", left: "전혀 아니다", right: "매우 그렇다" },
    ],
  },
];
