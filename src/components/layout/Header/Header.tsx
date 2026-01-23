'use client';

import React from 'react';
import { useAuth } from '@/hooks';
import { IoPersonCircleOutline, IoLogOutOutline } from 'react-icons/io5';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.user}>
          <IoPersonCircleOutline size={32} />
          <span>{user?.name}</span>
        </div>

        <button className={styles.logoutButton} onClick={logout}>
          <IoLogOutOutline size={20} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
