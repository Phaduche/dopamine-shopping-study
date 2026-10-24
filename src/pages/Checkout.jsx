import { Navigate, useNavigate } from 'react-router-dom'
import Thumb from '../components/Thumb.jsx'
import { getProduct, formatPrice } from '../data/products.js'
import { useStudy } from '../context/StudyContext.jsx'
import { useScreenLog } from '../lib/useScreenLog.js'
import * as logger from '../lib/logger.js'

export default function Checkout() {
  const { state, condition, placeOrder } = useStudy()
  const navigate = useNavigate()
  useScreenLog('checkout')

  if (!condition.showOrderFlow) return <Navigate to="/" replace />

  const items = state.cart.map((c) => ({ ...c, product: getProduct(c.id) })).filter((c) => c.product)
  if (items.length === 0 && !state.order) return <Navigate to="/cart" replace />

  const total = items.reduce((a, b) => a + b.product.price * b.qty, 0)

  const submit = () => {
    logger.logEvent('checkout_confirm', {})
    placeOrder()
    navigate('/order-complete')
  }

  return (
    <div className="container">
      <div className="panel">
        <h3>주문 / 결제</h3>

        {/* 주문 상품 */}
        {items.map((it) => (
          <div className="cart-item" key={it.id}>
            <Thumb product={it.product} size="ci" />
            <div className="ci-info">
              <div className="ci-name">{it.product.name}</div>
              <div className="ci-price">{formatPrice(it.product.price * it.qty)} · 수량 {it.qty}</div>
            </div>
          </div>
        ))}

        {/* 조건별 주문 고지 (R: 실제 전달 / F: 체험 주문) */}
        {condition.orderNotice && (
          <div className={condition.realDelivery ? 'notice notice-info' : 'notice notice-warn'}>
            {condition.realDelivery ? 'ℹ️ ' : '⚠️ '}
            {condition.orderNotice}
          </div>
        )}

        {/* 배송지 (연구용 더미) */}
        <div className="summary"><span>받는 분</span><span>연구 참가자 ({state.pid})</span></div>
        <div className="summary"><span>배송지</span><span>연구 담당자 지정 장소</span></div>

        {/* 결제 비활성화 영역 */}
        <div className="pay-disabled">
          <div className="big">💳 결제 단계는 비활성화되어 있습니다</div>
          실제 카드·계좌·간편결제 정보를 입력하지 않으며, 어떤 금액도 청구되지 않습니다.
        </div>

        <div className="summary total">
          <span>결제 예정금액 (표시용 · 청구 없음)</span>
          <span>{formatPrice(total)}</span>
        </div>

        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} onClick={submit}>
          주문 완료하기 (결제 없음)
        </button>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 10 }}>
          버튼을 누르면 결제 없이 주문이 접수되고 배송 현황 화면으로 이동합니다.
        </p>
      </div>
    </div>
  )
}
