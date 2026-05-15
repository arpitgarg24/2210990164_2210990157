import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--ink)', color: 'var(--parchment)',
      borderTop: '1px solid #222', padding: '48px 0 32px'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: 'var(--gold)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={16} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>NoteSphere</span>
            </div>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>
              Publish, discover, and rate notes from brilliant minds around the world.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 14 }}>Explore</h4>
            {['/', '/explore', '/create'].map((path, i) => (
              <Link key={path} to={path} style={{ display: 'block', fontSize: 14, color: '#ccc', textDecoration: 'none', marginBottom: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
              >{['Home', 'Explore Notes', 'Publish a Note'][i]}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 14 }}>Categories</h4>
            {['Mathematics', 'Science', 'Technology', 'Literature', 'History'].map(c => (
              <Link key={c} to={`/explore?category=${c}`} style={{ display: 'block', fontSize: 14, color: '#ccc', textDecoration: 'none', marginBottom: 8 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
              >{c}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #222', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#666' }}>© {new Date().getFullYear()} NoteSphere. All rights reserved.</p>
          <p style={{ fontSize: 12, color: '#666' }}>Built with React, Node.js & MongoDB</p>
        </div>
      </div>
    </footer>
  )
}
