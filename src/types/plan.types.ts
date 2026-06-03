/**
 * Tipos para o módulo de Planos de Assinatura
 *
 * Mapeamento banco -> frontend:
 * - is_active -> isActive
 *
 * Obs.: `commissionPercent` é legado (coluna mantida no banco para histórico).
 * O MIBE não cobra mais taxa por venda — apenas a mensalidade.
 */

export interface Plan {
    id: string;
    name: string;
    description: string | null;
    /** @deprecated Não há mais taxa por venda. Mantido para retrocompatibilidade. */
    commissionPercent?: number;
    monthlyPrice: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreatePlanDTO {
    name: string;
    description?: string;
    /** @deprecated Não há mais taxa por venda. */
    commissionPercent?: number;
    monthlyPrice: number;
}

export interface UpdatePlanDTO extends Partial<CreatePlanDTO> {
    isActive?: boolean;
}
