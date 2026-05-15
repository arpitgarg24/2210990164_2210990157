import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, BookOpen, Users, Star, Sparkles } from 'lucide-react'
import api from '../utils/api'
import NoteCard from '../components/NoteCard'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Mathematics','Science','Technology','History','Literature','Business','Arts','Language','Philosophy','Other']

export default function Home() {
  const { user } = useAuth()
  const [featured, setFeatured] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ notes: 0, authors: 0, ratings: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/notes?sort=top-rated&limit=6'),
      api.get('/notes?sort=popular&limit=6'),
    ]).then(([feat, trend]) => {
      setFeatured(feat.data.notes)
      setTrending(trend.data.notes)
      setStats({ notes: feat.data.total, authors: 42, ratings: 128 })
    }).finally(() => setLoading(false))
  }, [])

  const handleSaveToggle = (noteId, saved) => {
    const update = notes => notes.map(n => n._id === noteId ? { ...n, _saved: saved } : n)
    setFeatured(update); setTrending(update)
  }

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, var(--ink) 0%, #1a1510 60%, #0d0d0d 100%)',
        color: 'white', padding: '100px 0 80px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,151,42,0.12) 0%, transparent 70%)' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 720, animation: 'fadeUp 0.6s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,151,42,0.15)', border: '1px solid rgba(200,151,42,0.3)', borderRadius: 100, padding: '5px 14px', marginBottom: 24 }}>
              <Sparkles size={13} color="var(--gold)" />
              <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.05em' }}>Knowledge Sharing Platform</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
              Share your knowledge,<br />
              <span style={{ color: 'var(--gold)' }}>inspire the world</span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#aaa', lineHeight: 1.7, marginBottom: 36, maxWidth: 560 }}>
              Publish your notes, discover curated knowledge from top authors, and rate the content that shapes your learning journey.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/explore" className="btn btn-gold btn-lg">
                Explore Notes <ArrowRight size={18} />
              </Link>
              {!user && (
                <Link to="/auth?tab=signup" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                  Start Publishing
                </Link>
              )}
              {user && (
                <Link to="/create" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <BookOpen size={18} /> Publish a Note
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, marginTop: 64, flexWrap: 'wrap', animation: 'fadeUp 0.6s 0.2s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            {[
              { icon: <BookOpen size={18} color="var(--gold)" />, value: stats.notes + '+', label: 'Notes Published' },
              { icon: <Users size={18} color="var(--gold)" />, value: '500+', label: 'Active Authors' },
              { icon: <Star size={18} color="var(--gold)" />, value: '4.8', label: 'Avg Rating' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(200,151,42,0.1)', border: '1px solid rgba(200,151,42,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '40px 0', background: 'var(--parchment-dark)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/explore?category=${cat}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 100, whiteSpace: 'nowrap',
                background: 'var(--cream)', border: '1px solid var(--border)',
                textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)',
                transition: 'all 0.15s', flexShrink: 0
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--ink)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--cream)'; e.currentTarget.style.color = 'var(--ink-soft)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >{cat}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Star size={18} color="var(--gold)" fill="var(--gold)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Top Rated</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>Featured Notes</h2>
            </div>
            <Link to="/explore?sort=top-rated" className="btn btn-outline btn-sm">View all <ArrowRight size={14} /></Link>
          </div>

          {loading ? (
            <div className="notes-grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)}</div>
          ) : featured.length > 0 ? (
            <div className="notes-grid">
              {featured.map(note => <NoteCard key={note._id} note={note} onSaveToggle={handleSaveToggle} />)}
            </div>
          ) : (
            <div className="empty-state">
              <BookOpen size={48} color="var(--border-strong)" style={{ marginBottom: 16 }} />
              <h3>No notes yet</h3>
              <p>Be the first to publish!</p>
              <Link to="/create" className="btn btn-gold" style={{ marginTop: 16 }}>Publish a Note</Link>
            </div>
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="section" style={{ background: 'var(--parchment-dark)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <TrendingUp size={18} color="var(--teal)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Trending</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>Most Popular</h2>
            </div>
            <Link to="/explore?sort=popular" className="btn btn-outline btn-sm">View all <ArrowRight size={14} /></Link>
          </div>
          {loading ? (
            <div className="notes-grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)}</div>
          ) : (
            <div className="notes-grid">
              {trending.map(note => <NoteCard key={note._id} note={note} onSaveToggle={handleSaveToggle} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding: '80px 0', background: 'var(--ink)', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'white', marginBottom: 16, fontWeight: 700 }}>
              Ready to share your knowledge?
            </h2>
            <p style={{ color: '#999', fontSize: '1.05rem', marginBottom: 32 }}>Join thousands of authors publishing their notes on NoteSphere.</p>
            <Link to="/auth?tab=signup" className="btn btn-gold btn-lg">Get started for free <ArrowRight size={18} /></Link>
          </div>
        </section>
      )}
    </div>
  )
}
