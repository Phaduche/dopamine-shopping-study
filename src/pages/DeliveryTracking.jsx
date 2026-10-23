import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useStudy } from '../context/StudyContext.jsx'
import { useScreenLog } from '../lib/useScreenLog.js'
import * as logger from '../lib/logger.js'
import {
  DELIVERY_STAGES, DELIVERY_TOTAL_HOURS, elapsedHours, virtualNow,
  currentStageIndex, isDelivered, fmtDateTime, arrivalPhrase, estimatedArrival,
} from '../lib/clock.js'

export default function DeliveryTracking() {
  const { state, condition } = useStudy()
  const navigate = useNavigate()
  useScreenLog('delivery_tracking')
  const [, setTick] = useState(0)

  // C조건 또는 미주문 상태면 접근 불가
  if (!condition.showDelivery || !state.order) return <Navigate to="/" replace />

  const { orderedAt } = state.order

  // 배송조회 화면 '방문'을 로그로 기록 (v6 §15: 배송조회 횟수와 시각 / RQ4 확인행동)
  useEffect(() => {
    const hrs = elapsedHours(orderedAt, state.sim)
    logger.logEvent('delivery_check', {
      elapsedHours: Math.round(hrs * 10) / 10,
      stage: DELIVERY_STAGES[currentStageIndex(hrs)].id,
      trigger: 'visit',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 실시간 갱신 (가상 시계 표시 및 단계 진행)
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), state.sim > 0 ? 500 : 15000)
    return () => clearInterval(iv)
  }, [state.sim])

  const hrs = elapsedHours(orderedAt, state.sim)
  const stageIdx = currentStageIndex(hrs)
  const delivered = isDelivered(hrs)
  const progress = Math.min(100, Math.round((hrs / DELIVERY_TOTAL_HOURS) * 100))
  const vnow = virtualNow(orderedAt, state.sim)

  const manualRefresh = () => {
    logger.logEvent('delivery_check', {
      elapsedHours: Math.round(hrs * 10) / 10,
      stage: DELIVERY_STAGES[stageIdx].id,
      trigger: 'manual_refresh',
    })
    setTick((t) => t + 1)
  }

  return (
    <div className="container">
      <div className="panel">
        <div className="track-head">
          <div>
            <h3 style={{ margin: 0 }}>배송 조회</h3>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              주문번호 DM{String(orderedAt).slice(-8)}
            </div>
          </div>
          <div className="track-eta">
            {delivered ? '배송 완료' : arrivalPhrase(orderedAt, state.sim)}
            <small>예상 도착 {fmtDateTime(estimatedArrival(orderedAt))}</small>
          </div>
        </div>

        <div className="vclock">
          🕒 현재 시각(연구 기준): {fmtDateTime(vnow)}
          {state.sim > 0 && <> · 시간가속 {state.sim}× · 주문 후 {hrs.toFixed(1)}시간 경과</>}
        </div>

        <div className="progressbar"><div style={{ width: `${progress}%` }} /></div>

        {/* 조건별 배송 실재성 고지 */}
        {condition.deliveryNotice && (
          <div className={condition.realDelivery ? 'notice notice-info' : 'notice notice-warn'}>
            {condition.realDelivery ? 'ℹ️ ' : '⚠️ '}
            {condition.deliveryNotice}
          </div>
        )}

        {/* 타임라인 */}
        <div className="timeline">
          {DELIVERY_STAGES.map((stg, i) => {
            const stageTime = orderedAt + stg.fromHour * 60 * 60 * 1000
            const reached = hrs >= stg.fromHour
            const isCurrent = i === stageIdx && !delivered ? i === stageIdx : delivered && stg.id === 'delivered'
            const cls = reached ? (isCurrent ? 'done current' : 'done') : ''
            return (
              <div className={`tl-step ${cls}`} key={stg.id}>
                <div className="tl-dot">{reached ? stg.icon : '○'}</div>
                <div className="tl-body">
                  <div className="tl-label">
                    {stg.label}
                    {stg.id === 'delivered' && delivered && !condition.realDelivery && ' (가상)'}
                  </div>
                  <div className="tl-time">{reached ? fmtDateTime(stageTime) : fmtDateTime(stageTime) + ' 예정'}</div>
                </div>
              </div>
            )
          })}
        </div>

        {delivered && (
          <div className={condition.realDelivery ? 'notice notice-info' : 'notice notice-warn'} style={{ marginTop: 18 }}>
            {condition.realDelivery
              ? '✅ 배송이 완료되었습니다. 실제 상품은 연구 담당자를 통해 전달됩니다.'
              : '✅ 가상 배송이 완료되었습니다. 이 주문은 체험용이며 실제로 전달되는 상품은 없습니다.'}
          </div>
        )}

        <div className="refresh-row">
          <button className="btn" onClick={manualRefresh}>🔄 새로고침</button>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>쇼핑 계속하기</button>
        </div>
      </div>
    </div>
  )
}
