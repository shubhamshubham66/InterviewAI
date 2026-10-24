import { useEffect, useRef, useState } from 'react'
import { getMeta, startInterview, submitAnswer, parseResume, improveAnswer } from '../api/client.js'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js'
import Icon from '../components/icons.jsx'

const FALLBACK_ROLES = ['SDE Intern', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'HR Round', 'Core EIE / ECE']
const FALLBACK_TYPES = ['Technical', 'Behavioral', 'HR']
const FALLBACK_DIFFICULTIES = ['Easy', 'Medium', 'Hard']

function ScoreBadge({ score }) {
  const cls = score >= 8 ? 'bg-mint' : score >= 6 ? 'bg-amber' : 'bg-red-400'
  return <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold text-white ${cls}`}>{score}</span>
}

function SetupStep({ meta, onStart, starting, error }) {
  const [role, setRole] = useState((meta?.roles || FALLBACK_ROLES)[0])
  const [interviewType, setInterviewType] = useState((meta?.types || FALLBACK_TYPES)[0])
  const [difficulty, setDifficulty] = useState((meta?.difficulties || FALLBACK_DIFFICULTIES)[0])
  const [resumeContext, setResumeContext] = useState('')
  const [resumeName, setResumeName] = useState('')
  const [parsing, setParsing] = useState(false)
  const [resumeError, setResumeError] = useState('')

  async function handleResume(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true)
    setResumeError('')
    try {
      const { resumeContext } = await parseResume(file)
      setResumeContext(resumeContext)
      setResumeName(file.name)
    } catch (err) {
      setResumeError(err.message)
      setResumeName('')
    } finally {
      setParsing(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Set up your mock interview</h1>
      <p className="mt-2 text-muted">Pick a role and round. Upload your resume so questions reference your own projects.</p>

      <div className="mt-8 space-y-7 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div>
          <p className="text-sm font-semibold text-muted">Role</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(meta?.roles || FALLBACK_ROLES).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${role === r ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink/40'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-muted">Round</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(meta?.types || FALLBACK_TYPES).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setInterviewType(t)}
                aria-pressed={interviewType === t}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${interviewType === t ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink/40'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-muted">Difficulty</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(meta?.difficulties || FALLBACK_DIFFICULTIES).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${difficulty === d ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink/40'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-muted">Resume (optional)</p>
          <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted hover:border-ink/40">
            <Icon name="doc" className="h-5 w-5 shrink-0" />
            <span>{parsing ? 'Reading resume…' : resumeName || 'Upload PDF or DOCX'}</span>
            <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleResume} disabled={parsing} />
          </label>
          {resumeError && <p className="mt-1.5 text-sm text-red-500">{resumeError}</p>}
          {!meta?.aiEnabled && (
            <p className="mt-2 text-xs text-amber">
              AI key not configured on the server yet — running in mock mode with sample questions and heuristic scoring.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          disabled={starting || parsing}
          onClick={() => onStart({ role, interviewType, difficulty, resumeContext })}
          className="w-full rounded-full bg-signal px-7 py-3.5 font-semibold text-white hover:bg-signalDark disabled:opacity-60"
        >
          {starting ? 'Starting…' : `Start ${role} practice`}
        </button>
      </div>
    </section>
  )
}

const ADAPTIVE_LABEL = {
  increase: { text: 'Doing well — next question raises the bar', cls: 'bg-mint/15 text-mint' },
  reinforce: { text: "Let's reinforce this topic before moving on", cls: 'bg-amber/15 text-amber' },
}

function SessionStep({ session, onAnswered, onFinished }) {
  const [question, setQuestion] = useState(session.question)
  const [isFollowUp, setIsFollowUp] = useState(false)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [lastEvaluation, setLastEvaluation] = useState(null)
  const [lastSpeechCoach, setLastSpeechCoach] = useState(null)
  const [adaptiveHint, setAdaptiveHint] = useState(null)
  const [turnCount, setTurnCount] = useState(0)
  const [error, setError] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const speech = useSpeechRecognition()
  const tts = useSpeechSynthesis()
  const textareaRef = useRef(null)
  const answerStartRef = useRef(Date.now())

  useEffect(() => {
    if (speech.transcript) setAnswer(speech.transcript)
  }, [speech.transcript])

  useEffect(() => {
    answerStartRef.current = Date.now()
    if (voiceEnabled && tts.supported) tts.speak(question)
    return () => tts.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question])

  async function handleSubmit() {
    if (!answer.trim() || submitting) return
    setSubmitting(true)
    setError('')
    const durationSeconds = Math.round((Date.now() - answerStartRef.current) / 1000)
    try {
      const res = await submitAnswer({ sessionId: session.sessionId, answer, durationSeconds })
      setLastEvaluation(res.evaluation)
      setLastSpeechCoach(res.speechCoach)
      setTurnCount((c) => c + 1)
      if (res.done) {
        onFinished(res.report)
        return
      }
      setAdaptiveHint(res.adaptiveHint && res.adaptiveHint !== 'maintain' ? res.adaptiveHint : null)
      setQuestion(res.question)
      setIsFollowUp(res.isFollowUp)
      setAnswer('')
      speech.reset()
      textareaRef.current?.focus()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          {session.role} · {session.interviewType} · Question {turnCount + 1}
        </p>
        <div className="flex items-center gap-2">
          {isFollowUp && <span className="rounded-full bg-amber/15 px-3 py-1 text-xs font-semibold text-amber">Follow-up</span>}
          {tts.supported && (
            <button
              type="button"
              onClick={() => {
                if (voiceEnabled) tts.stop()
                setVoiceEnabled((v) => !v)
              }}
              aria-pressed={voiceEnabled}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium hover:border-ink/40"
            >
              <Icon name="volume" className="h-3.5 w-3.5" />
              {voiceEnabled ? 'Voice on' : 'Voice off'}
            </button>
          )}
        </div>
      </div>

      {adaptiveHint && (
        <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ADAPTIVE_LABEL[adaptiveHint].cls}`}>
          {ADAPTIVE_LABEL[adaptiveHint].text}
        </p>
      )}

      <div className="mt-4 rounded-3xl bg-ink p-7 text-white">
        <p className="flex items-center gap-2 text-xs text-white/60">
          <span className={`flex items-end gap-0.5 wave ${tts.speaking ? '' : 'opacity-30'}`} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-3 w-0.5 rounded-full bg-signal" />
            ))}
          </span>
          AI Interviewer {tts.speaking && '· speaking'}
        </p>
        <p className="mt-3 text-xl font-semibold leading-relaxed">{question}</p>
      </div>

      {lastEvaluation && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-3">
              <ScoreBadge score={lastEvaluation.score} />
              <p className="text-sm font-semibold">Previous answer score</p>
            </div>
            <p className="mt-2 text-sm text-muted">{lastEvaluation.feedback}</p>
          </div>
          {lastSpeechCoach && (
            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Icon name="mic" className="h-4 w-4 text-signal" /> Speech &amp; communication
              </p>
              <p className="mt-1 text-xs text-muted">
                {lastSpeechCoach.wordCount} words
                {lastSpeechCoach.wpm != null && ` · ${lastSpeechCoach.wpm} wpm (${lastSpeechCoach.paceLabel})`}
                {lastSpeechCoach.fillerCount > 0 && ` · ${lastSpeechCoach.fillerCount} filler words`}
              </p>
              <p className="mt-2 text-sm text-muted">{lastSpeechCoach.tips[0]}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-line bg-white p-6">
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={5}
          placeholder="Type your answer, or use the mic to speak it…"
          className="w-full resize-none rounded-xl border border-line px-4 py-3 text-[15px] focus:border-signal focus:outline-none"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {speech.supported ? (
            <button
              type="button"
              onClick={speech.listening ? speech.stop : speech.start}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                speech.listening ? 'border-red-400 bg-red-50 text-red-500' : 'border-line hover:border-ink/40'
              }`}
            >
              <Icon name="mic" className="h-4 w-4" />
              {speech.listening ? 'Stop recording' : 'Speak answer'}
            </button>
          ) : (
            <span className="text-xs text-muted">Voice input isn't supported in this browser — type your answer.</span>
          )}
          <button
            type="button"
            disabled={!answer.trim() || submitting}
            onClick={handleSubmit}
            className="rounded-full bg-signal px-7 py-3 font-semibold text-white hover:bg-signalDark disabled:opacity-60"
          >
            {submitting ? 'Evaluating…' : 'Submit answer'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    </section>
  )
}

function ImprovePanel({ role, question, answer }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  async function handleToggle() {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    if (result || loading) return
    setLoading(true)
    setError('')
    try {
      setResult(await improveAnswer({ role, question, answer }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <button type="button" onClick={handleToggle} className="flex items-center gap-1.5 text-sm font-semibold text-signal hover:text-signalDark">
        <Icon name="bulb" className="h-4 w-4" />
        {open ? 'Hide improved answer' : 'See improved answer'}
      </button>
      {open && (
        <div className="mt-2 rounded-xl bg-paper p-4 text-sm">
          {loading && <p className="text-muted">Thinking of a stronger version…</p>}
          {error && <p className="text-red-500">{error}</p>}
          {result && (
            <>
              <p className="text-ink">{result.improvedAnswer}</p>
              {result.missingConcepts?.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-muted">Missing from your answer:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">
                    {result.missingConcepts.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.structureTips && <p className="mt-2 italic text-muted">{result.structureTips}</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ReportStep({ report, onRestart }) {
  const colour = (s) => (s >= 8 ? 'bg-mint' : s >= 6 ? 'bg-amber' : 'bg-red-400')
  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <div className="rounded-3xl bg-ink p-7 text-white sm:p-8">
        <p className="text-sm text-white/60">{report.role} · {report.interviewType} · {report.difficulty}</p>
        <div className="mt-2 flex items-end justify-between">
          <h1 className="text-3xl font-bold">Session report</h1>
          <p className="font-display text-5xl font-extrabold">
            {report.averageScore}
            <span className="text-lg font-medium text-white/60">/10</span>
          </p>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-line rounded-3xl border border-line bg-white">
        {report.turns.map((t, i) => (
          <li key={i} className="flex gap-4 p-5">
            <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${colour(t.evaluation.score)}`} aria-hidden="true" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{t.question}</p>
                <p className="font-display font-bold">{t.evaluation.score}</p>
              </div>
              <p className="mt-1 text-[15px] text-muted">{t.answer}</p>
              <p className="mt-2 text-[15px] text-ink">{t.evaluation.feedback}</p>
              {t.evaluation.idealAnswerHint && (
                <p className="mt-1 text-sm italic text-muted">Ideal answer: {t.evaluation.idealAnswerHint}</p>
              )}
              {t.speechCoach && (
                <p className="mt-1 text-xs text-muted">
                  {t.speechCoach.wordCount} words
                  {t.speechCoach.wpm != null && ` · ${t.speechCoach.wpm} wpm (${t.speechCoach.paceLabel})`}
                  {t.speechCoach.fillerCount > 0 && ` · ${t.speechCoach.fillerCount} filler words`}
                </p>
              )}
              <ImprovePanel role={report.role} question={t.question} answer={t.answer} />
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 rounded-full bg-signal px-7 py-3.5 font-semibold text-white hover:bg-signalDark"
      >
        Start another interview
      </button>
    </section>
  )
}

export default function Interview() {
  const [meta, setMeta] = useState(null)
  const [step, setStep] = useState('setup')
  const [session, setSession] = useState(null)
  const [report, setReport] = useState(null)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  useEffect(() => {
    getMeta().then(setMeta).catch(() => {})
  }, [])

  async function handleStart({ role, interviewType, difficulty, resumeContext }) {
    setStarting(true)
    setStartError('')
    try {
      const res = await startInterview({ role, interviewType, difficulty, resumeContext })
      setSession({ ...res, role, interviewType, difficulty })
      setStep('session')
    } catch (err) {
      setStartError(err.message)
    } finally {
      setStarting(false)
    }
  }

  function handleFinished(finalReport) {
    setReport(finalReport)
    setStep('report')
  }

  function handleRestart() {
    setSession(null)
    setReport(null)
    setStep('setup')
  }

  if (step === 'session' && session) {
    return <SessionStep session={session} onFinished={handleFinished} />
  }
  if (step === 'report' && report) {
    return <ReportStep report={report} onRestart={handleRestart} />
  }
  return <SetupStep meta={meta} onStart={handleStart} starting={starting} error={startError} />
}
