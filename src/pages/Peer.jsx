import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createPeerRoom,
  joinPeerRoom,
  getPeerRoom,
  askPeerTurn,
  answerPeerTurn,
  feedbackPeerTurn,
  getPeerLeaderboard,
  peerSocketUrl,
} from '../api/client.js'
import Icon from '../components/icons.jsx'

function JoinOrCreate({ onJoined }) {
  const { user } = useAuth()
  const [mode, setMode] = useState('create')
  const [role, setRole] = useState('SDE Intern')
  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate() {
    setSubmitting(true)
    setError('')
    try {
      const res = await createPeerRoom({ role, displayName: user ? undefined : displayName })
      onJoined({ code: res.code, participantId: res.participantId, room: res.room })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJoin() {
    if (!code.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await joinPeerRoom(code.trim().toUpperCase(), { displayName: user ? undefined : displayName })
      onJoined({ code: code.trim().toUpperCase(), participantId: res.participantId, room: res.room })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <div className="flex gap-2">
        {['create', 'join'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === m ? 'bg-ink text-white' : 'border border-line hover:border-ink/40'}`}
          >
            {m === 'create' ? 'Create a room' : 'Join with a code'}
          </button>
        ))}
      </div>

      {!user && (
        <div className="mt-5">
          <label className="text-sm font-semibold text-muted">Your name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Guest name"
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
          />
        </div>
      )}

      {mode === 'create' ? (
        <div className="mt-5">
          <label className="text-sm font-semibold text-muted">Role to practice</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting || (!user && !displayName.trim())}
            className="mt-4 w-full rounded-full bg-signal px-7 py-3 font-semibold text-white hover:bg-signalDark disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create room'}
          </button>
        </div>
      ) : (
        <div className="mt-5">
          <label className="text-sm font-semibold text-muted">Room code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. C2F189"
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 uppercase tracking-wider focus:border-signal focus:outline-none"
          />
          <button
            type="button"
            onClick={handleJoin}
            disabled={submitting || !code.trim() || (!user && !displayName.trim())}
            className="mt-4 w-full rounded-full bg-signal px-7 py-3 font-semibold text-white hover:bg-signalDark disabled:opacity-60"
          >
            {submitting ? 'Joining…' : 'Join room'}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  )
}

function AnswerBox({ code, turn, onUpdated }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await answerPeerTurn(code, turn.id, { answer: text })
      onUpdated()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-2 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your answer…"
        className="flex-1 rounded-xl border border-line px-3 py-2 text-sm focus:border-signal focus:outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={submitting || !text.trim()}
        className="rounded-xl bg-signal px-4 py-2 text-sm font-semibold text-white hover:bg-signalDark disabled:opacity-60"
      >
        Answer
      </button>
    </div>
  )
}

function FeedbackBox({ code, turn, onUpdated }) {
  const [text, setText] = useState('')
  const [score, setScore] = useState(7)
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    try {
      await feedbackPeerTurn(code, turn.id, { feedback: text, score: Number(score) })
      onUpdated()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-2 space-y-2 rounded-xl bg-paper p-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Feedback for their answer…"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-signal focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted">Score</label>
        <input type="range" min="0" max="10" step="0.5" value={score} onChange={(e) => setScore(e.target.value)} className="flex-1" />
        <span className="w-8 text-sm font-semibold">{score}</span>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded-lg bg-signal px-3 py-1.5 text-sm font-semibold text-white hover:bg-signalDark disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  )
}

function RoomView({ code, participantId, initialRoom }) {
  const [room, setRoom] = useState(initialRoom)
  const [question, setQuestion] = useState('')
  const [targetId, setTargetId] = useState('')
  const wsRef = useRef(null)

  const refetch = () => getPeerRoom(code).then(setRoom)

  useEffect(() => {
    const ws = new WebSocket(peerSocketUrl(code))
    ws.onmessage = () => refetch()
    wsRef.current = ws
    return () => ws.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  useEffect(() => {
    const others = room.participants.filter((p) => p.id !== participantId)
    if (others.length && !targetId) setTargetId(String(others[0].id))
  }, [room.participants, participantId, targetId])

  async function handleAsk() {
    if (!question.trim() || !targetId) return
    await askPeerTurn(code, { question, askedByParticipantId: participantId, answeredByParticipantId: Number(targetId) })
    setQuestion('')
    refetch()
  }

  const others = room.participants.filter((p) => p.id !== participantId)

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
        <div>
          <p className="text-sm text-muted">Room code — share this</p>
          <p className="font-display text-2xl font-bold tracking-wider">{code}</p>
        </div>
        <div className="flex -space-x-2">
          {room.participants.map((p) => (
            <span
              key={p.id}
              title={p.displayName}
              className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-signal text-xs font-bold text-white"
            >
              {p.displayName.slice(0, 2).toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold">Ask a question</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="rounded-xl border border-line px-3 py-2 text-sm focus:border-signal focus:outline-none"
          >
            {others.map((p) => (
              <option key={p.id} value={p.id}>
                Ask {p.displayName}
              </option>
            ))}
          </select>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Explain the difference between SQL and NoSQL"
            className="min-w-[240px] flex-1 rounded-xl border border-line px-3 py-2 text-sm focus:border-signal focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAsk}
            disabled={!question.trim() || !targetId}
            className="rounded-xl bg-signal px-4 py-2 text-sm font-semibold text-white hover:bg-signalDark disabled:opacity-60"
          >
            Ask
          </button>
        </div>
        {!others.length && <p className="mt-2 text-sm text-muted">Waiting for someone to join with the room code…</p>}
      </div>

      <ul className="mt-5 space-y-3">
        {[...room.turns].reverse().map((t) => (
          <li key={t.id} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-xs text-muted">
              {t.askedBy} asked {t.answeredBy}
            </p>
            <p className="mt-1 font-semibold">{t.question}</p>
            {t.answer ? (
              <p className="mt-2 text-[15px] text-muted">{t.answer}</p>
            ) : t.answeredByParticipantId === participantId ? (
              <AnswerBox code={code} turn={t} onUpdated={refetch} />
            ) : (
              <p className="mt-2 text-sm italic text-muted">Waiting for an answer…</p>
            )}

            {t.answer && t.feedback && (
              <div className="mt-2 rounded-xl bg-paper p-3 text-sm">
                <span className="font-semibold">{t.score}/10</span> — {t.feedback}
              </div>
            )}
            {t.answer && !t.feedback && t.askedByParticipantId === participantId && (
              <FeedbackBox code={code} turn={t} onUpdated={refetch} />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Leaderboard() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    getPeerLeaderboard().then((res) => setRows(res.leaderboard))
  }, [])
  if (!rows || !rows.length) return null
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold">Leaderboard</h2>
      <p className="text-sm text-muted">Average score received from peers (signed-in users only).</p>
      <ol className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
        {rows.map((r, i) => (
          <li key={r.userId} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span>
              {i + 1}. {r.name}
            </span>
            <span className="font-semibold">
              {r.averageScore}/10 <span className="text-muted">({r.answeredCount})</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Peer() {
  const [joined, setJoined] = useState(null)

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Peer mock interviews</h1>
      <p className="mt-2 text-muted">
        <Icon name="mic" className="mr-1 inline h-4 w-4" />
        Practice with a friend: take turns asking questions, answering, and giving each other feedback and a score.
      </p>

      {!joined ? <JoinOrCreate onJoined={setJoined} /> : <RoomView code={joined.code} participantId={joined.participantId} initialRoom={joined.room} />}

      <Leaderboard />
    </section>
  )
}
