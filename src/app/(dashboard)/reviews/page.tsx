'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { ReviewCard } from '@/components/domain';
import { SearchInput } from '@/components/common';
import { Review } from '@/types';
import { reviewService } from '@/services/reviewService';
import { storeService } from '@/services/storeService';
import { IoStarOutline, IoStar, IoChatbubbleOutline, IoStorefrontOutline } from 'react-icons/io5';
import { useDebounce } from '@/hooks';
import styles from './reviews.module.css';

interface StoreMap {
    [key: string]: string;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [storeNames, setStoreNames] = useState<StoreMap>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch reviews and stores in parallel
            const [reviewsData, storesData] = await Promise.all([
                reviewService.getAll(),
                storeService.getAll(),
            ]);

            setReviews(reviewsData);

            // Create a map of store ID to store name for quick lookup
            const storeMap: StoreMap = {};
            storesData.forEach(store => {
                storeMap[store.id] = store.name;
            });
            setStoreNames(storeMap);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReviews = reviews.filter((review) => {
        const matchesSearch =
            review.userName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            review.comment.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesRating = filterRating === null || review.rating === filterRating;
        return matchesSearch && matchesRating;
    });

    // Calculate stats
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';
    const withReply = reviews.filter(r => r.reply || r.storeReply).length;

    // Get store name helper
    const getStoreName = (storeId: string) => {
        return storeNames[storeId] || 'Estabelecimento';
    };

    return (
        <DashboardLayout>
            <PageLayout title="Avaliações">
                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon + ' ' + styles.iconStar}>
                            <IoStar size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Média Geral</span>
                            <span className={styles.statValue}>{avgRating}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon + ' ' + styles.iconChat}>
                            <IoChatbubbleOutline size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Total Avaliações</span>
                            <span className={styles.statValue}>{reviews.length}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <IoStorefrontOutline size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Com Resposta</span>
                            <span className={styles.statValue}>{withReply}</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className={styles.filtersSection}>
                    <div className={styles.searchWrapper}>
                        <SearchInput
                            placeholder="Buscar avaliação..."
                            value={search}
                            onChange={setSearch}
                        />
                    </div>
                    <div className={styles.filterButtons}>
                        <button
                            className={`${styles.filterBtn} ${filterRating === null ? styles.active : ''}`}
                            onClick={() => setFilterRating(null)}
                        >
                            Todas
                        </button>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <button
                                key={rating}
                                className={`${styles.filterBtn} ${styles.starBtn} ${filterRating === rating ? styles.active : ''}`}
                                onClick={() => setFilterRating(rating)}
                            >
                                {rating} <IoStar size={14} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <span>Carregando avaliações...</span>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className={styles.emptyState}>
                        <IoStarOutline size={48} />
                        <p>{search || filterRating ? 'Nenhuma avaliação encontrada' : 'Nenhuma avaliação cadastrada'}</p>
                    </div>
                ) : (
                    <div className={styles.reviewList}>
                        {filteredReviews.map((review) => (
                            <div key={review.id} className={styles.reviewWrapper}>
                                <div className={styles.reviewStore}>
                                    <IoStorefrontOutline size={16} />
                                    <span>{getStoreName(review.storeId)}</span>
                                </div>
                                <ReviewCard review={review} />
                            </div>
                        ))}
                    </div>
                )}
            </PageLayout>
        </DashboardLayout>
    );
}
