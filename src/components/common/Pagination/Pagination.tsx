'use client';

import React from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import styles from './Pagination.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getVisiblePages = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis');
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) {
        return (
            <div className={styles.pagination}>
                <span className={styles.info}>
                    Mostrando {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </span>
            </div>
        );
    }

    return (
        <div className={styles.pagination}>
            <span className={styles.info}>
                Mostrando {startItem}-{endItem} de {totalItems}
            </span>

            <div className={styles.controls}>
                <button
                    className={styles.navButton}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                >
                    <IoChevronBack size={18} />
                </button>

                <div className={styles.pages}>
                    {getVisiblePages().map((page, index) =>
                        page === 'ellipsis' ? (
                            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                <button
                    className={styles.navButton}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima página"
                >
                    <IoChevronForward size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
