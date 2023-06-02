import React, { useEffect } from "react";
import { api } from "~/utils/api";
import Todo from "./todo_component";
import AddTodo from "../forms/add_todo";
import AddIcon from "../icons/add";
import CategoryLabel from "../misc/category_label";
import CloseIcon from "../icons/close";

export default function Todos() {
    const todosQuery = api.todos.getUserTodos.useQuery({ excludeDone: false });
    const [todos, setTodos] = React.useState<
        typeof todosQuery.data | undefined
    >();
    const [showAddTodo, setShowAddTodo] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<string[]>(
        []
    );

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
            {!showAddTodo && (
                <button
                    onClick={() => setShowAddTodo(true)}
                    className="fixed bottom-20 right-4 z-10 rounded-full bg-[var(--secondary-color)] text-gray-300"
                >
                    <AddIcon />
                </button>
            )}
            <div className="flex flex-col gap-2 p-2 ">
                <div>
                    <div className="flex items-center gap-1">
                        <span>Categories</span>
                        {selectedCategory.length > 0 ? (
                            <button className="h-4 w-4 text-xs" onClick={() => {setSelectedCategory([])}}>
                                <CloseIcon />
                            </button>
                        ) : null}
                    </div>
                    <div className="thin-scroll flex gap-2 overflow-auto pb-2 pt-1">
                        {todos?.categories &&
                            todos.categories.map((category) => (
                                <CategoryLabel
                                    active={selectedCategory.includes(
                                        category.id
                                    )}
                                    onClick={(categoryId) => {
                                        if (
                                            selectedCategory.includes(
                                                category.id
                                            )
                                        )
                                            return setSelectedCategory(
                                                selectedCategory.filter(
                                                    (id) => id !== categoryId
                                                )
                                            );
                                        setSelectedCategory((old) => [
                                            ...old,
                                            categoryId,
                                        ]);
                                    }}
                                    key={category.id}
                                    category={category}
                                />
                            ))}
                    </div>
                </div>
                <div className="my-2 border-b border-[var(--tertiary-color)]"></div>
                {todos?.todos &&
                    todos.todos
                        .filter((todo) => {
                            if (selectedCategory.length === 0) return true;
                            return selectedCategory.includes(todo.categoryId);
                        })
                        .map((todo) => <Todo key={todo.id} todo={todo} />)}
            </div>
        </div>
    );
}
