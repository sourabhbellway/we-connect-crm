import React, { useState, useEffect } from "react";
import {
    X,
    DollarSign,
    CheckCircle,
    AlertCircle,
    RefreshCw
} from "lucide-react";
import { toast } from "react-toastify";
import { Lead } from "../services/leadService";
import { useBusinessSettings } from "../contexts/BusinessSettingsContext";

interface ConversionData {
    createContact: boolean;
    createCompany: boolean;
    createDeal: boolean;
    contactData: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        company?: string;
        position?: string;
        address?: string;
        website?: string;
        notes?: string;
    };
    companyData: {
        name?: string;
        domain?: string;
        slug?: string;
        industryId?: number;
    };
    dealData: {
        title?: string;
        description?: string;
        value?: number;
        currency?: string;
        status?: string;
        probability?: number;
        expectedCloseDate?: string;
    };
}

interface LeadConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConvert: (data: ConversionData) => Promise<void>;
    lead: Lead | null;
    isConverting: boolean;
}

const LeadConversionModal: React.FC<LeadConversionModalProps> = ({
    isOpen,
    onClose,
    onConvert,
    lead,
    isConverting,
}) => {
    const { dealStatuses, currencySettings } = useBusinessSettings();

    const [conversionData, setConversionData] = useState<ConversionData>({
        createContact: false, // Always false - contact creation removed
        createCompany: false,
        createDeal: false,
        contactData: {},
        companyData: {},
        dealData: {
            currency: "USD",
            status: "",
            probability: 50,
        },
    });

    // Initialize data when lead changes
    useEffect(() => {
        if (lead) {
            setConversionData(prev => ({
                ...prev,
                contactData: {
                    firstName: lead.firstName,
                    lastName: lead.lastName,
                    email: lead.email,
                    phone: lead.phone || "",
                    company: lead.company || "",
                    position: lead.position || "",
                    notes: lead.notes || "",
                    website: (lead as any)?.website || "",
                },
                dealData: {
                    ...prev.dealData,
                    title: `Deal with ${lead.firstName} ${lead.lastName}`,
                    description: `Deal opportunity from lead conversion`,
                    value: (lead as any)?.budget ?? (lead as any)?.value ?? undefined,
                    currency: (lead as any)?.currency || currencySettings?.primary || prev.dealData.currency,
                    status: prev.dealData.status || (dealStatuses?.length > 0 ? (dealStatuses.find(s => s.isActive)?.name || dealStatuses[0].name) : "DRAFT"),
                },
            }));
        }
    }, [lead, dealStatuses]);

    const handleInputChange = (
        section: keyof ConversionData,
        field: string,
        value: any
    ) => {
        if (section === 'createDeal') {
            setConversionData(prev => ({
                ...prev,
                [section]: value,
            }));
        } else if (section === 'createContact' || section === 'createCompany') {
            // Ignore createContact and createCompany changes - always keep them false
            return;
        } else {
            setConversionData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value,
                },
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!conversionData.createDeal) {
            toast.error("Please select Create Deal to convert the lead");
            return;
        }

        if (conversionData.createDeal && !conversionData.dealData.title) {
            toast.error("Deal title is required");
            return;
        }

        try {
            // Clean up empty string values before sending
            // Always set createContact to false
            const cleanedData = {
                ...conversionData,
                createContact: false, // Always false - contact creation removed
                contactData: Object.fromEntries(
                    Object.entries(conversionData.contactData).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
                ),
                companyData: Object.fromEntries(
                    Object.entries(conversionData.companyData).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
                ),
                dealData: Object.fromEntries(
                    Object.entries(conversionData.dealData).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
                ),
            };

            await onConvert(cleanedData);
        } catch (error) {
            // Error handling is done in parent component
        }
    };



    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative mx-auto p-5 border max-w-4xl w-full shadow-lg rounded-md bg-white dark:bg-gray-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                        {lead.firstName[0]}{lead.lastName[0]}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Convert Lead: {lead.firstName} {lead.lastName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {lead.email} • {lead.company || "No company"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isConverting}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Conversion Options */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Create Deal */}
                        <div className={`border rounded-lg p-4 ${conversionData.createDeal ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex items-center space-x-3 mb-4">
                                <input
                                    type="checkbox"
                                    checked={conversionData.createDeal}
                                    onChange={(e) => handleInputChange('createDeal', '', e.target.checked)}
                                    disabled={isConverting}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="h-5 w-5 text-purple-600" />
                                    <span className="font-medium text-gray-900 dark:text-white">Create Deal</span>
                                </div>
                            </div>

                            {conversionData.createDeal && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Deal Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={conversionData.dealData.title || ""}
                                            onChange={(e) => handleInputChange('dealData', 'title', e.target.value)}
                                            disabled={isConverting}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Value
                                            </label>
                                            <input
                                                type="number"
                                                value={conversionData.dealData.value || ""}
                                                onChange={(e) => handleInputChange('dealData', 'value', parseFloat(e.target.value) || 0)}
                                                min="0"
                                                step="0.01"
                                                disabled={isConverting}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Currency
                                            </label>
                                            <select
                                                value={conversionData.dealData.currency || "USD"}
                                                onChange={(e) => handleInputChange('dealData', 'currency', e.target.value)}
                                                disabled={isConverting}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                            >
                                                {currencySettings?.currencies?.length ? (
                                                    currencySettings.currencies.map((curr) => (
                                                        <option key={curr.code} value={curr.code}>
                                                            {curr.code} - {curr.name} ({curr.symbol})
                                                        </option>
                                                    ))
                                                ) : currencySettings?.supportedCurrencies?.length ? (
                                                    currencySettings.supportedCurrencies.map((code: string) => (
                                                        <option key={code} value={code}>{code}</option>
                                                    ))
                                                ) : (
                                                    <>
                                                        <option value="USD">USD</option>
                                                        <option value="INR">INR</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="GBP">GBP</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Probability (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={conversionData.dealData.probability || 50}
                                            onChange={(e) => handleInputChange('dealData', 'probability', parseInt(e.target.value) || 0)}
                                            min="0"
                                            max="100"
                                            disabled={isConverting}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={conversionData.dealData.status}
                                            onChange={(e) => handleInputChange('dealData', 'status', e.target.value)}
                                            disabled={isConverting}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            {(dealStatuses || []).filter(s => s.isActive).map(status => (
                                                <option key={status.id} value={status.name}>
                                                    {status.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="text-sm">
                                <p className="text-blue-800 dark:text-blue-200 font-medium">Conversion Summary</p>
                                <ul className="text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                                    <li>• The lead status will be changed to "Converted"</li>
                                    {conversionData.createDeal && <li>• A new deal/opportunity will be created and linked</li>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isConverting}
                            className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isConverting || !conversionData.createDeal}
                            className="px-6 py-2 bg-[#ef444e] text-white text-sm font-medium rounded-lg hover:bg-[#f26971] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isConverting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    <span>Converting...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Convert Lead</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeadConversionModal;
