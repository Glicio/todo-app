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
import AddIcon from "../icons/add";
import Trash from "../icons/trash";
import Member from "../content/team_member";
import { Tabs, MultiSelect, TextInput, Textarea, Input } from "@mantine/core";
import DefaultMultiSelect from "../input/default_multi_select";


interface Step {
    id?: string,
    title: string,
    done: boolean,
}

interface StepAction {
    type: keyof Step;
    payload: string | boolean;
}

const stepReducer = (state: Step, action: StepAction): Step => {
    return { ...state, [action.type]: action.payload };
};

interface TodoState {
    id?: string;
    title: string;
    description?: string;
    dueDate?: Date;
    categoriesId?: string[];
    assignedTo?: string[];
    steps?: Step[]
}

type StepPayload = { index: number, step: Step }

interface TodoAction {
    type: keyof Omit<TodoState, "step"> | "reset" | "set" | "addStep" | "removeStep" | "updateStep" | "clearSteps";
    payload: string | Date | string[] | TodoState | StepPayload | number;
}

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
    if (action.type === "addStep") {
        if (!state.steps) return { ...state, steps: [action.payload as Step] }
        const steps = [...state.steps, action.payload as Step]
        return { ...state, steps }
    }
    if (action.type === "removeStep") {
        if (!state.steps) return state
        const steps = state.steps.filter((_curr, index) => index !== (action.payload as number))
        return { ...state, steps }
    }
    if (action.type === "updateStep") {
        if (!state.steps) return state
        const steps = state.steps.map((curr, index) =>
            index === (action.payload as StepPayload).index
                ?
                (action.payload as StepPayload).step
                :
                curr
        )
        return { ...state, steps }
    }
    if (action.type === "clearSteps") {
        return { ...state, steps: undefined }
    }
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
    const [stepForm, dispatchStepForm] = React.useReducer(stepReducer, { title: "", done: false });
    //procedures
    const getTeamMembers = api.teams.getTeamUsers.useQuery(
        { teamId: agent?.id as string },
        {
            enabled: agentType === "team" && agent !== undefined,
        }
    )
    const handleClose = () => {
        dispatch({ type: "reset", payload: "" })
        close()
    }

    const addTodo = api.todos.createTodo.useMutation({
        onSuccess: (data) => {
            if (onAdd) {
                onAdd(data);
            }
            handleClose();
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
            handleClose();
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

    //hooks
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
                    steps: todoToEdit.steps || [],
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

    const addStep = (step: Step) => {
        if (todo.steps && todo.steps.length >= 50) {
            dispatchStepForm({ type: "title", payload: "" })
            return notifications.show({
                title: "Error adding step!",
                message: "You can't add more than 50 steps",
                color: "red",
                icon: <ErrorIcon />
            })
        }
        dispatch({ type: "addStep", payload: step })
        dispatchStepForm({ type: "title", payload: "" })
    }
    return (
        <ModalContainer opened={opened}
            onClose={() => {
                dispatch({ type: "reset", payload: "" });
                handleClose()
            }} 
            title={todoToEdit ? "Edit To-do" : "Add new to-do"} 
            color={getColors()} 
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
                            steps: todo.steps || null,
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
                        steps: todo.steps,
                        categoriesIds: todo.categoriesId,
                        assignedUsersIds: todo.assignedTo || undefined,
                    });
                }}
            >

                <Tabs
                    color="secondary-color.0"
                    defaultValue={"info"}
                    classNames={{
                        tabsList: "backdrop-blur",
                        panel: "w-full h-[60vh] overflow-y-auto"
                    }}>

                    <Tabs.List>
                        <Tabs.Tab value="info">General</Tabs.Tab>
                        <Tabs.Tab value="steps">Steps</Tabs.Tab>
                        <Tabs.Tab value="assignment" disabled={agentType !== "team"}>Assignment</Tabs.Tab>
                        <Tabs.Panel value="info" className="py-2">
                            <TextInput
                                label="Title"
                                value={todo.title}
                                required
                                onChange={(e) =>
                                    dispatch({ type: "title", payload: e.target.value })
                                }
                                placeholder="The title of your todo"
                            />
                            <DefaultMultiSelect
                                clearable
                                label="Category"
                                placeholder="Select a category"
                                disabled={categories.length <= 0}
                                data={categories.map((category) => ({
                                    value: category.id,
                                    label: category.name,
                                }))}
                                value={todo.categoriesId || []}
                                onChange={(value) => {
                                    dispatch({ type: "categoriesId", payload: value })
                                }}
                            />
                            <FormItem label="Description">
                                <Textarea
                                    id="desc"
                                    name="desc"
                                    minRows={10}
                                    maxRows={10}
                                    value={todo.description}
                                    onChange={(e) =>
                                        dispatch({
                                            type: "description",
                                            payload: e.target.value,
                                        })
                                    }
                                    placeholder="Describe your todo"
                                />
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
                            </FormItem>
                        </Tabs.Panel>
                        <Tabs.Panel value="steps">
                            <div className="flex flex-col overflow-hidden h-[60vh] pt-2">
                                <div className="flex gap-2 w-full items-center">
                                    <Input
                                        placeholder="Add a step"
                                        className="flex-grow"
                                        value={stepForm.title}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                if (stepForm.title.length > 0) {
                                                    addStep(stepForm)
                                                }
                                            }
                                        }}

                                        onChange={(e) => {
                                            dispatchStepForm({ type: "title", payload: e.target.value })
                                        }} />
                                    <button className="h-6 w-6"
                                        type="button"
                                        onClick={() => {
                                            if (stepForm.title.length > 0) {
                                                addStep(stepForm)
                                            }
                                        }}
                                    ><AddIcon /></button>
                                </div>
                                <div className="flex-grow mt-2 overflow-y-auto">
                                    
                                    {todo.steps && todo.steps.length > 0 ? todo.steps?.map((step, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={step.done}
                                                onChange={(e) => {
                                                    dispatch({
                                                        type: "updateStep",
                                                        payload: {
                                                            index: index,
                                                            step: { ...step, done: e.target.checked }
                                                        }
                                                    })
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    dispatch({ type: "removeStep", payload: index })
                                                }}>
                                                <Trash size="1rem" />
                                            </button>
                                            <span className="overflow-hidden text-ellipsis">
                                                {step.title}
                                            </span>
                                        </div>
                                    )) : <div className="p-2">
                                            No steps yet
                                        </div>}
                                </div>
                            </div>
                        </Tabs.Panel>
                        <Tabs.Panel value="assignment">
                            <div className="flex flex-col overflow-hidden h-[60vh] pt-2">
                                <DefaultMultiSelect
                                    label="Assigned to"
                                    
                                    placeholder="Select team members"
                                    data={teamMembers.map((member) => ({
                                        value: member.id,
                                        label: member.name || "",
                                    }))}
                                    value={todo.assignedTo || []}
                                    onChange={(value) => dispatch({ type: "assignedTo", payload: value })}
                                />
                                <div className="flex-grow overflow-y-auto flex flex-col gap-2 my-2 py-2">
                                    {todo.assignedTo?.map((memberId) => {
                                        const member = teamMembers.find((member) => member.id === memberId)
                                        if (!member) return null
                                        return (
                                            <Member
                                                isOwner={false}
                                                key={member.id} member={{
                                                    id: member.id,
                                                    name: member.name,
                                                    image: member.image,
                                                    email: member.email || null,
                                                }} />
                                        )
                                    })
                                    }
                                </div>
                            </div>
                        </Tabs.Panel>
                    </Tabs.List>
                </Tabs>

                <FormActions loading={addTodo.isLoading || editTodo.isLoading} onCancel={close} />
            </form>
        </ModalContainer>
    );
}
