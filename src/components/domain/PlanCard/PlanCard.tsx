'use client';

import React from 'react';
import { IoCreateOutline, IoPeopleOutline, IoCashOutline, IoToggleOutline, IoToggle } from 'react-icons/io5';
import { Badge } from '@/components/common';
import { Plan } from '@/types/plan.types';
import { formatCurrency } from '@/utils/formatters';
import styles from './PlanCard.module.css';

interface PlanCardProps {
    plan: Plan;
    onEdit?: (plan: Plan) => void;
    onToggleStatus?: (plan: Plan) => void;
    linkedCompaniesCount?: number;
}

const PlanCard: React.FC<PlanCardProps> = ({
    plan,
    onEdit,
    onToggleStatus,
    linkedCompaniesCount = 0
}) => {
    return (
        <div className={`${styles.planCard} ${!plan.isActive ? styles.inactive : ''}`}>
            <div className={styles.cardHeader}>
                <div className={styles.titleRow}>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <Badge
                        variant={plan.isActive ? 'success' : 'default'}
                        text={plan.isActive ? 'Ativo' : 'Inativo'}
                    />
                </div>
                {plan.description && (
                    <p className={styles.description}>{plan.description}</p>
                )}
            </div>

            <div className={styles.cardBody}>
                <div className={styles.priceSection}>
                    <span className={styles.price}>{formatCurrency(plan.monthlyPrice)}</span>
                    <span className={styles.period}>/mês</span>
                </div>

                <div className={styles.features}>
                    <div className={styles.featureItem}>
                        <IoPeopleOutline className={styles.featureIcon} size={18} />
                        <span>Até <strong>{plan.userLimit}</strong> clientes inclusos</span>
                    </div>
                    <div className={styles.featureItem}>
                        <IoCashOutline className={styles.featureIcon} size={18} />
                        <span><strong>{formatCurrency(plan.excessUserFee)}</strong> por cliente excedente</span>
                    </div>
                </div>

                {linkedCompaniesCount > 0 && (
                    <div className={styles.linkedInfo}>
                        <span>{linkedCompaniesCount} estabelecimento(s) vinculado(s)</span>
                    </div>
                )}
            </div>

            <div className={styles.cardFooter}>
                <button
                    className={styles.actionButton}
                    onClick={() => onToggleStatus?.(plan)}
                    title={plan.isActive ? 'Desativar plano' : 'Ativar plano'}
                >
                    {plan.isActive ? (
                        <IoToggle size={22} color="#34C759" />
                    ) : (
                        <IoToggleOutline size={22} color="#8E8E93" />
                    )}
                </button>
                <button
                    className={styles.actionButton}
                    onClick={() => onEdit?.(plan)}
                    title="Editar plano"
                >
                    <IoCreateOutline size={20} />
                </button>
            </div>
        </div>
    );
};

export default PlanCard;
