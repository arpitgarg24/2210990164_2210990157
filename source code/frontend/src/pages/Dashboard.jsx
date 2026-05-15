import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Eye, Star, BookOpen, Users, PenSquare, Trash2, Edit, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/users/${user._id}/notes`).then(r => setNotes(r.data)).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return
    try {
      await api.delete(`/notes/${id}`)
      setNotes(ns => ns.filter(n => n._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const totalViews = notes.reduce((s, n) => s + (n.views || 0), 0)
  const totalRatings = notes.reduce((s, n) => s + (n.ratingCount || 0), 0)
  const avgRating = notes.length ? (notes.reduce((s, n) => s + (n.averageRating || 0), 0) / notes.filter(n => n.averageRating > 0).length || 0).toFixed(1) : 0

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--parchment)' }}>
      <div style={{ background: 'var(--ink)', padding: '40px 0 32px', borderBottom: '3px solid var(--gold)' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Welcome back, {user.name?.split(' ')[0]}!</p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { icon: <BookOpen size={20} color="var(--gold)" />, value: notes.length, label: 'Total Notes', color: 'var(--gold-pale)' },
            { icon: <Eye size={20} color="var(--teal)" />, value: totalViews.toLocaleString(), label: 'Total Views', color: 'var(--teal-pale)' },
            { icon: <Star size={20} color="var(--gold)" />, value: avgRating > 0 ? avgRating : '—', label: 'Avg Rating', color: 'var(--gold-pale)' },
            { icon: <Users size={20} color="var(--teal)" />, value: user.subscribers?.length || 0, label: 'Subscribers', color: 'var(--teal-pale)' },
            { icon: <TrendingUp size={20} color="var(--teal)" />, value: totalRatings, label: 'Total Ratings', color: 'var(--teal-pale)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <div style={{ width: 40, height: 40, background: s.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Notes table */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600 }}>Your Notes</h2>
          <Link to="/create" className="btn btn-gold btn-sm"><PenSquare size={14} /> New Note</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
          </div>
        ) : notes.length > 0 ? (
          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {notes.map((note, i) => (
              <div key={note._id} style={{
                display: 'grid', gridTemplateColumns: '1fr auto',
                padding: '16px 20px', gap: 12, alignItems: 'center',
                borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--parchment-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <Link to={`/notes/${note._id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', textDecoration: 'none', display: 'block', marginBottom: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--ink)'}
                  >{note.title}</Link>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--ink-faint)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={11} />{note.views || 0}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={11} />{note.averageRating || 0} ({note.ratingCount || 0})</span>
                    <span>{note.category}</span>
                    <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link to={`/notes/${note._id}/edit`} className="btn btn-outline btn-sm"><Edit size={13} /></Link>
                  <button className="btn btn-sm" style={{ background: 'var(--red-pale)', color: 'var(--red)', border: '1px solid #f5c6c3' }} onClick={() => handleDelete(note._id)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={48} color="var(--border-strong)" style={{ marginBottom: 16 }} />
            <h3>No notes published yet</h3>
            <Link to="/create" className="btn btn-gold" style={{ marginTop: 16 }}><PenSquare size={14} /> Publish your first note</Link>
          </div>
        )}
      </div>
    </div>
  )
}
