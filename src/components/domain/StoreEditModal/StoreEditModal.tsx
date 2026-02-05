'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, SelectInput, ImageUpload } from '@/components/common';
import { Store, UpdateStoreDTO } from '@/types';
import { formatCNPJ, formatCPF, formatPhone } from '@/utils/formatters';
import { categoryService, CategoryOption } from '@/services/categoryService';
import { storageService } from '@/services/storageService';
import styles from './StoreEditModal.module.css';

interface StoreEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: string, data: UpdateStoreDTO) => Promise<void>;
    store: Store | null;
}

interface FormData {
    name: string;
    cnpj: string;
    address: string;
    contact: string;
    logo: string;
    coverImage: string;
    category: string;
    description: string;
    cashbackPercentage: string;
    cashbackDescription: string;
    cashbackDays: string;
    minPurchase: string;
    rulesDescription: string;
    email: string;
}

interface FormErrors {
    [key: string]: string;
}

const initialFormData: FormData = {
    name: '',
    cnpj: '',
    address: '',
    contact: '',
    logo: '',
    coverImage: '',
    category: '',
    description: '',
    cashbackPercentage: '',
    cashbackDescription: '',
    cashbackDays: '',
    minPurchase: '',
    rulesDescription: '',
    email: '',
};

const StoreEditModal: React.FC<StoreEditModalProps> = ({ isOpen, onClose, onSubmit, store }) => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    // Load categories from database
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const options = await categoryService.getAsOptions();
                setCategories(options);
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };
        loadCategories();
    }, []);

    // Preencher o formulário com os dados do store quando ele mudar
    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name || '',
                cnpj: store.cnpj || '',
                address: store.address || '',
                contact: store.contact || '',
                logo: store.logo || '',
                coverImage: store.coverImage || '',
                category: store.category?.toLowerCase() || '',
                description: store.description || '',
                cashbackPercentage: store.cashback?.percentage?.toString() || '',
                cashbackDescription: store.cashback?.description || '',
                cashbackDays: store.rules?.expirationDays?.toString() || '',
                minPurchase: store.rules?.minPurchase?.toString() || '',
                rulesDescription: store.rules?.description || '',
                email: store.email || '',
            });
            // Reset files when store changes
            setLogoFile(null);
            setCoverFile(null);
        }
    }, [store]);

    const handleChange = (field: keyof FormData) => (value: string) => {
        let formattedValue = value;

        // Apply formatting based on field
        if (field === 'cnpj') {
            formattedValue = formatCNPJ(value);
        } else if (field === 'contact') {
            formattedValue = formatPhone(value);
        }

        setFormData((prev) => ({ ...prev, [field]: formattedValue }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        // Campos obrigatórios: nome, email
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validação do percentual de cashback apenas se preenchido
        if (formData.cashbackPercentage.trim()) {
            const percentage = parseFloat(formData.cashbackPercentage);
            if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                newErrors.cashbackPercentage = 'Valor deve ser entre 0 e 100';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || !store) return;

        setLoading(true);
        try {
            let logoUrl = formData.logo;
            let coverUrl = formData.coverImage;

            // Upload logo if new file selected
            if (logoFile) {
                const fileName = `logos/${Date.now()}-${logoFile.name}`;
                logoUrl = await storageService.uploadFile(logoFile, fileName);

                // Optional: Delete old logo from storage if it was a storage URL
                if (store.logo && store.logo.includes('supabase.co')) {
                    const oldPath = storageService.getPathFromUrl(store.logo);
                    if (oldPath) await storageService.deleteFile(oldPath).catch(console.error);
                }
            } else if (!formData.logo && store.logo) {
                // If logo was cleared
                logoUrl = '/placeholder-logo.jpg';
                if (store.logo.includes('supabase.co')) {
                    const oldPath = storageService.getPathFromUrl(store.logo);
                    if (oldPath) await storageService.deleteFile(oldPath).catch(console.error);
                }
            }

            // Upload cover if new file selected
            if (coverFile) {
                const fileName = `covers/${Date.now()}-${coverFile.name}`;
                coverUrl = await storageService.uploadFile(coverFile, fileName);

                // Optional: Delete old cover from storage if it was a storage URL
                if (store.coverImage && store.coverImage.includes('supabase.co')) {
                    const oldPath = storageService.getPathFromUrl(store.coverImage);
                    if (oldPath) await storageService.deleteFile(oldPath).catch(console.error);
                }
            } else if (!formData.coverImage && store.coverImage) {
                // If cover was cleared
                coverUrl = '/placeholder-cover.jpg';
                if (store.coverImage.includes('supabase.co')) {
                    const oldPath = storageService.getPathFromUrl(store.coverImage);
                    if (oldPath) await storageService.deleteFile(oldPath).catch(console.error);
                }
            }

            const storeData: UpdateStoreDTO = {
                name: formData.name,
                cnpj: formData.cnpj,
                category: formData.category,
                description: formData.description,
                coverImage: coverUrl || '/placeholder-cover.jpg',
                logo: logoUrl || '/placeholder-logo.jpg',
                address: formData.address,
                contact: formData.contact,
                coordinates: store.coordinates, // Manter coordenadas originais
                cashback: {
                    percentage: parseFloat(formData.cashbackPercentage),
                    description: formData.cashbackDescription || `${formData.cashbackPercentage}% de cashback`,
                },
                rules: {
                    expirationDays: formData.cashbackDays ? parseInt(formData.cashbackDays, 10) : 0,
                    minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
                    description: formData.rulesDescription || (formData.cashbackDays
                        ? `Válido por ${formData.cashbackDays} dias`
                        : 'Sem validade'),
                },
                email: formData.email,
            };

            await onSubmit(store.id, storeData);
            setLogoFile(null);
            setCoverFile(null);
            onClose();
        } catch (error) {
            console.error('Error updating store:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Editar Estabelecimento" className={styles.modal}>
            <div className={styles.form}>
                {/* Imagens */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Imagens</h3>
                    <div className={styles.imageRow}>
                        <ImageUpload
                            label="Foto de Perfil"
                            value={formData.logo}
                            onChange={handleChange('logo')}
                            onFileChange={setLogoFile}
                            variant="profile"
                        />
                        <ImageUpload
                            label="Foto de Capa"
                            value={formData.coverImage}
                            onChange={handleChange('coverImage')}
                            onFileChange={setCoverFile}
                            variant="cover"
                            className={styles.coverUpload}
                        />
                    </div>
                </div>

                {/* Dados do Estabelecimento */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Dados do Estabelecimento</h3>
                    <Input
                        label="Nome *"
                        placeholder="Nome do estabelecimento"
                        value={formData.name}
                        onChange={handleChange('name')}
                        error={errors.name}
                    />
                    <Input
                        label="CNPJ"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={handleChange('cnpj')}
                        error={errors.cnpj}
                    />
                    <Input
                        label="Endereço"
                        placeholder="Endereço completo"
                        value={formData.address}
                        onChange={handleChange('address')}
                        error={errors.address}
                    />
                    <Input
                        label="Contato"
                        placeholder="(00) 00000-0000"
                        value={formData.contact}
                        onChange={handleChange('contact')}
                        error={errors.contact}
                    />
                    <SelectInput
                        label="Categoria"
                        placeholder="Selecione uma categoria"
                        value={formData.category}
                        onChange={handleChange('category')}
                        options={categories}
                        error={errors.category}
                    />
                    <Input
                        label="Descrição"
                        placeholder="Descrição do estabelecimento"
                        value={formData.description}
                        onChange={handleChange('description')}
                    />
                </div>

                {/* Cashback */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Cashback</h3>
                    <div className={styles.row}>
                        <Input
                            label="Percentual (%)"
                            placeholder="Ex: 5"
                            value={formData.cashbackPercentage}
                            onChange={handleChange('cashbackPercentage')}
                            type="number"
                            error={errors.cashbackPercentage}
                            className={styles.thirdWidth}
                        />
                        <Input
                            label="Validade (dias)"
                            placeholder="Opcional"
                            value={formData.cashbackDays}
                            onChange={handleChange('cashbackDays')}
                            type="number"
                            error={errors.cashbackDays}
                            className={styles.thirdWidth}
                        />
                        <Input
                            label="Valor Mínimo (R$)"
                            placeholder="Opcional"
                            value={formData.minPurchase}
                            onChange={handleChange('minPurchase')}
                            type="number"
                            error={errors.minPurchase}
                            className={styles.thirdWidth}
                        />
                    </div>
                    <Input
                        label="Descrição do Cashback"
                        placeholder="Descrição do cashback"
                        value={formData.cashbackDescription}
                        onChange={handleChange('cashbackDescription')}
                    />
                    <Input
                        label="Regras"
                        placeholder="Descrição das regras"
                        value={formData.rulesDescription}
                        onChange={handleChange('rulesDescription')}
                    />
                </div>



                {/* Acesso */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Acesso</h3>
                    <Input
                        label="Email *"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={handleChange('email')}
                        type="email"
                        error={errors.email}
                    />
                </div>

                {/* Botões */}
                <div className={styles.actions}>
                    <Button title="Cancelar" variant="secondary" onClick={handleClose} />
                    <Button title="Salvar" onClick={handleSubmit} loading={loading} />
                </div>
            </div>
        </Modal>
    );
};

export default StoreEditModal;
