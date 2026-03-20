'use client';

import React from 'react';
import Image from 'next/image';
import { IoStorefrontOutline, IoTimeOutline, IoCheckmarkCircleOutline, IoAlertCircleOutline } from 'react-icons/io5';
import { formatCurrency } from '@/utils';
import styles from './InvoiceCard.module.css';

interface InvoiceCardProps {
    companyName: string;
    companyLogo: string | null;
    pendingCount: number;
    paidCount: number;
    overdueCount: number;
    totalPending: number;
    totalPaid: number;
    onClick?: () => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
    companyName,
    companyLogo,
    pendingCount,
    paidCount,
    overdueCount,
    totalPending,
    totalPaid,
    onClick,
}) => {
    const hasOverdue = overdueCount > 0;

    return (
        <div className={`${styles.card} ${hasOverdue ? styles.cardOverdue : ''}`} onClick={onClick}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    {companyLogo ? (
                        <Image src={companyLogo} alt={companyName} fill style={{ objectFit: 'cover' }} />
                    ) : (
                        <div className={styles.logoPlaceholder}>
                            <IoStorefrontOutline size={24} color="#999999" />
                        </div>
                    )}
                </div>
                <h3 className={styles.name}>{companyName}</h3>
            </div>

            <div className={styles.body}>
                <div className={styles.row}>
                    <div className={styles.rowLeft}>
                        <IoTimeOutline size={16} className={styles.iconPending} />
                        <span className={styles.rowLabel}>{pendingCount} pendente{pendingCount !== 1 ? 's' : ''}</span>
                    </div>
                    <span className={styles.rowValue}>{formatCurrency(totalPending)}</span>
                </div>

                <div className={styles.row}>
                    <div className={styles.rowLeft}>
                        <IoCheckmarkCircleOutline size={16} className={styles.iconPaid} />
                        <span className={styles.rowLabel}>{paidCount} paga{paidCount !== 1 ? 's' : ''}</span>
                    </div>
                    <span className={styles.rowValue}>{formatCurrency(totalPaid)}</span>
                </div>

                {hasOverdue && (
                    <div className={styles.row}>
                        <div className={styles.rowLeft}>
                            <IoAlertCircleOutline size={16} className={styles.iconOverdue} />
                            <span className={styles.rowLabelOverdue}>{overdueCount} vencida{overdueCount !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceCard;
