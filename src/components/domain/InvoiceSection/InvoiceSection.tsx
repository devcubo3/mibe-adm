'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IoCheckmarkCircleOutline, IoAlertCircleOutline, IoCalendarOutline, IoCloseCircle, IoCloseCircleOutline, IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { Badge, Button } from '@/components/common';
import { subscriptionService } from '@/services';
import { PaymentHistory, InvoiceSummary } from '@/types/subscription.types';
import { formatCurrency, formatISOToDate } from '@/utils/formatters';
import toast from 'react-hot-toast';
import styles from './InvoiceSection.module.css';

interface InvoiceSectionProps {
    companyId: string;
    isCompanyBlocked?: boolean;
    onCompanyUnblocked?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Pago',
    failed: 'Falhou',
    refunded: 'Reembolsado',
};

const STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
    pending: 'warning',
    paid: 'success',
    failed: 'error',
    refunded: 'default',
};

const TYPE_LABELS: Record<string, string> = {
    MENSALIDADE: 'Mensalidade',
    COMISSAO_DIARIA: 'Comissão Diária',
};

const InvoiceSection: React.FC<InvoiceSectionProps> = ({
    companyId,
    isCompanyBlocked = false,
    onCompanyUnblocked,
}) => {
    const [invoices, setInvoices] = useState<PaymentHistory[]>([]);
    const [summary, setSummary] = useState<InvoiceSummary>({ totalPending: 0, totalPaid: 0, overdueCount: 0 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [unblocking, setUnblocking] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

    const filteredInvoices = useMemo(() => {
        if (!startDate && !endDate) return invoices;

        return invoices.filter((invoice) => {
            const dateStr = invoice.commissionDate || invoice.createdAt;
            if (!dateStr) return true;

            const invoiceDate = new Date(dateStr);
            invoiceDate.setHours(0, 0, 0, 0);

            if (startDate) {
                const start = new Date(startDate + 'T00:00:00');
                if (invoiceDate < start) return false;
            }

            if (endDate) {
                const end = new Date(endDate + 'T23:59:59');
                if (invoiceDate > end) return false;
            }

            return true;
        });
    }, [invoices, startDate, endDate]);

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredInvoices, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const hasActiveFilters = startDate || endDate;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [invoicesData, summaryData] = await Promise.all([
                subscriptionService.getPaymentHistoryByCompany(companyId),
                subscriptionService.getInvoiceSummary(companyId),
            ]);
            setInvoices(invoicesData);
            setSummary(summaryData);
        } catch {
            toast.error('Erro ao carregar faturas');
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleMarkAsPaid = async (paymentId: string) => {
        const confirmed = window.confirm('Marcar esta fatura como paga manualmente?');
        if (!confirmed) return;

        try {
            setActionLoading(paymentId);
            await subscriptionService.markInvoiceAsPaid(paymentId);
            toast.success('Fatura marcada como paga!');
            loadData();
        } catch {
            toast.error('Erro ao marcar fatura como paga');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnblock = async () => {
        const confirmed = window.confirm(
            'Deseja desbloquear esta empresa? Isso reativará a conta e a assinatura.'
        );
        if (!confirmed) return;

        try {
            setUnblocking(true);
            await subscriptionService.unblockCompany(companyId);
            toast.success('Empresa desbloqueada com sucesso!');
            onCompanyUnblocked?.();
            loadData();
        } catch {
            toast.error('Erro ao desbloquear empresa');
        } finally {
            setUnblocking(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Carregando faturas...</div>;
    }

    if (invoices.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p className={styles.emptyText}>Nenhuma fatura encontrada</p>
                <p className={styles.emptySubtext}>As faturas serão geradas automaticamente a partir da primeira venda.</p>
            </div>
        );
    }

    const isOverdue = (invoice: PaymentHistory) => {
        if (invoice.status !== 'pending') return false;
        return new Date(invoice.dueDate) < new Date();
    };

    return (
        <div className={styles.container}>
            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={`${styles.summaryCard} ${styles.summaryPending}`}>
                    <span className={styles.summaryLabel}>Total Pendente</span>
                    <span className={styles.summaryValue}>{formatCurrency(summary.totalPending)}</span>
                </div>
                <div className={`${styles.summaryCard} ${styles.summaryPaid}`}>
                    <span className={styles.summaryLabel}>Total Pago</span>
                    <span className={styles.summaryValue}>{formatCurrency(summary.totalPaid)}</span>
                </div>
                <div className={`${styles.summaryCard} ${summary.overdueCount > 0 ? styles.summaryOverdue : styles.summaryOk}`}>
                    <span className={styles.summaryLabel}>Faturas Vencidas</span>
                    <span className={styles.summaryValue}>
                        {summary.overdueCount > 0 ? (
                            <><IoCloseCircleOutline size={18} /> {summary.overdueCount}</>
                        ) : (
                            <><IoCheckmarkCircleOutline size={18} /> 0</>
                        )}
                    </span>
                </div>
            </div>

            {/* Unblock Action */}
            {isCompanyBlocked && (
                <div className={styles.unblockBanner}>
                    <IoAlertCircleOutline size={20} />
                    <span>Esta empresa está bloqueada por inadimplência.</span>
                    <Button
                        title={unblocking ? 'Desbloqueando...' : 'Desbloquear Conta'}
                        onClick={handleUnblock}
                        disabled={unblocking}
                    />
                </div>
            )}

            {/* Date Filter */}
            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <IoCalendarOutline size={16} className={styles.filterIcon} />
                    <label className={styles.filterLabel}>De</label>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                        max={endDate || undefined}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Até</label>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                        min={startDate || undefined}
                    />
                </div>
                {hasActiveFilters && (
                    <button
                        className={styles.clearFiltersButton}
                        onClick={handleClearFilters}
                        title="Limpar filtros"
                    >
                        <IoCloseCircle size={16} />
                        Limpar
                    </button>
                )}
                {hasActiveFilters && (
                    <span className={styles.filterCount}>
                        {filteredInvoices.length} de {invoices.length} faturas
                    </span>
                )}
            </div>

            {/* Invoices Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Data</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.noResults}>
                                    Nenhuma fatura encontrada para o período selecionado.
                                </td>
                            </tr>
                        ) : (
                            paginatedInvoices.map((invoice) => (
                                <tr key={invoice.id} className={isOverdue(invoice) ? styles.overdueRow : ''}>
                                    <td>
                                        <span className={styles.typeBadge}>
                                            {TYPE_LABELS[invoice.type] || invoice.type}
                                        </span>
                                    </td>
                                    <td>{invoice.commissionDate || (invoice.createdAt ? formatISOToDate(invoice.createdAt) : '-')}</td>
                                    <td className={styles.amount}>{formatCurrency(invoice.amount)}</td>
                                    <td>{invoice.dueDate ? formatISOToDate(invoice.dueDate) : '-'}</td>
                                    <td>
                                        <Badge
                                            variant={isOverdue(invoice) ? 'error' : STATUS_VARIANTS[invoice.status]}
                                            text={isOverdue(invoice) ? 'Vencida' : STATUS_LABELS[invoice.status]}
                                        />
                                    </td>
                                    <td>
                                        {(invoice.status === 'pending' || invoice.status === 'failed') && (
                                            <button
                                                className={styles.markPaidButton}
                                                onClick={() => handleMarkAsPaid(invoice.id)}
                                                disabled={actionLoading === invoice.id}
                                            >
                                                {actionLoading === invoice.id ? 'Marcando...' : 'Marcar Pago'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredInvoices.length > 0 && (
                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        <label className={styles.perPageLabel}>
                            Exibir
                            <select
                                className={styles.perPageSelect}
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            >
                                {PAGE_SIZE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            por página
                        </label>
                        <span className={styles.paginationCount}>
                            {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredInvoices.length)} de {filteredInvoices.length}
                        </span>
                    </div>
                    <div className={styles.paginationControls}>
                        <button
                            className={styles.pageButton}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <IoChevronBackOutline size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                                if (totalPages <= 5) return true;
                                if (page === 1 || page === totalPages) return true;
                                return Math.abs(page - currentPage) <= 1;
                            })
                            .map((page, idx, arr) => (
                                <React.Fragment key={page}>
                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                        <span className={styles.pageEllipsis}>...</span>
                                    )}
                                    <button
                                        className={`${styles.pageButton} ${currentPage === page ? styles.pageButtonActive : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                </React.Fragment>
                            ))
                        }
                        <button
                            className={styles.pageButton}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <IoChevronForwardOutline size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceSection;
