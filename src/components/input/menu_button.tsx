import React from 'react';



export default function MenuButton({icon, title, onClick}: 
{
    icon: React.ReactNode;
    title: string;
    onClick?: () => void;
}) {
    return (

        <button className="flex items-center gap-1" onClick={onClick}>
            <div className="h-8 w-8 rounded-full flex items-center justify-center">
                {icon}
            </div>{" "}
            {title}
        </button>
    )
}

