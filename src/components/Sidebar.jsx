import { useState } from 'react'
import Icon from './icons.jsx'

const NAV = [
  ['Dashboard', 'home'],
  ['Interviews', 'mic'],
  ['Analysis', 'chart'],
  ['AI insights', 'spark'],
  ['Practice', 'play'],
  ['Reports', 'doc'],
  ['Settings', 'gear'],
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('Interviews')

  const body = (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <img src="/favicon.svg" alt="" className="h-7 w-7" />
        <span className="font-display text-lg font-bold">InterviewAI</span>
      </div>
      <p className="px-6 pb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Main menu</p>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(([label, icon]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setActive(label)
              setOpen(false)
            }}
            aria-pressed={active === label}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[15px] transition-colors ${
              active === label ? 'bg-signal text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-3">
        <a
          href="#start"
          className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[15px] font-medium hover:bg-white/15"
        >
          <Icon name="logout" className="h-4 w-4" />
          Start practising
        </a>
      </div>
    </div>
  )

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-5 py-4 backdrop-blur lg:hidden">
        <a href="#" className="flex items-center gap-2 font-display text-lg font-bold">
          <img src="/favicon.svg" alt="" className="h-6 w-6" /> InterviewAI
        </a>
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
