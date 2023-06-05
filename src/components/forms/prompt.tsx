import React from "react";
import ModalContainer from "../containers/modal_container";
import LoadingIcon from "../misc/loading_icon";

export default function Prompt({
    opened,
    onClose,
    loading,
    title,
    message,
    onConfirm,
    children,
}: {
    opened: boolean;
    onClose: () => void;
    loading?: boolean;
    title?: string;
    message?: string;
    onConfirm?: () => void;
    children?: React.ReactNode;
}) {
    return (
        <ModalContainer opened={opened} onClose={onClose}>
            <div className="m-auto flex h-fit w-fit flex-col items-center justify-center gap-4 rounded-md border bg-[var(--primary-color)] p-2">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p>{message}</p>
                {children ? children : null}
                <div className="flex w-full justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="secondary-button w-1/2"
                    >
                        Cancel
                    </button>
                    <button
                        className="primary-button w-1/2"
                        onClick={onConfirm}
                    >
                        {loading ? <LoadingIcon /> : "Confirm"}
                    </button>
                </div>
            </div>
        </ModalContainer>
    );
}
