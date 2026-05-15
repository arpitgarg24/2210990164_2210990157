import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import NoteCard from '../components/NoteCard'
import toast from 'react-hot-toast'
import { Users, BookOpen, Star } from 'lucide-react'

export default function Profile() {
  const { id } = useParams()
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const isOwn = user?._id === id

  useEffect(() => {
    Promise.all([api.get(`/users/${id}`), api.get(`/users/${id}/notes`)])
      .then(([u, n]) => {
        setProfile(u.data); setNotes(n.data)
        setSubscriberCount(u.data.subscribers?.length || 0)
        setIsSubscribed(user?.subscribedTo?.includes(id))
        setEditForm({ name: u.data.name, bio: u.data.bio || '', avatar: u.data.avatar || '' })
      }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleSubscribe = async () => {
    if (!user) return toast.error('Sign in to subscribe')
    try {
      const { data } = await api.post(`/users/${id}/subscribe`)
      setIsSubscribed(data.subscribed)
      setSubscriberCount(data.subscriberCount)
      updateUser({ ...user, subscribedTo: data.subscribedTo })
      toast.success(data.subscribed ? `Subscribed!` : 'Unsubscribed')
    } catch { toast.error('Failed') }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', editForm)
      setProfile(p => ({ ...p, ...data }))
      updateUser({ ...user, ...data })
      setEditMode(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
  if (!profile) return <div className="empty-state"><h3>User not found</h3></div>

  const avgRating = notes.length > 0
    ? (notes.reduce((s, n) => s + (n.averageRating || 0), 0) / notes.length).toFixed(1)
    : '—'

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--parchment)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, var(--ink) 0%, #1a1510 100%)', padding: '48px 0 32px', borderBottom: '3px solid var(--gold)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'white', border: '4px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
              {profile.avatar ? <img src={profile.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : profile.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: 6 }}>{profile.name}</h1>
              {profile.bio && <p style={{ color: '#aaa', fontSize: 14, marginBottom: 12, maxWidth: 480 }}>{profile.bio}</p>}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { icon: <BookOpen size={14} />, value: notes.length, label: 'Notes' },
                  { icon: <Users size={14} />, value: subscriberCount, label: 'Subscribers' },
                  { icon: <Star size={14} />, value: avgRating, label: 'Avg Rating' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#ccc', fontSize: 13 }}>
                    <span style={{ color: 'var(--gold)' }}>{s.icon}</span>
                    <strong style={{ color: 'white' }}>{s.value}</strong> {s.label}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isOwn ? (
                <button className="btn btn-outline btn-sm" style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} onClick={() => setEditMode(!editMode)}>
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              ) : user && (
                <button className={`btn btn-sm ${isSubscribed ? 'btn-outline' : 'btn-gold'}`} onClick={handleSubscribe} style={isSubscribed ? { border: '1px solid rgba(255,255,255,0.2)', color: 'white' } : {}}>
                  <Users size={13} /> {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Edit profile form */}
        {editMode && isOwn && (
          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, marginBottom: 20 }}>Edit Profile</h2>
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Display Name</label>
                <input className="input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label className="input-label">Avatar URL</label>
                <input className="input" type="url" value={editForm.avatar} onChange={e => setEditForm(f => ({ ...f, avatar: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Bio</label>
                <textarea className="input textarea" value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} maxLength={200} style={{ minHeight: 80 }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, marginBottom: 20 }}>
          {isOwn ? 'Your Notes' : `Notes by ${profile.name}`}
        </h2>

        {notes.length > 0 ? (
          <div className="notes-grid">
            {notes.map(note => <NoteCard key={note._id} note={note} />)}
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={48} color="var(--border-strong)" style={{ marginBottom: 16 }} />
            <h3>No notes yet</h3>
            {isOwn && <Link to="/create" className="btn btn-gold" style={{ marginTop: 16 }}>Publish your first note</Link>}
          </div>
        )}
      </div>
    </div>
  )
}
