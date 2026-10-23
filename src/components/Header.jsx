import { Link, useNavigate } from 'react-router-dom'
import { useStudy } from '../context/StudyContext.jsx'

export default function Header() {
  const { state, condition } = useStudy()
  const navigate = useNavigate()
  const cartCount = state.cart.reduce((a, b) => a + b.qty, 0)
  const showCart = condition.showOrderFlow

  return (
    <header className="header">
      <div className="container">
        <div className="header__top">
          <Link to="/" className="logo" aria-label="담아마켓 홈">
            담아<span>마켓</span>
            <small>연구용</small>
          </Link>
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault()
            }}
            role="search"
          >
            <input
              type="text"
              placeholder="찾는 상품을 검색해 보세요 (연구용 데모)"
              aria-label="상품 검색"
            />
            <button type="submit" aria-label="검색">🔍</button>
          </form>
          <nav className="header__icons">
            <Link to="/mypage" className="hicon">
              <span className="ic">👤</span>마이
            </Link>
            {showCart && (
              <Link to="/cart" className="hicon" aria-label="장바구니">
                <span className="ic">🛒</span>장바구니
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
