import { Plan, CreatePlanDTO, UpdatePlanDTO } from '@/types/plan.types';
import { supabase } from '@/lib/supabase';

/**
 * Mapeia os dados do banco (snake_case) para o frontend (camelCase)
 */
const mapDbPlanToPlan = (row: Record<string, unknown>): Plan => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || null,
    userLimit: row.user_limit as number,
    excessUserFee: Number(row.excess_user_fee),
    monthlyPrice: Number(row.monthly_price),
    isActive: row.is_active !== undefined ? (row.is_active as boolean) : true,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) || null,
});

export const planService = {
    /**
     * Busca todos os planos
     */
    getAll: async (): Promise<Plan[]> => {
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching plans:', error);
            throw new Error('Erro ao carregar planos');
        }

        return (data || []).map(mapDbPlanToPlan);
    },

    /**
     * Busca um plano pelo ID
     */
    getById: async (id: string): Promise<Plan> => {
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching plan:', error);
            throw new Error('Plano não encontrado');
        }

        return mapDbPlanToPlan(data);
    },

    /**
     * Cria um novo plano
     */
    create: async (dto: CreatePlanDTO): Promise<Plan> => {
        const { data, error } = await supabase
            .from('plans')
            .insert({
                name: dto.name,
                description: dto.description || null,
                user_limit: dto.userLimit,
                excess_user_fee: dto.excessUserFee,
                monthly_price: dto.monthlyPrice,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating plan:', error);
            throw new Error('Erro ao criar plano');
        }

        return mapDbPlanToPlan(data);
    },

    /**
     * Atualiza um plano existente
     */
    update: async (id: string, dto: UpdatePlanDTO): Promise<Plan> => {
        const payload: Record<string, unknown> = {};

        if (dto.name !== undefined) payload.name = dto.name;
        if (dto.description !== undefined) payload.description = dto.description;
        if (dto.userLimit !== undefined) payload.user_limit = dto.userLimit;
        if (dto.excessUserFee !== undefined) payload.excess_user_fee = dto.excessUserFee;
        if (dto.monthlyPrice !== undefined) payload.monthly_price = dto.monthlyPrice;
        if (dto.isActive !== undefined) payload.is_active = dto.isActive;

        const { data, error } = await supabase
            .from('plans')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating plan:', error);
            throw new Error('Erro ao atualizar plano');
        }

        return mapDbPlanToPlan(data);
    },

    /**
     * Ativa ou desativa um plano
     */
    toggleStatus: async (id: string, isActive: boolean): Promise<Plan> => {
        return planService.update(id, { isActive });
    },

    /**
     * Busca apenas planos ativos
     */
    getActive: async (): Promise<Plan[]> => {
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('is_active', true)
            .order('monthly_price', { ascending: true });

        if (error) {
            console.error('Error fetching active plans:', error);
            throw new Error('Erro ao carregar planos ativos');
        }

        return (data || []).map(mapDbPlanToPlan);
    },

    /**
     * Verifica se um plano tem assinaturas vinculadas
     */
    hasLinkedCompanies: async (planId: string): Promise<boolean> => {
        const { count, error } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', planId);

        if (error) {
            console.error('Error checking linked subscriptions:', error);
            return false;
        }

        return (count || 0) > 0;
    },
};
