import { useEffect, useState } from 'react'

const SCRIPT = [
  {
    role: 'Frontend Developer · Round 2',
    question: 'Tell me about a time you fixed a slow page.',
    answer:
      'Our dashboard took 6 seconds to load. I profiled it, found we re-rendered a 2,000-row table on every keystroke, and moved filtering into a memoised hook. Load time dropped to 1.2 seconds.',
    scores: { Structure: 9, Clarity: 8, Impact: 9 },
    tip: 'Strong STAR answer. Mention how you measured the result.',
  },
  {
    role: 'SDE Intern · HR Round',
    question: 'Why should we hire you over other candidates?',
    answer:
      'I have shipped three full-stack projects end to end, including an HR system used by my college club. I learn fast, and I already work with your stack.',
    scores: { Structure: 7, Clarity: 8, Impact: 6 },
    tip: 'Good start. Tie one project directly to this team’s work.',
  },
]

export default function LiveDemo() {
  const [i, setI] = useState(0)
  const [typed, setTyped] = useState('')
  const [phase, setPhase] = useState('asking') // asking → answering → feedback
  const item = SCRIPT[i]

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setTyped(item.answer)
      setPhase('feedback')
      return
    }
    setTyped('')
    setPhase('asking')
    let n = 0
    let typer
    const start = setTimeout(() => {
      setPhase('answering')
      typer = setInterval(() => {
        n += 2
        setTyped(item.answer.slice(0, n))
        if (n >= item.answer.length) {
          clearInterval(typer)
          setPhase('feedback')
        }
      }, 28)
    }, 1400)
    const next = setTimeout(() => setI((v) => (v + 1) % SCRIPT.length), 14000)
    return () => {
      clearTimeout(start)
      clearTimeout(next)
      clearInterval(typer)
    }
  }, [i])

  return (
    <div className="relative rounded-[28px] bg-ink p-5 text-white shadow-[0_30px_60px_-20px_rgba(27,35,64,.45)] sm:p-7">
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>{item.role}</span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-400" /> Live practice
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-signal font-display text-sm font-bold">AI</div>
        <p className="rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-[15px] leading-relaxed">{item.question}</p>
      </div>

      <div className="mt-4 flex flex-row-reverse gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/90 font-display text-sm font-bold text-ink">You</div>
        <div className="min-h-[92px] flex-1 rounded-2xl rounded-tr-sm bg-white px-4 py-3 text-[15px] leading-relaxed text-ink">
          {phase === 'asking' ? (
            <span className="wave flex h-6 items-end gap-1" aria-label="Listening">
              {[...Array(5)].map((_, k) => (
                <span key={k} className="block h-6 w-1.5 rounded-full bg-signal" />
              ))}
            </span>
          ) : (
            <span className={phase === 'answering' ? 'caret' : ''}>{typed}</span>
          )}
        </div>
      </div>

      <div
        className={`mt-5 rounded-2xl border border-amber/40 bg-amber/10 p-4 transition-opacity duration-500 ${
          phase === 'feedback' ? 'opacity-100' : 'opacity-0'
        }`}
        aria-live="polite"
      >
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(item.scores).map(([k, v]) => (
            <div key={k}>
              <div className="text-xs text-white/60">{k}</div>
              <div className="font-display text-2xl font-bold">
                {v}<span className="text-sm font-medium text-white/50">/10</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-amber" style={{ width: `${v * 10}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-white/80">{item.tip}</p>
      </div>
    </div>
  )
}
