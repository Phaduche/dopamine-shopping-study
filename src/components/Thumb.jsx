// 상품 썸네일: 외부 이미지 없이 이모지 + 배경색으로 생성 (저작권 안전)
export default function Thumb({ thumb, size = 'card' }) {
  const style = { background: thumb?.bg || '#eee' }
  const cls = size === 'pd' ? 'pd__thumb' : size === 'ci' ? 'ci-thumb' : 'card__thumb'
  return (
    <div className={cls} style={style} aria-hidden="true">
      <span>{thumb?.emoji || '🛍️'}</span>
    </div>
  )
}
