'use client';

import React from 'react';
import styles from './SelectInput.module.css';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectInputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    error?: string;
    disabled?: boolean;
    className?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
    label,
    placeholder = 'Selecione...',
    value,
    onChange,
    options,
    error,
    disabled = false,
    className,
}) => {
    return (
        <div className={`${styles.selectContainer} ${className || ''}`}>
            {label && <label className={styles.selectLabel}>{label}</label>}
            <select
                className={`${styles.selectField} ${error ? styles.error : ''} ${!value ? styles.placeholder : ''}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className={styles.selectErrorText}>{error}</span>}
        </div>
    );
};

export default SelectInput;
