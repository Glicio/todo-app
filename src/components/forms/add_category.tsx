import React from "react";
import ModalContainer from "../containers/modal_container";
import DefaultForm from "./default_form";
import FormItem from "../input/form_item";
import { ColorPicker } from "@mantine/core";
import { validColors } from "~/utils/valid_colors";
import SelectColor from "../input/select_color";
import FormActions from "../input/form_actions";

export default function AddCategory({
    opened,
    onClose,
}: {
    opened: boolean;
    onClose: () => void;
}) {
    const [category, setCategory] = React.useState({
        name: "",
        description: "",
        color: "",
    });
    

    return <ModalContainer opened={opened} onClose={onClose}>
    <DefaultForm title="Add Category" onSubmit={() => {alert("new")}}>
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
