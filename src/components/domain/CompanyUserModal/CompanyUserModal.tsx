'use client';

import React, { useState, useEffect } from 'react';
import { IoCloseOutline, IoPersonAddOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { Button, Input } from '@/components/common';
import { CompanyUser, CreateCompanyUserDTO, UpdateCompanyUserDTO } from '@/types';
import styles from './CompanyUserModal.module.css';

interface CompanyUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCompanyUserDTO | UpdateCompanyUserDTO) => Promise<void>;
    companyId: string;
    user?: CompanyUser | null; // null = creating, user = editing
}

const CompanyUserModal: React.FC<CompanyUserModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    companyId,
    user,
}) => {
    const isEditing = !!user;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({
                    name: user.name,
                    email: user.email,
                    password: '',
                    confirmPassword: '',
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                });
            }
            setErrors({});
        }
    }, [isOpen, user]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        }

        // Password required only when creating
        if (!isEditing && !formData.password) {
            newErrors.password = 'Senha é obrigatória';
        }

        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não conferem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            if (isEditing) {
                const updateData: UpdateCompanyUserDTO = {
                    name: formData.name,
                    email: formData.email,
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await onSubmit(updateData);
            } else {
                const createData: CreateCompanyUserDTO = {
                    companyId,
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                };
                await onSubmit(createData);
            }
            onClose();
        } catch {
            // Error handled by parent
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <IoPersonAddOutline size={24} />
                    </div>
                    <h2 className={styles.title}>
                        {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <Input
                            label="Nome *"
                            placeholder="Nome completo do usuário"
                            value={formData.name}
                            onChange={(value) => setFormData({ ...formData, name: value })}
                            error={errors.name}
                        />
                    </div>

                    <div className={styles.field}>
                        <Input
                            label="Email *"
                            placeholder="email@exemplo.com"
                            value={formData.email}
                            onChange={(value) => setFormData({ ...formData, email: value })}
                            error={errors.email}
                        />
                    </div>

                    <div className={styles.field}>
                        <div className={styles.passwordWrapper}>
                            <Input
                                label={isEditing ? 'Nova Senha (opcional)' : 'Senha *'}
                                placeholder={isEditing ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(value) => setFormData({ ...formData, password: value })}
                                error={errors.password}
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                            </button>
                        </div>
                    </div>

                    {(formData.password || !isEditing) && (
                        <div className={styles.field}>
                            <div className={styles.passwordWrapper}>
                                <Input
                                    label="Confirmar Senha *"
                                    placeholder="Repita a senha"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                                    error={errors.confirmPassword}
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <Button
                            title="Cancelar"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyUserModal;
