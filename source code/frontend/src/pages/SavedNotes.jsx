import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import NoteCard from '../components/NoteCard'
import { Bookmark, BookOpen } from 'lucide-react'

export default function SavedNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notes/saved').then(r => setNotes(r.data)).finally(() => setLoading(false))
  }, [])

  const handleSaveToggle = (noteId, saved) => {
    if (!saved) setNotes(ns => ns.filter(n => n._id !== noteId))
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--parchment)' }}>
      <div style={{ background: 'var(--ink)', padding: '40px 0 32px', borderBottom: '3px solid var(--gold)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bookmark size={24} color="var(--gold)" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'white' }}>Saved Notes</h1>
          </div>
          <p style={{ color: '#888', marginTop: 6 }}>{notes.length} saved note{notes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="container" style={{ padding: '32px 24px' }}>
        {loading ? (
          <div className="notes-grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300 }} />)}</div>
        ) : notes.length > 0 ? (
          <div className="notes-grid">
            {notes.map(note => <NoteCard key={note._id} note={note} onSaveToggle={handleSaveToggle} />)}
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={48} color="var(--border-strong)" style={{ marginBottom: 16 }} />
            <h3>No saved notes yet</h3>
            <p>Browse notes and save ones you'd like to revisit</p>
            <Link to="/explore" className="btn btn-gold" style={{ marginTop: 16 }}>Explore Notes</Link>
          </div>
        )}
      </div>
    </div>
  )
}
