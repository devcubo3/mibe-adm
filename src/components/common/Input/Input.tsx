'use client';

import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  disabled = false,
  className,
}) => {
  return (
    <div className={`${styles.inputContainer} ${className || ''}`}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <input
        type={type}
        className={`${styles.inputField} ${error ? styles.error : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {error && <span className={styles.inputErrorText}>{error}</span>}
    </div>
  );
};

export default Input;
