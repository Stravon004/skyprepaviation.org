import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, BookOpen, Brain, MessageSquare, LogOut, ChevronRight } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exam', label: 'Practice Exams', icon: BookOpen },
  { to: '/flashcards', label: 'Flashcards', icon: Brain },
  { to: '/oral-sim', label: 'Oral Simulator', icon: MessageSquare },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">✈</div>
            <span className="font-bold text-white text-lg tracking-tight">SkyPrep</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? 'bg-sky-600/20 text-sky-400 border border-sky-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icon size={18} className={active ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-sky-500" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {(profile?.full_name ?? profile?.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{profile?.full_name ?? 'Pilot'}</p>
              <p className="text-xs text-slate-500 capitalize">{profile?.subscription_tier ?? 'free'} plan</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
