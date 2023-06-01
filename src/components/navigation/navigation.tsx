import React from "react";

export default function Navigation() {
    return (
        <>
            <div className="h-16 w-full "></div>
            <div
                className={`
                fixed bottom-0 left-0 h-16 w-full
                bg-[var(--primary-color)] flex justify-center items-center
                border-t border-[var(--tertiary-color)]
                `}
            >
                nav
            </div>
        </>
    );
}
