import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import {
  listCodingProblems,
  getCodingProblem,
  runCode,
  getQuestionBankCategories,
  listQuestionBank,
  getQuestionBankItem,
} from '../api/client.js'
import { useOfflineQuestionBank } from '../hooks/useOfflineQuestionBank.js'
import Icon from '../components/icons.jsx'

const TABS = ['Coding', 'Question Bank']

function ResultRow({ r, index }) {
  return (
    <div className={`rounded-xl border p-3 text-sm ${r.passed ? 'border-mint/40 bg-mint/5' : 'border-red-300 bg-red-50'}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Example {index + 1}</span>
        <span className={r.passed ? 'text-mint' : 'text-red-500'}>{r.passed ? 'Passed' : 'Failed'}</span>
      </div>
      <p className="mt-1 text-muted">Input: {JSON.stringify(r.input)}</p>
      <p className="text-muted">Expected: {JSON.stringify(r.expected)}</p>
      {!r.passed && <p className="text-muted">Got: {r.error ? r.error : JSON.stringify(r.actual)}</p>}
    </div>
  )
}

function CodingTab() {
  const [problems, setProblems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [problem, setProblem] = useState(null)
  const [code, setCode] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listCodingProblems()
      .then((res) => {
        setProblems(res.problems)
        if (res.problems.length) setSelectedId(res.problems[0].id)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setResult(null)
    setError('')
    getCodingProblem(selectedId)
      .then((p) => {
        setProblem(p)
        setCode(p.starterCode)
      })
      .catch((err) => setError(err.message))
  }, [selectedId])

  async function handleRun() {
    setRunning(true)
    setError('')
    try {
      const res = await runCode({ problemId: selectedId, code, role: 'SDE Intern' })
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="space-y-1.5">
        {problems.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            aria-pressed={selectedId === p.id}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm ${
              selectedId === p.id ? 'bg-ink text-white' : 'border border-line bg-white hover:border-ink/40'
            }`}
          >
            <span>{p.title}</span>
            <span className={`text-xs ${selectedId === p.id ? 'text-white/60' : 'text-muted'}`}>{p.difficulty}</span>
          </button>
        ))}
      </div>

      {problem && (
        <div>
          <h2 className="text-xl font-bold">{problem.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{problem.prompt}</p>

          <div className="mt-3 space-y-1.5 text-sm text-muted">
            {problem.examples.map((ex, i) => (
              <p key={i}>
                Example {i + 1}: input <code className="rounded bg-paper px-1.5 py-0.5">{JSON.stringify(ex.input)}</code> → output{' '}
                <code className="rounded bg-paper px-1.5 py-0.5">{JSON.stringify(ex.expectedOutput)}</code>
              </p>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-line">
            <CodeMirror value={code} height="240px" extensions={[javascript()]} onChange={(v) => setCode(v)} />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-2 rounded-full bg-signal px-6 py-2.5 font-semibold text-white hover:bg-signalDark disabled:opacity-60"
            >
              <Icon name="play" className="h-4 w-4" />
              {running ? 'Running…' : 'Run tests'}
            </button>
            {result && (
              <span className="text-sm font-semibold">
                {result.passedCount}/{result.totalCount} test cases passed
              </span>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          {result && (
            <div className="mt-5 space-y-3">
              {result.timedOut && <p className="text-sm text-red-500">Your code timed out — check for an infinite loop.</p>}
              {result.error && !result.timedOut && <p className="text-sm text-red-500">{result.error}</p>}
              {result.visibleResults.map((r, i) => (
                <ResultRow key={i} r={r} index={i} />
              ))}
              {result.hiddenSummary.length > 0 && (
                <p className="text-sm text-muted">
                  Hidden test cases: {result.hiddenSummary.filter((h) => h.passed).length}/{result.hiddenSummary.length} passed
                </p>
              )}
              {result.feedback && (
                <div className="rounded-xl bg-paper p-4 text-sm">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <Icon name="spark" className="h-4 w-4 text-signal" /> Code quality feedback
                  </p>
                  <p className="mt-1 text-muted">{result.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function QuestionBankTab() {
  const offline = useOfflineQuestionBank()
  const useOfflineData = !offline.online && offline.cache

  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    if (useOfflineData) {
      const counts = {}
      for (const q of offline.cache.questions) counts[q.category] = (counts[q.category] || 0) + 1
      const cats = Object.entries(counts).map(([cat, count]) => ({ category: cat, count }))
      setCategories(cats)
      if (cats.length) setCategory(cats[0].category)
      return
    }
    getQuestionBankCategories().then((res) => {
      setCategories(res.categories)
      if (res.categories.length) setCategory(res.categories[0].category)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useOfflineData])

  useEffect(() => {
    if (!category) return
    if (useOfflineData) {
      const items = offline.cache.questions.filter((q) => q.category === category)
      setQuestions(items)
      setAnswers(Object.fromEntries(items.map((q) => [q.id, q.answer])))
      return
    }
    listQuestionBank({ category }).then((res) => setQuestions(res.questions))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, useOfflineData])

  async function handleOpen(id) {
    if (answers[id] || loadingId === id || useOfflineData) return
    setLoadingId(id)
    try {
      const full = await getQuestionBankItem(id)
      setAnswers((prev) => ({ ...prev, [id]: full.answer }))
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="mt-6">
      {!offline.online && (
        <p className="mb-4 rounded-xl bg-amber/15 px-4 py-2.5 text-sm font-medium text-amber">
          {offline.cache ? "You're offline — showing your downloaded question set." : "You're offline, and nothing is downloaded yet."}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
        <p className="text-sm text-muted">
          {offline.cache ? `Downloaded for offline practice — ${timeAgo(offline.cache.downloadedAt)}` : 'Not downloaded for offline practice yet.'}
        </p>
        <button
          type="button"
          onClick={offline.download}
          disabled={offline.downloading || !offline.online}
          className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:border-ink/40 disabled:opacity-60"
        >
          {offline.downloading ? 'Downloading…' : 'Download for offline'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.category}
            type="button"
            onClick={() => setCategory(c.category)}
            aria-pressed={category === c.category}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              category === c.category ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink/40'
            }`}
          >
            {c.category} <span className="opacity-60">({c.count})</span>
          </button>
        ))}
      </div>

      <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
        {questions.map((item) => (
          <details key={item.id} className="group p-5" onToggle={(e) => e.target.open && handleOpen(item.id)}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <span className="font-semibold">{item.question}</span>
              <span className="shrink-0 rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-muted">{item.difficulty}</span>
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {loadingId === item.id ? 'Loading…' : answers[item.id] || ''}
            </p>
          </details>
        ))}
      </div>
    </div>
  )
}

export default function Practice() {
  const [tab, setTab] = useState(TABS[0])

  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
      <p className="mt-2 text-muted">Coding rounds and a categorized question bank — DSA, SQL, DBMS, OS, networks, OOPs and HR.</p>

      <div className="mt-6 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${
              tab === t ? 'border-signal text-signal' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Coding' ? <CodingTab /> : <QuestionBankTab />}
    </section>
  )
}
