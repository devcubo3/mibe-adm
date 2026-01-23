'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { PageLayout, Section } from '@/components/layout';
import { Card } from '@/components/common';
import { IoWallet, IoStorefront, IoPeople, IoSwapHorizontal, IoTrendingUp, IoTrendingDown, IoTime } from 'react-icons/io5';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import styles from './page.module.css';

// Utility to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins}min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  return date.toLocaleDateString('pt-BR');
}

// Utility to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      icon: IoWallet,
      value: stats ? formatCurrency(stats.totalCashbackGenerated) : null,
      label: 'Cashback Gerado',
      colorClass: styles.cardSuccess,
    },
    {
      icon: IoStorefront,
      value: stats?.totalStores,
      label: 'Estabelecimentos',
      colorClass: styles.cardPurple,
    },
    {
      icon: IoPeople,
      value: stats?.totalUsers,
      label: 'Usuários Ativos',
      colorClass: styles.cardBlue,
    },
    {
      icon: IoSwapHorizontal,
      value: stats?.totalTransactions,
      label: 'Transações',
      colorClass: styles.cardOrange,
    },
  ];

  return (
    <DashboardLayout>
      <PageLayout title="Dashboard">
        <Section title="Visão Geral">
          <div className={styles.statsGrid}>
            {statCards.map((card, index) => (
              <Card key={index} className={`${styles.cardWrapper} ${card.colorClass}`}>
                <div className={styles.statCard}>
                  <div className={styles.iconWrapper}>
                    <card.icon size={28} />
                  </div>
                  <div className={styles.statContent}>
                    {loading ? (
                      <>
                        <div className={`${styles.skeleton} ${styles.skeletonValue}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonLabel}`} />
                      </>
                    ) : (
                      <>
                        <h3 className={styles.statValue}>{card.value ?? '--'}</h3>
                        <p className={styles.statLabel}>{card.label}</p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Atividade Recente">
          <Card>
            {loading ? (
              <div className={styles.emptyState}>
                <div className={`${styles.skeleton}`} style={{ width: '100%', height: 60 }} />
                <div className={`${styles.skeleton}`} style={{ width: '100%', height: 60 }} />
                <div className={`${styles.skeleton}`} style={{ width: '100%', height: 60 }} />
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className={styles.activityList}>
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div
                      className={`${styles.activityIcon} ${activity.type === 'credit'
                          ? styles.activityIconCredit
                          : styles.activityIconDebit
                        }`}
                    >
                      {activity.type === 'credit' ? (
                        <IoTrendingUp size={20} />
                      ) : (
                        <IoTrendingDown size={20} />
                      )}
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityTitle}>{activity.userName}</p>
                      <p className={styles.activitySubtitle}>{activity.storeName}</p>
                    </div>
                    <div
                      className={`${styles.activityAmount} ${activity.type === 'credit'
                          ? styles.activityAmountCredit
                          : styles.activityAmountDebit
                        }`}
                    >
                      {activity.type === 'credit' ? '+' : '-'}
                      {formatCurrency(activity.amount)}
                    </div>
                    <div className={styles.activityTime}>
                      {formatRelativeTime(activity.date)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <IoTime className={styles.emptyIcon} />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </Card>
        </Section>
      </PageLayout>
    </DashboardLayout>
  );
}
