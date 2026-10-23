// ============================================================
// 실험 조건 정의 (v6 제1부 작동원리 연구: R / F / C)
// ============================================================
//
// 조건은 URL 파라미터로 배정한다. 예: ?cond=F&pid=P017
//   - cond = R | F | C
//   - pid  = 참가자 연구ID (개인정보 아님, 무작위 ID)
//   - sim  = 1 이면 연구용 시간가속 모드 (배송 타임라인을 분 단위로 압축)
//
// 조건별로 "주문/배송 화면 노출 여부"와 "배송 실재성 안내"가 달라진다.
// 모든 조건은 동일한 상품·UI·탐색 경험을 공유한다(공통 UI 통제, v6 §6.2, §7.2).

export const CONDITIONS = {
  R: {
    key: 'R',
    label: '실제 보상',
    short: 'R',
    // R/F/C 공개용이 아닌 내부 라벨. 분석 눈가림을 위해 화면에는 노출하지 않음.
    showOrderFlow: true, // 장바구니/주문/배송 화면 노출
    showDelivery: true, // 배송조회 화면 노출
    realDelivery: true, // 실제 상품 수령 예정
    // 참가자에게 보여줄 주문 단계 고지문 (v6 §7 T2: '실제 배송 예정 주문')
    orderNotice:
      '연구 담당자가 확인 후 선택하신 상품을 실제로 전달해 드립니다. (연구용 무상 제공 · 실제 결제는 발생하지 않습니다)',
    deliveryNotice:
      '아래 배송 현황은 연구용 모의 화면입니다. 실제 상품은 약 72시간 후 연구 담당자를 통해 전달됩니다.',
  },
  F: {
    key: 'F',
    label: '모의 배송',
    short: 'F',
    showOrderFlow: true,
    showDelivery: true,
    realDelivery: false,
    // F조건은 '실제 배송이 없음'을 반복적으로 분명히 고지 (v6 §6.2, §19 기만 최소화)
    orderNotice:
      '이 주문은 체험용입니다. 실제 상품 배송과 결제는 발생하지 않으며, 약 72시간 후 앱에서 가상 배송완료가 표시됩니다.',
    deliveryNotice:
      '아래 배송 현황은 실제 배송이 아닌 가상 체험입니다. 실제로 전달되는 상품은 없습니다.',
  },
  C: {
    key: 'C',
    label: '단순 탐색',
    short: 'C',
    showOrderFlow: false, // 주문/배송 화면 없음 (v6 §6.2)
    showDelivery: false,
    realDelivery: false,
    // C조건은 '가장 선호하는 상품 선택'까지만 (주문/배송 의례 제거)
    orderNotice: '',
    deliveryNotice: '',
  },
}

export const DEFAULT_CONDITION = 'F'

export function normalizeCondition(raw) {
  if (!raw) return null
  const up = String(raw).trim().toUpperCase()
  return CONDITIONS[up] ? up : null
}

export function getCondition(key) {
  return CONDITIONS[normalizeCondition(key) || DEFAULT_CONDITION]
}

// ============================================================
// 측정 시점 정의 (v6 §7, T0~T7)
// ============================================================
// 실험은 7일에 걸쳐 진행되지만, 앱 데모/파일럿을 위해
// 시간가속(sim) 모드에서는 분 단위로 압축된 타임라인을 사용한다.

export const TIMEPOINTS = [
  { id: 'T0', label: '시작 전', when: '상품 탐색 시작 직전', offsetHours: 0 },
  { id: 'T1', label: '상품 선택 직후', when: '선호 상품 선택 직후', offsetHours: 0 },
  { id: 'T2', label: '주문 단계 직후', when: '주문 완료 직후', offsetHours: 0 },
  { id: 'T3', label: '6시간 후', when: '주문 약 6시간 후', offsetHours: 6 },
  { id: 'T4', label: '24시간 후', when: '주문 약 24시간 후', offsetHours: 24 },
  { id: 'T5', label: '72시간 후', when: '배송완료(수령) 시점', offsetHours: 72 },
  { id: 'T6', label: '96시간 후', when: 'T5 약 24시간 후', offsetHours: 96 },
  { id: 'T7', label: '7일 후', when: '시작 7일 후', offsetHours: 168 },
]

// 각 조건에서 해당 시점에 '주문/배송' 문맥 설문을 노출할지 여부
export function timepointAppliesTo(timepointId, conditionKey) {
  // C조건은 T2~T5의 주문/배송 문항 대신 '시간대응 설문'만 받는다.
  // 설문 자체는 모든 조건에서 동일 시점에 제공된다(v6 §6.2: 알림·측정시점 동일).
  return true
}
