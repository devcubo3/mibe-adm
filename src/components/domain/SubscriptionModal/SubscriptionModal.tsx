'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button } from '@/components/common';
import { planService, subscriptionService } from '@/services';
import { Plan } from '@/types/plan.types';
import { Subscription } from '@/types/subscription.types';
import { formatCurrency } from '@/utils/formatters';
import toast from 'react-hot-toast';
import styles from './SubscriptionModal.module.css';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    subscription?: Subscription | null;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    subscription,
}) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isChangingPlan = !!subscription;

    const loadData = useCallback(async () => {
        try {
            setLoadingData(true);
            const activePlans = await planService.getActive();
            setPlans(activePlans);

            if (!isChangingPlan) {
                const availableCompanies = await subscriptionService.getCompaniesWithoutSubscription();
                setCompanies(availableCompanies);
            }
        } catch {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoadingData(false);
        }
    }, [isChangingPlan]);

    useEffect(() => {
        if (isOpen) {
            loadData();
            if (subscription) {
                setSelectedPlanId(subscription.planId);
                setSelectedCompanyId(subscription.companyId);
            } else {
                setSelectedPlanId('');
                setSelectedCompanyId('');
            }
            setErrors({});
        }
    }, [isOpen, subscription, loadData]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!isChangingPlan && !selectedCompanyId) {
            newErrors.company = 'Selecione um estabelecimento';
        }

        if (!selectedPlanId) {
            newErrors.plan = 'Selecione um plano';
        }

        if (isChangingPlan && selectedPlanId === subscription?.planId) {
            newErrors.plan = 'Selecione um plano diferente do atual';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            if (isChangingPlan && subscription) {
                await subscriptionService.update(subscription.id, { planId: selectedPlanId });
                toast.success('Plano alterado com sucesso!');
            } else {
                await subscriptionService.create({
                    companyId: selectedCompanyId,
                    planId: selectedPlanId,
                });
                toast.success('Assinatura criada com sucesso!');
            }
            onSave();
            onClose();
        } catch {
            toast.error(isChangingPlan ? 'Erro ao alterar plano' : 'Erro ao criar assinatura');
        } finally {
            setLoading(false);
        }
    };

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isChangingPlan ? 'Alterar Plano' : 'Vincular Plano'}
        >
            <form onSubmit={handleSubmit} className={styles.form}>
                {loadingData ? (
                    <p className={styles.loadingText}>Carregando dados...</p>
                ) : (
                    <>
                        {!isChangingPlan && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Estabelecimento *</label>
                                <select
                                    className={`${styles.select} ${errors.company ? styles.selectError : ''}`}
                                    value={selectedCompanyId}
                                    onChange={(e) => {
                                        setSelectedCompanyId(e.target.value);
                                        if (errors.company) setErrors((prev) => ({ ...prev, company: '' }));
                                    }}
                                >
                                    <option value="">Selecione um estabelecimento</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.company && <span className={styles.error}>{errors.company}</span>}
                                {companies.length === 0 && (
                                    <span className={styles.hint}>
                                        Todos os estabelecimentos já possuem assinatura
                                    </span>
                                )}
                            </div>
                        )}

                        {isChangingPlan && (
                            <div className={styles.currentPlan}>
                                <span className={styles.currentPlanLabel}>Plano atual:</span>
                                <span className={styles.currentPlanName}>{subscription?.planName || 'N/A'}</span>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                {isChangingPlan ? 'Novo Plano *' : 'Plano *'}
                            </label>
                            <select
                                className={`${styles.select} ${errors.plan ? styles.selectError : ''}`}
                                value={selectedPlanId}
                                onChange={(e) => {
                                    setSelectedPlanId(e.target.value);
                                    if (errors.plan) setErrors((prev) => ({ ...prev, plan: '' }));
                                }}
                            >
                                <option value="">Selecione um plano</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - {formatCurrency(plan.monthlyPrice)}/mês
                                    </option>
                                ))}
                            </select>
                            {errors.plan && <span className={styles.error}>{errors.plan}</span>}
                        </div>

                        {selectedPlan && (
                            <div className={styles.planPreview}>
                                <h4 className={styles.previewTitle}>{selectedPlan.name}</h4>
                                {selectedPlan.description && (
                                    <p className={styles.previewDescription}>{selectedPlan.description}</p>
                                )}
                                <div className={styles.previewDetails}>
                                    <div className={styles.previewItem}>
                                        <span className={styles.previewLabel}>Valor Mensal</span>
                                        <span className={styles.previewValue}>
                                            {formatCurrency(selectedPlan.monthlyPrice)}
                                        </span>
                                    </div>
                                    <div className={styles.previewItem}>
                                        <span className={styles.previewLabel}>Limite de Clientes</span>
                                        <span className={styles.previewValue}>{selectedPlan.userLimit}</span>
                                    </div>
                                    <div className={styles.previewItem}>
                                        <span className={styles.previewLabel}>Valor por Excedente</span>
                                        <span className={styles.previewValue}>
                                            {formatCurrency(selectedPlan.excessUserFee)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.formActions}>
                            <Button type="button" variant="secondary" onClick={onClose} title="Cancelar" />
                            <Button
                                type="submit"
                                disabled={loading}
                                title={
                                    loading
                                        ? 'Salvando...'
                                        : isChangingPlan
                                            ? 'Alterar Plano'
                                            : 'Vincular'
                                }
                            />
                        </div>
                    </>
                )}
            </form>
        </Modal>
    );
};

export default SubscriptionModal;
