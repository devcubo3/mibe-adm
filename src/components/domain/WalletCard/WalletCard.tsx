'use client';

import React from 'react';
import Image from 'next/image';
import { IoStorefrontOutline } from 'react-icons/io5';
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
          {storeLogo ? (
            <Image src={storeLogo} alt={storeName} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
              <IoStorefrontOutline size={24} color="#999999" />
            </div>
          )}
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
