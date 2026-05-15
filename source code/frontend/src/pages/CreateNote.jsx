import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { PenSquare, Crown, Tag, X } from 'lucide-react'

const CATEGORIES = ['Mathematics','Science','Technology','History','Literature','Business','Arts','Language','Philosophy','Other']

function NoteForm({ initialData = {}, onSubmit, loading, title, submitLabel }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    content: initialData.content || '',
    category: initialData.category || '',
    tags: initialData.tags || [],
    isPremium: initialData.isPremium || false,
    thumbnail: initialData.thumbnail || '',
  })
  const [tagInput, setTagInput] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setCheck = k => e => setForm(f => ({ ...f, [k]: e.target.checked }))

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }))
      setTagInput('')
    }
  }

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="input-group">
        <label className="input-label">Title *</label>
        <input className="input" placeholder="Give your note a compelling title..." value={form.title} onChange={set('title')} required maxLength={150} />
      </div>

      <div className="input-group">
        <label className="input-label">Short Description *</label>
        <textarea className="input textarea" placeholder="Briefly describe what this note covers (max 500 chars)..." value={form.description} onChange={set('description')} required maxLength={500} style={{ minHeight: 80 }} />
      </div>

      <div className="input-group">
        <label className="input-label">Category *</label>
        <select className="input select" value={form.category} onChange={set('category')} required>
          <option value="">Select a category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="input-group">
        <label className="input-label">Content *</label>
        <textarea className="input textarea" placeholder="Write your full note content here. You can use plain text formatting..." value={form.content} onChange={set('content')} required style={{ minHeight: 320, fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 1.7 }} />
        <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{form.content.length} characters</span>
      </div>

      <div className="input-group">
        <label className="input-label">Tags (up to 8)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Add a tag and press Enter" value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
          <button type="button" className="btn btn-outline" onClick={addTag}><Tag size={14} /></button>
        </div>
        {form.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {form.tags.map(t => (
              <span key={t} className="tag tag-neutral" style={{ gap: 4, cursor: 'default' }}>
                #{t}
                <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--ink-muted)' }}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="input-group">
        <label className="input-label">Thumbnail URL (optional)</label>
        <input className="input" type="url" placeholder="https://example.com/image.jpg" value={form.thumbnail} onChange={set('thumbnail')} />
        {form.thumbnail && <img src={form.thumbnail} alt="" style={{ height: 80, objectFit: 'cover', borderRadius: 6, marginTop: 6, border: '1px solid var(--border)' }} onError={e => e.target.style.display = 'none'} />}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '14px 16px', border: '1.5px solid var(--border)', borderRadius: 8, background: form.isPremium ? 'var(--gold-pale)' : 'transparent', transition: 'all 0.15s' }}>
        <input type="checkbox" checked={form.isPremium} onChange={setCheck('isPremium')} style={{ width: 16, height: 16 }} />
        <Crown size={16} color={form.isPremium ? 'var(--gold)' : 'var(--ink-muted)'} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Mark as Premium</div>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Flag this as premium quality content</div>
        </div>
      </label>

      <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
        <button type="submit" className="btn btn-gold btn-lg" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
          {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><PenSquare size={16} /> {submitLabel}</>}
        </button>
      </div>
    </form>
  )
}

export function CreateNote() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (form) => {
    setLoading(true)
    try {
      const { data } = await api.post('/notes', form)
      toast.success('Note published!')
      navigate(`/notes/${data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Publish a Note</h1>
        <p style={{ color: 'var(--ink-muted)' }}>Share your knowledge with the NoteSphere community.</p>
      </div>
      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
        <NoteForm onSubmit={handleSubmit} loading={loading} submitLabel="Publish Note" />
      </div>
    </div>
  )
}

export default CreateNote
