import React from "react";
import { api } from "~/utils/api";
import DefaultForm from "./default_form";
import { DateTimePicker } from "@mantine/dates";
import ModalContainer from "../containers/modal_container";

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
export default function AddTodo({ opened, close }: {opened: boolean, close: () => void }) {
    const categoriesQuery = api.category.getUserCategories.useQuery();
    const [selectedCategory, setSelectedCategory] = React.useState<string>("");
    const [todo, dispatch] = React.useReducer(todoReducer, todoInitialState);
    const [activeDate, setActiveDate] = React.useState(false);
    React.useEffect(() => {
        console.log(todo);
    }, [todo]);
    return (
            <ModalContainer opened={opened} onClose={close}>
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
                    
                    <div className="flex gap-2">
                    <label htmlFor="duedate">Due date</label>
                        <input type="checkbox"
                            checked={activeDate}
                            onChange={() => setActiveDate((old) => !old)}
                            className="rounded-md"
                        />
                    </div>
                    <DateTimePicker
                    placeholder="Pick date and time"
                    value={todo.dueDate}
                            aria-disabled={!activeDate}
                            disabled={!activeDate}
                            className="bg-white rounded-md"
                                onChange={(value) =>{
                                    if(!value) return
                                        dispatch({ type: "dueDate", payload: new Date(value?.toISOString()) })
                                }
                                }
                            />

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
        </ModalContainer>
    );
}
