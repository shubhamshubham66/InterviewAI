import { useEffect, useRef, useState } from 'react'

export function useSpeechRecognition() {
  const [supported] = useState(() => typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!supported) return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'

    recognition.onresult = (event) => {
      let finalText = ''
      for (let i = 0; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript
      }
      setTranscript(finalText)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [supported])

  const start = () => {
    if (!recognitionRef.current) return
    setTranscript('')
    recognitionRef.current.start()
    setListening(true)
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const reset = () => setTranscript('')

  return { supported, listening, transcript, start, stop, reset }
}
