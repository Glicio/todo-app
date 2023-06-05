import React from "react";
import ModalContainer from "../containers/modal_container";
import DefaultForm from "./default_form";
import FormItem from "../input/form_item";
import SelectColor from "../input/select_color";
import FormActions from "../input/form_actions";
import { userContext } from "~/contexts/UserProvider";
import { api } from "~/utils/api";
import type { Category, User } from "@prisma/client";
import { notifications } from "@mantine/notifications";
import ErrorIcon from "../icons/erro_icon";
import { useDisclosure } from "@mantine/hooks";

interface CategoryForm {
    id?: string;
    name: string | null;
    description: string | null;
    color: string | null;
}

export default function AddCategory({
    opened,
    onClose,
    onAdd,
    onEdit,
    categoryToEdit,
}: {
    opened: boolean;
    onClose: () => void;
    onAdd?: (category: Category & { createdBy: User }) => void;
    onEdit?: (
        category: Category & { createdBy: User; updatedBy: User }
    ) => void;
    categoryToEdit?: Category & { createdBy: User };
}) {
    const initialCategory = {
        id: "",
        name: "",
        description: "",
        color: "",
    };
    const [category, setCategory] = React.useState<CategoryForm>(
        categoryToEdit ? categoryToEdit : initialCategory
    );
    const { agent, agentType } = React.useContext(userContext);

    const [colorError, { open: openColorError, close: closeColorError }] =
        useDisclosure();

    const addCategory = api.category.createCategory.useMutation({
        onSuccess: (data) => {
            onClose();
            if (onAdd) {
                onAdd(data);
            }
        },
        onError: (error) => {
            console.log(error);
            if (error.data?.zodError) {
                notifications.show({
                    title: "Error",
                    message: "Name is too short/long",
                    color: "red",
                    autoClose: 2000,
                    icon: <ErrorIcon />,
                });
                return;
            }
            notifications.show({
                title: "Error",
                message: "Error while adding category",
                color: "red",
                autoClose: 2000,
                icon: <ErrorIcon />,
            });
        },
    });

    const editCategory = api.category.updateCategory.useMutation({
        onSuccess: (data) => {
            onClose();
            if (onEdit) {
                onEdit(data);
            }
        },
        onError: (error) => {
            console.log(error);
            if (error.data?.zodError) {
                notifications.show({
                    title: "Error",
                    message: "Name is too short/long",
                    color: "red",
                    autoClose: 2000,
                    icon: <ErrorIcon />,
                });
                return;
            }
            notifications.show({
                title: "Error",
                message: "Error while editing category",
                color: "red",
                autoClose: 2000,
                icon: <ErrorIcon />,
            });
        },
    });

    return (
        <ModalContainer opened={opened} onClose={onClose}>
            <DefaultForm
                title={categoryToEdit ? "Edit Category" : "Create Category"}
                onSubmit={() => {
                    if (!agent || !agentType) {
                        return;
                    }
                    if (!category.color) {
                        openColorError();
                        return;
                    }
                    if (categoryToEdit) {
                        return editCategory.mutate({
                            agentId: agent.id,
                            agentType: agentType,
                            categoryId: categoryToEdit.id,
                            name: category.name || "",
                            description: category.description || "",
                            color: category.color,
                        });
                    }

                    addCategory.mutate({
                        agentId: agent.id,
                        agentType: agentType,
                        name: category.name || "",
                        description: category.description || "",
                        color: category.color,
                    });
                }}
            >
                <div className="flex flex-grow flex-col justify-center gap-2">
                    <FormItem label="Category name">
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            placeholder="Category name"
                            value={category.name || ""}
                            onChange={(e) =>
                                setCategory((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            className="primary-text-input"
                        />
                    </FormItem>

                    <FormItem label="Description">
                        <input
                            type="text"
                            name="description"
                            id="description"
                            placeholder="Description"
                            value={category.description || ""}
                            onChange={(e) => {
                                setCategory((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }));
                            }}
                            className="primary-text-input"
                        />
                    </FormItem>
                    <div>
                        {colorError && (
                            <div className="text-xs text-red-500">
                                Please select a color
                            </div>
                        )}
                        <SelectColor
                            color={category.color}
                            setColor={(value) => {
                                if (colorError) {
                                    closeColorError();
                                }
                                setCategory((prev) => ({
                                    ...prev,
                                    color: value,
                                }));
                            }}
                        />
                    </div>
                    <FormActions
                        onCancel={onClose}
                        loading={
                            addCategory.isLoading || editCategory.isLoading
                        }
                    />
                </div>
            </DefaultForm>
        </ModalContainer>
    );
}
