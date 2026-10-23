import { Navigate, useNavigate } from 'react-router-dom'
import { useStudy } from '../context/StudyContext.jsx'
import { useScreenLog } from '../lib/useScreenLog.js'
import { fmtDateTime, estimatedArrival, arrivalPhrase } from '../lib/clock.js'

export default function OrderComplete() {
  const { state, condition } = useStudy()
  const navigate = useNavigate()
  useScreenLog('order_complete')

  if (!condition.showOrderFlow || !state.order) return <Navigate to="/" replace />

  const { orderedAt } = state.order
  const arrive = estimatedArrival(orderedAt)

  return (
    <div className="container">
      <div className="panel order-done">
        <div className="check">🎉</div>
        <h2>주문이 완료되었어요</h2>
        <p style={{ color: 'var(--muted)' }}>주문번호 DM{String(orderedAt).slice(-8)}</p>

        <div className="notice notice-info" style={{ textAlign: 'left', marginTop: 20 }}>
          <b>📦 {arrivalPhrase(orderedAt, state.sim)}</b><br />
          예상 도착: {fmtDateTime(arrive)}
        </div>

        {condition.deliveryNotice && (
          <div className={condition.realDelivery ? 'notice notice-info' : 'notice notice-warn'} style={{ textAlign: 'left' }}>
            {condition.realDelivery ? 'ℹ️ ' : '⚠️ '}
            {condition.deliveryNotice}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-block" onClick={() => navigate('/')}>쇼핑 계속하기</button>
          <button className="btn btn-rocket btn-block" onClick={() => navigate('/tracking')}>배송 조회</button>
        </div>
      </div>
    </div>
  )
}
