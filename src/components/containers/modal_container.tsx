import { Modal } from "@mantine/core";
import React from "react";

export default function ModalContainer({
    opened,
    onClose,
    children,
    title,
}: {
    opened: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <Modal opened={opened} onClose={onClose} 
        title={title}
        classNames={{
             overlay: "backdrop-blur",
             header: "bg-[var(--primary-color)] border-t border-x border-[var(--secondary-color)] rounded-t-md",
             body: "bg-[var(--primary-color)] border-x border-b border-[var(--secondary-color)] rounded-b-md",
            content: "bg-[var(--primary-color)] w-fit"
        }}>
            {children}
        </Modal>
    );
}
