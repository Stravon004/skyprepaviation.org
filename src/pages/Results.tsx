import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CircleCheck as CheckCircle, Circle as XCircle, ArrowLeft, BookOpen, RotateCcw } from 'lucide-react'

interface QuestionResult {
  questionId: string
  selectedAnswer: number
  correct: boolean
}

interface Session {
  certificate: string
  total_questions: number
  correct_answers: number
  completed_at: string
  time_taken_seconds: number | null
  question_results: QuestionResult[]
}

interface QuestionDetail {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  category: string
}

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<QuestionDetail[]>([])
  const [showReview, setShowReview] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!sessionId) return
      const { data: s } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle()

      if (!s) { setLoading(false); return }
      const questionResults = s.question_results as unknown as QuestionResult[]
      setSession({ ...s, question_results: questionResults })

      const ids = questionResults.map(r => r.questionId)
      const { data: qs } = await supabase
        .from('questions')
        .select('id, question, options, correct_answer, explanation, category')
        .in('id', ids)

      if (qs) setQuestions(qs.map(q => ({ ...q, options: q.options as string[] })))
      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <span className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!session) return (
    <div className="p-8 text-center">
      <p className="text-slate-400">Session not found.</p>
      <Link to="/dashboard" className="btn-primary mt-4 inline-flex items-center gap-2"><ArrowLeft size={15} />Dashboard</Link>
    </div>
  )

  const pct = Math.round((session.correct_answers / session.total_questions) * 100)
  const passed = pct >= 70
  const fmt = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`

  const questionMap = Object.fromEntries(questions.map(q => [q.id, q]))

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
          <ArrowLeft size={15} />
          Dashboard
        </Link>
      </div>

      {/* Score Card */}
      <div className={`card mb-8 text-center ${passed ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-red-500/30 bg-red-900/10'}`}>
        <div className={`text-7xl font-bold mb-2 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{pct}%</div>
        <div className={`text-xl font-semibold mb-1 ${passed ? 'text-emerald-300' : 'text-red-300'}`}>
          {passed ? 'PASSED' : 'NOT PASSED'}
        </div>
        <p className="text-slate-400 text-sm mb-6">
          {session.correct_answers} correct out of {session.total_questions} questions
          {session.time_taken_seconds ? ` · ${fmt(session.time_taken_seconds)}` : ''}
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-900/50 rounded-xl p-3">
            <div className="text-white font-bold text-lg">{session.certificate}</div>
            <div className="text-slate-500">Certificate</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3">
            <div className="text-white font-bold text-lg">{session.correct_answers}</div>
            <div className="text-slate-500">Correct</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3">
            <div className="text-white font-bold text-lg">{session.total_questions - session.correct_answers}</div>
            <div className="text-slate-500">Incorrect</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Link to="/exam" className="btn-primary flex items-center gap-2 text-sm">
          <RotateCcw size={15} />
          Take Another Exam
        </Link>
        <button onClick={() => setShowReview(!showReview)} className="btn-secondary flex items-center gap-2 text-sm">
          <BookOpen size={15} />
          {showReview ? 'Hide' : 'Review'} Answers
        </button>
      </div>

      {showReview && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Answer Review</h2>
          {session.question_results.map((result, i) => {
            const q = questionMap[result.questionId]
            if (!q) return null
            return (
              <div key={result.questionId} className={`card border ${result.correct ? 'border-emerald-800/40' : 'border-red-800/40'}`}>
                <div className="flex items-start gap-3 mb-4">
                  {result.correct ? (
                    <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Q{i + 1} · {q.category}</p>
                    <p className="text-white font-medium">{q.question}</p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 ml-7">
                  {q.options.map((opt, oi) => {
                    const isCorrect = oi === q.correct_answer
                    const isSelected = oi === result.selectedAnswer
                    return (
                      <div key={oi} className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2 ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-300' :
                        isSelected && !isCorrect ? 'bg-red-500/10 text-red-300' :
                        'text-slate-500'
                      }`}>
                        <span className="font-semibold text-xs">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                        {isCorrect && <CheckCircle size={12} className="ml-auto text-emerald-400" />}
                        {isSelected && !isCorrect && <XCircle size={12} className="ml-auto text-red-400" />}
                      </div>
                    )
                  })}
                </div>

                <div className="ml-7 bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Explanation</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
