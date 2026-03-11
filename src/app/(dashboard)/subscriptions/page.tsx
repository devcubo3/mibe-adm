'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Button, SearchInput, Badge } from '@/components/common';
import { SubscriptionModal } from '@/components/domain';
import { subscriptionService } from '@/services';
import { Subscription, SubscriptionStatus } from '@/types/subscription.types';
import { useDebounce } from '@/hooks';
import { formatISOToDate } from '@/utils/formatters';
import toast from 'react-hot-toast';
import styles from './subscriptions.module.css';

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
    active: 'Ativo',
    overdue: 'Inadimplente',
    cancelled: 'Cancelado',
    pending_payment: 'Aguardando Pagamento',
};

const STATUS_VARIANTS: Record<SubscriptionStatus, 'success' | 'warning' | 'error' | 'default'> = {
    active: 'success',
    overdue: 'warning',
    cancelled: 'error',
    pending_payment: 'default',
};

export default function SubscriptionsPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const subsData = await subscriptionService.getAll({ status: statusFilter || undefined });
            setSubscriptions(subsData);
        } catch {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredSubscriptions = subscriptions.filter((sub) =>
        sub.companyName?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const handleRowClick = (subscription: Subscription) => {
        router.push(`/subscriptions/${subscription.id}`);
    };

    return (
        <DashboardLayout>
            <PageLayout
                title="Assinaturas"
                actions={<Button title="Vincular Plano" onClick={() => setIsModalOpen(true)} />}
            >
                <div className={styles.filters}>
                    <SearchInput
                        placeholder="Buscar estabelecimento..."
                        value={search}
                        onChange={setSearch}
                    />
                    <select
                        className={styles.select}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Todos os status</option>
                        <option value="active">Ativos</option>
                        <option value="overdue">Inadimplentes</option>
                        <option value="cancelled">Cancelados</option>
                        <option value="pending_payment">Aguardando Pagamento</option>
                    </select>
                </div>

                {loading ? (
                    <p className={styles.loading}>Carregando...</p>
                ) : filteredSubscriptions.length === 0 ? (
                    <p className={styles.emptyState}>Nenhuma assinatura encontrada</p>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Estabelecimento</th>
                                    <th>Plano</th>
                                    <th>Status</th>
                                    <th>Início</th>
                                    <th>Expira em</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubscriptions.map((sub) => (
                                    <tr
                                        key={sub.id}
                                        onClick={() => handleRowClick(sub)}
                                        className={styles.clickableRow}
                                    >
                                        <td className={styles.companyName}>{sub.companyName || 'N/A'}</td>
                                        <td>{sub.planName || 'N/A'}</td>
                                        <td>
                                            <Badge
                                                variant={STATUS_VARIANTS[sub.status]}
                                                text={STATUS_LABELS[sub.status]}
                                            />
                                        </td>
                                        <td>{sub.startedAt ? formatISOToDate(sub.startedAt) : '-'}</td>
                                        <td>{sub.expiresAt ? formatISOToDate(sub.expiresAt) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </PageLayout>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={loadData}
            />
        </DashboardLayout>
    );
}
