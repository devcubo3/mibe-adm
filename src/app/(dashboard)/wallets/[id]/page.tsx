'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
    IoArrowBack,
    IoTimeOutline,
    IoStorefrontOutline,
    IoPersonOutline,
    IoCalendarOutline,
} from 'react-icons/io5';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Button } from '@/components/common';
import { walletService, transactionService, userService, storeService } from '@/services';
import { Wallet, Transaction, User, Store } from '@/types';
import { formatCurrency, formatDate, getDaysUntilExpiration } from '@/utils';
import toast from 'react-hot-toast';
import styles from './wallet-detail.module.css';

export default function WalletDetailPage() {
    const router = useRouter();
    const params = useParams();
    const walletId = params.id as string;

    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (walletId) {
            loadWalletData();
        }
    }, [walletId]);

    const loadWalletData = async () => {
        try {
            setLoading(true);
            setError(null);

            const walletData = await walletService.getById(walletId);
            setWallet(walletData);

            // Load related data in parallel
            const [walletTransactions, userData, storeData] = await Promise.all([
                transactionService.getByWallet(walletId),
                userService.getById(walletData.userId).catch(() => null),
                storeService.getById(walletData.storeId).catch(() => null),
            ]);

            setTransactions(walletTransactions);
            setUser(userData);
            setStore(storeData);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados da carteira');
            toast.error('Erro ao carregar dados da carteira');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/wallets');
    };

    const handleAdjustBalance = () => {
        toast('Funcionalidade em desenvolvimento', { icon: '🚧' });
    };

    const daysUntilExpiration = wallet ? getDaysUntilExpiration(wallet.expiresAt) : 0;
    const isExpiringSoon = daysUntilExpiration <= 7;

    if (loading) {
        return (
            <DashboardLayout>
                <PageLayout title="Detalhes da Carteira">
                    <div className={styles.loading}>Carregando...</div>
                </PageLayout>
            </DashboardLayout>
        );
    }

    if (error || !wallet) {
        return (
            <DashboardLayout>
                <PageLayout title="Detalhes da Carteira">
                    <button className={styles.backButton} onClick={handleBack}>
                        <IoArrowBack size={20} />
                        Voltar para lista
                    </button>
                    <div className={styles.errorState}>
                        <p className={styles.errorText}>{error || 'Carteira não encontrada'}</p>
                        <Button title="Voltar" variant="secondary" onClick={handleBack} />
                    </div>
                </PageLayout>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageLayout title="Detalhes da Carteira">
                <div className={styles.detailPage}>
                    {/* Back Button */}
                    <button className={styles.backButton} onClick={handleBack}>
                        <IoArrowBack size={20} />
                        Voltar para lista
                    </button>

                    {/* Balance Card */}
                    <div className={styles.balanceCard}>
                        <div className={styles.balanceContent}>
                            <p className={styles.balanceLabel}>Saldo Disponível</p>
                            <h1 className={styles.balanceAmount}>{formatCurrency(wallet.balance)}</h1>
                            <p className={styles.balanceSubtext}>
                                Carteira de {wallet.storeName}
                            </p>
                        </div>
                        <div className={`${styles.expiryBadgeLarge} ${isExpiringSoon ? styles.expiringSoon : ''}`}>
                            <IoTimeOutline size={20} color="#fff" />
                            <span className={styles.expiryText}>
                                {daysUntilExpiration > 0
                                    ? `Expira em ${daysUntilExpiration} dias`
                                    : 'Expirado'}
                            </span>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className={styles.infoGrid}>
                        {/* Store Info Card */}
                        <div className={styles.infoCard}>
                            <div className={styles.infoCardHeader}>
                                <div className={styles.infoCardLogo}>
                                    <Image
                                        src={wallet.storeLogo || '/placeholder-store.png'}
                                        alt={wallet.storeName}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div>
                                    <h3 className={styles.infoCardTitle}>{wallet.storeName}</h3>
                                    <p className={styles.infoCardSubtitle}>Estabelecimento</p>
                                </div>
                            </div>
                            <div className={styles.infoCardContent}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Categoria</span>
                                    <span className={styles.infoBadge}>
                                        <IoStorefrontOutline size={14} />
                                        {wallet.category}
                                    </span>
                                </div>
                                {store && (
                                    <>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Cashback</span>
                                            <span className={styles.infoValue}>{store.cashback.percentage}%</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Avaliação</span>
                                            <span className={styles.infoValue}>⭐ {store.rating.toFixed(1)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* User Info Card */}
                        <div className={styles.infoCard}>
                            <div className={styles.infoCardHeader}>
                                <div className={styles.infoCardIcon}>
                                    <IoPersonOutline size={24} color="#181818" />
                                </div>
                                <div>
                                    <h3 className={styles.infoCardTitle}>
                                        {user?.name || 'Usuário não encontrado'}
                                    </h3>
                                    <p className={styles.infoCardSubtitle}>Proprietário da carteira</p>
                                </div>
                            </div>
                            {user && (
                                <div className={styles.infoCardContent}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>E-mail</span>
                                        <span className={styles.infoValue}>{user.email}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Telefone</span>
                                        <span className={styles.infoValue}>{user.phone || 'Não informado'}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Tipo</span>
                                        <span className={styles.infoBadge}>
                                            {user.role === 'admin' ? 'Admin' : user.role === 'store_owner' ? 'Lojista' : 'Usuário'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Wallet Dates */}
                    <div className={styles.infoCard} style={{ marginBottom: 32 }}>
                        <div className={styles.infoCardHeader}>
                            <div className={styles.infoCardIcon}>
                                <IoCalendarOutline size={24} color="#181818" />
                            </div>
                            <div>
                                <h3 className={styles.infoCardTitle}>Informações da Carteira</h3>
                                <p className={styles.infoCardSubtitle}>Datas e identificação</p>
                            </div>
                        </div>
                        <div className={styles.infoCardContent}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>ID da Carteira</span>
                                <span className={styles.infoValue}>{wallet.id}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Criada em</span>
                                <span className={styles.infoValue}>{formatDate(wallet.createdAt)}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Última atualização</span>
                                <span className={styles.infoValue}>{formatDate(wallet.updatedAt)}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Expira em</span>
                                <span className={styles.infoValue}>{formatDate(wallet.expiresAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Histórico de Transações</h2>
                        </div>
                        {transactions.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p className={styles.emptyStateText}>Nenhuma transação encontrada</p>
                            </div>
                        ) : (
                            <table className={styles.transactionsTable}>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Tipo</th>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{formatDate(transaction.createdAt)}</td>
                                            <td>
                                                <span
                                                    className={`${styles.typeBadge} ${transaction.type === 'credit'
                                                            ? styles.typeBadgeCredit
                                                            : styles.typeBadgeDebit
                                                        }`}
                                                >
                                                    {transaction.type === 'credit' ? 'Crédito' : 'Débito'}
                                                </span>
                                            </td>
                                            <td>{transaction.description}</td>
                                            <td
                                                className={
                                                    transaction.type === 'credit' ? styles.amountCredit : styles.amountDebit
                                                }
                                            >
                                                {transaction.type === 'credit' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <Button title="Ajustar Saldo" onClick={handleAdjustBalance} />
                    </div>
                </div>
            </PageLayout>
        </DashboardLayout>
    );
}
