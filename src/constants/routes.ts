export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Dashboard
  HOME: '/',
  DASHBOARD: '/',

  // Stores
  STORES: '/stores',
  STORES_NEW: '/stores/new',
  STORES_DETAIL: (id: string) => `/stores/${id}`,
  STORES_EDIT: (id: string) => `/stores/${id}/edit`,

  // Wallets (hidden from sidebar, kept for backwards compatibility)
  WALLETS: '/wallets',
  WALLETS_DETAIL: (id: string) => `/wallets/${id}`,

  // Invoices
  INVOICES: '/invoices',
  INVOICES_DETAIL: (companyId: string) => `/invoices/${companyId}`,

  // Users
  USERS: '/users',
  USERS_DETAIL: (id: string) => `/users/${id}`,

  // Transactions
  TRANSACTIONS: '/transactions',

  // Reviews
  REVIEWS: '/reviews',

  // Settings
  SETTINGS: '/settings',
};
