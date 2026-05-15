import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Explore from './pages/Explore'
import NoteDetail from './pages/NoteDetail'
import CreateNote from './pages/CreateNote'
import EditNote from './pages/EditNote'
import Profile from './pages/Profile'
import SavedNotes from './pages/SavedNotes'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>
  return user ? children : <Navigate to="/auth" replace />
}

function AppRoutes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/create" element={<PrivateRoute><CreateNote /></PrivateRoute>} />
          <Route path="/notes/:id/edit" element={<PrivateRoute><EditNote /></PrivateRoute>} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/saved" element={<PrivateRoute><SavedNotes /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', background: '#0d0d0d', color: '#faf8f4', borderRadius: '8px' },
            success: { iconTheme: { primary: '#c8972a', secondary: '#0d0d0d' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
