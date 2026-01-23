'use client';

import React, { useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${className || ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHandle} />

        {title && (
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <IoCloseOutline size={24} />
            </button>
          </div>
        )}

        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
