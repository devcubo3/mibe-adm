'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { SearchInput, Badge } from '@/components/common';
import { transactionService } from '@/services';
import { Transaction } from '@/types';
import { useDebounce } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils';
import { IoArrowUpCircle, IoArrowDownCircle, IoStorefrontOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import styles from './transactions.module.css';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (error: any) {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate total stats
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout>
      <PageLayout title="Transações">
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon + ' ' + styles.iconCredit}>
              <IoArrowUpCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Recebido</span>
              <span className={styles.statValue + ' ' + styles.valueCredit}>
                {formatCurrency(totalCredits)}
              </span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon + ' ' + styles.iconDebit}>
              <IoArrowDownCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Resgatado</span>
              <span className={styles.statValue + ' ' + styles.valueDebit}>
                {formatCurrency(totalDebits)}
              </span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <IoStorefrontOutline size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Transações</span>
              <span className={styles.statValue}>{transactions.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.searchWrapper}>
            <SearchInput
              placeholder="Buscar transação..."
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
              Recebido
            </button>
            <button
              className={`${styles.filterBtn} ${filterType === 'debit' ? styles.active : ''}`}
              onClick={() => setFilterType('debit')}
            >
              Resgatado
            </button>
          </div>
        </div>

        {/* Transaction List */}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Carregando transações...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <IoStorefrontOutline size={48} />
            <p>{search ? 'Nenhuma transação encontrada' : 'Nenhuma transação cadastrada'}</p>
          </div>
        ) : (
          <div className={styles.transactionList}>
            <div className={styles.listHeader}>
              <span>Descrição</span>
              <span>Data</span>
              <span>Tipo</span>
              <span className={styles.alignRight}>Valor</span>
            </div>
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className={styles.transactionItem}>
                <div className={styles.transactionInfo}>
                  <div className={`${styles.typeIcon} ${transaction.type === 'credit' ? styles.credit : styles.debit}`}>
                    {transaction.type === 'credit' ? (
                      <IoArrowUpCircle size={20} />
                    ) : (
                      <IoArrowDownCircle size={20} />
                    )}
                  </div>
                  <span className={styles.description}>{transaction.description}</span>
                </div>
                <span className={styles.date}>{formatDate(transaction.createdAt)}</span>
                <Badge
                  variant={transaction.type === 'credit' ? 'success' : 'error'}
                >
                  {transaction.type === 'credit' ? 'Recebido' : 'Resgatado'}
                </Badge>
                <span className={`${styles.amount} ${transaction.type === 'credit' ? styles.credit : styles.debit}`}>
                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </PageLayout>
    </DashboardLayout>
  );
}
