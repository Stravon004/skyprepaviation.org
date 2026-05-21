import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Brain, MessageSquare, ArrowRight, CircleCheck as CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: BookOpen,
    title: 'Take a Practice Exam',
    desc: 'Simulate the real FAA written test with timed, randomized questions.',
    to: '/exam',
    cta: 'Start Exam',
  },
  {
    icon: Brain,
    title: 'Review Flashcards',
    desc: 'Spaced repetition keeps the most important concepts fresh.',
    to: '/flashcards',
    cta: 'Study Now',
  },
  {
    icon: MessageSquare,
    title: 'AI Oral Simulator',
    desc: 'Practice with a DPE-style examiner before the real thing.',
    to: '/oral-sim',
    cta: 'Try It',
    locked: true,
  },
]

export default function Welcome() {
  const { profile } = useAuth()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Pilot'

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-sky-600/20 border border-sky-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✈</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome aboard, {firstName}!
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Your free account is ready. Here's how to make the most of SkyPrep.
          </p>
        </div>

        <div className="space-y-4 mb-10">
          {steps.map(({ icon: Icon, title, desc, to, cta, locked }) => (
            <div key={to} className={`card flex items-center gap-5 ${locked ? 'opacity-60' : 'hover:border-slate-700 transition-colors'}`}>
              <div className="w-12 h-12 bg-sky-600/10 border border-sky-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={22} className="text-sky-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{title}</p>
                  {locked && <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs">Paid</span>}
                </div>
                <p className="text-slate-400 text-sm mt-0.5">{desc}</p>
              </div>
              {locked ? (
                <Link to="/pricing" className="btn-secondary text-sm whitespace-nowrap flex items-center gap-1.5">
                  Upgrade <ArrowRight size={13} />
                </Link>
              ) : (
                <Link to={to} className="btn-primary text-sm whitespace-nowrap flex items-center gap-1.5">
                  {cta} <ArrowRight size={13} />
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="card bg-slate-900/50 border-slate-800">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">Free plan includes</p>
              <p className="text-slate-400 text-sm mt-1">50 PPL practice questions, 20 flashcard reviews per day, and basic performance tracking — no credit card required.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            Skip to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
