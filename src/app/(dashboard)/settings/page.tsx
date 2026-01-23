'use client';

import React from 'react';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Card } from '@/components/common';
import {
    IoLockClosedOutline,
    IoColorPaletteOutline,
    IoBusinessOutline,
    IoHelpCircleOutline,
    IoChevronForward,
    IoLogOutOutline
} from 'react-icons/io5';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from './settings.module.css';

interface SettingItem {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    badge?: string;
}

const SettingsPage = () => {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        toast.success('Logout realizado com sucesso');
        router.push('/login');
    };

    const handleComingSoon = (feature: string) => {
        toast(`${feature} - Em breve!`, { icon: '🚧' });
    };

    const accountSettings: SettingItem[] = [
        {
            icon: <IoLockClosedOutline size={24} />,
            title: 'Segurança',
            description: 'Altere sua senha e autenticação',
            onClick: () => handleComingSoon('Segurança'),
        },
    ];

    const appSettings: SettingItem[] = [
        {
            icon: <IoColorPaletteOutline size={24} />,
            title: 'Aparência',
            description: 'Tema claro, escuro ou automático',
            onClick: () => handleComingSoon('Aparência'),
            badge: 'Claro',
        },
        {
            icon: <IoBusinessOutline size={24} />,
            title: 'Empresa',
            description: 'Configurações do estabelecimento',
            onClick: () => handleComingSoon('Empresa'),
        },
    ];

    const supportSettings: SettingItem[] = [
        {
            icon: <IoHelpCircleOutline size={24} />,
            title: 'Central de Ajuda',
            description: 'Perguntas frequentes e suporte',
            onClick: () => handleComingSoon('Central de Ajuda'),
        },
    ];

    const renderSettingsList = (items: SettingItem[]) => (
        <div className={styles.settingsList}>
            {items.map((item, index) => (
                <div
                    key={index}
                    className={styles.settingCard}
                    onClick={item.onClick}
                >
                    <div className={styles.settingIcon}>{item.icon}</div>
                    <div className={styles.settingContent}>
                        <h3 className={styles.settingTitle}>{item.title}</h3>
                        <p className={styles.settingDescription}>{item.description}</p>
                    </div>
                    {item.badge && (
                        <span className={styles.settingBadge}>{item.badge}</span>
                    )}
                    <IoChevronForward className={styles.chevron} size={20} />
                </div>
            ))}
        </div>
    );

    return (
        <DashboardLayout>
            <PageLayout title="Configurações">
                <div className={styles.container}>
                    {/* User Info Card */}
                    <Card className={styles.userCard}>
                        <div className={styles.userAvatar}>
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className={styles.userInfo}>
                            <h2 className={styles.userName}>{user?.name || 'Admin MIBE'}</h2>
                            <p className={styles.userEmail}>{user?.email || 'admin@mibe.com'}</p>
                            <span className={styles.userRole}>Administrador</span>
                        </div>
                    </Card>

                    {/* Account Settings */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Conta</h3>
                        {renderSettingsList(accountSettings)}
                    </div>

                    {/* App Settings */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Aplicativo</h3>
                        {renderSettingsList(appSettings)}
                    </div>

                    {/* Support */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Suporte</h3>
                        {renderSettingsList(supportSettings)}
                    </div>

                    {/* Logout Button */}
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <IoLogOutOutline size={20} />
                        <span>Sair da conta</span>
                    </button>

                    {/* Version Info */}
                    <div className={styles.versionInfo}>
                        <p>MIBE Admin v1.0.0</p>
                        <p>© 2024 MIBE. Todos os direitos reservados.</p>
                    </div>
                </div>
            </PageLayout>
        </DashboardLayout>
    );
};

export default SettingsPage;
