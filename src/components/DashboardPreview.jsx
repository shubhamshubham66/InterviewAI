import Icon from './icons.jsx'

const SCORE = 78

const BREAKDOWN = [
  ['Technical', 20, '#2F5BEA'],
  ['Clarity', 10, '#2FA37A'],
  ['Emotion', 15, '#F2A93B'],
  ['Communication', 25, '#9B6BF2'],
  ['Confidence', 30, '#EF6FA0'],
]

const RECS = ['bulb', 'target', 'mic', 'notes']

const INSIGHTS = [
  ['check', 'text-mint', 'Strength Insight', 'You maintained strong confidence during technical questions.'],
  ['warn', 'text-amber', 'Improvement', 'Confidence dropped slightly during behavioural questions.'],
  ['flag', 'text-signal', 'Actionable Recommendation', 'Practice answering behavioural questions using the STAR method for clearer structure.'],
]

function Gauge({ value }) {
  const r = 50
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg viewBox="0 0 120 120" className="mx-auto h-36 w-36">
      <circle cx="60" cy="60" r={r} stroke="#E7ECF7" strokeWidth="10" fill="none" />
      <circle
        cx="60"
        cy="60"
        r={r}
        stroke="#2F5BEA"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1B2340">
        {value}%
      </text>
      <text x="60" y="76" textAnchor="middle" fontSize="10" fill="#5F6888">
        AI score
      </text>
    </svg>
  )
}

function Donut() {
  let acc = 0
  const stops = BREAKDOWN.map(([, pct, color]) => {
    const start = acc
    acc += pct
    return `${color} ${start}% ${acc}%`
  }).join(', ')
  return (
    <div className="relative mx-auto h-32 w-32">
      <div className="h-32 w-32 rounded-full" style={{ background: `conic-gradient(${stops})` }} aria-hidden="true" />
      <div className="absolute inset-[14px] rounded-full bg-white" />
    </div>
  )
}

function CallTile({ label, initials }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink to-signal">
      <div className="grid min-h-[160px] place-items-center sm:min-h-[200px]">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/15 font-display text-xl font-bold text-white">
          {initials}
        </span>
      </div>
      <span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-2.5 py-1 text-xs text-white">{label}</span>
    </div>
  )
}

export default function DashboardPreview() {
  return (
    <div className="rounded-[28px] bg-blush p-5 shadow-[0_30px_60px_-30px_rgba(27,35,64,.35)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink" aria-label="Back">
            <Icon name="back" className="h-4 w-4" />
          </button>
          <h3 className="font-display text-lg font-bold">Interview for UI/UX designer</h3>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink" aria-label="Notifications">
            <Icon name="bell" className="h-4 w-4" />
          </button>
          <span className="flex items-center gap-2 rounded-full bg-white py-1 pl-3 pr-1 text-sm font-medium text-ink">
            You
            <span className="grid h-7 w-7 place-items-center rounded-full bg-signal text-xs font-bold text-white">S</span>
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="rounded-2xl bg-ink p-4 text-white">
            <div className="grid grid-cols-2 gap-3">
              <CallTile label="AI Interviewer" initials="AI" />
              <CallTile label="You" initials="S" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" /> Recording
              </span>
              <span>23:06 / 47:09</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div className="h-full w-1/2 rounded-full bg-signal" />
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              {['camera', 'mic', 'volume'].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15"
                  aria-label={n}
                >
                  <Icon name={n} className="h-4 w-4" />
                </button>
              ))}
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-red-500 text-white" aria-label="End call">
                <Icon name="phoneOff" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 text-center">
              <p className="text-sm font-semibold text-muted">AI interview score</p>
              <Gauge value={SCORE} />
              <p className="mt-1 text-sm text-muted">Good — mostly ready, a few areas to improve</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                <span className="text-muted">Move forward?</span>
                <button type="button" className="rounded-full bg-mint px-3 py-1 font-semibold text-white">
                  Yes
                </button>
                <button type="button" className="rounded-full bg-line px-3 py-1 font-semibold text-ink">
                  No
                </button>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <p className="text-center text-sm font-semibold text-muted">AI score breakdown</p>
              <div className="mt-2">
                <Donut />
              </div>
              <ul className="mt-3 space-y-1 text-xs">
                {BREAKDOWN.map(([label, pct, color]) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden="true" />
                      {label}
                    </span>
                    <span className="font-semibold text-ink">{pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5">
            <p className="text-sm font-semibold text-muted">Practice recommendation</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {RECS.map((icon, k) => (
                <button
                  key={icon}
                  type="button"
                  className={`grid aspect-square place-items-center rounded-2xl ${
                    ['bg-amber/15 text-amber', 'bg-red-100 text-red-500', 'bg-signal/10 text-signal', 'bg-mint/15 text-mint'][k]
                  }`}
                  aria-label={icon}
                >
                  <Icon name={icon} className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-muted">
              <Icon name="spark" className="h-4 w-4 text-signal" /> AI insights
            </p>
            <ul className="mt-3 space-y-3 text-sm">
              {INSIGHTS.map(([icon, cls, title, desc]) => (
                <li key={title} className="flex gap-2">
                  <Icon name={icon} className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} />
                  <span>
                    <strong className="font-semibold">{title}</strong>
                    <br />
                    <span className="text-muted">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
