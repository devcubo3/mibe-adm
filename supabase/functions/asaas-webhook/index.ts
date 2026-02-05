import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Asaas Webhook para Ativação de Assinaturas (Versão Refinada)
 * Localização: Supabase Edge Function 'asaas-webhook'
 */

interface AsaasPayment {
    id: string;
    customer: string;
    value: number;
    netValue: number;
    billingType: string;
    status: string;
    externalReference?: string;
    confirmedDate?: string;
    paymentDate?: string;
    dueDate?: string;
    metadata?: Record<string, any>;
}

interface AsaasWebhookPayload {
    event: string;
    payment: AsaasPayment;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const payload: AsaasWebhookPayload = await req.json();
        const { event, payment } = payload;

        console.log(`Evento: ${event} | Pagamento: ${payment.id}`);

        // Processa eventos de confirmação de pagamento
        if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
            await handlePaymentReceived(payment);
        } else if (event === "PAYMENT_OVERDUE") {
            await handlePaymentOverdue(payment);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Erro processando webhook:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});

/**
 * Extrai IDs do externalReference (formato: company_{ID}_plan_{ID})
 */
function extractIdentification(payment: AsaasPayment) {
    // Verifica tanto externalReference quanto metadata
    const ref = payment.externalReference || payment.metadata?.externalReference;
    if (!ref) return null;

    const match = ref.match(/company_([\w-]+)_plan_([\w-]+)/);
    if (!match) return null;

    return {
        companyId: match[1],
        planId: match[2]
    };
}

async function handlePaymentReceived(payment: AsaasPayment) {
    const ids = extractIdentification(payment);

    if (!ids) {
        console.error(`Não foi possível extrair IDs para o pagamento ${payment.id}.`);
        return;
    }

    const { companyId, planId } = ids;
    console.log(`Identificado: Empresa=${companyId}, Plano=${planId}`);

    // 1. Verificar/Atualizar Assinatura
    const { data: existingSub, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

    if (subError) {
        console.error("Erro ao buscar assinatura:", subError);
        return;
    }

    let subscriptionId: string;

    if (existingSub) {
        subscriptionId = existingSub.id;
        const updates: any = {
            status: "active",
            updated_at: new Date().toISOString(),
        };

        // ATUALIZAÇÃO AUTOMÁTICA DE PLANO
        if (existingSub.plan_id !== planId) {
            console.log(`Atualizando plano da empresa ${companyId}: ${existingSub.plan_id} -> ${planId}`);
            updates.plan_id = planId;
        }

        if (!existingSub.started_at) {
            updates.started_at = new Date().toISOString();
        }

        await supabase.from("subscriptions").update(updates).eq("id", subscriptionId);
    } else {
        // Criar nova se não existir
        const { data: newSub, error: insertError } = await supabase
            .from("subscriptions")
            .insert({
                company_id: companyId,
                plan_id: planId,
                status: "active",
                started_at: new Date().toISOString(),
            })
            .select("id")
            .single();

        if (insertError) {
            console.error("Erro ao criar assinatura:", insertError);
            return;
        }
        subscriptionId = newSub.id;
    }

    // 2. Registrar no Histórico de Pagamentos
    await supabase.from("payment_history").insert({
        subscription_id: subscriptionId,
        amount: payment.value,
        base_amount: payment.value, // Obrigatório em alguns esquemas
        excess_amount: 0,
        status: "paid",
        payment_date: new Date().toISOString(),
        due_date: payment.dueDate || new Date().toISOString().split("T")[0],
        gateway_reference: payment.id,
    });
}

async function handlePaymentOverdue(payment: AsaasPayment) {
    const ids = extractIdentification(payment);
    const companyId = ids?.companyId;

    if (!companyId) return;

    await supabase
        .from("subscriptions")
        .update({
            status: "overdue",
            updated_at: new Date().toISOString(),
        })
        .eq("company_id", companyId);
}
