import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Printer,
    Edit,
    Send,
    CheckCircle,
    XCircle,
    FileText,
    Eye,
    Mail,
    Phone,
    MapPin,
    Globe,
    Building,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { Button, Card } from '../../components/ui';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface QuotationItem {
    id: number;
    name: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
    discountRate: number;
    subtotal: number;
    totalAmount: number;
}

interface Quotation {
    id: number;
    quotationNumber: string;
    title: string;
    description?: string;
    status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    validUntil?: string;
    notes?: string;
    terms?: string;
    createdAt: string;
    items: QuotationItem[];
    lead?: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
        company?: string;







    };
}

const QuotationDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [businessSettings, setBusinessSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchQuotation();
        fetchBusinessSettings();
    }, [id]);

    const fetchQuotation = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/quotations/${id}`);
            if (res.data.success) {
                setQuotation(res.data.data.quotation);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to fetch quotation');
            navigate('/quotations');
        } finally {
            setLoading(false);
        }
    };

    const fetchBusinessSettings = async () => {
        try {
            const res = await apiClient.get('/business-settings/all');
            if (res.data.success) {
                setBusinessSettings(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching business settings:', error);
        }
    };

    const handleDownloadPDF = async () => {
        if (!quotation) return;
        try {
            setProcessing(true);
            const response = await apiClient.get(`/quotations/${id}/pdf/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${quotation.quotationNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Quotation downloaded successfully');
        } catch (error) {
            toast.error('Failed to download PDF');
        } finally {
            setProcessing(false);
        }
    };

    const handlePreviewPDF = async () => {
        if (!quotation) return;
        try {
            setProcessing(true);
            const response = await apiClient.get(`/quotations/${id}/pdf/preview`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            toast.error('Failed to preview PDF');
        } finally {
            setProcessing(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAction = async (action: 'accept' | 'reject' | 'send') => {
        if (!quotation) return;
        try {
            setProcessing(true);
            let endpoint = '';
            let successMsg = '';

            switch (action) {
                case 'accept': endpoint = `/quotations/${id}/accept`; successMsg = 'Quotation marked as accepted'; break;
                case 'reject': endpoint = `/quotations/${id}/reject`; successMsg = 'Quotation marked as rejected'; break;
                case 'send': endpoint = `/quotations/${id}/send`; successMsg = 'Quotation marked as sent'; break;
            }

            const res = await apiClient.put(endpoint);
            if (res.data.success) {
                toast.success(successMsg);
                fetchQuotation();
            }
        } catch (error) {
            toast.error(`Failed to update quotation status`);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return { label: 'Accepted', color: 'bg-green-100 text-green-800' };
            case 'REJECTED': return { label: 'Rejected', color: 'bg-red-100 text-red-800' };
            case 'SENT': return { label: 'Sent', color: 'bg-blue-100 text-blue-800' };
            case 'DRAFT': return { label: 'Draft', color: 'bg-gray-100 text-gray-800' };
            default: return { label: status, color: 'bg-gray-100 text-gray-800' };
        }
    };

    if (loading || !quotation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const status = getStatusDisplay(quotation.status);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-12 print:bg-white print:pb-0">
            {/* Top Navbar - Hidden on Print */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 py-4 px-6 sticky top-0 z-10 print:hidden">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/quotations')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                {quotation.quotationNumber}
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${status.color}`}>
                                    {status.label}
                                </span>
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Created on {format(new Date(quotation.createdAt), 'PPP')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="SECONDARY" size="SM" onClick={handlePreviewPDF}>
                            <Eye className="w-4 h-4 mr-2" /> View PDF
                        </Button>


                        {quotation.status === 'DRAFT' && (
                            <Button variant="PRIMARY" size="SM" onClick={() => handleAction('send')} loading={processing}>
                                <Send className="w-4 h-4 mr-2" /> Send
                            </Button>
                        )}
                        {quotation.status === 'SENT' && (
                            <>
                                <Button variant="SECONDARY" size="SM" className="text-red-600 hover:bg-red-50" onClick={() => handleAction('reject')} loading={processing}>
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button variant="PRIMARY" size="SM" onClick={() => handleAction('accept')} loading={processing}>
                                    <CheckCircle className="w-4 h-4 mr-2" /> Accept
                                </Button>
                            </>
                        )}
                        <Button variant="SECONDARY" size="SM" onClick={() => navigate(`/quotations/edit/${id}`)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto pt-8 px-6 print:pt-0 print:px-0">
                <Card className="shadow-2xl border-none p-0 overflow-hidden dark:bg-slate-900 print:shadow-none print:bg-white">
                    {/* Header Banner - Accent */}
                    <div className="h-2 bg-indigo-600 print:h-1"></div>

                    <div className="p-12 print:p-8">
                        {/* Top Section: Company Info & Quotation Info */}
                        <div className="flex flex-col md:flex-row justify-between gap-8 mb-16">
                            <div className="space-y-6 max-w-md">
                                {businessSettings?.company?.logo ? (
                                    <img
                                        src={businessSettings.company.logo.startsWith('data:image')
                                            ? businessSettings.company.logo
                                            : `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')}/uploads/${businessSettings.company.logo}`}
                                        alt="Logo"
                                        className="h-16 w-auto object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                            <Building className="text-white w-7 h-7" />
                                        </div>
                                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                            {businessSettings?.company?.name || 'WE-CONNECT'}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    <p className="text-slate-900 dark:text-slate-200 font-bold text-base mb-2">{businessSettings?.company?.name}</p>
                                    {businessSettings?.company?.address && <p className="flex items-start gap-2 max-w-[320px]"><MapPin className="w-3.5 h-3.5 mt-1 shrink-0 text-slate-400" /> {businessSettings.company.address}</p>}
                                    {businessSettings?.company?.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {businessSettings.company.email}</p>}
                                    {businessSettings?.company?.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {businessSettings.company.phone}</p>}
                                    {businessSettings?.company?.website && (
                                        <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-slate-400" /> {businessSettings.company.website}</p>
                                    )}

                                    {(businessSettings?.company?.gstNumber || businessSettings?.company?.panNumber || businessSettings?.company?.cinNumber) && (
                                        <div className="pt-6 flex flex-wrap gap-x-3 gap-y-2">
                                            {businessSettings.company.gstNumber && (
                                                <div className="bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg text-[10px] font-black border border-slate-200/50 dark:border-slate-700/50">
                                                    <span className="text-indigo-600 dark:text-indigo-400 uppercase mr-2 tracking-widest">GSTIN</span>
                                                    <span className="text-slate-800 dark:text-slate-200 tabular-nums">{businessSettings.company.gstNumber}</span>
                                                </div>
                                            )}
                                            {businessSettings.company.panNumber && (
                                                <div className="bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg text-[10px] font-black border border-slate-200/50 dark:border-slate-700/50">
                                                    <span className="text-indigo-600 dark:text-indigo-400 uppercase mr-2 tracking-widest">PAN</span>
                                                    <span className="text-slate-800 dark:text-slate-200 tabular-nums">{businessSettings.company.panNumber}</span>
                                                </div>
                                            )}
                                            {businessSettings.company.cinNumber && (
                                                <div className="bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg text-[10px] font-black border border-slate-200/50 dark:border-slate-700/50">
                                                    <span className="text-indigo-600 dark:text-indigo-400 uppercase mr-2 tracking-widest">CIN</span>
                                                    <span className="text-slate-800 dark:text-slate-200 tabular-nums">{businessSettings.company.cinNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-left md:text-right space-y-4">
                                <h2 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter opacity-[0.03] print:opacity-[0.05] uppercase absolute right-12 top-24 pointer-events-none select-none">Quotation</h2>
                                <div className="space-y-1 pt-6 relative">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Document Reference</p>
                                    <p className="text-4xl font-black text-indigo-600 tracking-tighter leading-none py-2">{quotation.quotationNumber}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-4 md:float-right bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 mt-2">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Issue Date</p>
                                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{format(new Date(quotation.createdAt), 'dd MMM, yyyy')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Valid Until</p>
                                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                                            {quotation.validUntil ? format(new Date(quotation.validUntil), 'dd MMM, yyyy') : 'No Expiry'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Bill To & Subject */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 px-10 py-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none print:shadow-none print:border-slate-200">
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">
                                    <span className="w-12 h-[2px] bg-indigo-600 rounded-full"></span>
                                    Bill To
                                </div>
                                {quotation.lead ? (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{quotation.lead.firstName} {quotation.lead.lastName}</h3>
                                            {quotation.lead.company && <p className="text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.1em]">{quotation.lead.company}</p>}
                                        </div>
                                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-semibold">
                                            {quotation.lead.address && <p className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" /> {quotation.lead.address}</p>}
                                            <p className="flex items-center gap-3"><Mail className="w-4 h-4 shrink-0 text-slate-300" /> {quotation.lead.email}</p>
                                            {quotation.lead.phone && <p className="flex items-center gap-3"><Phone className="w-4 h-4 shrink-0 text-slate-300" /> {quotation.lead.phone}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic font-medium">Customer details not specified</p>
                                )}
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                                    <span className="w-12 h-[2px] bg-slate-200 rounded-full"></span>
                                    Proposal Overview
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase">{quotation.title}</h3>
                                    {quotation.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic border-l-4 border-indigo-100 pl-4 py-1">
                                            {quotation.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="mb-12 overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none print:shadow-none">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 dark:bg-slate-950">
                                        <th className="px-8 py-7 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center w-24">Pos</th>
                                        <th className="px-8 py-7 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Service Description</th>
                                        <th className="px-8 py-7 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center w-32">Qty</th>
                                        <th className="px-8 py-7 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-right w-48">Unit Price</th>
                                        <th className="px-8 py-7 text-[10px] font-black uppercase tracking-[0.3em] text-white text-right w-48">Total ({quotation.currency})</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                    {(quotation as any).items?.map((item: any, index: number) => (
                                        <tr key={item.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                            <td className="px-8 py-10 text-sm font-black text-slate-300 dark:text-slate-700 text-center">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-8 py-10">
                                                <p className="font-black text-slate-900 dark:text-white mb-2 text-lg tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{item.name}</p>
                                                {item.description && <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold line-clamp-2 max-w-xl leading-relaxed">{item.description}</p>}
                                            </td>
                                            <td className="px-8 py-10 text-sm font-black text-slate-900 dark:text-white text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-xl font-black text-base">{item.quantity}</span>
                                                    <span className="text-[9px] text-slate-400 uppercase font-black mt-1.5 tracking-widest">{item.unit || 'pcs'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-10 text-sm font-black text-slate-700 dark:text-slate-300 text-right tabular-nums">
                                                {Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-8 py-10 text-xl font-black text-indigo-600 dark:text-indigo-400 text-right tabular-nums tracking-tighter">
                                                {Number(item.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col md:flex-row justify-between gap-16 pt-16 border-t-2 border-slate-100 dark:border-slate-800 border-dashed">
                            <div className="max-w-md space-y-10 flex-1">
                                {quotation.notes && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" /> Special Instructions
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50">
                                            {quotation.notes}
                                        </p>
                                    </div>
                                )}

                                {quotation.terms && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                                            <FileText className="w-5 h-5" /> Standard Terms of Service
                                        </h4>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold whitespace-pre-line prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50">
                                            {quotation.terms}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="min-w-[400px] space-y-8">
                                <div className="space-y-5 px-8 py-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800">
                                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                        <span>Subtotal Amount</span>
                                        <span className="text-slate-900 dark:text-white tabular-nums text-sm">{quotation.currency} {Number(quotation.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    {Number(quotation.taxAmount) > 0 && (
                                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                            <span>Tax Calculation (GST/VAT)</span>
                                            <span className="text-slate-900 dark:text-white tabular-nums text-sm">+{quotation.currency} {Number(quotation.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {Number(quotation.discountAmount) > 0 && (
                                        <div className="flex justify-between items-center text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em]">
                                            <span>Promotion Applied</span>
                                            <span className="tabular-nums text-sm">-{quotation.currency} {Number(quotation.discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-500/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-100/70">Final Total Balance</span>
                                        <div className="p-2 bg-indigo-500/30 rounded-xl backdrop-blur-md border border-indigo-400/30">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-3xl font-black text-indigo-200/80">{quotation.currency}</span>
                                        <span className="text-6xl font-black tracking-tighter tabular-nums drop-shadow-lg">
                                            {Number(quotation.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Text */}
                        <div className="mt-32 pt-16 border-t border-slate-100 dark:border-slate-800 text-center relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-950 px-6 py-2">
                                <Building className="w-8 h-8 text-indigo-600/20" />
                            </div>
                            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] mb-4 leading-loose">
                                Thank you for your business / {businessSettings?.company?.name || 'our company'}<br />
                                we strive for excellence in every delivery
                            </p>
                            <div className="flex items-center justify-center gap-4 text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-40">
                                <span className="w-12 h-[1px] bg-slate-200"></span>
                                Computer Certified Digital Copy
                                <span className="w-12 h-[1px] bg-slate-200"></span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body { background-color: white !important; }
          .min-h-screen { min-h-0 !important; }
          card { box-shadow: none !important; }
          footer, nav, .print-hidden { display: none !important; }
        }
      `}} />
        </div>
    );
};

export default QuotationDetailPage;
