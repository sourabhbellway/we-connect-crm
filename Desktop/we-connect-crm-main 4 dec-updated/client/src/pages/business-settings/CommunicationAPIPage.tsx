import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Edit, Trash2, Settings, Save, X, Eye, EyeOff, 
  AlertCircle, CheckCircle, Test, Copy, MessageSquare, 
  Mail, Smartphone, Zap, Key, Globe, Lock, Send
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardContent } from '../../components/ui';

interface CommunicationProvider {
  id?: number;
  name: string;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS';
  provider: string;
  config: {
    apiKey?: string;
    apiSecret?: string;
    accountSid?: string;
    authToken?: string;
    phoneNumberId?: string;
    accessToken?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromName?: string;
    fromEmail?: string;
    [key: string]: any;
  };
  isActive: boolean;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProviderTemplate {
  name: string;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS';
  provider: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'email' | 'url';
    required: boolean;
    placeholder?: string;
    description?: string;
  }>;
}

const providerTemplates: ProviderTemplate[] = [
  {
    name: 'Twilio SMS',
    type: 'SMS',
    provider: 'TWILIO',
    fields: [
      { name: 'accountSid', label: 'Account SID', type: 'text', required: true, placeholder: 'ACxxxxxxx' },
      { name: 'authToken', label: 'Auth Token', type: 'password', required: true },
      { name: 'fromPhone', label: 'From Phone Number', type: 'text', required: true, placeholder: '+1234567890' }
    ]
  },
  {
    name: 'TextLocal SMS',
    type: 'SMS',
    provider: 'TEXTLOCAL',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'sender', label: 'Sender Name', type: 'text', required: true, placeholder: '6 chars max' }
    ]
  },
  {
    name: 'MSG91 SMS',
    type: 'SMS',
    provider: 'MSG91',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'senderId', label: 'Sender ID', type: 'text', required: true }
    ]
  },
  {
    name: 'WhatsApp Business API',
    type: 'WHATSAPP',
    provider: 'WHATSAPP_BUSINESS',
    fields: [
      { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { name: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
      { name: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'password', required: true }
    ]
  },
  {
    name: 'Gupshup WhatsApp',
    type: 'WHATSAPP',
    provider: 'GUPSHUP',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'appName', label: 'App Name', type: 'text', required: true },
      { name: 'source', label: 'Source Number', type: 'text', required: true, placeholder: '91xxxxxxxxxx' }
    ]
  },
  {
    name: 'SMTP Email',
    type: 'EMAIL',
    provider: 'SMTP',
    fields: [
      { name: 'smtpHost', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.gmail.com' },
      { name: 'smtpPort', label: 'SMTP Port', type: 'number', required: true, placeholder: '587' },
      { name: 'smtpUser', label: 'SMTP Username', type: 'email', required: true },
      { name: 'smtpPassword', label: 'SMTP Password', type: 'password', required: true },
      { name: 'fromName', label: 'From Name', type: 'text', required: true, placeholder: 'Your Company Name' },
      { name: 'fromEmail', label: 'From Email', type: 'email', required: true }
    ]
  },
  {
    name: 'SendGrid Email',
    type: 'EMAIL',
    provider: 'SENDGRID',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'fromName', label: 'From Name', type: 'text', required: true },
      { name: 'fromEmail', label: 'From Email', type: 'email', required: true }
    ]
  },
  {
    name: 'Mailgun Email',
    type: 'EMAIL',
    provider: 'MAILGUN',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'mg.yourdomain.com' },
      { name: 'fromName', label: 'From Name', type: 'text', required: true },
      { name: 'fromEmail', label: 'From Email', type: 'email', required: true }
    ]
  }
];

const CommunicationAPIPage: React.FC = () => {
  const { t } = useTranslation();
  const [providers, setProviders] = useState<CommunicationProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<CommunicationProvider | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProviderTemplate | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [testingProvider, setTestingProvider] = useState<number | null>(null);
  
  const [providerForm, setProviderForm] = useState<Partial<CommunicationProvider>>({
    name: '',
    type: 'EMAIL',
    provider: '',
    config: {},
    isActive: true,
    isDefault: false
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/communication/providers', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      if (data.success) {
        setProviders(data.data.providers || []);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Set mock data for now
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const url = editingProvider 
        ? `/api/communication/providers/${editingProvider.id}`
        : '/api/communication/providers';
      
      const response = await fetch(url, {
        method: editingProvider ? 'PUT' : 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerForm),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingProvider ? 'Provider updated successfully' : 'Provider created successfully');
        setShowProviderModal(false);
        setEditingProvider(null);
        setSelectedTemplate(null);
        resetForm();
        await fetchProviders();
      } else {
        toast.error(data.message || 'Failed to save provider');
      }
    } catch (error) {
      console.error('Error saving provider:', error);
      toast.error('Failed to save provider');
    }
  };

  const handleDeleteProvider = async (id: number) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/communication/providers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Provider deleted successfully');
        await fetchProviders();
      } else {
        toast.error(data.message || 'Failed to delete provider');
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Failed to delete provider');
    }
  };

  const handleTestProvider = async (provider: CommunicationProvider) => {
    setTestingProvider(provider.id!);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/communication/providers/${provider.id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType: provider.type.toLowerCase(),
          recipient: provider.type === 'EMAIL' ? 'test@example.com' : '+919999999999'
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Test message sent successfully!');
      } else {
        toast.error(data.message || 'Test failed');
      }
    } catch (error) {
      console.error('Error testing provider:', error);
      toast.error('Test failed');
    } finally {
      setTestingProvider(null);
    }
  };

  const resetForm = () => {
    setProviderForm({
      name: '',
      type: 'EMAIL',
      provider: '',
      config: {},
      isActive: true,
      isDefault: false
    });
  };

  const handleEditProvider = (provider: CommunicationProvider) => {
    setEditingProvider(provider);
    setProviderForm({ ...provider });
    // Find the matching template - try by stored provider key, then by name, then by type
    const cfg: any = provider.config || {};
    const template =
      providerTemplates.find(t => t.provider === cfg.provider) ||
      providerTemplates.find(t => t.name === provider.name) ||
      providerTemplates.find(t => t.type === provider.type);
    setSelectedTemplate(template || null);
    setShowProviderModal(true);
  };

  const handleTemplateSelect = (template: ProviderTemplate) => {
    setSelectedTemplate(template);
    setProviderForm(prev => ({
      ...prev,
      name: template.name,
      type: template.type,
      provider: template.provider,
      // Pre-seed config with provider identifier so it is persisted on save
      config: { provider: template.provider },
    }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setProviderForm(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'SMS':
        return <Smartphone className="h-5 w-5 text-purple-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (provider: CommunicationProvider) => {
    if (!provider.isActive) {
      return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Inactive</span>;
    }
    if (provider.isDefault) {
      return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Default</span>;
    }
    return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Communication API Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure WhatsApp, SMS, and Email gateways for automated communications
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingProvider(null);
            setSelectedTemplate(null);
            setShowProviderModal(true);
          }}
          className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </button>
      </div>

      {/* Provider Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {['EMAIL', 'WHATSAPP', 'SMS'].map((type) => {
          const typeProviders = providers.filter(p => p.type === type);
          const activeCount = typeProviders.filter(p => p.isActive).length;
          
          return (
            <Card key={type} variant="OUTLINED">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(type)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {type === 'EMAIL' ? 'Email' : type === 'WHATSAPP' ? 'WhatsApp' : 'SMS'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activeCount} active / {typeProviders.length} total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{typeProviders.length}</p>
                    <p className="text-xs text-gray-500">providers</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Providers List */}
      <div className="space-y-4">
        {providers.length === 0 ? (
          <Card variant="OUTLINED">
            <CardContent className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Communication Providers Configured
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add your first communication provider to start sending automated messages
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowProviderModal(true);
                }}
                className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Get Started
              </button>
            </CardContent>
          </Card>
        ) : (
          providers.map((provider) => (
            <Card key={provider.id} variant="ELEVATED">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTypeIcon(provider.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {provider.name}
                        </h3>
                        {getStatusBadge(provider)}
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Provider:</span> {(provider.config as any)?.provider || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Type:</span> {provider.type}
                        </p>
                        {provider.createdAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created on {new Date(provider.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      {/* Configuration Preview */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Configuration:</p>
                        <div className="space-y-1">
                          {Object.entries(provider.config).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {key.toLowerCase().includes('password') || key.toLowerCase().includes('token') || key.toLowerCase().includes('key')
                                  ? '••••••••'
                                  : String(value).length > 20
                                  ? String(value).substring(0, 20) + '...'
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                          {Object.keys(provider.config).length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{Object.keys(provider.config).length - 3} more fields
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTestProvider(provider)}
                      disabled={testingProvider === provider.id}
                      className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                      title="Test provider"
                    >
                      {testingProvider === provider.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditProvider(provider)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit provider"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProvider(provider.id!)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete provider"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Provider Configuration Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingProvider ? 'Edit Provider' : 'Add Communication Provider'}
                </h3>
                <button
                  onClick={() => setShowProviderModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Provider Template Selection */}
                {!editingProvider && !selectedTemplate && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Choose a Provider Template
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {providerTemplates.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => handleTemplateSelect(template)}
                          className="text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-weconnect-red hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {getTypeIcon(template.type)}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {template.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {template.type} • {template.fields.length} configuration fields
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Provider Configuration Form */}
                {(selectedTemplate || editingProvider) && (
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Provider Name *
                        </label>
                        <input
                          type="text"
                          value={providerForm.name}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                          placeholder="My WhatsApp Provider"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Provider Type
                        </label>
                        <input
                          type="text"
                          value={`${providerForm.type} (${(providerForm.config as any)?.provider || providerForm.provider || 'Unknown'})`}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Configuration Fields */}
                    {selectedTemplate && (
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">
                          Configuration
                        </h4>
                        {selectedTemplate.fields.map((field) => (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {field.label} {field.required && '*'}
                            </label>
                            <div className="relative">
                              <input
                                type={field.type === 'password' && showPasswords[field.name] ? 'text' : field.type}
                                value={providerForm.config?.[field.name] || ''}
                                onChange={(e) => handleConfigChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                                placeholder={field.placeholder}
                                required={field.required}
                              />
                              {field.type === 'password' && (
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(field.name)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showPasswords[field.name] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                            {field.description && (
                              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Settings */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={providerForm.isActive}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Enable this provider
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={providerForm.isDefault}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Set as default provider for this type
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    setShowProviderModal(false);
                    setSelectedTemplate(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                {(selectedTemplate || editingProvider) && (
                  <button
                    onClick={handleSaveProvider}
                    disabled={!providerForm.name}
                    className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingProvider ? 'Update' : 'Create'} Provider
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationAPIPage;