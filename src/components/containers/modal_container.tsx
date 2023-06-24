import { Modal } from "@mantine/core";
import React from "react";

export default function ModalContainer({
    opened,
    onClose,
    children,
    title,
    keepMounted,
    color,
}: {
    opened: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    keepMounted?: boolean;
    color?: string | string[];
}) {

    const getBgColor = () => {
        if (typeof color === "string") {
            return {
                backgroundColor: color,
            }
        } else if (color && color?.length > 1) {
            return {
                background: `linear-gradient(${color?.join(", ")})`,
            }
        } else if(color && color[0]){
            return {
                backgroundColor: color[0],
            }
        } else {
            return {
                backgroundColor: "var(--tertiary-color)",
            }
        }
    }
    return (
        <Modal opened={opened} onClose={onClose}
            title={title}
            keepMounted={keepMounted}
            styles={{
                content: {
                    ...getBgColor(),
                    padding: "1px",
                }
            }}
            classNames={{
                overlay: "backdrop-blur",
                header: "bg-[var(--primary-color)] rounded-t-md",
                body: "bg-[var(--primary-color)] rounded-b-md ",
                content: "w-fit rounded-b-md m-auto ",
            }}>

            <div className="max-h-[75vh] overflow-y-auto">
                {children}
            </div>
        </Modal>
    );
}
