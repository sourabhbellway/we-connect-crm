import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  X, 
  UserPlus, 
  Building, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Calendar,
  RefreshCw
} from "lucide-react";
import { toast } from "react-toastify";
import { Lead } from "../services/leadService";

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
  const { t } = useTranslation();
  
  const [conversionData, setConversionData] = useState<ConversionData>({
    createContact: true,
    createCompany: false,
    createDeal: false,
    contactData: {},
    companyData: {},
  dealData: {
    currency: "USD",
    status: "DRAFT",
    probability: 50,
  },
  });

  // Initialize data when lead changes
  React.useEffect(() => {
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
        },
        companyData: {
          name: lead.company || "",
        },
        dealData: {
          ...prev.dealData,
          title: `Deal with ${lead.firstName} ${lead.lastName}`,
          description: `Deal opportunity from lead conversion`,
        },
      }));
    }
  }, [lead]);

  const handleInputChange = (
    section: keyof ConversionData,
    field: string,
    value: any
  ) => {
    if (section === 'createContact' || section === 'createCompany' || section === 'createDeal') {
      setConversionData(prev => ({
        ...prev,
        [section]: value,
      }));
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
    if (!conversionData.createContact && !conversionData.createCompany && !conversionData.createDeal) {
      toast.error("Please select at least one item to create");
      return;
    }
    
    if (conversionData.createCompany && !conversionData.companyData.name) {
      toast.error("Company name is required");
      return;
    }
    
    if (conversionData.createDeal && !conversionData.dealData.title) {
      toast.error("Deal title is required");
      return;
    }

    try {
      // Clean up empty string values before sending
      const cleanedData = {
        ...conversionData,
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

  const resetForm = () => {
    setConversionData({
      createContact: true,
      createCompany: false,
      createDeal: false,
      contactData: {},
      companyData: {},
      dealData: {
        currency: "USD",
        status: "DRAFT",
        probability: 50,
      },
    });
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Contact */}
            <div className={`border rounded-lg p-4 ${conversionData.createContact ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  checked={conversionData.createContact}
                  onChange={(e) => handleInputChange('createContact', '', e.target.checked)}
                  disabled={isConverting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Create Contact</span>
                </div>
              </div>
              
              {conversionData.createContact && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={conversionData.contactData.firstName || ""}
                        onChange={(e) => handleInputChange('contactData', 'firstName', e.target.value)}
                        disabled={isConverting}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={conversionData.contactData.lastName || ""}
                        onChange={(e) => handleInputChange('contactData', 'lastName', e.target.value)}
                        disabled={isConverting}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={conversionData.contactData.email || ""}
                      onChange={(e) => handleInputChange('contactData', 'email', e.target.value)}
                      disabled={isConverting}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={conversionData.contactData.phone || ""}
                      onChange={(e) => handleInputChange('contactData', 'phone', e.target.value)}
                      disabled={isConverting}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Create Company */}
            <div className={`border rounded-lg p-4 ${conversionData.createCompany ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  checked={conversionData.createCompany}
                  onChange={(e) => handleInputChange('createCompany', '', e.target.checked)}
                  disabled={isConverting}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Create Company</span>
                </div>
              </div>
              
              {conversionData.createCompany && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={conversionData.companyData.name || ""}
                      onChange={(e) => handleInputChange('companyData', 'name', e.target.value)}
                      disabled={isConverting}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={conversionData.companyData.domain || ""}
                      onChange={(e) => handleInputChange('companyData', 'domain', e.target.value)}
                      placeholder="example.com"
                      disabled={isConverting}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

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
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
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
                  {conversionData.createContact && <li>• A new contact will be created with the lead's information</li>}
                  {conversionData.createCompany && <li>• A new company record will be created (or linked if exists)</li>}
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
              disabled={isConverting || (!conversionData.createContact && !conversionData.createCompany && !conversionData.createDeal)}
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