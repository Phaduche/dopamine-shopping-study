import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Thumb from '../components/Thumb.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { getProduct, PRODUCTS, formatPrice } from '../data/products.js'
import { useStudy } from '../context/StudyContext.jsx'
import { useScreenLog } from '../lib/useScreenLog.js'
import * as logger from '../lib/logger.js'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { condition, addToCart, selectPreferred, state } = useStudy()
  const product = getProduct(id)
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState('')
  useScreenLog('product_detail', { productId: id })

  // 상세 진입 = 상품 조회 로그 (grid 외 직접 진입 포함)
  useEffect(() => {
    logger.logEvent('product_view', { productId: id, from: 'detail' })
  }, [id])

  const recommends = useMemo(
    () => PRODUCTS.filter((p) => p.id !== id && p.category === product?.category).slice(0, 4),
    [id, product],
  )

  if (!product) {
    return (
      <div className="container">
        <div className="empty"><div className="em">🔍</div>상품을 찾을 수 없습니다.</div>
      </div>
    )
  }

  const discount = Math.round((1 - product.price / product.listPrice) * 100)
  const isPreferred = state.preferred === product.id

  const showToast = (m) => {
    setToast(m)
    setTimeout(() => setToast(''), 1800)
  }

  return (
    <div className="container">
      <div className="pd">
        <Thumb product={product} size="pd" />
        <div>
          <div className="pd__brand">{product.brand}</div>
          <h1 className="pd__title">{product.name}</h1>
          <div className="rating" style={{ fontSize: 13 }}>
            <span className="stars">★★★★★</span> {product.rating.toFixed(1)} · 후기 {product.reviews.toLocaleString()}개
          </div>

          <div className="pd__perks">
            {product.rocket && <span className="perk blue">⚡ 번개배송</span>}
            <span className="perk green">무료배송</span>
            <span className="perk">연구용 포인트 적립</span>
          </div>

          <div className="pd__price">
            <div className="price-row">
              {discount > 0 && <span className="discount">{discount}%</span>}
              <span className="price">{formatPrice(product.price)}</span>
              {discount > 0 && <span className="listprice">{formatPrice(product.listPrice)}</span>}
            </div>
          </div>

          <div className="pd__meta">
            {product.rocket && (
              <div className="row">
                <span className="k">배송</span>
                <span><span className="badge-rocket">번개배송</span> 내일 도착 예정 (연구용 표시)</span>
              </div>
            )}
            <div className="row"><span className="k">적립</span><span>연구용 포인트 {Math.round(product.price * 0.01)}P</span></div>
            <div className="row"><span className="k">수량</span>
              <span className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="수량 감소">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="수량 증가">+</button>
              </span>
            </div>
          </div>

          {condition.showOrderFlow ? (
            <div className="pd__actions">
              <button
                className="btn"
                onClick={() => {
                  addToCart(product.id, qty)
                  showToast('장바구니에 담았어요')
                }}
              >
                🛒 장바구니 담기
              </button>
              <button
                className="btn btn-rocket"
                onClick={() => {
                  addToCart(product.id, qty)
                  navigate('/cart')
                }}
              >
                바로 구매
              </button>
            </div>
          ) : (
            <div className="pd__actions">
              <button
                className={isPreferred ? 'btn btn-primary' : 'btn btn-primary'}
                onClick={() => {
                  selectPreferred(product.id)
                  showToast('가장 마음에 드는 상품으로 선택했어요')
                }}
              >
                {isPreferred ? '✓ 선택한 상품' : '이 상품을 선택하기'}
              </button>
            </div>
          )}

          <div className="pd__desc">{product.desc}</div>
        </div>
      </div>

      {/* 추가 상품 탐색 (v6 §7.3: '다른 상품 더 보기' 행동 로그) */}
      {recommends.length > 0 && (
        <>
          <div className="section-title">함께 둘러보면 좋은 상품</div>
          <div className="grid">
            {recommends.map((p, i) => (
              <div
                key={p.id}
                onClick={() => {
                  logger.logEvent('extra_browse', { from: product.id, to: p.id })
                  logger.logEvent('product_compare', { from: product.id, to: p.id })
                }}
              >
                <ProductCard product={p} rank={i} />
              </div>
            ))}
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
