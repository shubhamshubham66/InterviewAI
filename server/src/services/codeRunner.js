import { fork } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WORKER_PATH = path.join(__dirname, 'codeRunnerWorker.js')
const TIMEOUT_MS = 4000
const MAX_CODE_LENGTH = 8000

// Each submission runs in its own disposable child process (not the main server
// process), with a capped heap and a hard wall-clock timeout enforced by the
// parent. This is isolation for a single trusted user running their own practice
// code, not a hardened multi-tenant sandbox — it does not block network or file
// system access from within the child. Do not expose this to untrusted input.
export function runTests({ code, entryFunction, testCases }) {
  if (typeof code !== 'string' || !code.trim()) {
    return Promise.resolve({ results: [], allPassed: false, error: 'Submit some code first.' })
  }
  if (code.length > MAX_CODE_LENGTH) {
    return Promise.resolve({ results: [], allPassed: false, error: 'Code is too long.' })
  }

  return new Promise((resolve) => {
    let child
    try {
      child = fork(WORKER_PATH, [], {
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        execArgv: ['--max-old-space-size=64'],
      })
    } catch (err) {
      resolve({ results: [], allPassed: false, error: 'Could not start the execution sandbox.' })
      return
    }

    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      child.removeAllListeners()
      child.kill('SIGKILL')
      resolve(value)
    }

    const timer = setTimeout(() => {
      finish({
        results: testCases.map((tc) => ({ input: tc.input, expected: tc.expectedOutput, actual: null, passed: false, error: 'Timed out' })),
        allPassed: false,
        timedOut: true,
      })
    }, TIMEOUT_MS)

    // node --watch forwards an internal "watch:import" bookkeeping message over the
    // same IPC channel before our actual result — ignore anything that isn't ours.
    child.on('message', (msg) => {
      if (msg && typeof msg === 'object' && Array.isArray(msg.results)) finish(msg)
    })
    child.once('error', () => finish({ results: [], allPassed: false, error: 'Execution process failed.' }))
    child.once('exit', (code) => {
      if (code !== 0 && code !== null) finish({ results: [], allPassed: false, error: `Execution process crashed (exit code ${code}).` })
    })

    child.send({ code, entryFunction, testCases })
  })
}
