import React from "react";
import ModalContainer from "../containers/modal_container";
import DefaultForm from "./default_form";
import FormItem from "../input/form_item";
import SelectColor from "../input/select_color";
import FormActions from "../input/form_actions";
import { userContext } from "~/contexts/UserProvider";
import { api } from "~/utils/api";
import type { Category } from "@prisma/client";
import { notifications } from "@mantine/notifications";
import ErrorIcon from "../icons/erro_icon";

export default function AddCategory({
    opened,
    onClose,
    onAdd
}: {
    opened: boolean;
    onClose: () => void;
    onAdd: (category: Category) => void;
}) {
    const [category, setCategory] = React.useState({
        name: "",
        description: "",
        color: "",
    });
    
    const {agent, agentType} = React.useContext(userContext);
    
    const addCategory = api.category.createCategory.useMutation({
        onSuccess: (data) => {
            if (data) {
                onClose();
                onAdd(data);
            }
        },
        onError: (error) => {
            console.log(error);
            notifications.show({
                title: "Error",
                message: "Error while adding category",
                color: "red",
                autoClose: 2000,
                icon: <ErrorIcon/>
            });
        }
    });

    return <ModalContainer opened={opened} onClose={onClose}>
    <DefaultForm title="Add Category" onSubmit={() => {

        if(!agent || !agentType) {
            return;
        }
        addCategory.mutate({
            agentId: agent.id,
            agentType: agentType,
            name: category.name,
            description: category.description,
            color: category.color
        });
    }}>
                    <div className="flex flex-col gap-2">
                        <FormItem label="Category name">
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Category name"
                                value={category.name}
                                onChange={(e) =>
                                    setCategory((prev) => ({ ...prev, name: e.target.value }))
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
                                value={category.description}
                                onChange={(e) =>
                                    setCategory((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="primary-text-input"
                            />
                        </FormItem>
                        <SelectColor  color={category.color} setColor={(value) => setCategory((prev) => ({...prev, color: value}))} />
                        <FormActions onCancel={onClose} />
                    </div>
       </DefaultForm>
    </ModalContainer>;
}
