import { useNavigate } from 'react-router-dom'
import Thumb from './Thumb.jsx'
import { formatPrice } from '../data/products.js'
import * as logger from '../lib/logger.js'

const WEEK = ['일', '월', '화', '수', '목', '금', '토']
function tomorrowLabel() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return WEEK[d.getDay()]
}

export default function ProductCard({ product, rank }) {
  const navigate = useNavigate()
  const discount = Math.round((1 - product.price / product.listPrice) * 100)

  return (
    <article
      className="card"
      onClick={() => {
        logger.logEvent('product_view', { productId: product.id, from: 'grid', rank })
        navigate(`/product/${product.id}`)
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/product/${product.id}`)
      }}
    >
      <Thumb product={product} />
      <div className="card__body">
        <div className="card__brand">{product.brand}</div>
        <div className="card__name">{product.name}</div>
        <div className="price-row">
          {discount > 0 && <span className="discount">{discount}%</span>}
          <span className="price">{product.price.toLocaleString('ko-KR')}</span>
          <span className="won">원</span>
        </div>
        <div className="rating">
          <span className="stars">★★★★★</span>
          {product.rating.toFixed(1)} <span>({product.reviews.toLocaleString()})</span>
        </div>
        {product.rocket ? (
          <div className="card__deliv">
            <span className="badge-rocket">번개배송</span> <b>내일({tomorrowLabel()}) 도착 보장</b>
          </div>
        ) : (
          <div className="card__deliv" style={{ color: 'var(--muted)' }}>모레 도착 예정</div>
        )}
      </div>
    </article>
  )
}
