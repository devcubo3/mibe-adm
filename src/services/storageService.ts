import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'store-assets';

/**
 * Sanitiza o nome do arquivo removendo caracteres especiais e espaços
 * O Supabase Storage não aceita caracteres especiais nas chaves
 */
const sanitizeFileName = (fileName: string): string => {
    return fileName
        .normalize('NFD') // Decompõe caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove marcas de acentuação
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais por underscore
        .replace(/_+/g, '_') // Remove underscores duplicados
        .replace(/^_|_$/g, ''); // Remove underscores no início/fim
};

/**
 * Sanitiza o path completo, preservando a estrutura de diretórios
 */
const sanitizePath = (path: string): string => {
    const parts = path.split('/');
    const fileName = parts.pop() || '';
    const sanitizedFileName = sanitizeFileName(fileName);
    return [...parts, sanitizedFileName].join('/');
};

export const storageService = {
    /**
     * Upload a file to Supabase Storage
     * @param file The file object to upload
     * @param path The path within the bucket (e.g., 'logos/filename.png')
     * @returns The public URL of the uploaded file
     */
    uploadFile: async (file: File, path: string): Promise<string> => {
        const safePath = sanitizePath(path);

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(safePath, file, {
                upsert: true,
                cacheControl: '3600',
            });

        if (error) {
            console.error('Error uploading file:', error);
            throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        return publicUrl;
    },

    /**
     * Delete a file from Supabase Storage
     * @param path The path within the bucket
     */
    deleteFile: async (path: string): Promise<void> => {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([path]);

        if (error) {
            console.error('Error deleting file:', error);
            throw new Error('Erro ao excluir imagem do armazenamento');
        }
    },

    /**
     * Extract the storage path from a public URL
     * Useful for deleting files when you only have the URL
     * @param url The public URL
     * @returns The path within the bucket
     */
    getPathFromUrl: (url: string): string | null => {
        if (!url.includes(BUCKET_NAME)) return null;
        const parts = url.split(`${BUCKET_NAME}/`);
        return parts.length > 1 ? parts[1] : null;
    }
};
