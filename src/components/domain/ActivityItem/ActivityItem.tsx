'use client';

import React from 'react';
import Image from 'next/image';
import { formatCurrency, formatRelativeTime } from '@/utils';
import { Activity } from '@/types';
import styles from './ActivityItem.module.css';

interface ActivityItemProps {
  activity: Activity;
  onClick?: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onClick }) => {
  const isReceived = activity.type === 'received';

  return (
    <div className={styles.activityItem} onClick={onClick}>
      <div className={styles.activityLogo}>
        <Image
          src={activity.storeLogo || '/placeholder-store.png'}
          alt={activity.storeName}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className={styles.activityContent}>
        <p className={styles.activityStoreName}>{activity.storeName}</p>
        <p className={styles.activityDescription}>{activity.description}</p>
        <p className={styles.activityDate}>{formatRelativeTime(activity.date)}</p>
      </div>
      <div className={`${styles.activityAmount} ${isReceived ? styles.received : styles.spent}`}>
        {isReceived ? '+' : '-'}
        {formatCurrency(activity.amount)}
      </div>
    </div>
  );
};

export default ActivityItem;
