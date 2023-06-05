import React from "react";
import { api } from "~/utils/api";
import AddTodo from "../forms/add_todo";
import CategoryLabel from "../misc/category_label";
import CloseIcon from "../icons/close";
import { userContext } from "~/contexts/UserProvider";
import AddBtn from "../input/add_btn";
import type SimpleTodo from "~/utils/simple_todo";
import type SimpleCategory from "~/utils/simple_category";
import TodoComponent from "./todo_component";



export default function Todos({done}: {done: boolean}) {
    const { agent, agentType } = React.useContext(userContext);

    const todosQuery = api.todos.getUserTodos.useQuery(
        { done: done, agentId: agent?.id || "", agentType: agentType },
        {
            enabled: !!agent && !!agentType,
            refetchOnMount: true,
        }
    );

    const [todos, setTodos] = React.useState<SimpleTodo[]>([]);
    const [showAddTodo, setShowAddTodo] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<string[]>([]);
    const [categories, setCategories] = React.useState<SimpleCategory[]>([]);

    React.useEffect(() => {
        if (todosQuery.data) {
            setTodos(todosQuery.data.todos); 
            setCategories(todosQuery.data.categories);
          }
    }, [todosQuery.data]);

    if (todosQuery.isLoading)
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            </div>
        );

    const removeTodo = (id: string) => {
        setTodos((old) => {
            return old.filter((todo) => todo.id !== id);
        });
    };
    
    const addTodo = (todo: SimpleTodo) => {
        setTodos((old) => [...old, todo]);
    };


    return (
        <div>
            <AddTodo
                close={() => setShowAddTodo(false)}
                opened={showAddTodo}
                onAdd={(todo) => addTodo(todo)}
            />
            {!showAddTodo && (
                <AddBtn onClick={() => setShowAddTodo(true)} />
            )}
            <div className="flex flex-col gap-2 p-2 ">
                {categories && categories.length > 0 ? (
                    <>
                        <div>
                            <div className="flex items-center gap-1">
                                <span>Categories</span>
                                {selectedCategory.length > 0 ? (
                                    <button
                                        className="h-4 w-4 text-xs"
                                        onClick={() => {
                                            setSelectedCategory([]);
                                        }}
                                    >
                                        <CloseIcon />
                                    </button>
                                ) : null}
                            </div>

                            <div className="thin-scroll flex gap-2 overflow-auto pb-2 pt-1">
                                {categories &&
                                    categories.map((category) => (
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
                                                            (id) =>
                                                                id !==
                                                                categoryId
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
                        <div className="my-2 border-b border-[var(--tertiary-color)]"></div>{" "}
                    </>
                ) : null}
                {todos &&
                    todos
                        .filter((todo) => {
                            if (selectedCategory.length === 0 || !todo.categoryId) return true;
                            return selectedCategory.includes(todo.categoryId);
                        })
                        .map((todo) => (
                            <TodoComponent
                                key={todo.id}
                                todo={todo}
                                onDelete={(id) => {
                                    removeTodo(id);
                                }}
                                onDone={(id) => {
                                    removeTodo(id);
                                }}
                                onEdit={() => {
                                    void todosQuery.refetch();
                                }}
                            />
                        ))}
                <div className="h-14 w-full"></div>
            </div>
        </div>
    );
}
