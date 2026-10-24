import { useEffect, useState } from 'react'

const VOICE_KEY = 'interviewai_voice_uri'
const RATE_KEY = 'interviewai_voice_rate'

function readRate() {
  try {
    const v = Number(localStorage.getItem(RATE_KEY))
    return v >= 0.5 && v <= 2 ? v : 1
  } catch {
    return 1
  }
}

function readVoiceURI() {
  try {
    return localStorage.getItem(VOICE_KEY) || ''
  } catch {
    return ''
  }
}

export function useVoicePreference() {
  const [voices, setVoices] = useState([])
  const [voiceURI, setVoiceURIState] = useState(readVoiceURI)
  const [rate, setRateState] = useState(readRate)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  const setVoiceURI = (uri) => {
    setVoiceURIState(uri)
    try {
      localStorage.setItem(VOICE_KEY, uri)
    } catch {
      // ignore storage errors
    }
  }

  const setRate = (r) => {
    setRateState(r)
    try {
      localStorage.setItem(RATE_KEY, String(r))
    } catch {
      // ignore storage errors
    }
  }

  const selectedVoice = voices.find((v) => v.voiceURI === voiceURI) || null

  return { voices, voiceURI, setVoiceURI, rate, setRate, selectedVoice }
}
