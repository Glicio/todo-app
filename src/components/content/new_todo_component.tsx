import React from 'react'
import type SimpleTodo from '~/utils/simple_todo'
import InfoIcon from '../icons/info'
import { Badge } from '@mantine/core'



export default function NewTodoComponent({ todo }: { todo: SimpleTodo }) {
    return (
        <div className="flex max-w-sm w-full border rounded-md h-12 border-[var(--tertiary-color)]">
            <div className="flex-grow p-2  flex flex-col overflow-hidden text-sm">
                <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                    {todo.title}
                </span>
                <div className="flex gap-2">
                    {todo.categories.map((category) => (
                        <Badge key={category.id} size='sm' variant='dot'
                            styles={{
                                leftSection: {
                                    fill: category.color || ""
                                }
                            }}
                        >
                            {category.name}
                        </Badge>
                    ))}
                </div>
            </div>
            <button className="w-12  flex items-center justify-center bg-[var(--tertiary-color)]">
                <InfoIcon size="2rem" />
            </button>
        </div>
    )
}
