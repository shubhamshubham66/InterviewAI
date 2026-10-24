import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Icon from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTextSize } from '../hooks/useTextSize.js'

const NAV = [
  ['Dashboard', 'home', '/'],
  ['Interviews', 'mic', '/interview'],
  ['Practice', 'play', '/practice'],
  ['Peer practice', 'chart', '/peer'],
  ['AI insights', 'spark', null],
  ['Reports', 'doc', '/reports'],
  ['Settings', 'gear', '/settings'],
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const textSize = useTextSize()

  const nav = user?.role === 'placement_admin' ? [...NAV, ['Placement dashboard', 'chart', '/admin']] : NAV

  const body = (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <img src="/favicon.svg" alt="" className="h-7 w-7" />
        <span className="font-display text-lg font-bold">InterviewAI</span>
      </div>

      <div className="px-3 pb-2">
        {user ? (
          <div className="rounded-xl bg-white/5 px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-white/50">{user.role === 'placement_admin' ? 'Placement cell' : 'Student'}</p>
            <button
              type="button"
              onClick={() => {
                logout()
                setOpen(false)
                navigate('/')
              }}
              className="mt-2 text-xs font-medium text-white/60 hover:text-white"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex gap-2 px-1">
            <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-white/15 px-3 py-2 text-center text-sm hover:bg-white/5">
              Sign in
            </Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-center text-sm hover:bg-white/15">
              Sign up
            </Link>
          </div>
        )}
      </div>

      <p className="px-6 pb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Main menu</p>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(([label, icon, to]) => {
          const active = to ? pathname === to : false
          const className = `flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[15px] transition-colors ${
            active ? 'bg-signal text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
          } ${!to ? 'cursor-default opacity-50' : ''}`
          if (!to) {
            return (
              <span key={label} className={className} aria-disabled="true">
                <Icon name={icon} />
                {label}
              </span>
            )
          }
          return (
            <Link key={label} to={to} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} className={className}>
              <Icon name={icon} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-1">
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2 text-sm">
          <span className="text-white/60">Text size</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={textSize.decrease}
              aria-label="Decrease text size"
              className="grid h-7 w-7 place-items-center rounded-full bg-white/10 hover:bg-white/20"
            >
              −
            </button>
            <button
              type="button"
              onClick={textSize.increase}
              aria-label="Increase text size"
              className="grid h-7 w-7 place-items-center rounded-full bg-white/10 hover:bg-white/20"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="p-3">
        <Link
          to="/interview"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[15px] font-medium hover:bg-white/15"
        >
          <Icon name="logout" className="h-4 w-4" />
          Start practising
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-5 py-4 backdrop-blur lg:hidden">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <img src="/favicon.svg" alt="" className="h-6 w-6" /> InterviewAI
        </Link>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={open ? 'M6 6l12 12M18 6 6 18' : 'M3 7h18M3 12h18M3 17h18'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl">{body}</div>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 lg:block">{body}</aside>
    </>
  )
}
