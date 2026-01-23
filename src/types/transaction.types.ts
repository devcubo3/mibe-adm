export interface Transaction {
  id: string;
  userId: string;
  storeId: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
}

export interface CreateTransactionDTO {
  userId: string;
  storeId: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
}

export interface Activity {
  id: string;
  storeName: string;
  storeLogo: string;
  type: 'received' | 'redeemed';
  amount: number;
  description: string;
  date: string;
}
