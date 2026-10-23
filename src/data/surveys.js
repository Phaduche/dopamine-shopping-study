// ============================================================
// 측정도구 / 설문 구성 (v6 §8, §16)
// ------------------------------------------------------------
// ⚠️ 중요: 아래 문항은 '구조와 측정시점 배치'를 보여주는 연구용 초안입니다.
//   최종 문항은 다음을 확정한 뒤 교체해야 합니다(v6 §16):
//   - 부정/긍정정서: 반복측정용으로 타당화된 단축형 정서척도(번역본 사용허가 확인)
//   - 상태 구매욕구: 선행척도 기반 3~4문항, 한국어 타당화/사용허가 확인
//   - 충동구매 성향: Buying Impulsiveness Scale 등 (비임상적)
//   파일럿에서 내적 일관성·이해도·바닥/천장효과·시간민감성을 점검합니다.
//
// 문항 유형:
//   - vas : 0~100 시각아날로그 (슬라이더)
//   - likert7 : 7점 리커트
//   - choice : 단일선택
//   - number : 숫자 입력 (범주)
// ============================================================

// 공통 구매욕구 (상태) — 1차 결과변수 (v6 §8)
const PURCHASE_DESIRE = [
  { id: 'pd1', type: 'vas', text: '지금 비필수 상품을 사고 싶은 정도', min: 0, max: 100, lo: '전혀 아님', hi: '매우 그러함' },
  { id: 'pd2', type: 'vas', text: '지금 바로 결제할 가능성', min: 0, max: 100, lo: '전혀 없음', hi: '매우 높음' },
  { id: 'pd3', type: 'vas', text: '구매를 미루기 어려운 정도', min: 0, max: 100, lo: '전혀 아님', hi: '매우 그러함' },
]

// 공통 정서 — 1차 결과변수(부정정서) + 2차(긍정정서) (v6 §8)
const AFFECT = [
  { id: 'na', type: 'vas', text: '지금 느끼는 부정적 기분(속상함·짜증·불안 등)', min: 0, max: 100, lo: '전혀 아님', hi: '매우 강함' },
  { id: 'pa', type: 'vas', text: '지금 느끼는 긍정적 기분(즐거움·활기 등)', min: 0, max: 100, lo: '전혀 아님', hi: '매우 강함' },
]

// 메커니즘 2차 변수
const M = {
  control: { id: 'control', type: 'likert7', text: '지금 내 상황을 잘 통제하고 있다고 느낀다', lo: '전혀 아니다', hi: '매우 그렇다' },
  expect: { id: 'expect', type: 'likert7', text: '상품을 기다리는 과정이 기대된다', lo: '전혀 아니다', hi: '매우 그렇다' },
  ownership: { id: 'ownership', type: 'likert7', text: '이 상품이 이미 내 것처럼 느껴진다', lo: '전혀 아니다', hi: '매우 그렇다' },
  closure: { id: 'closure', type: 'likert7', text: '구매(선택) 과정이 마무리된 느낌이 든다', lo: '전혀 아니다', hi: '매우 그렇다' },
  satisfy: { id: 'satisfy', type: 'likert7', text: '선택/경험에 대한 만족도', lo: '전혀 만족 안 함', hi: '매우 만족' },
  stress: { id: 'stress', type: 'vas', text: '지금 느끼는 스트레스 정도', min: 0, max: 100, lo: '전혀 없음', hi: '매우 높음' },
}

// 조작점검 (v6 §10)
const MANIP = {
  R: { id: 'mc_real', type: 'likert7', text: '실제 상품을 받을 것이라고 얼마나 믿었는가?', lo: '전혀 안 믿음', hi: '매우 믿음' },
  F: { id: 'mc_virtual', type: 'likert7', text: '실제 배송이 없다는 사실을 얼마나 명확히 이해했는가?', lo: '전혀 모름', hi: '매우 명확' },
  realism: { id: 'mc_realism', type: 'likert7', text: '배송 상태가 얼마나 현실적으로 느껴졌는가?', lo: '전혀', hi: '매우' },
  C: { id: 'mc_order', type: 'likert7', text: '내가 상품을 ‘주문했다’고 느꼈는가?', lo: '전혀 아니다', hi: '매우 그렇다' },
  attract: { id: 'mc_attract', type: 'likert7', text: '선택한 상품이 개인적으로 얼마나 매력적이었는가?', lo: '전혀', hi: '매우' },
}

// 7일 후 비필수 구매행동 (v6 §8, 범주형 — 영수증 요구 안 함)
const BEHAVIOR_7D = [
  {
    id: 'buy7d', type: 'choice', text: '지난 7일 동안 비필수 상품을 실제로 구매한 적이 있나요?',
    options: ['없음', '1회', '2~3회', '4회 이상'],
  },
  {
    id: 'spend7d', type: 'choice', text: '그 지출액 범주는 어느 정도인가요? (대략)',
    options: ['지출 없음', '1만원 미만', '1~3만원', '3~5만원', '5만원 이상'],
  },
]

// 개인차/공변량 — T0에서 1회 수집 (v6 §8.개인차)
const COVARIATES = [
  { id: 'bis', type: 'likert7', text: '[충동구매 성향] 나는 사고 싶은 것이 생기면 바로 사는 편이다', lo: '전혀 아니다', hi: '매우 그렇다' },
  {
    id: 'shopfreq', type: 'choice', text: '평소 온라인 쇼핑 빈도',
    options: ['거의 안 함', '월 1~2회', '주 1회', '주 2~3회', '거의 매일'],
  },
  {
    id: 'allowance', type: 'choice', text: '한 달 가처분 용돈 범주',
    options: ['2만원 미만', '2~5만원', '5~10만원', '10만원 이상'],
  },
]

// 측정시점별 설문 구성 (v6 §7 표)
// each: { items:[...], note }
export const SURVEYS = {
  T0: {
    title: '시작 전 설문 (T0)',
    note: '상품 탐색을 시작하기 전 현재 상태를 응답해 주세요.',
    items: [...AFFECT, ...PURCHASE_DESIRE, M.stress, M.control, ...COVARIATES],
  },
  T1: {
    title: '상품 선택 직후 설문 (T1)',
    note: '가장 마음에 드는 상품을 선택한 직후의 상태를 응답해 주세요.',
    items: [...AFFECT, ...PURCHASE_DESIRE, M.satisfy, MANIP.attract],
  },
  T2: {
    title: '주문 단계 직후 설문 (T2)',
    note: '방금 주문(또는 선택) 단계를 마친 직후의 상태를 응답해 주세요.',
    items: [...AFFECT, ...PURCHASE_DESIRE, M.control, M.expect, M.ownership],
  },
  T3: {
    title: '중간 설문 (T3 · 약 6시간 후)',
    note: '지금 이 순간의 기분과 구매욕구를 짧게 응답해 주세요.',
    items: [...AFFECT, ...PURCHASE_DESIRE],
  },
  T4: {
    title: '중간 설문 (T4 · 약 24시간 후)',
    note: '지금 이 순간의 기분과 구매욕구를 짧게 응답해 주세요.',
    items: [...AFFECT, ...PURCHASE_DESIRE],
  },
  T5: {
    title: '배송완료 시점 설문 (T5 · 약 72시간 후)',
    note: '배송(수령/완료) 시점의 상태를 응답해 주세요.',
    items: [...AFFECT, ...PURCHASE_DESIRE, M.closure, M.satisfy],
  },
  T6: {
    title: '추적 설문 (T6 · T5 24시간 후)',
    note: '현재 상태를 응답해 주세요.',
    items: [...AFFECT, ...PURCHASE_DESIRE, M.satisfy],
  },
  T7: {
    title: '최종 설문 (T7 · 시작 7일 후)',
    note: '지난 한 주를 돌아보며 응답해 주세요.',
    items: [...AFFECT, ...PURCHASE_DESIRE, ...BEHAVIOR_7D, MANIP.realism, MANIP.attract],
  },
}

// 조건별 조작점검 문항을 T7 설문에 덧붙임
export function surveyForTimepoint(timepointId, conditionKey) {
  const base = SURVEYS[timepointId]
  if (!base) return null
  let items = [...base.items]
  if (timepointId === 'T7') {
    if (conditionKey === 'R') items = [...items, MANIP.R]
    else if (conditionKey === 'F') items = [...items, MANIP.F]
    else if (conditionKey === 'C') items = [...items, MANIP.C]
  }
  return { ...base, items }
}
