import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { CircleCheck as CheckCircle, Brain, BookOpen, MessageSquare, TrendingUp, Shield, Zap, Star, ArrowRight, Award } from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'AI Oral Exam Simulator',
    desc: 'Realistic DPE-style questioning powered by AI. Practice scenario-based questions for your specific checkride.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Brain,
    title: 'Spaced Repetition Flashcards',
    desc: 'Scientifically proven SM-2 algorithm ensures you review difficult concepts right before you forget them.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BookOpen,
    title: 'Full-Length Practice Exams',
    desc: 'Timed, realistic exams for PPL, Instrument, Commercial, and ATP. FAA ACS aligned questions.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    desc: 'Track your progress by topic, identify weak areas, and see your readiness score improve over time.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Shield,
    title: 'Up-to-Date Question Bank',
    desc: 'Questions curated from actual FAA knowledge tests and regularly updated to match current standards.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
  },
  {
    icon: Zap,
    title: 'Study Anywhere',
    desc: 'Fully responsive web app. Study from your phone, tablet, or desktop whenever and wherever you want.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
]

const testimonials = [
  {
    name: 'Marcus T.',
    cert: 'Private Pilot',
    text: 'I failed my written once before finding SkyPrep. After two weeks using the spaced repetition cards I passed with a 91. The oral simulator especially helped me stop freezing when the examiner asked follow-up questions.',
    rating: 5,
  },
  {
    name: 'Sarah K.',
    cert: 'Instrument Rating',
    text: 'The IFR question bank is incredibly thorough. I felt completely prepared walking into my knowledge test. The AI oral sim had me explain approaches, holds, and alternates so many times it became second nature.',
    rating: 5,
  },
  {
    name: 'James R.',
    cert: 'Commercial Pilot',
    text: 'Worth every penny. The analytics showed me exactly where I was weak on complex aerodynamics. Went into my commercial checkride confident and came out with zero unsatisfactory areas.',
    rating: 5,
  },
]

const certs = ['PPL', 'IFR', 'CPL', 'ATP']

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(10,127,232,0.15),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxZTI5M2IiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0tNCA0aC0ydi0yaDJ2MnptMC00aC0ydi0yaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-4 py-1.5 text-sky-400 text-sm font-medium mb-8">
            <Zap size={14} />
            AI-Powered Aviation Training
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
            Pass Your FAA Exams<br />
            <span className="bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent">With Confidence</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Realistic oral exam simulations, spaced repetition flashcards, and full-length practice tests.
            Built for pilots who want to pass on the first try.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {certs.map(c => (
              <span key={c} className="badge bg-slate-800 text-slate-300 border border-slate-700">{c}</span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/signup" className="btn-primary text-base py-4 px-8 flex items-center justify-center gap-2">
              Start Free Today
              <ArrowRight size={18} />
            </Link>
            <Link to="/pricing" className="btn-secondary text-base py-4 px-8">
              View Pricing
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            {['No credit card required', 'Free plan available', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800 rounded-2xl overflow-hidden border border-slate-800">
          {[
            { val: '10,000+', label: 'Practice Questions' },
            { val: '94%', label: 'Pass Rate' },
            { val: '15,000+', label: 'Students Trained' },
            { val: '4.9/5', label: 'Avg Rating' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">{s.val}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Pass</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">A complete system designed around how pilots actually learn and retain aviation knowledge.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card group hover:border-slate-700 hover:-translate-y-1 transition-all duration-200">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#f59e0b" className="text-amber-400" />)}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Pilots Who Passed</h2>
            <p className="text-slate-400 text-lg">Real results from real student pilots.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, cert, text, rating }) => (
              <div key={name} className="card flex flex-col gap-4">
                <div className="flex gap-1">
                  {[...Array(rating)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" className="text-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-sky-600/20 border border-sky-600/30 flex items-center justify-center text-sky-400 font-semibold text-sm">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{name}</p>
                    <p className="text-slate-500 text-xs flex items-center gap-1"><Award size={10} /> {cert}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card bg-gradient-to-br from-sky-900/30 to-slate-900 border-sky-800/30">
            <div className="w-14 h-14 bg-sky-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6">✈</div>
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Earn Your Certificate?</h2>
            <p className="text-slate-400 text-lg mb-8">Join thousands of student pilots who have passed their FAA exams using SkyPrep.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="btn-primary text-base py-4 px-8 flex items-center justify-center gap-2">
                Create Free Account
                <ArrowRight size={18} />
              </Link>
              <Link to="/pricing" className="btn-outline text-base py-4 px-8">
                See Plans & Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">✈</div>
            <span className="font-bold text-white">SkyPrep</span>
            <span className="text-slate-600 text-sm ml-2">Aviation Training Platform</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign in</Link>
            <Link to="/signup" className="hover:text-slate-300 transition-colors">Sign up</Link>
          </div>
          <p className="text-slate-600 text-sm">© 2026 SkyPrep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
