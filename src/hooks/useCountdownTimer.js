import { useEffect, useRef, useState } from 'react'

export function useCountdownTimer(seconds, resetKey) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(seconds)
    setRunning(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const toggle = () => setRunning((r) => !r)
  const reset = () => {
    setRemaining(seconds)
    setRunning(true)
  }

  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60
  const label = `${minutes}:${String(secs).padStart(2, '0')}`

  return { remaining, running, toggle, reset, label, expired: remaining === 0 }
}
