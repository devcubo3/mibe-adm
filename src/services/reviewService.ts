import { Review, CreateReviewDTO, ReplyReviewDTO } from '@/types';
import { DbReviewWithRelations } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

/**
 * Maps a Supabase review to the frontend Review type
 */
function mapDbReviewToReview(review: DbReviewWithRelations): Review {
  return {
    id: review.id,
    userId: review.user_id || '',
    userName: review.user?.full_name || 'Usuário',
    userAvatar: '', // Not in current DB schema
    storeId: review.company_id || '',
    rating: review.rating || 0,
    comment: review.comment || '',
    storeReply: review.owner_response || undefined,
    reply: review.owner_response ? {
      text: review.owner_response,
      createdAt: review.created_at,
    } : undefined,
    createdAt: review.created_at,
  };
}

export const reviewService = {
  getAll: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Erro ao carregar avaliações');
    }

    return (data as DbReviewWithRelations[]).map(mapDbReviewToReview);
  },

  getById: async (id: string): Promise<Review> => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching review:', error);
      throw new Error('Avaliação não encontrada');
    }

    return mapDbReviewToReview(data as DbReviewWithRelations);
  },

  getByStore: async (storeId: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('company_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching store reviews:', error);
      throw new Error('Erro ao carregar avaliações do estabelecimento');
    }

    return (data as DbReviewWithRelations[]).map(mapDbReviewToReview);
  },

  create: async (data: CreateReviewDTO): Promise<Review> => {
    // Note: This would need the current user's ID from auth context
    const { data: inserted, error } = await supabase
      .from('reviews')
      .insert({
        company_id: data.storeId,
        rating: data.rating,
        comment: data.comment,
        // user_id would come from auth context
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw new Error('Erro ao criar avaliação');
    }

    return mapDbReviewToReview(inserted as DbReviewWithRelations);
  },

  reply: async (id: string, data: ReplyReviewDTO): Promise<Review> => {
    const { data: updated, error } = await supabase
      .from('reviews')
      .update({ owner_response: data.text })
      .eq('id', id)
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (error) {
      console.error('Error replying to review:', error);
      throw new Error('Erro ao responder avaliação');
    }

    return mapDbReviewToReview(updated as DbReviewWithRelations);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting review:', error);
      throw new Error('Erro ao excluir avaliação');
    }
  },
};
