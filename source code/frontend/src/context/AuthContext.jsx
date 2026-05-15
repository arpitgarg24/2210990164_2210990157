import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ns_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ns_token')
    if (token) {
      api.get('/auth/me')
        .then(r => { setUser(r.data); localStorage.setItem('ns_user', JSON.stringify(r.data)) })
        .catch(() => { localStorage.removeItem('ns_token'); localStorage.removeItem('ns_user'); setUser(null) })
        .finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('ns_token', data.token)
    localStorage.setItem('ns_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const signup = async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password })
    localStorage.setItem('ns_token', data.token)
    localStorage.setItem('ns_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('ns_token')
    localStorage.removeItem('ns_user')
    setUser(null)
    toast.success('Logged out')
  }

  const updateUser = (updated) => {
    setUser(updated)
    localStorage.setItem('ns_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
