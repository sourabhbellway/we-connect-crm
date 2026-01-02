import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, PageLoader } from '../../components/ui';
import { FileText, ArrowLeft, CheckCircle2, Layout, Eye, X } from 'lucide-react';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { toast } from 'react-toastify';

const InvoiceTemplatesPage: React.FC = () => {
    const navigate = useNavigate();
    const { companySettings, updateCompanySettings, currencySettings, isLoading } = useBusinessSettings();
    const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

    const templates = [
        { id: 'professional', name: 'Professional Invoice', description: 'Clean modern layout with logo left, invoice details right', type: 'professional' },
        { id: 'template1', name: 'Values - Standard Left', description: 'Clean layout with logo on the left', type: 'standard-left' },
        { id: 'template2', name: 'Classic - Logo Right', description: 'Traditional layout with logo on the right', type: 'classic-right' },
        { id: 'template3', name: 'Bold Header', description: 'Full-width colored header with green theme', type: 'bold-header' },
        { id: 'template5', name: 'Minimalist', description: 'Simple, data-focused black & white', type: 'minimalist' },
    ];

    const getPreviewUI = (type: string) => {
        const BaseDoc = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
            <div className={`bg-white rounded shadow-sm w-full h-full flex flex-col overflow-hidden text-gray-800 relative ${className}`}>
                {children}
            </div>
        );

        const NotesSection = () => (
            <div className="mt-auto pt-4 border-t border-gray-100 pb-2">
                <div className="text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes & Terms</div>
                <div className="text-[6px] text-gray-400 line-clamp-2 italic">Thank you for your business. Please pay within 15 days.</div>
            </div>
        );

        switch (type) {
            case 'professional':
                return (
                    <BaseDoc className="p-6 text-[9px]">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-600"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-orange-500 rounded flex items-center justify-center shadow-sm">
                                    <span className="text-white text-[12px] font-bold">YL</span>
                                </div>
                                <div className="font-bold text-gray-900">YOURLOGO</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[18px] font-bold text-gray-900 tracking-wider">INVOICE</div>
                                <div className="text-[9px] text-gray-500">#INV-2024-001</div>
                            </div>
                        </div>

                        <div className="flex justify-between mb-6">
                            <div className="bg-orange-50 p-2 rounded w-48">
                                <div className="text-[7px] font-bold text-orange-600 mb-1">BILL TO</div>
                                <div className="font-bold text-gray-900">Acme Corp Ltd.</div>
                                <div className="text-gray-500">New Delhi, India</div>
                            </div>
                            <div className="border border-gray-100 p-2 rounded w-32">
                                <div className="text-[7px] font-bold text-gray-400">DATE</div>
                                <div className="font-bold text-gray-900">16 Dec 2024</div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="bg-gray-900 text-white flex text-[7px] font-bold py-1.5 px-2 rounded-t">
                                <div className="flex-1">ITEM</div>
                                <div className="w-12 text-center">QTY</div>
                                <div className="w-20 text-right">TOTAL</div>
                            </div>
                            <div className="flex text-[8px] py-1.5 px-2 border-b border-gray-50">
                                <div className="flex-1">Web Development</div>
                                <div className="w-12 text-center">1</div>
                                <div className="w-20 text-right font-bold">{currencySettings?.symbol || '₹'}50,000</div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 mb-4">
                            <div className="bg-orange-600 text-white px-4 py-2 rounded flex justify-between w-40 items-center">
                                <span className="text-[7px] font-bold">TOTAL</span>
                                <span className="text-[12px] font-bold">{currencySettings?.symbol || '₹'}50,000</span>
                            </div>
                        </div>
                        <NotesSection />
                    </BaseDoc>
                );
            case 'standard-left':
                return (
                    <BaseDoc className="p-6 text-[9px]">
                        <div className="bg-blue-50 -mx-6 -mt-6 p-6 mb-6 flex justify-between items-center border-b border-blue-100">
                            <div className="font-bold text-blue-700 text-[12px]">VALUES</div>
                            <div className="text-[14px] font-bold text-blue-900">INVOICE</div>
                        </div>
                        <div className="flex justify-between mb-6">
                            <div>
                                <div className="text-[7px] font-bold text-blue-600 mb-1">BILL TO</div>
                                <div className="font-bold">Tech Solutions</div>
                            </div>
                            <div className="text-right text-gray-500">#INV-2024-100</div>
                        </div>
                        <div className="flex-1">
                            <div className="bg-blue-600 text-white flex text-[7px] font-bold py-1 px-2">
                                <div className="flex-1">DESCRIPTION</div>
                                <div className="w-20 text-right">AMOUNT</div>
                            </div>
                            <div className="flex py-2 px-2 border-b border-gray-100">
                                <div className="flex-1">Premium Package</div>
                                <div className="w-20 text-right font-bold">{currencySettings?.symbol || '₹'}35,000</div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <div className="text-right">
                                <div className="text-[7px] font-bold text-gray-400">TOTAL DUE</div>
                                <div className="text-[16px] font-bold text-blue-600">{currencySettings?.symbol || '₹'}35,000</div>
                            </div>
                        </div>
                        <NotesSection />
                    </BaseDoc>
                );

            case 'classic-right':
                return (
                    <BaseDoc className="p-6 text-[9px] font-sans text-gray-800">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-[24px] font-bold text-teal-700 tracking-wide mb-2">INVOICE</h1>
                                <div className="text-gray-600 font-bold">#INV-2024-001</div>
                                <div className="text-gray-500 mt-1">Date: 16 Dec 2024</div>
                                <div className="text-gray-500">Due: 30 Dec 2024</div>
                            </div>
                            <div className="text-right">
                                <div className="flex justify-end mb-2">
                                    <div className="h-10 w-10 bg-teal-600 rounded flex items-center justify-center text-white font-bold text-xs">
                                        YL
                                    </div>
                                </div>
                                <div className="font-bold text-gray-900 text-[10px] uppercase">YOUR COMPANY</div>
                                <div className="text-gray-500">123 Business Road</div>
                                <div className="text-gray-500">New York, NY 10010</div>
                                <div className="text-gray-500">contact@company.com</div>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-6">
                            <div className="bg-teal-600 text-white px-2 py-1 font-bold mb-2 inline-block w-full">
                                INVOICE TO
                            </div>
                            <div className="px-2">
                                <div className="font-bold text-gray-900 text-[10px]">Global Enterprises Ltd.</div>
                                <div className="text-gray-500">456 Corporate Blvd</div>
                                <div className="text-gray-500">London, UK</div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1">
                            <div className="bg-teal-600 text-white flex text-[7px] font-bold py-1.5 px-2">
                                <div className="flex-1">DESCRIPTION</div>
                                <div className="w-16 text-right">PRICE</div>
                                <div className="w-10 text-center">QTY</div>
                                <div className="w-16 text-right">TOTAL</div>
                            </div>
                            <div className="flex text-[8px] py-2 px-2 border-b border-gray-100 bg-teal-50/30">
                                <div className="flex-1 font-medium">Brand Strategy Consultation</div>
                                <div className="w-16 text-right">20,000</div>
                                <div className="w-10 text-center">1</div>
                                <div className="w-16 text-right font-bold text-teal-700">{currencySettings?.symbol || '₹'}20,000</div>
                            </div>
                            <div className="flex text-[8px] py-2 px-2 border-b border-gray-100">
                                <div className="flex-1 font-medium">UI/UX Design Phase 1</div>
                                <div className="w-16 text-right">25,000</div>
                                <div className="w-10 text-center">1</div>
                                <div className="w-16 text-right font-bold text-teal-700">{currencySettings?.symbol || '₹'}25,000</div>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mt-4 mb-4">
                            <div className="w-32">
                                <div className="flex justify-between mb-1 text-gray-500">
                                    <span>Subtotal:</span>
                                    <span>45,000</span>
                                </div>
                                <div className="flex justify-between mb-2 text-gray-500">
                                    <span>Tax (10%):</span>
                                    <span>4,500</span>
                                </div>
                                <div className="bg-teal-600 text-white p-1.5 flex justify-between items-center font-bold">
                                    <span>Total:</span>
                                    <span className="text-[10px]">{currencySettings?.symbol || '₹'}49,500</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer: Bank & Signature */}
                        <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                            <div>
                                <div className="text-[7px] font-bold text-teal-700 mb-1">PAYMENT INFO</div>
                                <div className="text-[6px] text-gray-500">Bank: HDFC Bank</div>
                                <div className="text-[6px] text-gray-500">Acct: **********890</div>
                            </div>
                            <div className="text-center">
                                <div className="border-b border-gray-300 w-24 mb-1"></div>
                                <div className="text-[6px] text-gray-400">Authorized Signature</div>
                            </div>
                        </div>
                        <NotesSection />
                    </BaseDoc>
                );
            case 'bold-header':
                return (
                    <BaseDoc className="p-0 text-[9px]">
                        <div className="h-20 bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
                            <div className="font-bold text-gray-900">YOURLOGO</div>
                            <div className="text-right">
                                <div className="text-[7px] font-bold text-emerald-600">BILL TO</div>
                                <div className="font-bold text-gray-900">Industrial Corp</div>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="bg-emerald-600 text-white p-3 rounded-lg mb-6 flex justify-between items-center">
                                <div>
                                    <div className="text-[6px] opacity-80">INVOICE</div>
                                    <div className="text-[10px] font-bold">#2024-100</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[6px] opacity-80">DUE</div>
                                    <div className="text-[10px] font-bold">30 Dec</div>
                                </div>
                            </div>
                            <div className="border-b-2 border-emerald-50 text-[7px] font-bold text-gray-400 py-1 mb-2 flex">
                                <div className="flex-1">ITEM</div>
                                <div className="w-20 text-right">PRICE</div>
                            </div>
                            <div className="flex py-2 border-b border-gray-50">
                                <div className="flex-1 font-bold">Gold Membership Plan</div>
                                <div className="w-20 text-right font-bold">{currencySettings?.symbol || '₹'}50,000</div>
                            </div>
                            <div className="mt-auto flex justify-end pt-4">
                                <div className="text-right">
                                    <div className="text-[7px] font-bold text-gray-400">TOTAL DUE</div>
                                    <div className="text-[20px] font-bold text-emerald-600">{currencySettings?.symbol || '₹'}50,000</div>
                                </div>
                            </div>
                            <NotesSection />
                        </div>
                    </BaseDoc>
                );
            case 'minimalist':
                return (
                    <BaseDoc className="p-8 border-[2px] border-gray-900 text-[9px] flex flex-col">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-8 h-8 bg-gray-900 rounded-full mb-2"></div>
                            <div className="text-[18px] font-black tracking-widest text-center">INVOICE</div>
                        </div>
                        <div className="flex justify-between mb-6 border-b-2 border-gray-900 pb-4">
                            <div>
                                <div className="font-bold">Client Co.</div>
                            </div>
                            <div className="text-right font-mono font-bold">INV-001</div>
                        </div>
                        <div className="flex-1">
                            <div className="flex font-bold border-b border-gray-100 pb-2 mb-2">
                                <div className="flex-1">SERVICES</div>
                                <div className="w-20 text-right">TOTAL</div>
                            </div>
                            <div className="flex mb-2">
                                <div className="flex-1">Consulting</div>
                                <div className="w-20 text-right font-bold">{currencySettings?.symbol || '₹'}60,000</div>
                            </div>
                        </div>
                        <div className="border-t-2 border-gray-900 pt-4 text-right">
                            <div className="text-[24px] font-black">{currencySettings?.symbol || '₹'}60,000</div>
                        </div>
                        <NotesSection />
                    </BaseDoc>
                );
            default:
                return null;
        }
    };
    const handleSelectTemplate = async (templateId: string) => {
        try {
            await updateCompanySettings({ invoiceTemplate: templateId });
            toast.success('Invoice template updated successfully');
        } catch (error) {
            console.error('Failed to update invoice template:', error);
            toast.error('Failed to update invoice template');
        }
    };

    if (isLoading) {
        return <PageLoader message="Loading settings..." />;
    }

    const currentTemplate = (companySettings as any)?.invoiceTemplate || 'template1';

    return (
        <>
            <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="GHOST"
                        size="SM"
                        onClick={() => navigate('/business-settings')}
                        className="p-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Invoice Templates
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Select the design for your invoices
                            </p>
                        </div>
                    </div>
                </div>

                {/* Templates Grid - Enlarged */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {templates.map((template) => {
                        const isSelected = currentTemplate === template.id;
                        return (
                            <div
                                key={template.id}
                                className={`group relative cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 rounded-xl' : ''
                                    }`}
                                onClick={() => handleSelectTemplate(template.id)}
                            >
                                <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-gray-50 dark:bg-gray-800/50">
                                    {/* Preview Area - Even Larger */}
                                    <div className="h-96 relative border-b border-gray-100 dark:border-gray-800 p-10 flex justify-center items-center bg-gray-100 dark:bg-gray-900/50">
                                        <div className="w-72 h-[22rem] shadow-2xl transform transition-transform group-hover:scale-105">
                                            {getPreviewUI(template.type)}
                                        </div>

                                        {/* Preview Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewTemplate(template.type);
                                            }}
                                            className="absolute top-3 right-3 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-110 z-20"
                                            title="Preview Invoice Design"
                                        >
                                            <Eye className="w-4 h-4 text-blue-500" />
                                        </button>

                                        {/* Selection Overlay */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center backdrop-blur-[1px]">
                                                <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg mb-8">
                                                    <CheckCircle2 className="w-8 h-8 text-blue-500" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-4 bg-white dark:bg-gray-800 relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`font-semibold text-sm ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                                }`}>
                                                {template.name}
                                            </h3>
                                            {isSelected && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {template.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                {/* Info Section */}
                <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                    <CardContent className="p-4 flex items-start gap-3">
                        <Layout className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                About Invoice Templates
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                The selected template will be automatically applied to all PDF invoices and quotations generated from the system. content layout and branding will be adjusted according to the chosen style.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Modal */}
            {
                previewTemplate && (
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setPreviewTemplate(null)}
                    >
                        <div
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                            Invoice Design Preview
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {templates.find(t => t.type === previewTemplate)?.name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreviewTemplate(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body - Large Preview */}
                            <div className="p-8 bg-gray-100 dark:bg-gray-800/50 flex justify-center items-center min-h-[500px]">
                                <div className="w-[420px] h-[560px] shadow-2xl rounded-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                                    <div className="bg-white w-full h-full flex flex-col">
                                        {getPreviewUI(previewTemplate)}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Click "Use Template" below or click outside to close
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="SECONDARY"
                                        size="SM"
                                        onClick={() => setPreviewTemplate(null)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="PRIMARY"
                                        size="SM"
                                        onClick={() => {
                                            const template = templates.find(t => t.type === previewTemplate);
                                            if (template) {
                                                handleSelectTemplate(template.id);
                                                setPreviewTemplate(null);
                                            }
                                        }}
                                    >
                                        Use This Template
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default InvoiceTemplatesPage;
