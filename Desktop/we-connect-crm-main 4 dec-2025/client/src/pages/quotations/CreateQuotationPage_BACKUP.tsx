import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Search, DollarSign, Building, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';

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

interface CustomerData {
  id: number;
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

const CreateQuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get initial entity from URL params (if coming from lead/contact profile)
  const initialEntityType = searchParams.get('entityType') as 'lead' | 'contact' | null;
  const initialEntityId = searchParams.get('entityId');

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);
  
  // Related entity selection
  const [relatedType, setRelatedType] = useState<'lead' | 'contact'>(initialEntityType || 'lead');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<CustomerData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

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

  // Product search
  const [searchProduct, setSearchProduct] = useState('');
  const [showProductSearch, setShowProductSearch] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
    
    // If entity is provided in URL, auto-load it
    if (initialEntityId && initialEntityType) {
      loadEntityById(initialEntityType, parseInt(initialEntityId));
    }
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/quotations/template');
      
      if (response.data.success) {
        const data = response.data.data;
        setProducts(data.products || []);
        setAvailableCurrencies(data.availableCurrencies || []);
        setCurrency(data.defaultCurrency || 'USD');
        
        // Set default terms
        setTerms(
          'Payment is due within 30 days from the date of this quotation.\nThis quotation is valid for 30 days.\nPrices are subject to change without notice.'
        );
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const loadEntityById = async (type: 'lead' | 'contact', id: number) => {
    try {
      setLoading(true);
      const endpoint = type === 'lead' ? `/api/leads/${id}` : `/api/contacts/${id}`;
      const response = await apiClient.get(endpoint);
      
      if (response.data.success) {
        const entity = response.data.data?.lead || response.data.data?.contact || response.data.data;
        populateCustomerData(entity, type);
      }
    } catch (error) {
      console.error('Error loading entity:', error);
      toast.error(`Failed to load ${type} data`);
    } finally {
      setLoading(false);
    }
  };

  const searchEntities = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const endpoint = relatedType === 'lead' 
        ? `/api/leads?search=${encodeURIComponent(query)}&limit=10`
        : `/api/contacts?search=${encodeURIComponent(query)}&limit=10`;
      
      const response = await apiClient.get(endpoint);
      
      if (response.data.success) {
        const results = response.data.data?.leads || response.data.data?.contacts || response.data.data || [];
        setSearchResults(results);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching entities:', error);
      toast.error('Failed to search');
    } finally {
      setSearchLoading(false);
    }
  };

  const populateCustomerData = (entity: any, type: 'lead' | 'contact') => {
    const customerData: CustomerData = {
      id: entity.id,
      fullName: `${entity.firstName} ${entity.lastName}`,
      email: entity.email,
      phone: entity.phone || entity.alternatePhone,
      company: entity.company,
      address: entity.address,
      city: entity.city,
      state: entity.state,
      zipCode: entity.zipCode,
      country: entity.country,
    };

    setSelectedEntity(customerData);
    
    // Auto-select currency if available
    if (entity.currency) {
      setCurrency(entity.currency);
    }
    
    setShowSearchResults(false);
    setSearchQuery(customerData.fullName);
    
    toast.success(`${type === 'lead' ? 'Lead' : 'Contact'} data loaded successfully`);
  };

  const handleSelectEntity = (entity: any) => {
    populateCustomerData(entity, relatedType);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchEntities(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, relatedType]);

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
    setShowProductSearch(null);
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

    if (!selectedEntity) {
      toast.error('Please select a lead or contact');
      return;
    }

    if (!title || items.length === 0 || items.some((item) => !item.name)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title,
        description,
        currency,
        validUntil: validUntil || null,
        notes,
        terms,
        items,
        ...(relatedType === 'lead' && { leadId: selectedEntity.id }),
        ...(relatedType === 'contact' && { contactId: selectedEntity.id }),
      };

      const response = await apiClient.post('/api/quotations', payload);

      if (response.data.success) {
        toast.success('Quotation created successfully!');
        navigate('/quotations');
      }
    } catch (error: any) {
      console.error('Error creating quotation:', error);
      toast.error(error.response?.data?.message || 'Failed to create quotation');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Compact Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            New Quotation
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Related Entity Selection */}
          <Card className="p-8 shadow-sm border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-weconnect-red rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Customer Selection
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a lead or contact for this quotation
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Related Type Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Related <span className="text-red-500">*</span>
                </label>
                <select
                  value={relatedType}
                  onChange={(e) => {
                    setRelatedType(e.target.value as 'lead' | 'contact');
                    setSelectedEntity(null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-800 dark:text-white text-base font-medium transition-all"
                  required
                >
                  <option value="">--- Select Type ---</option>
                  <option value="lead">Lead</option>
                  <option value="contact">Contact</option>
                </select>
              </div>

              {/* Search Entity */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Search {relatedType === 'lead' ? 'Lead' : 'Contact'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Type to search ${relatedType === 'lead' ? 'leads' : 'contacts'}...`}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-800 dark:text-white text-base transition-all"
                    required
                    disabled={!relatedType}
                  />
                  {searchLoading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-5 w-5 border-2 border-weconnect-red border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-30">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                    {searchResults.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        onClick={() => handleSelectEntity(entity)}
                        className="w-full text-left px-5 py-4 hover:bg-weconnect-red hover:bg-opacity-10 transition-all border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-weconnect-red to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-sm">
                              {entity.firstName[0]}{entity.lastName[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white group-hover:text-weconnect-red transition-colors">
                              {entity.firstName} {entity.lastName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                              {entity.email}
                            </div>
                            {entity.company && (
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                                <Building size={12} />
                                {entity.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && !searchLoading && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-lg p-6 z-30 text-center">
                    <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No {relatedType}s found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Customer Info */}
            {selectedEntity && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Selected Customer Information
                  </h3>
                  <span className="text-xs px-3 py-1 bg-green-600 text-white rounded-full font-medium">
                    {relatedType === 'lead' ? 'Lead Data' : 'Contact Data'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">Name</div>
                      <div className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                        <User size={16} />
                        {selectedEntity.fullName}
                      </div>
                    </div>
                    {selectedEntity.company && (
                      <div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">Company</div>
                        <div className="text-green-800 dark:text-green-200 flex items-center gap-2">
                          <Building size={16} />
                          {selectedEntity.company}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">Email</div>
                      <div className="text-green-800 dark:text-green-200 flex items-center gap-2">
                        <Mail size={16} />
                        {selectedEntity.email}
                      </div>
                    </div>
                    {selectedEntity.phone && (
                      <div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">Phone</div>
                        <div className="text-green-800 dark:text-green-200 flex items-center gap-2">
                          <Phone size={16} />
                          {selectedEntity.phone}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {(selectedEntity.address || selectedEntity.city || selectedEntity.state || selectedEntity.zipCode || selectedEntity.country) && (
                    <div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">Address</div>
                      <div className="text-green-800 dark:text-green-200 text-sm flex items-start gap-2">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <div>
                          {selectedEntity.address && <div>{selectedEntity.address}</div>}
                          {(selectedEntity.city || selectedEntity.state || selectedEntity.zipCode) && (
                            <div>
                              {selectedEntity.city}{selectedEntity.city && selectedEntity.state && ', '}{selectedEntity.state} {selectedEntity.zipCode}
                            </div>
                          )}
                          {selectedEntity.country && <div>{selectedEntity.country}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Basic Information */}
          <Card className="p-8 shadow-sm border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quotation Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Basic information about this quotation
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-800 dark:text-white text-base transition-all"
                  placeholder="e.g., Website Development Services"
                  required
                  disabled={!selectedEntity}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Currency <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign
                    size={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-800 dark:text-white appearance-none text-base font-medium transition-all"
                    required
                  >
                    {availableCurrencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} ({curr.symbol}) - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-800 dark:text-white resize-none text-base transition-all"
                  placeholder="Brief description of the quotation (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-800 dark:text-white text-base transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </Card>

          {/* Line Items */}
          <Card className="p-8 shadow-sm border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Line Items
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add products or services to this quotation
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="PRIMARY"
                size="SM"
                onClick={addItem}
                className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
              >
                <Plus size={18} />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 relative">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Item Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            onFocus={() => setShowProductSearch(index)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red dark:bg-gray-700 dark:text-white"
                            placeholder="Search or enter item name"
                            required
                          />
                          {showProductSearch === index && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                                <input
                                  type="text"
                                  value={searchProduct}
                                  onChange={(e) => setSearchProduct(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                                  placeholder="Search products..."
                                />
                              </div>
                              {filteredProducts.slice(0, 5).map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => selectProduct(index, product)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red dark:bg-gray-700 dark:text-white"
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red dark:bg-gray-700 dark:text-white"
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red dark:bg-gray-700 dark:text-white"
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tax Rate (%)
                          </label>
                          <input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red dark:bg-gray-700 dark:text-white"
                          />
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div className="flex items-end">
                          <div className="w-full">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Total
                            </label>
                            <div className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-bold text-gray-900 dark:text-white">
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
                </div>
              ))}
            </div>
          </Card>

          {/* Totals Summary */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Summary
            </h2>
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
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-weconnect-red dark:bg-gray-800 dark:text-white"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-weconnect-red dark:bg-gray-800 dark:text-white"
                  placeholder="Terms and conditions"
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-8 border-t-2 border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="OUTLINE" 
              onClick={() => navigate(-1)}
              className="px-8"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedEntity}
              className="min-w-[250px] py-3.5 shadow-lg hover:shadow-xl transition-all text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Creating Quotation...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FileText size={20} />
                  Create Quotation
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuotationPage;
