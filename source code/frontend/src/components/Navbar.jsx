import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, PenSquare, Search, Menu, X, Bookmark, LayoutDashboard, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(250,248,244,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, background: 'var(--ink)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BookOpen size={18} color="#c8972a" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)' }}>
            Note<span style={{ color: 'var(--gold)' }}>Sphere</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {[
            { to: '/', label: 'Home' },
            { to: '/explore', label: 'Explore' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 14px', borderRadius: 6, textDecoration: 'none',
              fontSize: 14, fontWeight: 500,
              color: isActive(link.to) ? 'var(--ink)' : 'var(--ink-muted)',
              background: isActive(link.to) ? 'var(--parchment-dark)' : 'transparent',
              transition: 'all 0.15s'
            }}>{link.label}</Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/explore" className="btn btn-ghost btn-sm" style={{ padding: '7px' }}>
            <Search size={16} />
          </Link>

          {user ? (
            <>
              <Link to="/create" className="btn btn-gold btn-sm">
                <PenSquare size={14} /> Publish
              </Link>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--parchment-dark)', border: '1px solid var(--border)',
                    borderRadius: 100, padding: '5px 12px 5px 5px', cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--ink)', color: 'var(--gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700
                  }}>
                    {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' }}>{user.name?.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setDropdownOpen(false)} />
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 100,
                      background: 'var(--cream)', border: '1px solid var(--border)',
                      borderRadius: 12, padding: 6, minWidth: 180,
                      boxShadow: 'var(--shadow-lg)', animation: 'fadeUp 0.15s ease'
                    }}>
                      {[
                        { to: `/profile/${user._id}`, icon: <User size={14}/>, label: 'My Profile' },
                        { to: '/dashboard', icon: <LayoutDashboard size={14}/>, label: 'Dashboard' },
                        { to: '/saved', icon: <Bookmark size={14}/>, label: 'Saved Notes' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
                          color: 'var(--ink-soft)', fontSize: 14, fontWeight: 500,
                          transition: 'background 0.1s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--parchment-dark)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >{item.icon}{item.label}</Link>
                      ))}
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      <button onClick={() => { logout(); setDropdownOpen(false); navigate('/') }} style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '9px 12px', borderRadius: 8, border: 'none', background: 'transparent',
                        color: 'var(--red)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                        transition: 'background 0.1s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--red-pale)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      ><LogOut size={14}/>Sign out</button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-outline btn-sm">Sign in</Link>
              <Link to="/auth?tab=signup" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}

          <button className="btn btn-ghost btn-sm" style={{ display: 'none', padding: 7 }} onClick={() => setMenuOpen(!menuOpen)} id="mobile-menu-btn">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
