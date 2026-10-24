import { useEffect, useState } from 'react'

const ENABLED_KEY = 'interviewai_reminder_enabled'
const LAST_SHOWN_KEY = 'interviewai_reminder_last_shown'

function readEnabled() {
  try {
    return localStorage.getItem(ENABLED_KEY) === 'true'
  } catch {
    return false
  }
}

export function useDailyReminder() {
  const [enabled, setEnabledState] = useState(readEnabled)
  const [permission, setPermission] = useState(() => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'))

  useEffect(() => {
    if (!enabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const today = new Date().toISOString().slice(0, 10)
    let lastShown = null
    try {
      lastShown = localStorage.getItem(LAST_SHOWN_KEY)
    } catch {
      // ignore
    }
    if (lastShown === today) return

    new Notification('Time to practice', {
      body: 'Keep your streak going — one mock interview question takes just a minute.',
      icon: '/favicon.svg',
    })
    try {
      localStorage.setItem(LAST_SHOWN_KEY, today)
    } catch {
      // ignore storage errors
    }
  }, [enabled])

  async function enable() {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      setEnabledState(true)
      try {
        localStorage.setItem(ENABLED_KEY, 'true')
      } catch {
        // ignore
      }
    }
  }

  function disable() {
    setEnabledState(false)
    try {
      localStorage.setItem(ENABLED_KEY, 'false')
    } catch {
      // ignore
    }
  }

  return { enabled, permission, enable, disable, supported: typeof Notification !== 'undefined' }
}
