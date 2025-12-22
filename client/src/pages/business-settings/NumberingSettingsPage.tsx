import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, PageLoader } from '../../components/ui';
import { ArrowLeft, Save, Hash, FileText, Receipt, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';

interface NumberingSettings {
  quotePrefix: string;
  quoteSuffix: string;
  quotePad: number;
  invoicePrefix: string;
  invoiceSuffix: string;
  invoicePad: number;
  quoteNumberingEnabled: boolean;
  invoiceNumberingEnabled: boolean;
}

const NumberingSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NumberingSettings>({
    quotePrefix: 'Q-',
    quoteSuffix: '',
    quotePad: 6,
    invoicePrefix: 'INV-',
    invoiceSuffix: '',
    invoicePad: 6,
    quoteNumberingEnabled: true,
    invoiceNumberingEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNumberingSettings();
  }, []);

  const fetchNumberingSettings = async () => {
    try {
      const response = await apiClient.get('/business-settings/numbering');
      if (response.data.success) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching numbering settings:', error);
      toast.error('Failed to load numbering settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof NumberingSettings, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await apiClient.put('/business-settings/numbering', formData);
      if (response.data.success) {
        toast.success('Numbering settings updated successfully');
      }
    } catch (error: any) {
      console.error('Failed to update numbering settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update numbering settings');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePreview = (prefix: string, suffix: string, pad: number, number: number = 1) => {
    return `${prefix}${String(number).padStart(pad, '0')}${suffix}`;
  };


  if (isLoading) {
    return <PageLoader message="Loading numbering settings..." />;
  }

  return (
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
            <Hash className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Document Numbering
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure prefixes, suffixes, and numbering formats for quotations and invoices
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quotation Numbering */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Quotation Numbering
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.quoteNumberingEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.quoteNumberingEnabled}
                    onChange={(e) => handleInputChange('quoteNumberingEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prefix *
                </label>
                <input
                  type="text"
                  value={formData.quotePrefix}
                  onChange={(e) => handleInputChange('quotePrefix', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Q-"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Characters before the number (e.g., Q-, QUOTE-)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suffix
                </label>
                <input
                  type="text"
                  value={formData.quoteSuffix}
                  onChange={(e) => handleInputChange('quoteSuffix', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="-2025"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Characters after the number (e.g., -2025, /2025)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Zero Padding *
                </label>
                <input
                  type="number"
                  value={formData.quotePad}
                  onChange={(e) => handleInputChange('quotePad', parseInt(e.target.value) || 6)}
                  min="1"
                  max="10"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Number of digits (e.g., 6 = Q-000001)
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">First quotation:</span>
                  <p className="font-mono font-semibold text-blue-700 dark:text-blue-300">
                    {generatePreview(formData.quotePrefix, formData.quoteSuffix, formData.quotePad, 1)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">100th quotation:</span>
                  <p className="font-mono font-semibold text-blue-700 dark:text-blue-300">
                    {generatePreview(formData.quotePrefix, formData.quoteSuffix, formData.quotePad, 100)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">1000th quotation:</span>
                  <p className="font-mono font-semibold text-blue-700 dark:text-blue-300">
                    {generatePreview(formData.quotePrefix, formData.quoteSuffix, formData.quotePad, 1000)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Numbering */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Invoice Numbering
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.invoiceNumberingEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.invoiceNumberingEnabled}
                    onChange={(e) => handleInputChange('invoiceNumberingEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prefix *
                </label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="INV-"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Characters before the number (e.g., INV-, INVOICE-)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suffix
                </label>
                <input
                  type="text"
                  value={formData.invoiceSuffix}
                  onChange={(e) => handleInputChange('invoiceSuffix', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="-2025"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Characters after the number (e.g., -2025, /2025)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Zero Padding *
                </label>
                <input
                  type="number"
                  value={formData.invoicePad}
                  onChange={(e) => handleInputChange('invoicePad', parseInt(e.target.value) || 6)}
                  min="1"
                  max="10"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Number of digits (e.g., 6 = INV-000001)
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">First invoice:</span>
                  <p className="font-mono font-semibold text-green-700 dark:text-green-300">
                    {generatePreview(formData.invoicePrefix, formData.invoiceSuffix, formData.invoicePad, 1)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">100th invoice:</span>
                  <p className="font-mono font-semibold text-green-700 dark:text-green-300">
                    {generatePreview(formData.invoicePrefix, formData.invoiceSuffix, formData.invoicePad, 100)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">1000th invoice:</span>
                  <p className="font-mono font-semibold text-green-700 dark:text-green-300">
                    {generatePreview(formData.invoicePrefix, formData.invoiceSuffix, formData.invoicePad, 1000)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="OUTLINE"
            onClick={() => {
              setFormData({
                quotePrefix: 'Q-',
                quoteSuffix: '',
                quotePad: 6,
                invoicePrefix: 'INV-',
                invoiceSuffix: '',
                invoicePad: 6,
                quoteNumberingEnabled: true,
                invoiceNumberingEnabled: true,
              });
            }}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <Button
            type="button"
            variant="OUTLINE"
            onClick={() => navigate('/business-settings')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="PRIMARY"
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>

    </div>
  );
};

export default NumberingSettingsPage;