import { useState } from 'react'
import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, readonly = false, size = 20 }) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          fill={n <= display ? 'var(--gold)' : 'none'}
          color={n <= display ? 'var(--gold)' : 'var(--border-strong)'}
          style={{ cursor: readonly ? 'default' : 'pointer', transition: 'all 0.1s' }}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(n)}
        />
      ))}
    </div>
  )
}
