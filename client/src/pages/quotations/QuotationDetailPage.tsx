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
                        <Button variant="SECONDARY" size="SM" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                        <Button variant="SECONDARY" size="SM" onClick={handleDownloadPDF} loading={processing}>
                            <Download className="w-4 h-4 mr-2" /> PDF
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
                                {businessSettings?.companyLogo ? (
                                    <img
                                        src={businessSettings.companyLogo.startsWith('data:image')
                                            ? businessSettings.companyLogo
                                            : `${process.env.REACT_APP_API_URL || ''}/uploads/${businessSettings.companyLogo}`}
                                        alt="Logo"
                                        className="h-16 w-auto object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                                            <Building className="text-white w-7 h-7" />
                                        </div>
                                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                            {businessSettings?.companyName || 'WE-CONNECT'}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    <p className="text-slate-900 dark:text-slate-200 font-bold text-base mb-2">{businessSettings?.companyName}</p>
                                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {businessSettings?.companyAddress}</p>
                                    <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {businessSettings?.companyEmail}</p>
                                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {businessSettings?.companyPhone}</p>
                                    {businessSettings?.companyWebsite && (
                                        <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> {businessSettings?.companyWebsite}</p>
                                    )}
                                </div>
                            </div>

                            <div className="text-left md:text-right space-y-4 min-w-[200px]">
                                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter opacity-10 print:opacity-20 uppercase">Quotation</h2>
                                <div className="space-y-1 pt-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quotation Number</p>
                                    <p className="text-2xl font-black text-indigo-600">{quotation.quotationNumber}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 md:float-right">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Date</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{format(new Date(quotation.createdAt), 'dd MMM, yyyy')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Valid Until</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {quotation.validUntil ? format(new Date(quotation.validUntil), 'dd MMM, yyyy') : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Bill To & Subject */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 px-8 py-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 print:bg-white print:border-slate-200">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-indigo-600 font-bold uppercase tracking-widest text-xs">
                                    <span className="w-8 h-[2px] bg-indigo-600"></span>
                                    Recipient
                                </div>
                                {quotation.lead ? (
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{quotation.lead.firstName} {quotation.lead.lastName}</h3>
                                            {quotation.lead.company && <p className="text-slate-500 dark:text-slate-400 font-semibold">{quotation.lead.company}</p>}
                                        </div>
                                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            {quotation.lead.address && <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {quotation.lead.address}</p>}
                                            <p className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /> {quotation.lead.email}</p>
                                            {quotation.lead.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> {quotation.lead.phone}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic font-medium">Customer details not specified</p>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    <span className="w-8 h-[2px] bg-slate-300"></span>
                                    Subject & Description
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{quotation.title}</h3>
                                    {quotation.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            {quotation.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="mb-12 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 border-b border-slate-800">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center w-16">#</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center w-24">Qty</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right w-40">Unit Price</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 text-right w-40">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(quotation as any).items?.map((item: any, index: number) => (
                                        <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-6 text-sm font-black text-slate-300 dark:text-slate-600 text-center">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                                                {item.description && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2">{item.description}</p>}
                                            </td>
                                            <td className="px-6 py-6 text-sm font-bold text-slate-900 dark:text-white text-center">
                                                {item.quantity} <span className="text-[10px] text-slate-400 uppercase ml-1">{item.unit || 'pcs'}</span>
                                            </td>
                                            <td className="px-6 py-6 text-sm font-semibold text-slate-900 dark:text-white text-right font-mono">
                                                {quotation.currency} {Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-6 text-sm font-black text-slate-900 dark:text-white text-right font-mono">
                                                {quotation.currency} {Number(item.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col md:flex-row justify-between gap-12 border-t border-slate-100 dark:border-slate-800 pt-16">
                            <div className="max-w-md space-y-8 flex-1">
                                {quotation.notes && (
                                    <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <AlertCircle className="w-3.5 h-3.5" /> Additional Notes
                                        </h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{quotation.notes}</p>
                                    </div>
                                )}

                                {quotation.terms && (
                                    <div className="space-y-4 p-6 bg-indigo-50/30 dark:bg-slate-800/30 rounded-2xl border border-indigo-100/50 dark:border-slate-800/50">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5" /> Terms & Conditions
                                        </h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{quotation.terms}</p>
                                    </div>
                                )}
                            </div>

                            <div className="min-w-[320px] space-y-4">
                                <div className="space-y-3 px-2">
                                    <div className="flex justify-between text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <span>Subtotal</span>
                                        <span className="text-slate-900 dark:text-white">{quotation.currency} {Number(quotation.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    {Number(quotation.taxAmount) > 0 && (
                                        <div className="flex justify-between text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <span>Tax Amount</span>
                                            <span className="text-slate-900 dark:text-white">+{quotation.currency} {Number(quotation.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {Number(quotation.discountAmount) > 0 && (
                                        <div className="flex justify-between text-sm font-bold text-red-500 uppercase tracking-wider">
                                            <span>Discount</span>
                                            <span>-{quotation.currency} {Number(quotation.discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Total Amount Due</span>
                                        <Calendar className="w-4 h-4 text-indigo-200 opacity-50" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-bold opacity-70">{quotation.currency}</span>
                                        <span className="text-4xl font-black tracking-tighter tabular-nums">
                                            {Number(quotation.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Text */}
                        <div className="mt-24 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Thank you for choosing {businessSettings?.companyName || 'our services'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">This is a computer generated document and does not require a physical signature.</p>
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
