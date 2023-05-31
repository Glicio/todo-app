import React from "react";
import { api } from "~/utils/api";
import DefaultForm from "./default_form";

interface TodoState {
    title: string;
    description: string;
    dueDate: Date;
    categoryId: string;
}

interface TodoAction {
    type: keyof TodoState;
    payload: string | Date;
}

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
    return { ...state, [action.type]: action.payload };
};

const todoInitialState: TodoState = {
    title: "",
    description: "",
    dueDate: new Date(),
    categoryId: "",
};

/**
 * the form to add a new todo.
 * */
export default function AddTodo({ close }: { close: () => void }) {
    const categoriesQuery = api.category.getUserCategories.useQuery();
    const [selectedCategory, setSelectedCategory] = React.useState<string>("");
    const [todo, dispatch] = React.useReducer(todoReducer, todoInitialState);

    React.useEffect(() => {
        console.log(todo);
    }, [todo]);
    return (
        <div className="modal absolute left-0 top-0 flex min-h-screen min-w-screen w-screen h-screen items-center justify-center backdrop-blur" onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("modal")) {
                close();
            }
        }}>
            <DefaultForm
                title="Add new Todo"
                onSubmit={() => {
                    console.log("submit");
                }}
            >
                <div className="flex w-3/4 flex-col gap-2 p-4">
                    <label htmlFor="category">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                        }}
                        className="primary-select"
                    >
                        <option value="">No category</option>
                        {categoriesQuery.data?.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="title">Title</label>
                    <input
                        className="primary-text-input"
                        type="text"
                        placeholder="Do something..."
                        value={todo.title}
                        onChange={(e) =>
                            dispatch({ type: "title", payload: e.target.value })
                        }
                    />
                    <label htmlFor="desc">Description</label>
                    <textarea
                        id="desc"
                        name="desc"
                        cols={30}
                        rows={10}
                        className="primary-text-area"
                        placeholder="I have to do something..."
                    ></textarea>

                    <label htmlFor="dueDate">Due date</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="primary-text-input w-full"
                            value={todo.dueDate ? todo.dueDate.toISOString().split("T")[0] : ""}
                            onChange={(e) => {
                                dispatch({
                                    type: "dueDate",
                                    payload: e.target.valueAsDate || "",
                                });
                            }}
                        />
                    </div>

                    <div className="items-centert mx-auto mt-4 flex justify-center gap-2 ">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={close}
                        >
                            Cancel
                        </button>
                        <button className="primary-button">Save</button>
                    </div>
                </div>
            </DefaultForm>
        </div>
    );
}
