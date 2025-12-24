import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Package, Plus, Trash2, Search, ChevronDown } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { leadService } from '../../services/leadService';
import { dealService } from '../../services/dealService';
import { taxesService, Tax } from '../../services/taxesService';

interface QuotationItem {
    description: string;
    longDescription: string;
    quantity: number;
    unit: string;
    rate: number;
    taxRate: number;
    amount: number;
    isOptional: boolean;
    productId?: string;
}

const CreateQuotationPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { id: editId } = useParams();
    const isEdit = Boolean(editId);

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [allLeads, setAllLeads] = useState<any[]>([]);
    // const [loadingAllLeads, setLoadingAllLeads] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Products state for item selection
    const [products, setProducts] = useState<any[]>([]);
    const [activeProductDropdownIndex, setActiveProductDropdownIndex] = useState<number | null>(null);
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const productDropdownRef = useRef<HTMLDivElement>(null);
    const [availableTaxes, setAvailableTaxes] = useState<Tax[]>([]);

    // Terms and Conditions state
    const [termsAndConditions, setTermsAndConditions] = useState<any[]>([]);
    const [selectedTermsTemplate, setSelectedTermsTemplate] = useState('');
    const [customTerms, setCustomTerms] = useState('');

    // Form fields
    const [quotationNumber, setQuotationNumber] = useState('');
    const [generatedQuotationNumber, setGeneratedQuotationNumber] = useState('');

    const [subject, setSubject] = useState('');
    const [relatedType, setRelatedType] = useState<'lead' | ''>('lead');
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
            productId: '',
        },
    ]);

    const [discountValue, setDiscountValue] = useState(0);
    const [adjustmentValue, setAdjustmentValue] = useState(0);
    const [showQuantityAs, setShowQuantityAs] = useState('Qty');
    // const [isItemsExpanded, setIsItemsExpanded] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch all leads when relatedType is set to 'lead'
    useEffect(() => {
        if (relatedType === 'lead' && allLeads.length === 0) {
            fetchAllLeads();
        }
    }, [relatedType]);

    const fetchAllLeads = async () => {
        // setLoadingAllLeads(true);
        try {
            const res = await leadService.getLeads({ page: 1, limit: 1000 });
            const leads = res?.data?.leads || [];
            setAllLeads(leads);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load leads');
        } finally {
            // setLoadingAllLeads(false);
        }
    };

    // Load existing quotation in edit mode
    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const res = await apiClient.get(`/quotations/${editId}`);
                const q = res?.data?.data?.quotation || res?.data?.quotation || res?.data;
                if (!q) return;
                setQuotationNumber(q.quotationNumber || '');
                setSubject(q.title || '');
                setStatus(q.status ? q.status.charAt(0) + q.status.slice(1).toLowerCase() : 'Draft');
                setCurrency(q.currency || 'USD');
                setOpenTill(q.validUntil ? String(q.validUntil).slice(0, 10) : '');
                setDate(q.createdAt ? String(q.createdAt).slice(0, 10) : date);
                setAddress('');
                setEmail(q.lead?.email || email);
                if (q.lead) {
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

                // Load terms and conditions
                if (q.terms) {
                    setCustomTerms(q.terms);
                    // Try to find matching template
                    const matchingTemplate = termsAndConditions.find(t => t.content === q.terms);
                    if (matchingTemplate) {
                        setSelectedTermsTemplate(matchingTemplate.id.toString());
                    }
                }
            } catch (e) {
                // ignore
            }
        })();
    }, [isEdit, editId]);

    // Prefill when opened from an entity context (?entityType=lead|deal&entityId=123)
    useEffect(() => {
        const entityType = (searchParams.get('entityType') as 'lead' | 'deal' | null) || null;
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
                } else if (entityType === 'deal') {
                    const res = await dealService.getDealById(id);
                    const deal = (res as any)?.data || res;
                    if (deal) {
                        setDealId(String(deal.id));
                        // Use lead if present
                        if (deal.lead) {
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
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
                setActiveProductDropdownIndex(null);
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
                setShowSearchDropdown(false);
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, relatedType, allLeads]);

    const fetchInitialData = async () => {
        try {
            const [templateResponse, productsResponse, termsResponse, taxesResponse] = await Promise.all([
                apiClient.get('/quotations/template'),
                apiClient.get('/products?search=&page=1&limit=50'),
                apiClient.get('/business-settings/terms-and-conditions'),
                taxesService.getAll()
            ]);

            if (templateResponse.data.success) {
                const data = templateResponse.data.data;
                setUsers(data.users || []);
            }

            if (productsResponse.data.success) {
                const productsData = productsResponse.data.data;
                setProducts(productsData.products || productsData.items || []);
            }

            if (termsResponse.data.success) {
                const termsData = termsResponse.data.data;
                setTermsAndConditions(termsData || []);
            }

            if (taxesResponse) {
                setAvailableTaxes(taxesResponse);
            }

            // Fetch next quotation number
            try {
                const nextNumberRes = await apiClient.get('/quotations/next-number');
                if (nextNumberRes.data.success) {
                    const nextNumber = nextNumberRes.data.data.nextNumber;
                    setGeneratedQuotationNumber(nextNumber);
                    if (!quotationNumber) {
                        setQuotationNumber(nextNumber);
                    }
                }
            } catch (err) {
                console.error('Error fetching next quotation number:', err);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const searchEntities = (query: string) => {
        if (!relatedType) {
            toast.info('Please select Lead first');
            return;
        }
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }
        const filtered = allLeads.filter(lead => {
            const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim().toLowerCase();
            return fullName.includes(query.trim().toLowerCase());
        });
        setSearchResults(filtered);
        setShowSearchDropdown(true);
    };

    const selectEntity = (entity: any) => {
        setRelatedId(entity.id.toString());

        // Construct a display name
        const parts = [entity.firstName, entity.lastName].filter(Boolean);
        const displayName = parts.length > 0 ? parts.join(' ') : (entity.email || 'Unknown Lead');

        setToField(displayName);
        setSearchQuery(displayName);
        setEmail(entity.email || '');
        setPhone(entity.phone || '');
        setAddress(entity.address || '');
        setCity(entity.city || '');
        setState(entity.state || '');
        setCountry(entity.country || '');
        setZipCode(entity.zipCode || '');
        setShowSearchDropdown(false);
        toast.success('Lead selected and details auto-filled');
    };

    const selectProduct = (index: number, product: any) => {
        const newItems = [...items];
        const rate = Number(product.price || product.unitPrice || 0);
        const taxRate = Number(product.taxRate || 0);
        const quantity = newItems[index].quantity || 1;
        const subtotal = quantity * rate;
        const tax = subtotal * (taxRate / 100);

        // Get product name from multiple possible fields
        const productName = product.name || product.title || product.itemName || product.productName || '';

        newItems[index] = {
            ...newItems[index],
            description: productName,
            longDescription: product.description || product.details || '',
            rate: rate,
            unit: product.unit || 'Unit',
            taxRate: taxRate,
            productId: String(product.id),
            amount: subtotal + tax
        };

        setItems(newItems);
        setActiveProductDropdownIndex(null);
        setProductSearchQuery('');
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
                productId: '',
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

    const calculateTax = () => {
        return items.reduce((sum, item) => {
            const sub = item.quantity * item.rate;
            return sum + (sub * (item.taxRate / 100));
        }, 0);
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
        const tax = calculateTax();
        const discount = calculateDiscount();
        return subtotal + tax - discount + adjustmentValue;
    };

    const handleSubmit = async (sendImmediately = false) => {
        console.log('handleSubmit called with sendImmediately:', sendImmediately);
        console.log('Form data:', { subject, relatedId, email, relatedType, toField, items });

        // Check if we have either a selected entity (relatedId) or manually entered recipient info
        const hasValidRecipient = (relatedId && relatedType) || (toField && email);

        if (!hasValidRecipient) {
            console.error('Validation failed:', {
                subject: !!subject,
                hasValidRecipient,
                relatedId: !!relatedId,
                relatedType: !!relatedType,
                toField: !!toField,
                email: !!email
            });
            toast.error('Please select a lead or enter recipient details manually');
            return;
        }

        try {
            setLoading(true);

            // Auto-generate subject if empty, or use existing
            const finalSubject = subject || (relatedType === 'lead' && toField ? `Quotation for ${toField}` : 'New Quotation');

            const payload = {
                quotationNumber: quotationNumber || undefined,
                subject: finalSubject,
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
                terms: customTerms || undefined,
            };

            console.log('Sending payload:', payload);

            const response = isEdit
                ? await apiClient.put(`/quotations/${editId}`, {
                    title: finalSubject,
                    status: status.toUpperCase(),
                    currency,
                    validUntil: openTill || null,
                    notes: undefined,
                    terms: undefined,
                })
                : await apiClient.post('/quotations', payload);

            console.log('API response:', response);

            if (response.data.success) {
                toast.success(`Quotation ${sendImmediately ? 'created and sent' : 'saved'} successfully!`);
                navigate('/quotations');
            }
        } catch (error: any) {
            console.error('Error creating quotation:', error);
            console.error('Error response:', error.response);
            toast.error(error.response?.data?.message || 'Failed to create quotation');
        } finally {
            setLoading(false);
        }
    };

    const subTotal = calculateSubTotal();
    const taxAmount = calculateTax();
    const discount = calculateDiscount();
    const total = calculateTotal();

    // Helper function to get product name from various possible fields
    const getProductName = (product: any) => {
        return product.name || product.title || product.itemName || product.productName ||
            (typeof product === 'string' ? product : '') || 'Unnamed Product';
    };

    // Helper function to get product description from various possible fields
    const getProductDescription = (product: any) => {
        return product.description || product.details || product.longDescription ||
            product.summary || '';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="mx-auto px-6 py-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {isEdit ? 'Edit Quotation' : 'Create New Quotation'}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Create professional quotations for your leads and track your sales pipeline
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="SECONDARY"
                                onClick={() => handleSubmit(false)}
                                disabled={loading}
                                className="px-4 py-2"
                            >
                                Save as Draft
                            </Button>
                            <Button
                                variant="PRIMARY"
                                onClick={() => handleSubmit(true)}
                                loading={loading}
                                loadingText="Saving..."
                                className="px-6 py-2"
                            >
                                Save & Send
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Left: form sections */}
                    <div className="space-y-6">
                        <Card padding="lg">
                            <div className="grid grid-cols-12 gap-4">
                                {/* Quotation Number */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Quotation Number
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={quotationNumber}
                                            onChange={(e) => setQuotationNumber(e.target.value)}
                                            placeholder={generatedQuotationNumber || 'Auto-generated'}
                                            className="input-base"
                                        />
                                        {generatedQuotationNumber && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Preview: {generatedQuotationNumber} (leave empty for auto-generation)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-12 sm:col-span-3">
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
                                <div className="col-span-12 sm:col-span-3">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Assigned</label>
                                    <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="input-base appearance-none">
                                        <option value="">Select User</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Lead Selector (To) */}
                                <div className="col-span-12" ref={searchRef}>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"><span className="text-red-500">*</span> Lead</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSearchDropdown(!showSearchDropdown);
                                                // Ensure we are in lead mode if not already
                                                if (relatedType !== 'lead') setRelatedType('lead');
                                                // Focus will happen via auto-focus on input inside
                                            }}
                                            className="w-full px-3 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between group"
                                        >
                                            <span className={`truncate font-medium ${!toField ? 'text-gray-500' : ''}`}>
                                                {toField || 'Select Lead...'}
                                            </span>
                                            <ChevronDown size={16} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2 transition-colors" />
                                        </button>

                                        {/* Dropdown */}
                                        {showSearchDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-hidden z-50">
                                                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                                    <div className="relative">
                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            value={searchQuery}
                                                            onChange={(e) => {
                                                                setSearchQuery(e.target.value);
                                                                // Trigger search immediately or via effect
                                                                searchEntities(e.target.value);
                                                            }}
                                                            autoFocus
                                                            placeholder="Search leads..."
                                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="overflow-y-auto max-h-48">
                                                    {searchResults.length > 0 ? (
                                                        searchResults.map((entity) => {
                                                            // Construct display name for dropdown
                                                            const names = [entity.firstName, entity.lastName].filter(Boolean);
                                                            const displayName = names.length > 0 ? names.join(' ') : (entity.email || 'Unknown Lead');
                                                            const initials = names.length > 0
                                                                ? names.map((n: string) => n[0]).join('').toUpperCase()
                                                                : (entity.email?.[0]?.toUpperCase() || '?');

                                                            return (
                                                                <button
                                                                    key={entity.id}
                                                                    type="button"
                                                                    onClick={() => selectEntity(entity)}
                                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold flex items-center justify-center text-xs shrink-0">
                                                                            {initials}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{entity.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                            <p>No leads found</p>
                                                        </div>
                                                    )}
                                                </div>
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
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="input-base"
                                    />
                                </div>

                                {/* Country */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Country
                                    </label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="input-base appearance-none"
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
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Zip Code
                                    </label>
                                    <input
                                        type="text"
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
                                        className="input-base"
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        <span className="text-red-500">*</span> Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-base"
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="input-base"
                                    />
                                </div>

                                {/* Date */}
                                <div className="col-span-12 sm:col-span-4">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        <span className="text-red-500">*</span> Date
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="input-base"
                                        required
                                    />
                                </div>

                                {/* Open Till */}
                                <div className="col-span-12 sm:col-span-4">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Open Till
                                    </label>
                                    <input
                                        type="date"
                                        value={openTill}
                                        onChange={(e) => setOpenTill(e.target.value)}
                                        className="input-base"
                                        min={date}
                                    />
                                </div>

                                {/* Currency */}
                                <div className="col-span-12 sm:col-span-4">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        <span className="text-red-500">*</span> Currency
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="input-base appearance-none"
                                    >
                                        <option value="USD">USD $</option>
                                        <option value="EUR">EUR €</option>
                                        <option value="GBP">GBP £</option>
                                    </select>
                                </div>

                                {/* Discount Type */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Discount Type
                                    </label>
                                    <select
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                        className="input-base appearance-none"
                                    >
                                        <option value="none">No discount</option>
                                        <option value="%">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>

                                {/* Tags */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="Enter tags"
                                        className="input-base"
                                    />
                                </div>


                            </div>
                        </Card>

                        {/* Line Items Section */}
                        <Card padding="lg">
                            <div className="space-y-4">
                                {/* Section Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Quotation Items
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {items.length} {items.length === 1 ? 'item' : 'items'} added
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                sessionStorage.setItem('quotation_draft', JSON.stringify({
                                                    subject, relatedType, relatedId, status, assignedTo, toField,
                                                    address, city, state, country, zipCode, email, phone, date,
                                                    openTill, currency, items, discountType, discountValue, adjustmentValue,
                                                }));
                                                navigate('/products?returnTo=quotation');
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            <Package size={16} />
                                            Add from Catalog
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            <Plus size={16} />
                                            Add Item
                                        </button>
                                    </div>
                                </div>

                                {/* Quantity Display Toggle */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show quantity as:</span>
                                    <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() => setShowQuantityAs('Qty')}
                                            className={`px-4 py-2 text-sm font-medium transition-colors ${showQuantityAs === 'Qty'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            Qty
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowQuantityAs('Hours')}
                                            className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors ${showQuantityAs === 'Hours'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            Hours
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowQuantityAs('Qty/Hours')}
                                            className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors ${showQuantityAs === 'Qty/Hours'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            Qty/Hours
                                        </button>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="overflow-visible border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="overflow-visible">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">Item</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">Description</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">Long Description</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">{showQuantityAs}</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Unit</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Rate ({currency})</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Tax %</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Amount ({currency})</th>
                                                    <th className="px-4 py-3 w-12"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {items.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.isOptional}
                                                                onChange={(e) => updateItem(index, 'isOptional', e.target.checked)}
                                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                title="Mark as optional"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 relative">
                                                            <div className="relative" ref={activeProductDropdownIndex === index ? productDropdownRef : null}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveProductDropdownIndex(activeProductDropdownIndex === index ? null : index)}
                                                                    className="w-full px-3 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between group"
                                                                >
                                                                    <span className="truncate font-medium">
                                                                        {item.description || 'Select Product...'}
                                                                    </span>
                                                                    <ChevronDown size={16} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2 transition-colors" />
                                                                </button>

                                                                {activeProductDropdownIndex === index && (
                                                                    <div className="fixed inset-0 z-40" onClick={() => setActiveProductDropdownIndex(null)}></div>
                                                                )}

                                                                {activeProductDropdownIndex === index && (
                                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-hidden z-50">
                                                                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                                                            <div className="relative">
                                                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Search products..."
                                                                                    value={productSearchQuery}
                                                                                    onChange={(e) => setProductSearchQuery(e.target.value)}
                                                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="overflow-y-auto max-h-60">
                                                                            {products
                                                                                .filter(product => {
                                                                                    const productName = getProductName(product).toLowerCase();
                                                                                    const productDescription = getProductDescription(product).toLowerCase();
                                                                                    const query = productSearchQuery.toLowerCase();
                                                                                    return !productSearchQuery || productName.includes(query) || productDescription.includes(query);
                                                                                })
                                                                                .map((product) => (
                                                                                    <button
                                                                                        key={product.id}
                                                                                        type="button"
                                                                                        onClick={() => selectProduct(index, product)}
                                                                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                                                    >
                                                                                        <div className="flex items-center justify-between gap-2">
                                                                                            <div className="min-w-0">
                                                                                                <div className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                                                                                    {getProductName(product)}
                                                                                                </div>
                                                                                                {/* <div className="text-gray-600 dark:text-gray-400 text-xs truncate mt-0.5">
                                                                                                    {getProductDescription(product)}
                                                                                                </div> */}
                                                                                            </div>
                                                                                            {/* <div className="text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                                                                                                {currency} {product.price || product.unitPrice || 0}
                                                                                            </div> */}
                                                                                        </div>
                                                                                    </button>
                                                                                ))}
                                                                            {products.length === 0 && (
                                                                                <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                                                    <Package size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                                                                    <p>No products found</p>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => navigate('/products?returnTo=quotation')}
                                                                                        className="mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                                                    >
                                                                                        Browse Products
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={item.description}
                                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                placeholder="Enter description"
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <textarea
                                                                value={item.longDescription}
                                                                onChange={(e) => updateItem(index, 'longDescription', e.target.value)}
                                                                placeholder="Additional details..."
                                                                rows={2}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                                min="0"
                                                                step="0.01"
                                                                className="w-full px-3 py-2 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={item.unit}
                                                                onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                                                placeholder="Unit"
                                                                className="w-full px-3 py-2 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                value={item.rate}
                                                                onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                                                min="0"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                className="w-full px-3 py-2 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={item.taxRate}
                                                                onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value))}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                                            >
                                                                <option value="0">No Tax</option>
                                                                {availableTaxes
                                                                    .filter(t => t.isActive)
                                                                    .map(tax => (
                                                                        <option key={tax.id} value={tax.rate}>
                                                                            {tax.name} ({tax.rate}%)
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                ${item.amount.toFixed(2)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {items.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(index)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                    title="Remove item"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Optional Items Notice */}
                                {items.some(item => item.isOptional) && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                            Items marked as optional are indicated with a checkbox
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card padding="lg" className="h-full">
                                <div className="grid grid-cols-12 gap-4">
                                    {/* Terms and Conditions */}
                                    <div className="col-span-12">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Terms & Conditions
                                        </label>
                                        <select
                                            value={selectedTermsTemplate}
                                            onChange={(e) => {
                                                const templateId = e.target.value;
                                                setSelectedTermsTemplate(templateId);
                                                if (templateId) {
                                                    const template = termsAndConditions.find(t => t.id.toString() === templateId);
                                                    if (template) {
                                                        setCustomTerms(template.content);
                                                    }
                                                } else {
                                                    setCustomTerms('');
                                                }
                                            }}
                                            className="input-base appearance-none"
                                        >
                                            <option value="">Select Terms & Conditions Template</option>
                                            {termsAndConditions
                                                .filter(template => template.isActive)
                                                .map((template) => (
                                                    <option key={template.id} value={template.id}>
                                                        {template.name} {template.isDefault ? '(Default)' : ''}
                                                    </option>
                                                ))}
                                        </select>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Choose a template or leave empty to use default terms
                                        </p>
                                    </div>

                                    {/* Custom Terms (if no template selected) */}
                                    {selectedTermsTemplate && (
                                        <div className="col-span-12">
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Selected Template Content
                                            </label>
                                            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                    {customTerms}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Allow Comments */}
                                    <div className="col-span-12">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={allowComments}
                                                onChange={(e) => setAllowComments(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Allow Comments
                                            </span>
                                        </label>
                                    </div>

                                </div>
                            </Card>
                        </div>

                        {/* Right: sticky summary */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card padding="lg" className="sticky top-20">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-3 border-b border-gray-200 dark:border-gray-700">
                                        Summary
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">${subTotal.toFixed(2)}</span>
                                        </div>

                                        {taxAmount > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Total Tax</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">${taxAmount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Discount</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={discountValue}
                                                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-20 px-2 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                                <select
                                                    value={discountType}
                                                    onChange={(e) => setDiscountType(e.target.value)}
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="%">%</option>
                                                    <option value="fixed">$</option>
                                                </select>
                                            </div>
                                        </div>

                                        {discount > 0 && (
                                            <div className="flex items-center justify-end">
                                                <span className="text-sm text-red-600 dark:text-red-400 font-medium">-${discount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Adjustment</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={adjustmentValue}
                                                    onChange={(e) => setAdjustmentValue(parseFloat(e.target.value) || 0)}
                                                    step="0.01"
                                                    className="w-20 px-2 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                                            </div>
                                        </div>

                                        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                            <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-4">
                                        <Button
                                            variant="SECONDARY"
                                            fullWidth
                                            onClick={() => handleSubmit(false)}
                                            disabled={loading}
                                        >
                                            Save as Draft
                                        </Button>
                                        <Button
                                            variant="PRIMARY"
                                            fullWidth
                                            onClick={() => handleSubmit(true)}
                                            loading={loading}
                                            loadingText="Saving..."
                                        >
                                            Save & Send
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Footer spacer */}
                <div className="h-8" />
            </div>
        </div>
    );
};

export default CreateQuotationPage;
