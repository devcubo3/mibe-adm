'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { Card, Input, Button } from '@/components/common';
import {
    IoLockClosedOutline,
    IoHelpCircleOutline,
    IoChevronForward,
    IoLogOutOutline,
    IoChatbubbleEllipsesOutline,
    IoMailOutline,
} from 'react-icons/io5';
import { useAuth } from '@/hooks';
import toast from 'react-hot-toast';
import { appConfigService } from '@/services/appConfigService';
import styles from './settings.module.css';

interface SettingItem {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    badge?: string;
}

const SettingsPage = () => {
    const { user, logout } = useAuth();

    const [supportWhatsapp, setSupportWhatsapp] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    const [savingSupport, setSavingSupport] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(true);

    useEffect(() => {
        appConfigService.getConfig()
            .then((config) => {
                setSupportWhatsapp(config.support_whatsapp || '');
                setSupportEmail(config.support_email || '');
            })
            .catch(() => toast.error('Erro ao carregar configurações'))
            .finally(() => setLoadingConfig(false));
    }, []);

    const handleSaveSupport = async () => {
        setSavingSupport(true);
        try {
            await appConfigService.updateSupportContact({
                support_whatsapp: supportWhatsapp,
                support_email: supportEmail,
            });
            toast.success('Contato de suporte atualizado!');
        } catch {
            toast.error('Erro ao salvar contato de suporte');
        } finally {
            setSavingSupport(false);
        }
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

                    {/* Support Contact Config */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Contato de Suporte</h3>
                        <Card className={styles.supportContactCard}>
                            <div className={styles.supportContactField}>
                                <div className={styles.supportContactIcon}>
                                    <IoChatbubbleEllipsesOutline size={20} />
                                </div>
                                <Input
                                    label="WhatsApp"
                                    placeholder="Ex: 5511999999999"
                                    value={supportWhatsapp}
                                    onChange={(e) => setSupportWhatsapp(e.target.value)}
                                    disabled={loadingConfig}
                                />
                            </div>
                            <div className={styles.supportContactField}>
                                <div className={styles.supportContactIcon}>
                                    <IoMailOutline size={20} />
                                </div>
                                <Input
                                    label="E-mail"
                                    placeholder="Ex: suporte@mibeapp.com.br"
                                    value={supportEmail}
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                    disabled={loadingConfig}
                                />
                            </div>
                            <Button
                                onClick={handleSaveSupport}
                                disabled={loadingConfig || savingSupport}
                                className={styles.saveButton}
                            >
                                {savingSupport ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </Card>
                    </div>

                    {/* Support */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Suporte</h3>
                        {renderSettingsList(supportSettings)}
                    </div>

                    {/* Logout Button */}
                    <button className={styles.logoutButton} onClick={logout}>
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
