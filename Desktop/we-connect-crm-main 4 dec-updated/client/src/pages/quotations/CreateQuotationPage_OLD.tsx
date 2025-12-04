import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, X } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';

interface QuotationItem {
  id?: string;
  description: string;
  longDescription: string;
  quantity: number;
  unit: string;
  rate: number;
  taxRate: number;
  amount: number;
  isOptional: boolean;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const CreateQuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const initialEntityType = searchParams.get('entityType') as 'lead' | 'contact' | null;
  const initialEntityId = searchParams.get('entityId');

  const [loading, setLoading] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  
  // Form fields
  const [subject, setSubject] = useState('');
  const [relatedType, setRelatedType] = useState<'lead' | 'contact'>(initialEntityType || 'lead');
  const [relatedId, setRelatedId] = useState(initialEntityId || '');
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
  const [discountType, setDiscountType] = useState('%');
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
  
  // Totals
  const [discountValue, setDiscountValue] = useState(0);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [showQuantityAs, setShowQuantityAs] = useState('Qty');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/quotations/template');
      
      if (response.data.success) {
        const data = response.data.data;
        setAvailableCurrencies(data.availableCurrencies || [{ code: 'USD', symbol: '$', name: 'US Dollar' }]);
        setCurrency(data.defaultCurrency || 'USD');
        setUsers(data.users || []);
        setLeads(data.leads || []);
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
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
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount
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

  const handleSubmit = async (e: React.FormEvent, sendImmediately = false) => {
    e.preventDefault();

    if (!subject || !relatedId || !toField) {
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

      const response = await apiClient.post('/api/quotations', payload);

      if (response.data.success) {
        toast.success(`Quotation ${sendImmediately ? 'created and sent' : 'created'} successfully!`);
        navigate('/quotations');
      }
    } catch (error: any) {
      console.error('Error creating quotation:', error);
      toast.error(error.response?.data?.message || 'Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (code: string): string => {
    const curr = availableCurrencies.find((c) => c.code === code);
    return curr?.symbol || '$';
  };

  if (loading && !availableCurrencies.length) {
    return (
      <div className=\"flex items-center justify-center min-h-screen\">
        <div className=\"animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full\"></div>
      </div>
    );
  }

  const subTotal = calculateSubTotal();
  const discount = calculateDiscount();
  const total = calculateTotal();

  return (
    <div className=\"min-h-screen bg-gray-50 dark:bg-gray-900\">
      <div className=\"max-w-[1600px] mx-auto p-6\">
        {/* Header */}
        <div className=\"mb-6\">
          <h1 className=\"text-2xl font-bold text-gray-900 dark:text-white\">
            New Quotation
          </h1>
        </div>

        <form className=\"space-y-4\">
          {/* Main Card */}
          <Card className=\"p-8 bg-white dark:bg-gray-800\">
            {/* Top Section - Subject, Related, Status, etc */}
            <div className=\"grid grid-cols-12 gap-6 mb-8\">
              {/* Subject - Full width */}
              <div className=\"col-span-12\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  <span className=\"text-red-500\">*</span> Subject
                </label>
                <input
                  type=\"text\"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white\"
                  placeholder=\"Quotation subject\"
                  required
                />
              </div>

              {/* Related */}
              <div className=\"col-span-3\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  <span className=\"text-red-500\">*</span> Related
                </label>
                <select
                  value={relatedType}
                  onChange={(e) => {
                    setRelatedType(e.target.value as 'lead' | 'contact');
                    setRelatedId('');
                  }}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                >
                  <option value=\"lead\">Lead</option>
                  <option value=\"contact\">Contact</option>
                </select>
              </div>

              {/* To */}
              <div className=\"col-span-3\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  <span className=\"text-red-500\">*</span> To
                </label>
                <select
                  value={relatedId}
                  onChange={(e) => {
                    setRelatedId(e.target.value);
                    const entity = relatedType === 'lead' 
                      ? leads.find(l => l.id.toString() === e.target.value)
                      : contacts.find(c => c.id.toString() === e.target.value);
                    if (entity) {
                      setToField(`${entity.firstName} ${entity.lastName}`);
                      setEmail(entity.email || '');
                      setPhone(entity.phone || '');
                      setAddress(entity.address || '');
                      setCity(entity.city || '');
                      setState(entity.state || '');
                      setCountry(entity.country || '');
                      setZipCode(entity.zipCode || '');
                    }
                  }}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                  required
                >
                  <option value=\"\">Select {relatedType}</option>
                  {(relatedType === 'lead' ? leads : contacts).map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.firstName} {entity.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className=\"col-span-3\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                >
                  <option value=\"Draft\">Draft</option>
                  <option value=\"Sent\">Sent</option>
                  <option value=\"Viewed\">Viewed</option>
                  <option value=\"Accepted\">Accepted</option>
                  <option value=\"Rejected\">Rejected</option>
                </select>
              </div>

              {/* Assigned */}
              <div className=\"col-span-3\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  Assigned
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                >
                  <option value=\"\">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address - Full width */}
              <div className=\"col-span-12\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white resize-none\"
                  placeholder=\"Street address\"
                />
              </div>

              {/* City & State */}
              <div className=\"col-span-6\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  City
                </label>
                <input
                  type=\"text\"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                />
              </div>
              <div className=\"col-span-6\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  State
                </label>
                <input
                  type=\"text\"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                />
              </div>

              {/* Country & Zip */}
              <div className=\"col-span-6\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  Country
                </label>
                <input
                  type=\"text\"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                />
              </div>
              <div className=\"col-span-6\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  Zip Code
                </label>
                <input
                  type=\"text\"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                />
              </div>

              {/* Email & Phone */}
              <div className=\"col-span-6\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  <span className=\"text-red-500\">*</span> Email
                </label>
                <input
                  type=\"email\"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                  required
                />
              </div>
              <div className=\"col-span-6\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  Phone
                </label>
                <input
                  type=\"tel\"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                />
              </div>

              {/* Date, Open Till, Currency, Discount Type */}
              <div className=\"col-span-3\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  <span className=\"text-red-500\">*</span> Date
                </label>
                <input
                  type=\"date\"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                  required
                />
              </div>
              <div className=\"col-span-3\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  Open Till
                </label>
                <input
                  type=\"date\"
                  value={openTill}
                  onChange={(e) => setOpenTill(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                  min={date}
                />
              </div>
              <div className=\"col-span-3\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  <span className=\"text-red-500\">*</span> Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                >
                  {availableCurrencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className=\"col-span-3\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                >
                  <option value=\"%\">Percentage (%)</option>
                  <option value=\"fixed\">Fixed Amount</option>
                  <option value=\"none\">No discount</option>
                </select>
              </div>

              {/* Tags */}
              <div className=\"col-span-12\">
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">
                  🏷️ Tags
                </label>
                <input
                  type=\"text\"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className=\"w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white\"
                  placeholder=\"Add tags separated by commas\"
                />
              </div>

              {/* Allow Comments Toggle */}
              <div className=\"col-span-12\">
                <label className=\"flex items-center gap-3 cursor-pointer\">
                  <input
                    type=\"checkbox\"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className=\"w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500\"
                  />
                  <span className=\"text-sm font-medium text-gray-700 dark:text-gray-300\">
                    Allow Comments
                  </span>
                </label>
              </div>
            </div>

            {/* Line Items Section */}
            <div className=\"border-t border-gray-200 dark:border-gray-700 pt-8\">
              <div className=\"flex items-center justify-between mb-4\">
                <h3 className=\"text-lg font-semibold text-gray-900 dark:text-white\">
                  Line Items
                </h3>
                <div className=\"flex items-center gap-3\">
                  <span className=\"text-sm text-gray-600 dark:text-gray-400\">Show quantity as:</span>
                  <select
                    value={showQuantityAs}
                    onChange={(e) => setShowQuantityAs(e.target.value)}
                    className=\"px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                  >
                    <option value=\"Qty\">Qty</option>
                    <option value=\"Hours\">Hours</option>
                    <option value=\"Qty/Hours\">Qty/Hours</option>
                  </select>
                  <button
                    type=\"button\"
                    onClick={addItem}
                    className=\"px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors\"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Table Header */}
              <div className=\"overflow-x-auto\">
                <table className=\"w-full\">
                  <thead>
                    <tr className=\"border-b border-gray-200 dark:border-gray-700\">
                      <th className=\"text-left py-3 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase\">
                        <input type=\"checkbox\" className=\"w-4 h-4 rounded\" />
                      </th>
                      <th className=\"text-left py-3 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase\">
                        Item
                      </th>
                      <th className=\"text-left py-3 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase\">
                        Description
                      </th>
                      <th className=\"text-left py-3 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase\">
                        Long Description
                      </th>
                      <th className=\"text-right py-3 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase\">
                        {showQuantityAs}
                      </th>
                      <th className=\"text-center py-3 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase\">
                        Unit
                      </th>
                      <th className=\"text-right py-3 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase\">
                        Rate
                      </th>
                      <th className=\"text-right py-3 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase\">
                        Tax
                      </th>
                      <th className=\"text-right py-3 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase\">
                        Amount
                      </th>
                      <th className=\"py-3 px-3\"></th>
                    </tr>
                  </thead>
                  <tbody className=\"divide-y divide-gray-100 dark:divide-gray-800\">
                    {items.map((item, index) => (
                      <tr key={index} className=\"hover:bg-gray-50 dark:hover:bg-gray-700/50\">
                        <td className=\"py-3 px-3\">
                          <input
                            type=\"checkbox\"
                            checked={item.isOptional}
                            onChange={(e) => updateItem(index, 'isOptional', e.target.checked)}
                            className=\"w-4 h-4 rounded\"
                            title=\"This item is optional\"
                          />
                        </td>
                        <td className=\"py-3 px-3\">
                          <select
                            className=\"w-40 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                          >
                            <option value=\"\">Add Item</option>
                          </select>
                        </td>
                        <td className=\"py-3 px-3\">
                          <input
                            type=\"text\"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className=\"w-32 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                            placeholder=\"Description\"
                          />
                        </td>
                        <td className=\"py-3 px-3\">
                          <textarea
                            value={item.longDescription}
                            onChange={(e) => updateItem(index, 'longDescription', e.target.value)}
                            className=\"w-48 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none\"
                            rows={2}
                            placeholder=\"Long description\"
                          />
                        </td>
                        <td className=\"py-3 px-3\">
                          <input
                            type=\"number\"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min=\"0\"
                            step=\"0.01\"
                            className=\"w-20 px-2 py-2 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                          />
                        </td>
                        <td className=\"py-3 px-3 text-center\">
                          <input
                            type=\"text\"
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            className=\"w-20 px-2 py-2 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                          />
                        </td>
                        <td className=\"py-3 px-3\">
                          <input
                            type=\"number\"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                            min=\"0\"
                            step=\"0.01\"
                            className=\"w-24 px-2 py-2 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                            placeholder=\"Rate\"
                          />
                        </td>
                        <td className=\"py-3 px-3\">
                          <select
                            value={item.taxRate}
                            onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value))}
                            className=\"w-28 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                          >
                            <option value=\"0\">No Tax</option>
                            <option value=\"5\">5%</option>
                            <option value=\"10\">10%</option>
                            <option value=\"18\">18%</option>
                          </select>
                        </td>
                        <td className=\"py-3 px-3 text-right font-medium text-gray-900 dark:text-white\">
                          {getCurrencySymbol(currency)}{item.amount.toFixed(2)}
                        </td>
                        <td className=\"py-3 px-3\">
                          {items.length > 1 && (
                            <button
                              type=\"button\"
                              onClick={() => removeItem(index)}
                              className=\"p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors\"
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

              {/* Note about optional items */}
              {items.some(item => item.isOptional) && (
                <div className=\"mt-2 text-xs text-gray-500 dark:text-gray-400\">
                  ✓ This item is optional
                </div>
              )}
            </div>

            {/* Totals Section */}
            <div className=\"mt-8 flex justify-end\">
              <div className=\"w-96 space-y-3\">
                <div className=\"flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700\">
                  <span className=\"text-sm font-medium text-gray-700 dark:text-gray-300\">Sub Total :</span>
                  <span className=\"text-lg font-semibold text-gray-900 dark:text-white\">
                    {getCurrencySymbol(currency)}{subTotal.toFixed(2)}
                  </span>
                </div>
                
                <div className=\"flex justify-between items-center py-2\">
                  <span className=\"text-sm font-medium text-gray-700 dark:text-gray-300\">Discount</span>
                  <div className=\"flex items-center gap-2\">
                    <input
                      type=\"number\"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      min=\"0\"
                      step=\"0.01\"
                      className=\"w-24 px-2 py-1.5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                    />
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className=\"px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                    >
                      <option value=\"%\">%</option>
                      <option value=\"fixed\">{getCurrencySymbol(currency)}</option>
                    </select>
                    <span className=\"text-sm font-medium text-red-600 dark:text-red-400 w-24 text-right\">
                      -{getCurrencySymbol(currency)}{discount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className=\"flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700\">
                  <span className=\"text-sm font-medium text-gray-700 dark:text-gray-300\">Adjustment</span>
                  <div className=\"flex items-center gap-2\">
                    <input
                      type=\"number\"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(parseFloat(e.target.value) || 0)}
                      step=\"0.01\"
                      className=\"w-24 px-2 py-1.5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white\"
                    />
                    <span className=\"text-sm font-medium text-gray-900 dark:text-white w-24 text-right\">
                      {getCurrencySymbol(currency)}{adjustmentValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className=\"flex justify-between items-center py-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-4\">
                  <span className=\"text-base font-bold text-gray-900 dark:text-white\">Total :</span>
                  <span className=\"text-2xl font-bold text-gray-900 dark:text-white\">
                    {getCurrencySymbol(currency)}{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className=\"flex items-center justify-end gap-3\">
            <Button
              type=\"button\"
              variant=\"OUTLINE\"
              onClick={() => navigate(-1)}
              className=\"px-6\"
            >
              Cancel
            </Button>
            <Button
              type=\"button\"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={loading}
              className=\"px-6 bg-blue-600 hover:bg-blue-700 text-white\"
            >
              Save & Send
            </Button>
            <Button
              type=\"button\"
              onClick={(e) => handleSubmit(e as any, false)}
              disabled={loading}
              className=\"px-6 bg-red-500 hover:bg-red-600 text-white\"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>

          {/* Helper text */}
          <p className=\"text-xs text-gray-500 dark:text-gray-400 text-center\">
            Include proposal items with merge field anywhere in proposal content as {'{proposal_items}'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreateQuotationPage;
