import expect from 'expect'
import { SaferEval } from 'safer-eval'

export const runInSandbox = async (
  sources: { [props: string]: string },
  entrypoint: string,
  setStdout: (s: string | ((s: string) => string)) => void
) => {
  setStdout('')
  const consoleInSandbox = (...args: any[]) =>
    setStdout(s => s + args.map(arg => arg.toString()).join(' '))

  const tests: { [d: string]: { [t: string]: Function } } = { '': {} }

  let current = ''

  const describe = (label: string, cb: Function) => {
    tests[label] = tests[label] || {}
    current = label
    cb()
  }

  const test = (label: string, cb: Function) => {
    tests[current][label] = cb
  }

  try {
    const sandbox = new SaferEval({
      expect,
      console: { log: consoleInSandbox, dir: consoleInSandbox },
      describe,
      test,
      it: test
    })
    sandbox.runInContext(sources[entrypoint])

    Object.keys(tests).forEach(testDesc => {
      setStdout(s => s + testDesc + '\n')
      Object.keys(tests[testDesc]).forEach(testSubject => {
        setStdout(s => s + 'test: ' + testSubject + '\n')
        tests[testDesc][testSubject]()
        setStdout(s => s + '.')
      })
      setStdout(s => s + '\n')
    })

    setStdout(s => s + '\n\nOK.\n')
  } catch (e) {
    console.dir(e.matcherResult)
    setStdout(s => s + e.toString())
  }
}
