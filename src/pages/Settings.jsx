import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfile, updateProfile } from '../api/client.js'
import { useVoicePreference } from '../hooks/useVoicePreference.js'
import { useDailyReminder } from '../hooks/useDailyReminder.js'

function ProfileForm() {
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfile()
      .then((res) => setProfile(res.profile))
      .catch((err) => setError(err.message))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await updateProfile({
        name: profile.name,
        skills: profile.skills,
        targetRole: profile.targetRole,
        preferredLanguage: profile.preferredLanguage,
      })
      setProfile(res.profile)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return <p className="text-sm text-muted">Loading…</p>

  return (
    <form onSubmit={handleSave} className="space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <div>
        <label className="text-sm font-semibold text-muted">Name</label>
        <input
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-muted">Target job role</label>
        <input
          value={profile.targetRole}
          onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
          placeholder="e.g. Frontend Developer"
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-muted">Skills</label>
        <input
          value={profile.skills}
          onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
          placeholder="e.g. React, Node.js, SQL"
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-muted">Preferred language</label>
        <select
          value={profile.preferredLanguage}
          onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 focus:border-signal focus:outline-none"
        >
          {['English', 'Hinglish', 'Hindi'].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-signal px-6 py-2.5 text-sm font-semibold text-white hover:bg-signalDark disabled:opacity-60"
      >
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
      </button>
    </form>
  )
}

function VoiceSettings() {
  const voicePref = useVoicePreference()

  function testVoice() {
    if (!('speechSynthesis' in window)) return
    const utter = new SpeechSynthesisUtterance('This is how the AI interviewer will sound.')
    utter.rate = voicePref.rate
    if (voicePref.selectedVoice) utter.voice = voicePref.selectedVoice
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  return (
    <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="text-lg font-bold">AI interviewer voice</h2>
      <div className="mt-4">
        <label className="text-sm font-semibold text-muted">Voice</label>
        <select
          value={voicePref.voiceURI}
          onChange={(e) => voicePref.setVoiceURI(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-signal focus:outline-none"
        >
          <option value="">Browser default</option>
          {voicePref.voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="text-sm font-semibold text-muted">Speaking speed — {voicePref.rate.toFixed(2)}x</label>
        <input
          type="range"
          min="0.75"
          max="1.5"
          step="0.05"
          value={voicePref.rate}
          onChange={(e) => voicePref.setRate(Number(e.target.value))}
          className="mt-2 w-full"
        />
      </div>
      <button type="button" onClick={testVoice} className="mt-4 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-ink/40">
        Test voice
      </button>
    </div>
  )
}

function ReminderSettings() {
  const reminder = useDailyReminder()
  if (!reminder.supported) return null
  return (
    <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="text-lg font-bold">Daily practice reminder</h2>
      <p className="mt-1 text-sm text-muted">
        A browser notification once a day while InterviewAI is open, so you keep your practice streak going. This isn't a push
        notification — it only fires while the app is open in a tab.
      </p>
      <div className="mt-4 flex items-center gap-3">
        {reminder.enabled ? (
          <button type="button" onClick={reminder.disable} className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-ink/40">
            Turn off
          </button>
        ) : (
          <button type="button" onClick={reminder.enable} className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white hover:bg-signalDark">
            Turn on
          </button>
        )}
        {reminder.permission === 'denied' && <p className="text-xs text-red-500">Notifications are blocked in your browser settings.</p>}
      </div>
    </div>
  )
}

function DangerZone() {
  const { deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteAccount()
      navigate('/')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8">
      <h2 className="text-lg font-bold text-red-700">Delete account</h2>
      <p className="mt-1 text-sm text-red-700/80">
        Permanently deletes your account and every interview, coding and peer-room result tied to it. This cannot be undone.
      </p>
      {!confirming ? (
        <button type="button" onClick={() => setConfirming(true)} className="mt-4 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
          Delete my account
        </button>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Yes, permanently delete'}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="text-sm text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default function Settings() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <section className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted">Your profile, interview preferences and account.</p>

      <div className="mt-8">
        <ProfileForm />
      </div>
      <VoiceSettings />
      <ReminderSettings />
      <DangerZone />
    </section>
  )
}
