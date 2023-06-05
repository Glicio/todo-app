import React from "react";
import AddTodo from "../forms/add_todo";
import CategoryLabel from "../misc/category_label";
import CloseIcon from "../icons/close";
import AddBtn from "../input/add_btn";
import type SimpleTodo from "~/utils/simple_todo";
import TodoComponent from "./todo_component";
import { TodoContext } from "~/contexts/TodoContext";
import SimpleCategory from "~/utils/simple_category";



export default function Todos({done}: {done: boolean}) {


    const [showAddTodo, setShowAddTodo] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<string[]>([]);
    const {todos, categories, setTodos, isLoading} = React.useContext(TodoContext);
    const [todosList, setTodosList] = React.useState<SimpleTodo[]>([]);
    const [categoriesList, setCategoriesList] = React.useState<SimpleCategory[]>([]);

    const removeTodo = (id: string) => {
        setTodos((old) => {
            return old.filter((todo) => todo.id !== id);
        });
    };
    
    const addTodo = (todo: SimpleTodo) => {
        setTodos((old) => [...old, todo]);
    };
    
    React.useEffect(() => {
        if(done){
            setTodosList(todos.filter(todo => todo.done))
        }else{
            setTodosList(todos.filter(todo => !todo.done))
        }
    }, [todos, done])

    React.useEffect(() => {
        const activeCategories = todosList.map(todo => todo.categoryId).filter((id) => id !== undefined) as string[]
        setCategoriesList(categories.filter(category => activeCategories.includes(category.id)))
    }, [categories, todosList])

    if (isLoading)
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            </div>
        );

    return (
        <div>
            <AddTodo
                close={() => setShowAddTodo(false)}
                opened={showAddTodo}
                onAdd={(todo) => addTodo(todo)}
            />
            {!showAddTodo && !done && (
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
                        <div className="my-2 border-b border-[var(--tertiary-color)]"></div>{" "}
                    </>
                ) : null}
                {todosList &&
                    todosList
                        .filter((todo) => {
                            if (selectedCategory.length === 0) return true;
                            if(!todo.categoryId) return false
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
                                onEdit={(newTodo) => {
                                    setTodos((old) => {
                                        return old.map((t) => {
                                            if (t.id === todo.id) {
                                                return newTodo
                                                ;
                                            }
                                            return t;
                                        });
                                    });
                                }}
                            />
                        ))}
                <div className="h-14 w-full"></div>
            </div>
        </div>
    );
}
