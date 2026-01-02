import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, Download } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';

interface Quotation {
    id: string;
    quotationNumber: string;
    title: string;
    totalAmount: number;
    currency: string;
    status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
    validUntil?: string;
    createdAt: string;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    title: string;
    totalAmount: number;
    currency: string;
    status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
    dueDate?: string;
    createdAt: string;
}

interface QuotationManagerProps {
    entityType: 'lead' | 'deal' | 'contact' | 'company';
    entityId: string;
    quotations: Quotation[];
    invoices: Invoice[];
}

const QuotationManager: React.FC<QuotationManagerProps> = ({
    entityType,
    entityId,
    quotations,
    invoices
}) => {
    const { hasPermission } = useAuth();
    const { formatCurrency } = useBusinessSettings();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('quotations');

    const getStatusColor = (status: string) => {
        const colors = {
            DRAFT: 'bg-gray-100 text-gray-800',
            SENT: 'bg-blue-100 text-blue-800',
            VIEWED: 'bg-indigo-100 text-indigo-800',
            ACCEPTED: 'bg-green-100 text-green-800',
            PAID: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
            EXPIRED: 'bg-orange-100 text-orange-800',
            OVERDUE: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
            PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
            REFUNDED: 'bg-purple-100 text-purple-800'
        };
        return colors[status as keyof typeof colors] || colors.DRAFT;
    };

    const getContextualLabel = () => {
        if (entityType === 'deal') {
            return {
                title: 'Sales Proposals & Invoices',
                quotation: 'Proposal',
                quotationPlural: 'Proposals',
                emptyQuotationTitle: 'No Proposals Yet',
                emptyQuotationDesc: 'Create your first sales proposal to advance this deal.',
                emptyInvoiceDesc: 'Generate invoices from accepted proposals or create directly.'
            };
        }
        return {
            title: 'Quotations & Invoices',
            quotation: 'Quotation',
            quotationPlural: 'Quotations',
            emptyQuotationTitle: 'No Quotations Yet',
            emptyQuotationDesc: 'Create your first quotation for this contact.',
            emptyInvoiceDesc: 'Create invoices from accepted quotations or directly.'
        };
    };

    const labels = getContextualLabel();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {labels.title}
                </h2>
                {hasPermission(`${entityType}.create`) && (
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="OUTLINE"
                            className="flex items-center gap-2"
                            onClick={() => navigate(`/quotations/new?entityType=${entityType}&entityId=${entityId}`)}
                        >
                            <Plus size={16} />
                            New {labels.quotation}
                        </Button>
                        <Button
                            className="flex items-center gap-2 bg-weconnect-red hover:bg-red-600"
                            onClick={() => navigate(`/invoices/new?entityType=${entityType}&entityId=${entityId}`)}
                        >
                            <Plus size={16} />
                            New Invoice
                        </Button>
                    </div>
                )}
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'quotations', label: labels.quotationPlural, count: quotations.length },
                        { id: 'invoices', label: 'Invoices', count: invoices.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                                ? 'border-weconnect-red text-weconnect-red'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'quotations' && (
                <div className="space-y-4">
                    {quotations.length === 0 ? (
                        <Card className="p-8 text-center">
                            <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {labels.emptyQuotationTitle}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {labels.emptyQuotationDesc}
                            </p>
                            {hasPermission(`${entityType}.create`) && (
                                <Button onClick={() => navigate(`/quotations/new?entityType=${entityType}&entityId=${entityId}`)}>Create {labels.quotation}</Button>
                            )}
                        </Card>
                    ) : (
                        quotations.map((quotation) => (
                            <Card key={quotation.id} className="p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {quotation.quotationNumber}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {quotation.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Created: {new Date(quotation.createdAt).toLocaleDateString()}
                                                {quotation.validUntil && (
                                                    <span> • Valid until: {new Date(quotation.validUntil).toLocaleDateString()}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quotation.status)}`}>
                                                {quotation.status}
                                            </span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(quotation.totalAmount, quotation.currency)}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button size="SM" variant="GHOST" onClick={async () => {
                                                try {
                                                    const res = await apiClient.get(`/quotations/${quotation.id}/pdf/preview`, { responseType: 'blob' });
                                                    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                                    window.open(url, '_blank');
                                                } catch (e) { /* noop */ }
                                            }}>
                                                <Eye size={14} />
                                            </Button>
                                            <Button size="SM" variant="GHOST" onClick={async () => {
                                                try {
                                                    const res = await apiClient.get(`/quotations/${quotation.id}/pdf/download`, { responseType: 'blob' });
                                                    const url = URL.createObjectURL(new Blob([res.data]));
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `${quotation.quotationNumber || 'quotation'}.pdf`;
                                                    a.click();
                                                } catch (e) { /* noop */ }
                                            }}>
                                                <Download size={14} />
                                            </Button>
                                            <Button size="SM" variant="OUTLINE" className="flex items-center gap-1" onClick={() => {
                                                navigate(`/invoices/new?quotationId=${quotation.id}`);
                                            }}>
                                                <Plus size={14} className="text-green-500" />
                                                Create Invoice
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'invoices' && (
                <div className="space-y-4">
                    {invoices.length === 0 ? (
                        <Card className="p-8 text-center">
                            <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Invoices Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {labels.emptyInvoiceDesc}
                            </p>
                            {hasPermission(`${entityType}.create`) && (
                                <Button onClick={() => navigate(`/invoices/new?entityType=${entityType}&entityId=${entityId}`)}>Create Invoice</Button>
                            )}
                        </Card>
                    ) : (
                        invoices.map((invoice) => (
                            <Card key={invoice.id} className="p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <FileText size={24} className="text-green-600 dark:text-green-400" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {invoice.invoiceNumber}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {invoice.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Created: {new Date(invoice.createdAt).toLocaleDateString()}
                                                {invoice.dueDate && (
                                                    <span> • Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                                {invoice.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(invoice.totalAmount, invoice.currency)}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                size="SM"
                                                variant="GHOST"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const res = await apiClient.get(`/invoices/${invoice.id}/pdf/preview`, { responseType: 'blob' });
                                                        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                                        window.open(url, '_blank');
                                                    } catch (error: any) {
                                                        console.error('Error previewing invoice:', error);
                                                        if (error?.response?.status === 404) {
                                                            navigate(`/invoices/${invoice.id}`);
                                                        } else {
                                                            toast.error(error?.response?.data?.message || 'Failed to preview invoice');
                                                        }
                                                    }
                                                }}
                                            >
                                                <Eye size={14} />
                                            </Button>
                                            <Button
                                                size="SM"
                                                variant="GHOST"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const res = await apiClient.get(`/invoices/${invoice.id}/pdf/download`, { responseType: 'blob' });
                                                        const url = URL.createObjectURL(new Blob([res.data]));
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `${invoice.invoiceNumber || 'invoice'}.pdf`;
                                                        a.click();
                                                    } catch (error: any) {
                                                        console.error('Error downloading invoice:', error);
                                                        if (error?.response?.status === 404) {
                                                            navigate(`/invoices/${invoice.id}`);
                                                        } else {
                                                            toast.error(error?.response?.data?.message || 'Failed to download invoice');
                                                        }
                                                    }
                                                }}
                                            >
                                                <Download size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default QuotationManager;
