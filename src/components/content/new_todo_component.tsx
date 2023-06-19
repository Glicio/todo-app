import React from 'react'
import type SimpleTodo from '~/utils/simple_todo'
import InfoIcon from '../icons/info'
import { useDisclosure } from '@mantine/hooks'
import ModalContainer from '../containers/modal_container'
import TimeStamps from './time_stamps'
import TodoActions from './todo_actions'




const FullTodo = ({ todo }: { todo: SimpleTodo }) => {
    return (
        <div className="max-h-[80vh] overflow-hidden">
            <TimeStamps createdAt={todo.createdAt} updatedAt={todo.updatedAt || undefined} createdByName={todo.createdBy.name || undefined} updatedByName={todo.updatedBy?.name || undefined} />
            {(todo.description || todo.categories) ? <div className="border-b border-[var(--tertiary-color)] my-1"></div> : null}
            <div className="py-2">
                {todo.categories.length > 0 ? <CategoriesList categories={todo.categories} wrap/> : null}
                {todo.description ?
                    <div className="max-h-[60vh] py-1 overflow-y-auto">
                    <h2 className="text-lg font-bold">
                        Description
                    </h2>
                    <p className="leading-4 ">
                        {todo.description}
                    </p>
                    </div>
                    : null}
            </div>
            <TodoActions borderColor='var(--tertiary-color)' />
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
    return (
        <div className={`flex gap-2 overflow-x-auto overflow-hidden thin-scroll ${wrap ? "flex-wrap" : ""}`}>
            {categories.map((category) => (
                <CategoryBadge key={category.id} name={category.name} color={category.color || ""} />
            ))}
        </div>
    )
}

export default function NewTodoComponent({ todo }: { todo: SimpleTodo }) {
    const [opened, { open, close }] = useDisclosure()
    return (
        <>
            <ModalContainer opened={opened} onClose={close} title={todo.title} color={todo.categories[0]?.color || ""}>
                <FullTodo todo={todo} />
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
