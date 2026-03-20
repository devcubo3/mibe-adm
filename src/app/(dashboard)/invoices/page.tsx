'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageLayout } from '@/components/layout';
import { SearchInput } from '@/components/common';
import { InvoiceCard } from '@/components/domain';
import { subscriptionService } from '@/services';
import { CompanyInvoiceCard } from '@/types/subscription.types';
import { useDebounce } from '@/hooks';
import { IoReceiptOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import styles from './invoices.module.css';

export default function InvoicesPage() {
    const router = useRouter();
    const [companies, setCompanies] = useState<CompanyInvoiceCard[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const data = await subscriptionService.getCompaniesWithInvoices();
            setCompanies(data);
        } catch {
            toast.error('Erro ao carregar faturas');
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter((c) =>
        c.companyName.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return (
        <DashboardLayout>
            <PageLayout title="Faturas">
                <div className={styles.filters}>
                    <SearchInput placeholder="Buscar estabelecimento..." value={search} onChange={setSearch} />
                </div>

                {loading ? (
                    <p className={styles.loading}>Carregando...</p>
                ) : filteredCompanies.length === 0 ? (
                    <div className={styles.emptyState}>
                        <IoReceiptOutline className={styles.emptyIcon} />
                        <p className={styles.emptyText}>Nenhum estabelecimento com faturas encontrado</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredCompanies.map((company) => (
                            <InvoiceCard
                                key={company.companyId}
                                companyName={company.companyName}
                                companyLogo={company.companyLogo}
                                pendingCount={company.pendingCount}
                                paidCount={company.paidCount}
                                overdueCount={company.overdueCount}
                                totalPending={company.totalPending}
                                totalPaid={company.totalPaid}
                                onClick={() => router.push(`/invoices/${company.companyId}`)}
                            />
                        ))}
                    </div>
                )}
            </PageLayout>
        </DashboardLayout>
    );
}
