import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

    if (error) return NextResponse.json({ error: 'Erro ao carregar usuário' }, { status: 500 });
    if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(params.id);

    return NextResponse.json({
        ...profile,
        email: authData?.user?.email ?? '',
    });
}
