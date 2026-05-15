import { Link } from 'react-router-dom'
import { Star, Eye, Bookmark, BookmarkCheck, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'
import { useState } from 'react'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  Mathematics: '#1a6b6b', Science: '#2a6b1a', Technology: '#1a3b6b',
  History: '#6b4a1a', Literature: '#6b1a4a', Business: '#4a1a6b',
  Arts: '#6b1a1a', Language: '#1a5b6b', Philosophy: '#3b3b6b', Other: '#4a4a4a'
}

export default function NoteCard({ note, onSaveToggle }) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const isSaved = user?.savedNotes?.includes(note._id)
  const avgRating = note.averageRating || 0
  const catColor = CATEGORY_COLORS[note.category] || '#4a4a4a'

  const handleSave = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return toast.error('Sign in to save notes')
    setSaving(true)
    try {
      const { data } = await api.post(`/notes/${note._id}/save`)
      onSaveToggle?.(note._id, data.saved)
      toast.success(data.saved ? 'Note saved!' : 'Note removed')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <Link to={`/notes/${note._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Thumbnail / Header */}
        <div style={{
          height: 140, background: `linear-gradient(135deg, ${catColor}22 0%, ${catColor}44 100%)`,
          position: 'relative', overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {note.thumbnail ? (
            <img src={note.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          ) : (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', opacity: 0.15, color: catColor, fontWeight: 800 }}>
              {note.category?.[0]}
            </span>
          )}
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span className="tag" style={{ background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}33` }}>
              {note.category}
            </span>
          </div>
          {note.isPremium && (
            <div style={{ position: 'absolute', top: 10, right: 40 }}>
              <span className="tag tag-gold"><Crown size={10} /> Premium</span>
            </div>
          )}
          <button onClick={handleSave} disabled={saving} style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 6,
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s', backdropFilter: 'blur(4px)'
          }}>
            {isSaved ? <BookmarkCheck size={14} color="var(--gold)" /> : <Bookmark size={14} color="var(--ink-muted)" />}
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600,
            color: 'var(--ink)', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>{note.title}</h3>

          <p style={{
            fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>{note.description}</p>

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {note.tags.slice(0, 3).map(t => (
                <span key={t} className="tag tag-neutral" style={{ fontSize: 11 }}>#{t}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: 'var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: 'var(--gold)'
              }}>
                {note.author?.avatar
                  ? <img src={note.author.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : note.author?.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 500 }}>{note.author?.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {avgRating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={12} fill="var(--gold)" color="var(--gold)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{avgRating}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>({note.ratingCount})</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Eye size={12} color="var(--ink-faint)" />
                <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{note.views || 0}</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
            {note.createdAt ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }) : ''}
          </div>
        </div>
      </div>
    </Link>
  )
}
