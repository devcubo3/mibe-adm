import { createClient } from '@/lib/supabase/client';
import { LoginCredentials, User } from '@/types';
import { DbProfile } from '@/types/database.types';

function mapProfileToUser(profile: DbProfile, email: string): User {
  return {
    id: profile.id,
    name: profile.full_name,
    email,
    cpf: profile.cpf,
    birthDate: profile.birth_date || '',
    phone: profile.phone || '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=181818&color=fff`,
    role: profile.role === 'super_admin' ? 'admin' :
      profile.role === 'company_owner' ? 'store_owner' : 'user',
    createdAt: profile.created_at,
    updatedAt: profile.created_at,
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User }> => {
    const supabase = createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

    if (authError) {
      throw new Error('Credenciais inválidas');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      throw new Error('Perfil não encontrado');
    }

    if ((profile as DbProfile).role !== 'super_admin') {
      await supabase.auth.signOut();
      throw new Error('Acesso negado. Apenas administradores podem acessar este painel.');
    }

    return {
      user: mapProfileToUser(profile as DbProfile, authData.user.email!),
    };
  },

  logout: async (): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const supabase = createClient();

    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile || (profile as DbProfile).role !== 'super_admin') return null;

    return mapProfileToUser(profile as DbProfile, authUser.email!);
  },
};
