import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function OtpForm({ askName = false }) {
  const { requestOtp, loginWithOtp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleSend() {
    if (!email.trim()) return
    setSending(true)
    setError('')
    setInfo('')
    try {
      await requestOtp(email.trim())
      setSent(true)
      setInfo('Code sent — check your email.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setVerifying(true)
    setError('')
    try {
      await loginWithOtp({ email: email.trim(), code, name })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <form
      onSubmit={sent ? handleVerify : (e) => { e.preventDefault(); handleSend() }}
      className="space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8"
    >
      {askName && (
        <div>
          <label htmlFor="otp-name" className="text-sm font-semibold text-muted">
            Name
          </label>
          <input
            id="otp-name"
            required
            disabled={sent}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none disabled:bg-paper"
          />
        </div>
      )}
      <div>
        <label htmlFor="otp-email" className="text-sm font-semibold text-muted">
          Email
        </label>
        <input
          id="otp-email"
          type="email"
          required
          disabled={sent}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none disabled:bg-paper"
        />
      </div>

      {sent && (
        <div>
          <label htmlFor="otp-code" className="text-sm font-semibold text-muted">
            6-digit code
          </label>
          <input
            id="otp-code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-center text-lg tracking-[0.4em] focus:border-signal focus:outline-none"
          />
          <button type="button" onClick={handleSend} disabled={sending} className="mt-1.5 text-xs font-semibold text-signal hover:text-signalDark">
            {sending ? 'Resending…' : 'Resend code'}
          </button>
        </div>
      )}

      {info && !error && <p className="text-sm text-mint">{info}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={sending || verifying || (!sent && !email.trim())}
        className="w-full rounded-full bg-signal px-7 py-3 font-semibold text-white hover:bg-signalDark disabled:opacity-60"
      >
        {sent ? (verifying ? 'Verifying…' : 'Verify & continue') : sending ? 'Sending…' : 'Send code'}
      </button>
    </form>
  )
}
