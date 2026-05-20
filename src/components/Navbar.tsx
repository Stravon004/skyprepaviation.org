import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50 shadow-xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">✈</div>
            <span className="font-bold text-white text-xl tracking-tight">SkyPrep</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
            <a href="#features" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Features</a>
            <a href="#testimonials" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Reviews</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm py-2 px-5">
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-4 py-2">Sign in</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-5">Start Free</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-3">
          <Link to="/pricing" className="block text-slate-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <a href="#features" className="block text-slate-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Features</a>
          <div className="pt-2 space-y-2">
            {user ? (
              <button onClick={() => { navigate('/dashboard'); setMobileOpen(false) }} className="btn-primary w-full text-sm">Dashboard</button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary w-full text-center text-sm block py-2" onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link to="/signup" className="btn-primary w-full text-center text-sm block py-2" onClick={() => setMobileOpen(false)}>Start Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
