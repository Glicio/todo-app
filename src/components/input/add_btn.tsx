import React from 'react';
import AddIcon from '../icons/add';


export default function AddBtn({onClick}: {onClick: () => void})  {
    return (
                <button
                    onClick={onClick}
                    className="fixed bottom-20 right-4 z-10 h-12 w-12 rounded-full bg-[var(--secondary-color)] text-gray-300"
                >
                    <AddIcon />
                </button>
                )
            }
