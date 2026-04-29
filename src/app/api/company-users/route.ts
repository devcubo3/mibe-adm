import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function requireSuperAdmin() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) return { ok: false as const, status: 401, message: 'Não autenticado' };

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'super_admin') {
        return { ok: false as const, status: 403, message: 'Apenas super_admin' };
    }
    return { ok: true as const };
}

// GET /api/company-users?companyId=X — lista staff de uma empresa
export async function GET(request: NextRequest) {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) {
        return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 });
    }

    const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, company_id, is_active, created_at')
        .eq('company_id', companyId)
        .eq('role', 'company_staff')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error listing company staff:', error);
        return NextResponse.json({ error: 'Erro ao carregar usuários' }, { status: 500 });
    }

    // Buscar emails de auth.users em paralelo (escala com N_staff, não N_total)
    const userResults = await Promise.all(
        profiles.map((p) => supabaseAdmin.auth.admin.getUserById(p.id)),
    );

    const staff = profiles.map((p, idx) => ({
        id: p.id,
        companyId: p.company_id,
        name: p.full_name,
        email: userResults[idx].data?.user?.email || '',
        isActive: p.is_active,
        createdAt: p.created_at,
    }));

    return NextResponse.json(staff);
}

// POST /api/company-users — cria staff via Supabase Auth + profiles
export async function POST(request: NextRequest) {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

    const body = await request.json().catch(() => null) as
        | { companyId?: string; name?: string; email?: string; password?: string }
        | null;

    if (!body?.companyId || !body.name || !body.email || !body.password) {
        return NextResponse.json({ error: 'Campos obrigatórios: companyId, name, email, password' }, { status: 400 });
    }
    if (body.password.length < 6) {
        return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 });
    }

    const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: { full_name: body.name },
    });

    if (authError || !authResult?.user) {
        const isDup = authError?.message?.toLowerCase().includes('already');
        return NextResponse.json(
            { error: isDup ? 'Já existe um usuário com este email' : (authError?.message || 'Erro ao criar usuário') },
            { status: isDup ? 409 : 500 },
        );
    }

    const userId = authResult.user.id;

    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: userId,
            full_name: body.name,
            role: 'company_staff',
            company_id: body.companyId,
            is_active: true,
        })
        .select('id, full_name, company_id, is_active, created_at')
        .single();

    if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.error('Error creating profile:', profileError);
        return NextResponse.json({ error: 'Erro ao criar perfil do usuário' }, { status: 500 });
    }

    return NextResponse.json({
        id: profile.id,
        companyId: profile.company_id,
        name: profile.full_name,
        email: body.email,
        isActive: profile.is_active,
        createdAt: profile.created_at,
    });
}
