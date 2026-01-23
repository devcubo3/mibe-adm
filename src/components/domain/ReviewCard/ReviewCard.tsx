'use client';

import React from 'react';
import { Review } from '@/types';
import { formatRelativeTime, getInitials } from '@/utils';
import StarRating from '../StarRating';
import styles from './ReviewCard.module.css';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewAvatar}>
          <span className={styles.reviewAvatarText}>{getInitials(review.userName)}</span>
        </div>
        <div className={styles.reviewUserInfo}>
          <p className={styles.reviewUserName}>{review.userName}</p>
          <p className={styles.reviewDate}>{formatRelativeTime(review.createdAt)}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>

      <p className={styles.reviewComment}>{review.comment}</p>

      {review.reply && (
        <div className={styles.reviewReply}>
          <p className={styles.reviewReplyLabel}>Resposta do estabelecimento:</p>
          <p className={styles.reviewReplyText}>{review.reply.text}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
