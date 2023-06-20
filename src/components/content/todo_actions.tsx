import React from 'react'
import Trash from '../icons/trash';
import Edit from '../icons/edit';
import LoadingIcon from '../misc/loading_icon';
import Undo from '../icons/undo';
import Check from '../icons/check';


export default function TodoActions({
    onDone,
    onDelete,
    onEdit,
    onUndo,
    done,
    borderColor,
    deleteLoading,
    undoLoading,
    doLoading,
}: {
    onDone?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
    onUndo?: () => void;
    done?: boolean;
    borderColor?: string;
    deleteLoading?: boolean;
    undoLoading?: boolean;
    doLoading?: boolean;
}) {

    return (
        <div
            className="flex w-full items-center justify-evenly border-t py-2 flex-shrink-0"
            style={{
                borderColor: borderColor || "var(--disabled-color)",
            }}
        >
            <button
                onClick={onDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 text-red-400"
            >
                <Trash /> Delete
            </button>
            {done ? null : (
                <button className="flex items-center gap-2 text-yellow-400" onClick={onEdit}>
                    <Edit /> Edit
                </button>
            )}
            {done ? (
                <button
                    className="flex items-center gap-2"
                    onClick={onUndo}
                >
                    {undoLoading ? (
                        <LoadingIcon color="white" />
                    ) : (
                        <Undo />
                    )}{" "}
                    Undo
                </button>
            ) : (
                <button
                    className="flex items-center gap-2 text-green-400 "
                    disabled={doLoading}
                    onClick={onDone}
                >
                    {doLoading ? (
                        <LoadingIcon color="rgb(74,222,128)" />
                    ) : (
                        <Check />
                    )}{" "}
                    Done
                </button>
            )}
        </div>
    )
}
