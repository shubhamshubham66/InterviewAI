import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runTests } from '../src/services/codeRunner.js'

test('correct solution passes all test cases', async () => {
  const code = 'function add(a, b) { return a + b; }'
  const res = await runTests({ code, entryFunction: 'add', testCases: [{ input: [2, 3], expectedOutput: 5 }] })
  assert.equal(res.allPassed, true)
  assert.equal(res.results[0].passed, true)
})

test('wrong solution fails without crashing', async () => {
  const code = 'function add(a, b) { return 0; }'
  const res = await runTests({ code, entryFunction: 'add', testCases: [{ input: [2, 3], expectedOutput: 5 }] })
  assert.equal(res.allPassed, false)
})

test('an infinite loop is killed by the timeout', async () => {
  const code = 'function add() { while (true) {} }'
  const res = await runTests({ code, entryFunction: 'add', testCases: [{ input: [], expectedOutput: 1 }] })
  assert.equal(res.timedOut, true)
  assert.equal(res.allPassed, false)
})

test('a missing entry function reports a clear error, not a crash', async () => {
  const code = 'function notAdd() { return 1; }'
  const res = await runTests({ code, entryFunction: 'add', testCases: [{ input: [], expectedOutput: 1 }] })
  assert.ok(res.compileError)
  assert.match(res.compileError, /not found/)
})

test('a syntax error is caught, not thrown', async () => {
  const code = 'function add( this is not valid js'
  const res = await runTests({ code, entryFunction: 'add', testCases: [{ input: [], expectedOutput: 1 }] })
  assert.ok(res.compileError)
})

test('empty code is rejected without spawning a process', async () => {
  const res = await runTests({ code: '', entryFunction: 'add', testCases: [] })
  assert.equal(res.allPassed, false)
  assert.ok(res.error)
})
