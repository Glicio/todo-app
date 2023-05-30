import React from "react";

/**
 * The main todo component.
 * */
export default function Todo({
    todo,
}: {
    todo: {
        category: {
            name: string | undefined;
            id: string | undefined;
            color?: string | undefined;
        };
        id: string | undefined;
        title: string | undefined;
        description: string | undefined;
        createdAt: string | undefined;
        done: string | undefined;
        dueDate: string | undefined;
        updatedAt: string | undefined;
    };
}) {
    return (
        <div key={todo.id}>
            <button className={`${todo.done ? "line-through" : ""}`}>
                {todo.title}
            </button>
        </div>
    );
}
