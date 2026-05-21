import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CircleCheck as CheckCircle } from 'lucide-react'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) { setError(error.message) } else { navigate('/dashboard') }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold">✈</div>
            <span className="text-white font-bold text-xl">SkyPrep</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-2">Free forever. No credit card required.</p>
        </div>
        <div className="flex justify-center gap-4 mb-6 text-xs text-slate-500">
          {['Free to start', '10,000+ questions', 'Cancel anytime'].map(t => (
            <span key={t} className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" />{t}</span>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="First Last" required autoComplete="name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min. 6 characters" required minLength={6} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Free Account'}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">Sign in</Link>
          </p>
          <p className="text-center text-xs text-slate-600">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="text-slate-500 hover:text-slate-300 underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-slate-500 hover:text-slate-300 underline">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </div>
  )
}
