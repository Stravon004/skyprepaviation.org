import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  // Supabase embeds the token in the URL hash — the SDK picks it up on load
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message) } else { navigate('/dashboard') }
  }

  if (!ready) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center card space-y-4">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Verifying your reset link…</p>
        <p className="text-slate-600 text-xs">If nothing happens, your link may have expired. <Link to="/forgot-password" className="text-sky-400 hover:text-sky-300">Request a new one.</Link></p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold">✈</div>
            <span className="text-white font-bold text-xl">SkyPrep</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Set new password</h1>
          <p className="text-slate-400 mt-2">Choose a strong password for your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="Min. 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="input-field"
              placeholder="Same password again"
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
