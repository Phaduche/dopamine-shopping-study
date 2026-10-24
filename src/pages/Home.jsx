import { useMemo, useState } from 'react'
import CategoryBar from '../components/CategoryBar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { PRODUCTS, CATEGORIES } from '../data/products.js'
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

const QUICK = [
  { id: 'stationery', ic: '✏️', bg: '#FFF1C2' },
  { id: 'living', ic: '🧺', bg: '#D6F5E3' },
  { id: 'desk', ic: '🖥️', bg: '#DCE7FF' },
  { id: 'accessory', ic: '👝', bg: '#FDE0EC' },
  { id: 'organize', ic: '🗂️', bg: '#E9DEFF' },
  { id: 'all', ic: '🏷️', bg: '#FFE3D6' },
]

export default function Home() {
  const { state, condition } = useStudy()
  useScreenLog('home')
  const [cat, setCat] = useState('all')

  const ordered = useMemo(() => seededShuffle(PRODUCTS, state.pid || 'seed'), [state.pid])
  const list = cat === 'all' ? ordered : ordered.filter((p) => p.category === cat)
  const pick = (c) => {
    logger.logEvent('category_select', { category: c })
    setCat(c)
  }
  const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name || ''

  return (
    <>
      <CategoryBar active={cat} onSelect={pick} />
      <div className="container">
        {/* 번개배송 프로모 */}
        <div className="promo-strip">
          <span className="pm-ic">⚡</span>
          <div>
            <div className="pm-t">
              {condition.showOrderFlow ? '오늘 주문하면 내일 도착, 번개배송' : '마음에 드는 상품을 자유롭게 둘러보세요'}
            </div>
            <div className="pm-s">
              {condition.showOrderFlow ? '지금 담으면 바로 출발해요' : '천천히 비교하고 가장 끌리는 상품을 찾아보세요'}
            </div>
          </div>
        </div>

        {/* 카테고리 퀵 아이콘 */}
        <div className="quickcats">
          {QUICK.map((q) => (
            <div key={q.id} className={`quickcat ${cat === q.id ? 'sel' : ''}`} onClick={() => pick(q.id)} role="button" tabIndex={0}>
              <div className="qc-ic" style={{ background: q.bg }}>{q.ic}</div>
              <div className="qc-l">{catName(q.id)}</div>
            </div>
          ))}
        </div>

        <div className="hero">
          <div>
            <h2>오늘의 추천 상품</h2>
            <p>
              {condition.showOrderFlow
                ? '마음에 드는 상품을 담아 주문해 보세요'
                : '가장 마음에 드는 상품을 골라 보세요'}
            </p>
          </div>
          <div className="emoji">🛍️</div>
        </div>

        <div className="section-title">
          {cat === 'all' ? '지금 인기 있는 상품' : `${catName(cat)} 추천`}
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
