'use client';

import React, { useRef } from 'react';
import { IoCloudUploadOutline, IoPencil } from 'react-icons/io5';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    variant?: 'profile' | 'cover';
    error?: string;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    value,
    onChange,
    variant = 'profile',
    error,
    className,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={`${styles.uploadContainer} ${className || ''}`}>
            {label && <label className={styles.uploadLabel}>{label}</label>}
            <div className={`${styles.uploadWrapper} ${styles[variant]}`}>
                <div
                    className={`${styles.uploadArea} ${styles[variant]} ${error ? styles.error : ''}`}
                    onClick={handleClick}
                >
                    {value ? (
                        <img src={value} alt="Preview" className={styles.preview} />
                    ) : (
                        <div className={styles.placeholder}>
                            <IoCloudUploadOutline size={32} />
                            <span>Clique para enviar</span>
                        </div>
                    )}
                </div>
                {value && (
                    <button className={styles.editButton} onClick={handleClick}>
                        <IoPencil size={14} />
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.hiddenInput}
            />
            {error && <span className={styles.uploadErrorText}>{error}</span>}
        </div>
    );
};

export default ImageUpload;
