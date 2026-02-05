'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Button, SearchInput, Badge } from '@/components/common';
import { SubscriptionModal } from '@/components/domain';
import { subscriptionService, planService } from '@/services';
import { Subscription, SubscriptionStatus } from '@/types/subscription.types';
import { Plan } from '@/types/plan.types';
import { useDebounce } from '@/hooks';
import { formatCurrency, formatISOToDate } from '@/utils/formatters';
import toast from 'react-hot-toast';
import styles from './subscriptions.module.css';

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
    active: 'Ativo',
    overdue: 'Inadimplente',
    cancelled: 'Cancelado',
};

const STATUS_VARIANTS: Record<SubscriptionStatus, 'success' | 'warning' | 'error'> = {
    active: 'success',
    overdue: 'warning',
    cancelled: 'error',
};

export default function SubscriptionsPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [planFilter, setPlanFilter] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [subsData, plansData] = await Promise.all([
                subscriptionService.getAll({ status: statusFilter || undefined, planId: planFilter || undefined }),
                planService.getAll(),
            ]);
            setSubscriptions(subsData);
            setPlans(plansData);
        } catch {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, planFilter]);

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
                    </select>
                    <select
                        className={styles.select}
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                    >
                        <option value="">Todos os planos</option>
                        {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name}
                            </option>
                        ))}
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
                                    <th>Clientes</th>
                                    <th>Excedentes</th>
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
                                        <td>
                                            {sub.currentProfileCount} / {sub.planUserLimit || '∞'}
                                        </td>
                                        <td className={sub.excessProfiles > 0 ? styles.excessHighlight : ''}>
                                            {sub.excessProfiles > 0 ? `+${sub.excessProfiles}` : '0'}
                                        </td>
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
