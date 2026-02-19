'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
    IoArrowBack,
    IoLocationOutline,
    IoWalletOutline,
    IoDocumentTextOutline,
    IoTimeOutline,
    IoCartOutline,
    IoStar,
    IoPersonAddOutline,
    IoPeopleOutline,
    IoStorefrontOutline,
    IoImageOutline,
} from 'react-icons/io5';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Button } from '@/components/common';
import { ReviewCard, StoreEditModal, CompanyUserCard, CompanyUserModal } from '@/components/domain';
import { storeService, transactionService, userService, companyUserService } from '@/services';
import { Store, Transaction, Review, User, UpdateStoreDTO, CompanyUser, CreateCompanyUserDTO, UpdateCompanyUserDTO } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import toast from 'react-hot-toast';
import styles from './stores-detail.module.css';

export default function StoreDetailPage() {
    const router = useRouter();
    const params = useParams();
    const storeId = params.id as string;

    const [store, setStore] = useState<Store | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);

    useEffect(() => {
        if (storeId) {
            loadStoreData();
        }
    }, [storeId]);

    const loadStoreData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [storeData, storeTransactions, storeReviews, allUsers, storeCompanyUsers] = await Promise.all([
                storeService.getById(storeId),
                transactionService.getByStore(storeId),
                storeService.getReviews(storeId),
                userService.getAll(),
                companyUserService.getByCompany(storeId),
            ]);

            setStore(storeData);
            setTransactions(storeTransactions);
            setReviews(storeReviews);
            setUsers(allUsers);
            setCompanyUsers(storeCompanyUsers);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do estabelecimento';
            setError(errorMessage);
            toast.error('Erro ao carregar dados do estabelecimento');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/stores');
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (id: string, data: UpdateStoreDTO) => {
        try {
            const updatedStore = await storeService.update(id, data);
            setStore(updatedStore);
            toast.success('Estabelecimento atualizado com sucesso!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar estabelecimento';
            toast.error(errorMessage);
            throw err;
        }
    };

    const handleToggleStatus = async () => {
        if (!store) return;

        try {
            const newStatus = store.status === 'active' ? 'inactive' : 'active';
            const updatedStore = await storeService.update(storeId, { status: newStatus });
            setStore(updatedStore);
            toast.success(newStatus === 'active' ? 'Estabelecimento ativado!' : 'Estabelecimento desativado!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async () => {
        if (!store) return;

        if (!confirm(`Tem certeza que deseja excluir o estabelecimento "${store.name}"? Esta ação excluirá todos os dados relacionados e não pode ser desfeita.`)) {
            return;
        }

        try {
            setLoading(true);
            await storeService.delete(storeId);
            toast.success('Estabelecimento excluído com sucesso!');
            router.push('/stores');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir estabelecimento';
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    // Company User handlers
    const handleAddUser = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditUser = (user: CompanyUser) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleUserModalSubmit = async (data: CreateCompanyUserDTO | UpdateCompanyUserDTO) => {
        try {
            if (editingUser) {
                // Editing existing user
                const updated = await companyUserService.update(editingUser.id, data as UpdateCompanyUserDTO);
                setCompanyUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                toast.success('Usuário atualizado com sucesso!');
            } else {
                // Creating new user
                const created = await companyUserService.create(data as CreateCompanyUserDTO);
                setCompanyUsers(prev => [created, ...prev]);
                toast.success('Usuário criado com sucesso!');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar usuário';
            toast.error(errorMessage);
            throw err;
        }
    };

    const handleToggleUserActive = async (user: CompanyUser) => {
        try {
            const updated = await companyUserService.toggleActive(user.id, !user.isActive);
            setCompanyUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            toast.success(updated.isActive ? 'Usuário ativado!' : 'Usuário desativado!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status';
            toast.error(errorMessage);
        }
    };

    const handleDeleteUser = async (user: CompanyUser) => {
        if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            await companyUserService.delete(user.id);
            setCompanyUsers(prev => prev.filter(u => u.id !== user.id));
            toast.success('Usuário excluído com sucesso!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir usuário';
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <PageLayout title="Detalhes do Estabelecimento">
                    <div className={styles.loading}>Carregando...</div>
                </PageLayout>
            </DashboardLayout>
        );
    }

    if (error || !store) {
        return (
            <DashboardLayout>
                <PageLayout title="Detalhes do Estabelecimento">
                    <button className={styles.backButton} onClick={handleBack}>
                        <IoArrowBack size={20} />
                        Voltar para lista
                    </button>
                    <div className={styles.errorState}>
                        <p className={styles.errorText}>{error || 'Estabelecimento não encontrado'}</p>
                        <Button title="Voltar" variant="secondary" onClick={handleBack} />
                    </div>
                </PageLayout>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageLayout title="Detalhes do Estabelecimento">
                <div className={styles.detailPage}>
                    {/* Back Button */}
                    <button className={styles.backButton} onClick={handleBack} style={{ margin: '24px' }}>
                        <IoArrowBack size={20} />
                        Voltar para lista
                    </button>

                    {/* Cover Image */}
                    <div className={styles.coverContainer}>
                        {store.coverImage ? (
                            <Image
                                src={store.coverImage}
                                alt={`${store.name} cover`}
                                fill
                                style={{ objectFit: 'cover' }}
                                priority
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                                <IoImageOutline size={48} color="#999999" />
                            </div>
                        )}
                    </div>

                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.storeLogo} style={{ border: '4px solid var(--color-background)' }}>
                            {store.logo ? (
                                <Image
                                    src={store.logo}
                                    alt={store.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                                    <IoStorefrontOutline size={40} color="#999999" />
                                </div>
                            )}
                        </div>
                        <div className={styles.storeInfo}>
                            <h1 className={styles.storeName}>{store.name}</h1>
                            <span className={styles.storeCategory}>{store.category}</span>
                            <div className={styles.storeRating}>
                                <IoStar color="#FFB800" size={20} />
                                <span className={styles.ratingValue}>{store.rating.toFixed(1)}</span>
                                <span className={styles.reviewCount}>({store.totalReviews} avaliações)</span>
                            </div>
                            <div className={styles.storeAddress}>
                                <IoLocationOutline size={16} />
                                <span>{store.address}</span>
                            </div>
                        </div>
                        <div className={styles.headerActions}>
                            <Button title="Editar" variant="secondary" onClick={handleEdit} />
                            <Button
                                title={store.status === 'inactive' ? 'Ativar' : 'Desativar'}
                                variant="secondary"
                                onClick={handleToggleStatus}
                            />
                            {store.status === 'inactive' && (
                                <Button
                                    title="Excluir"
                                    onClick={handleDelete}
                                    style={{ backgroundColor: '#FF3B30', color: '#FFF', borderColor: '#FF3B30' }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className={styles.contentGrid}>
                        {/* Description Card */}
                        <div className={styles.infoCard}>
                            <h3 className={styles.infoCardTitle}>
                                <IoDocumentTextOutline size={20} />
                                Descrição
                            </h3>
                            <div className={styles.infoCardContent}>
                                <p>{store.description}</p>
                            </div>
                        </div>

                        {/* Cashback Card */}
                        <div className={styles.cashbackCard}>
                            <div className={styles.cashbackHeader}>
                                <IoWalletOutline size={20} color="#34C759" />
                                <span className={styles.cashbackTitle}>Configuração de Cashback</span>
                            </div>
                            <div className={styles.cashbackPercentage}>{store.cashback.percentage}%</div>
                            <p className={styles.cashbackDescription}>{store.cashback.description}</p>
                            <div className={styles.cashbackRules}>
                                <div className={styles.ruleItem}>
                                    <IoTimeOutline size={16} />
                                    <span>Expira em {store.rules.expirationDays} dias</span>
                                </div>
                                <div className={styles.ruleItem}>
                                    <IoCartOutline size={16} />
                                    <span>Compra mínima: {formatCurrency(store.rules.minPurchase)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Users Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <IoPeopleOutline size={22} />
                                Usuários do Estabelecimento ({companyUsers.length})
                            </h2>
                            <Button
                                title="Novo Usuário"
                                onClick={handleAddUser}
                            />
                        </div>
                        {companyUsers.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyStateIcon}>
                                    <IoPersonAddOutline size={48} />
                                </div>
                                <p className={styles.emptyStateText}>Nenhum usuário cadastrado</p>
                                <p className={styles.emptyStateSubtext}>
                                    Adicione usuários que terão acesso ao app da empresa
                                </p>
                                <Button
                                    title="Adicionar Primeiro Usuário"
                                    variant="secondary"
                                    onClick={handleAddUser}
                                />
                            </div>
                        ) : (
                            <div className={styles.companyUsersList}>
                                {companyUsers.map((user) => (
                                    <CompanyUserCard
                                        key={user.id}
                                        user={user}
                                        onEdit={handleEditUser}
                                        onToggleActive={handleToggleUserActive}
                                        onDelete={handleDeleteUser}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Transactions Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Histórico de Transações</h2>
                        </div>
                        <div className={styles.transactionAction}>
                            <p className={styles.actionDescription}>
                                Visualize todas as transações de cashback deste estabelecimento com filtros avançados e paginação.
                            </p>
                            <Button
                                title="Ver Histórico de Transações"
                                onClick={() => router.push(`/stores/${storeId}/transactions`)}
                            />
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Avaliações ({reviews.length})</h2>
                        </div>
                        {reviews.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p className={styles.emptyStateText}>Nenhuma avaliação encontrada</p>
                            </div>
                        ) : (
                            <div className={styles.reviewsList}>
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PageLayout>

            {/* Edit Modal */}
            <StoreEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                store={store}
            />

            {/* Company User Modal */}
            <CompanyUserModal
                isOpen={isUserModalOpen}
                onClose={() => {
                    setIsUserModalOpen(false);
                    setEditingUser(null);
                }}
                onSubmit={handleUserModalSubmit}
                companyId={storeId}
                user={editingUser}
            />
        </DashboardLayout>
    );
}
