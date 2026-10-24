import { useEffect, useState } from 'react'

const KEY = 'interviewai_text_scale'
const SCALES = [100, 112, 125]

function readStored() {
  try {
    const v = Number(localStorage.getItem(KEY))
    return SCALES.includes(v) ? v : 100
  } catch {
    return 100
  }
}

export function useTextSize() {
  const [scale, setScale] = useState(readStored)

  useEffect(() => {
    document.documentElement.style.fontSize = `${scale}%`
    try {
      localStorage.setItem(KEY, String(scale))
    } catch {
      // ignore storage errors
    }
  }, [scale])

  const increase = () => setScale((s) => SCALES[Math.min(SCALES.indexOf(s) + 1, SCALES.length - 1)])
  const decrease = () => setScale((s) => SCALES[Math.max(SCALES.indexOf(s) - 1, 0)])

  return { scale, increase, decrease }
}
