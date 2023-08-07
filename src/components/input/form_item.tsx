import React from 'react';



export default function FormItem({ label, children }: { label?: string, children: React.ReactNode }) {
    return (
        <div className="flex flex-col ">
            {label ? <label className="text-sm font-bold ">{label}</label> : null}
            {children}
        </div>
    )
}
