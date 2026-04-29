import { CompanyUser, CreateCompanyUserDTO, UpdateCompanyUserDTO } from '@/types';

const API_BASE = '/api/company-users';

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Erro na requisição');
    }
    return res.json() as Promise<T>;
}

export const companyUserService = {
    getByCompany: async (companyId: string): Promise<CompanyUser[]> => {
        const res = await fetch(`${API_BASE}?companyId=${encodeURIComponent(companyId)}`, { cache: 'no-store' });
        return handleResponse<CompanyUser[]>(res);
    },

    create: async (dto: CreateCompanyUserDTO): Promise<CompanyUser> => {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto),
        });
        return handleResponse<CompanyUser>(res);
    },

    update: async (id: string, dto: UpdateCompanyUserDTO): Promise<CompanyUser> => {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto),
        });
        return handleResponse<CompanyUser>(res);
    },

    toggleActive: async (id: string, isActive: boolean): Promise<CompanyUser> => {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive }),
        });
        return handleResponse<CompanyUser>(res);
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.error || 'Erro ao excluir usuário');
        }
    },
};
