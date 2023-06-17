import { MultiSelect } from '@mantine/core'
import React from 'react'



export default function DefaultMultiSelect(
    {
        data,
        label,
        value,
        onChange,
        required,
        placeholder,
        clearable
    }: {
        data: { value: string, label: string }[],
        label: string,
        value: string[],
        onChange: (value: string[]) => void,
        required?: boolean,
        placeholder?: string,
        clearable?: boolean,
    }
) {
    return (
    <MultiSelect
            styles={() => ({
                item: {
                    '&[data-hovered]': {
                        backgroundColor: 'lightgray',
                        color: 'black',
                    },
                },
                rightSection: {
                    color: 'black',
                    "svg": {
                        stroke: "gray",
                    }
                },
                
            })}
            classNames={{
                input: "bg-white text-black rounded-md",
                dropdown: "bg-white ",
                item: "text-black",
            }}
        clearable={clearable}
        required={required}
        label={label}
        placeholder={placeholder}
        data={data}
        value={value}
        onChange={onChange}
    />
    )
}
