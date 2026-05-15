import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import api from '../utils/api'
import NoteCard from '../components/NoteCard'

const CATEGORIES = ['Mathematics','Science','Technology','History','Literature','Business','Arts','Language','Philosophy','Other']
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'top-rated', label: 'Top Rated' },
]

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const [notes, setNotes] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(params.get('search') || '')
  const [searchInput, setSearchInput] = useState(params.get('search') || '')
  const [category, setCategory] = useState(params.get('category') || '')
  const [sort, setSort] = useState(params.get('sort') || 'newest')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ sort, page, limit: 12 })
      if (search) q.set('search', search)
      if (category) q.set('category', category)
      const { data } = await api.get(`/notes?${q}`)
      setNotes(data.notes); setTotal(data.total); setPages(data.pages)
    } catch { } finally { setLoading(false) }
  }, [search, category, sort, page])

  useEffect(() => { fetchNotes() }, [fetchNotes])
  useEffect(() => { setPage(1) }, [search, category, sort])

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput) }
  const clearCategory = () => { setCategory(''); setParams({}) }

  const handleSaveToggle = (noteId, saved) => {
    setNotes(ns => ns.map(n => n._id === noteId ? { ...n, _saved: saved } : n))
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--parchment)' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', padding: '40px 0 32px', borderBottom: '3px solid var(--gold)' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'white', marginBottom: 20 }}>
            Explore Notes
          </h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, maxWidth: 600 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)' }} />
              <input
                className="input" placeholder="Search notes, topics, tags..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)}
                style={{ paddingLeft: 38, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
              />
            </div>
            <button type="submit" className="btn btn-gold">Search</button>
            <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} />
            </button>
          </form>
          {search && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#aaa' }}>Results for: </span>
              <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>"{search}"</span>
              <button onClick={() => { setSearch(''); setSearchInput('') }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filters bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            <button
              className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-outline'}`}
              onClick={clearCategory}
            >All</button>
            {CATEGORIES.map(c => (
              <button key={c}
                className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCategory(category === c ? '' : c)}
              >{c}</button>
            ))}
          </div>
          <select className="input select" value={sort} onChange={e => setSort(e.target.value)}
            style={{ width: 'auto', padding: '7px 14px', fontSize: 13 }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Results count */}
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20 }}>
          {loading ? 'Loading...' : `${total} note${total !== 1 ? 's' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="notes-grid">{[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)}</div>
        ) : notes.length > 0 ? (
          <>
            <div className="notes-grid">
              {notes.map(note => <NoteCard key={note._id} note={note} onSaveToggle={handleSaveToggle} />)}
            </div>
            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                {[...Array(pages)].map((_, i) => (
                  <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Search size={48} color="var(--border-strong)" style={{ marginBottom: 16 }} />
            <h3>No notes found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
