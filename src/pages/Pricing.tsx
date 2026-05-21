import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { CircleCheck as CheckCircle, X, Zap, ArrowRight, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: '',
    description: 'Get started with the basics — no card required.',
    tier: null,
    features: [
      { text: '50 practice questions (PPL only)', included: true },
      { text: '20 flashcard reviews per day', included: true },
      { text: 'Basic performance tracking', included: true },
      { text: 'Full-length timed exams', included: false },
      { text: 'IFR / CPL / ATP question banks', included: false },
      { text: 'AI oral exam simulator', included: false },
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Basic',
    price: 19,
    period: '/month',
    description: 'Everything you need to ace your private pilot certificate.',
    tier: 'basic',
    badge: 'Most Popular',
    features: [
      { text: 'Full PPL & IFR question banks (5,000+ questions)', included: true },
      { text: 'Unlimited timed practice exams', included: true },
      { text: 'Unlimited flashcard reviews', included: true },
      { text: 'Detailed answer explanations', included: true },
      { text: 'Progress analytics by topic', included: true },
      { text: 'AI oral exam simulator (10 sessions/mo)', included: true },
      { text: 'CPL / ATP question banks', included: false },
    ],
    cta: 'Start Basic Plan',
    highlight: true,
  },
  {
    name: 'Pro',
    price: 39,
    period: '/month',
    description: 'The complete toolkit for serious career-track pilots.',
    tier: 'pro',
    features: [
      { text: 'All question banks: PPL, IFR, CPL, ATP', included: true },
      { text: 'Unlimited timed practice exams', included: true },
      { text: 'Unlimited flashcard reviews', included: true },
      { text: 'Detailed answer explanations', included: true },
      { text: 'Advanced analytics & weak area reports', included: true },
      { text: 'Unlimited AI oral exam sessions', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Start Pro Plan',
    highlight: false,
  },
]

export default function Pricing() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleUpgrade(tier: string) {
    if (!user) { navigate('/signup'); return }
    if (profile?.subscription_tier === tier) { navigate('/dashboard'); return }

    setError('')
    setLoadingTier(tier)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const origin = window.location.origin

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            plan: tier,
            successUrl: `${origin}/payment-success?plan=${tier}`,
            cancelUrl: `${origin}/pricing`,
          }),
        }
      )

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Unable to start checkout. Please try again.')
      }
    } catch {
      setError('Unable to start checkout. Please try again.')
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-4 py-1.5 text-sky-400 text-sm font-medium mb-6">
              <Zap size={14} />
              Simple, transparent pricing
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Invest in Your Pilot Certificate</h1>
            <p className="text-slate-400 text-xl max-w-xl mx-auto">
              A written exam re-test costs $175. Our Pro plan costs less than one retake. Pass the first time.
            </p>
          </div>

          {error && (
            <div className="max-w-md mx-auto mb-8 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const isCurrentPlan = profile?.subscription_tier === plan.tier || (!plan.tier && profile?.subscription_tier === 'free')
              const isLoading = loadingTier === plan.tier

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 flex flex-col ${
                    plan.highlight
                      ? 'bg-sky-600/10 border-2 border-sky-500/50 shadow-xl shadow-sky-500/10'
                      : 'bg-slate-900 border border-slate-800'
                  }`}
                >
                  {'badge' in plan && plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-sky-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">{plan.badge as string}</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                    <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-slate-400 text-sm">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map(f => (
                      <li key={f.text} className="flex items-start gap-2.5">
                        {f.included ? (
                          <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X size={16} className="text-slate-600 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${f.included ? 'text-slate-300' : 'text-slate-600'}`}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <div className={`w-full text-center py-3 px-6 rounded-xl font-semibold text-sm border ${plan.highlight ? 'border-sky-500/50 text-sky-400' : 'border-slate-700 text-slate-500'}`}>
                      Current Plan
                    </div>
                  ) : plan.tier ? (
                    <button
                      onClick={() => handleUpgrade(plan.tier!)}
                      disabled={isLoading}
                      className={`w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 ${
                        plan.highlight
                          ? 'bg-sky-600 hover:bg-sky-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                      }`}
                    >
                      {isLoading ? <Loader size={15} className="animate-spin" /> : <>{plan.cta} <ArrowRight size={15} /></>}
                    </button>
                  ) : (
                    <Link
                      to="/signup"
                      className="w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
                    >
                      {plan.cta} <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-12 text-center space-y-3">
            <p className="text-slate-500 text-sm">All plans come with a 7-day money-back guarantee. Cancel anytime.</p>
            <p className="text-slate-600 text-xs">
              By subscribing you agree to our{' '}
              <Link to="/terms" className="text-slate-500 hover:text-slate-300 underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-slate-500 hover:text-slate-300 underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
