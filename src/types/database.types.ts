/**
 * Database types for Supabase tables
 * These types match the actual Supabase schema
 */

// ============================================
// ENUMS
// ============================================

export type CompanyStatus = 'pending' | 'active' | 'inactive';
export type UserRole = 'client' | 'company_owner' | 'company_staff' | 'super_admin';
export type PaymentHistoryStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// ============================================
// TABLES
// ============================================

export interface DbProfile {
    id: string;
    cpf: string;
    full_name: string;
    phone: string | null;
    birth_date: string | null;
    avatar_url: string | null;
    role: UserRole;
    company_id: string | null;
    is_active: boolean;
    onboarding_completed: boolean | null;
    created_at: string;
}

export interface DbCategory {
    id: number;
    name: string;
    icon_url: string | null;
}

export interface DbPlan {
    id: string;
    name: string;
    description: string | null;
    commission_percent: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbCompany {
    id: string;
    owner_id: string | null;
    category_id: number | null;
    plan_id: string | null;
    cnpj: string | null;
    business_name: string;
    description: string | null;
    logo_url: string | null;
    cover_url: string | null;
    status: CompanyStatus | null;
    is_active: boolean;
    cashback_percent: number | null;
    min_purchase_value: number | null;
    has_expiration: boolean | null;
    expiration_days: number | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    latitude: number | null;
    longitude: number | null;
    asaas_customer_id: string | null;
    trial_used_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface DbTransaction {
    id: string;
    company_id: string | null;
    user_id: string | null;
    total_amount: number;
    cashback_redeemed: number;
    net_amount_paid: number;
    cashback_earned: number;
    admin_fee_amount: number | null;
    payment_method: string;
    created_at: string;
}

export interface DbReview {
    id: string;
    company_id: string | null;
    user_id: string | null;
    rating: number;
    comment: string | null;
    owner_response: string | null;
    created_at: string;
}

export interface DbAppConfig {
    id: number;
    global_fee_percent: number;
    support_whatsapp: string | null;
    support_email: string | null;
    updated_at: string;
}

export interface DbUserPoints {
    user_id: string;
    total_points: number;
    updated_at: string;
}

export interface DbPointsHistory {
    id: string;
    user_id: string;
    transaction_id: string | null;
    points: number;
    type: string;
    created_at: string;
}

export interface DbCashbackBalance {
    id: string;
    user_id: string | null;
    company_id: string | null;
    current_balance: number;
    last_purchase_date: string;
}

export interface DbSubscription {
    id: string;
    company_id: string;
    plan_id: string;
    status: 'active' | 'overdue' | 'cancelled' | 'pending_payment';
    started_at: string;
    expires_at: string | null;
    asaas_payment_id: string | null;
    asaas_customer_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbPaymentHistory {
    id: string;
    subscription_id: string;
    amount: number;
    status: PaymentHistoryStatus;
    type: 'MENSALIDADE' | 'COMISSAO_DIARIA';
    commission_date: string | null;
    payment_date: string | null;
    due_date: string;
    gateway_reference: string | null;
    created_at: string;
}

// ============================================
// JOINED TYPES (for queries with relations)
// ============================================

export interface DbCompanyWithRelations extends DbCompany {
    category?: DbCategory;
    owner?: DbProfile;
    plan?: DbPlan;
}

export interface DbTransactionWithRelations extends DbTransaction {
    company?: DbCompany;
    user?: DbProfile;
}

export interface DbReviewWithRelations extends DbReview {
    company?: DbCompany;
    user?: DbProfile;
}

export interface DbCashbackBalanceWithRelations extends DbCashbackBalance {
    company?: DbCompany;
    user?: DbProfile;
}

export interface DbSubscriptionWithRelations extends DbSubscription {
    companies?: DbCompany;
    plans?: DbPlan;
}

export interface DbPaymentHistoryWithRelations extends DbPaymentHistory {
    subscription?: DbSubscription;
}
