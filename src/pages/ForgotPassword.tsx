import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message) } else { setSent(true) }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold">✈</div>
            <span className="text-white font-bold text-xl">SkyPrep</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Reset your password</h1>
          <p className="text-slate-400 mt-2">We'll send you a link to create a new password.</p>
        </div>

        {sent ? (
          <div className="card text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Check your inbox</p>
              <p className="text-slate-400 text-sm mt-1">We sent a reset link to <span className="text-slate-200">{email}</span>. It expires in 1 hour.</p>
            </div>
            <Link to="/login" className="btn-primary w-full flex items-center justify-center">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-slate-500">
              Remembered it? <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
