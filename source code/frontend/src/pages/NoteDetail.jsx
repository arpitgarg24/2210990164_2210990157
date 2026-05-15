import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import StarRating from '../components/StarRating'
import toast from 'react-hot-toast'
import { Eye, Bookmark, BookmarkCheck, Share2, Edit, Trash2, Users, Crown, ArrowLeft, Star } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

export default function NoteDetail() {
  const { id } = useParams()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    api.get(`/notes/${id}`).then(r => {
      setNote(r.data)
      setSubscriberCount(r.data.author?.subscribers?.length || 0)
      if (user) {
        setIsSubscribed(r.data.author?.subscribers?.includes(user._id))
        const myRating = r.data.ratings?.find(r => r.user?._id === user._id || r.user === user._id)
        if (myRating) { setRating(myRating.value); setReview(myRating.review || '') }
        setIsSaved(user.savedNotes?.includes(id))
      }
    }).catch(() => navigate('/explore')).finally(() => setLoading(false))
  }, [id])

  const handleRate = async () => {
    if (!user) return toast.error('Sign in to rate')
    if (!rating) return toast.error('Select a star rating')
    setSubmittingRating(true)
    try {
      const { data } = await api.post(`/notes/${id}/rate`, { value: rating, review })
      setNote(n => ({ ...n, ratings: data.ratings, averageRating: data.averageRating, ratingCount: data.ratingCount }))
      toast.success('Rating submitted!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmittingRating(false) }
  }

  const handleSave = async () => {
    if (!user) return toast.error('Sign in to save')
    try {
      const { data } = await api.post(`/notes/${id}/save`)
      setIsSaved(data.saved)
      updateUser({ ...user, savedNotes: data.savedNotes })
      toast.success(data.saved ? 'Saved!' : 'Removed from saved')
    } catch { toast.error('Failed') }
  }

  const handleSubscribe = async () => {
    if (!user) return toast.error('Sign in to subscribe')
    try {
      const { data } = await api.post(`/users/${note.author._id}/subscribe`)
      setIsSubscribed(data.subscribed)
      setSubscriberCount(data.subscriberCount)
      toast.success(data.subscribed ? `Subscribed to ${note.author.name}` : 'Unsubscribed')
    } catch { toast.error('Failed') }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this note? This cannot be undone.')) return
    setDeleting(true)
    try {
      await api.delete(`/notes/${id}`)
      toast.success('Note deleted')
      navigate('/explore')
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success('Link copied!')
  }

  if (loading) return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 32 }} />
      <div className="skeleton" style={{ height: 400 }} />
    </div>
  )

  if (!note) return null

  const isAuthor = user?._id === note.author?._id
  const avgRating = note.averageRating || 0

  return (
    <div style={{ background: 'var(--parchment)', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }}>
          {/* Main content */}
          <div>
            {/* Header */}
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: 32, border: '1px solid var(--border)', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span className="tag tag-neutral">{note.category}</span>
                {note.isPremium && <span className="tag tag-gold"><Crown size={10} /> Premium</span>}
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, lineHeight: 1.25, marginBottom: 12 }}>{note.title}</h1>
              <p style={{ color: 'var(--ink-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 20 }}>{note.description}</p>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Link to={`/profile/${note.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>
                    {note.author?.avatar ? <img src={note.author.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : note.author?.name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{note.author?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{format(new Date(note.createdAt), 'MMM d, yyyy')}</div>
                  </div>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={14} color="var(--ink-faint)" />
                  <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>{note.views} views</span>
                </div>
                {avgRating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={14} fill="var(--gold)" color="var(--gold)" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{avgRating}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>({note.ratingCount} ratings)</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm" onClick={handleSave}>
                  {isSaved ? <><BookmarkCheck size={14} /> Saved</> : <><Bookmark size={14} /> Save</>}
                </button>
                <button className="btn btn-outline btn-sm" onClick={handleShare}><Share2 size={14} /> Share</button>
                {isAuthor && (
                  <>
                    <Link to={`/notes/${id}/edit`} className="btn btn-outline btn-sm"><Edit size={14} /> Edit</Link>
                    <button className="btn btn-sm" style={{ background: 'var(--red-pale)', color: 'var(--red)', border: '1px solid #f5c6c3' }} onClick={handleDelete} disabled={deleting}>
                      <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            {note.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                {note.tags.map(t => <span key={t} className="tag tag-neutral">#{t}</span>)}
              </div>
            )}

            {/* Content */}
            <div style={{
              background: 'var(--cream)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)', padding: '32px', marginBottom: 24
            }}>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.85,
                color: 'var(--ink-soft)', whiteSpace: 'pre-wrap'
              }}>{note.content}</div>
            </div>

            {/* Rating Section */}
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 28, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Rate this Note</h3>
              {avgRating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 16px', background: 'var(--gold-pale)', borderRadius: 8 }}>
                  <Star size={18} fill="var(--gold)" color="var(--gold)" />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold)' }}>{avgRating}</span>
                  <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>out of 5 · {note.ratingCount} rating{note.ratingCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {user && !isAuthor ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 8 }}>Your rating:</p>
                    <StarRating value={rating} onChange={setRating} size={28} />
                  </div>
                  <textarea className="input textarea" placeholder="Leave a review (optional)..." value={review} onChange={e => setReview(e.target.value)} style={{ minHeight: 80 }} />
                  <button className="btn btn-gold" onClick={handleRate} disabled={submittingRating || !rating} style={{ width: 'fit-content' }}>
                    {submittingRating ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              ) : !user ? (
                <Link to="/auth" className="btn btn-outline">Sign in to rate</Link>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>You can't rate your own note.</p>
              )}

              {/* Reviews list */}
              {note.ratings?.filter(r => r.review).length > 0 && (
                <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 12 }}>Reviews</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {note.ratings.filter(r => r.review).map(r => (
                      <div key={r._id} style={{ padding: 14, background: 'var(--parchment-dark)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--gold)' }}>
                            {r.user?.name?.[0]}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{r.user?.name}</span>
                          <StarRating value={r.value} readonly size={12} />
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{r.review}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Author card */}
            <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Author</h3>
              <Link to={`/profile/${note.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                  {note.author?.avatar ? <img src={note.author.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : note.author?.name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{note.author?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={11} />{subscriberCount} subscribers
                  </div>
                </div>
              </Link>
              {note.author?.bio && <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, marginBottom: 12 }}>{note.author.bio}</p>}
              {user && !isAuthor && (
                <button className={`btn btn-sm ${isSubscribed ? 'btn-outline' : 'btn-teal'}`} style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubscribe}>
                  <Users size={13} /> {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
                </button>
              )}
            </div>

            {/* Note info */}
            <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Details</h3>
              {[
                { label: 'Category', value: note.category },
                { label: 'Published', value: formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }) },
                { label: 'Views', value: note.views },
                { label: 'Ratings', value: note.ratingCount },
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{d.label}</span>
                  <span style={{ fontWeight: 500 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 280px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
