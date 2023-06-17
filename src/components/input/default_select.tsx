import { Select } from '@mantine/core'
import React from 'react'


export default function DefaultSelect({ data, label, required, placeholder, value, onChange, clearable}: {
    data: { value: string, label: string }[],
    label: string,
    value?: string,
    onChange?: (value: string) => void,
    required?: boolean,
    placeholder?: string,
    clearable?: boolean,
}) {
    return (
        <Select
            clearable={clearable}
            required={required}
            placeholder={placeholder}
            data={data}
            value={value}
            onChange={onChange}
            label={label}
            searchable
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
                input: "primary-text-input",
                dropdown: "bg-white ",
                item: "text-black",
            }}
        />
    )

}
