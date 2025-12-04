import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { CreditCard, ArrowLeft, Save, Plus, Trash2, DollarSign, Percent, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import { CurrencySettings, TaxSettings, TaxRate } from '../../features/business-settings/types';

const CurrencyTaxSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currencySettings, taxSettings, updateCurrencySettings, updateTaxSettings, isLoading } = useBusinessSettings();
  
  const [currencyData, setCurrencyData] = useState<Partial<CurrencySettings>>({
    primary: 'INR',
    symbol: '₹',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    supportedCurrencies: ['INR', 'USD', 'EUR'],
    autoUpdateRates: false,
  });

  const [taxData, setTaxData] = useState<Partial<TaxSettings>>({
    defaultRate: 18,
    type: 'GST',
    inclusive: false,
    customRates: [],
    registrationNumber: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currencySettings) {
      setCurrencyData(currencySettings);
    }
    if (taxSettings) {
      setTaxData(taxSettings);
    }
  }, [currencySettings, taxSettings]);

  const handleCurrencyChange = (field: keyof CurrencySettings, value: any) => {
    setCurrencyData(prev => ({ ...prev, [field]: value }));
  };

  const handleTaxChange = (field: keyof TaxSettings, value: any) => {
    setTaxData(prev => ({ ...prev, [field]: value }));
  };

  const addCustomTaxRate = () => {
    const newRate: TaxRate = {
      name: '',
      rate: 0,
      description: '',
      isActive: true,
    };
    setTaxData(prev => ({
      ...prev,
      customRates: [...(prev.customRates || []), newRate]
    }));
  };

  const updateCustomTaxRate = (index: number, field: keyof TaxRate, value: any) => {
    setTaxData(prev => ({
      ...prev,
      customRates: prev.customRates?.map((rate, i) => 
        i === index ? { ...rate, [field]: value } : rate
      )
    }));
  };

  const removeCustomTaxRate = (index: number) => {
    setTaxData(prev => ({
      ...prev,
      customRates: prev.customRates?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await Promise.all([
        updateCurrencySettings(currencyData),
        updateTaxSettings(taxData)
      ]);
      toast.success('Currency and tax settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  ];

  const taxTypes = [
    { value: 'GST', label: 'GST (Goods & Services Tax)' },
    { value: 'VAT', label: 'VAT (Value Added Tax)' },
    { value: 'SALES_TAX', label: 'Sales Tax' },
    { value: 'CUSTOM', label: 'Custom Tax' },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="GHOST"
          size="sm"
          onClick={() => navigate('/business-settings')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Currency & Tax Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure currency preferences and tax calculations
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Currency Configuration
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Currency *
                </label>
                <select
                  value={currencyData.primary || ''}
                  onChange={(e) => {
                    const selectedCurrency = currencies.find(c => c.code === e.target.value);
                    handleCurrencyChange('primary', e.target.value);
                    if (selectedCurrency) {
                      handleCurrencyChange('symbol', selectedCurrency.symbol);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Currency</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency Symbol *
                </label>
                <input
                  type="text"
                  value={currencyData.symbol || ''}
                  onChange={(e) => handleCurrencyChange('symbol', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symbol Position
                </label>
                <select
                  value={currencyData.position || 'before'}
                  onChange={(e) => handleCurrencyChange('position', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="before">Before Amount (₹100)</option>
                  <option value="after">After Amount (100₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Decimal Places
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={currencyData.decimalPlaces || 2}
                  onChange={(e) => handleCurrencyChange('decimalPlaces', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thousand Separator
                </label>
                <select
                  value={currencyData.thousandSeparator || ','}
                  onChange={(e) => handleCurrencyChange('thousandSeparator', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value=",">Comma (1,000)</option>
                  <option value=".">Period (1.000)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Decimal Separator
                </label>
                <select
                  value={currencyData.decimalSeparator || '.'}
                  onChange={(e) => handleCurrencyChange('decimalSeparator', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value=".">Period (100.50)</option>
                  <option value=",">Comma (100,50)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoUpdateRates"
                checked={currencyData.autoUpdateRates || false}
                onChange={(e) => handleCurrencyChange('autoUpdateRates', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="autoUpdateRates" className="text-sm text-gray-700 dark:text-gray-300">
                Auto-update exchange rates daily
              </label>
            </div>

            {/* Currency Preview */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h4>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {currencyData.position === 'before' 
                  ? `${currencyData.symbol}1${currencyData.thousandSeparator}234${currencyData.decimalSeparator}${('56').padEnd(currencyData.decimalPlaces || 2, '0')}`
                  : `1${currencyData.thousandSeparator}234${currencyData.decimalSeparator}${('56').padEnd(currencyData.decimalPlaces || 2, '0')}${currencyData.symbol}`
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Tax Configuration
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Type *
                </label>
                <select
                  value={taxData.type || 'GST'}
                  onChange={(e) => handleTaxChange('type', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {taxTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Tax Rate (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxData.defaultRate || 0}
                  onChange={(e) => handleTaxChange('defaultRate', parseFloat(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Registration Number
                </label>
                <input
                  type="text"
                  value={taxData.registrationNumber || ''}
                  onChange={(e) => handleTaxChange('registrationNumber', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter GST/VAT registration number"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="taxInclusive"
                checked={taxData.inclusive || false}
                onChange={(e) => handleTaxChange('inclusive', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="taxInclusive" className="text-sm text-gray-700 dark:text-gray-300">
                Tax inclusive pricing (tax is included in the displayed price)
              </label>
            </div>

            {/* Custom Tax Rates */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Custom Tax Rates</h4>
                <Button
                  type="button"
                  variant="OUTLINE"
                  size="sm"
                  onClick={addCustomTaxRate}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Rate
                </Button>
              </div>

              {taxData.customRates && taxData.customRates.length > 0 && (
                <div className="space-y-3">
                  {taxData.customRates.map((rate, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rate Name *
                          </label>
                          <input
                            type="text"
                            value={rate.name || ''}
                            onChange={(e) => updateCustomTaxRate(index, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="e.g., SGST, CGST"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rate (%) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={rate.rate || 0}
                            onChange={(e) => updateCustomTaxRate(index, 'rate', parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={rate.description || ''}
                            onChange={(e) => updateCustomTaxRate(index, 'description', e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="Optional description"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={rate.isActive}
                            onChange={(e) => updateCustomTaxRate(index, 'isActive', e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                          <Button
                            type="button"
                            variant="GHOST"
                            size="sm"
                            onClick={() => removeCustomTaxRate(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
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

export default CurrencyTaxSettingsPage;