import { User } from '@/types';
import { DbProfile } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

/**
 * Maps a Supabase profile to the frontend User type
 */
function mapDbProfileToUser(profile: DbProfile): User {
  return {
    id: profile.id,
    name: profile.full_name,
    email: '', // Email is in auth.users, not profiles
    cpf: profile.cpf,
    birthDate: profile.birth_date || '',
    phone: profile.phone || '',
    avatar: '', // Not in current DB schema
    role: profile.role === 'super_admin' ? 'admin' :
      profile.role === 'company_owner' ? 'store_owner' : 'user',
    createdAt: profile.created_at,
    updatedAt: profile.created_at,
  };
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Erro ao carregar usuários');
    }

    return (data as DbProfile[]).map(mapDbProfileToUser);
  },

  getById: async (id: string): Promise<User> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      throw new Error('Usuário não encontrado');
    }

    return mapDbProfileToUser(data as DbProfile);
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const updateData: Record<string, unknown> = {};

    if (userData.name !== undefined) updateData.full_name = userData.name;
    if (userData.cpf !== undefined) updateData.cpf = userData.cpf;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.birthDate !== undefined) updateData.birth_date = userData.birthDate;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error('Erro ao atualizar usuário');
    }

    return mapDbProfileToUser(data as DbProfile);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error('Erro ao excluir usuário');
    }
  },

  /**
   * Get users by role (useful for filtering clients vs owners)
   */
  getByRole: async (role: 'client' | 'company_owner' | 'super_admin'): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Erro ao carregar usuários');
    }

    return (data as DbProfile[]).map(mapDbProfileToUser);
  },
};
