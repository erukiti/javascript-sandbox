import React, { useMemo, useReducer } from 'react'

import TodoItem, { TodoItemState } from '../molecules/TodoItem'
import TodoInput from '../molecules/TodoInput'
import TodoContainer from '../molecules/TodoContainer'

interface TodoState {
  items: TodoItemState[]
}

type TodoActions =
  | {
      type: 'ADD'
      label: string
    }
  | {
      type: 'CHECK'
      index: number
      isDone: boolean
    }
  | {
      type: 'DELETE'
      index: number
    }

const reducer: React.Reducer<TodoState, TodoActions> = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      return { ...state, items: [...state.items, { label: action.label, isDone: false }] }
    }
    case 'CHECK': {
      const item = { ...state.items[action.index], isDone: action.isDone }
      const items = [
        ...state.items.slice(0, action.index),
        item,
        ...state.items.slice(action.index + 1)
      ]
      return { ...state, items }
    }
    case 'DELETE': {
      const items = [...state.items.slice(0, action.index), ...state.items.slice(action.index + 1)]
      return { ...state, items }
    }
  }
  return state
}

const Todo: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, { items: [] })
  const { items } = state

  const itemComponents = useMemo(() => {
    return items.map((item, index) => (
      <TodoItem
        label={item.label}
        isDone={item.isDone}
        key={index}
        onDelete={() => {
          dispatch({ type: 'DELETE', index })
        }}
        onCheck={isDone => {
          dispatch({ type: 'CHECK', index, isDone })
        }}
      />
    ))
  }, [items])

  const itemInput = useMemo(() => {
    return <TodoInput onAdd={label => dispatch({ type: 'ADD', label })} />
  }, [dispatch])

  itemComponents.unshift(itemInput)

  return <TodoContainer>{itemComponents}</TodoContainer>
}

export default Todo
