import React from "react";
import Trash from "../icons/trash";
import Check from "../icons/check";
import Undo from "../icons/undo";
import Edit from "../icons/edit";
import { api } from "~/utils/api";
import { userContext } from "~/contexts/UserProvider";
import { notifications } from "@mantine/notifications";
import { type Todo } from "@prisma/client";
import ModalContainer from "../containers/modal_container";
import { useDisclosure } from "@mantine/hooks";
import LoadingIcon from "../misc/loading_icon";
import type SimpleCategory from "~/utils/simple_category";
import SimpleTodo from "~/utils/simple_todo";



const disabled_color = "rgb(209,213,219)"
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
    const [
        confirmDelete,
        { open: openConfirmDelete, close: closeConfirmDelete },
    ] = useDisclosure();

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
        onSuccess: (data) => {
            setFade(true);
            setTimeout(() => {
                onEdit({...todo, done: true});
            }, 100);
        }

    })
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
                onEdit({...todo, done: false});
            }, 100);
        }
    })

    return (
        <div key={todo.id} className={`flex flex-col fadeIn ${fade ? "fadeOut" : ""}`}>
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

            <button
                className={`todo-header w-full rounded-t-md border ${todoActive ? "rounded-b-none" : "rounded-b-md"
                    }`}
                onClick={() => setTodoActive((old) => !old)}
                style={{
                    borderColor: todo.category?.color
                        ? todo.category.color
                        : disabled_color,
                    backgroundColor: todoActive
                        ? todo.category?.color
                            ? todo.category.color
                            : disabled_color
                        : "",
                }}
            >
                <span className="mix-blend-difference font-medium bg-">
                    {todo.title}
                </span>
            </button>
            <div
                className="todo-body overflow-hidden transition-all ease-in-out"
                style={{
                    borderColor: todo.category?.color
                        ? todo.category.color
                        : disabled_color,
                    maxHeight: todoActive ? "1000px" : "0px",
                }}
            >
                {todo.description || todo.dueDate ? (
                    <div
                        className="border-x border-t p-2"
                        style={{
                            borderColor: todo.category?.color
                                ? todo.category.color
                                : disabled_color,
                        }}
                    >
                        {todo.dueDate ? (
                            <span>
                                {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                        ) : null}
                        <p className="thin-scroll max-h-[18rem] overflow-y-auto ">
                            {todo.description}
                        </p>
                    </div>
                ) : null}
                <div
                    className="flex w-full items-center justify-center gap-8 rounded-b-md border border-x p-2"
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
                    {todo.done ? null : <button className="flex items-center gap-2 text-yellow-400">
                        <Edit /> Edit
                    </button>}
                    {todo.done ? (
                        <button className="flex items-center gap-2" onClick={() => {
                            if(!agent || !agentType || !todo.id) return;

                            undoMutation.mutate({
                                todoId: todo.id,
                                agentId: agent.id,
                                agentType: agentType
                            })
                        }}>
                            {undoMutation.isLoading ? <LoadingIcon color="white"/> : <Undo />} Undo
                        </button>
                    ) : (
                        <button className="flex items-center gap-2 text-green-400 " 
                        disabled={doMutation.isLoading}
                        onClick={() => {
                            if (!agent || !agentType || !todo.id) return;
                            doMutation.mutate({
                                agentId: agent.id,
                                agentType: agentType,
                                todoId: todo.id
                            })
                        }
                        }>
                            {doMutation.isLoading ? <LoadingIcon color="rgb(74,222,128)"/> : <Check />} Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
