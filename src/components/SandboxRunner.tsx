import React from 'react'
import styled from 'styled-components'

import { runJSTest } from '../sandbox/javascript'

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
    runJSTest(sources, 'index.test.js', setStdout)
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
