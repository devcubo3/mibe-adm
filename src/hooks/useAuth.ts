'use client';

import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services';
import { LoginCredentials } from '@/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, logout: clearStore } = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user } = await authService.login(credentials);
      setUser(user);
      toast.success('Login realizado com sucesso!');
      router.push('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      clearStore();
      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
