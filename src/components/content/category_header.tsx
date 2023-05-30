import React from "react";

/**
 * the todo section header component.
 * */
export default function CategoryHeader({
    category,
}: {
    category: {
        color: string;
        name: string;
    };
}) {
    return (
        <p className="flex gap-2 border-b text-2xl font-bold">
            <div
                className="h-8 w-8 border border-b-0"
                style={{
                    backgroundColor: category.color || "",
                }}
            ></div>
            {category.name}
        </p>
    );
}
