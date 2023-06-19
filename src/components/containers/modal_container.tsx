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
    color?: string;
}) {
    return (
        <Modal opened={opened} onClose={onClose}
            title={title}
            keepMounted={keepMounted}
            styles={{
                content: {
                    borderColor: color || "var(--secondary-color)",
                }
            }}
            classNames={{
                overlay: "backdrop-blur",
                header: "bg-[var(--primary-color)] ",
                body: "bg-[var(--primary-color)] ",
                content: "bg-[var(--primary-color)] w-fit border rounded-b-md m-auto"
            }}>
        
            {children}
        </Modal>
    );
}
