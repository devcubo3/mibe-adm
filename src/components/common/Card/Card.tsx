import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'muted';
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, variant = 'default', className, onClick }) => {
  return (
    <div
      className={`${styles.card} ${variant === 'muted' ? styles.cardMuted : ''} ${onClick ? styles.clickable : ''} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
