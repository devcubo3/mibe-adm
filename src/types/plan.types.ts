/**
 * Tipos para o módulo de Planos de Assinatura
 * 
 * Mapeamento banco -> frontend:
 * - user_limit -> userLimit
 * - excess_user_fee -> excessUserFee
 * - monthly_price -> monthlyPrice
 * - is_active -> isActive
 */

export interface Plan {
    id: string;
    name: string;
    description: string | null;
    userLimit: number;
    excessUserFee: number;
    monthlyPrice: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreatePlanDTO {
    name: string;
    description?: string;
    userLimit: number;
    excessUserFee: number;
    monthlyPrice: number;
}

export interface UpdatePlanDTO extends Partial<CreatePlanDTO> {
    isActive?: boolean;
}
