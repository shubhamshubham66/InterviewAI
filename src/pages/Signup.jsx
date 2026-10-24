import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import OtpForm from '../components/OtpForm.jsx'

function PasswordSignupForm() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signup({ name, email, password, role })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-muted">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-semibold text-muted">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-muted">I am a</p>
        <div className="mt-2 flex gap-2">
          {[
            ['student', 'Student'],
            ['placement_admin', 'Placement cell'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              aria-pressed={role === value}
              className={`rounded-full border px-4 py-2 text-sm ${
                role === value ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {role === 'placement_admin' && (
          <p className="mt-1.5 text-xs text-amber">
            Demo project: anyone can self-select this role. In production a college admin would be invited, not self-service.
          </p>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-signal px-7 py-3 font-semibold text-white hover:bg-signalDark disabled:opacity-60"
      >
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}

export default function Signup() {
  const [mode, setMode] = useState('otp')

  return (
    <section className="mx-auto max-w-md px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
      <p className="mt-2 text-sm text-muted">
        Signing in saves your session scores and lets you join peer practice rooms under your name.
      </p>

      <div className="mt-6 flex gap-2">
        {[
          ['otp', 'Email code'],
          ['password', 'Password'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={mode === value}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === value ? 'bg-ink text-white' : 'border border-line hover:border-ink/40'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">{mode === 'otp' ? <OtpForm askName /> : <PasswordSignupForm />}</div>

      <p className="mt-4 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-signal hover:text-signalDark">
          Sign in
        </Link>
      </p>
    </section>
  )
}
