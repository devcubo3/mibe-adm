'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    IoArrowBack,
    IoArrowUpCircle,
    IoArrowDownCircle,
    IoStorefrontOutline,
    IoCalendarOutline,
    IoSwapVerticalOutline,
} from 'react-icons/io5';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { SearchInput, Badge, Button, Pagination } from '@/components/common';
import { storeService, transactionService, userService } from '@/services';
import { Store, Transaction, User } from '@/types';
import { useDebounce } from '@/hooks';
import { formatCurrency, formatDateTimeShort } from '@/utils';
import toast from 'react-hot-toast';
import styles from './store-transactions.module.css';

const ITEMS_PER_PAGE = 20;

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type FilterType = 'all' | 'credit' | 'debit';

export default function StoreTransactionsPage() {
    const router = useRouter();
    const params = useParams();
    const storeId = params.id as string;

    // Data state
    const [store, setStore] = useState<Store | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        if (storeId) {
            loadData();
        }
    }, [storeId]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filterType, sortBy, dateFrom, dateTo]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [storeData, storeTransactions, allUsers] = await Promise.all([
                storeService.getById(storeId),
                transactionService.getByStore(storeId),
                userService.getAll(),
            ]);
            setStore(storeData);
            setTransactions(storeTransactions);
            setUsers(allUsers);
        } catch (error: any) {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // Search filter
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            result = result.filter((t) => {
                const customer = users.find((u) => u.id === t.userId);
                return (
                    t.description.toLowerCase().includes(searchLower) ||
                    customer?.name.toLowerCase().includes(searchLower)
                );
            });
        }

        // Type filter
        if (filterType !== 'all') {
            result = result.filter((t) => t.type === filterType);
        }

        // Date filter
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            result = result.filter((t) => new Date(t.createdAt) >= fromDate);
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter((t) => new Date(t.createdAt) <= toDate);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'highest':
                    return b.amount - a.amount;
                case 'lowest':
                    return a.amount - b.amount;
                default:
                    return 0;
            }
        });

        return result;
    }, [transactions, users, debouncedSearch, filterType, sortBy, dateFrom, dateTo]);

    // Calculate stats from filtered transactions
    const stats = useMemo(() => {
        const credits = filteredTransactions.filter((t) => t.type === 'credit');
        const debits = filteredTransactions.filter((t) => t.type === 'debit');
        return {
            totalCredits: credits.reduce((sum, t) => sum + t.amount, 0),
            totalDebits: debits.reduce((sum, t) => sum + t.amount, 0),
            count: filteredTransactions.length,
        };
    }, [filteredTransactions]);

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleBack = () => {
        router.push(`/stores/${storeId}`);
    };

    const handleClearFilters = () => {
        setSearch('');
        setFilterType('all');
        setSortBy('newest');
        setDateFrom('');
        setDateTo('');
    };

    const hasActiveFilters =
        search || filterType !== 'all' || sortBy !== 'newest' || dateFrom || dateTo;

    if (loading) {
        return (
            <DashboardLayout>
                <PageLayout title="Histórico de Transações">
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <span>Carregando transações...</span>
                    </div>
                </PageLayout>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageLayout title="Histórico de Transações">
                <div className={styles.container}>
                    {/* Back Button */}
                    <button className={styles.backButton} onClick={handleBack}>
                        <IoArrowBack size={20} />
                        Voltar para {store?.name || 'Estabelecimento'}
                    </button>

                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerInfo}>
                            <h1 className={styles.title}>Transações de {store?.name}</h1>
                            <p className={styles.subtitle}>
                                Histórico completo de cashback do estabelecimento
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.iconCredit}`}>
                                <IoArrowUpCircle size={24} />
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statLabel}>Total Recebido</span>
                                <span className={`${styles.statValue} ${styles.valueCredit}`}>
                                    {formatCurrency(stats.totalCredits)}
                                </span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.iconDebit}`}>
                                <IoArrowDownCircle size={24} />
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statLabel}>Total Resgatado</span>
                                <span className={`${styles.statValue} ${styles.valueDebit}`}>
                                    {formatCurrency(stats.totalDebits)}
                                </span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <IoStorefrontOutline size={24} />
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statLabel}>Transações</span>
                                <span className={styles.statValue}>{stats.count}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={styles.filtersSection}>
                        <div className={styles.filtersRow}>
                            <div className={styles.searchWrapper}>
                                <SearchInput
                                    placeholder="Buscar por descrição ou cliente..."
                                    value={search}
                                    onChange={setSearch}
                                />
                            </div>
                            <div className={styles.filterButtons}>
                                <button
                                    className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
                                    onClick={() => setFilterType('all')}
                                >
                                    Todas
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${filterType === 'credit' ? styles.active : ''}`}
                                    onClick={() => setFilterType('credit')}
                                >
                                    Crédito
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${filterType === 'debit' ? styles.active : ''}`}
                                    onClick={() => setFilterType('debit')}
                                >
                                    Débito
                                </button>
                            </div>
                        </div>

                        <div className={styles.filtersRow}>
                            <div className={styles.dateFilters}>
                                <div className={styles.dateInput}>
                                    <IoCalendarOutline size={16} />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        placeholder="Data inicial"
                                    />
                                </div>
                                <span className={styles.dateSeparator}>até</span>
                                <div className={styles.dateInput}>
                                    <IoCalendarOutline size={16} />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        placeholder="Data final"
                                    />
                                </div>
                            </div>

                            <div className={styles.sortWrapper}>
                                <IoSwapVerticalOutline size={16} />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className={styles.sortSelect}
                                >
                                    <option value="newest">Mais recentes</option>
                                    <option value="oldest">Mais antigos</option>
                                    <option value="highest">Maior valor</option>
                                    <option value="lowest">Menor valor</option>
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <button className={styles.clearFilters} onClick={handleClearFilters}>
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Transaction List */}
                    {paginatedTransactions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <IoStorefrontOutline size={48} />
                            <p>
                                {hasActiveFilters
                                    ? 'Nenhuma transação encontrada com os filtros aplicados'
                                    : 'Nenhuma transação cadastrada'}
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    title="Limpar filtros"
                                    variant="secondary"
                                    onClick={handleClearFilters}
                                />
                            )}
                        </div>
                    ) : (
                        <>
                            <div className={styles.transactionList}>
                                <div className={styles.listHeader}>
                                    <span>Data</span>
                                    <span>Cliente</span>
                                    <span>Tipo</span>
                                    <span>Descrição</span>
                                    <span className={styles.alignRight}>Valor</span>
                                </div>
                                {paginatedTransactions.map((transaction) => {
                                    const customer = users.find((u) => u.id === transaction.userId);
                                    return (
                                        <div key={transaction.id} className={styles.transactionItem}>
                                            <span className={styles.date}>
                                                {formatDateTimeShort(transaction.createdAt)}
                                            </span>
                                            <span className={styles.customer}>
                                                {customer?.name || 'Cliente não encontrado'}
                                            </span>
                                            <Badge
                                                variant={transaction.type === 'credit' ? 'success' : 'error'}
                                            >
                                                {transaction.type === 'credit' ? 'Crédito' : 'Débito'}
                                            </Badge>
                                            <span className={styles.description}>
                                                {transaction.description}
                                            </span>
                                            <span
                                                className={`${styles.amount} ${transaction.type === 'credit' ? styles.credit : styles.debit}`}
                                            >
                                                {transaction.type === 'credit' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredTransactions.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </div>
            </PageLayout>
        </DashboardLayout>
    );
}
