import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyzeSpeech } from '../src/services/speechCoach.js'

test('counts filler words', () => {
  const r = analyzeSpeech({ transcript: 'So basically, like, I um did this, you know', durationSeconds: 10 })
  assert.ok(r.fillerCount >= 4, `expected several fillers, got ${r.fillerCount}`)
})

test('computes words per minute when a duration is given', () => {
  const r = analyzeSpeech({ transcript: 'one two three four five six seven eight nine ten', durationSeconds: 5 })
  assert.equal(r.wordCount, 10)
  assert.equal(r.wpm, 120)
  assert.equal(r.paceLabel, 'good')
})

test('flags a pace above 170 wpm as fast', () => {
  const words = new Array(30).fill('word').join(' ')
  const r = analyzeSpeech({ transcript: words, durationSeconds: 10 }) // 180 wpm
  assert.equal(r.paceLabel, 'fast')
})

test('pace is unknown with no duration', () => {
  const r = analyzeSpeech({ transcript: 'hello world', durationSeconds: 0 })
  assert.equal(r.wpm, null)
  assert.equal(r.paceLabel, 'unknown')
})

test('flags short answers with a tip', () => {
  const r = analyzeSpeech({ transcript: 'yes', durationSeconds: 1 })
  assert.ok(r.tips.some((t) => t.includes('short')))
})

test('a clean, detailed answer gets positive feedback and no filler tip', () => {
  const r = analyzeSpeech({
    transcript: 'I built the authentication module using JWT tokens with a refresh strategy, reducing login failures significantly.',
    durationSeconds: 8,
  })
  assert.equal(r.fillerCount, 0)
  assert.ok(!r.tips.some((t) => t.includes('filler')))
})
