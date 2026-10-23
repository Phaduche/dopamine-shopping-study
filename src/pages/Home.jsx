import { useMemo, useState } from 'react'
import CategoryBar from '../components/CategoryBar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { PRODUCTS } from '../data/products.js'
import { useStudy } from '../context/StudyContext.jsx'
import { useScreenLog } from '../lib/useScreenLog.js'
import * as logger from '../lib/logger.js'

// 참가자별로 정렬 순서를 무작위화(동일 참가자는 재방문 시 동일 순서) — v6 §7.2
function seededShuffle(arr, seedStr) {
  let seed = 0
  for (let i = 0; i < (seedStr || '').length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) % 2147483647
  const a = [...arr]
  const rng = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Home() {
  const { state, condition } = useStudy()
  useScreenLog('home')
  const [cat, setCat] = useState('all')

  const ordered = useMemo(() => seededShuffle(PRODUCTS, state.pid || 'seed'), [state.pid])
  const list = cat === 'all' ? ordered : ordered.filter((p) => p.category === cat)

  return (
    <>
      <CategoryBar
        active={cat}
        onSelect={(c) => {
          logger.logEvent('category_select', { category: c })
          setCat(c)
        }}
      />
      <div className="container">
        <div className="hero">
          <div>
            <h2>오늘의 추천 상품</h2>
            <p>
              {condition.showOrderFlow
                ? '마음에 드는 상품을 담아 주문해 보세요 · 번개배송'
                : '가장 마음에 드는 상품을 골라 보세요'}
            </p>
          </div>
          <div className="emoji">🛍️</div>
        </div>

        <div className="section-title">
          {condition.showOrderFlow ? '지금 인기 있는 상품' : '상품 둘러보기'}
        </div>
        <div className="grid">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} rank={i} />
          ))}
        </div>
      </div>
    </>
  )
}
