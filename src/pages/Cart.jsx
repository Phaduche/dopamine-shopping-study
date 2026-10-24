import { Navigate, useNavigate } from 'react-router-dom'
import Thumb from '../components/Thumb.jsx'
import { getProduct, formatPrice } from '../data/products.js'
import { useStudy } from '../context/StudyContext.jsx'
import { useScreenLog } from '../lib/useScreenLog.js'

export default function Cart() {
  const { state, condition, setQty, removeFromCart } = useStudy()
  const navigate = useNavigate()
  useScreenLog('cart')

  // C조건은 장바구니/주문 화면이 없음 (v6 §6.2)
  if (!condition.showOrderFlow) return <Navigate to="/" replace />

  const items = state.cart.map((c) => ({ ...c, product: getProduct(c.id) })).filter((c) => c.product)
  const total = items.reduce((a, b) => a + b.product.price * b.qty, 0)

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty">
          <div className="em">🛒</div>
          장바구니가 비어 있어요.
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => navigate('/')}>상품 둘러보기</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="panel">
        <h3>장바구니</h3>
        {items.map((it) => (
          <div className="cart-item" key={it.id}>
            <Thumb product={it.product} size="ci" />
            <div className="ci-info">
              <div className="ci-name">{it.product.name}</div>
              <div className="ci-price">{formatPrice(it.product.price * it.qty)}</div>
              <div style={{ marginTop: 8 }}>
                <span className="qty">
                  <button onClick={() => setQty(it.id, it.qty - 1)} aria-label="수량 감소">−</button>
                  <span>{it.qty}</span>
                  <button onClick={() => setQty(it.id, it.qty + 1)} aria-label="수량 증가">+</button>
                </span>
              </div>
            </div>
            <button className="btn-ghost" onClick={() => removeFromCart(it.id)}>삭제</button>
          </div>
        ))}

        <div className="summary total">
          <span>총 결제금액 (연구용 표시)</span>
          <span>{formatPrice(total)}</span>
        </div>

        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} onClick={() => navigate('/checkout')}>
          주문하기
        </button>
      </div>
    </div>
  )
}
