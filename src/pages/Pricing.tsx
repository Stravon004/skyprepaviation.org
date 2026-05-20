import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { CircleCheck as CheckCircle, X, Zap, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: '',
    description: 'Get started with the basics — no card required.',
    features: [
      { text: '50 practice questions (PPL only)', included: true },
      { text: '20 flashcard reviews per day', included: true },
      { text: 'Basic performance tracking', included: true },
      { text: 'Full-length timed exams', included: false },
      { text: 'IFR / CPL / ATP question banks', included: false },
      { text: 'AI oral exam simulator', included: false },
    ],
    cta: 'Start Free',
    ctaLink: '/signup',
    highlight: false,
  },
  {
    name: 'Student',
    price: 19,
    period: '/month',
    description: 'Everything you need to ace your private pilot certificate.',
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
    cta: 'Start Student Plan',
    ctaLink: '/signup',
    highlight: true,
  },
  {
    name: 'Pro',
    price: 39,
    period: '/month',
    description: 'The complete toolkit for serious career-track pilots.',
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
    ctaLink: '/signup',
    highlight: false,
  },
]

export default function Pricing() {
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

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
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
                <Link
                  to={plan.ctaLink}
                  className={`w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  }`}
                >
                  {plan.cta} <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">All plans come with a 7-day money-back guarantee. Cancel anytime.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
