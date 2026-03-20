import {
    Subscription,
    CreateSubscriptionDTO,
    UpdateSubscriptionDTO,
    PaymentHistory,
    InvoiceSummary,
    CompanyInvoiceCard
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
        status: row.status as Subscription['status'],
        startedAt: row.started_at as string,
        expiresAt: (row.expires_at as string) || null,
        asaasPaymentId: (row.asaas_payment_id as string) || null,
        asaasCustomerId: (row.asaas_customer_id as string) || null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
};

const mapDbPaymentHistory = (row: Record<string, unknown>): PaymentHistory => ({
    id: row.id as string,
    subscriptionId: row.subscription_id as string,
    amount: Number(row.amount),
    status: row.status as PaymentHistory['status'],
    type: row.type as PaymentHistory['type'],
    commissionDate: (row.commission_date as string) || null,
    paymentDate: (row.payment_date as string) || null,
    dueDate: row.due_date as string,
    gatewayReference: (row.gateway_reference as string) || null,
    createdAt: row.created_at as string,
});

export const subscriptionService = {
    /**
     * Busca todas as assinaturas com filtros opcionais
     */
    getAll: async (filters?: { status?: string }): Promise<Subscription[]> => {
        let query = supabase
            .from('subscriptions')
            .select(`*, companies(business_name), plans(name)`)
            .order('created_at', { ascending: false });

        if (filters?.status) query = query.eq('status', filters.status);

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
            .select(`*, companies(business_name), plans(name)`)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(1)
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
            .select(`*, companies(business_name), plans(name)`)
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
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                company_id: dto.companyId,
                plan_id: dto.planId,
                started_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
            })
            .select(`*, companies(business_name), plans(name)`)
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
            .select(`*, companies(business_name), plans(name)`)
            .single();

        if (error) {
            console.error('Error updating subscription:', error);
            throw new Error('Erro ao atualizar assinatura');
        }

        return mapDbSubscriptionToSubscription(data);
    },

    /**
     * Busca empresas sem assinatura
     */
    getCompaniesWithoutSubscription: async (): Promise<{ id: string; name: string }[]> => {
        const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('company_id');

        const subscribedIds = (subscriptions || []).map(s => s.company_id);

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

    // ============================================
    // FATURAS / PAYMENT HISTORY
    // ============================================

    /**
     * Busca histórico de faturas de uma empresa (via subscription)
     */
    getPaymentHistoryByCompany: async (companyId: string): Promise<PaymentHistory[]> => {
        // Primeiro busca subscription IDs da empresa
        const { data: subs } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('company_id', companyId);

        const subIds = (subs || []).map(s => s.id);
        if (subIds.length === 0) return [];

        const { data, error } = await supabase
            .from('payment_history')
            .select('*')
            .in('subscription_id', subIds)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching payment history:', error);
            throw new Error('Erro ao carregar faturas');
        }

        return (data || []).map(mapDbPaymentHistory);
    },

    /**
     * Retorna resumo das faturas de uma empresa
     */
    getInvoiceSummary: async (companyId: string): Promise<InvoiceSummary> => {
        const invoices = await subscriptionService.getPaymentHistoryByCompany(companyId);

        const totalPending = invoices
            .filter(i => i.status === 'pending')
            .reduce((acc, i) => acc + i.amount, 0);

        const totalPaid = invoices
            .filter(i => i.status === 'paid')
            .reduce((acc, i) => acc + i.amount, 0);

        const overdueCount = invoices
            .filter(i => {
                if (i.status !== 'pending') return false;
                const [y, m, d] = i.dueDate.split("-").map(Number);
                const dueEnd = new Date(y, m - 1, d, 23, 59, 59);
                return dueEnd < new Date();
            }).length;

        return { totalPending, totalPaid, overdueCount };
    },

    /**
     * Marca uma fatura como paga manualmente
     */
    markInvoiceAsPaid: async (paymentId: string): Promise<PaymentHistory> => {
        const { data, error } = await supabase
            .from('payment_history')
            .update({
                status: 'paid',
                payment_date: new Date().toISOString(),
            })
            .eq('id', paymentId)
            .select()
            .single();

        if (error) {
            console.error('Error marking invoice as paid:', error);
            throw new Error('Erro ao marcar fatura como paga');
        }

        return mapDbPaymentHistory(data);
    },

    /**
     * Desbloqueia uma empresa (reativa company + subscription)
     */
    unblockCompany: async (companyId: string): Promise<void> => {
        // Reativar empresa
        const { error: companyError } = await supabase
            .from('companies')
            .update({ is_active: true, updated_at: new Date().toISOString() })
            .eq('id', companyId);

        if (companyError) {
            console.error('Error unblocking company:', companyError);
            throw new Error('Erro ao desbloquear empresa');
        }

        // Reativar assinatura
        const { error: subError } = await supabase
            .from('subscriptions')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('company_id', companyId)
            .in('status', ['overdue', 'pending_payment']);

        if (subError) {
            console.error('Error reactivating subscription:', subError);
            throw new Error('Erro ao reativar assinatura');
        }
    },

    /**
     * Busca todos os estabelecimentos que possuem faturas, com resumo agregado.
     * Otimizado: 3 queries ao invés de N+1.
     */
    getCompaniesWithInvoices: async (): Promise<CompanyInvoiceCard[]> => {
        // 1. Busca todas subscriptions com dados da empresa
        const { data: subs, error: subsError } = await supabase
            .from('subscriptions')
            .select('id, company_id, companies(business_name, logo_url)');

        if (subsError) {
            console.error('Error fetching subscriptions:', subsError);
            throw new Error('Erro ao carregar assinaturas');
        }

        if (!subs || subs.length === 0) return [];

        const subIds = subs.map(s => s.id);

        // 2. Busca todas as faturas de uma vez
        const { data: payments, error: paymentsError } = await supabase
            .from('payment_history')
            .select('subscription_id, status, amount, due_date')
            .in('subscription_id', subIds);

        if (paymentsError) {
            console.error('Error fetching payment history:', paymentsError);
            throw new Error('Erro ao carregar faturas');
        }

        // 3. Mapa subscription_id → company_id
        const subToCompany = new Map<string, string>();
        const companyInfo = new Map<string, { name: string; logo: string | null }>();

        for (const sub of subs) {
            const company = sub.companies as unknown as Record<string, unknown> | null;
            const companyId = sub.company_id as string;
            subToCompany.set(sub.id, companyId);

            if (!companyInfo.has(companyId) && company) {
                companyInfo.set(companyId, {
                    name: (company.business_name as string) || 'Sem nome',
                    logo: (company.logo_url as string) || null,
                });
            }
        }

        // 4. Agrupa faturas por company_id
        const now = new Date();
        const aggregated = new Map<string, {
            pendingCount: number;
            paidCount: number;
            overdueCount: number;
            totalPending: number;
            totalPaid: number;
        }>();

        for (const p of (payments || [])) {
            const companyId = subToCompany.get(p.subscription_id as string);
            if (!companyId) continue;

            if (!aggregated.has(companyId)) {
                aggregated.set(companyId, {
                    pendingCount: 0, paidCount: 0, overdueCount: 0,
                    totalPending: 0, totalPaid: 0,
                });
            }

            const agg = aggregated.get(companyId)!;
            const status = p.status as string;
            const amount = Number(p.amount);

            if (status === 'paid') {
                agg.paidCount++;
                agg.totalPaid += amount;
            } else if (status === 'pending') {
                const dueParts = (p.due_date as string).split("-").map(Number);
                const dueEnd = new Date(dueParts[0], dueParts[1] - 1, dueParts[2], 23, 59, 59);
                const isOverdue = dueEnd < now;
                if (isOverdue) {
                    agg.overdueCount++;
                } else {
                    agg.pendingCount++;
                }
                agg.totalPending += amount;
            }
        }

        // 5. Monta resultado — inclui empresas com subscription mesmo sem faturas
        const result: CompanyInvoiceCard[] = [];
        const seenCompanies = new Set<string>();

        for (const sub of subs) {
            const companyId = sub.company_id as string;
            if (seenCompanies.has(companyId)) continue;
            seenCompanies.add(companyId);

            const info = companyInfo.get(companyId);
            const agg = aggregated.get(companyId);

            result.push({
                companyId,
                companyName: info?.name || 'Sem nome',
                companyLogo: info?.logo || null,
                pendingCount: agg?.pendingCount || 0,
                paidCount: agg?.paidCount || 0,
                overdueCount: agg?.overdueCount || 0,
                totalPending: agg?.totalPending || 0,
                totalPaid: agg?.totalPaid || 0,
            });
        }

        // Ordena: empresas com faturas vencidas primeiro, depois por pendentes
        result.sort((a, b) => {
            if (a.overdueCount !== b.overdueCount) return b.overdueCount - a.overdueCount;
            if (a.pendingCount !== b.pendingCount) return b.pendingCount - a.pendingCount;
            return a.companyName.localeCompare(b.companyName);
        });

        return result;
    },

    /**
     * Deleta uma assinatura e seu histórico de pagamentos
     */
    delete: async (id: string): Promise<void> => {
        // Primeiro remove payment_history associado
        const { error: paymentError } = await supabase
            .from('payment_history')
            .delete()
            .eq('subscription_id', id);

        if (paymentError) {
            console.error('Error deleting payment history:', paymentError);
            throw new Error('Erro ao deletar histórico de pagamentos');
        }

        // Depois remove a assinatura
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting subscription:', error);
            throw new Error('Erro ao deletar assinatura');
        }
    },
};
