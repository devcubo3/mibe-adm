import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';

// Mock user for development
const MOCK_USER: User = {
  id: '1',
  name: 'Admin MIBE',
  email: 'admin@mibe.com',
  cpf: '123.456.789-00',
  birthDate: '1990-01-01',
  phone: '(11) 99999-9999',
  avatar: 'https://ui-avatars.com/api/?name=Admin+MIBE&background=181818&color=fff',
  role: 'admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_TOKEN = 'mock-jwt-token-12345';

// Simula delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(800); // Simula latência de rede

    // Mock: aceita qualquer senha para o email admin@mibe.com
    if (credentials.email === 'admin@mibe.com') {
      return {
        user: MOCK_USER,
        token: MOCK_TOKEN,
      };
    }

    // Simula erro de login
    throw new Error('Credenciais inválidas');
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    await delay(800);

    // Mock: cria um novo usuário
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      birthDate: data.birthDate,
      phone: data.phone,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.name
      )}&background=181818&color=fff`,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user: newUser,
      token: MOCK_TOKEN,
    };
  },

  logout: async (): Promise<void> => {
    await delay(300);
    // Mock: apenas simula logout
  },

  getMe: async (): Promise<User> => {
    await delay(500);
    return MOCK_USER;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    await delay(300);
    return { token: MOCK_TOKEN };
  },
};

// Para usar API real no futuro, descomente o código abaixo e comente o código mock acima:
/*
import api from './api';
import { API_ENDPOINTS } from '@/constants/api';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH_REGISTER, data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH_LOGOUT);
  },

  getMe: async (): Promise<User> => {
    const response = await api.get(API_ENDPOINTS.AUTH_ME);
    return response.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post(API_ENDPOINTS.AUTH_REFRESH);
    return response.data;
  },
};
*/
