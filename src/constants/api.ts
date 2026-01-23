export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  AUTH_REFRESH: '/auth/refresh',

  // Stores
  STORES: '/stores',
  STORES_BY_ID: (id: string) => `/stores/${id}`,
  STORES_REVIEWS: (id: string) => `/stores/${id}/reviews`,

  // Wallets
  WALLETS: '/wallets',
  WALLETS_BY_ID: (id: string) => `/wallets/${id}`,
  WALLETS_BY_USER: (userId: string) => `/wallets/user/${userId}`,
  WALLETS_BY_STORE: (storeId: string) => `/wallets/store/${storeId}`,

  // Users
  USERS: '/users',
  USERS_BY_ID: (id: string) => `/users/${id}`,

  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTIONS_BY_ID: (id: string) => `/transactions/${id}`,
  TRANSACTIONS_BY_USER: (userId: string) => `/transactions/user/${userId}`,
  TRANSACTIONS_BY_STORE: (storeId: string) => `/transactions/store/${storeId}`,

  // Reviews
  REVIEWS: '/reviews',
  REVIEWS_BY_ID: (id: string) => `/reviews/${id}`,
  REVIEWS_BY_STORE: (storeId: string) => `/reviews/store/${storeId}`,
  REVIEWS_REPLY: (id: string) => `/reviews/${id}/reply`,
};
