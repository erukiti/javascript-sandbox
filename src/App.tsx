import React from 'react'
import styled from 'styled-components'
import { hijackEffects } from 'stop-runaway-react-effects'

import Sandbox from './components/Sandbox'

if (process.env.NODE_ENV !== 'production') {
  hijackEffects()
  // hijackEffects({ callCount: 10, timeLimit: 1000 });
}

const AppDiv = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0px;
  padding: 0px;
`

const App: React.FC = () => {
  // return <Todo />
  return (
    <AppDiv>
      <Sandbox />
    </AppDiv>
  )
}

export default App
