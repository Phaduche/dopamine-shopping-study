import { useEffect, useState } from 'react'
import SurveyModal from './SurveyModal.jsx'
import { useStudy } from '../context/StudyContext.jsx'
import { TIMEPOINTS } from '../lib/conditions.js'
import { elapsedHours } from '../lib/clock.js'

// 측정시점 T0~T7을 순차적으로 게이팅하여 '지금 응답할 설문'을 안내한다.
// - T0: 탐색 시작 전 (자동 안내)
// - T1: 선호 상품 선택 / 장바구니 담기 직후
// - T2: 주문 완료 직후 (C조건은 선호 선택 직후의 시간대응 설문)
// - T3~T7: 경과 가상시간(6/24/72/96/168h)에 따라 열림 (sim 모드에서 빠르게 도달)
export default function SurveyController() {
  const { state, condition } = useStudy()
  const [open, setOpen] = useState(false)
  const [tick, setTick] = useState(0)
  const r = state.responses || {}

  // 경과시간 기준 앵커: R/F는 주문시각, C는 T1(선호선택) 응답시각
  const anchor = state.order?.orderedAt || r.T2?.submittedAt || r.T1?.submittedAt || null
  const elapsed = elapsedHours(anchor, state.sim)

  const hasPreferredOrCart = condition.showOrderFlow ? state.cart.length > 0 : !!state.preferred
  const hasOrdered = condition.showOrderFlow ? !!state.order : !!state.preferred

  function dueTimepoint() {
    if (!r.T0) return 'T0'
    if (!r.T1 && hasPreferredOrCart) return 'T1'
    if (r.T1 && !r.T2 && hasOrdered) return 'T2'
    if (r.T2 && !r.T3 && elapsed >= 6) return 'T3'
    if (r.T3 && !r.T4 && elapsed >= 24) return 'T4'
    if (r.T4 && !r.T5 && elapsed >= 72) return 'T5'
    if (r.T5 && !r.T6 && elapsed >= 96) return 'T6'
    if (r.T6 && !r.T7 && elapsed >= 168) return 'T7'
    return null
  }

  const due = dueTimepoint()

  // 시간가속 모드에서 T3~T7이 자동으로 열리도록 주기적 체크
  useEffect(() => {
    if (!anchor) return
    const iv = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(iv)
  }, [anchor])

  // T0는 탐색 전 필수이므로 자동으로 모달을 띄운다
  useEffect(() => {
    if (due === 'T0' && state.ready) setOpen(true)
  }, [due, state.ready])

  if (!state.ready) return null

  const tp = TIMEPOINTS.find((t) => t.id === due)

  return (
    <>
      {due && !open && due !== 'T0' && (
        <div className="toast" style={{ cursor: 'pointer' }} onClick={() => setOpen(true)} role="button">
          📋 {tp?.label} 설문에 응답할 시간이에요 — 탭하여 응답하기
        </div>
      )}
      {open && due && (
        <SurveyModal
          timepoint={due}
          onClose={() => {
            setOpen(false)
          }}
        />
      )}
    </>
  )
}
