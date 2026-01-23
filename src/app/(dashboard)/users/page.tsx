'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { PageLayout } from '@/components/layout';
import { SearchInput, Card } from '@/components/common';
import { userService } from '@/services';
import { User } from '@/types';
import { useDebounce } from '@/hooks';
import { IoMailOutline, IoCallOutline, IoCardOutline, IoPeopleOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import styles from './users.module.css';

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'store_owner':
      return 'Lojista';
    case 'user':
    default:
      return 'Usuário';
  }
};

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || '?';
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error: any) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    user.cpf.includes(debouncedSearch)
  );

  return (
    <DashboardLayout>
      <PageLayout title="Usuários">
        <div className={styles.filters}>
          <SearchInput placeholder="Buscar usuário..." value={search} onChange={setSearch} />
        </div>

        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <IoPeopleOutline className={styles.emptyIcon} />
            <p className={styles.emptyText}>Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className={styles.userList}>
            {filteredUsers.map((user) => (
              <Card key={user.id} className={styles.userCard}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.userAvatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {getInitials(user.name)}
                  </div>
                )}

                <div className={styles.userInfo}>
                  <h3 className={styles.userName}>{user.name}</h3>
                  <span className={`${styles.userRole} ${styles[user.role]}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                <div className={styles.userDetails}>
                  <div className={styles.detailItem}>
                    <IoMailOutline className={styles.detailIcon} />
                    <span className={styles.detailText}>{user.email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <IoCardOutline className={styles.detailIcon} />
                    <span className={styles.detailText}>{user.cpf}</span>
                  </div>
                  {user.phone && (
                    <div className={styles.detailItem}>
                      <IoCallOutline className={styles.detailIcon} />
                      <span className={styles.detailText}>{user.phone}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageLayout>
    </DashboardLayout>
  );
}

