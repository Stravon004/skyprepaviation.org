import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Send, Bot, User, Lock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Message {
  role: 'examiner' | 'student'
  content: string
}

type Scenario = 'preflight' | 'weather' | 'emergencies' | 'airspace' | 'navigation'

const SCENARIOS: Record<Scenario, { label: string; desc: string }> = {
  preflight: { label: 'Pre-Flight Planning', desc: 'Weight & balance, weather briefing, NOTAMs, fuel planning' },
  weather: { label: 'Weather Theory', desc: 'METARs, TAFs, SIGMETs, fronts, thunderstorms, icing' },
  emergencies: { label: 'Emergency Procedures', desc: 'Engine failures, forced landings, electrical failures, fires' },
  airspace: { label: 'Airspace & Regulations', desc: 'Airspace classes, VFR minimums, TFRs, FARs' },
  navigation: { label: 'Navigation & Instruments', desc: 'Dead reckoning, VOR, GPS, ILS approaches' },
}

const OPENING_QUESTIONS: Record<Scenario, string> = {
  preflight: "Good morning. I'm your designated pilot examiner today. Let's begin with pre-flight planning. You've filed for a cross-country flight 250 nautical miles away. Walk me through your complete planning process — what do you check first and why?",
  weather: "Let's discuss weather. You're looking at your weather briefing and see a SIGMET for severe turbulence along your route at FL180, but you're cruising at 8,500 feet. Does this affect your go/no-go decision? Explain your reasoning.",
  emergencies: "We're going to talk about emergencies. You're at 3,500 feet AGL in cruise flight when the engine suddenly goes silent. Walk me through exactly what you do in the first 30 seconds.",
  airspace: "Tell me about the different classes of airspace in the United States. Start from the ground up and explain what equipment and clearances are required to operate in each.",
  navigation: "You're on a cross-country and your GPS has failed. You have VOR receivers and a current sectional. Describe how you would navigate the remaining 80 nautical miles to your destination.",
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function OralSim() {
  const { profile, session } = useAuth()
  const isSubscribed = profile?.subscription_tier === 'basic' || profile?.subscription_tier === 'pro'
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function startScenario(scenario: Scenario) {
    setSelectedScenario(scenario)
    setQuestionCount(0)
    setMessages([{ role: 'examiner', content: OPENING_QUESTIONS[scenario] }])
  }

  async function sendMessage() {
    if (!input.trim() || isStreaming) return
    const userText = input.trim()
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'student', content: userText }]
    setMessages(newMessages)
    setIsStreaming(true)

    // Build conversation history for the API (examiner = assistant, student = user)
    const apiMessages = newMessages.map(m => ({
      role: m.role === 'student' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))

    // Add placeholder for streaming response
    setMessages(prev => [...prev, { role: 'examiner', content: '' }])

    try {
      const abort = new AbortController()
      abortRef.current = abort

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/oral-sim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ scenario: selectedScenario, messages: apiMessages }),
        signal: abort.signal,
      })

      if (!resp.ok || !resp.body) {
        throw new Error(`Request failed: ${resp.status}`)
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'examiner', content: accumulated }
          return updated
        })
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }

      setQuestionCount(q => q + 1)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'examiner',
            content: 'I apologize, I encountered a technical issue. Please try again.',
          }
          return updated
        })
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  if (!isSubscribed) return (
    <div className="p-8 flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
      <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
        <Lock size={28} className="text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">AI Oral Simulator</h2>
      <p className="text-slate-400 mb-6">Practice realistic DPE-style oral questioning with our AI examiner. Available on Basic and Pro plans.</p>
      <Link to="/pricing" className="btn-primary flex items-center gap-2">Upgrade to Unlock <ArrowRight size={16} /></Link>
    </div>
  )

  if (!selectedScenario) return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Oral Exam Simulator</h1>
        <p className="text-slate-400">Practice with a realistic AI examiner that asks follow-up questions based on your answers.</p>
      </div>
      <div className="space-y-3">
        {(Object.entries(SCENARIOS) as [Scenario, { label: string; desc: string }][]).map(([key, { label, desc }]) => (
          <button key={key} onClick={() => startScenario(key)} className="w-full card text-left hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-150 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white group-hover:text-sky-300 transition-colors">{label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-sky-400 transition-colors flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">{SCENARIOS[selectedScenario].label}</h2>
          <p className="text-xs text-slate-500">{questionCount} questions answered</p>
        </div>
        <button onClick={() => { abortRef.current?.abort(); setSelectedScenario(null) }} className="text-slate-400 hover:text-white text-sm transition-colors">Change Topic</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 animate-slide-up ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'examiner' ? 'bg-sky-600/20 border border-sky-600/30' : 'bg-slate-700 border border-slate-600'}`}>
              {msg.role === 'examiner' ? <Bot size={16} className="text-sky-400" /> : <User size={16} className="text-slate-300" />}
            </div>
            <div className={`max-w-xl ${msg.role === 'student' ? 'text-right' : ''}`}>
              <p className={`text-xs font-medium mb-1 ${msg.role === 'examiner' ? 'text-sky-400' : 'text-slate-400'}`}>
                {msg.role === 'examiner' ? 'Examiner' : 'You'}
              </p>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'examiner' ? 'bg-slate-800 text-slate-200 rounded-tl-sm' : 'bg-sky-600/20 border border-sky-600/30 text-sky-100 rounded-tr-sm'}`}>
                {msg.content || (
                  <span className="flex gap-1 items-center py-0.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 bg-slate-900 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
            className="input-field flex-1 resize-none h-20"
            disabled={isStreaming}
          />
          <button onClick={sendMessage} disabled={!input.trim() || isStreaming} className="btn-primary px-4 self-end disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
