import React from "react";

export default function CategoryLabel({
    category,
    onClick,
    active,
}: {
    onClick?: (categoryId: string) => void;
    category: { name: string; color: string | null, id: string };
    active?: boolean;
}) {
    return (
        <button
            onClick={() => {
                if (onClick) onClick(category.id);
            }}
            className={`flex items-center gap-2 rounded-md pl-1 pr-2 whitespace-nowrap `}

            style={{
                border: `1px solid ${category.color ? category.color  : ""}`,
                backgroundColor: active ? category.color || "" : "",
            }}
        >
            <div
                className="h-2 w-2 rounded-full border border-[var(--tertiary-color)]"
                style={{ backgroundColor: category.color || "" }}
            ></div>
            <span className="mix-blend-difference">{category.name}</span>
        </button>
    );
}
