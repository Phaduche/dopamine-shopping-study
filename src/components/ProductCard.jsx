import { useNavigate } from 'react-router-dom'
import Thumb from './Thumb.jsx'
import { formatPrice } from '../data/products.js'
import * as logger from '../lib/logger.js'

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
      <Thumb thumb={product.thumb} />
      <div className="card__body">
        <div className="card__brand">{product.brand}</div>
        <div className="card__name">{product.name}</div>
        <div className="price-row">
          {discount > 0 && <span className="discount">{discount}%</span>}
          <span className="price">{formatPrice(product.price)}</span>
        </div>
        <div className="rating">
          <span className="stars">★</span>
          {product.rating.toFixed(1)} <span>({product.reviews.toLocaleString()})</span>
        </div>
        {product.rocket && <div style={{ marginTop: 2 }}><span className="badge-rocket">번개배송</span></div>}
      </div>
    </article>
  )
}
