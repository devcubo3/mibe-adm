import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children?: React.ReactNode;
  text?: string;
  variant?: 'default' | 'primary' | 'success' | 'error';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, text, variant = 'default', className }) => {
  const variantClass = {
    default: '',
    primary: styles.badgePrimary,
    success: styles.badgeSuccess,
    error: styles.badgeError,
  }[variant];

  return (
    <span className={`${styles.badge} ${variantClass} ${className || ''}`}>
      <span className={styles.badgeText}>{children || text}</span>
    </span>
  );
};

export default Badge;
