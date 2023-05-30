import React, { useEffect } from "react";
import { api } from "~/utils/api";

export default function Todos() {
    const todos = api.todos.getUserTodos.useQuery({ excludeDone: false });

    useEffect(() => {
        console.log(todos.data);
    }, [todos.data]);

    return (
        <div>
            <div className="flex justify-center gap-2 p-2">
                <button className="primary-button">New to-do</button>
                <button className="primary-button">New category</button>
            </div>
            <div className="p-2">
                {todos.data?.categories &&
                    todos.data.categories.map((category) => (
                        <div key={category.id}>
                            <p className="flex gap-2 border-b text-2xl font-bold">
                                <div
                                    className="h-8 w-8 border border-b-0"
                                    style={{
                                        backgroundColor: category.color || "",
                                    }}
                                ></div>
                                {category.name}
                            </p>
                            <div className="py-4">
                                {todos.data?.todos &&
                                    todos.data.todos
                                        .filter(
                                            (todo) => todo.categoryId === category.id
                                        )
                                        .map((todo) => (
                                            <div
                                                key={todo.id}
                                                className={`${
                                                    todo.done
                                                        ? "bg-gray-200 text-black"
                                                        : ""
                                                }`}
                                            >
                                                <p>{todo.title}</p>
                                            </div>
                                        ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
