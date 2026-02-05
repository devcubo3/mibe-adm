import { Store, CreateStoreDTO, UpdateStoreDTO, Review } from '@/types';
import { DbCompanyWithRelations, DbReviewWithRelations } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { mapDbCompanyToStore, mapDbReviewToReview } from '@/lib/mappers';
import { asaasService } from './asaasService';


export const storeService = {
  getAll: async (): Promise<Store[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        category:categories(*),
        owner:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stores:', error);
      throw new Error('Erro ao carregar estabelecimentos');
    }

    return (data as DbCompanyWithRelations[]).map(mapDbCompanyToStore);
  },

  getById: async (id: string): Promise<Store> => {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        category:categories(*),
        owner:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching store:', error);
      throw new Error('Estabelecimento não encontrado');
    }

    return mapDbCompanyToStore(data as DbCompanyWithRelations);
  },

  create: async (data: CreateStoreDTO): Promise<Store> => {
    // Find category_id by name if category is provided
    let categoryId: number | null = null;
    if (data.category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', data.category)
        .single();

      if (categoryData) {
        categoryId = categoryData.id;
      }
    }

    // Map frontend DTO to database columns
    const { data: inserted, error } = await supabase
      .from('companies')
      .insert({
        business_name: data.name,
        cnpj: data.cnpj?.trim() || null, // Send null instead of empty string
        description: data.description,
        logo_url: data.logo,
        cover_url: data.coverImage,
        cashback_percent: data.cashback.percentage,
        min_purchase_value: data.rules.minPurchase,
        expiration_days: data.rules.expirationDays,
        has_expiration: data.rules.expirationDays > 0,
        status: 'pending',
        category_id: categoryId,
        email: data.email,
        address: data.address,
        phone: data.contact,
      })
      .select(`
        *,
        category:categories(*),
        owner:profiles(*)
      `)
      .single();

    if (error) {
      console.error('Error creating store:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Erro ao criar estabelecimento: ${error.message || error.code || 'Erro desconhecido'}`);
    }

    // Create customer in Asaas and update company with asaas_customer_id
    if (data.cnpj) {
      try {
        const asaasCustomer = await asaasService.createCustomer({
          name: data.name,
          cpfCnpj: data.cnpj,
          email: data.email,
          phone: data.contact,
          address: data.address,
          externalReference: inserted.id, // company_id para referência cruzada
        });

        // Update company with Asaas customer ID
        await supabase
          .from('companies')
          .update({ asaas_customer_id: asaasCustomer.id })
          .eq('id', inserted.id);

        console.log(`Asaas customer ${asaasCustomer.id} linked to company ${inserted.id}`);
      } catch (asaasError) {
        // Log error but don't fail the store creation
        console.error('Failed to create Asaas customer, store created without Asaas integration:', asaasError);
      }
    }

    return mapDbCompanyToStore(inserted as DbCompanyWithRelations);
  },


  update: async (id: string, data: UpdateStoreDTO): Promise<Store> => {
    // Map frontend DTO to database columns (only include defined fields)
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.business_name = data.name;
    if (data.cnpj !== undefined) updateData.cnpj = data.cnpj?.trim() || null;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.logo !== undefined) updateData.logo_url = data.logo;
    if (data.coverImage !== undefined) updateData.cover_url = data.coverImage;
    if (data.cashback?.percentage !== undefined) updateData.cashback_percent = data.cashback.percentage;
    if (data.rules?.minPurchase !== undefined) updateData.min_purchase_value = data.rules.minPurchase;
    if (data.rules?.expirationDays !== undefined) {
      updateData.expiration_days = data.rules.expirationDays;
      updateData.has_expiration = data.rules.expirationDays > 0;
    }

    // Find category_id by name if category is provided
    if (data.category !== undefined) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', data.category)
        .single();

      updateData.category_id = categoryData?.id || null;
    }

    if (data.status !== undefined) updateData.status = data.status;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.contact !== undefined) updateData.phone = data.contact;

    const { data: updated, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(*),
        owner:profiles(*)
      `)
      .single();

    if (error) {
      console.error('Error updating store:', error);
      throw new Error('Erro ao atualizar estabelecimento');
    }

    return mapDbCompanyToStore(updated as DbCompanyWithRelations);
  },

  delete: async (id: string): Promise<void> => {
    // 1. Get subscriptions to clean up payment history
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('company_id', id);

    if (subs && subs.length > 0) {
      const subIds = subs.map(s => s.id);
      await supabase.from('payment_history').delete().in('subscription_id', subIds);
    }

    // 2. Delete other related data that might not cascade
    await Promise.all([
      supabase.from('transactions').delete().eq('company_id', id),
      supabase.from('reviews').delete().eq('company_id', id),
      supabase.from('cashback_balances').delete().eq('company_id', id),
    ]);

    // 3. Delete the company (cascades to subscriptions, company_users, store_gallery)
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting store:', error);
      throw new Error('Erro ao excluir estabelecimento');
    }
  },

  getReviews: async (id: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('company_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Erro ao carregar avaliações');
    }

    return (data as DbReviewWithRelations[]).map(mapDbReviewToReview);
  },
};
