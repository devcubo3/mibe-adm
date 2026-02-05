'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Button, Badge, Card } from '@/components/common';
import { SubscriptionModal } from '@/components/domain';
import { subscriptionService, planService } from '@/services';
import { Subscription, SubscriptionStatus } from '@/types/subscription.types';
import { Plan } from '@/types/plan.types';
import { formatCurrency, formatISOToDate } from '@/utils/formatters';
import {
    IoArrowBackOutline,
    IoDocumentTextOutline,
    IoPeopleOutline,
    IoAlertCircleOutline,
    IoCashOutline,
    IoCalendarOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import styles from './details.module.css';

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

    const usagePercentage = plan?.userLimit
        ? Math.min((subscription.currentProfileCount / plan.userLimit) * 100, 100)
        : 0;

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
                                <span className={styles.label}>Valor Mensal</span>
                                <span className={styles.value}>{plan ? formatCurrency(plan.monthlyPrice) : 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Limite de Clientes</span>
                                <span className={styles.value}>{plan?.userLimit || subscription.planUserLimit || '∞'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Valor por Excedente</span>
                                <span className={styles.value}>{plan ? formatCurrency(plan.excessUserFee) : 'N/A'}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Uso Atual */}
                    <Card className={styles.card}>
                        <div className={styles.cardHeader}>
                            <IoPeopleOutline size={20} className={styles.cardIcon} />
                            <h3>Uso Atual</h3>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.usageSection}>
                                <div className={styles.usageNumbers}>
                                    <span className={styles.usageCurrent}>{subscription.currentProfileCount}</span>
                                    <span className={styles.usageSeparator}>/</span>
                                    <span className={styles.usageLimit}>{plan?.userLimit || '∞'}</span>
                                </div>
                                <span className={styles.usageLabel}>clientes cadastrados</span>
                                {plan?.userLimit && (
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${usagePercentage >= 100 ? styles.exceeded : ''}`}
                                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Excedentes */}
                    <Card className={`${styles.card} ${subscription.excessProfiles > 0 ? styles.cardWarning : ''}`}>
                        <div className={styles.cardHeader}>
                            <IoAlertCircleOutline
                                size={20}
                                className={subscription.excessProfiles > 0 ? styles.cardIconWarning : styles.cardIcon}
                            />
                            <h3>Excedentes</h3>
                        </div>
                        <div className={styles.cardBody}>
                            {subscription.excessProfiles > 0 ? (
                                <>
                                    <div className={styles.excessValue}>
                                        <span className={styles.excessNumber}>+{subscription.excessProfiles}</span>
                                        <span className={styles.excessLabel}>clientes excedentes</span>
                                    </div>
                                    <div className={styles.excessAmount}>
                                        <IoCashOutline size={18} />
                                        <span>Valor adicional: <strong>{formatCurrency(subscription.excessAmount)}</strong></span>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.noExcess}>
                                    <span className={styles.checkIcon}>✓</span>
                                    <span>Dentro do limite do plano</span>
                                </div>
                            )}
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
                    {subscription.status === 'cancelled' && (
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
                    {subscription.excessProfiles > 0 && (
                        <Button
                            title="Sugerir Upgrade"
                            onClick={() => setIsModalOpen(true)}
                        />
                    )}
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
