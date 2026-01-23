import { supabase } from '@/lib/supabase';

export interface Category {
    id: number;
    name: string;
    icon_url: string | null;
}

export interface CategoryOption {
    value: string;
    label: string;
}

export const categoryService = {
    /**
     * Get all categories from the database
     */
    getAll: async (): Promise<Category[]> => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Erro ao carregar categorias');
        }

        return data as Category[];
    },

    /**
     * Get categories formatted as options for select inputs
     */
    getAsOptions: async (): Promise<CategoryOption[]> => {
        const categories = await categoryService.getAll();
        return categories.map((cat) => ({
            value: cat.name.toLowerCase(),
            label: cat.name,
        }));
    },
};
