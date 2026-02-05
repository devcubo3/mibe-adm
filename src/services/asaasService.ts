/**
 * Asaas API Service
 * Integração com gateway de pagamentos Asaas via API Route (server-side)
 * 
 * NOTA: As chamadas à API do Asaas são feitas via API Routes do Next.js
 * para garantir que as credenciais fiquem seguras no servidor.
 */

// Asaas Customer Interface
interface AsaasCustomer {
    id: string;
    name: string;
    cpfCnpj: string;
    email?: string;
    phone?: string;
    address?: string;
    externalReference?: string;
}

interface CreateAsaasCustomerDTO {
    name: string;
    cpfCnpj: string;
    email?: string;
    phone?: string;
    address?: string;
    externalReference: string; // company_id do MIBE
}

export const asaasService = {
    /**
     * Cria um cliente no Asaas via API Route (server-side)
     * Chamado ao criar um novo estabelecimento no MIBE
     */
    createCustomer: async (data: CreateAsaasCustomerDTO): Promise<AsaasCustomer> => {
        try {
            const response = await fetch('/api/asaas/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    cpfCnpj: data.cpfCnpj,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    externalReference: data.externalReference,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Asaas API Error:', errorData);
                throw new Error(errorData.error || 'Erro ao criar cliente no Asaas');
            }

            const customer: AsaasCustomer = await response.json();
            console.log('Asaas customer created:', customer.id);
            return customer;
        } catch (error) {
            console.error('Error creating Asaas customer:', error);
            throw error;
        }
    },

    /**
     * Busca um cliente no Asaas pelo externalReference (company_id)
     * TODO: Implementar via API Route se necessário
     */
    getCustomerByReference: async (externalReference: string): Promise<AsaasCustomer | null> => {
        console.log('getCustomerByReference not implemented for client-side', externalReference);
        return null;
    },

    /**
     * Busca um cliente no Asaas pelo ID
     * TODO: Implementar via API Route se necessário
     */
    getCustomerById: async (customerId: string): Promise<AsaasCustomer | null> => {
        console.log('getCustomerById not implemented for client-side', customerId);
        return null;
    },

    /**
     * Atualiza um cliente no Asaas
     * TODO: Implementar via API Route se necessário
     */
    updateCustomer: async (customerId: string, data: Partial<CreateAsaasCustomerDTO>): Promise<AsaasCustomer | null> => {
        console.log('updateCustomer not implemented for client-side', customerId, data);
        return null;
    },
};
