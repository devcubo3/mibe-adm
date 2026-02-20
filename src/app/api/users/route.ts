import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        // 1. Fetch all profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return NextResponse.json(
                { error: 'Erro ao carregar usuários' },
                { status: 500 }
            );
        }

        // 2. Fetch all auth users to get emails
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

        if (authError) {
            console.error('Error fetching auth users:', authError);
            // Return profiles without emails as fallback
            return NextResponse.json(profiles);
        }

        // 3. Create a map: userId -> email
        const emailMap = new Map<string, string>();
        for (const authUser of authData.users) {
            if (authUser.email) {
                emailMap.set(authUser.id, authUser.email);
            }
        }

        // 4. Merge emails into profiles
        const profilesWithEmail = profiles.map((profile: Record<string, unknown>) => ({
            ...profile,
            email: emailMap.get(profile.id as string) || '',
        }));

        return NextResponse.json(profilesWithEmail);
    } catch (error) {
        console.error('Error in /api/users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
