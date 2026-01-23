'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { PageLayout } from '@/components/layout';
import { SearchInput } from '@/components/common';
import { WalletCard } from '@/components/domain';
import { walletService } from '@/services';
import { Wallet } from '@/types';
import { useDebounce } from '@/hooks';
import { IoWalletOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import styles from './wallets.module.css';

export default function WalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const data = await walletService.getAll();
      setWallets(data);
    } catch (error: any) {
      toast.error('Erro ao carregar carteiras');
    } finally {
      setLoading(false);
    }
  };

  const filteredWallets = wallets.filter((wallet) =>
    wallet.storeName.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageLayout title="Carteiras">
        <div className={styles.filters}>
          <SearchInput placeholder="Buscar carteira..." value={search} onChange={setSearch} />
        </div>

        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : filteredWallets.length === 0 ? (
          <div className={styles.emptyState}>
            <IoWalletOutline className={styles.emptyIcon} />
            <p className={styles.emptyText}>Nenhuma carteira encontrada</p>
          </div>
        ) : (
          <div className={styles.walletGrid}>
            {filteredWallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                storeName={wallet.storeName}
                storeLogo={wallet.storeLogo}
                balance={wallet.balance}
                expiresAt={wallet.expiresAt}
                onClick={() => router.push(`/wallets/${wallet.id}`)}
              />
            ))}
          </div>
        )}
      </PageLayout>
    </DashboardLayout>
  );
}
