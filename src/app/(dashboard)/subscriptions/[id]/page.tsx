'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Button, Badge, Card } from '@/components/common';
import { SubscriptionModal } from '@/components/domain';
import { subscriptionService, planService } from '@/services';
import { Subscription, SubscriptionStatus } from '@/types/subscription.types';
import { Plan } from '@/types/plan.types';
import { formatISOToDate } from '@/utils/formatters';
import {
    IoArrowBackOutline,
    IoDocumentTextOutline,
    IoCalendarOutline,
    IoTrendingUpOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import styles from './details.module.css';

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

export default function SubscriptionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deactivating, setDeactivating] = useState(false);
    const [activating, setActivating] = useState(false);

    const subscriptionId = params.id as string;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const subData = await subscriptionService.getById(subscriptionId);
            if (subData) {
                setSubscription(subData);
                if (subData.planId) {
                    const planData = await planService.getById(subData.planId);
                    setPlan(planData);
                }
            }
        } catch {
            toast.error('Erro ao carregar detalhes da assinatura');
        } finally {
            setLoading(false);
        }
    }, [subscriptionId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleBack = () => {
        router.push('/subscriptions');
    };

    const handleDeactivate = async () => {
        if (!subscription) return;

        const confirmed = window.confirm(
            `Tem certeza que deseja desativar a assinatura de "${subscription.companyName}"?\n\nO estabelecimento perderá todos os benefícios do plano.`
        );

        if (!confirmed) return;

        try {
            setDeactivating(true);
            await subscriptionService.update(subscription.id, { status: 'cancelled' });
            toast.success('Assinatura desativada com sucesso');
            loadData();
        } catch {
            toast.error('Erro ao desativar assinatura');
        } finally {
            setDeactivating(false);
        }
    };

    const handleActivate = async () => {
        if (!subscription) return;

        const confirmed = window.confirm(
            `Deseja reativar a assinatura de "${subscription.companyName}"?\n\nO estabelecimento voltará a ter acesso aos benefícios do plano.`
        );

        if (!confirmed) return;

        try {
            setActivating(true);
            await subscriptionService.update(subscription.id, { status: 'active' });
            toast.success('Assinatura ativada com sucesso');
            loadData();
        } catch {
            toast.error('Erro ao ativar assinatura');
        } finally {
            setActivating(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <PageLayout title="Carregando...">
                    <p className={styles.loading}>Carregando detalhes...</p>
                </PageLayout>
            </DashboardLayout>
        );
    }

    if (!subscription) {
        return (
            <DashboardLayout>
                <PageLayout
                    title="Assinatura não encontrada"
                    actions={<Button title="Voltar" variant="secondary" onClick={handleBack} />}
                >
                    <p className={styles.emptyState}>A assinatura solicitada não foi encontrada.</p>
                </PageLayout>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageLayout
                title={subscription.companyName || 'Detalhes da Assinatura'}
                actions={
                    <Button
                        title="Voltar"
                        variant="secondary"
                        onClick={handleBack}
                    />
                }
            >
                <div className={styles.headerRow}>
                    <button className={styles.backButton} onClick={handleBack}>
                        <IoArrowBackOutline size={20} />
                    </button>
                    <Badge
                        variant={STATUS_VARIANTS[subscription.status]}
                        text={STATUS_LABELS[subscription.status]}
                    />
                </div>

                <div className={styles.grid}>
                    {/* Informações do Plano */}
                    <Card className={styles.card}>
                        <div className={styles.cardHeader}>
                            <IoDocumentTextOutline size={20} className={styles.cardIcon} />
                            <h3>Plano Contratado</h3>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Nome do Plano</span>
                                <span className={styles.value}>{plan?.name || subscription.planName || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Comissão por Venda</span>
                                <span className={styles.value}>
                                    <IoTrendingUpOutline size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                    {plan?.commissionPercent ?? 0}%
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Informações da Assinatura */}
                    <Card className={styles.card}>
                        <div className={styles.cardHeader}>
                            <IoCalendarOutline size={20} className={styles.cardIcon} />
                            <h3>Informações</h3>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Data de Início</span>
                                <span className={styles.value}>
                                    {subscription.startedAt ? formatISOToDate(subscription.startedAt) : 'N/A'}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Data de Expiração</span>
                                <span className={styles.value}>
                                    {subscription.expiresAt ? formatISOToDate(subscription.expiresAt) : 'N/A'}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Última Atualização</span>
                                <span className={styles.value}>
                                    {subscription.updatedAt ? formatISOToDate(subscription.updatedAt) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Ações */}
                <div className={styles.actions}>
                    {subscription.status === 'active' && (
                        <button
                            className={styles.dangerButton}
                            onClick={handleDeactivate}
                            disabled={deactivating}
                        >
                            {deactivating ? 'Desativando...' : 'Desativar Assinatura'}
                        </button>
                    )}
                    {(subscription.status === 'cancelled' || subscription.status === 'overdue') && (
                        <button
                            className={styles.successButton}
                            onClick={handleActivate}
                            disabled={activating}
                        >
                            {activating ? 'Ativando...' : 'Ativar Assinatura'}
                        </button>
                    )}
                    <Button
                        title="Alterar Plano"
                        variant="secondary"
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            </PageLayout>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={loadData}
                subscription={subscription}
            />
        </DashboardLayout>
    );
}
