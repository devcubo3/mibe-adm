'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Button, SearchInput } from '@/components/common';
import { PlanCard, PlanModal } from '@/components/domain';
import { planService } from '@/services';
import { Plan, CreatePlanDTO, UpdatePlanDTO } from '@/types/plan.types';
import { useDebounce } from '@/hooks';
import toast from 'react-hot-toast';
import styles from './plans.module.css';

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    const loadPlans = useCallback(async () => {
        try {
            setLoading(true);
            const data = await planService.getAll();
            setPlans(data);
        } catch {
            toast.error('Erro ao carregar planos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    const handleOpenModal = (plan?: Plan) => {
        setSelectedPlan(plan || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPlan(null);
    };

    const handleSavePlan = async (data: CreatePlanDTO | UpdatePlanDTO) => {
        try {
            if (selectedPlan) {
                await planService.update(selectedPlan.id, data as UpdatePlanDTO);
                toast.success('Plano atualizado com sucesso!');
            } else {
                await planService.create(data as CreatePlanDTO);
                toast.success('Plano criado com sucesso!');
            }
            loadPlans();
        } catch {
            toast.error('Erro ao salvar plano');
            throw new Error('Erro ao salvar plano');
        }
    };

    const handleToggleStatus = async (plan: Plan) => {
        const hasLinked = await planService.hasLinkedCompanies(plan.id);

        if (hasLinked && plan.isActive) {
            const confirmed = window.confirm(
                'Este plano tem estabelecimentos vinculados. Deseja realmente desativá-lo?'
            );
            if (!confirmed) return;
        }

        try {
            await planService.toggleStatus(plan.id, !plan.isActive);
            toast.success(`Plano ${plan.isActive ? 'desativado' : 'ativado'} com sucesso!`);
            loadPlans();
        } catch {
            toast.error('Erro ao alterar status do plano');
        }
    };

    const filteredPlans = plans
        .filter((plan) => showInactive || plan.isActive)
        .filter((plan) =>
            plan.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );

    return (
        <DashboardLayout>
            <PageLayout
                title="Planos de Assinatura"
                actions={<Button title="Novo Plano" onClick={() => handleOpenModal()} />}
            >
                <div className={styles.filters}>
                    <SearchInput
                        placeholder="Buscar plano..."
                        value={search}
                        onChange={setSearch}
                    />
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                        />
                        Mostrar inativos
                    </label>
                </div>

                {loading ? (
                    <p className={styles.loading}>Carregando...</p>
                ) : filteredPlans.length === 0 ? (
                    <p className={styles.emptyState}>
                        {search ? 'Nenhum plano encontrado' : 'Nenhum plano cadastrado'}
                    </p>
                ) : (
                    <div className={styles.planGrid}>
                        {filteredPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onEdit={handleOpenModal}
                                onToggleStatus={handleToggleStatus}
                            />
                        ))}
                    </div>
                )}
            </PageLayout>

            <PlanModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSavePlan}
                plan={selectedPlan}
            />
        </DashboardLayout>
    );
}
