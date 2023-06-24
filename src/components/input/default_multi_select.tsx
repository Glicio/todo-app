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
        disabled,
        clearable
    }: {
        data: { value: string, label: string }[],
        label: string,
        value: string[],
        onChange: (value: string[]) => void,
        disabled?: boolean,
        required?: boolean,
        placeholder?: string,
        clearable?: boolean,
    }
) {
    return (
        <MultiSelect
            classNames={{
                input: "",
            }}
            disabled={disabled}
            clearable={clearable}
            required={required}
            label={label}
            placeholder={placeholder}
            searchable
            data={data}
            value={value}
            onChange={onChange}
        />
    )
}
