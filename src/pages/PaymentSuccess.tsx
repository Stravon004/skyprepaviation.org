import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { CircleCheck as CheckCircle, ArrowRight } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const plan = searchParams.get('plan') ?? 'student'
  const [verified, setVerified] = useState(false)

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
      if (data?.subscription_tier === plan || attempts >= 10) {
        clearInterval(interval)
        setVerified(true)
      }
    }, 1500)
    return () => clearInterval(interval)
  }, [user, plan])

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
            : 'Activating your subscription — this takes just a moment...'}
        </p>

        {!verified && (
          <div className="flex justify-center mb-8">
            <span className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
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
