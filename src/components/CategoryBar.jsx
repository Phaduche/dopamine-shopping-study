import { CATEGORIES } from '../data/products.js'

export default function CategoryBar({ active, onSelect }) {
  return (
    <div className="catbar">
      <div className="container">
        <nav className="catbar__inner" aria-label="카테고리">
          {CATEGORIES.map((c) => (
            <a
              key={c.id}
              href="#"
              className={active === c.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault()
                onSelect(c.id)
              }}
            >
              {c.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
