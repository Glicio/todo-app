import React from 'react'
import { api } from '~/utils/api'
import type SimpleCategory from '~/utils/simple_category'
import type SimpleTodo from '~/utils/simple_todo'
import { userContext } from './UserProvider'

export const TodoContext = React.createContext<{
    todos: SimpleTodo[];
    categories: SimpleCategory[];
    setTodos: (todosDispatch: (todos: SimpleTodo[]) => SimpleTodo[]) => void
    setCategories: (categoryDispatch: (categories: SimpleCategory[]) => SimpleCategory[]) => void
    refresh: () => void
    isLoading: boolean
}>({
    todos: [],
    categories: [],
    setTodos: () => {return},
    setCategories: () => {return},
    refresh: () => {return},
    isLoading: false,
})


export const TodoProvider = ({children}:{
    children: React.ReactNode
}) => {
        
    const [todos, setTodos] = React.useState<SimpleTodo[]>([])
    const [categories, setCategories] = React.useState<SimpleCategory[]>([])

    const {agent, agentType} = React.useContext(userContext);
    
    const todosQuery = api.todos.getUserTodos.useQuery({agentId: agent?.id as string, agentType}, {
        enabled: !!agent?.id && !!agentType,
        refetchOnWindowFocus: false,
    })
    

    React.useEffect(() => {
        if(todosQuery.data){
            setTodos(todosQuery.data.todos)
            setCategories(todosQuery.data.categories)
        }
    }, [todosQuery.data])
    
    const refreshFunction = () => {
       void todosQuery.refetch()
       }
    const _setTodos = (todosDispatch: (todos: SimpleTodo[]) => SimpleTodo[]) => {
        setTodos(old => todosDispatch(old))
      }
    const _setCategories = (categoriesDispatch: (categories: SimpleCategory[]) => SimpleCategory[]) => {
        setCategories(old => categoriesDispatch(old))
    }

    return (
        <TodoContext.Provider value={{
        todos, 
        categories, 
        setTodos: _setTodos, 
        setCategories: _setCategories, 
        refresh: refreshFunction,
        isLoading: todosQuery.isLoading,
        }}>
            {children}
        </TodoContext.Provider>
    )
}
