export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'store_owner';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
