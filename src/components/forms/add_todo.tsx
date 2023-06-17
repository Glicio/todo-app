import React from "react";
import { api } from "~/utils/api";
import { DateTimePicker } from "@mantine/dates";
import ModalContainer from "../containers/modal_container";
import { userContext } from "~/contexts/UserProvider";
import { notifications } from "@mantine/notifications";
import ErrorIcon from "../icons/erro_icon";
import TextInput from "../input/text_input";
import FormItem from "../input/form_item";
import FormActions from "../input/form_actions";
import type SimpleTodo from "~/utils/simple_todo";
import { TodoContext } from "~/contexts/TodoContext";
import DefaultSelect from "../input/default_select";
import type SimpleUser from "~/utils/simple_user";
import DefaultMultiSelect from "../input/default_multi_select";

interface TodoState {
    id?: string;
    title: string;
    description?: string;
    dueDate?: Date;
    categoryId?: string;
    assignedTo?: string[];
}

interface TodoAction {
    type: keyof TodoState | "reset" | "set";
    payload: string | Date | string[] | TodoState;
}

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
    if (action.type === "set") {
        return action.payload as TodoState;
    }
    if (action.type === "reset") {
        return todoInitialState;
    }
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
    onEdit,
    todoToEdit
}: {
    opened: boolean;
    close: () => void;
    onAdd?: (todo: SimpleTodo) => void;
    onEdit?: (todo: SimpleTodo) => void;
    todoToEdit?: SimpleTodo
}) {
    const { agent, agentType } = React.useContext(userContext);
    const { categories } = React.useContext(TodoContext)
    const [teamMembers, setTeamMembers] = React.useState<SimpleUser[]>([])
    const [todo, dispatch] = React.useReducer(todoReducer, todoInitialState);
    const [activeDate, setActiveDate] = React.useState(false);
    //procedures
    const getTeamMembers = api.teams.getTeamUsers.useQuery({ teamId: agent?.id as string },
        {
            enabled: agentType === "team" && agent !== undefined,
        }
    )

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
            if (onEdit) {
                onEdit(data);
            }
            close();
        }
    })

    //rooks
    React.useEffect(() => {
        if (agentType === "team" && agent !== undefined) {
            void getTeamMembers.refetch()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentType, agent])

    React.useEffect(() => {
        if (getTeamMembers.data) {
            setTeamMembers(getTeamMembers.data)
        }
    }, [getTeamMembers.data])

    React.useEffect(() => {
        if (todoToEdit) {
            dispatch({
                type: 'set', payload: {
                    id: todoToEdit.id,
                    title: todoToEdit.title,
                    description: todoToEdit.description || undefined,
                    dueDate: todoToEdit.dueDate ? new Date(todoToEdit.dueDate) : undefined,
                    categoryId: todoToEdit.categoryId || undefined,
                    assignedTo: todoToEdit.assignedTo?.map(curr => curr.id) || []
                }
            })
        }
    }, [todoToEdit])

    return (
        <ModalContainer opened={opened} onClose={() => {
            dispatch({ type: "reset", payload: "" })
            close()
        }} title="Add new to-do" keepMounted={false}>
            <form
                className="w-full flex gap-2 flex-col"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!agent) return;
                    if (todo.id) {
                        return editTodo.mutate({
                            agentId: agent.id,
                            agentType: agentType,
                            todoId: todo.id,
                            title: todo.title,
                            description: todo.description || null,
                            dueDate: activeDate ? todo.dueDate || null : null,
                            categoryId: todo.categoryId || null,
                            assignedUsersIds: todo.assignedTo || null,
                        })
                    }
                    addTodo.mutate({
                        agentId: agent.id,
                        agentType: agentType,
                        title: todo.title,
                        description: todo.description,
                        dueDate: activeDate ? todo.dueDate : undefined,
                        categoryId: todo.categoryId || undefined,
                        assignedUsersIds: todo.assignedTo || undefined,
                    });
                }}
            >
                <DefaultSelect
                    clearable
                    label="Category"
                    placeholder="Select a category"
                    data={categories.map((category) => ({
                        value: category.id,
                        label: category.name,
                    }))}
                    value={todo.categoryId}
                    onChange={(value) => {
                        dispatch({ type: "categoryId", payload: value })
                    }}
                />
                {agentType === "team" ?
                    <DefaultMultiSelect
                        label="Assigned to"
                        placeholder="Select team members"
                        data={teamMembers.map((member) => ({
                            value: member.id,
                            label: member.name || "",
                        }))}
                        value={todo.assignedTo || []}
                        onChange={(value) => dispatch({ type: "assignedTo", payload: value })}
                    /> : null}

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
                <FormActions loading={addTodo.isLoading || editTodo.isLoading} onCancel={close} />
            </form>
        </ModalContainer>
    );
}
