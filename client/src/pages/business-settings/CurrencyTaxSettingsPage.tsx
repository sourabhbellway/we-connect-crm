import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { Card, CardContent, Button } from '../../components/ui';
import { ArrowLeft, Save, Plus, Trash2, Percent, Coins, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import { TaxSettings } from '../../features/business-settings/types';
import { taxesService, Tax } from '../../services/taxesService';
import { currenciesService, Currency } from '../../services/currenciesService';

const CurrencyTaxSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { taxSettings, updateTaxSettings, isLoading } = useBusinessSettings();

  // Global Tax Settings State
  const [taxData, setTaxData] = useState<Partial<TaxSettings>>({
    defaultRate: 18,
    type: 'GST',
    inclusive: false,
    registrationNumber: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Dynamic Tax Rates State
  const [taxes, setTaxes] = useState<any[]>([]);
  const [loadingTaxes, setLoadingTaxes] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<any | null>(null);

  // Modal Form State
  const [rateName, setRateName] = useState('');
  const [rateValue, setRateValue] = useState(0);
  const [rateDescription, setRateDescription] = useState('');
  const [rateIsActive, setRateIsActive] = useState(true);
  const [isSavingRate, setIsSavingRate] = useState(false);

  // Currency Management State
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  // Currency Form State
  const [currencyName, setCurrencyName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [currencyIsActive, setCurrencyIsActive] = useState(true);
  const [currencyIsDefault, setCurrencyIsDefault] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);

  useEffect(() => {
    if (taxSettings) {
      setTaxData(taxSettings);
    }
  }, [taxSettings]);

  useEffect(() => {
    fetchTaxes();
    fetchCurrencies();
  }, []);

  const fetchTaxes = async () => {
    try {
      const data = await taxesService.getAll();
      setTaxes(data);
    } catch (error) {
      console.error('Failed to fetch taxes', error);
      toast.error('Failed to load tax rates');
    } finally {
      setLoadingTaxes(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const data = await currenciesService.getAll();
      setCurrencies(data);
    } catch (error) {
      console.error('Failed to fetch currencies', error);
      toast.error('Failed to load currencies');
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateTaxSettings(taxData);
      toast.success('Tax settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Tax Rate Modal Handlers
  const openCreateModal = () => {
    setEditingTax(null);
    setRateName('');
    setRateValue(0);
    setRateDescription('');
    setRateIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (tax: any) => {
    setEditingTax(tax);
    setRateName(tax.name);
    setRateValue(Number(tax.rate));
    setRateDescription(tax.description || '');
    setRateIsActive(tax.isActive);
    setIsModalOpen(true);
  };

  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRate(true);
    try {
      const payload = {
        name: rateName,
        rate: rateValue,
        description: rateDescription,
        isActive: rateIsActive,
      };

      if (editingTax) {
        await taxesService.update(editingTax.id, payload);
        toast.success('Tax rate updated');
      } else {
        await taxesService.create(payload);
        toast.success('Tax rate created');
      }
      setIsModalOpen(false);
      fetchTaxes();
    } catch (error) {
      toast.error('Failed to save tax rate');
    } finally {
      setIsSavingRate(false);
    }
  };

  const handleDeleteTax = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tax rate?')) return;
    try {
      await taxesService.delete(id);
      toast.success('Tax rate deleted');
      fetchTaxes();
    } catch (error) {
      toast.error('Failed to delete tax rate');
    }
  };

  // Currency Handlers
  const openCreateCurrencyModal = () => {
    setEditingCurrency(null);
    setCurrencyName('');
    setCurrencyCode('');
    setCurrencySymbol('');
    setExchangeRate(1);
    setCurrencyIsActive(true);
    setCurrencyIsDefault(false);
    setIsCurrencyModalOpen(true);
  };

  const openEditCurrencyModal = (currency: Currency) => {
    setEditingCurrency(currency);
    setCurrencyName(currency.name);
    setCurrencyCode(currency.code);
    setCurrencySymbol(currency.symbol);
    setExchangeRate(Number(currency.exchangeRate));
    setCurrencyIsActive(currency.isActive);
    setCurrencyIsDefault(currency.isDefault);
    setIsCurrencyModalOpen(true);
  };

  const handleSaveCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCurrency(true);
    try {
      const payload = {
        name: currencyName,
        code: currencyCode,
        symbol: currencySymbol,
        exchangeRate: exchangeRate,
        isActive: currencyIsActive,
        isDefault: currencyIsDefault,
      };

      if (editingCurrency) {
        await currenciesService.update(editingCurrency.id, payload);
        toast.success('Currency updated');
      } else {
        await currenciesService.create(payload);
        toast.success('Currency created');
      }
      setIsCurrencyModalOpen(false);
      fetchCurrencies();
    } catch (error) {
      toast.error('Failed to save currency');
    } finally {
      setIsSavingCurrency(false);
    }
  };

  const handleSetDefault = async (currency: Currency) => {
    try {
      await currenciesService.update(currency.id, { isDefault: true });
      toast.success(`${currency.name} set as default`);
      fetchCurrencies();
    } catch (error) {
      toast.error('Failed to set default currency');
    }
  };

  const handleDeleteCurrency = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this currency?')) return;
    try {
      await currenciesService.delete(id);
      toast.success('Currency deleted');
      fetchCurrencies();
    } catch (error) {
      toast.error('Failed to delete currency');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
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
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
            <Coins className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Currency & Tax Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure currencies and tax calculations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Currency Settings */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Currencies
                </h4>
                <p className="text-sm text-gray-500">Manage currencies and exchange rates.</p>
              </div>
              <Button
                type="button"
                variant="OUTLINE"
                size="SM"
                onClick={openCreateCurrencyModal}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Currency
              </Button>
            </div>

            {loadingCurrencies ? (
              <div className="text-center py-4 text-gray-500">Loading currencies...</div>
            ) : (
              <div className="space-y-3">
                {currencies.map((currency) => (
                  <div key={currency.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800/50 flex items-center justify-between hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 font-bold">
                        {currency.symbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">{currency.name} ({currency.code})</p>
                          {currency.isDefault && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">Default</span>}
                          {!currency.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Inactive</span>}
                        </div>
                        <p className="text-xs text-gray-500">Rate: 1 USD = {currency.exchangeRate} {currency.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!currency.isDefault && currency.isActive && (
                        <Button
                          type="button"
                          variant="GHOST"
                          size="SM"
                          onClick={() => handleSetDefault(currency)}
                          className="px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="GHOST"
                        size="SM"
                        onClick={() => openEditCurrencyModal(currency)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="GHOST"
                        size="SM"
                        onClick={() => handleDeleteCurrency(currency.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {currencies.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                    <p className="text-sm text-gray-500">No currencies found. Click "Add Currency" to get started.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-500" />
                  Tax Rates
                </h4>
                <p className="text-sm text-gray-500">Manage available tax rates for documents.</p>
              </div>
              <Button
                type="button"
                variant="OUTLINE"
                size="SM"
                onClick={openCreateModal}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add New Rate
              </Button>
            </div>

            {loadingTaxes ? (
              <div className="text-center py-4 text-gray-500">Loading rates...</div>
            ) : (
              <div className="space-y-3">
                {taxes.map((tax: Tax) => (
                  <div key={tax.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800/50 flex items-center justify-between hover:border-blue-500/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">{tax.name} ({tax.rate}%)</p>
                        {!tax.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Inactive</span>}
                      </div>
                      {tax.description && <p className="text-xs text-gray-500">{tax.description}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="GHOST"
                        size="SM"
                        onClick={() => openEditModal(tax)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="GHOST"
                        size="SM"
                        onClick={() => handleDeleteTax(tax.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {taxes.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                    <p className="text-sm text-gray-500">No tax rates found. Click "Add New Rate" to get started.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="hidden">

        {/* Action Buttons for Global Settings */}
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

      {/* Currency Modal */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
                </h2>
              </div>
              <button
                onClick={() => setIsCurrencyModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSaveCurrency} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Currency Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={currencyName}
                    onChange={(e) => setCurrencyName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="e.g. US Dollar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Currency Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="e.g. USD"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="e.g. $"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Exchange Rate (1 USD = ?) *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.000001"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 italic">Enter how much of this currency equals 1 US Dollar.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={currencyIsActive}
                        onChange={(e) => setCurrencyIsActive(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-gray-600 checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                      />
                      <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={currencyIsDefault}
                        onChange={(e) => setCurrencyIsDefault(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-gray-600 checked:border-blue-600 checked:bg-blue-600 transition-all"
                      />
                      <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Set as Default</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="GHOST"
                  onClick={() => setIsCurrencyModalOpen(false)}
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingCurrency}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  {isSavingCurrency ? 'Saving...' : (editingCurrency ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Rate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Percent className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingTax ? 'Edit Tax Rate' : 'Add Tax Rate'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSaveTax} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={rateName}
                  onChange={(e) => setRateName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="e.g. GST 18%"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Rate (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  value={rateValue}
                  onChange={(e) => setRateValue(parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={rateDescription}
                  onChange={(e) => setRateDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="rateActive"
                    checked={rateIsActive}
                    onChange={(e) => setRateIsActive(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-gray-600 checked:border-blue-600 checked:bg-blue-600 transition-all"
                  />
                  <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <label htmlFor="rateActive" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Active
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="GHOST"
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingRate}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  {isSavingRate ? 'Saving...' : (editingTax ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyTaxSettingsPage;