'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  IoArrowBack,
  IoPersonOutline,
  IoStorefrontOutline,
  IoStarOutline,
} from 'react-icons/io5';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { userService, walletService, transactionService } from '@/services';
import { User, Wallet, Transaction } from '@/types';
import { formatCurrency, formatISOToDate, formatCPF } from '@/utils';
import toast from 'react-hot-toast';
import styles from './userDetail.module.css';

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Admin';
    case 'store_owner': return 'Lojista';
    default: return 'Usuário';
  }
};

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || '?';
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [points, setPoints] = useState(0);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const userData = await userService.getById(userId);
      setUser(userData);

      const [userPoints, userWallets, userTransactions] = await Promise.all([
        userService.getUserPoints(userId),
        walletService.getByUser(userId).catch(() => []),
        transactionService.getByUser(userId).catch(() => []),
      ]);

      setPoints(userPoints);
      setWallets(userWallets);
      setTransactions(userTransactions);
    } catch (err: any) {
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const totalCashback = wallets.reduce((sum, w) => sum + w.balance, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <PageLayout title="Detalhes do Usuário">
          <div className={styles.loading}>Carregando...</div>
        </PageLayout>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <PageLayout title="Detalhes do Usuário">
          <button className={styles.backButton} onClick={() => router.push('/users')}>
            <IoArrowBack size={20} />
            Voltar para lista
          </button>
          <div className={styles.errorState}>
            <p className={styles.errorText}>Usuário não encontrado</p>
          </div>
        </PageLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageLayout title="Detalhes do Usuário">
        <div className={styles.detailPage}>
          <button className={styles.backButton} onClick={() => router.push('/users')}>
            <IoArrowBack size={20} />
            Voltar para lista
          </button>

          {/* Profile Header */}
          <div className={styles.profileHeader}>
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={80}
                height={80}
                className={styles.avatarLarge}
              />
            ) : (
              <div className={styles.avatarPlaceholderLarge}>
                {getInitials(user.name)}
              </div>
            )}
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{user.name}</h1>
              <p className={styles.profileEmail}>{user.email}</p>
              <span className={styles.roleBadge}>{getRoleLabel(user.role)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCardPoints}>
              <p className={styles.statLabelLight}>PONTOS MIBE</p>
              <h2 className={styles.statValueLight}>{points.toLocaleString('pt-BR')}</h2>
              <p className={styles.statSublabelLight}>1 ponto por R$1 pago</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>SALDO TOTAL CASHBACK</p>
              <h2 className={styles.statValue}>{formatCurrency(totalCashback)}</h2>
              <p className={styles.statSublabel}>{wallets.length} carteira{wallets.length !== 1 ? 's' : ''}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>TOTAL DE TRANSAÇÕES</p>
              <h2 className={styles.statValue}>{transactions.length}</h2>
              <p className={styles.statSublabel}>compras registradas</p>
            </div>
          </div>

          {/* Personal Info */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>Dados Pessoais</h3>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>CPF</span>
                <span className={styles.infoValue}>{formatCPF(user.cpf)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Telefone</span>
                <span className={styles.infoValue}>{user.phone || 'Não informado'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Data de Nascimento</span>
                <span className={styles.infoValue}>{user.birthDate || 'Não informado'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Cadastro</span>
                <span className={styles.infoValue}>{formatISOToDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Wallets */}
          {wallets.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Carteiras de Cashback</h2>
              <div className={styles.walletsList}>
                {wallets.map((wallet) => (
                  <div key={wallet.id} className={styles.walletItem}>
                    {wallet.storeLogo ? (
                      <Image
                        src={wallet.storeLogo}
                        alt={wallet.storeName}
                        width={40}
                        height={40}
                        className={styles.walletLogo}
                      />
                    ) : (
                      <div className={styles.walletLogoPlaceholder}>
                        <IoStorefrontOutline size={20} color="#999" />
                      </div>
                    )}
                    <div className={styles.walletInfo}>
                      <p className={styles.walletStore}>{wallet.storeName}</p>
                    </div>
                    <p className={styles.walletBalance}>{formatCurrency(wallet.balance)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Transações Recentes</h2>
            {transactions.length === 0 ? (
              <div className={styles.emptyState}>Nenhuma transação encontrada</div>
            ) : (
              <table className={styles.transactionsTable}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Estabelecimento</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 20).map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatISOToDate(tx.createdAt)}</td>
                      <td>{tx.storeName || '-'}</td>
                      <td>{tx.description}</td>
                      <td className={tx.type === 'credit' ? styles.amountCredit : styles.amountDebit}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </PageLayout>
    </DashboardLayout>
  );
}
