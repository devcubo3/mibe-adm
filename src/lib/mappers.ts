/**
 * Mapper functions to convert between Supabase database types and frontend types
 */

import { Store, Review } from '@/types';
import {
    DbCompanyWithRelations,
    DbReviewWithRelations,
    DbProfile
} from '@/types/database.types';

/**
 * Maps a Supabase company record to the frontend Store type
 */
export function mapDbCompanyToStore(company: DbCompanyWithRelations): Store {
    return {
        id: company.id,
        name: company.business_name,
        cnpj: company.cnpj,
        category: company.category?.name || 'Sem categoria',
        description: company.description || '',
        coverImage: company.cover_url || '',
        logo: company.logo_url || '',
        rating: 0, // Will be calculated from reviews
        totalReviews: 0, // Will be calculated from reviews
        address: company.address || '',
        contact: company.phone || '',
        email: company.email || '',
        coordinates: {
            latitude: 0,
            longitude: 0,
        },
        cashback: {
            percentage: Number(company.cashback_percent) || 0,
            description: `${company.cashback_percent}% de cashback`,
        },
        rules: {
            expirationDays: company.expiration_days || 30,
            minPurchase: Number(company.min_purchase_value) || 0,
            description: company.has_expiration
                ? `Válido por ${company.expiration_days} dias`
                : 'Sem expiração',
        },
        owner: {
            name: company.owner?.full_name || '',
            cpf: company.owner?.cpf || '',
            contact: company.owner?.phone || '',
        },
        photos: [],
        createdAt: company.created_at,
        updatedAt: company.created_at,
    };
}

/**
 * Maps a Supabase review record to the frontend Review type
 */
export function mapDbReviewToReview(review: DbReviewWithRelations): Review {
    return {
        id: review.id,
        storeId: review.company_id || '',
        userId: review.user_id || '',
        userName: review.user?.full_name || 'Usuário',
        userAvatar: '', // Not in current DB schema
        rating: review.rating || 0,
        comment: review.comment || '',
        storeReply: review.owner_response || undefined,
        createdAt: review.created_at,
    };
}

/**
 * Maps a Supabase profile to frontend User type
 */
export function mapDbProfileToUser(profile: DbProfile) {
    return {
        id: profile.id,
        name: profile.full_name,
        email: '', // Email is in auth.users, not profiles
        cpf: profile.cpf,
        phone: profile.phone || '',
        avatar: '', // Not in current DB schema
        role: profile.role,
        createdAt: profile.created_at,
    };
}
