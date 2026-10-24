import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import OtpForm from '../components/OtpForm.jsx'

function PasswordForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login({ email, password })
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-signal px-7 py-3 font-semibold text-white hover:bg-signalDark disabled:opacity-60"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

export default function Login() {
  const [mode, setMode] = useState('otp')

  return (
    <section className="mx-auto max-w-md px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>

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

      <div className="mt-4">{mode === 'otp' ? <OtpForm /> : <PasswordForm />}</div>

      <p className="mt-4 text-sm text-muted">
        No account?{' '}
        <Link to="/signup" className="font-semibold text-signal hover:text-signalDark">
          Create one
        </Link>
      </p>
    </section>
  )
}
