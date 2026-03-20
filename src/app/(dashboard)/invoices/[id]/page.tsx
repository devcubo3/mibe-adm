'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Button, Badge, Card } from '@/components/common';
import { InvoiceSection } from '@/components/domain';
import { subscriptionService } from '@/services';
import { Subscription, SubscriptionStatus } from '@/types/subscription.types';
import { formatISOToDate } from '@/utils/formatters';
import {
    IoArrowBackOutline,
    IoDocumentTextOutline,
    IoCalendarOutline,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import styles from './invoice-detail.module.css';

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

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [isBlocked, setIsBlocked] = useState(false);
    const [loading, setLoading] = useState(true);

    const companyId = params.id as string;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const sub = await subscriptionService.getByCompanyId(companyId);
            if (sub) {
                setSubscription(sub);
                setCompanyName(sub.companyName || 'Estabelecimento');
                setIsBlocked(sub.status === 'overdue');
            }
        } catch {
            toast.error('Erro ao carregar dados do estabelecimento');
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleBack = () => {
        router.push('/invoices');
    };

    const handleCompanyUnblocked = () => {
        setIsBlocked(false);
        loadData();
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

    return (
        <DashboardLayout>
            <PageLayout
                title={companyName || 'Faturas do Estabelecimento'}
                actions={
                    <Button title="Voltar" variant="secondary" onClick={handleBack} />
                }
            >
                <div className={styles.headerRow}>
                    <button className={styles.backButton} onClick={handleBack}>
                        <IoArrowBackOutline size={20} />
                    </button>
                    {subscription && (
                        <Badge
                            variant={STATUS_VARIANTS[subscription.status]}
                            text={STATUS_LABELS[subscription.status]}
                        />
                    )}
                </div>

                {/* Subscription Info */}
                {subscription && (
                    <div className={styles.grid}>
                        <Card className={styles.card}>
                            <div className={styles.cardHeader}>
                                <IoDocumentTextOutline size={20} className={styles.cardIcon} />
                                <h3>Plano</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Plano Atual</span>
                                    <span className={styles.value}>{subscription.planName || 'N/A'}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Status</span>
                                    <Badge
                                        variant={STATUS_VARIANTS[subscription.status]}
                                        text={STATUS_LABELS[subscription.status]}
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className={styles.card}>
                            <div className={styles.cardHeader}>
                                <IoCalendarOutline size={20} className={styles.cardIcon} />
                                <h3>Assinatura</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Início</span>
                                    <span className={styles.value}>
                                        {subscription.startedAt ? formatISOToDate(subscription.startedAt) : 'N/A'}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Expira em</span>
                                    <span className={styles.value}>
                                        {subscription.expiresAt ? formatISOToDate(subscription.expiresAt) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Invoice Section - reuses existing component */}
                <div className={styles.invoiceSection}>
                    <h2 className={styles.sectionTitle}>Faturas</h2>
                    <InvoiceSection
                        companyId={companyId}
                        isCompanyBlocked={isBlocked}
                        onCompanyUnblocked={handleCompanyUnblocked}
                    />
                </div>
            </PageLayout>
        </DashboardLayout>
    );
}
