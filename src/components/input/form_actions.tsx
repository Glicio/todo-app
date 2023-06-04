import React from "react";
import LoadingIcon from "../misc/loading_icon";

/**
 * Doesn't need a onAccept prop because the accept button is a submit button
 * */
export default function FormActions({
    cancelText,
    acceptText,
    onCancel,
    loading,
}: {
    cancelText?: string;
    acceptText?: string;
    onCancel: () => void;
    loading?: boolean;
}) {
    return (
        <div className="flex w-full gap-2 justify-center">
            <button
                type="button"
                className="secondary-button w-1/2"
                onClick={onCancel}
            >
                {cancelText || "Cancel"}
            </button>
            <button
                type="submit"
                className="primary-button w-1/2"
                disabled={!!loading}
            >
                <div className="flex justify-center">
                    {!!loading ? <LoadingIcon /> : acceptText || "Save"}
                </div>
            </button>
        </div>
    );
}
