import { Wallet, CreateWalletDTO, UpdateWalletDTO } from '@/types';
import { DbCashbackBalanceWithRelations, DbCompany } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

/**
 * Maps a Supabase cashback_balance to the frontend Wallet type
 */
function mapDbCashbackBalanceToWallet(balance: DbCashbackBalanceWithRelations): Wallet {
  const company = Array.isArray(balance.company) ? balance.company[0] : balance.company;
  const user = Array.isArray(balance.user) ? balance.user[0] : balance.user;

  // Calculate expiration date based on last_purchase_date and company's expiration_days
  const lastPurchase = new Date(balance.last_purchase_date);
  const expirationDays = (company as DbCompany)?.expiration_days || 30;
  const expiresAt = new Date(lastPurchase.getTime() + expirationDays * 24 * 60 * 60 * 1000);

  return {
    id: balance.id,
    userId: balance.user_id || '',
    storeId: balance.company_id || '',
    storeName: company?.business_name || 'Estabelecimento',
    storeLogo: company?.logo_url || '',
    balance: Number(balance.current_balance) || 0,
    expiresAt: expiresAt.toISOString(),
    category: '', // Would need category join
    createdAt: balance.last_purchase_date,
    updatedAt: balance.last_purchase_date,
    // Additional fields for display
    userName: user?.full_name,
    userCpf: user?.cpf,
  };
}

// Extend Wallet type for additional Supabase fields
declare module '@/types' {
  interface Wallet {
    userName?: string;
    userCpf?: string;
  }
}

export const walletService = {
  getAll: async (): Promise<Wallet[]> => {
    const { data, error } = await supabase
      .from('cashback_balances')
      .select(`
        *,
        company:companies(*),
        user:profiles(*)
      `)
      .order('last_purchase_date', { ascending: false });

    if (error) {
      console.error('Error fetching wallets:', error);
      throw new Error('Erro ao carregar carteiras');
    }

    return (data as DbCashbackBalanceWithRelations[]).map(mapDbCashbackBalanceToWallet);
  },

  getById: async (id: string): Promise<Wallet> => {
    const { data, error } = await supabase
      .from('cashback_balances')
      .select(`
        *,
        company:companies(*),
        user:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      throw new Error('Carteira não encontrada');
    }

    return mapDbCashbackBalanceToWallet(data as DbCashbackBalanceWithRelations);
  },

  getByUser: async (userId: string): Promise<Wallet[]> => {
    const { data, error } = await supabase
      .from('cashback_balances')
      .select(`
        *,
        company:companies(*),
        user:profiles(*)
      `)
      .eq('user_id', userId)
      .order('last_purchase_date', { ascending: false });

    if (error) {
      console.error('Error fetching user wallets:', error);
      throw new Error('Erro ao carregar carteiras do usuário');
    }

    return (data as DbCashbackBalanceWithRelations[]).map(mapDbCashbackBalanceToWallet);
  },

  getByStore: async (storeId: string): Promise<Wallet[]> => {
    const { data, error } = await supabase
      .from('cashback_balances')
      .select(`
        *,
        company:companies(*),
        user:profiles(*)
      `)
      .eq('company_id', storeId)
      .order('last_purchase_date', { ascending: false });

    if (error) {
      console.error('Error fetching store wallets:', error);
      throw new Error('Erro ao carregar carteiras do estabelecimento');
    }

    return (data as DbCashbackBalanceWithRelations[]).map(mapDbCashbackBalanceToWallet);
  },

  create: async (data: CreateWalletDTO): Promise<Wallet> => {
    const { data: inserted, error } = await supabase
      .from('cashback_balances')
      .insert({
        user_id: data.userId,
        company_id: data.storeId,
        current_balance: data.balance || 0,
        last_purchase_date: new Date().toISOString(),
      })
      .select(`
        *,
        company:companies(*),
        user:profiles(*)
      `)
      .single();

    if (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Erro ao criar carteira');
    }

    return mapDbCashbackBalanceToWallet(inserted as DbCashbackBalanceWithRelations);
  },

  update: async (id: string, data: UpdateWalletDTO): Promise<Wallet> => {
    const updateData: Record<string, unknown> = {};

    if (data.balance !== undefined) updateData.current_balance = data.balance;
    // Update last_purchase_date if balance changes (indicates activity)
    if (data.balance !== undefined) updateData.last_purchase_date = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('cashback_balances')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        company:companies(*),
        user:profiles(*)
      `)
      .single();

    if (error) {
      console.error('Error updating wallet:', error);
      throw new Error('Erro ao atualizar carteira');
    }

    return mapDbCashbackBalanceToWallet(updated as DbCashbackBalanceWithRelations);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('cashback_balances')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting wallet:', error);
      throw new Error('Erro ao excluir carteira');
    }
  },
};
