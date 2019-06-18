import React from 'react'

export interface TodoItemState {
  label: string
  isDone: boolean
}

type TodoItemProps = TodoItemState & {
  onDelete: () => void
  onCheck: (checked: boolean) => void
}

const TodoItem: React.FC<TodoItemProps> = props => {
  return (
    <li>
      <input type="checkbox" checked={props.isDone} onClick={() => props.onCheck(!props.isDone)} />
      {props.label}
      <button onClick={() => props.onDelete()}>delete</button>
    </li>
  )
}

export default TodoItem
