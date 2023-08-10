import React from 'react'
import type SimpleTodo from '~/utils/simple_todo'
import InfoIcon from '../icons/info'
import { useDisclosure } from '@mantine/hooks'
import ModalContainer from '../containers/modal_container'
import TimeStamps from './time_stamps'
import TodoActions from './todo_actions'
import { api } from '~/utils/api'
import { userContext } from '~/contexts/UserProvider'
import { notifications } from '@mantine/notifications'
import Prompt from '../forms/prompt'
import { Tabs } from '@mantine/core'




const FullTodo = ({ todo, onDone, onDelete, openEdit }: {
    todo: SimpleTodo,
    onDone?: (id: string) => void,
    onDelete?: (id: string) => void,
    openEdit?: () => void
}) => {
    const { agent, agentType } = React.useContext(userContext)
    const [deletePrompt, { open: openDelete, close: closeDelete }] = useDisclosure()
    //mutations

    const doneMutation = api.todos.markAsDone.useMutation({
        onSuccess: () => {
            if (onDone) onDone(todo.id)
        },
        onError: (error) => {
            console.log(error)
            notifications.show({
                title: "Error",
                message: "An error occured while marking the todo as done",
                color: "red",
                icon: <InfoIcon />,
            })
        }
    })
    const deleteMutation = api.todos.deleteTodo.useMutation({
        onSuccess: () => {
            notifications.show({
                title: "Success",
                message: "Todo deleted successfully",
                color: "green",
            })
            if (onDelete) onDelete(todo.id)
        },
        onError: (error) => {
            console.log(error)
            notifications.show({
                title: "Error",
                message: "An error occured while deleting the todo",
                color: "red",
                icon: <InfoIcon />,
            })
        }
    })
    const undoMutation = api.todos.undoTodo.useMutation({
        onSuccess: () => {
            if (onDone) onDone(todo.id)
        },
        onError: (error) => {
            console.log(error)
            notifications.show({
                title: "Error",
                message: "An error occured while undoing the todo",
                color: "red",
                icon: <InfoIcon />,
            })
        }
    })
    return (
        <div className="h-[75vh] flex flex-col">
            <Prompt title='Delete todo' message='Are you sure you want to delete this todo?'
                loading={deleteMutation.isLoading}
                onConfirm={() => {
                    if (!agent?.id || !agentType) return
                    deleteMutation.mutate({
                        id: todo.id,
                        agentId: agent.id,
                        agentType: agentType
                    })
                }}
                opened={deletePrompt}
                onClose={closeDelete}
            />
            <Tabs defaultValue={"general"}
                className="flex-grow flex flex-col overflow-hidden"
                color="secondary-color.0"
            >
                <Tabs.List>
                    <Tabs.Tab value="general">General</Tabs.Tab>
                    <Tabs.Tab value="details">Details</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="general" className="overflow-hidden h-[65vh] ">
                    <div className="py-2 flex flex-col h-full">
                        {todo.categories.length > 0 ? <CategoriesList categories={todo.categories} /> : null}

                        <div className="flex-grow thin-scroll overflow-y-auto ">
                            {todo.steps && todo.steps.length > 0
                                ?
                                <>
                                    <h2 className="text-lg font-bold">
                                        Steps
                                    </h2>
                                    {todo.steps?.map(curr => {
                                        return <div key={curr.id} className="flex gap-2">
                                            <input type="checkbox" readOnly checked={curr.done} />
                                            <span>
                                                {curr.title}
                                            </span>
                                        </div>
                                    })}
                                </>
                                : null}
                            {todo.description ?
                                <>
                                    <h2 className="text-lg font-bold">
                                        Description
                                    </h2>
                                    <p className="leading-4">
                                        {todo.description}
                                    </p>
                                </>
                                : null}
                        </div>
                    </div>
                </Tabs.Panel>
                <Tabs.Panel value="details" className="h-[60vh]">
                </Tabs.Panel>
            </Tabs>
            <TodoActions
                doLoading={doneMutation.isLoading}
                deleteLoading={deleteMutation.isLoading}
                undoLoading={undoMutation.isLoading}
                done={todo.done}
                onUndo={() => {
                    if (!agent?.id || !agentType) return
                    undoMutation.mutate({ todoId: todo.id, agentId: agent.id, agentType: agentType })
                }}
                borderColor='var(--tertiary-color)'
                onDone={() => {
                    if (!agent?.id || !agentType) return
                    doneMutation.mutate({ todoId: todo.id, agentId: agent.id, agentType: agentType })
                }}
                onDelete={openDelete} onEdit={openEdit}
            />
        </div>
    )
}

const CategoryBadge = ({ name, color }: { name: string, color: string }) => {
    return (

        <div className="border rounded-lg pl-2 pr-3 flex gap-1 items-center  border-[var(--tertiary-color)] flex-shrink-0 h-fit">
            <div className="rounded-full w-2 h-2 flex-shrink-0"
                style={{ backgroundColor: color || "" }}
            ></div>
            <div className="text-xs">
                {name}
            </div>
        </div>
    )
}

const CategoriesList = ({ categories, wrap }: { categories: SimpleTodo["categories"], wrap?: boolean }) => {
    const badgesRef = React.useRef<HTMLDivElement>(null)


    React.useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (badgesRef.current?.contains(event.target as Node)) {
                const container = badgesRef.current
                container.scrollLeft += event.deltaY
                event.preventDefault()
            }
        }
        document.addEventListener("wheel", handleWheel, { passive: false })
        return () => {
            document.removeEventListener("wheel", handleWheel)
        }
    }, [])


    return (
        <div className={`flex gap-2 overflow-x-auto flex-shrink-0 overflow-hidden no-scroll ${wrap ? "flex-wrap" : ""}`}
            ref={badgesRef}
        >
            {categories.map((category) => (
                <CategoryBadge key={category.id} name={category.name} color={category.color || ""} />
            ))}
        </div>
    )
}


export default function NewTodoComponent({ todo, onDone, onDelete, openEdit }:
    {
        todo: SimpleTodo,
        onDone: (id: string) => void,
        onDelete: (id: string) => void,
        openEdit: () => void
    }) {
    const [opened, { open, close }] = useDisclosure()
    return (
        <>
            <ModalContainer opened={opened} onClose={close} title={todo.title} color={todo.categories.length > 1 ? todo.categories.map(curr => curr.color || "") : todo.categories[0]?.color || undefined}>
                <FullTodo
                    todo={todo}
                    onDone={(id) => {
                        onDone(id)
                        close()
                    }}
                    openEdit={() => {
                        openEdit()
                        close()
                    }}
                    onDelete={(id) => {
                        onDelete(id)
                        close()
                    }}
                />
            </ModalContainer>
            <div className="flex max-w-sm w-full border rounded-md h-12 border-[var(--tertiary-color)] overflow-hidden">
                <div className="flex-grow px-2 flex flex-col overflow-hidden text-sm justify-center">
                    <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                        {todo.title}
                    </span>
                    {todo.categories.length > 0 ? <CategoriesList categories={todo.categories} /> : null}
                </div>
                <button
                    onClick={open}
                    className="w-12  flex items-center justify-center bg-[var(--tertiary-color)] flex-shrink-0">
                    <InfoIcon size="2rem" />
                </button>
            </div>
        </>
    )
}
