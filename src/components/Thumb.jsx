import { getArt } from '../data/productArt.js'

// 상품 썸네일: 자체 제작 SVG 일러스트를 렌더 (외부 이미지·실제 상품사진 미사용, 저작권 안전)
export default function Thumb({ product, thumb, size = 'card' }) {
  const cls = size === 'pd' ? 'pd__thumb' : size === 'ci' ? 'ci-thumb' : 'card__thumb'
  const id = product?.id
  const svg = id ? getArt(id) : null
  if (svg) {
    return <div className={cls} dangerouslySetInnerHTML={{ __html: svg }} />
  }
  // 폴백 (혹시 product 미전달 시)
  return (
    <div className={cls} style={{ background: thumb?.bg || '#eee' }} aria-hidden="true">
      <span>{thumb?.emoji || '🛍️'}</span>
    </div>
  )
}
