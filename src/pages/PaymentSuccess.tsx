import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { CircleCheck as CheckCircle, ArrowRight } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const { user, refreshProfile } = useAuth()
  const plan = searchParams.get('plan') ?? 'basic'
  const [verified, setVerified] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!user) return
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const { data } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle()

      const active = data?.subscription_tier === 'basic' || data?.subscription_tier === 'pro'
      if (active) {
        clearInterval(interval)
        await refreshProfile()
        setVerified(true)
      } else if (attempts >= 30) {
        clearInterval(interval)
        setTimedOut(true)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Payment Successful!</h1>
        <p className="text-slate-400 mb-2">
          Welcome to the <span className="text-white font-semibold capitalize">{plan}</span> plan.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          {verified
            ? 'Your account has been upgraded. All features are now unlocked.'
            : timedOut
            ? 'This is taking longer than expected. Your payment was received — check your email or refresh below.'
            : 'Activating your subscription — this takes just a moment...'}
        </p>

        {!verified && !timedOut && (
          <div className="flex justify-center mb-8">
            <span className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {timedOut && (
          <div className="flex flex-col items-center gap-3 mb-8">
            <button onClick={() => window.location.reload()} className="btn-secondary text-sm">
              Refresh Page
            </button>
            <a href="mailto:support@skyprep.app" className="text-slate-500 text-xs hover:text-slate-300 transition-colors">
              Contact support
            </a>
          </div>
        )}

        {verified && (
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
            Go to Dashboard <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  )
}
