const FILLERS = ['basically', 'actually', 'literally', 'you know', 'like', 'um', 'uh', 'so']

export function analyzeSpeech({ transcript, durationSeconds }) {
  const text = (transcript || '').trim()
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const lower = text.toLowerCase()

  const fillerBreakdown = {}
  let fillerCount = 0
  for (const filler of FILLERS) {
    const matches = lower.match(new RegExp(`\\b${filler}\\b`, 'g'))
    if (matches) {
      fillerBreakdown[filler] = matches.length
      fillerCount += matches.length
    }
  }

  const wpm = durationSeconds > 2 ? Math.round((wordCount / durationSeconds) * 60) : null
  const paceLabel = wpm == null ? 'unknown' : wpm < 100 ? 'slow' : wpm > 170 ? 'fast' : 'good'

  const tips = []
  if (fillerCount >= 3) {
    tips.push(`You used filler words ${fillerCount} times (${Object.keys(fillerBreakdown).join(', ')}) — pause silently instead.`)
  }
  if (wpm != null && wpm > 170) tips.push('You spoke quite fast — slow down so the interviewer can follow your structure.')
  if (wpm != null && wpm < 100) tips.push('Your pace was slow — tighten the answer and avoid long pauses mid-sentence.')
  if (wordCount < 20) tips.push('This answer is short — add more detail and a concrete example.')
  if (!tips.length) tips.push('Good pace and clarity — keep this up.')

  return { wordCount, fillerCount, fillerBreakdown, wpm, paceLabel, tips }
}
