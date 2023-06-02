import React from "react";


export default function ModalContainer({
    opened,
    onClose,
    children,
}: {
    opened: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if(!opened) {
        return null;
    }
    return (
        <div className="modal z-[999] fixed left-0 top-0 flex w-screen h-screen backdrop-blur overflow-y-auto scroll-thin" onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("modal")) {
               onClose();
            }
        }}>
            {children}
        </div>
    )
}
