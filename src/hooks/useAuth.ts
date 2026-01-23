'use client';

import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services';
import { LoginCredentials, RegisterData } from '@/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, login: setLogin, logout: setLogout } = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setLogin(response.user, response.token);

      if (typeof window !== 'undefined') {
        // Save to localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Save to cookies for middleware
        document.cookie = `token=${response.token}; path=/; max-age=86400`; // 24 hours
      }

      toast.success('Login realizado com sucesso!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setLogin(response.user, response.token);

      if (typeof window !== 'undefined') {
        // Save to localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Save to cookies for middleware
        document.cookie = `token=${response.token}; path=/; max-age=86400`; // 24 hours
      }

      toast.success('Cadastro realizado com sucesso!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer cadastro');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLogout();

      if (typeof window !== 'undefined') {
        // Remove from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Remove cookie
        document.cookie = 'token=; path=/; max-age=0';
      }

      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
