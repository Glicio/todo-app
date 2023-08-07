import React from "react";
import AddTodo from "../forms/add_todo";
import CategoryLabel from "../misc/category_label";
import CloseIcon from "../icons/close";
import AddBtn from "../input/add_btn";
import { TodoContext } from "~/contexts/TodoContext";
import type SimpleCategory from "~/utils/simple_category";
import type SimpleTodo from "~/utils/simple_todo";
import NewTodoComponent from "./new_todo_component";
import { userContext } from "~/contexts/UserProvider";



export default function Todos({ done }: { done: boolean }) {


    const [showAddTodo, setShowAddTodo] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<string[]>([]);
    const { todos, categories, setTodos, isLoading } = React.useContext(TodoContext);
    const { agent, agentType } = React.useContext(userContext)
    const [todosList, setTodosList] = React.useState<SimpleTodo[]>([]);
    const [filteredTodos, setFilteredTodos] = React.useState<SimpleTodo[]>([]);
    const [categoriesList, setCategoriesList] = React.useState<SimpleCategory[]>([]);
    const [todoToEdit, setTodoToEdit] = React.useState<SimpleTodo | undefined>(undefined);
    const removeTodo = (id: string) => {
        setTodos((old) => {
            return old.filter((todo) => todo.id !== id);
        });
    };

    const addTodo = (todo: SimpleTodo) => {
        setTodos((old) => [...old, todo]);
    };

    React.useEffect(() => {
        if (done) {
            setTodosList(todos.filter(todo => todo.done))
        } else {
            setTodosList(todos.filter(todo => !todo.done))
        }
    }, [todos, done])

    React.useEffect(() => {
        const activeCategories = new Set<string>()
        for (const todo of todosList) {
            console.log(todo)
            if (todo.categories.length === 0) continue
            for (const category of todo.categories) {
                console.log(category)
                activeCategories.add(category.id)
            }
        }
        console.log(activeCategories)
        setCategoriesList(categories.filter(category => activeCategories.has(category.id)))
    }, [categories, todosList])

    React.useEffect(() => {
        console.log(todosList)
        if (selectedCategory.length > 0) {
            setFilteredTodos(
                todosList.filter((todo) =>
                    todo.categories?.some((category) =>
                        selectedCategory.includes(category.id)
                    )
                )
            );
        } else {
            setFilteredTodos(todosList);
        }
    }, [selectedCategory, todosList]);

    //remove category filter when done or agent changes
    React.useEffect(() => {
        setSelectedCategory([])
    }, [done, agent, agentType])

    if (isLoading)
        return (
            <div className="flex items-center my-32 justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            </div>
        );


    return (
        <div>
            <AddTodo
                close={() => {
                    setShowAddTodo(false)
                    setTodoToEdit(undefined)
                }}
                onEdit={(todo) => {
                    setTodos((old) => {
                        return old.map((oldTodo) => {
                            if (oldTodo.id === todo.id) {
                                return todo;
                            }
                            return oldTodo;
                        });
                    });
                    setTodoToEdit(undefined)
                }}
                opened={showAddTodo}
                onAdd={(todo) => addTodo(todo)}
                todoToEdit={todoToEdit}
            />
            {!showAddTodo && !done && (
                <AddBtn onClick={() => setShowAddTodo(true)} />
            )}
            <div className="flex flex-col gap-2 flex-wrap px-2">
                {categories && categories.length > 0 ? (
                    <>
                        <div className="w-full h-20 "></div>
                        <div className="h-fit overflow-hidden fixed w-full backdrop-blur border-b border-[var(--tertiary-color)]">
                            <div className="relative px-2">
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
                                <div className="thin-scroll flex gap-2 overflow-auto pb-2 pt-1 h-8">
                                    {categoriesList &&
                                        categoriesList.map((category) => (
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
                            <div className=""></div>{" "}
                        </div>
                    </>
                ) : null}
                <div className="todos flex flex-col items-center justify-center gap-2 w-full mx-auto md:grid px-2"
                    style={{
                        gridTemplateColumns: "repeat(auto-fill, 25rem)",
                    }}
                >
                    {filteredTodos &&
                        filteredTodos
                            .map((todo) => (
                                <NewTodoComponent todo={todo} key={todo.id}
                                    openEdit={() => {
                                        setShowAddTodo(true);
                                        setTodoToEdit(todo);
                                    }}
                                    onDelete={(id) => {
                                        removeTodo(id);
                                    }}
                                    onDone={(id) => {
                                        setTodos((todos) => {
                                            return todos.map(curr => {
                                                if (curr.id === id) {
                                                    return { ...curr, done: !curr.done }
                                                }
                                                return curr
                                            })
                                        })
                                    }}
                                />
                            ))}
                </div>
                {/* add button space */}
                <div className="h-20 w-full"></div>
            </div>
        </div>
    );
}
