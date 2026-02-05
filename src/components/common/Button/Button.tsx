'use client';

import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className,
  style,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <button
      type={type}
      className={`
        ${styles.button}
        ${isPrimary ? styles.primaryButton : styles.secondaryButton}
        ${disabled || loading ? styles.disabledButton : ''}
        ${className || ''}
      `.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? <span className={styles.spinner}>Carregando...</span> : title}
    </button>
  );
};

export default Button;
