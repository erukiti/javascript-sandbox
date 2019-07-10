import React from 'react'
import styled from 'styled-components'

import SandboxEditor from './SandboxEditor'
import SandboxRunner from './SandboxRunner'

interface SandboxState {
  sources: {
    [props: string]: string
  }
  filename: string
}

const sandboxInit: SandboxState = {
  sources: {
    'index.test.js': `describe('truth', () => {
  test('All number is 42', () => {
    expect(8*6).toBe(42)
  })
})
`
  },
  filename: 'index.test.js'
}

type Context = SandboxState & { dispatch: React.Dispatch<any> | null }

export const SandboxContext = React.createContext<Context>({ ...sandboxInit, dispatch: null })

const reducer: React.Reducer<SandboxState, any> = (state: SandboxState, act: any) => {
  console.log('action', act)
  switch (act.type) {
    case 'EDIT_SOURCE': {
      const sources = { ...state.sources, [state.filename]: act.source }
      return { ...state, sources }
    }
    case 'CHANGE_TARGET': {
      return { ...state, filename: act.filename }
    }
  }
  return state
}

const SandboxDiv = styled.div`
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 50% 50%;
`

const Sandbox: React.FC = () => {
  const [state, dispatch] = React.useReducer(reducer, sandboxInit)
  const editSource = React.useCallback((source: string) => {
    dispatch({ type: 'EDIT_SOURCE', source })
  }, [])
  return (
    <SandboxContext.Provider value={{ ...state, dispatch }}>
      <SandboxDiv>
        <SandboxEditor
          style={{ gridColumn: '1/2' }}
          sources={state.sources}
          filename={state.filename}
          onChange={editSource}
        />
        <SandboxRunner style={{ gridColumn: '2/2' }} sources={state.sources} />
      </SandboxDiv>
    </SandboxContext.Provider>
  )
}

export default Sandbox
