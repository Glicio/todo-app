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
            {todos.data?.categories &&
                todos.data.categories.map((category) => (
                    <div key={category.id}>
                        <p className="bg-red-500">{category.name}</p>
                        {todos.data?.todos &&
                            todos.data.todos
                                .filter(
                                    (todo) => todo.categoryId === category.id
                                )
                                .map((todo) => (
                                    <div key={todo.id}>
                                        <p>{todo.title}</p>
                                    </div>
                                ))}
                    </div>
                ))}
        </div>
    );
}
