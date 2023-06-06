import React from "react";
import { api } from "~/utils/api";
import DefaultForm from "./default_form";
import { DateTimePicker } from "@mantine/dates";
import ModalContainer from "../containers/modal_container";
import { userContext } from "~/contexts/UserProvider";
import { notifications } from "@mantine/notifications";
import ErrorIcon from "../icons/erro_icon";
import TextInput from "../input/text_input";
import FormItem from "../input/form_item";
import FormActions from "../input/form_actions";
import SimpleTodo from "~/utils/simple_todo";
import { TodoContext } from "~/contexts/TodoContext";

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
export default function AddTodo({
    opened,
    close,
    onAdd,
}: {
    opened: boolean;
    close: () => void;
    onAdd?: (todo: SimpleTodo) => void;
}) {
    const { agent, agentType } = React.useContext(userContext);
    const {categories} = React.useContext(TodoContext)

    const addTodo = api.todos.createTodo.useMutation({
        onSuccess: (data) => {
            if (onAdd) {
                onAdd(data);
            }
            close();
        },
        onError: (error) => {
            notifications.show({
                title: "Error adding todo",
                message: error.message,
                color: "red",
                icon: <ErrorIcon />,
            });
        },
    });

    const editTodo = api.todos.updateTodo.useMutation({
        onSuccess: (data) => {
        console.log(data)
        }
    })

    const [selectedCategory, setSelectedCategory] = React.useState<string>("");
    const [todo, dispatch] = React.useReducer(todoReducer, todoInitialState);
    const [activeDate, setActiveDate] = React.useState(false);
    return (
        <ModalContainer opened={opened} onClose={close} title="Add new to-do">
            <form
                className="w-full flex gap-2 flex-col"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!agent) return;
                    addTodo.mutate({
                        agentId: agent.id,
                        agentType: agentType,
                        title: todo.title,
                        description: todo.description,
                        dueDate: activeDate ? todo.dueDate : undefined,
                        categoryId: todo.categoryId,
                    });
                }}
            >
                    <FormItem label="Category">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                dispatch({
                                    type: "categoryId",
                                    payload: e.target.value,
                                });
                            }}
                            className="primary-select bg-white"
                        >
                            <option value="">No category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </FormItem>
                    <TextInput
                        label="Title"
                        value={todo.title}
                        required
                        onChange={(value) =>
                            dispatch({ type: "title", payload: value })
                        }
                        placeholder="The title of your todo"
                    />
                    <FormItem label="Description">
                        <textarea
                            id="desc"
                            name="desc"
                            cols={30}
                            rows={10}
                            value={todo.description}
                            onChange={(e) =>
                                dispatch({
                                    type: "description",
                                    payload: e.target.value,
                                })
                            }
                            className="primary-text-area"
                            placeholder="Describe your todo"
                        ></textarea>
                    </FormItem>

                    <FormItem>
                        <div className="flex items-center gap-1">
                            <label htmlFor="duedate" className="text-sm font-bold">
                                Due date
                            </label>
                            <input
                                type="checkbox"
                                checked={activeDate}
                                onChange={() => setActiveDate((old) => !old)}
                                className="rounded-md"
                            />
                        </div>
                        <DateTimePicker
                            placeholder="Pick date and time"
                            classNames={{
                                input: "primary-text-input",
                            }}
                            value={todo.dueDate}
                            aria-disabled={!activeDate}
                            disabled={!activeDate}
                            className="rounded-md bg-white"
                            onChange={(value) => {
                                if (!value) return;
                                dispatch({
                                    type: "dueDate",
                                    payload: new Date(value?.toISOString()),
                                });
                            }}
                        />
                    </FormItem>
                        <FormActions loading={addTodo.isLoading} onCancel={close}/>
            </form>
        </ModalContainer>
    );
}
