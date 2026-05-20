import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Send, Bot, User, Lock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Message {
  role: 'examiner' | 'student'
  content: string
  timestamp: Date
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
  preflight: "Good morning. I'm your designated pilot examiner today. Let's begin with your pre-flight planning. Tell me, you've filed for a cross-country flight from here to an airport 250 nautical miles away. Walk me through your complete planning process — what do you check first and why?",
  weather: "Let's discuss weather. You're looking at your weather briefing and you see a SIGMET for severe turbulence along your route at FL180, but you're planning to cruise at 8,500 feet. Does this affect your go/no-go decision? Explain your reasoning.",
  emergencies: "We're going to talk about emergencies today. You're at 3,500 feet AGL in cruise flight when the engine suddenly goes silent. Walk me through exactly what you do in the first 30 seconds.",
  airspace: "Tell me about the different classes of airspace in the United States. Start from the ground up and explain what equipment and clearances are required to operate in each.",
  navigation: "You're on a cross-country flight and your GPS has failed. You have VOR receivers and a current sectional chart. Describe how you would navigate the remaining 80 nautical miles to your destination.",
}

const FOLLOW_UP_PROMPTS: Record<Scenario, string[]> = {
  preflight: [
    "You mentioned weather — if the destination TAF shows \"TEMPO 2 SM -RA OVC010\" for the time you plan to arrive, what do you do?",
    "Your weight and balance calculations put you 50 pounds over gross weight. What are your options?",
    "Walk me through the fuel requirements for this flight under FAR 91.",
  ],
  weather: [
    "What's the difference between a SIGMET and an AIRMET? Give me an example of when each would be issued.",
    "Describe the characteristics of a cold front passage. What weather would you expect before, during, and after?",
    "You're approaching a towering cumulus cloud. What's your plan?",
  ],
  emergencies: [
    "During your forced landing, you realize you won't make the field you selected. How do you handle this?",
    "What are the memory items for an electrical fire in flight?",
    "You have a partial panel — your attitude indicator has failed. How do you maintain aircraft control?",
  ],
  airspace: [
    "You want to fly through Class B airspace. What do you need?",
    "Describe the dimensions of Class D airspace and what communication requirements apply.",
    "There's a TFR over a stadium tonight. How would you find out about it and what happens if you violate it?",
  ],
  navigation: [
    "You're tracking a VOR radial and notice the needle is deflecting. What does each dot of deflection represent?",
    "How do you calculate a magnetic heading from a true course?",
    "Your sectional shows your destination as a non-towered airport. How do you get traffic advisories?",
  ],
}

function generateExaminerResponse(scenario: Scenario, studentMessage: string, questionCount: number): string {
  const followUps = FOLLOW_UP_PROMPTS[scenario]
  const idx = questionCount % followUps.length

  if (studentMessage.length < 30) {
    return "I need a more complete answer. Can you expand on that? Specifically, walk me through your step-by-step process."
  }

  const responses = [
    `Good. Now let's dig deeper. ${followUps[idx]}`,
    `That's correct. I'd like to follow up on something you said. ${followUps[(idx + 1) % followUps.length]}`,
    `Alright. Let me push you on this a bit. ${followUps[(idx + 2) % followUps.length]}`,
    `You're on the right track. One more question on this topic: ${followUps[idx]}`,
  ]

  return responses[questionCount % responses.length]
}

export default function OralSim() {
  const { profile } = useAuth()
  const isSubscribed = profile?.subscription_tier === 'student' || profile?.subscription_tier === 'pro'

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function startScenario(scenario: Scenario) {
    setSelectedScenario(scenario)
    setQuestionCount(0)
    setMessages([{
      role: 'examiner',
      content: OPENING_QUESTIONS[scenario],
      timestamp: new Date(),
    }])
  }

  async function sendMessage() {
    if (!input.trim() || isTyping) return

    const studentMsg: Message = { role: 'student', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, studentMsg])
    setInput('')
    setIsTyping(true)

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))

    const response = generateExaminerResponse(selectedScenario!, studentMsg.content, questionCount)
    setMessages(prev => [...prev, { role: 'examiner', content: response, timestamp: new Date() }])
    setQuestionCount(q => q + 1)
    setIsTyping(false)
  }

  if (!isSubscribed) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
          <Lock size={28} className="text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">AI Oral Simulator</h2>
        <p className="text-slate-400 mb-6">
          Practice realistic DPE-style oral questioning with our AI examiner. Available on Student and Pro plans.
        </p>
        <Link to="/pricing" className="btn-primary flex items-center gap-2">
          Upgrade to Unlock
          <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  if (!selectedScenario) {
    return (
      <div className="p-8 max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Oral Exam Simulator</h1>
          <p className="text-slate-400">Practice with a realistic AI examiner that asks follow-up questions based on your answers.</p>
        </div>

        <div className="space-y-3">
          {(Object.entries(SCENARIOS) as [Scenario, { label: string; desc: string }][]).map(([key, { label, desc }]) => (
            <button
              key={key}
              onClick={() => startScenario(key)}
              className="w-full card text-left hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-150 group"
            >
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

        <div className="mt-6 card bg-slate-900/50 border-slate-800/50">
          <p className="text-xs text-slate-500 leading-relaxed">
            The AI examiner will ask realistic oral questions and follow-up based on your responses.
            Type detailed answers as you would in a real checkride. Focus on demonstrating understanding,
            not just memorized answers.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">{SCENARIOS[selectedScenario].label}</h2>
          <p className="text-xs text-slate-500">{questionCount} questions answered</p>
        </div>
        <button
          onClick={() => setSelectedScenario(null)}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Change Topic
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 animate-slide-up ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'examiner' ? 'bg-sky-600/20 border border-sky-600/30' : 'bg-slate-700 border border-slate-600'
            }`}>
              {msg.role === 'examiner' ? <Bot size={16} className="text-sky-400" /> : <User size={16} className="text-slate-300" />}
            </div>
            <div className={`max-w-xl ${msg.role === 'student' ? 'text-right' : ''}`}>
              <p className={`text-xs font-medium mb-1 ${msg.role === 'examiner' ? 'text-sky-400' : 'text-slate-400'}`}>
                {msg.role === 'examiner' ? 'Examiner' : 'You'}
              </p>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'examiner'
                  ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                  : 'bg-sky-600/20 border border-sky-600/30 text-sky-100 rounded-tr-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-600/20 border border-sky-600/30 flex items-center justify-center">
              <Bot size={16} className="text-sky-400" />
            </div>
            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 bg-slate-900 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
            className="input-field flex-1 resize-none h-20"
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="btn-primary px-4 self-end flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
