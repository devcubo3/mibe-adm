export interface CompanyUser {
    id: string;
    companyId: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
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
