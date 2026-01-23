import { Transaction, CreateTransactionDTO } from '@/types';
import { DbTransactionWithRelations } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

/**
 * Maps a Supabase transaction to the frontend Transaction type
 */
function mapDbTransactionToTransaction(tx: DbTransactionWithRelations): Transaction {
  // Determine transaction type based on cashback flow
  const type: 'credit' | 'debit' = tx.cashback_earned > 0 ? 'credit' : 'debit';

  return {
    id: tx.id,
    userId: tx.user_id || '',
    storeId: tx.company_id || '',
    walletId: '', // Not directly mapped - would need cashback_balances
    type,
    amount: type === 'credit' ? Number(tx.cashback_earned) : Number(tx.cashback_redeemed),
    description: type === 'credit'
      ? `Compra de R$ ${Number(tx.total_amount).toFixed(2)} - Cashback acumulado`
      : `Resgate de cashback`,
    createdAt: tx.created_at,
    // Additional fields from Supabase (can be used in UI)
    totalAmount: Number(tx.total_amount),
    cashbackRedeemed: Number(tx.cashback_redeemed),
    netAmountPaid: Number(tx.net_amount_paid),
    cashbackEarned: Number(tx.cashback_earned),
    adminFeeAmount: Number(tx.admin_fee_amount) || 0,
    userName: tx.user?.full_name,
    storeName: tx.company?.business_name,
  };
}

// Extend Transaction type for additional Supabase fields
declare module '@/types' {
  interface Transaction {
    totalAmount?: number;
    cashbackRedeemed?: number;
    netAmountPaid?: number;
    cashbackEarned?: number;
    adminFeeAmount?: number;
    userName?: string;
    storeName?: string;
  }
}

export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user:profiles(*),
        company:companies(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Erro ao carregar transações');
    }

    return (data as DbTransactionWithRelations[]).map(mapDbTransactionToTransaction);
  },

  getById: async (id: string): Promise<Transaction> => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user:profiles(*),
        company:companies(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching transaction:', error);
      throw new Error('Transação não encontrada');
    }

    return mapDbTransactionToTransaction(data as DbTransactionWithRelations);
  },

  getByUser: async (userId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user:profiles(*),
        company:companies(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user transactions:', error);
      throw new Error('Erro ao carregar transações do usuário');
    }

    return (data as DbTransactionWithRelations[]).map(mapDbTransactionToTransaction);
  },

  getByStore: async (storeId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user:profiles(*),
        company:companies(*)
      `)
      .eq('company_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching store transactions:', error);
      throw new Error('Erro ao carregar transações do estabelecimento');
    }

    return (data as DbTransactionWithRelations[]).map(mapDbTransactionToTransaction);
  },

  getByWallet: async (walletId: string): Promise<Transaction[]> => {
    // Note: The current DB schema doesn't have a direct wallet_id on transactions
    // This would require joining with cashback_balances or restructuring
    console.warn('getByWallet: Not fully implemented - needs cashback_balances relation');
    return [];
  },

  create: async (data: CreateTransactionDTO): Promise<Transaction> => {
    // Map frontend DTO to database columns
    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert({
        user_id: data.userId,
        company_id: data.storeId,
        total_amount: data.amount,
        cashback_redeemed: data.type === 'debit' ? data.amount : 0,
        net_amount_paid: data.type === 'credit' ? data.amount : 0,
        cashback_earned: data.type === 'credit' ? data.amount : 0,
      })
      .select(`
        *,
        user:profiles(*),
        company:companies(*)
      `)
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Erro ao criar transação');
    }

    return mapDbTransactionToTransaction(inserted as DbTransactionWithRelations);
  },
};
