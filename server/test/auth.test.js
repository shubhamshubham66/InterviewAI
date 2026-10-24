import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createUser, verifyPassword } from '../src/services/auth.js'

test('rejects a short name', async () => {
  await assert.rejects(() => createUser({ name: 'A', email: 'a@test.com', password: 'password123' }), /at least 2 characters/)
})

test('rejects an invalid email', async () => {
  await assert.rejects(
    () => createUser({ name: 'Valid Name', email: 'not-an-email', password: 'password123' }),
    /valid email/
  )
})

test('rejects a short password', async () => {
  await assert.rejects(() => createUser({ name: 'Valid Name', email: 'b@test.com', password: '123' }), /at least 8 characters/)
})

test('creates a user and hashes the password', async () => {
  const user = await createUser({ name: 'Valid Name', email: `c${Date.now()}@test.com`, password: 'password123' })
  assert.ok(user.id)
  assert.notEqual(user.password_hash, 'password123')
  assert.equal(await verifyPassword(user, 'password123'), true)
  assert.equal(await verifyPassword(user, 'wrong-password'), false)
})

test('defaults role to student when none is given', async () => {
  const user = await createUser({ name: 'Default Role', email: `d${Date.now()}@test.com`, password: 'password123' })
  assert.equal(user.role, 'student')
})

test('rejects a duplicate email', async () => {
  const email = `dup${Date.now()}@test.com`
  await createUser({ name: 'First', email, password: 'password123' })
  await assert.rejects(() => createUser({ name: 'Second', email, password: 'password123' }), /already exists/)
})
