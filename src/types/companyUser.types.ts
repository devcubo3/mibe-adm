export interface CompanyUser {
    id: string;
    companyId: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCompanyUserDTO {
    companyId: string;
    name: string;
    email: string;
    password: string;
}

export interface UpdateCompanyUserDTO {
    name?: string;
    email?: string;
    password?: string;
    isActive?: boolean;
}

// Database types for mapping
export interface DbCompanyUser {
    id: string;
    company_id: string;
    name: string;
    email: string;
    password_hash: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
