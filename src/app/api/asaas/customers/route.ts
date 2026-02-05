import { NextRequest, NextResponse } from 'next/server';

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
    externalReference: string;
}

interface AsaasApiError {
    errors: Array<{
        code: string;
        description: string;
    }>;
}

// API Configuration - these are server-side only
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || 'https://api-sandbox.asaas.com/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

export async function POST(request: NextRequest) {
    try {
        // Defensive code: ensure API key starts with $ if it's an aact_ key
        let finalApiKey = ASAAS_API_KEY;
        if (finalApiKey && !finalApiKey.startsWith('$') && finalApiKey.startsWith('aact_')) {
            finalApiKey = `$${finalApiKey}`;
        }

        // Check if API key is configured
        if (!finalApiKey) {
            console.error('ASAAS_API_KEY not configured');
            return NextResponse.json(
                { error: 'Asaas API key not configured' },
                { status: 500 }
            );
        }

        // Parse request body
        const data: CreateAsaasCustomerDTO = await request.json();

        // Validate required fields
        if (!data.name || !data.cpfCnpj || !data.externalReference) {
            return NextResponse.json(
                { error: 'Missing required fields: name, cpfCnpj, externalReference' },
                { status: 400 }
            );
        }

        // Create customer in Asaas
        const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': finalApiKey,
            },
            body: JSON.stringify({
                name: data.name,
                cpfCnpj: data.cpfCnpj.replace(/\D/g, ''), // Remove formatting
                email: data.email || undefined,
                phone: data.phone?.replace(/\D/g, '') || undefined,
                address: data.address || undefined,
                externalReference: data.externalReference,
            }),
        });

        if (!response.ok) {
            const errorData: AsaasApiError = await response.json();
            console.error('Asaas API Error:', errorData);
            const errorMessage = errorData.errors?.[0]?.description || 'Erro ao criar cliente no Asaas';
            return NextResponse.json({ error: errorMessage }, { status: response.status });
        }

        const customer: AsaasCustomer = await response.json();
        console.log('Asaas customer created:', customer.id);

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error('Error creating Asaas customer:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
