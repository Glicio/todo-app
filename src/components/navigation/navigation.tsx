import React from "react";
import HomeIcon from "../icons/home";
import TagIcon from "../icons/tag";
import Check from "../icons/check";
import { useRouter } from "next/router";

const NavButton = ({
    icon,
    title,
    onClick,
}: {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
}) => {
    return (
        <button onClick={onClick} className="flex w-20 flex-col items-center ">
            {icon}
            <div className="text-xs">{title}</div>
        </button>
    );
};

export default function Navigation() {
    const router = useRouter();

    return (
        <>
            <div className="h-16 w-full "></div>
            <div
                className={`
                fixed bottom-0 left-0 flex h-16
                w-full
                items-center justify-center gap-4 border-t
                border-[var(--tertiary-color)] bg-[var(--primary-color)]
                `}
            >
                <NavButton
                    title="Categories"
                    icon={<TagIcon />}
                    onClick={() => {
                        alert("cat");
                    }}
                />
                <NavButton
                    title="Done"
                    icon={<Check />}
                    onClick={() => {
                        void router.push("/done");
                    }}
                />
                <NavButton
                    title="Home"
                    icon={<HomeIcon />}
                    onClick={() => {
                        void router.push("/");
                    }}
                />
            </div>
        </>
    );
}
