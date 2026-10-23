// ============================================================
// 배송 타임라인 시계 (v6 §7: T2 주문 → T5 약 72시간 후 배송완료)
// ------------------------------------------------------------
// 실제 연구에서는 72시간이 실시간으로 흐른다.
// 데모/파일럿/심사 시연을 위해 '연구용 시간가속(sim)' 모드를 지원한다.
//   - sim=0 (기본): 실시간. 주문 후 실제 경과시간으로 배송단계가 진행.
//   - sim>0: 가속 배율. 예) sim=1440 이면 1분이 24시간처럼 흐름(72h → 3분).
//
// 배송 단계와 예상 도착일 표시는 이 시계가 제공하는 '가상 현재시각'을 기준으로 계산한다.
// ============================================================

export const DELIVERY_TOTAL_HOURS = 72

// 주문 시점 이후의 '가상 경과시간(시간 단위)'을 반환
export function elapsedHours(orderedAt, simRate, nowMs = Date.now()) {
  if (!orderedAt) return 0
  const realMs = nowMs - orderedAt
  const rate = simRate && simRate > 0 ? simRate : 1
  const virtualMs = realMs * rate
  return virtualMs / (1000 * 60 * 60)
}

// 주문 시점 + 경과시간을 더한 '가상 현재시각'(ms)
export function virtualNow(orderedAt, simRate, nowMs = Date.now()) {
  if (!orderedAt) return nowMs
  const rate = simRate && simRate > 0 ? simRate : 1
  return orderedAt + (nowMs - orderedAt) * rate
}

// 배송 단계 정의 (쿠팡형 단계 흐름을 가상 브랜드로 구현)
// 각 단계는 전체 72시간 중 시작 비율(fromHour)을 가진다.
export const DELIVERY_STAGES = [
  { id: 'paid', label: '주문 완료', fromHour: 0, icon: '📝' },
  { id: 'preparing', label: '상품 준비중', fromHour: 2, icon: '📦' },
  { id: 'shipped', label: '집화 완료', fromHour: 18, icon: '🏷️' },
  { id: 'intransit', label: '배송중', fromHour: 48, icon: '🚚' },
  { id: 'delivered', label: '배송 완료', fromHour: 72, icon: '✅' },
]

// 현재 경과시간으로 '도달한 마지막 단계 인덱스'를 계산
export function currentStageIndex(hours) {
  let idx = 0
  for (let i = 0; i < DELIVERY_STAGES.length; i++) {
    if (hours >= DELIVERY_STAGES[i].fromHour) idx = i
  }
  return idx
}

export function isDelivered(hours) {
  return hours >= DELIVERY_TOTAL_HOURS
}

// 예상 도착일 = 주문시각 + 72시간 (가상). 날짜가 실시간으로 바뀌는 표시에 사용.
export function estimatedArrival(orderedAt) {
  if (!orderedAt) return null
  return orderedAt + DELIVERY_TOTAL_HOURS * 60 * 60 * 1000
}

// ---- 날짜/시각 포맷 (쿠팡형 '내일(수) 도착' 스타일) ----
const WEEK = ['일', '월', '화', '수', '목', '금', '토']

export function fmtDateTime(ms) {
  const d = new Date(ms)
  const mm = d.getMonth() + 1
  const dd = d.getDate()
  const w = WEEK[d.getDay()]
  let h = d.getHours()
  const min = String(d.getMinutes()).padStart(2, '0')
  const ampm = h < 12 ? '오전' : '오후'
  h = h % 12
  if (h === 0) h = 12
  return `${mm}월 ${dd}일 (${w}) ${ampm} ${h}:${min}`
}

export function fmtDate(ms) {
  const d = new Date(ms)
  const mm = d.getMonth() + 1
  const dd = d.getDate()
  const w = WEEK[d.getDay()]
  return `${mm}/${dd} (${w})`
}

// '도착 보장' 문구: 가상 현재시각 대비 도착일의 상대 표현
export function arrivalPhrase(orderedAt, simRate, nowMs = Date.now()) {
  const arrive = estimatedArrival(orderedAt)
  if (!arrive) return ''
  const vnow = virtualNow(orderedAt, simRate, nowMs)
  const vDay = new Date(vnow); vDay.setHours(0, 0, 0, 0)
  const aDay = new Date(arrive); aDay.setHours(0, 0, 0, 0)
  const diffDays = Math.round((aDay - vDay) / (1000 * 60 * 60 * 24))
  const w = WEEK[new Date(arrive).getDay()]
  let rel = ''
  if (diffDays <= 0) rel = '오늘'
  else if (diffDays === 1) rel = '내일'
  else if (diffDays === 2) rel = '모레'
  else rel = `${diffDays}일 후`
  return `${rel}(${w}) 도착 예정`
}
