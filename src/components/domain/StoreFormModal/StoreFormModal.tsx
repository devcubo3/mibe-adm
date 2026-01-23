'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, SelectInput, ImageUpload } from '@/components/common';
import { CreateStoreDTO } from '@/types';
import { formatCNPJ, formatCPF, formatPhone } from '@/utils/formatters';
import { categoryService, CategoryOption } from '@/services/categoryService';
import styles from './StoreFormModal.module.css';

interface StoreFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateStoreDTO) => Promise<void>;
}

interface FormData {
    name: string;
    cnpj: string;
    address: string;
    contact: string;
    logo: string;
    coverImage: string;
    category: string;
    cashbackPercentage: string;
    cashbackDays: string;
    minPurchase: string;
    email: string;
    password: string;
    confirmPassword: string;
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
    cashbackPercentage: '',
    cashbackDays: '',
    minPurchase: '',
    email: '',
    password: '',
    confirmPassword: '',
};

const StoreFormModal: React.FC<StoreFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
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

        // Campos obrigatórios: nome, email, senha e confirmação
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        if (!formData.password.trim()) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
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
        if (!validate()) return;

        setLoading(true);
        try {
            const storeData: CreateStoreDTO = {
                name: formData.name,
                cnpj: formData.cnpj,
                category: formData.category,
                description: '',
                coverImage: formData.coverImage || '/placeholder-cover.jpg',
                logo: formData.logo || '/placeholder-logo.jpg',
                address: formData.address,
                contact: formData.contact,
                coordinates: { latitude: 0, longitude: 0 },
                cashback: {
                    percentage: parseFloat(formData.cashbackPercentage),
                    description: `${formData.cashbackPercentage}% de cashback`,
                },
                rules: {
                    expirationDays: formData.cashbackDays ? parseInt(formData.cashbackDays, 10) : 0,
                    minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
                    description: formData.cashbackDays
                        ? `Válido por ${formData.cashbackDays} dias`
                        : 'Sem validade',
                },

                email: formData.email,
                password: formData.password,
            };

            await onSubmit(storeData);
            setFormData(initialFormData);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData(initialFormData);
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Novo Estabelecimento" className={styles.modal}>
            <div className={styles.form}>
                {/* Imagens */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Imagens</h3>
                    <div className={styles.imageRow}>
                        <ImageUpload
                            label="Foto de Perfil"
                            value={formData.logo}
                            onChange={handleChange('logo')}
                            variant="profile"
                        />
                        <ImageUpload
                            label="Foto de Capa"
                            value={formData.coverImage}
                            onChange={handleChange('coverImage')}
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
                    <div className={styles.row}>
                        <Input
                            label="Senha *"
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            onChange={handleChange('password')}
                            type="password"
                            error={errors.password}
                            className={styles.halfWidth}
                        />
                        <Input
                            label="Confirmar Senha *"
                            placeholder="Repetir senha"
                            value={formData.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            type="password"
                            error={errors.confirmPassword}
                            className={styles.halfWidth}
                        />
                    </div>
                </div>

                {/* Botões */}
                <div className={styles.actions}>
                    <Button title="Cancelar" variant="secondary" onClick={handleClose} />
                    <Button title="Cadastrar" onClick={handleSubmit} loading={loading} />
                </div>
            </div>
        </Modal>
    );
};

export default StoreFormModal;
