import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Search, X } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';

interface QuotationItem {
  description: string;
  longDescription: string;
  quantity: number;
  unit: string;
  rate: number;
  taxRate: number;
  amount: number;
  isOptional: boolean;
}

const CreateQuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Form fields
  const [subject, setSubject] = useState('');
  const [relatedType, setRelatedType] = useState<'lead' | 'contact' | ''>('');
  const [relatedId, setRelatedId] = useState('');
  const [status, setStatus] = useState('Draft');
  const [assignedTo, setAssignedTo] = useState('');
  const [toField, setToField] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [openTill, setOpenTill] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [discountType, setDiscountType] = useState('none');
  const [tags, setTags] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  
  // Line items
  const [items, setItems] = useState<QuotationItem[]>([
    {
      description: '',
      longDescription: '',
      quantity: 1,
      unit: 'Unit',
      rate: 0,
      taxRate: 0,
      amount: 0,
      isOptional: false,
    },
  ]);
  
  const [discountValue, setDiscountValue] = useState(0);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [showQuantityAs, setShowQuantityAs] = useState('Qty');

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for leads/contacts with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.length >= 2 && relatedType) {
        searchEntities(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, relatedType]);

  const fetchInitialData = async () => {
    try {
      const response = await apiClient.get('/quotations/template');
      if (response.data.success) {
        const data = response.data.data;
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const searchEntities = async (query: string) => {
    if (!relatedType) {
      toast.info('Please select Lead or Contact first');
      return;
    }
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchLoading(true);
      const endpoint = relatedType === 'lead' 
        ? `/leads?search=${encodeURIComponent(query)}&limit=10`
        : `/contacts?search=${encodeURIComponent(query)}&limit=10`;
      
      console.log('Searching:', endpoint);
      const response = await apiClient.get(endpoint);
      console.log('Search response:', response.data);
      
      if (response.data.success) {
        const results = response.data.data?.leads || response.data.data?.contacts || response.data.data || [];
        console.log('Search results:', results);
        setSearchResults(Array.isArray(results) ? results : []);
        setShowSearchDropdown(true);
      } else {
        setSearchResults([]);
        toast.warning('No results found');
      }
    } catch (error: any) {
      console.error('Error searching entities:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 404) {
        toast.error('Search endpoint not found. Please check server configuration.');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized. Please log in again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to search.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to search. Please try again.');
      }
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectEntity = (entity: any) => {
    setRelatedId(entity.id.toString());
    setToField(`${entity.firstName} ${entity.lastName}`);
    setSearchQuery(`${entity.firstName} ${entity.lastName}`);
    setEmail(entity.email || '');
    setPhone(entity.phone || '');
    setAddress(entity.address || '');
    setCity(entity.city || '');
    setState(entity.state || '');
    setCountry(entity.country || '');
    setZipCode(entity.zipCode || '');
    setShowSearchDropdown(false);
    toast.success(`${relatedType === 'lead' ? 'Lead' : 'Contact'} selected and details auto-filled`);
  };

  const clearSelection = () => {
    setRelatedId('');
    setSearchQuery('');
    setToField('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setState('');
    setCountry('');
    setZipCode('');
    setSearchResults([]);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        longDescription: '',
        quantity: 1,
        unit: 'Unit',
        rate: 0,
        taxRate: 0,
        amount: 0,
        isOptional: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    const item = newItems[index];
    const subtotal = item.quantity * item.rate;
    const tax = subtotal * (item.taxRate / 100);
    item.amount = subtotal + tax;
    
    setItems(newItems);
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubTotal();
    if (discountType === '%') {
      return subtotal * (discountValue / 100);
    }
    return discountValue;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubTotal();
    const discount = calculateDiscount();
    return subtotal - discount + adjustmentValue;
  };

  const handleSubmit = async (sendImmediately = false) => {
    if (!subject || !relatedId || !email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        subject,
        relatedType,
        relatedId: parseInt(relatedId),
        status: sendImmediately ? 'Sent' : status,
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        to: toField,
        address,
        city,
        state,
        country,
        zipCode,
        email,
        phone,
        date,
        openTill,
        currency,
        discountType,
        discountValue,
        adjustmentValue,
        tags,
        allowComments,
        items,
      };

      const response = await apiClient.post('/quotations', payload);

      if (response.data.success) {
        toast.success(`Quotation ${sendImmediately ? 'created and sent' : 'saved'} successfully!`);
        navigate('/quotations');
      }
    } catch (error: any) {
      console.error('Error creating quotation:', error);
      toast.error(error.response?.data?.message || 'Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  const subTotal = calculateSubTotal();
  const discount = calculateDiscount();
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-3">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            New Proposal
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          {/* Form Grid */}
          <div className="grid grid-cols-12 gap-x-4 gap-y-3.5">
            {/* Subject - Full width */}
            <div className="col-span-12">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                <span className="text-red-500">*</span> Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Related */}
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                <span className="text-red-500">*</span> Related
              </label>
              <select
                value={relatedType}
                onChange={(e) => {
                  const newType = e.target.value as 'lead' | 'contact' | '';
                  setRelatedType(newType);
                  clearSelection();
                  if (newType) {
                    setShowSearchDropdown(true);
                  }
                }}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="">---- Select ----</option>
                <option value="lead">Lead</option>
                <option value="contact">Contact</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Viewed">Viewed</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Assigned */}
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Assigned
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* To - Search Box */}
            <div className="col-span-9" ref={searchRef}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                <span className="text-red-500">*</span> To
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => {
                    if (relatedType && searchQuery.length >= 2) {
                      setShowSearchDropdown(true);
                    }
                  }}
                  placeholder={relatedType ? `Type to search ${relatedType}s... (min 2 characters)` : 'Select Related type first'}
                  disabled={!relatedType}
                  className="w-full pl-8 pr-10 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  required
                />
                
                {/* Search hint */}
                {relatedType && !searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-600 dark:text-blue-400 z-40">
                    💡 Start typing to search for {relatedType}s (name, email, company)
                  </div>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                )}
                {searchLoading && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                
                {/* Search Results Dropdown */}
                {showSearchDropdown && relatedType && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                    {searchResults.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        onClick={() => selectEntity(entity)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 dark:text-blue-300 font-semibold text-xs">
                              {entity.firstName?.[0]}{entity.lastName?.[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 dark:text-white">
                              {entity.firstName} {entity.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {entity.email}
                            </div>
                            {entity.company && (
                              <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                {entity.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No Results */}
                {showSearchDropdown && relatedType && searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-6 text-center z-50">
                    <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No {relatedType}s found</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="col-span-12">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* City */}
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* State */}
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Country */}
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="IN">India</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
            </div>

            {/* Zip Code */}
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Email */}
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                <span className="text-red-500">*</span> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Phone */}
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Date */}
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                <span className="text-red-500">*</span> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Open Till */}
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Open Till
              </label>
              <input
                type="date"
                value={openTill}
                onChange={(e) => setOpenTill(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                min={date}
              />
            </div>

            {/* Currency */}
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                <span className="text-red-500">*</span> Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="GBP">GBP £</option>
              </select>
            </div>

            {/* Discount Type */}
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="none">No discount</option>
                <option value="%">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {/* Tags */}
            <div className="col-span-12">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                🏷️ Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tag"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Allow Comments */}
            <div className="col-span-12">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Allow Comments
                </span>
              </label>
            </div>
          </div>

          {/* Line Items */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <select
                  className="px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                >
                  <option>Add Item</option>
                </select>
                <button
                  type="button"
                  onClick={addItem}
                  className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show quantity as:</span>
                <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowQuantityAs('Qty')}
                    className={`px-3 py-1 text-xs ${showQuantityAs === 'Qty' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    Qty
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuantityAs('Hours')}
                    className={`px-3 py-1 text-xs border-l border-gray-300 dark:border-gray-600 ${showQuantityAs === 'Hours' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuantityAs('Qty/Hours')}
                    className={`px-3 py-1 text-xs border-l border-gray-300 dark:border-gray-600 ${showQuantityAs === 'Qty/Hours' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    Qty/Hours
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 w-8">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                    </th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Item</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Description</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Long description</th>
                    <th className="px-2 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">{showQuantityAs}</th>
                    <th className="px-2 py-2 text-center font-semibold text-gray-600 dark:text-gray-300">Unit</th>
                    <th className="px-2 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Rate</th>
                    <th className="px-2 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Tax</th>
                    <th className="px-2 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-2 py-1.5">
                        <input
                          type="checkbox"
                          checked={item.isOptional}
                          onChange={(e) => updateItem(index, 'isOptional', e.target.checked)}
                          className="w-3.5 h-3.5 rounded"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <select className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white">
                          <option>Select...</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <textarea
                          value={item.longDescription}
                          onChange={(e) => updateItem(index, 'longDescription', e.target.value)}
                          placeholder="Long description"
                          rows={1}
                          className="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white resize-none"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-16 px-1.5 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-16 px-1.5 py-1 text-xs text-center border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          placeholder="Rate"
                          className="w-20 px-1.5 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <select
                          value={item.taxRate}
                          onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value))}
                          className="w-20 px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        >
                          <option value="0">No Tax</option>
                          <option value="5">5%</option>
                          <option value="10">10%</option>
                          <option value="18">18%</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5 text-right font-medium text-gray-900 dark:text-white">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.some(item => item.isOptional) && (
              <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                ✓ This item is optional
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between items-center py-1.5 text-sm border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Sub Total :</span>
                <span className="font-semibold text-gray-900 dark:text-white">${subTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center py-1.5 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Discount</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-20 px-2 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  >
                    <option value="%">%</option>
                    <option value="fixed">$</option>
                  </select>
                  <span className="text-red-600 dark:text-red-400 font-medium w-20 text-right">
                    -${discount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 text-sm border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Adjustment</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    className="w-20 px-2 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                  <span className="font-medium text-gray-900 dark:text-white w-20 text-right">
                    ${adjustmentValue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 bg-gray-50 dark:bg-gray-700 rounded px-3">
                <span className="font-bold text-gray-900 dark:text-white">Total :</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Save & Send
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          Include proposal items with merge field anywhere in proposal content as {'{proposal_items}'}
        </p>
      </div>
    </div>
  );
};

export default CreateQuotationPage;
