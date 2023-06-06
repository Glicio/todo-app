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

const disabled_color = "rgb(209,213,219)";
/**
 * The main todo component.
 * */
export default function TodoComponent({
    todo,
    onDelete,
    onEdit,
    onDone,
}: {
    todo: SimpleTodo;
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
    const mobile = useMediaQuery("(max-width: 768px)");

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

    return (
        <div
            key={todo.id}
            className={`flex flex-col  ${
                fade ? "fadeOut" : ""
            } w-full max-w-[25rem] ${!mobile ? "h-[15rem]" : ""}`}
        >
            <ModalContainer opened={confirmDelete} onClose={closeConfirmDelete}>
                <div className="m-auto flex h-fit w-fit flex-col items-center justify-center gap-4 rounded-md border bg-[var(--primary-color)] p-2">
                    <h1 className="text-2xl font-bold">Delete todo</h1>
                    <p>Are you sure you want to delete this todo?</p>
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
                        border: `1px solid ${
                            todo.category?.color || "var(--secondary-color)"
                        }`,
                    }}
                >
                    <button
                        className="flex w-full overflow-hidden overflow-ellipsis whitespace-nowrap p-2 text-left font-bold items-center"
                        onClick={() => {
                            if (!interacted) setInteracted(true);
                            setTodoActive((old) => !old);
                        }}
                    >
                        <span className="w-full h-fit overflow-hidden text-ellipsis whitespace-nowrap">
                            {todo.title}
                        </span>
                        {mobile ? <ChevronUpDown /> : null}
                    </button>
                </Tooltip>
                <div
                    className={` ${
                        mobile
                            ? interacted
                                ? todoActive
                                    ? "open"
                                    : "close"
                                : "max-h-0"
                            : "h-full"
                    } flex flex-col justify-between overflow-hidden`}
                >
                    <div className="flex flex-col">
                        <div className="mx-2 border-b"></div>
                        <div className="timestamps px-2 pt-1 text-xs">
                            <div className="created">
                                Created by{" "}
                                <span className="font-bold">
                                    {todo.createdBy.name}
                                </span>{" "}
                                at{" "}
                                <span className="font-bold">
                                    {new Date(todo.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {todo.updatedAt ? (
                                <div className="updated">
                                    Last update{" "}
                                    {todo.updatedBy ? (
                                        <>
                                            {"by "}
                                            <span className="font-bold">
                                                {todo.updatedBy.name}
                                            </span>{" "}
                                        </>
                                    ) : (
                                        " "
                                    )}
                                    at{" "}
                                    <span className="font-bold">
                                        {new Date(
                                            todo.updatedAt
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                        {todo.description ? (
                            <div className="flex flex-col h-[8rem] p-2">
                                <h3 className="font-bold">Description:</h3>
                                <p className="max-h-full overflow-y-auto ">
                                    {todo.description}
                                </p>
                            </div>
                        ) : null}
                    </div>
                    <div
                        className="flex w-full items-center justify-evenly border-t py-2 "
                        style={{
                            borderColor: todo.category?.color
                                ? todo.category.color
                                : disabled_color,
                        }}
                    >
                        <button
                            onClick={() => {
                                openConfirmDelete();
                            }}
                            className="flex items-center gap-2 text-red-400"
                        >
                            <Trash /> Delete
                        </button>
                        {todo.done ? null : (
                            <button className="flex items-center gap-2 text-yellow-400">
                                <Edit /> Edit
                            </button>
                        )}
                        {todo.done ? (
                            <button
                                className="flex items-center gap-2"
                                onClick={() => {
                                    if (!agent || !agentType || !todo.id)
                                        return;

                                    undoMutation.mutate({
                                        todoId: todo.id,
                                        agentId: agent.id,
                                        agentType: agentType,
                                    });
                                }}
                            >
                                {undoMutation.isLoading ? (
                                    <LoadingIcon color="white" />
                                ) : (
                                    <Undo />
                                )}{" "}
                                Undo
                            </button>
                        ) : (
                            <button
                                className="flex items-center gap-2 text-green-400 "
                                disabled={doMutation.isLoading}
                                onClick={() => {
                                    if (!agent || !agentType || !todo.id)
                                        return;
                                    doMutation.mutate({
                                        agentId: agent.id,
                                        agentType: agentType,
                                        todoId: todo.id,
                                    });
                                }}
                            >
                                {doMutation.isLoading ? (
                                    <LoadingIcon color="rgb(74,222,128)" />
                                ) : (
                                    <Check />
                                )}{" "}
                                Done
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
