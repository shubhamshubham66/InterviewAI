import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProgress } from '../api/client.js'

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  )
}

export default function Reports() {
  const { user, loading } = useAuth()
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    getProgress()
      .then(setProgress)
      .catch((err) => setError(err.message))
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Your progress</h1>
      <p className="mt-2 text-muted">Weekly summary across every practice session, interview and coding round.</p>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {progress && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <StatCard label="Current streak" value={`${progress.streakDays} ${progress.streakDays === 1 ? 'day' : 'days'}`} />
            <StatCard label="This week" value={progress.thisWeekSessions} sub="sessions" />
            <StatCard
              label="This week's average"
              value={progress.thisWeekAverage ?? '—'}
              sub={
                progress.trend == null
                  ? 'no comparison yet'
                  : progress.trend > 0
                  ? `▲ ${progress.trend} vs last week`
                  : progress.trend < 0
                  ? `▼ ${Math.abs(progress.trend)} vs last week`
                  : 'same as last week'
              }
            />
            <StatCard label="Total sessions" value={progress.totalSessions} />
          </div>

          <h2 className="mt-10 text-xl font-bold">Recent sessions</h2>
          {progress.recent.length ? (
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
              {progress.recent.map((r, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-muted">{r.createdAt}</span>
                  <span className="font-semibold">{r.score}/10</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No sessions yet — complete an interview or coding round to see your progress here.</p>
          )}
        </>
      )}
    </section>
  )
}
