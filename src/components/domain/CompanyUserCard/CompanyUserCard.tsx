'use client';

import React from 'react';
import { IoPersonOutline, IoCreateOutline, IoToggle, IoTrashOutline } from 'react-icons/io5';
import { CompanyUser } from '@/types';
import { formatISOToDate } from '@/utils';
import styles from './CompanyUserCard.module.css';

interface CompanyUserCardProps {
    user: CompanyUser;
    onEdit?: (user: CompanyUser) => void;
    onToggleActive?: (user: CompanyUser) => void;
    onDelete?: (user: CompanyUser) => void;
}

const CompanyUserCard: React.FC<CompanyUserCardProps> = ({
    user,
    onEdit,
    onToggleActive,
    onDelete,
}) => {
    return (
        <div className={`${styles.card} ${!user.isActive ? styles.inactive : ''}`}>
            <div className={styles.avatar}>
                <IoPersonOutline size={24} />
            </div>

            <div className={styles.info}>
                <h4 className={styles.name}>{user.name}</h4>
                <p className={styles.email}>{user.email}</p>
                <p className={styles.date}>Criado em: {formatISOToDate(user.createdAt)}</p>
            </div>

            <div className={styles.status}>
                <span className={`${styles.badge} ${user.isActive ? styles.active : styles.inactiveBadge}`}>
                    {user.isActive ? 'Ativo' : 'Inativo'}
                </span>
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.actionButton}
                    onClick={() => onEdit?.(user)}
                    title="Editar"
                >
                    <IoCreateOutline size={18} />
                </button>
                <button
                    className={`${styles.actionButton} ${user.isActive ? styles.deactivate : styles.activate}`}
                    onClick={() => onToggleActive?.(user)}
                    title={user.isActive ? 'Desativar' : 'Ativar'}
                >
                    <IoToggle size={18} />
                </button>
                <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => onDelete?.(user)}
                    title="Excluir"
                >
                    <IoTrashOutline size={18} />
                </button>
            </div>
        </div>
    );
};

export default CompanyUserCard;
