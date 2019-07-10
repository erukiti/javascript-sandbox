import React, { useRef, useEffect, useLayoutEffect } from 'react'
import styled from 'styled-components'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js'

import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js'
import 'monaco-editor/esm/vs/editor/browser/widget/codeEditorWidget.js'
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js'
import 'monaco-editor/esm/vs/editor/contrib/caretOperations/caretOperations.js'
import 'monaco-editor/esm/vs/editor/contrib/caretOperations/transpose.js'
import 'monaco-editor/esm/vs/editor/contrib/clipboard/clipboard.js'
import 'monaco-editor/esm/vs/editor/contrib/codelens/codelensController.js'
import 'monaco-editor/esm/vs/editor/contrib/comment/comment.js'
import 'monaco-editor/esm/vs/editor/contrib/contextmenu/contextmenu.js'
import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/cursorUndo.js'
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'
import 'monaco-editor/esm/vs/editor/contrib/folding/folding.js'
import 'monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints.js'
import 'monaco-editor/esm/vs/editor/contrib/smartSelect/smartSelect.js'
import 'monaco-editor/esm/vs/editor/contrib/suggest/suggestController.js'
import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/wordHighlighter.js'
import 'monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js'

const EditorDiv = styled.div`
  width: 50vw;
  height: 100vh;
`

monaco.languages.registerDocumentFormattingEditProvider('javascript', {
  async provideDocumentFormattingEdits(model) {
    const prettier = await import('prettier/standalone')
    const babylon = await import('prettier/parser-babylon')
    const text = prettier.format(model.getValue(), {
      parser: 'babel',
      plugins: [babylon],
      singleQuote: true,
      tabWidth: 2
    })
    console.log('format')

    return [
      {
        range: model.getFullModelRange(),
        text
      }
    ]
  }
})

interface EditorProps {
  style: React.CSSProperties
  sources: { [name: string]: string }
  filename: string
  onChange: (value: string) => void
}

const MonacoEditor: React.FC<EditorProps> = props => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const subscriptionRef = useRef<monaco.IDisposable | null>(null)
  const modelsRef = useRef<{ [name: string]: monaco.editor.ITextModel }>({})
  const editorDiv = useRef<HTMLDivElement>(null)
  console.log('Monaco Editor FC', props)

  const { onChange, style, sources, filename } = props

  useLayoutEffect(() => {
    console.log('useLayoutEffect')
    const height = editorDiv.current!.parentElement!.clientHeight - editorDiv.current!.offsetTop
    editorDiv.current!.style.height = `${height}px`

    editorRef.current = monaco.editor.create(editorDiv.current!, {
      minimap: {
        enabled: false
      },
      fontSize: 16,
      lineNumbers: 'on',
      wordWrap: 'on'
    })
    editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
      editorRef.current!.getAction('editor.action.formatDocument').run()
      editorRef.current!.saveViewState()
      console.log('saved')
    })
    console.log(editorRef.current.getSupportedActions())
    editorRef.current.layout()
    editorRef.current.focus()
    return () => {
      console.log('useLayoutEffect disposed')
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.dispose()
        subscriptionRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    Object.keys(sources).forEach(name => {
      if (name in modelsRef.current) {
        const model = modelsRef.current[name]
        if (sources[name] !== model.getValue()) {
          model.pushEditOperations(
            [],
            [{ range: model.getFullModelRange(), text: sources[name] }],
            () => null
          )
        }
      } else {
        const model = monaco.editor.createModel(sources[name], 'javascript')
        model.updateOptions({
          tabSize: 2
        })
        modelsRef.current[name] = model
      }
    })
    editorRef.current!.setModel(modelsRef.current[filename])
  }, [sources, filename])

  useEffect(() => {
    console.log('subscription', filename)
    subscriptionRef.current = modelsRef.current[filename].onDidChangeContent(ev => {
      onChange(modelsRef.current[filename].getValue())
    })
    return () => {
      if (subscriptionRef.current) {
        console.log('subscription dispose')
        subscriptionRef.current.dispose()
        subscriptionRef.current = null
      }
    }
  }, [onChange, filename])

  return <EditorDiv ref={editorDiv} style={style} />
}

export default MonacoEditor
