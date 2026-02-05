import {
    Subscription,
    CreateSubscriptionDTO,
    UpdateSubscriptionDTO,
    ExcessSummary
} from '@/types/subscription.types';
import { supabase } from '@/lib/supabase';

/**
 * Mapeia os dados do banco para o frontend
 */
const mapDbSubscriptionToSubscription = (row: Record<string, unknown>): Subscription => {
    const companies = row.companies as Record<string, unknown> | null;
    const plans = row.plans as Record<string, unknown> | null;

    return {
        id: row.id as string,
        companyId: row.company_id as string,
        companyName: companies?.business_name as string | undefined,
        planId: row.plan_id as string,
        planName: plans?.name as string | undefined,
        planUserLimit: plans?.user_limit as number | undefined,
        status: row.status as Subscription['status'],
        startedAt: row.started_at as string,
        currentProfileCount: row.current_profile_count as number,
        excessProfiles: row.excess_profiles as number,
        excessAmount: Number(row.excess_amount),
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
};

export const subscriptionService = {
    /**
     * Busca todas as assinaturas com filtros opcionais
     */
    getAll: async (filters?: { status?: string; planId?: string }): Promise<Subscription[]> => {
        let query = supabase
            .from('subscriptions')
            .select(`
        *,
        companies(business_name),
        plans(name, user_limit)
      `)
            .order('created_at', { ascending: false });

        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.planId) query = query.eq('plan_id', filters.planId);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching subscriptions:', error);
            throw new Error('Erro ao carregar assinaturas');
        }

        return (data || []).map(mapDbSubscriptionToSubscription);
    },

    /**
     * Busca assinatura de uma empresa específica
     */
    getByCompanyId: async (companyId: string): Promise<Subscription | null> => {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`*, companies(business_name), plans(name, user_limit)`)
            .eq('company_id', companyId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching subscription:', error);
            throw new Error('Erro ao carregar assinatura');
        }

        return data ? mapDbSubscriptionToSubscription(data) : null;
    },

    /**
     * Busca assinatura por ID
     */
    getById: async (id: string): Promise<Subscription | null> => {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`*, companies(business_name), plans(name, user_limit)`)
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching subscription by id:', error);
            throw new Error('Erro ao carregar assinatura');
        }

        return data ? mapDbSubscriptionToSubscription(data) : null;
    },

    /**
     * Cria uma nova assinatura
     */
    create: async (dto: CreateSubscriptionDTO): Promise<Subscription> => {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                company_id: dto.companyId,
                plan_id: dto.planId,
            })
            .select(`*, companies(business_name), plans(name, user_limit)`)
            .single();

        if (error) {
            console.error('Error creating subscription:', error);
            throw new Error('Erro ao criar assinatura');
        }

        return mapDbSubscriptionToSubscription(data);
    },

    /**
     * Atualiza uma assinatura (alterar plano ou status)
     */
    update: async (id: string, dto: UpdateSubscriptionDTO): Promise<Subscription> => {
        const payload: Record<string, unknown> = {};

        if (dto.planId !== undefined) payload.plan_id = dto.planId;
        if (dto.status !== undefined) payload.status = dto.status;

        const { data, error } = await supabase
            .from('subscriptions')
            .update(payload)
            .eq('id', id)
            .select(`*, companies(business_name), plans(name, user_limit)`)
            .single();

        if (error) {
            console.error('Error updating subscription:', error);
            throw new Error('Erro ao atualizar assinatura');
        }

        return mapDbSubscriptionToSubscription(data);
    },

    /**
     * Busca resumo de excedentes para o dashboard
     */
    getExcessSummary: async (): Promise<ExcessSummary> => {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`
        excess_profiles,
        excess_amount,
        companies(business_name)
      `)
            .gt('excess_profiles', 0)
            .order('excess_profiles', { ascending: false });

        if (error) {
            console.error('Error fetching excess summary:', error);
            throw new Error('Erro ao carregar resumo de excedentes');
        }

        const subscriptions = data || [];
        const totalExcessAmount = subscriptions.reduce(
            (acc, s) => acc + Number((s as Record<string, unknown>).excess_amount || 0),
            0
        );
        const topExcess = subscriptions[0] as Record<string, unknown> | undefined;
        const topCompany = topExcess?.companies as Record<string, unknown> | undefined;

        return {
            totalEstablishmentsWithExcess: subscriptions.length,
            totalExcessAmount,
            topExcessEstablishment: topExcess ? {
                name: (topCompany?.business_name as string) || 'Desconhecido',
                excessProfiles: topExcess.excess_profiles as number,
                excessAmount: Number(topExcess.excess_amount),
            } : null,
        };
    },

    /**
     * Busca assinaturas com excedentes
     */
    getWithExcess: async (): Promise<Subscription[]> => {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`*, companies(business_name), plans(name, user_limit)`)
            .gt('excess_profiles', 0)
            .order('excess_profiles', { ascending: false });

        if (error) {
            console.error('Error fetching excess subscriptions:', error);
            throw new Error('Erro ao carregar excedentes');
        }

        return (data || []).map(mapDbSubscriptionToSubscription);
    },

    /**
     * Busca empresas sem assinatura
     */
    getCompaniesWithoutSubscription: async (): Promise<{ id: string; name: string }[]> => {
        // Buscar IDs das empresas que já têm assinatura
        const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('company_id');

        const subscribedIds = (subscriptions || []).map(s => s.company_id);

        // Buscar empresas que não estão na lista
        let query = supabase
            .from('companies')
            .select('id, business_name');

        if (subscribedIds.length > 0) {
            query = query.not('id', 'in', `(${subscribedIds.join(',')})`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching companies without subscription:', error);
            throw new Error('Erro ao carregar empresas');
        }

        return (data || []).map(c => ({
            id: c.id,
            name: c.business_name
        }));
    },
};
