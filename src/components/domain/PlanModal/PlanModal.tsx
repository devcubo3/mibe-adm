'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@/components/common';
import { Plan, CreatePlanDTO, UpdatePlanDTO } from '@/types/plan.types';
import styles from './PlanModal.module.css';

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreatePlanDTO | UpdatePlanDTO) => Promise<void>;
    plan?: Plan | null;
}

const PlanModal: React.FC<PlanModalProps> = ({ isOpen, onClose, onSave, plan }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        commissionPercent: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEditing = !!plan;

    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name,
                description: plan.description || '',
                commissionPercent: String(plan.commissionPercent),
            });
        } else {
            setFormData({
                name: '',
                description: '',
                commissionPercent: '',
            });
        }
        setErrors({});
    }, [plan, isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        const commission = Number(formData.commissionPercent);
        if (!formData.commissionPercent || isNaN(commission) || commission < 0 || commission > 100) {
            newErrors.commissionPercent = 'Comissão deve ser entre 0 e 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const data: CreatePlanDTO = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                commissionPercent: Number(formData.commissionPercent),
            };

            await onSave(data);
            onClose();
        } catch (error) {
            console.error('Error saving plan:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Plano' : 'Novo Plano'}
        >
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Nome do Plano *</label>
                    <Input
                        placeholder="Ex: Plano MIBE"
                        value={formData.name}
                        onChange={(value) => handleChange('name', value)}
                        error={errors.name}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Descrição</label>
                    <Input
                        placeholder="Descrição opcional do plano"
                        value={formData.description}
                        onChange={(value) => handleChange('description', value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Comissão por Venda (%) *</label>
                    <Input
                        type="number"
                        placeholder="5"
                        value={formData.commissionPercent}
                        onChange={(value) => handleChange('commissionPercent', value)}
                        error={errors.commissionPercent}
                    />
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="secondary" onClick={onClose} title="Cancelar" />
                    <Button
                        type="submit"
                        disabled={loading}
                        title={loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Plano'}
                    />
                </div>
            </form>
        </Modal>
    );
};

export default PlanModal;
