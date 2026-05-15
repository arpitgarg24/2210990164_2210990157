import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, signup, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/') }, [user])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(form.email, form.password)
        toast.success(`Welcome back!`)
      } else {
        if (!form.name.trim()) return toast.error('Name is required')
        await signup(form.name, form.email, form.password)
        toast.success(`Welcome to NoteSphere, ${form.name}!`)
      }
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(160deg, var(--ink) 0%, #1a1510 50%, var(--parchment-dark) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Back link */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#888', textDecoration: 'none', fontSize: 13, marginBottom: 24, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = '#888'}
        ><ArrowLeft size={14} /> Back to home</Link>

        <div style={{
          background: 'var(--cream)', borderRadius: 'var(--radius-xl)',
          padding: '40px 36px', boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)', animation: 'fadeUp 0.4s ease'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: 'var(--ink)', borderRadius: 12, marginBottom: 12 }}>
              <BookOpen size={24} color="var(--gold)" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)' }}>
              Note<span style={{ color: 'var(--gold)' }}>Sphere</span>
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
              {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account and start sharing.'}
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--parchment-dark)', borderRadius: 8, padding: 3, marginBottom: 24
          }}>
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '9px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                background: tab === t ? 'var(--cream)' : 'transparent',
                color: tab === t ? 'var(--ink)' : 'var(--ink-muted)',
                boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s', textTransform: 'capitalize'
              }}>{t === 'login' ? 'Sign In' : 'Sign Up'}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'signup' && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required autoFocus />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoFocus={tab === 'login'} />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'} value={form.password} onChange={set('password')} required minLength={6} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', display: 'flex'
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4, justifyContent: 'center' }}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-muted)', marginTop: 20 }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setTab(tab === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13 }}>
              {tab === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(200,151,42,0.1)', border: '1px solid rgba(200,151,42,0.2)', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--gold)' }}>Demo: use any email & password (6+ chars) to sign up</p>
        </div>
      </div>
    </div>
  )
}
