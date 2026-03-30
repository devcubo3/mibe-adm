import { supabaseAdmin } from '@/lib/supabase/admin';
import { DbAppConfig } from '@/types/database.types';

export interface UpdateSupportContactDTO {
    support_whatsapp: string;
    support_email: string;
}

export const appConfigService = {
    async getConfig(): Promise<DbAppConfig> {
        const { data, error } = await supabaseAdmin
            .from('app_configs')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching app config:', error);
            throw new Error('Erro ao carregar configurações');
        }

        return data as DbAppConfig;
    },

    async updateSupportContact(dto: UpdateSupportContactDTO): Promise<DbAppConfig> {
        const { data, error } = await supabaseAdmin
            .from('app_configs')
            .update({
                support_whatsapp: dto.support_whatsapp,
                support_email: dto.support_email,
                updated_at: new Date().toISOString(),
            })
            .eq('id', 1)
            .select()
            .single();

        if (error) {
            console.error('Error updating support contact:', error);
            throw new Error('Erro ao salvar contato de suporte');
        }

        return data as DbAppConfig;
    },
};
