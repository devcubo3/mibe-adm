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

// PATCH /api/company-users/[id] — atualiza nome/email/senha/ativo
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

    const { id } = await params;
    const body = await request.json().catch(() => null) as
        | { name?: string; email?: string; password?: string; isActive?: boolean }
        | null;

    if (!body) return NextResponse.json({ error: 'Body inválido' }, { status: 400 });

    const { data: { user: currentAuthUser } } = await supabaseAdmin.auth.admin.getUserById(id);

    const authUpdates: { email?: string; password?: string } = {};
    if (body.email && body.email !== currentAuthUser?.email) {
        authUpdates.email = body.email;
    }
    if (body.password) {
        if (body.password.length < 6) {
            return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 });
        }
        authUpdates.password = body.password;
    }

    if (Object.keys(authUpdates).length > 0) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
        if (error) {
            const isDup = error.message?.toLowerCase().includes('already');
            return NextResponse.json(
                { error: isDup ? 'Já existe um usuário com este email' : error.message },
                { status: isDup ? 409 : 500 },
            );
        }
    }

    const profileUpdates: { full_name?: string; is_active?: boolean } = {};
    if (body.name !== undefined) profileUpdates.full_name = body.name;
    if (body.isActive !== undefined) profileUpdates.is_active = body.isActive;

    if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update(profileUpdates)
            .eq('id', id);
        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
        }
    }

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, company_id, is_active, created_at')
        .eq('id', id)
        .single();

    const finalEmail = authUpdates.email ?? currentAuthUser?.email ?? '';

    return NextResponse.json({
        id: profile?.id,
        companyId: profile?.company_id,
        name: profile?.full_name,
        email: finalEmail,
        isActive: profile?.is_active,
        createdAt: profile?.created_at,
    });
}

// DELETE /api/company-users/[id] — remove usuário (auth + profile via cascade)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

    const { id } = await params;
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
