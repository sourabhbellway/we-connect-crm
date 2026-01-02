import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Search, Package, ChevronDown } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import apiClient from '../../services/apiClient';
import { leadService } from '../../services/leadService';
import { dealService } from '../../services/dealService'; // Check if this should be dealsService
import { toast } from 'react-toastify';
import { getCurrencyByCountry, getAllCountries } from '../../utils/countryUtils';
import { taxesService, Tax } from '../../services/taxesService';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';

interface InvoiceItem {
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

const CreateInvoicePage: React.FC = () => {
    const navigate = useNavigate();
    const { currencySettings, formatCurrency } = useBusinessSettings();
    const [searchParams] = useSearchParams();
    const { id: editId } = useParams();
    const isEdit = Boolean(editId);

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [activeProductDropdownIndex, setActiveProductDropdownIndex] = useState<number | null>(null);
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const productDropdownRef = useRef<HTMLTableCellElement>(null);
    const [availableTaxes, setAvailableTaxes] = useState<Tax[]>([]);

    // Customer Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [customers, setCustomers] = useState<any[]>([]); // Keep this for fallback or initial load if needed

    // Form fields
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [customerName, setCustomerName] = useState(''); // Added for display in search input
    const [status, setStatus] = useState('Draft');
    const [assignedTo, setAssignedTo] = useState('');
    const [dealId, setDealId] = useState<string>('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [currency, setCurrency] = useState(currencySettings?.primary || 'USD');
    const [discountType, setDiscountType] = useState('none');
    const [notes, setNotes] = useState('');
    const [terms, setTerms] = useState('');

    // Terms and Conditions state
    const [termsAndConditions, setTermsAndConditions] = useState<any[]>([]);
    const [selectedTermsTemplate, setSelectedTermsTemplate] = useState('');
    const [customTerms, setCustomTerms] = useState('');

    // Line items
    const [items, setItems] = useState<InvoiceItem[]>([
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

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Load existing invoice in edit mode
    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const res = await apiClient.get(`/invoices/${editId}`);
                const inv = res?.data?.data?.invoice || res?.data?.invoice || res?.data;
                if (!inv) return;
                setInvoiceNumber(inv.invoiceNumber || '');
                setStatus(inv.status ? inv.status.charAt(0) + inv.status.slice(1).toLowerCase() : 'Draft');
                setCurrency(inv.currency || 'USD');
                setDueDate(inv.dueDate ? String(inv.dueDate).slice(0, 10) : '');
                setInvoiceDate(inv.createdAt ? String(inv.createdAt).slice(0, 10) : invoiceDate);
                setNotes(inv.notes || '');
                setTerms(inv.terms || '');
                setCustomTerms(inv.terms || '');

                // Try to find matching template
                if (inv.terms) {
                    const matchingTemplate = termsAndConditions.find(t => t.content === inv.terms);
                    if (matchingTemplate) {
                        setSelectedTermsTemplate(matchingTemplate.id.toString());
                    }
                }
                setEmail(inv.lead?.email || email);
                if (inv.lead) {
                    setCustomerId(String(inv.leadId));
                }
                // Map items for UI
                if (Array.isArray(inv.items)) {
                    setItems(inv.items.map((it: any) => ({
                        description: it.name || it.description || '',
                        longDescription: it.description || '',
                        quantity: Number(it.quantity || 1),
                        unit: it.unit || 'Unit',
                        rate: Number(it.unitPrice || 0),
                        taxRate: Number(it.taxRate || 0),
                        amount: Number(it.totalAmount || 0),
                        isOptional: false,
                        productId: it.productId ? String(it.productId) : '',
                    })));
                }
            } catch (e) {
                console.error('Error loading invoice:', e);
            }
        })();
    }, [isEdit, editId]);


    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
                setActiveProductDropdownIndex(null);
            }
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
            if (searchQuery.length >= 1) { // Search even with 1 char
                searchEntities(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, customers]);

    // Auto-select currency when country changes
    useEffect(() => {
        // Skip auto-selection if we're creating from a quotation, lead, or deal to preserve source currency
        const hasSource = searchParams.get('quotationId') || searchParams.get('entityId');
        if (hasSource && !isEdit) return;

        if (country) {
            const newCurrency = getCurrencyByCountry(country);
            if (newCurrency) {
                setCurrency(newCurrency);
            }
        }
    }, [country, searchParams, isEdit]);

    // Prefill when opened from an entity context or a quotation
    useEffect(() => {
        const entityType = (searchParams.get('entityType') as 'lead' | 'deal' | null) || null;
        const entityIdParam = searchParams.get('entityId');
        const quotationIdParam = searchParams.get('quotationId');

        if (isEdit) return;

        (async () => {
            try {
                // Priority 1: Prefill from Quotation
                if (quotationIdParam) {
                    const res = await apiClient.get(`/quotations/${quotationIdParam}`);
                    const q = res?.data?.data?.quotation || res?.data?.quotation || res?.data?.data || res?.data;
                    if (q) {
                        setNotes(q.notes || '');
                        setTerms(q.terms || '');
                        setCustomTerms(q.terms || '');
                        setCurrency(q.currency || currency);
                        setDealId(q.dealId ? String(q.dealId) : '');

                        // Map items
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
                                productId: it.productId ? String(it.productId) : '',
                            })));
                        }

                        // Set customer info if lead is attached
                        if (q.lead || q.leadId) {
                            const lead = q.lead || (await leadService.getLeadById(q.leadId)).data;
                            if (lead) {
                                setCustomerId(String(lead.id));
                                const parts = [lead.firstName, lead.lastName].filter(Boolean);
                                const displayName = parts.length > 0 ? parts.join(' ') : (lead.email || 'Unknown Customer');
                                setCustomerName(displayName);
                                setEmail(lead.email || '');
                                setPhone(lead.phone || '');
                                setAddress(lead.address || '');
                                setCity(lead.city || '');
                                setState(lead.state || '');
                                setCountry(lead.country || '');
                                setZipCode(lead.zipCode || '');

                                // Ensure currency is set AFTER potential country change side-effects
                                if (q.currency) setCurrency(q.currency);
                            }
                        }
                        toast.info('Invoice pre-filled from quotation');
                        return; // Successfully pre-filled from quotation, skip other entity pre-fills
                    }
                }

                // Priority 2: Prefill from Lead/Deal
                const id = entityIdParam ? parseInt(entityIdParam) : null;
                if (!id) return;

                if (entityType === 'lead') {
                    const res = await leadService.getLeadById(id);
                    const lead = res?.data?.lead || res?.data || res;
                    if (lead) {
                        setCustomerId(String(lead.id));

                        const parts = [lead.firstName, lead.lastName].filter(Boolean);
                        const displayName = parts.length > 0 ? parts.join(' ') : (lead.email || 'Unknown Customer');
                        setCustomerName(displayName);

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
                    const res: any = await dealService.getDealById(id);
                    const deal = res?.data?.deal || res?.data || res;
                    if (deal) {
                        setDealId(String(deal.id));
                        if (deal.currency) setCurrency(deal.currency);

                        // If deal has a lead associated, fetch lead data for full details
                        if (deal.leadId) {
                            try {
                                const leadRes = await leadService.getLeadById(deal.leadId);
                                const lead = leadRes?.data?.lead || leadRes?.data || leadRes;
                                if (lead) {
                                    setCustomerId(String(lead.id));

                                    const parts = [lead.firstName, lead.lastName].filter(Boolean);
                                    const displayName = parts.length > 0 ? parts.join(' ') : (lead.email || 'Unknown Customer');
                                    setCustomerName(displayName);

                                    setEmail(lead.email || '');
                                    setPhone(lead.phone || '');
                                    setAddress(lead.address || '');
                                    setCity(lead.city || '');
                                    setState(lead.state || '');
                                    setCountry(lead.country || '');
                                    setZipCode(lead.zipCode || '');
                                }
                            } catch (err) {
                                console.error('Error fetching lead details for deal:', err);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Error loading pre-fill data:', e);
            }
        })();
    }, [searchParams, isEdit]);


    useEffect(() => {
        if (currencySettings?.primary && !isEdit && (currency === 'USD' || !currency)) {
            setCurrency(currencySettings.primary);
        }
    }, [currencySettings, isEdit]);

    const fetchInitialData = async () => {
        try {
            const [templateResponse, termsResponse, customersResponse, businessSettingsResponse, productsResponse, taxesResponse] = await Promise.all([
                apiClient.get('/quotations/template'),
                apiClient.get('/business-settings/terms-and-conditions'),
                apiClient.get('/leads?page=1&limit=100'), // Load all customers
                apiClient.get('/business-settings/all'),
                apiClient.get('/products?page=1&limit=100'),
                taxesService.getAll() // Fetch taxes
            ]);

            if (templateResponse.data.success) {
                const data = templateResponse.data.data;
                setUsers(data.users || []);
            }

            if (termsResponse.data.success) {
                const termsData = termsResponse.data.data;
                setTermsAndConditions(termsData || []);
            }

            if (customersResponse.data.success) {
                const customersData = customersResponse.data.data;
                setCustomers(customersData.leads || customersData.items || []);
            }

            if (productsResponse.data.success) {
                const productsData = productsResponse.data.data;
                setProducts(productsData.products || productsData.items || []);
            }

            if (taxesResponse) {
                setAvailableTaxes(taxesResponse);
            }
            // Removed duplicate setProducts call

            if (businessSettingsResponse.data.success) {
                // Fetch next invoice number from backend
                try {
                    const nextNumberRes = await apiClient.get('/invoices/next-number');
                    if (nextNumberRes.data.success) {
                        const nextNumber = nextNumberRes.data.data.nextNumber;
                        setGeneratedInvoiceNumber(nextNumber);

                        // Pre-fill invoice number if not already set
                        if (!invoiceNumber) {
                            setInvoiceNumber(nextNumber);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching next invoice number:', err);
                }
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const searchEntities = (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        // Filter from loaded customers (leads)
        const filtered = customers.filter(c => {
            const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim().toLowerCase();
            const emailMatch = (c.email || '').toLowerCase().includes(query.toLowerCase());
            return fullName.includes(query.trim().toLowerCase()) || emailMatch;
        });
        setSearchResults(filtered);
        setShowSearchDropdown(true);
    };

    const selectEntity = (customer: any) => {
        setCustomerId(customer.id.toString());

        // Construct display name
        const parts = [customer.firstName, customer.lastName].filter(Boolean);
        const displayName = parts.length > 0 ? parts.join(' ') : (customer.email || 'Unknown Customer');

        setCustomerName(displayName);
        setSearchQuery(displayName); // Update search box

        setEmail(customer.email || '');
        setPhone(customer.phone || '');
        setAddress(customer.address || '');
        setCity(customer.city || '');
        setState(customer.state || '');
        setCountry(customer.country || '');
        setZipCode(customer.zipCode || '');
        if ((customer as any)?.currency) setCurrency((customer as any).currency);

        setShowSearchDropdown(false);
        toast.success('Customer selected and details auto-filled');
    };

    const selectProduct = (index: number, product: any) => {
        const newItems = [...items];
        const rate = Number(product.price || product.unitPrice || 0);
        const taxRate = Number(product.taxRate || 0);
        const quantity = newItems[index].quantity || 1;
        const subtotal = quantity * rate;
        const tax = subtotal * (taxRate / 100);

        newItems[index] = {
            ...newItems[index],
            description: product.name || product.title || '',
            longDescription: product.description || '',
            rate: rate,
            unit: product.unit || 'Unit',
            taxRate: taxRate,
            productId: product.id.toString(),
            amount: subtotal + tax,
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
            },
        ]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
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
            const subtotal = item.quantity * item.rate;
            return sum + (subtotal * (item.taxRate / 100));
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
        if (!customerId || !email) {
            toast.error('Please select a customer and ensure email is filled');
            return;
        }

        if (items.length === 0 || items.some(item => !item.description || item.rate === 0)) {
            toast.error('Please add at least one item with description and rate');
            return;
        }

        try {
            setLoading(true);
            const discountAmount = calculateDiscount();

            const payload = {
                invoiceNumber: invoiceNumber || undefined,
                title: notes || 'Invoice',
                description: notes,
                status: sendImmediately ? 'Sent' : status.toUpperCase(),
                currency,
                dueDate: dueDate || null,
                notes,
                terms,
                leadId: customerId ? parseInt(customerId, 10) : null,
                dealId: dealId ? parseInt(dealId, 10) : null,
                createdBy: parseInt(localStorage.getItem('userId') || '1', 10),
                discountAmount: discountType === 'fixed' ? discountAmount : 0,
                items: items.map(item => ({
                    name: item.description,
                    description: item.longDescription,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: item.rate,
                    taxRate: item.taxRate,
                    discountRate: discountType === '%' ? discountValue : 0,
                    productId: item.productId && !isNaN(parseInt(item.productId)) ? parseInt(item.productId, 10) : undefined,
                })),
            };

            const response = isEdit
                ? await apiClient.put(`/invoices/${editId}`, {
                    title: notes || 'Invoice',
                    status: status.toUpperCase(),
                    currency,
                    dueDate: dueDate || null,
                    notes,
                    terms,
                })
                : await apiClient.post('/invoices', payload);

            if (response.data.success) {
                toast.success(`Invoice ${isEdit ? 'updated' : sendImmediately ? 'created and sent' : 'saved'} successfully!`);
                if (sendImmediately && !isEdit) {
                    const invoiceId = response.data.data?.invoice?.id || response.data.data?.id;
                    if (invoiceId) {
                        await apiClient.put(`/invoices/${invoiceId}/send`);
                    }
                }

                // Redirect back to source if applicable
                if (dealId) {
                    navigate(`/deals/${dealId}?tab=quotations`);
                } else if (customerId) {
                    navigate(`/leads/${customerId}?tab=quotations`);
                } else {
                    navigate('/invoices');
                }
            }
        } catch (error: any) {
            console.error('Error creating invoice:', error);
            console.error('Payload was:', {
                invoiceNumber, title: notes, status: status.toUpperCase(), leadId: parseInt(customerId), items,
            });
            toast.error(error.response?.data?.message || 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    const subTotal = calculateSubTotal();
    const taxAmount = calculateTax();
    const discount = calculateDiscount();
    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="mx-auto px-6 py-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {isEdit ? 'Edit Invoice' : 'Create New Invoice'}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Create professional invoices for your customers and track payments
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

                <div className="flex flex-col gap-6">
                    {/* Left: form sections */}
                    <div className="space-y-6">
                        <Card padding="lg">
                            <div className="grid grid-cols-12 gap-4">
                                {/* Invoice Number */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Invoice Number
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={invoiceNumber || generatedInvoiceNumber || 'Auto-generated'}
                                            readOnly
                                            disabled
                                            className="input-base bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Auto-generated from Business Settings
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Search Dropdown */}
                                <div className="col-span-12 sm:col-span-6" ref={searchRef}>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        <span className="text-red-500">*</span> Customer
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                                            className="w-full px-3 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between group"
                                        >
                                            <span className={`truncate font-medium ${!customerName ? 'text-gray-500' : ''}`}>
                                                {customerName || 'Select Customer...'}
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
                                                                // Search triggered by effect or direct call
                                                                searchEntities(e.target.value);
                                                            }}
                                                            autoFocus
                                                            placeholder="Search customers..."
                                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="overflow-y-auto max-h-48">
                                                    {(searchQuery ? searchResults : customers).length > 0 ? (
                                                        (searchQuery ? searchResults : customers).map((customer) => {
                                                            // Display Name Logic
                                                            const names = [customer.firstName, customer.lastName].filter(Boolean);
                                                            const displayName = names.length > 0 ? names.join(' ') : (customer.email || 'Unknown Customer');
                                                            const initials = names.length > 0
                                                                ? names.map((n: string) => n[0]).join('').toUpperCase()
                                                                : (customer.email?.[0]?.toUpperCase() || '?');

                                                            return (
                                                                <button
                                                                    key={customer.id}
                                                                    type="button"
                                                                    onClick={() => selectEntity(customer)}
                                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold flex items-center justify-center text-xs shrink-0">
                                                                            {initials}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{customer.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                            <p>No customers found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base appearance-none">
                                        <option value="DRAFT">Draft</option>
                                        <option value="SENT">Sent</option>
                                        <option value="PAID">Paid</option>
                                    </select>
                                </div>

                                {/* Assigned */}
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Assigned</label>
                                    <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="input-base appearance-none">
                                        <option value="">Select User</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                                        ))}
                                    </select>
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
                                        className="input-base"
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
                                        className="input-base appearance-none"
                                    >
                                        <option value="">Select Country</option>
                                        {getAllCountries().map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
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
                                        className="input-base"
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
                                        className="input-base"
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
                                        className="input-base"
                                    />
                                </div>

                                {/* Invoice Date */}
                                <div className="col-span-3">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        <span className="text-red-500">*</span> Invoice Date
                                    </label>
                                    <input
                                        type="date"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        className="input-base"
                                        required
                                    />
                                </div>

                                {/* Due Date */}
                                <div className="col-span-3">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="input-base"
                                        min={invoiceDate}
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
                                        className="input-base cursor-pointer"
                                        required
                                    >
                                        {currencySettings?.supportedCurrencies?.length ? (
                                            currencySettings.supportedCurrencies.map(code => (
                                                <option key={code} value={code}>{code}</option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="USD">USD $</option>
                                                <option value="INR">INR ₹</option>
                                                <option value="EUR">EUR €</option>
                                                <option value="GBP">GBP £</option>
                                            </>
                                        )}
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
                                        className="input-base appearance-none"
                                    >
                                        <option value="none">No discount</option>
                                        <option value="%">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>


                            </div>

                            {/* Line Items */}
                            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="SECONDARY"
                                            onClick={() => {
                                                sessionStorage.setItem('invoice_draft', JSON.stringify({
                                                    invoiceNumber, customerId, status, assignedTo,
                                                    address, city, state, country, zipCode, email, phone,
                                                    invoiceDate, dueDate, currency, items, discountType, discountValue, adjustmentValue,
                                                }));
                                                navigate('/products?returnTo=invoice');
                                            }}
                                            className="inline-flex items-center gap-2 text-xs"
                                        >
                                            <Package size={14} />
                                            Add from Catalog
                                        </Button>
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
                            </div>

                            {/* Table */}
                            <div className="overflow-visible border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="overflow-visible">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">Product</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">Description</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Qty</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">Unit</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Rate</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">Tax %</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Amount</th>
                                                <th className="px-4 py-3 w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {items.map((item, index) => (
                                                <tr key={index} className="relative">
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.isOptional}
                                                            onChange={(e) => updateItem(index, 'isOptional', e.target.checked)}
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-2"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 align-top relative" ref={activeProductDropdownIndex === index ? productDropdownRef : null}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveProductDropdownIndex(activeProductDropdownIndex === index ? null : index);
                                                                setProductSearchQuery('');
                                                            }}
                                                            className="w-full px-3 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between group"
                                                        >
                                                            <span className="truncate font-medium">
                                                                {item.description || 'Select Product...'}
                                                            </span>
                                                            <ChevronDown size={16} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2 transition-colors" />
                                                        </button>

                                                        {activeProductDropdownIndex === index && (
                                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-hidden z-[100]">
                                                                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search products..."
                                                                        value={productSearchQuery}
                                                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                                <div className="overflow-y-auto max-h-60">
                                                                    {products
                                                                        .filter(product =>
                                                                            !productSearchQuery ||
                                                                            (product.name || product.title || '').toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                                                            (product.description || '').toLowerCase().includes(productSearchQuery.toLowerCase())
                                                                        )
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
                                                                                            {product.name || product.title}
                                                                                        </div>
                                                                                        {/* <div className="text-gray-600 dark:text-gray-400 text-xs truncate mt-0.5">
                                              {product.description}
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
                                                                                onClick={() => navigate('/products?returnTo=invoice')}
                                                                                className="mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                                            >
                                                                                Browse Products
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="text"
                                                            value={item.longDescription}
                                                            onChange={(e) => updateItem(index, 'longDescription', e.target.value)}
                                                            className="input-base text-sm"
                                                            placeholder="Details..."
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                            className="input-base text-right text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="text"
                                                            value={item.unit}
                                                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                                            className="input-base text-center text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currency}</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.rate}
                                                                onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                                                className="input-base pl-8 text-right text-sm"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <select
                                                            value={item.taxRate}
                                                            onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value))}
                                                            className="input-base text-right text-sm appearance-none"
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
                                                    <td className="px-4 py-3 align-top text-right font-medium text-gray-900 dark:text-white pt-3">
                                                        {formatCurrency(item.amount, currency)}
                                                    </td>
                                                    <td className="px-4 py-3 align-top text-center pt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </Card>
                    </div>

                    {/* Bottom Section: Notes/Terms & Totals */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Notes & Terms */}
                        <div className="space-y-6">
                            <Card padding="lg">
                                <div className="space-y-4">
                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                            📝 Notes & Payment Terms
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add notes..."
                                            rows={4}
                                            className="input-base"
                                        />
                                    </div>

                                    {/* Terms and Conditions */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                            📋 Terms & Conditions
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
                                                        setTerms(template.content);
                                                    }
                                                } else {
                                                    setCustomTerms('');
                                                    setTerms('');
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
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Choose a template or leave empty to use default terms
                                        </p>
                                    </div>

                                    {/* Custom Terms (if no template selected) */}
                                    {selectedTermsTemplate && (
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                                Selected Template Content
                                            </label>
                                            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                    {customTerms}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Right: Summary */}
                        <div className="space-y-6">
                            <Card padding="lg">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Sub total</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(subTotal, currency)}</span>
                                    </div>

                                    {taxAmount > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Total Tax</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(taxAmount, currency)}</span>
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
                                                className="w-20 px-2 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                            />
                                            <select
                                                value={discountType}
                                                onChange={(e) => setDiscountType(e.target.value)}
                                                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="%">%</option>
                                                <option value="fixed">{currency}</option>
                                            </select>
                                            <span className="text-red-600 dark:text-red-400 font-medium">-{formatCurrency(discount, currency)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Adjustment</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={adjustmentValue}
                                                onChange={(e) => setAdjustmentValue(parseFloat(e.target.value) || 0)}
                                                step="0.01"
                                                className="w-20 px-2 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                            />
                                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(adjustmentValue, currency)}</span>
                                        </div>
                                    </div>
                                    <div className="pt-3 mt-1 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(total, currency)}</span>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="SECONDARY" fullWidth onClick={() => handleSubmit(false)} disabled={loading}>
                                            Save
                                        </Button>
                                        <Button variant="PRIMARY" fullWidth onClick={() => handleSubmit(true)} loading={loading}>
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
            </div >
        </div >
    );
};

export default CreateInvoicePage;

