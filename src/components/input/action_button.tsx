import React from "react";
import LoadingIcon from "../misc/loading_icon";

export default function ActionButton({
    onClick,
    icon,
    text,
    color,
    disabled,
    loading,
}: {
    onClick: () => void;
    icon: React.ReactNode;
    text: string;
    color: string;
    disabled?: boolean;
    loading?: boolean;
}) {
    return (
        <button
            className="flex items-center gap-1"
            style={{
                color: color,
            }}
            disabled={loading || disabled}
            onClick={onClick}
        >
            {loading ? <LoadingIcon color={color} /> : icon} {text}
        </button>
    );
}
