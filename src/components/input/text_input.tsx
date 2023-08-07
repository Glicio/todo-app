import React from 'react';
import FormItem from './form_item';


export default function TextInput({
    value,
    onChange,
    label,
    placeholder,
    required,
    }: {
        value: string;
        onChange: (value: string) => void;
        label: string;
        placeholder: string;
        required?: boolean;
    }) {
    return (
        <FormItem label={label}>
            <input
                type="text"
                value={value}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="primary-text-input"
            />
        </FormItem>
    );
}
