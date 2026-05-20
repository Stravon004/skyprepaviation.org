import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Exam from './pages/Exam'
import Flashcards from './pages/Flashcards'
import OralSim from './pages/OralSim'
import Results from './pages/Results'
import Pricing from './pages/Pricing'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/exam" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
        <Route path="/oral-sim" element={<ProtectedRoute><OralSim /></ProtectedRoute>} />
        <Route path="/results/:sessionId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
