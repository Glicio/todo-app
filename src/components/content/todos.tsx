import React, { useEffect } from "react";
import { api } from "~/utils/api";
import Todo from "./todo_component";
import CategoryHeader from "./category_header";
import AddTodo from "../forms/add_todo";

export default function Todos() {
    const todosQuery = api.todos.getUserTodos.useQuery({ excludeDone: false });
    const [todos, setTodos] = React.useState<
        typeof todosQuery.data | undefined
    >();
    const [showAddTodo, setShowAddTodo] = React.useState(false);

    const todoCount = api.todos.getTodoCount.useQuery();

    useEffect(() => {
        console.log(todosQuery.data);
        if (todosQuery.data) {
            setTodos(todosQuery.data);
        }
    }, [todosQuery.data]);
    if (todosQuery.isLoading)
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            </div>
        );
    return (
        <div>
            {showAddTodo ? <AddTodo close={() => setShowAddTodo(false)} /> : ""}
            <div className="flex justify-center gap-2 p-2">
                <button className="primary-button" onClick={() => setShowAddTodo(true)}>New to-do</button>
                <button className="primary-button">New category</button>
            </div>
            <span>TO-DO count: {todoCount.data || "loading..."}/50</span>
            <div className="p-2">
                {todos?.categories &&
                    todos.categories.map((category) => (
                        <div key={category.id}>
                            <CategoryHeader category={category} />
                            <div className="py-4">
                                {todos.todos &&
                                    todos.todos
                                        .filter(
                                            (todo) =>
                                                todo.categoryId ===
                                                    category.id && !todo.done
                                        )
                                        .map((todo) => (
                                            <Todo key={todo.id} todo={todo} />
                                        ))}
                            </div>
                        </div>
                    ))}

                <CategoryHeader category={{ name: "Done", color: "#aaa" }} />
                <div className="py-4">
                    {todos?.todos &&
                        todos.todos
                            .filter((todo) => todo.done)
                            .map((todo) => <Todo key={todo.id} todo={todo} />)}
                </div>
            </div>
        </div>
    );
}
