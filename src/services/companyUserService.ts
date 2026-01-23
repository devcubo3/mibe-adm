import { CompanyUser, CreateCompanyUserDTO, UpdateCompanyUserDTO, DbCompanyUser } from '@/types';
import { supabase } from '@/lib/supabase';

// Mapper function
const mapDbToCompanyUser = (db: DbCompanyUser): CompanyUser => ({
    id: db.id,
    companyId: db.company_id,
    name: db.name,
    email: db.email,
    isActive: db.is_active,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
});

// Simple hash function for password (in production, use bcrypt via Edge Function)
const simpleHash = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const companyUserService = {
    getByCompany: async (companyId: string): Promise<CompanyUser[]> => {
        const { data, error } = await supabase
            .from('company_users')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching company users:', error);
            throw new Error('Erro ao carregar usuários do estabelecimento');
        }

        return (data as DbCompanyUser[]).map(mapDbToCompanyUser);
    },

    getById: async (id: string): Promise<CompanyUser> => {
        const { data, error } = await supabase
            .from('company_users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching company user:', error);
            throw new Error('Usuário não encontrado');
        }

        return mapDbToCompanyUser(data as DbCompanyUser);
    },

    create: async (dto: CreateCompanyUserDTO): Promise<CompanyUser> => {
        const passwordHash = await simpleHash(dto.password);

        const { data, error } = await supabase
            .from('company_users')
            .insert({
                company_id: dto.companyId,
                name: dto.name,
                email: dto.email,
                password_hash: passwordHash,
            })
            .select('*')
            .single();

        if (error) {
            console.error('Error creating company user:', error);
            if (error.code === '23505') {
                throw new Error('Já existe um usuário com este email neste estabelecimento');
            }
            throw new Error('Erro ao criar usuário');
        }

        return mapDbToCompanyUser(data as DbCompanyUser);
    },

    update: async (id: string, dto: UpdateCompanyUserDTO): Promise<CompanyUser> => {
        const updateData: Record<string, unknown> = {};

        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.email !== undefined) updateData.email = dto.email;
        if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
        if (dto.password) {
            updateData.password_hash = await simpleHash(dto.password);
        }

        const { data, error } = await supabase
            .from('company_users')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error('Error updating company user:', error);
            if (error.code === '23505') {
                throw new Error('Já existe um usuário com este email neste estabelecimento');
            }
            throw new Error('Erro ao atualizar usuário');
        }

        return mapDbToCompanyUser(data as DbCompanyUser);
    },

    toggleActive: async (id: string, isActive: boolean): Promise<CompanyUser> => {
        const { data, error } = await supabase
            .from('company_users')
            .update({ is_active: isActive })
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error('Error toggling company user status:', error);
            throw new Error('Erro ao alterar status do usuário');
        }

        return mapDbToCompanyUser(data as DbCompanyUser);
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('company_users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting company user:', error);
            throw new Error('Erro ao excluir usuário');
        }
    },
};
