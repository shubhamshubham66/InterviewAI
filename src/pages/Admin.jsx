import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getAdminOverview } from '../api/client.js'

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
    </div>
  )
}

export default function Admin() {
  const { user, loading } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'placement_admin') return
    getAdminOverview()
      .then(setData)
      .catch((err) => setError(err.message))
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'placement_admin') {
    return (
      <section className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-muted">This dashboard is only available to placement cell accounts.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Placement dashboard</h1>
      <p className="mt-2 text-muted">Aggregate preparation analytics across students who have signed in.</p>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {data && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <StatCard label="Students" value={data.totalStudents} />
            <StatCard label="Active (practiced)" value={data.activeStudents} />
            <StatCard label="Total sessions" value={data.totalSessions} />
            <StatCard label="Overall average" value={data.overallAverage ?? '—'} />
          </div>

          <h2 className="mt-10 text-xl font-bold">Skill-gap report</h2>
          <p className="text-sm text-muted">Lowest-scoring areas first — where students need the most help.</p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="bg-paper text-left text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Area</th>
                  <th className="px-4 py-2.5 font-semibold">Type</th>
                  <th className="px-4 py-2.5 font-semibold">Sessions</th>
                  <th className="px-4 py-2.5 font-semibold">Average score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.skillGap.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 font-medium">{row.label}</td>
                    <td className="px-4 py-2.5 text-muted">{row.kind}</td>
                    <td className="px-4 py-2.5">{row.sessions}</td>
                    <td className={`px-4 py-2.5 font-semibold ${row.averageScore >= 7 ? 'text-mint' : row.averageScore >= 5 ? 'text-amber' : 'text-red-500'}`}>
                      {row.averageScore}
                    </td>
                  </tr>
                ))}
                {!data.skillGap.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted">
                      No practice sessions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 text-xl font-bold">Students</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="bg-paper text-left text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Name</th>
                  <th className="px-4 py-2.5 font-semibold">Email</th>
                  <th className="px-4 py-2.5 font-semibold">Sessions</th>
                  <th className="px-4 py-2.5 font-semibold">Average score</th>
                  <th className="px-4 py-2.5 font-semibold">Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.students.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5 font-medium">{s.name}</td>
                    <td className="px-4 py-2.5 text-muted">{s.email}</td>
                    <td className="px-4 py-2.5">{s.sessions}</td>
                    <td className="px-4 py-2.5">{s.averageScore ?? '—'}</td>
                    <td className="px-4 py-2.5 text-muted">{s.lastActive || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
