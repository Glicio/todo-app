import React from "react";
import { api } from "~/utils/api";
import { DateTimePicker } from "@mantine/dates";
import ModalContainer from "../containers/modal_container";
import { userContext } from "~/contexts/UserProvider";
import { notifications } from "@mantine/notifications";
import ErrorIcon from "../icons/erro_icon";
import FormItem from "../input/form_item";
import FormActions from "../input/form_actions";
import type SimpleTodo from "~/utils/simple_todo";
import { TodoContext } from "~/contexts/TodoContext";
import type SimpleUser from "~/utils/simple_user";
import { MultiSelect, TextInput, Textarea } from "@mantine/core";

interface TodoState {
    id?: string;
    title: string;
    description?: string;
    dueDate?: Date;
    categoriesId?: string[];
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
};

/**
 * the form to add a new todo.
 * */
export default function AddTodo({
    opened,
    close,
    onAdd,
    onEdit,
    todoToEdit,
}: {
    opened: boolean;
    close: () => void;
    onAdd?: (todo: SimpleTodo) => void;
    onEdit?: (todo: SimpleTodo) => void;
    todoToEdit?: SimpleTodo;
}) {
    const { agent, agentType } = React.useContext(userContext);
    const { categories } = React.useContext(TodoContext);
    const [teamMembers, setTeamMembers] = React.useState<SimpleUser[]>([]);
    const [todo, dispatch] = React.useReducer(todoReducer, todoInitialState);
    const [activeDate, setActiveDate] = React.useState(false);
    //procedures
    const getTeamMembers = api.teams.getTeamUsers.useQuery(
        { teamId: agent?.id as string },
        {
            enabled: agentType === "team" && agent !== undefined,
        }
    );

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
        },
    });

    const getColors = React.useCallback(() => {
        if(!todo.categoriesId) return []
        if(todo.categoriesId.length === 1 && todo.categoriesId) {
            return categories.find((category) => category.id === (todo.categoriesId as string[])[0])?.color || []
        }
        const colors: string[] = []
        for(const categoryId of todo.categoriesId){
            const color = categories.find((category) => category.id === categoryId)?.color
            if(color) colors.push(color)
        }
        return colors
    }, [todo.categoriesId, categories])

    //rooks
    React.useEffect(() => {
        if (agentType === "team" && agent !== undefined) {
            void getTeamMembers.refetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentType, agent]);

    React.useEffect(() => {
        if (getTeamMembers.data) {
            setTeamMembers(getTeamMembers.data);
        }
    }, [getTeamMembers.data]);

    React.useEffect(() => {
        if (todoToEdit) {
            dispatch({
                type: "set",
                payload: {
                    id: todoToEdit.id,
                    title: todoToEdit.title,
                    description: todoToEdit.description || undefined,
                    dueDate: todoToEdit.dueDate
                        ? new Date(todoToEdit.dueDate)
                        : undefined,
                    categoriesId:
                        todoToEdit.categories.length > 0
                            ? todoToEdit.categories.map((curr) => curr.id)
                            : undefined,
                    assignedTo:
                        todoToEdit.assignedTo?.map((curr) => curr.id) || [],
                },
            });
        }
    }, [todoToEdit]);

    return (
        <ModalContainer
            opened={opened}
            onClose={() => {
                dispatch({ type: "reset", payload: "" });
                close();
            }}
            color={getColors()} 
            title="Add new to-do"
            keepMounted={false}
        >
            <form
                className="flex w-full flex-col gap-2"
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
                            categoriesIds: todo.categoriesId || null,
                            assignedUsersIds: todo.assignedTo || null,
                        });
                    }
                    addTodo.mutate({
                        agentId: agent.id,
                        agentType: agentType,
                        title: todo.title,
                        description: todo.description,
                        dueDate: activeDate ? todo.dueDate : undefined,
                        categoriesIds: todo.categoriesId,
                        assignedUsersIds: todo.assignedTo || undefined,
                    });
                }}
            >
                <MultiSelect
                    clearable
                    label="Category"
                    placeholder="Select a category"
                    data={categories.map((category) => ({
                        value: category.id,
                        label: category.name,
                    }))}
                    value={todo.categoriesId || []}
                    onChange={(value) => {
                        dispatch({ type: "categoriesId", payload: value });
                    }}
                />

                {agentType === "team" ? (
                    <MultiSelect
                        label="Assigned to"
                        placeholder="Select team members"
                        data={teamMembers.map((member) => ({
                            value: member.id,
                            label: member.name || "",
                        }))}
                        value={todo.assignedTo || []}
                        onChange={(value) =>
                            dispatch({ type: "assignedTo", payload: value })
                        }
                    />
                ) : null}

                <TextInput
                    label="Title"
                    value={todo.title}
                    required
                    onChange={(e) =>
                        dispatch({ type: "title", payload: e.target.value })
                    }
                    placeholder="The title of your todo"
                />
                <Textarea
                    label="Description"
                    cols={30}
                    rows={10}
                    value={todo.description}
                    onChange={(e) =>
                        dispatch({
                            type: "description",
                            payload: e.target.value,
                        })
                    }
                    placeholder="Describe your todo"
                />

                <DateTimePicker
                    label={
                        <div className="flex gap-2">
                            <span>Due Date</span>
                            <input
                                type="checkbox"
                                checked={activeDate}
                                onChange={(e) =>
                                    setActiveDate(e.target.checked)
                                }
                            />
                        </div>
                    }
                    placeholder="Pick date and time"
                    value={todo.dueDate}
                    aria-disabled={!activeDate}
                    disabled={!activeDate}
                    onChange={(value) => {
                        if (!value) return;
                        dispatch({
                            type: "dueDate",
                            payload: new Date(value?.toISOString()),
                        });
                    }}
                />
                <FormActions
                    loading={addTodo.isLoading || editTodo.isLoading}
                    onCancel={close}
                />
            </form>
        </ModalContainer>
    );
}
