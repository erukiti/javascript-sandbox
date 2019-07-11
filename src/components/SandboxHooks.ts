import React, { useRef, useEffect, useLayoutEffect } from 'react'

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

import { runJSTest } from '../sandbox/javascript'

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

export const useSandbox = (initialSources: { [p: string]: string }) => {
  console.log('useSandbox')

  const editorDiv = React.useRef<HTMLDivElement>(null)

  const [filename, setFilename] = React.useState('index.test.js')
  const [stdout, setStdout] = React.useState('')
  const [sources, setSources] = React.useState<{ [name: string]: string }>({})
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>()
  const subscriptionRef = useRef<monaco.IDisposable[]>([])
  const modelsRef = useRef<{ [name: string]: monaco.editor.ITextModel }>({})

  const run = React.useCallback(
    (name: string = 'index.test.js') => {
      console.log('run')
      setStdout('')
      runJSTest(sources, name, setStdout)
    },
    [sources, setStdout]
  )

  const unsubscription = () => {
    subscriptionRef.current.forEach(subscription => {
      subscription.dispose()
    })
    subscriptionRef.current = []
  }

  useLayoutEffect(() => {
    console.log('useLayoutEffect', editorDiv.current)
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
    editorRef.current.layout()
    editorRef.current.focus()
    console.log(1)
    return () => {
      console.log('useLayoutEffect disposed')
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = undefined
      }
      unsubscription()
    }
  }, [])

  useEffect(() => {
    editorRef.current!.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
      editorRef.current!.getAction('editor.action.formatDocument').run()
      editorRef.current!.saveViewState()
      console.log('saved')
      run('index.test.js')
    })
  }, [run])

  useEffect(() => {
    console.log('create models')
    const newSources: { [name: string]: string } = {}
    Object.keys(initialSources).forEach(name => {
      const text = initialSources[name]
      if (name in modelsRef.current) {
        const model = modelsRef.current[name]
        if (text !== model.getValue()) {
          model.pushEditOperations([], [{ range: model.getFullModelRange(), text }], () => null)
        }
      } else {
        const model = monaco.editor.createModel(text, 'javascript')
        model.updateOptions({
          tabSize: 2
        })
        modelsRef.current[name] = model
      }
      newSources[name] = modelsRef.current[name].getValue()
    })
    setSources(newSources)
  }, [initialSources])

  useEffect(() => {
    console.log('setModel', filename)
    editorRef.current!.setModel(modelsRef.current[filename])
  }, [filename])

  useEffect(() => {
    console.log('subscription', filename)
    subscriptionRef.current.push(
      modelsRef.current[filename].onDidChangeContent(ev => {
        setSources(x => ({ ...x, [filename]: modelsRef.current[filename].getValue() }))
        // onChange
      })
    )
    return () => {
      unsubscription()
    }
  }, [filename])

  return { run, stdout, editorDiv, sources, setFilename }
}
