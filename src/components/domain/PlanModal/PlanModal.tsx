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
        userLimit: '',
        excessUserFee: '',
        monthlyPrice: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEditing = !!plan;

    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name,
                description: plan.description || '',
                userLimit: String(plan.userLimit),
                excessUserFee: String(plan.excessUserFee),
                monthlyPrice: String(plan.monthlyPrice),
            });
        } else {
            setFormData({
                name: '',
                description: '',
                userLimit: '',
                excessUserFee: '',
                monthlyPrice: '',
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

        if (!formData.userLimit || isNaN(Number(formData.userLimit)) || Number(formData.userLimit) < 0) {
            newErrors.userLimit = 'Limite de clientes inválido';
        }

        if (!formData.excessUserFee || isNaN(Number(formData.excessUserFee)) || Number(formData.excessUserFee) < 0) {
            newErrors.excessUserFee = 'Valor por excedente inválido';
        }

        if (!formData.monthlyPrice || isNaN(Number(formData.monthlyPrice)) || Number(formData.monthlyPrice) < 0) {
            newErrors.monthlyPrice = 'Preço mensal inválido';
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
                userLimit: Number(formData.userLimit),
                excessUserFee: Number(formData.excessUserFee),
                monthlyPrice: Number(formData.monthlyPrice),
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
                        placeholder="Ex: Básico, Premium, Enterprise"
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

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Limite de Clientes *</label>
                        <Input
                            type="number"
                            placeholder="100"
                            value={formData.userLimit}
                            onChange={(value) => handleChange('userLimit', value)}
                            error={errors.userLimit}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Valor por Excedente (R$) *</label>
                        <Input
                            type="number"
                            placeholder="1.00"
                            value={formData.excessUserFee}
                            onChange={(value) => handleChange('excessUserFee', value)}
                            error={errors.excessUserFee}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Preço Mensal (R$) *</label>
                    <Input
                        type="number"
                        placeholder="99.90"
                        value={formData.monthlyPrice}
                        onChange={(value) => handleChange('monthlyPrice', value)}
                        error={errors.monthlyPrice}
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
