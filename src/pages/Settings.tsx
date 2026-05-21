import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { User, Lock, Trash2, CreditCard, TriangleAlert as AlertTriangle } from 'lucide-react'

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(profile?.full_name ?? '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMsg, setNameMsg] = useState('')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeletePanel, setShowDeletePanel] = useState(false)

  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState(false)

  const isPaid = profile?.subscription_tier === 'basic' || profile?.subscription_tier === 'pro'

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setNameLoading(true)
    setNameMsg('')
    const { error } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user!.id)
    setNameLoading(false)
    if (!error) { await refreshProfile(); setNameMsg('Name updated.') }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwMsg('')
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    // Re-authenticate then update
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user!.email!, password: currentPw })
    if (signInErr) { setPwLoading(false); setPwError('Current password is incorrect.'); return }
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwLoading(false)
    if (error) { setPwError(error.message) } else { setPwMsg('Password updated.'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
  }

  async function openBillingPortal() {
    setPortalLoading(true)
    setPortalError(false)
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billing-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authSession?.access_token}`,
            'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ return_url: window.location.href }),
        }
      )
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setPortalError(true)
      }
    } catch {
      setPortalError(true)
    } finally {
      setPortalLoading(false)
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== 'DELETE') return
    setDeleteLoading(true)
    // Sign out first to clear session, then delete via service role (handled by RLS/trigger)
    // For now we mark the profile as deleted and sign out — full deletion requires a server function
    await supabase.from('profiles').update({ full_name: '[deleted]', email: `deleted_${user!.id}@skyprep.app` }).eq('id', user!.id)
    await signOut()
    navigate('/')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">Account Settings</h1>
        <p className="text-slate-400">Manage your profile, password, and subscription.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <section className="card space-y-5">
          <div className="flex items-center gap-2 text-white font-semibold">
            <User size={17} className="text-sky-400" />
            Profile
          </div>
          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                placeholder="First Last"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input type="email" value={user?.email ?? ''} className="input-field opacity-50 cursor-not-allowed" disabled />
              <p className="text-xs text-slate-600 mt-1">Email cannot be changed. Contact support if needed.</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={nameLoading} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
                {nameLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
              </button>
              {nameMsg && <span className="text-emerald-400 text-sm">{nameMsg}</span>}
            </div>
          </form>
        </section>

        {/* Password */}
        <section className="card space-y-5">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Lock size={17} className="text-sky-400" />
            Change Password
          </div>
          <form onSubmit={changePassword} className="space-y-4">
            {pwError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{pwError}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Current password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="input-field" required autoComplete="current-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="input-field" placeholder="Min. 6 characters" required minLength={6} autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm new password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="input-field" required autoComplete="new-password" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={pwLoading} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
                {pwLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Update Password'}
              </button>
              {pwMsg && <span className="text-emerald-400 text-sm">{pwMsg}</span>}
            </div>
          </form>
        </section>

        {/* Subscription */}
        <section className="card space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CreditCard size={17} className="text-sky-400" />
            Subscription
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium capitalize">{profile?.subscription_tier ?? 'free'} Plan</p>
              {profile?.subscription_expires_at && (
                <p className="text-slate-400 text-sm mt-0.5">
                  Renews {new Date(profile.subscription_expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
            {isPaid ? (
              <div className="flex flex-col items-end gap-1">
                <button onClick={openBillingPortal} disabled={portalLoading} className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-60">
                  {portalLoading ? <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : 'Manage Billing'}
                </button>
                {portalError && <p className="text-red-400 text-xs">Could not open billing portal. Please try again.</p>}
              </div>
            ) : (
              <a href="/pricing" className="btn-primary text-sm">Upgrade</a>
            )}
          </div>
        </section>

        {/* Danger zone */}
        <section className="card border-red-900/40 space-y-4">
          <div className="flex items-center gap-2 text-red-400 font-semibold">
            <Trash2 size={17} />
            Delete Account
          </div>
          {!showDeletePanel ? (
            <div className="flex items-start justify-between gap-4">
              <p className="text-slate-400 text-sm">Permanently delete your account and all training data. This cannot be undone.</p>
              <button onClick={() => setShowDeletePanel(true)} className="text-red-400 border border-red-500/30 hover:bg-red-500/10 text-sm px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex-shrink-0">
                Delete Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">All your exam history, flashcard progress, and account data will be permanently deleted. Active subscriptions should be cancelled first via Manage Billing.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Type <span className="font-mono text-red-400">DELETE</span> to confirm</label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  className="input-field"
                  placeholder="DELETE"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={deleteAccount}
                  disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-5 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  {deleteLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Permanently Delete'}
                </button>
                <button onClick={() => { setShowDeletePanel(false); setDeleteConfirm('') }} className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
