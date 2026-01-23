'use client';

import React from 'react';
import { IoStar, IoStarOutline } from 'react-icons/io5';
import styles from './StarRating.module.css';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 16, interactive = false, onRate }) => {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (star: number) => {
    if (interactive && onRate) {
      onRate(star);
    }
  };

  return (
    <div className={styles.starRating}>
      {stars.map((star) => (
        <span key={star} onClick={() => handleClick(star)} className={interactive ? styles.interactive : ''}>
          {star <= rating ? <IoStar size={size} color="#FFB800" /> : <IoStarOutline size={size} color="#FFB800" />}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
