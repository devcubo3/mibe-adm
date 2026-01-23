'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { PageLayout } from '@/components/layout';
import { Button, SearchInput } from '@/components/common';
import { StoreCard, StoreFormModal } from '@/components/domain';
import { storeService } from '@/services';
import { Store, CreateStoreDTO } from '@/types';
import { useDebounce } from '@/hooks';
import toast from 'react-hot-toast';
import styles from './stores.module.css';

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const data = await storeService.getAll();
      setStores(data);
    } catch (error: any) {
      toast.error('Erro ao carregar estabelecimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (data: CreateStoreDTO) => {
    try {
      await storeService.create(data);
      toast.success('Estabelecimento cadastrado com sucesso!');
      loadStores();
    } catch (error: any) {
      toast.error('Erro ao cadastrar estabelecimento');
      throw error;
    }
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageLayout
        title="Estabelecimentos"
        actions={<Button title="Novo Estabelecimento" onClick={() => setIsModalOpen(true)} />}
      >
        <div className={styles.filters}>
          <SearchInput placeholder="Buscar estabelecimento..." value={search} onChange={setSearch} />
        </div>

        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : filteredStores.length === 0 ? (
          <p className={styles.emptyState}>Nenhum estabelecimento encontrado</p>
        ) : (
          <div className={styles.storeList}>
            {filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                name={store.name}
                category={store.category}
                image={store.logo}
                rating={store.rating}
                onClick={() => router.push(`/stores/${store.id}`)}
              />
            ))}
          </div>
        )}
      </PageLayout>

      <StoreFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStore}
      />
    </DashboardLayout>
  );
}
