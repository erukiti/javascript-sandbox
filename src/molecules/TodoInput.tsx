import React, { useState, useCallback } from 'react'

interface TodoInputProps {
  onAdd: (label: string) => void
}

const TodoInput: React.FC<TodoInputProps> = props => {
  const [label, setLabel] = useState('')

  const handleSubmit = useCallback(
    (ev?: React.FormEvent<HTMLFormElement>) => {
      ev && ev.preventDefault()
      props.onAdd(label)
      setLabel('')
    },
    [label, props]
  )

  return (
    <form onSubmit={ev => handleSubmit(ev)}>
      <input type="text" value={label} onChange={ev => setLabel(ev.target.value)} />
      <button type="submit">ADD</button>
    </form>
  )
}

export default TodoInput
