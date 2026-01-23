import { supabase } from '@/lib/supabase';

// Dashboard statistics
export interface DashboardStats {
  totalStores: number;
  totalUsers: number;
  totalTransactions: number;
  totalCashbackGenerated: number;
  totalCashbackRedeemed: number;
  recentActivity: Array<{
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    storeName: string;
    userName: string;
    date: string;
  }>;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    // Fetch counts in parallel
    const [storesResult, usersResult, transactionsResult, recentResult] = await Promise.all([
      // Count companies
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      // Count users (clients only)
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
      // Sum transactions
      supabase.from('transactions').select('cashback_earned, cashback_redeemed'),
      // Recent transactions with relations
      supabase
        .from('transactions')
        .select(`
          id,
          cashback_earned,
          cashback_redeemed,
          created_at,
          user:profiles(full_name),
          company:companies(business_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Calculate totals from transactions
    let totalCashbackGenerated = 0;
    let totalCashbackRedeemed = 0;

    if (transactionsResult.data) {
      for (const tx of transactionsResult.data) {
        totalCashbackGenerated += Number(tx.cashback_earned) || 0;
        totalCashbackRedeemed += Number(tx.cashback_redeemed) || 0;
      }
    }

    // Map recent activity
    const recentActivity = (recentResult.data || []).map((tx) => {
      // Supabase returns relations as arrays or objects depending on the relationship
      const user = Array.isArray(tx.user) ? tx.user[0] : tx.user;
      const company = Array.isArray(tx.company) ? tx.company[0] : tx.company;
      const isCredit = Number(tx.cashback_earned) > 0;
      return {
        id: tx.id,
        type: isCredit ? 'credit' as const : 'debit' as const,
        amount: isCredit ? Number(tx.cashback_earned) : Number(tx.cashback_redeemed),
        storeName: company?.business_name || 'Estabelecimento',
        userName: user?.full_name || 'Usuário',
        date: tx.created_at,
      };
    });

    return {
      totalStores: storesResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalTransactions: transactionsResult.data?.length || 0,
      totalCashbackGenerated,
      totalCashbackRedeemed,
      recentActivity,
    };
  },
};
