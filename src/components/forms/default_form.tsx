import React from "react";
import SplitLine from "../misc/split_line";

export default function DefaultForm({
    children,
    onSubmit,
    title,
}: {
    children: React.ReactNode;
    onSubmit: () => void;
    title: string;
}) {
    return (
        <form
            action=""
            className={`
            flex flex-col w-screen h-screen 
            items-center justify-center bg-[var(--primary-color)] 
            md:rounded-md 
            md:p-4 
            md:shadow-md md:w-fit md:h-fit`}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <h1 className="text-lg font-bold">{title}</h1>
            <SplitLine />
            {children}
        </form>
    );
}
