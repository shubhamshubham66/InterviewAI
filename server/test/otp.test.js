import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateOtp, verifyOtp } from '../src/services/otp.js'
import { findOrCreateByEmail } from '../src/services/auth.js'

test('a freshly generated code verifies successfully', () => {
  const email = `otp${Date.now()}@test.com`
  const code = generateOtp(email)
  assert.match(code, /^\d{6}$/)
  const result = verifyOtp(email, code)
  assert.equal(result.ok, true)
})

test('a wrong code is rejected without consuming the real one', () => {
  const email = `otp${Date.now()}b@test.com`
  const code = generateOtp(email)
  const wrong = verifyOtp(email, '000000' === code ? '111111' : '000000')
  assert.equal(wrong.ok, false)
  const right = verifyOtp(email, code)
  assert.equal(right.ok, true)
})

test('a code is single-use', () => {
  const email = `otp${Date.now()}c@test.com`
  const code = generateOtp(email)
  assert.equal(verifyOtp(email, code).ok, true)
  const reuse = verifyOtp(email, code)
  assert.equal(reuse.ok, false)
})

test('verifying with no code requested fails cleanly', () => {
  const result = verifyOtp(`never-requested${Date.now()}@test.com`, '123456')
  assert.equal(result.ok, false)
})

test('too many wrong attempts invalidates the code', () => {
  const email = `otp${Date.now()}d@test.com`
  const code = generateOtp(email)
  const wrongCode = code === '000000' ? '111111' : '000000'
  for (let i = 0; i < 5; i++) verifyOtp(email, wrongCode)
  const result = verifyOtp(email, code) // even the real code should now be rejected
  assert.equal(result.ok, false)
})

test('findOrCreateByEmail returns the same user on repeat calls (no duplicates)', () => {
  const email = `find-or-create${Date.now()}@test.com`
  const first = findOrCreateByEmail({ name: 'First Name', email })
  const second = findOrCreateByEmail({ name: 'Ignored Second Name', email })
  assert.equal(first.id, second.id)
  assert.equal(second.name, 'First Name')
  assert.equal(second.password_hash, '')
})
