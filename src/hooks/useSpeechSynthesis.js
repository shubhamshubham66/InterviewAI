import { useCallback, useEffect, useRef, useState } from 'react'

export function useSpeechSynthesis() {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [speaking, setSpeaking] = useState(false)
  const utterRef = useRef(null)

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const speak = useCallback(
    (text, { rate = 1 } = {}) => {
      if (!supported || !text) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      utterRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [supported]
  )

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return { supported, speaking, speak, stop }
}
