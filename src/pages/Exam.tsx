import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Clock, ChevronRight, ChevronLeft, Flag, BookOpen } from 'lucide-react'

type Cert = 'PPL' | 'IFR' | 'CPL' | 'ATP'
type Phase = 'setup' | 'exam' | 'submitting'

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  category: string
}

const CERT_QUESTION_COUNTS: Record<Cert, number> = { PPL: 60, IFR: 60, CPL: 100, ATP: 125 }
const CERT_TIME_MINUTES: Record<Cert, number> = { PPL: 150, IFR: 150, CPL: 200, ATP: 250 }

export default function Exam() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('setup')
  const [selectedCert, setSelectedCert] = useState<Cert>('PPL')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [loadError, setLoadError] = useState('')

  const availableCerts: Cert[] = profile?.subscription_tier === 'pro'
    ? ['PPL', 'IFR', 'CPL', 'ATP']
    : profile?.subscription_tier === 'student'
    ? ['PPL', 'IFR']
    : ['PPL']

  const submitExam = useCallback(async () => {
    if (!user || phase !== 'exam') return
    setPhase('submitting')
    const results = questions.map((q, i) => ({
      questionId: q.id,
      selectedAnswer: answers[i] ?? -1,
      correct: answers[i] === q.correct_answer,
    }))
    const correct = results.filter(r => r.correct).length
    const { data } = await supabase.from('exam_sessions').insert({
      user_id: user.id,
      certificate: selectedCert,
      total_questions: questions.length,
      correct_answers: correct,
      time_taken_seconds: CERT_TIME_MINUTES[selectedCert] * 60 - timeLeft,
      question_results: results,
    }).select('id').maybeSingle()
    if (data) navigate(`/results/${data.id}`)
  }, [user, phase, questions, answers, selectedCert, timeLeft, navigate])

  useEffect(() => {
    if (phase !== 'exam') return
    if (timeLeft <= 0) { submitExam(); return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft, submitExam])

  async function startExam() {
    setLoadError('')
    const { data, error } = await supabase
      .from('questions')
      .select('id, question, options, correct_answer, explanation, category')
      .eq('certificate', selectedCert)
      .limit(CERT_QUESTION_COUNTS[selectedCert])
    if (error || !data || data.length === 0) {
      setLoadError('No questions available for this exam. Please try another certificate.')
      return
    }
    const shuffled = [...data].sort(() => Math.random() - 0.5)
    setQuestions(shuffled.map(q => ({ ...q, options: q.options as string[] })))
    setAnswers({})
    setFlagged(new Set())
    setCurrentIdx(0)
    setTimeLeft(CERT_TIME_MINUTES[selectedCert] * 60)
    setPhase('exam')
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (phase === 'submitting') return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <span className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin block mx-auto mb-4" />
        <p className="text-slate-400">Calculating your results...</p>
      </div>
    </div>
  )

  if (phase === 'setup') return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Practice Exam</h1>
        <p className="text-slate-400">Simulate the actual FAA knowledge test under timed conditions.</p>
      </div>
      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Select Certificate</label>
          <div className="grid grid-cols-2 gap-3">
            {(['PPL', 'IFR', 'CPL', 'ATP'] as Cert[]).map(cert => {
              const locked = !availableCerts.includes(cert)
              return (
                <button
                  key={cert}
                  onClick={() => !locked && setSelectedCert(cert)}
                  disabled={locked}
                  className={`relative p-4 rounded-xl border text-sm font-medium transition-all ${
                    locked ? 'border-slate-800 text-slate-600 bg-slate-900/50 cursor-not-allowed'
                    : selectedCert === cert ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                    : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">{cert}</div>
                  <div className="text-xs opacity-70">{CERT_QUESTION_COUNTS[cert]} questions · {CERT_TIME_MINUTES[cert]} min</div>
                  {locked && <span className="absolute top-2 right-2 badge bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs px-2">Pro</span>}
                </button>
              )
            })}
          </div>
        </div>
        {loadError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{loadError}</div>}
        <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-400 space-y-1">
          <p>• {CERT_QUESTION_COUNTS[selectedCert]} randomized questions</p>
          <p>• {CERT_TIME_MINUTES[selectedCert]} minute time limit</p>
          <p>• 70% required to pass</p>
        </div>
        <button onClick={startExam} className="btn-primary w-full flex items-center justify-center gap-2">
          <BookOpen size={18} />
          Start {selectedCert} Exam
        </button>
      </div>
    </div>
  )

  const q = questions[currentIdx]
  const answered = Object.keys(answers).length

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="badge bg-slate-800 text-slate-300 border border-slate-700">{selectedCert}</span>
          <span className="text-slate-400 text-sm">{currentIdx + 1} / {questions.length}</span>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-600 rounded-full transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} />
          </div>
        </div>
        <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${timeLeft < 300 ? 'text-red-400' : 'text-slate-300'}`}>
          <Clock size={15} />
          {formatTime(timeLeft)}
        </div>
        <button
          onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(currentIdx) ? n.delete(currentIdx) : n.add(currentIdx); return n })}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${flagged.has(currentIdx) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
        >
          <Flag size={14} />
          {flagged.has(currentIdx) ? 'Flagged' : 'Flag'}
        </button>
        <button onClick={submitExam} className="btn-primary text-sm py-2 px-4">Submit Exam</button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">{q.category}</p>
          <h2 className="text-xl font-semibold text-white mb-8 leading-relaxed">{q.question}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const selected = answers[currentIdx] === i
              return (
                <button
                  key={i}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 ${
                    selected ? 'border-sky-500 bg-sky-500/10 text-white' : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${selected ? 'border-sky-500 bg-sky-600 text-white' : 'border-slate-600 text-slate-500'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-40">
          <ChevronLeft size={16} />Previous
        </button>
        <div className="flex gap-1 overflow-x-auto max-w-xs">
          {questions.slice(Math.max(0, currentIdx - 4), Math.min(questions.length, currentIdx + 5)).map((_, ri) => {
            const ai = Math.max(0, currentIdx - 4) + ri
            return (
              <button key={ai} onClick={() => setCurrentIdx(ai)} className={`w-7 h-7 rounded text-xs font-semibold flex-shrink-0 ${ai === currentIdx ? 'bg-sky-600 text-white' : flagged.has(ai) ? 'bg-amber-500/20 text-amber-400' : ai in answers ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {ai + 1}
              </button>
            )
          })}
        </div>
        <button onClick={() => currentIdx === questions.length - 1 ? submitExam() : setCurrentIdx(i => i + 1)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
          {currentIdx === questions.length - 1 ? 'Submit' : 'Next'}<ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
