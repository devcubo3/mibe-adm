/**
 * Database types for Supabase tables
 * These types match the actual Supabase schema
 */

// ============================================
// ENUMS
// ============================================

export type CompanyStatus = 'pending' | 'active' | 'inactive';
export type UserRole = 'client' | 'company_owner' | 'super_admin';

// ============================================
// TABLES
// ============================================

export interface DbProfile {
    id: string;
    cpf: string;
    full_name: string;
    phone: string | null;
    birth_date: string | null;
    role: UserRole;
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
    monthly_price: number;
    user_limit: number;
    excess_user_fee: number;
    created_at: string;
}

export interface DbCompany {
    id: string;
    owner_id: string | null;
    category_id: number | null;
    plan_id: string | null;
    cnpj: string;
    business_name: string;
    description: string | null;
    logo_url: string | null;
    cover_url: string | null;
    status: CompanyStatus;
    cashback_percent: number;
    min_purchase_value: number;
    has_expiration: boolean;
    expiration_days: number;
    created_at: string;
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
    updated_at: string;
}

export interface DbCashbackBalance {
    id: string;
    user_id: string | null;
    company_id: string | null;
    current_balance: number;
    last_purchase_date: string;
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
