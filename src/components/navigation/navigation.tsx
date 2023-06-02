import React from "react";
import HomeIcon from "../icons/home";
import TagIcon from "../icons/tag";
import Check from "../icons/check";




const NavButton = ({icon, title, onClick}: {
    title: string,
    icon: React.ReactNode,
    onClick: () => void
}) => {
    
    return (
        <button onClick={onClick} className="flex flex-col items-center w-20 ">
            {icon}
            <div className="text-xs">{title}</div>
        </button>
    )

}


export default function Navigation() {
    return (
        <>
            <div className="h-16 w-full "></div>
            <div
                className={`
                fixed bottom-0 left-0 h-16 w-full
                gap-4
                bg-[var(--primary-color)] flex justify-center items-center
                border-t border-[var(--tertiary-color)]
                `}
            >

                <NavButton title="Categories" icon={<TagIcon/>} onClick={() => {alert("cat")}} />
                <NavButton title="Done" icon={<Check/>} onClick={() => {alert("done")}} />
                <NavButton title="Home" icon={<HomeIcon />} onClick={() => {alert("home")}} />
            </div>
        </>
    );
}
