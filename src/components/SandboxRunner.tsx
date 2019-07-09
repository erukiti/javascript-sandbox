import React from 'react'
import styled from 'styled-components'
import expect from 'expect'
import { SaferEval } from 'safer-eval'

const SandboxConsoleDiv = styled.code`
  font-family: monospace;
`

const SandboxRunner: React.FC<{
  style: React.CSSProperties
  sources: { [name: string]: string }
}> = ({ style, sources }) => {
  console.log('SandboxRunner FC')

  const [stdout, setStdout] = React.useState('')
  const handleRun = React.useCallback(() => {
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
      sandbox.runInContext(sources['index.test.js'])

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
  }, [sources])
  return (
    <div style={style}>
      <button onClick={handleRun}>RUN</button>
      <SandboxConsoleDiv>
        <pre>{stdout}</pre>
      </SandboxConsoleDiv>
    </div>
  )
}

export default SandboxRunner
