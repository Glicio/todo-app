import type { Category } from "@prisma/client";
import React from "react";
import { api } from "~/utils/api";
import ActionButton from "../input/action_button";
import Trash from "../icons/trash";
import Edit from "../icons/edit";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import AddCategory from "../forms/add_category";
import { notifications } from "@mantine/notifications";
import ErrorIcon from "../icons/erro_icon";
import Prompt from "../forms/prompt";
import { userContext } from "~/contexts/UserProvider";
import type SimpleUser from "~/utils/simple_user";
import { TodoContext } from "~/contexts/TodoContext";
import ChevronUpDown from "../icons/chevron_up_down";

type CategoryWithUsers = Category & {
    createdBy: SimpleUser;
    updatedBy: SimpleUser | null;
};
export default function CategoryComponent({
    category,
    onEdit,
    onDelete,
}: {
    category: CategoryWithUsers;
    onEdit: (category: CategoryWithUsers) => void;
    onDelete: (id: string) => void;
}) {
    const [opened, setOpened] = React.useState(false);
    const [interacted, setInteracted] = React.useState(false);
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure();
    const [deleteOpened, { open: openDelete, close: closeDelete }] =
        useDisclosure();
    const [deleted, setDeleted] = React.useState(false);
    const [deleteTodos, setDeleteTodos] = React.useState(false);
    const { agent, agentType } = React.useContext(userContext);
    const { setCategories, setTodos } = React.useContext(TodoContext);

    const mobileQuery = useMediaQuery("(max-width: 768px)");
    const [isMobile, setIsMobile] = React.useState(true);
    const deleteMutation = api.category.deleteCategory.useMutation({
        onSuccess: () => {
            setDeleted(true);
            setTimeout(() => {
                onDelete(category.id);
                setCategories((prev) =>
                    prev.filter((c) => c.id !== category.id)
                );
                if (deleteTodos) {
                    setTodos((prev) =>
                        prev.filter((t) => t.categoryId !== category.id)
                    );
                } else {
                    setTodos((prev) =>
                        prev.map((t) => {
                            if (t.categoryId === category.id) {
                                return { ...t, categoryId: null, category: null };
                            }
                            return t;
                        })
                    );
                }
            }, 500);
        },
        onError: (error) => {
            console.log(error);
            if (error.data?.zodError) {
                notifications.show({
                    title: "Error",
                    message: "Name is too long/short",
                    color: "red",
                    icon: <ErrorIcon />,
                });
                return;
            }
            notifications.show({
                title: "Error",
                message: "Error while deleting category",
                color: "red",
                icon: <ErrorIcon />,
            });
        },
    });

    React.useEffect(() => {
        if(mobileQuery !== undefined) {
        setIsMobile(mobileQuery);
        }
    }, [mobileQuery]);

    return (
        <div
            className={`rounded-md border flex flex-col ${deleted ? "fadeOut" : ""}`}
            style={{ borderColor: category.color || "" }}
        >
            {editOpened && (
                <AddCategory
                    onClose={closeEdit}
                    categoryToEdit={category}
                    onEdit={onEdit}
                    opened
                />
            )}
            <Prompt
                loading={deleteMutation.isLoading}
                title="Delete category"
                message="Are you sure you want to delete this category?"
                opened={deleteOpened}
                onClose={closeDelete}
                onConfirm={() => {
                    if (!agent || !agentType) return;
                    deleteMutation.mutate({
                        categoryId: category.id,
                        agentId: agent.id,
                        agentType: agentType,
                        deleteTodos: deleteTodos,
                    });
                }}
            >
                <div className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="delete"
                        id="delete"
                        checked={deleteTodos}
                        onChange={(e) => {
                            setDeleteTodos(e.target.checked);
                        }}
                    />
                    <label htmlFor="delete">
                        Delete the todos of this category
                    </label>
                </div>
            </Prompt>
            <button
                className="w-full p-2 text-left flex justify-between items-center"
                onClick={() => {
                    if (!interacted) setInteracted(true);
                    setOpened((old) => !old);
                }}
            >
                <span className="font-bold h-fit">
                    {category.name}
                </span>
                {isMobile ? <ChevronUpDown/> : null}
            </button>
            <div
                className={`${isMobile ? (
                    interacted
                        ? opened
                            ? "open"
                            : "close"
                        : "max-h-0 overflow-hidden" ) : ""}
                flex flex-col h-full `}
            >
                <div className="mx-2 border-b"></div>
                <div className="p-2 ">
                    <div className="flex flex-col pb-2">
                        <div className="flex gap-1 text-xs">
                            <span className="">Created by</span>
                            <span className="font-bold">
                                {category.createdBy.name}
                            </span>
                            <span className="">at</span>
                            <span className="font-bold">
                                {category.createdAt.toLocaleString()}
                            </span>
                        </div>
                        {category.updatedBy && category.updatedAt && (
                            <div className="flex gap-1 text-xs">
                                <span className="">Edited by</span>
                                <span className="font-bold">
                                    {category.updatedBy.name}
                                </span>
                                <span className="">at</span>
                                <span className="font-bold">
                                    {category.updatedAt.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                    {category.description ? (
                        <div className="flex flex-col overflow-hidden ">
                            <span className="font-bold">Description:</span>
                            <p className="text-ellipsis">
                                {category.description}
                            </p>
                        </div>
                    ) : null}
                </div>
                <div
                    className="flex justify-evenly border-t py-2 mt-auto"
                    style={{ borderColor: category.color || "" }}
                >
                    <ActionButton
                        icon={<Trash />}
                        onClick={() => {
                            openDelete();
                        }}
                        color="var(--red-400)"
                        text="Delete"
                        loading={false}
                    />
                    <ActionButton
                        icon={<Edit />}
                        onClick={() => {
                            openEdit();
                        }}
                        color="var(--yellow-400)"
                        text="Edit"
                        loading={false}
                    />
                </div>
            </div>
        </div>
    );
}
