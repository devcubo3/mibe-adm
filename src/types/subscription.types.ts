/**
 * Tipos para o módulo de Assinaturas
 */

export type SubscriptionStatus = 'active' | 'overdue' | 'cancelled';

export interface Subscription {
    id: string;
    companyId: string;
    companyName?: string;
    planId: string;
    planName?: string;
    planUserLimit?: number;
    status: SubscriptionStatus;
    startedAt: string;
    currentProfileCount: number;
    excessProfiles: number;
    excessAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubscriptionDTO {
    companyId: string;
    planId: string;
}

export interface UpdateSubscriptionDTO {
    planId?: string;
    status?: SubscriptionStatus;
}

export interface ExcessSummary {
    totalEstablishmentsWithExcess: number;
    totalExcessAmount: number;
    topExcessEstablishment: {
        name: string;
        excessProfiles: number;
        excessAmount: number;
    } | null;
}

/**
 * Tipos para histórico de pagamentos
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentHistory {
    id: string;
    subscriptionId: string;
    amount: number;
    baseAmount: number;
    excessAmount: number;
    status: PaymentStatus;
    paymentDate: string | null;
    dueDate: string;
    gatewayReference: string | null;
    createdAt: string;
}
