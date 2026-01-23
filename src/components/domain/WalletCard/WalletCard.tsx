'use client';

import React from 'react';
import Image from 'next/image';
import { formatCurrency, getDaysUntilExpiration } from '@/utils';
import styles from './WalletCard.module.css';

interface WalletCardProps {
  storeName: string;
  storeLogo: string;
  balance: number;
  expiresAt: string;
  onClick?: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ storeName, storeLogo, balance, expiresAt, onClick }) => {
  const daysUntilExpiration = getDaysUntilExpiration(expiresAt);

  return (
    <div className={styles.walletCard} onClick={onClick}>
      <div className={styles.walletCardHeader}>
        <div className={styles.walletLogo}>
          <Image src={storeLogo || '/placeholder-store.png'} alt={storeName} fill style={{ objectFit: 'cover' }} />
        </div>
        <div>
          <h3 className={styles.walletStoreName}>{storeName}</h3>
          <div className={styles.walletExpiryBadge}>
            <span className={styles.walletExpiryText}>Expira em {daysUntilExpiration} dias</span>
          </div>
        </div>
      </div>
      <div className={styles.walletCardFooter}>
        <span className={styles.walletBalance}>{formatCurrency(balance)}</span>
      </div>
    </div>
  );
};

export default WalletCard;
