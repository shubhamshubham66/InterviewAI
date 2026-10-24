import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardPreview from './DashboardPreview.jsx'

const ROLES = ['SDE Intern', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'HR Round', 'Core EIE / ECE']

export function Hero() {
  const [role, setRole] = useState(ROLES[0])
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-14 lg:pt-20">
      <div className="max-w-2xl">
        <h1 className="text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Rehearse the interview before it counts.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          An AI interviewer asks you real questions for your role, listens to your answers, and tells you exactly what to fix: structure, clarity and impact.
        </p>

        <div className="mt-8" id="start">
          <p className="text-sm font-medium text-muted">Practise for</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  role === r ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink/40'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link to="/interview" className="rounded-full bg-signal px-7 py-3.5 font-semibold text-white hover:bg-signalDark">
              Start {role} practice
            </Link>
            <span className="text-sm text-muted">Free · no sign-up for your first session</span>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <DashboardPreview />
      </div>
    </section>
  )
}

const STEPS = [
  ['Choose your role and round', 'Pick the job, the company type and the round: technical, HR or managerial. Upload your resume so questions match your projects.'],
  ['Answer out loud', 'The AI interviewer asks one question at a time and follows up on what you say, just like a real panel.'],
  ['Read your report', 'Get a score for every answer, a better sample answer, and the three things to practise next.'],
]

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-lg text-4xl font-bold tracking-tight">One session takes about 15 minutes.</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map(([t, d], k) => (
            <li key={t} className="relative pl-14">
              <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border-2 border-signal font-display font-bold text-signal">{k + 1}</span>
              <h3 className="text-xl font-bold">{t}</h3>
              <p className="mt-2 leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="max-w-xl text-4xl font-bold tracking-tight">Built around how placement interviews actually go.</h2>
      <div className="mt-12 grid gap-5 md:grid-cols-6">
        <article className="rounded-3xl bg-signal p-8 text-white md:col-span-4">
          <h3 className="text-2xl font-bold">Questions from your own resume</h3>
          <p className="mt-3 max-w-md leading-relaxed text-white/85">
            Upload your resume and the interviewer asks about your projects, your stack and the gaps it notices, the same way a real interviewer reads it.
          </p>
          <div className="mt-6 space-y-2 text-[15px]">
            <p className="rounded-xl bg-white/15 px-4 py-2.5">“You used Playwright in your agent project. Why not Selenium?”</p>
            <p className="rounded-xl bg-white/15 px-4 py-2.5">“How did you handle authentication in your HRMS?”</p>
          </div>
        </article>
        <article className="rounded-3xl border border-line bg-white p-8 md:col-span-2">
          <h3 className="text-xl font-bold">Voice or text</h3>
          <p className="mt-3 leading-relaxed text-muted">Speak your answers to practise delivery, or type them when you're in the library.</p>
        </article>
        <article className="rounded-3xl border border-line bg-white p-8 md:col-span-2">
          <h3 className="text-xl font-bold">Follow-up questions</h3>
          <p className="mt-3 leading-relaxed text-muted">Vague answers get a “can you go deeper?”, so you learn to be specific.</p>
        </article>
        <article className="rounded-3xl border border-line bg-white p-8 md:col-span-2">
          <h3 className="text-xl font-bold">Filler-word count</h3>
          <p className="mt-3 leading-relaxed text-muted">See how often you said “basically” and “like”, and your speaking pace.</p>
        </article>
        <article className="rounded-3xl border border-line bg-white p-8 md:col-span-2">
          <h3 className="text-xl font-bold">Progress over time</h3>
          <p className="mt-3 leading-relaxed text-muted">Track scores across sessions and see which skills are improving.</p>
        </article>
      </div>
    </section>
  )
}

const REPORT = [
  ['Explain your Dayflow HRMS project.', 8.5, 'Clear architecture walkthrough. Add one number about users or speed.'],
  ['What is the difference between SQL and NoSQL?', 6, 'Correct, but too textbook. Give an example from your own work.'],
  ['Describe a conflict in your team.', 4.5, 'No outcome stated. Use STAR and end with what you learned.'],
]

export function ReportPreview() {
  const colour = (s) => (s >= 8 ? 'bg-mint' : s >= 6 ? 'bg-amber' : 'bg-red-400')
  return (
    <section id="report" className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Feedback you can act on tonight.</h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
            Every session ends with a report: a score per answer, what was missing, and a stronger version of what you said.
          </p>
        </div>
        <div className="rounded-3xl bg-white p-6 text-ink sm:p-8">
          <div className="flex items-end justify-between border-b border-line pb-5">
            <div>
              <p className="text-sm text-muted">SDE Intern · Technical round</p>
              <p className="font-display text-xl font-bold">Session report</p>
            </div>
            <p className="font-display text-5xl font-extrabold">6.3<span className="text-lg font-medium text-muted">/10</span></p>
          </div>
          <ul className="divide-y divide-line">
            {REPORT.map(([q, s, note]) => (
              <li key={q} className="flex gap-4 py-4">
                <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${colour(s)}`} aria-hidden="true" />
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">{q}</p>
                    <p className="font-display font-bold">{s}</p>
                  </div>
                  <p className="mt-1 text-[15px] text-muted">{note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

const FAQS = [
  ['Is it free?', 'Your first sessions are free. Pricing for unlimited practice will be announced at launch.'],
  ['Which roles are supported?', 'Software roles (SDE, frontend, backend, full stack), data roles, HR rounds and core engineering basics. More are being added.'],
  ['Does it work in Hindi or Hinglish?', 'You can answer in Hinglish. Feedback is in English so you practise the language most interviews use.'],
  ['Is my voice recording stored?', 'Recordings are used only to create your report and you can delete any session from your dashboard.'],
]

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
      <h2 className="text-4xl font-bold tracking-tight">Questions</h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold">
              {q}
              <span className="text-2xl text-signal transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function CTA() {
  return (
    <section className="px-5 pb-20">
      <div className="mx-auto max-w-6xl rounded-[32px] bg-signal px-8 py-16 text-center text-white">
        <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Your next interview is closer than you think.</h2>
        <Link to="/interview" className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-semibold text-signal hover:bg-paper">Start practising free</Link>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} InterviewAI. Built by Shubham.</p>
        <div className="flex gap-6">
          <a href="https://github.com/shubhamshubham66/InterviewAI" className="hover:text-ink">GitHub</a>
          <a href="#" className="hover:text-ink">Privacy</a>
          <a href="#" className="hover:text-ink">Contact</a>
        </div>
      </div>
    </footer>
  )
}
