import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import apiClient from '../../services/apiClient';
import { leadService } from '../../services/leadService';
import { contactService } from '../../services/contactService';
import { dealService } from '../../services/dealService';
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
  const { id: editId } = useParams();
  const isEdit = Boolean(editId);
  
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
  const [dealId, setDealId] = useState<string>('');
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

  // Load existing quotation in edit mode
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await apiClient.get(`/quotations/${editId}`);
        const q = res?.data?.data?.quotation || res?.data?.quotation || res?.data;
        if (!q) return;
        setSubject(q.title || '');
        setStatus(q.status ? q.status.charAt(0) + q.status.slice(1).toLowerCase() : 'Draft');
        setCurrency(q.currency || 'USD');
        setOpenTill(q.validUntil ? String(q.validUntil).slice(0, 10) : '');
        setDate(q.createdAt ? String(q.createdAt).slice(0, 10) : date);
        setAddress('');
        setEmail(q.contact?.email || q.lead?.email || email);
        if (q.contact) {
          setRelatedType('contact');
          setRelatedId(String(q.contactId));
          const full = `${q.contact.firstName || ''} ${q.contact.lastName || ''}`.trim();
          setToField(full); setSearchQuery(full);
        } else if (q.lead) {
          setRelatedType('lead');
          setRelatedId(String(q.leadId));
          const full = `${q.lead.firstName || ''} ${q.lead.lastName || ''}`.trim();
          setToField(full); setSearchQuery(full);
        }
        // Map items for UI
        if (Array.isArray(q.items)) {
          setItems(q.items.map((it: any) => ({
            description: it.name || it.description || '',
            longDescription: it.description || '',
            quantity: Number(it.quantity || 1),
            unit: it.unit || 'Unit',
            rate: Number(it.unitPrice || 0),
            taxRate: Number(it.taxRate || 0),
            amount: Number(it.totalAmount || 0),
            isOptional: false,
          })));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [isEdit, editId]);

  // Prefill when opened from an entity context (?entityType=lead|contact|deal&entityId=123)
  useEffect(() => {
    const entityType = (searchParams.get('entityType') as 'lead' | 'contact' | 'deal' | null) || null;
    const entityIdParam = searchParams.get('entityId');
    if (!entityType || !entityIdParam) return;
    const id = parseInt(entityIdParam);
    (async () => {
      try {
        if (entityType === 'lead') {
          const res = await leadService.getLeadById(id);
          const lead = res?.data?.lead || res?.data || res;
          if (lead) {
            setRelatedType('lead');
            setRelatedId(String(lead.id));
            setSubject(`Proposal for ${lead.firstName} ${lead.lastName}`);
            const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
            setToField(fullName);
            setSearchQuery(fullName);
            setEmail(lead.email || '');
            setPhone(lead.phone || '');
            setAddress(lead.address || '');
            setCity(lead.city || '');
            setState(lead.state || '');
            setCountry(lead.country || '');
            setZipCode(lead.zipCode || '');
            if ((lead as any)?.currency) setCurrency((lead as any).currency);
          }
        } else if (entityType === 'contact') {
          const res = await contactService.getContactById(id);
          const contact = res?.data || res;
          if (contact) {
            setRelatedType('contact');
            setRelatedId(String(contact.id));
            const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
            setSubject(`Proposal for ${fullName}`);
            setToField(fullName);
            setSearchQuery(fullName);
            setEmail(contact.email || '');
            setPhone(contact.phone || '');
            setAddress(contact.address || '');
          }
        } else if (entityType === 'deal') {
          const res = await dealService.getDealById(id);
          const deal = (res as any)?.data || res;
          if (deal) {
            setDealId(String(deal.id));
            // Prefer contact if present, else lead
            if (deal.contact) {
              setRelatedType('contact');
              setRelatedId(String(deal.contact.id));
              const fullName = `${deal.contact.firstName || ''} ${deal.contact.lastName || ''}`.trim();
              setSubject(deal.title ? `${deal.title}` : `Proposal for ${fullName || 'Contact'}`);
              setToField(fullName);
              setSearchQuery(fullName);
              setEmail(deal.contact.email || '');
              setPhone(deal.contact.phone || '');
            } else if (deal.lead) {
              setRelatedType('lead');
              setRelatedId(String(deal.lead.id));
              const fullName = `${deal.lead.firstName || ''} ${deal.lead.lastName || ''}`.trim();
              setSubject(deal.title ? `${deal.title}` : `Proposal for ${fullName || 'Lead'}`);
              setToField(fullName);
              setSearchQuery(fullName);
              setEmail(deal.lead.email || '');
              setPhone('');
            } else {
              setSubject(deal.title || 'Proposal');
            }
            if (deal.currency) setCurrency(deal.currency);
          }
        }
      } catch (e) {
        // Fail silently to keep form usable
      }
    })();
  }, [searchParams]);

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
      if (relatedType === 'lead') {
        const res: any = await leadService.getLeads({ page: 1, limit: 10, search: query });
        const results = res?.data?.leads || res?.data?.items || res?.leads || [];
        setSearchResults(results);
      } else {
        const res = await contactService.getContacts(1, 10, query);
        const results = (res as any)?.data?.contacts || [];
        setSearchResults(results);
      }
      setShowSearchDropdown(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to search.');
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
        ...(dealId ? { dealId: parseInt(dealId) } : {}),
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

      const response = isEdit
        ? await apiClient.put(`/quotations/${editId}`, {
            title: subject,
            status: status.toUpperCase(),
            currency,
            validUntil: openTill || null,
            notes: undefined,
            terms: undefined,
          })
        : await apiClient.post('/quotations', payload);

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="container-grid py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Create Quotation</h1>
          <div className="flex items-center gap-2">
            <Button variant="SECONDARY" onClick={() => handleSubmit(false)} disabled={loading}>Save as draft</Button>
            <Button variant="PRIMARY" onClick={() => handleSubmit(true)} loading={loading} loadingText="Saving...">Save & Send</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: form sections */}
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg">
              <div className="grid grid-cols-12 gap-4">
                {/* Subject */}
                <div className="col-span-12">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    <span className="text-red-500">*</span> Subject
                  </label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="input-base" required />
                </div>

                {/* Related */}
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"><span className="text-red-500">*</span> Related</label>
                  <select
                    value={relatedType}
                    onChange={(e) => {
                      const newType = e.target.value as 'lead' | 'contact' | '';
                      setRelatedType(newType);
                      clearSelection();
                      if (newType) setShowSearchDropdown(true);
                    }}
                    className="input-base appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="lead">Lead</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>

                {/* Status */}
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base appearance-none">
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Viewed">Viewed</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Assigned */}
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Assigned</label>
                  <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="input-base appearance-none">
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                    ))}
                  </select>
                </div>

                {/* To - search */}
                <div className="col-span-12" ref={searchRef}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"><span className="text-red-500">*</span> To</label>
                  <div className="relative input-divided">
                    <div className="input-icon-left"><Search size={16} /></div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                      onFocus={() => { if (relatedType && searchQuery.length >= 2) setShowSearchDropdown(true); }}
                      placeholder={relatedType ? `Search ${relatedType}s...` : 'Select Related type first'}
                      disabled={!relatedType}
                      required
                    />
                    {searchQuery && (
                      <button type="button" onClick={clearSelection} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
                    )}
                    {searchLoading && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2"><div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" /></div>
                    )}

                    {/* Dropdown */}
                    {showSearchDropdown && relatedType && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
                        {searchResults.map((entity) => (
                          <button key={entity.id} type="button" onClick={() => selectEntity(entity)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold flex items-center justify-center text-xs">{entity.firstName?.[0]}{entity.lastName?.[0]}</div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{entity.firstName} {entity.lastName}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{entity.email}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="col-span-12">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Address</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="input-base" />
                </div>

                {/* City/State */}
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-base" />
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

          {/* end left */}
          </Card>
          </div>

          {/* Right: sticky summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card padding="lg" className="sticky top-20">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sub total</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${subTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} min="0" step="0.01" className="w-20 px-2 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                    <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white">
                      <option value="%">%</option>
                      <option value="fixed">$</option>
                    </select>
                    <span className="text-red-600 dark:text-red-400 font-medium">-${discount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Adjustment</span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={adjustmentValue} onChange={(e) => setAdjustmentValue(parseFloat(e.target.value) || 0)} step="0.01" className="w-20 px-2 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                    <span className="font-medium text-gray-900 dark:text-white">${adjustmentValue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="pt-3 mt-1 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="SECONDARY" fullWidth onClick={() => handleSubmit(false)} disabled={loading}>Save</Button>
                  <Button variant="PRIMARY" fullWidth onClick={() => handleSubmit(true)} loading={loading}>Save & Send</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default CreateQuotationPage;
