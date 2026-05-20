import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BookOpen, Brain, MessageSquare, TrendingUp, ArrowRight, CircleCheck as CheckCircle, Clock, Target } from 'lucide-react'

interface ExamSession {
  id: string
  certificate: string
  total_questions: number
  correct_answers: number
  completed_at: string
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [recentSessions, setRecentSessions] = useState<ExamSession[]>([])
  const [avgScore, setAvgScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const isStudent = profile?.subscription_tier === 'student' || profile?.subscription_tier === 'pro'

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('exam_sessions')
        .select('id, certificate, total_questions, correct_answers, completed_at')
        .order('completed_at', { ascending: false })
        .limit(5)
      if (data) {
        setRecentSessions(data as ExamSession[])
        if (data.length > 0) {
          const avg = (data as ExamSession[]).reduce((acc, s) => acc + (s.correct_answers / s.total_questions) * 100, 0) / data.length
          setAvgScore(Math.round(avg))
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const quickActions = [
    { to: '/exam', icon: BookOpen, label: 'Start Practice Exam', desc: 'Full-length timed test', locked: false },
    { to: '/flashcards', icon: Brain, label: 'Review Flashcards', desc: 'Spaced repetition study', locked: false },
    { to: '/oral-sim', icon: MessageSquare, label: 'AI Oral Simulator', desc: 'DPE-style questioning', locked: !isStudent },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Pilot'}
        </h1>
        <p className="text-slate-400">Continue your training where you left off.</p>
      </div>

      {!isStudent && (
        <div className="mb-8 bg-gradient-to-r from-sky-900/40 to-slate-900 border border-sky-800/40 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Upgrade to unlock everything</p>
            <p className="text-slate-400 text-sm mt-0.5">Full question banks, AI oral simulator, and unlimited flashcard reviews.</p>
          </div>
          <Link to="/pricing" className="btn-primary text-sm whitespace-nowrap flex items-center gap-2">
            View Plans <ArrowRight size={15} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Exams Taken', val: loading ? '—' : recentSessions.length, icon: CheckCircle, color: 'text-sky-400' },
          { label: 'Avg Score', val: loading ? '—' : avgScore !== null ? `${avgScore}%` : 'N/A', icon: Target, color: 'text-emerald-400' },
          { label: 'Plan', val: profile?.subscription_tier ?? 'free', icon: TrendingUp, color: 'text-amber-400' },
          { label: 'Questions', val: '10K+', icon: Clock, color: 'text-rose-400' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <s.icon size={20} className={s.color} />
            <div>
              <p className="text-xl font-bold text-white capitalize">{s.val}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Start</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map(({ to, icon: Icon, label, desc, locked }) => (
            locked ? (
              <div key={to} className="card opacity-60 cursor-not-allowed">
                <div className="flex items-center justify-between mb-3">
                  <Icon size={20} className="text-slate-500" />
                  <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/30">Upgrade</span>
                </div>
                <p className="font-semibold text-slate-300">{label}</p>
                <p className="text-sm text-slate-500 mt-1">{desc}</p>
              </div>
            ) : (
              <Link key={to} to={to} className="card group hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 block">
                <div className="flex items-center justify-between mb-3">
                  <Icon size={20} className="text-sky-400" />
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
                <p className="font-semibold text-white">{label}</p>
                <p className="text-sm text-slate-400 mt-1">{desc}</p>
              </Link>
            )
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Exams</h2>
        {loading ? (
          <div className="card flex items-center justify-center py-12">
            <span className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No exams yet</p>
            <p className="text-slate-600 text-sm mt-1 mb-4">Take your first practice exam to see results here.</p>
            <Link to="/exam" className="btn-primary text-sm inline-flex items-center gap-2">
              Start First Exam <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="card divide-y divide-slate-800 p-0 overflow-hidden">
            {recentSessions.map(s => {
              const pct = Math.round((s.correct_answers / s.total_questions) * 100)
              return (
                <Link key={s.id} to={`/results/${s.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <span className="badge bg-slate-800 text-slate-300 border border-slate-700">{s.certificate}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{s.total_questions} questions</p>
                      <p className="text-xs text-slate-500">{new Date(s.completed_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-bold ${pct >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>{pct}%</span>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
