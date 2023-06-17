import React from "react";
import Trash from "../icons/trash";
import Check from "../icons/check";
import Undo from "../icons/undo";
import Edit from "../icons/edit";
import { api } from "~/utils/api";
import { userContext } from "~/contexts/UserProvider";
import { notifications } from "@mantine/notifications";
import ModalContainer from "../containers/modal_container";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import LoadingIcon from "../misc/loading_icon";
import type SimpleTodo from "~/utils/simple_todo";
import { Tooltip } from "@mantine/core";
import ChevronUpDown from "../icons/chevron_up_down";
import TimeStamps from "./time_stamps";
import TodoActions from "./todo_actions";

const disabled_color = "rgb(209,213,219)";
/**
 * The main todo component.
 * */
export default function TodoComponent({
    todo,
    onDelete,
    onEdit,
    onDone,
    openEdit,
}: {
    todo: SimpleTodo;
    openEdit: () => void;
    onDelete: (id: string) => void;
    onEdit: (todo: SimpleTodo) => void;
    onDone: (id: string) => void;
}) {
    const { agent, agentType } = React.useContext(userContext);
    const [todoActive, setTodoActive] = React.useState(false);
    const [fade, setFade] = React.useState(false);
    const [interacted, setInteracted] = React.useState(false);
    const [
        confirmDelete,
        { open: openConfirmDelete, close: closeConfirmDelete },
    ] = useDisclosure();
    const mobileQuery = useMediaQuery("(max-width: 768px)");
    const [mobile, setMobile] = React.useState(
        typeof window !== undefined ? window.innerWidth <= 768 : true
    );

    const deleteMutation = api.todos.deleteTodo.useMutation({
        onSuccess: () => {
            notifications.show({
                color: "green",
                title: "Todo deleted",
                message: "Todo was deleted successfully",
                autoClose: 1000,
            });
            setFade(true);
            setTimeout(() => {
                onDelete(todo.id);
            }, 100);
        },
        onError: (error) => {
            notifications.show({
                color: "red",
                title: "Todo not deleted",
                message: error.message,
                autoClose: 1000,
            });
        },
    });

    const doMutation = api.todos.markAsDone.useMutation({
        onError: (error) => {
            notifications.show({
                color: "red",
                title: "Todo not updated",
                message: error.message,
                autoClose: 1000,
            });
        },
        onSuccess: () => {
            setFade(true);
            setTimeout(() => {
                onEdit({ ...todo, done: true });
            }, 100);
        },
    });
    const undoMutation = api.todos.undoTodo.useMutation({
        onError: (error) => {
            notifications.show({
                color: "red",
                title: "Todo not updated",
                message: error.message,
                autoClose: 1000,
            });
        },
        onSuccess: () => {
            setFade(true);
            setTimeout(() => {
                onEdit({ ...todo, done: false });
            }, 100);
        },
    });


    React.useEffect(() => {
        if (mobileQuery !== undefined) {
            setMobile(mobileQuery);
        }
    }, [mobileQuery]);

    return (
        <div
            key={todo.id}
            className={`flex flex-col  ${fade ? "fadeOut" : ""
                } w-full max-w-[25rem] ${!mobile ? "h-[15rem]" : ""}`}
        >
            <ModalContainer opened={confirmDelete} onClose={closeConfirmDelete} title="Delete to-do">
                <div className="m-auto flex h-fit w-fit flex-col items-center justify-center gap-4 rounded-md bg-[var(--primary-color)] p-2">
                    <p>Are you sure you want to delete this to-do?</p>
                    <div className="flex w-full justify-center gap-4">
                        <button
                            onClick={() => closeConfirmDelete()}
                            className="secondary-button w-1/2"
                        >
                            Cancel
                        </button>
                        <button
                            className="primary-button w-1/2"
                            onClick={() => {
                                if (!agent || !agentType || !todo.id) return;
                                deleteMutation.mutate({
                                    id: todo.id,
                                    agentId: agent.id,
                                    agentType: agentType,
                                });
                            }}
                        >
                            {deleteMutation.isLoading ? (
                                <LoadingIcon />
                            ) : (
                                "Confirm"
                            )}
                        </button>
                    </div>
                </div>
            </ModalContainer>

            <div
                className="flex h-full flex-col rounded-md border"
                style={{
                    borderColor: todo.category?.color
                        ? todo.category.color
                        : disabled_color,
                }}
            >
                <Tooltip
                    label={todo.title}
                    multiline
                    openDelay={500}
                    bg="black"
                    color="white"
                    style={{
                        border: `1px solid ${todo.category?.color || "var(--secondary-color)"
                            }`,
                    }}
                >
                    <button
                        className="flex w-full items-center overflow-hidden overflow-ellipsis whitespace-nowrap p-2 text-left font-bold"
                        onClick={() => {
                            if (!interacted) setInteracted(true);
                            setTodoActive((old) => !old);
                        }}
                    >
                        <span className="h-fit w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {todo.title}
                        </span>
                        {mobile ? <ChevronUpDown /> : null}
                    </button>
                </Tooltip>
                <div
                    className={` ${mobile
                        ? interacted
                            ? todoActive
                                ? "open"
                                : "close"
                            : "max-h-0"
                        : "h-full"
                        } flex flex-col justify-between overflow-hidden`}
                >
                    <div className="flex flex-col overflow-hidden">
                        <div className="mx-2 border-b"></div>
                        <TimeStamps
                            updatedAt={todo.updatedAt ? new Date(todo.updatedAt) : undefined}
                            createdAt={new Date(todo.createdAt)}
                            updatedByName={todo.updatedBy?.name || undefined}
                            createdByName={todo.createdBy.name || ""} />
                        {todo.assignedTo ?
                            todo.assignedTo.map(curr => <div key={curr.id}>{curr.name || "SEM NOME"}</div>) : null}
                        {todo.description ? (
                            <div className="flex h-[8rem] flex-col p-2">
                                <h3 className="font-bold">Description:</h3>
                                <p className="max-h-full overflow-y-auto ">
                                    {todo.description}
                                </p>
                            </div>
                        ) : null}
                    </div>
                    <TodoActions
                        onDelete={() => {
                            openConfirmDelete();
                        }}
                        onUndo={() => {
                            if (!agent || !agentType || !todo.id)
                                return;

                            undoMutation.mutate({
                                todoId: todo.id,
                                agentId: agent.id,
                                agentType: agentType,
                            });
                        }}
                        onDone={() => {
                            if (!agent || !agentType || !todo.id)
                                return;
                            doMutation.mutate({
                                agentId: agent.id,
                                agentType: agentType,
                                todoId: todo.id,
                            });
                        }}
                        onEdit={openEdit}
                        done={todo.done}
                        borderColor={todo.category?.color || undefined}
                        doLoading={doMutation.isLoading}
                        undoLoading={undoMutation.isLoading}
                        deleteLoading={deleteMutation.isLoading}
                    />
                </div>
            </div>
        </div >
    );
}
