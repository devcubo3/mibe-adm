export interface Wallet {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  balance: number;
  expiresAt: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletDTO {
  userId: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  balance?: number;
  expiresAt: string;
  category: string;
}

export interface UpdateWalletDTO {
  balance?: number;
  expiresAt?: string;
}
