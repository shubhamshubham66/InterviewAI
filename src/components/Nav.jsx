import { useState } from 'react'

const links = [
  ['How it works', '#how'],
  ['Features', '#features'],
  ['Report', '#report'],
  ['FAQ', '#faq'],
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#" className="flex items-center gap-2 font-display text-xl font-bold">
          <img src="/favicon.svg" alt="" className="h-7 w-7" /> InterviewAI
        </a>
        <ul className="hidden items-center gap-8 text-[15px] text-muted md:flex">
          {links.map(([l, h]) => (
            <li key={h}><a className="hover:text-ink" href={h}>{l}</a></li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          <a href="#" className="px-3 py-2 text-[15px] font-medium">Log in</a>
          <a href="#start" className="rounded-full bg-signal px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-signalDark">Start practising</a>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l14 14M20 6 6 20' : 'M4 8h18M4 13h18M4 18h18'} /></svg>
        </button>
      </nav>
      {open && (
        <ul className="space-y-1 border-t border-line px-5 py-4 md:hidden">
          {links.map(([l, h]) => (
            <li key={h}><a onClick={() => setOpen(false)} className="block py-2" href={h}>{l}</a></li>
          ))}
          <li><a href="#start" className="mt-2 block rounded-full bg-signal py-3 text-center font-semibold text-white">Start practising</a></li>
        </ul>
      )}
    </header>
  )
}
