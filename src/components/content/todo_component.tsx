import React from "react";
import Trash from "../icons/trash";
import Check from "../icons/check";
import Undo from "../icons/undo";
import Edit from "../icons/edit";

const toggleAnimation = (setStep: (step: number) => void) => {
    setStep(1);
    setTimeout(() => {
        setStep(2);
    }, 100);
    setTimeout(() => {
        setStep(3);
    }, 200);
};

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
    const [todoActive, setTodoActive] = React.useState(false);
    return (
        <div
            key={todo.id}
            className={`rounded-md border transition-all`}
            style={{
                borderColor: todo.category.color
                    ? todo.category.color
                    : "grey",
            }}
        >
            <button
                className="todo-header w-full"
                onClick={() => setTodoActive((old) => !old)}
                style={{
                    backgroundColor: todoActive
                        ? todo.category.color
                            ? todo.category.color
                            : "gray"
                        : "",
                }}
            >
                {todo.title}
            </button>
                <div
                    className="todo-body overflow-hidden transition-all ease-in-out "
                    style={{
                        maxHeight: todoActive ? "1000px" : "0px",
                    }}
                >

            {todo.description || todo.dueDate ? (
                    <div className="p-2">
                        {todo.dueDate ? <span>{new Date(todo.dueDate).toLocaleDateString()}</span> : null}
                        <p className="max-h-[18rem] overflow-y-auto thin-scroll">{todo.description}</p>
                    </div>

            ) : null}
                    <div
                        className="flex w-full justify-center gap-8 p-2"
                        style={{
                            borderTop: `1px solid ${
                                todo.category.color ? todo.category.color : "grey"
                            }`,
                            borderColor: todo.category.color
                                ? todo.category.color
                                : "",
                        }}
                    >
                        <button className="flex gap-2 text-red-400">
                            <Trash /> Delete
                        </button>
                        <button className="flex gap-2 text-yellow-400">
                        <Edit/> Edit
                        </button>
                        {todo.done ? (
                            <button className="flex gap-2">
                                <Undo /> Undo
                            </button>
                        ) : (
                            <button className="flex items-center gap-2 text-green-400">
                                <Check /> Done
                            </button>
                        )}
                    </div>
                </div>
        </div>
    );
}
