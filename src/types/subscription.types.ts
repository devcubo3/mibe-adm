/**
 * Tipos para o módulo de Assinaturas
 */

export type SubscriptionStatus = 'active' | 'overdue' | 'cancelled' | 'pending_payment';

export interface Subscription {
    id: string;
    companyId: string;
    companyName?: string;
    planId: string;
    planName?: string;
    status: SubscriptionStatus;
    startedAt: string;
    expiresAt: string | null;
    asaasPaymentId: string | null;
    asaasCustomerId: string | null;
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

/**
 * Tipos para histórico de pagamentos / faturas
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentType = 'MENSALIDADE' | 'COMISSAO_DIARIA';

export interface PaymentHistory {
    id: string;
    subscriptionId: string;
    amount: number;
    status: PaymentStatus;
    type: PaymentType;
    commissionDate: string | null;
    paymentDate: string | null;
    dueDate: string;
    gatewayReference: string | null;
    createdAt: string;
}

export interface InvoiceSummary {
    totalPending: number;
    totalPaid: number;
    overdueCount: number;
}

export interface CompanyInvoiceCard {
    companyId: string;
    companyName: string;
    companyLogo: string | null;
    pendingCount: number;
    paidCount: number;
    overdueCount: number;
    totalPending: number;
    totalPaid: number;
}
