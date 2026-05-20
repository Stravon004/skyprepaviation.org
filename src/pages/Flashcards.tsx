import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Brain, RotateCcw, ThumbsUp, ThumbsDown, Minus, Layers } from 'lucide-react'

interface FlashCard {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  category: string
  certificate: string
  progressId?: string
  easeFactor?: number
  intervalDays?: number
  repetitions?: number
}

type Rating = 'again' | 'hard' | 'good' | 'easy'

function sm2(ef: number, interval: number, reps: number, rating: Rating) {
  const q = rating === 'again' ? 1 : rating === 'hard' ? 2 : rating === 'good' ? 4 : 5
  let newEf = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  let newInterval: number
  let newReps: number
  if (q < 3) {
    newReps = 0; newInterval = 1
  } else {
    newReps = reps + 1
    newInterval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * newEf)
  }
  return { ef: newEf, interval: newInterval, reps: newReps }
}

type ProgressRow = { id: string; question_id: string; ease_factor: number; interval_days: number; repetitions: number; next_review_at: string }

export default function Flashcards() {
  const { user, profile } = useAuth()
  const [cards, setCards] = useState<FlashCard[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionDone, setSessionDone] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const dailyLimit = profile?.subscription_tier === 'free' ? 20 : 999

  useEffect(() => {
    async function load() {
      if (!user) return

      const { data: progress } = await supabase
        .from('flashcard_progress')
        .select('id, question_id, ease_factor, interval_days, repetitions, next_review_at')
        .eq('user_id', user.id)
        .lte('next_review_at', new Date().toISOString())
        .order('next_review_at')
        .limit(dailyLimit)

      let questionIds: string[] = []
      const progressMap: Record<string, ProgressRow> = {}

      if (progress && progress.length > 0) {
        const rows = progress as ProgressRow[]
        questionIds = rows.map(p => p.question_id)
        rows.forEach(p => { progressMap[p.question_id] = p })
      }

      const { data: allQIds } = await supabase.from('questions').select('id').limit(200)
      const { data: existingProgress } = await supabase.from('flashcard_progress').select('question_id').eq('user_id', user.id)
      const existingIds = new Set((existingProgress ?? []).map((p: { question_id: string }) => p.question_id))
      const newIds = (allQIds ?? []).map((q: { id: string }) => q.id).filter(id => !existingIds.has(id))
      const needed = Math.max(0, Math.min(dailyLimit, 20) - questionIds.length)
      questionIds = [...questionIds, ...newIds.slice(0, needed)]

      if (questionIds.length === 0) { setLoading(false); setSessionDone(true); return }

      const { data: qs } = await supabase
        .from('questions')
        .select('id, question, options, correct_answer, explanation, category, certificate')
        .in('id', questionIds)

      if (qs) {
        setCards(qs.map(q => ({
          ...q,
          options: q.options as string[],
          progressId: progressMap[q.id]?.id,
          easeFactor: progressMap[q.id]?.ease_factor ?? 2.5,
          intervalDays: progressMap[q.id]?.interval_days ?? 1,
          repetitions: progressMap[q.id]?.repetitions ?? 0,
        })))
      }
      setLoading(false)
    }
    load()
  }, [user, dailyLimit])

  async function handleRating(rating: Rating) {
    if (!user) return
    const card = cards[currentIdx]
    const { ef: newEf, interval: newInterval, reps: newReps } = sm2(card.easeFactor ?? 2.5, card.intervalDays ?? 1, card.repetitions ?? 0, rating)
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + newInterval)

    if (card.progressId) {
      await supabase.from('flashcard_progress').update({
        ease_factor: newEf,
        interval_days: newInterval,
        repetitions: newReps,
        next_review_at: nextReview.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      }).eq('id', card.progressId)
    } else {
      await supabase.from('flashcard_progress').insert({
        user_id: user.id,
        question_id: card.id,
        ease_factor: newEf,
        interval_days: newInterval,
        repetitions: newReps,
        next_review_at: nextReview.toISOString(),
      })
    }

    setReviewed(r => r + 1)
    setFlipped(false)
    if (currentIdx + 1 >= cards.length) {
      setSessionDone(true)
    } else {
      setTimeout(() => setCurrentIdx(i => i + 1), 150)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <span className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (sessionDone) return (
    <div className="p-8 flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
        <Brain size={28} className="text-emerald-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
      <p className="text-slate-400 mb-2">You reviewed {reviewed} card{reviewed !== 1 ? 's' : ''} today.</p>
      <p className="text-slate-500 text-sm mb-8">Cards you found difficult will appear sooner. Come back tomorrow for your next session.</p>
      <button onClick={() => { setSessionDone(false); setCurrentIdx(0); setReviewed(0); setFlipped(false) }} className="btn-secondary flex items-center gap-2">
        <RotateCcw size={16} />Study Again
      </button>
    </div>
  )

  const card = cards[currentIdx]

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Flashcards</h1>
          <p className="text-slate-400 text-sm mt-0.5">{currentIdx + 1} of {cards.length} cards today</p>
        </div>
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-slate-500" />
          <span className="text-slate-400 text-sm">{cards.length - currentIdx - 1} remaining</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-sky-600 rounded-full transition-all duration-500" style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <span className="badge bg-slate-800 text-slate-400 border border-slate-700 text-xs">{card.certificate}</span>
        <span className="badge bg-slate-800 text-slate-400 border border-slate-700 text-xs">{card.category}</span>
      </div>

      <div
        className={`card min-h-64 cursor-pointer select-none transition-all duration-200 hover:border-slate-700 mb-6 ${flipped ? 'border-sky-800/50 bg-sky-950/20' : ''}`}
        onClick={() => setFlipped(f => !f)}
      >
        {!flipped ? (
          <div className="flex flex-col h-full">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-4">Question</p>
            <p className="text-white text-lg leading-relaxed flex-1">{card.question}</p>
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-slate-500 text-sm">Tap to reveal answer</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide mb-4">Answer</p>
            <p className="text-emerald-300 font-semibold text-lg mb-4">{card.options[card.correct_answer]}</p>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Explanation</p>
              <p className="text-slate-300 text-sm leading-relaxed">{card.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {flipped && (
        <div className="animate-slide-up">
          <p className="text-slate-500 text-xs text-center mb-3 uppercase tracking-wide">How well did you know this?</p>
          <div className="grid grid-cols-4 gap-3">
            {([
              { rating: 'again' as Rating, label: 'Again', icon: RotateCcw, color: 'text-red-400', bg: 'hover:bg-red-500/10 hover:border-red-500/40' },
              { rating: 'hard' as Rating, label: 'Hard', icon: ThumbsDown, color: 'text-amber-400', bg: 'hover:bg-amber-500/10 hover:border-amber-500/40' },
              { rating: 'good' as Rating, label: 'Good', icon: Minus, color: 'text-sky-400', bg: 'hover:bg-sky-500/10 hover:border-sky-500/40' },
              { rating: 'easy' as Rating, label: 'Easy', icon: ThumbsUp, color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10 hover:border-emerald-500/40' },
            ]).map(({ rating, label, icon: Icon, color, bg }) => (
              <button key={rating} onClick={() => handleRating(rating)} className={`card text-center py-3 cursor-pointer transition-all ${bg} active:scale-95`}>
                <Icon size={18} className={`${color} mx-auto mb-1.5`} />
                <p className={`text-xs font-semibold ${color}`}>{label}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
