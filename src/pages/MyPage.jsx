import { Link, useNavigate } from 'react-router-dom'
import Thumb from '../components/Thumb.jsx'
import { getProduct, formatPrice } from '../data/products.js'
import { useStudy } from '../context/StudyContext.jsx'
import { useScreenLog } from '../lib/useScreenLog.js'
import { fmtDateTime } from '../lib/clock.js'

export default function MyPage() {
  const { state, condition } = useStudy()
  const navigate = useNavigate()
  useScreenLog('mypage')

  const order = state.order
  const preferred = state.preferred ? getProduct(state.preferred) : null
  const doneCount = Object.keys(state.responses || {}).length

  return (
    <div className="container">
      <div className="panel">
        <h3>마이 페이지</h3>
        <div className="summary"><span>연구 참가자 ID</span><span>{state.pid}</span></div>
        <div className="summary"><span>완료한 설문</span><span>{doneCount} / 8 (T0~T7)</span></div>
      </div>

      {condition.showOrderFlow ? (
        <div className="panel">
          <h3>주문 내역</h3>
          {order ? (
            <>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>
                주문일시 {fmtDateTime(order.orderedAt)}
              </div>
              {order.items.map((it) => {
                const p = getProduct(it.id)
                if (!p) return null
                return (
                  <div className="cart-item" key={it.id}>
                    <Thumb product={p} size="ci" />
                    <div className="ci-info">
                      <div className="ci-name">{p.name}</div>
                      <div className="ci-price">{formatPrice(p.price * it.qty)} · 수량 {it.qty}</div>
                    </div>
                  </div>
                )
              })}
              <button className="btn btn-rocket btn-block" style={{ marginTop: 14 }} onClick={() => navigate('/tracking')}>
                배송 조회
              </button>
            </>
          ) : (
            <div className="empty"><div className="em">📦</div>아직 주문 내역이 없어요.</div>
          )}
        </div>
      ) : (
        <div className="panel">
          <h3>내가 선택한 상품</h3>
          {preferred ? (
            <div className="cart-item">
              <Thumb product={preferred} size="ci" />
              <div className="ci-info">
                <div className="ci-name">{preferred.name}</div>
                <div className="ci-price">{formatPrice(preferred.price)}</div>
              </div>
            </div>
          ) : (
            <div className="empty"><div className="em">🛍️</div>아직 선택한 상품이 없어요.</div>
          )}
        </div>
      )}
    </div>
  )
}
