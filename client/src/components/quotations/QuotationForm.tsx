import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, DollarSign } from 'lucide-react';
import { Button, Card } from '../ui';
import { getCurrencyByCountry } from '../../utils/countryUtils';
import apiClient from '../../services/apiClient';
import { taxesService, Tax } from '../../services/taxesService';

interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost?: number;
  currency: string;
  unit?: string;
  taxRate?: number;
}

interface QuotationItem {
  productId?: number;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
}

interface Customer {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface QuotationFormProps {
  entityType?: 'lead' | 'deal' | 'contact';
  entityId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const QuotationForm: React.FC<QuotationFormProps> = ({
  entityType,
  entityId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [availableTaxes, setAvailableTaxes] = useState<Tax[]>([]);
  const [taxesLoading, setTaxesLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([
    {
      name: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      unitPrice: 0,
      taxRate: 0,
      discountRate: 0,
    },
  ]);

  useEffect(() => {
    fetchTemplateData();
  }, [entityType, entityId]);

  // Auto-select currency when customer country is available
  useEffect(() => {
    if (customer?.country) {
      const newCurrency = getCurrencyByCountry(customer.country);
      if (newCurrency) {
        setCurrency(newCurrency);
      }
    }
  }, [customer]);

  const [quotationNumber, setQuotationNumber] = useState('');

  // Fetch taxes on component mount
  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        const data = await taxesService.getAll();
        setAvailableTaxes(data);
      } catch (error) {
        console.error('Failed to fetch taxes:', error);
      } finally {
        setTaxesLoading(false);
      }
    };
    fetchTaxes();
  }, []);

  const fetchTemplateData = async () => {
    try {
      setLoading(true);
      const params = entityType && entityId ? { entityType, entityId } : {};
      console.log('Fetching quotation template with params:', params);

      const [templateResponse, nextNumberResponse] = await Promise.all([
        apiClient.get('/quotations/template', { params }),
        apiClient.get('/quotations/next-number')
      ]);

      console.log('Quotation template response:', templateResponse.data);

      if (templateResponse.data.success) {
        const data = templateResponse.data.data;
        console.log('Customer data received:', data.customer);

        setProducts(data.products || []);
        setAvailableCurrencies(data.availableCurrencies || []);
        setCustomer(data.customer);
        setCurrency(data.suggestedCurrency || data.defaultCurrency || 'USD');

        // Pre-fill suggested products if available
        if (data.suggestedProducts && data.suggestedProducts.length > 0) {
          setItems(
            data.suggestedProducts.map((p: any) => ({
              name: p.name,
              quantity: p.quantity || 1,
              unit: 'pcs',
              unitPrice: Number(p.price) || 0,
              taxRate: 0,
              discountRate: 0,
            }))
          );
        }

        // Set default terms
        setTerms(
          'Payment is due within 30 days from the date of this quotation.\\nThis quotation is valid for 30 days.\\nPrices are subject to change without notice.'
        );
      }

      if (nextNumberResponse.data.success) {
        setQuotationNumber(nextNumberResponse.data.data.nextNumber);
      }
    } catch (error) {
      console.error('Error fetching template data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        name: '',
        description: '',
        quantity: 1,
        unit: 'pcs',
        unitPrice: 0,
        taxRate: 0,
        discountRate: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const selectProduct = (index: number, product: Product) => {
    updateItem(index, 'productId', product.id);
    updateItem(index, 'name', product.name);
    updateItem(index, 'description', product.description || '');
    updateItem(index, 'unitPrice', Number(product.price));
    updateItem(index, 'unit', product.unit || 'pcs');
    updateItem(index, 'taxRate', Number(product.taxRate || 0));
    setShowProductSearch(false);
  };

  const calculateItemTotal = (item: QuotationItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = subtotal * (item.discountRate / 100);
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * (item.taxRate / 100);
    return taxableAmount + tax;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;

      const itemDiscount = itemSubtotal * (item.discountRate / 100);
      discountAmount += itemDiscount;

      const taxableAmount = itemSubtotal - itemDiscount;
      const itemTax = taxableAmount * (item.taxRate / 100);
      taxAmount += itemTax;
    });

    const totalAmount = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || items.length === 0 || items.some((item) => !item.name)) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        quotationNumber: quotationNumber || undefined,
        title,
        description,
        currency,
        validUntil: validUntil || null,
        notes,
        terms,
        items,
        ...(entityType === 'lead' && { leadId: parseInt(entityId!) }),
        ...(entityType === 'deal' && { dealId: parseInt(entityId!) }),
        ...(entityType === 'contact' && { contactId: parseInt(entityId!) }),
      };

      const response = await apiClient.post('/quotations', payload);

      if (response.data.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      alert('Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const getCurrencySymbol = (code: string): string => {
    const curr = availableCurrencies.find((c) => c.code === code);
    return curr?.symbol || code;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Quotation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info */}
          {customer && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Customer Information (Auto-filled from Lead)
                </h3>
                <span className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full font-medium">
                  Lead Data
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase mb-1">Name</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100 text-base">
                      {customer.fullName}
                    </div>
                  </div>
                  {customer.company && (
                    <div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase mb-1">Company</div>
                      <div className="text-blue-800 dark:text-blue-200">
                        {customer.company}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase mb-1">Email</div>
                    <div className="text-blue-800 dark:text-blue-200">
                      {customer.email}
                    </div>
                  </div>
                  {customer.phone && (
                    <div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase mb-1">Phone</div>
                      <div className="text-blue-800 dark:text-blue-200">
                        {customer.phone}
                      </div>
                    </div>
                  )}
                </div>
                {(customer.address || customer.city || customer.state || customer.zipCode || customer.country) && (
                  <div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase mb-1">Address</div>
                    <div className="text-blue-800 dark:text-blue-200 text-sm">
                      {customer.address && <div>{customer.address}</div>}
                      {(customer.city || customer.state || customer.zipCode) && (
                        <div>
                          {customer.city}{customer.city && customer.state && ', '}{customer.state} {customer.zipCode}
                        </div>
                      )}
                      {customer.country && <div>{customer.country}</div>}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quotation Number
              </label>
              <input
                type="text"
                value={quotationNumber || 'Auto-generated'}
                readOnly
                disabled
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-generated from Business Settings</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., Website Development Services"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <div className="relative">
                <DollarSign
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white appearance-none"
                >
                  {availableCurrencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol}) - {curr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
              placeholder="Brief description of the quotation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valid Until
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Line Items
              </h3>
              <Button
                type="button"
                variant="OUTLINE"
                size="SM"
                onClick={addItem}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Item Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(index, 'name', e.target.value)}
                              onFocus={() => setShowProductSearch(true)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                              placeholder="Search or enter item name"
                              required
                            />
                            {showProductSearch && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                                <div className="p-2">
                                  <input
                                    type="text"
                                    value={searchProduct}
                                    onChange={(e) => setSearchProduct(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                                    placeholder="Search products..."
                                  />
                                </div>
                                {filteredProducts.slice(0, 5).map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => selectProduct(index, product)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                  >
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {product.name}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {getCurrencySymbol(product.currency)}
                                      {product.price.toFixed(2)}
                                      {product.sku && ` • SKU: ${product.sku}`}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                            placeholder="Optional description"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                            placeholder="pcs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tax Rate (%)
                          </label>
                          <select
                            value={item.taxRate}
                            onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                            disabled={taxesLoading}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white appearance-none disabled:opacity-50"
                          >
                            <option value="0">No Tax</option>
                            {!taxesLoading && availableTaxes
                              .filter(t => t.isActive)
                              .map(tax => (
                                <option key={tax.id} value={Number(tax.rate)}>
                                  {tax.name} ({tax.rate}%)
                                </option>
                              ))
                            }
                            {taxesLoading && <option disabled>Loading taxes...</option>}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            value={item.discountRate}
                            onChange={(e) => updateItem(index, 'discountRate', parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div className="flex items-end">
                          <div className="w-full">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Total
                            </label>
                            <div className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg font-bold text-gray-900 dark:text-white">
                              {getCurrencySymbol(currency)}
                              {calculateItemTotal(item).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  {getCurrencySymbol(currency)}
                  {totals.subtotal.toFixed(2)}
                </span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Discount:</span>
                  <span className="font-semibold text-red-600">
                    -{getCurrencySymbol(currency)}
                    {totals.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Tax:</span>
                  <span className="font-semibold">
                    {getCurrencySymbol(currency)}
                    {totals.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-t-2 border-blue-300 dark:border-blue-700 pt-3">
                <span>Total:</span>
                <span>
                  {getCurrencySymbol(currency)}
                  {totals.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                placeholder="Additional notes for the customer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Terms & Conditions
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                placeholder="Terms and conditions"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="OUTLINE" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationForm;
