import vm from 'vm'

process.on('message', ({ code, entryFunction, testCases }) => {
  let fn
  try {
    const sandbox = { console: { log() {}, error() {}, warn() {} } }
    const context = vm.createContext(sandbox)
    const script = new vm.Script(code, { timeout: 1000 })
    script.runInContext(context, { timeout: 1000 })
    fn = context[entryFunction]
    if (typeof fn !== 'function') {
      throw new Error(`Define your solution as "function ${entryFunction}(...)". That function was not found.`)
    }
  } catch (err) {
    process.send({
      results: testCases.map((tc) => ({ input: tc.input, expected: tc.expectedOutput, actual: null, passed: false, error: err.message })),
      allPassed: false,
      compileError: err.message,
    })
    return
  }

  const results = testCases.map((tc) => {
    try {
      const actual = fn(...tc.input)
      const passed = JSON.stringify(actual) === JSON.stringify(tc.expectedOutput)
      return { input: tc.input, expected: tc.expectedOutput, actual, passed }
    } catch (err) {
      return { input: tc.input, expected: tc.expectedOutput, actual: null, passed: false, error: err.message }
    }
  })

  process.send({ results, allPassed: results.every((r) => r.passed) })
})
