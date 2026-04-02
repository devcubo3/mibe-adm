/**
 * Tipos para o módulo de Planos de Assinatura
 *
 * Mapeamento banco -> frontend:
 * - commission_percent -> commissionPercent
 * - is_active -> isActive
 */

export interface Plan {
    id: string;
    name: string;
    description: string | null;
    commissionPercent: number;
    monthlyPrice: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreatePlanDTO {
    name: string;
    description?: string;
    commissionPercent: number;
    monthlyPrice: number;
}

export interface UpdatePlanDTO extends Partial<CreatePlanDTO> {
    isActive?: boolean;
}
