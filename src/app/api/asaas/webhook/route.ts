import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Interface do Evento de Webhook do Asaas
interface AsaasWebhookEvent {
    event: string;
    payment: {
        id: string;
        customer: string;
        value: number;
        netValue: number;
        description?: string;
        externalReference?: string;
        billingType: string;
        status: string;
        invoiceUrl?: string;
        metadata?: Record<string, any>;
    };
}

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Nota: O uso da Service Role Key é recomendado para webhooks para ignorar RLS
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: NextRequest) {
    let companyId: string | undefined;
    let planId: string | undefined;
    let subscriptionId: string | undefined;

    try {
        const body: AsaasWebhookEvent = await request.json();
        const { event, payment } = body;

        // 1. Processar corpo da requisição
        console.log(`Evento de webhook do Asaas recebido: ${event} para o pagamento ${payment.id}`);

        // 2. Lidar com eventos relevantes
        if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
            // Verificar ambos os locais para encontrar o externalReference
            const externalRef = payment.externalReference || payment.metadata?.externalReference;

            console.log(`Processando identificação. Fonte do externalReference: ${payment.externalReference ? 'nível superior' : (payment.metadata?.externalReference ? 'metadados' : 'nenhuma')}`);
            console.log(`Value: ${externalRef}`);

            if (!externalRef) {
                console.error('externalReference ausente no pagamento (nível superior e metadados verificados)');
                console.log('Objeto de pagamento:', JSON.stringify(payment, null, 2));
                return NextResponse.json({ error: 'externalReference ausente' }, { status: 400 });
            }

            // Regex para extrair IDs: company_{ID}_plan_{ID}
            // Suporta UUIDs (36 caracteres) ou outros IDs alfanuméricos
            const match = externalRef.match(/company_([\w-]+)_plan_([\w-]+)/);

            if (!match) {
                console.error(`Formato de externalReference inválido: ${externalRef}`);
                return NextResponse.json(
                    { error: 'Formato de externalReference inválido. Esperado: company_{ID}_plan_{ID}' },
                    { status: 400 }
                );
            }

            companyId = match[1];
            planId = match[2];

            console.log(`Identificação extraída com sucesso: companyId=${companyId}, planId=${planId}`);

            // 4. Inserir/Atualizar Assinatura
            const { data: existingSub, error: subFetchError } = await supabase
                .from('subscriptions')
                .select('id, status, started_at, plan_id')
                .eq('company_id', companyId)
                .maybeSingle();

            if (subFetchError) {
                console.error('Erro ao buscar assinatura existente:', subFetchError);
                return NextResponse.json({ error: 'Erro no banco de dados' }, { status: 500 });
            }

            subscriptionId = existingSub?.id;

            if (existingSub) {
                // Atualizar existente
                const updates: any = {
                    status: 'active',
                    updated_at: new Date().toISOString()
                };

                // Atualização Automática de Plano se for diferente
                if (existingSub.plan_id !== planId) {
                    console.log(`Atualizando plano de ${existingSub.plan_id} para ${planId}`);
                    updates.plan_id = planId;
                }

                // Definir started_at apenas se ainda não estiver definido
                if (!existingSub.started_at) {
                    updates.started_at = new Date().toISOString();
                }

                const { error: updateError } = await supabase
                    .from('subscriptions')
                    .update(updates)
                    .eq('id', existingSub.id);

                if (updateError) {
                    console.error('Erro ao atualizar assinatura:', updateError);
                    return NextResponse.json({ error: 'Erro na atualização' }, { status: 500 });
                }
            } else {
                // Criar nova
                const { data: newSub, error: insertError } = await supabase
                    .from('subscriptions')
                    .insert({
                        company_id: companyId,
                        plan_id: planId,
                        status: 'active',
                        started_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    console.error('Erro ao criar assinatura:', insertError);
                    return NextResponse.json({ error: 'Erro na inserção' }, { status: 500 });
                }
                subscriptionId = newSub.id;
            }

            // 5. Registrar Histórico de Pagamento
            if (subscriptionId) {
                const { error: historyError } = await supabase
                    .from('payment_history')
                    .insert({
                        subscription_id: subscriptionId,
                        amount: payment.value,
                        base_amount: payment.value,
                        excess_amount: 0,
                        status: 'paid',
                        payment_date: new Date().toISOString(),
                        gateway_reference: payment.id,
                        due_date: new Date().toISOString()
                    });

                if (historyError) {
                    console.error('Erro ao registrar histórico de pagamento:', historyError);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Erro ao processar webhook do Asaas:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
