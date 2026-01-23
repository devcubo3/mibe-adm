'use client';

import React from 'react';
import Image from 'next/image';
import { IoStarOutline } from 'react-icons/io5';
import styles from './StoreCard.module.css';

interface StoreCardProps {
  name: string;
  category: string;
  image: string;
  rating?: number;
  distance?: string;
  onClick?: () => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ name, category, image, rating, distance, onClick }) => {
  return (
    <div className={styles.storeCard} onClick={onClick}>
      <div className={styles.storeCardImage}>
        <Image src={image || '/placeholder-store.png'} alt={name} fill style={{ objectFit: 'cover' }} />
      </div>
      <div className={styles.storeCardContent}>
        <h3 className={styles.storeCardName}>{name}</h3>
        <p className={styles.storeCardCategory}>{category}</p>
        <div className={styles.storeCardFooter}>
          {rating !== undefined && (
            <div className={styles.rating}>
              <IoStarOutline color="#FFB800" size={16} />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
          {distance && <span className={styles.distance}>{distance}</span>}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
