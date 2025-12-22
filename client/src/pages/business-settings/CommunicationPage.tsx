import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Edit, Trash2, Mail, MessageSquare, Zap, Settings,
  Save, X, Copy, Eye, EyeOff, AlertCircle, CheckCircle, Clock, FileText, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Template {
  id: number;
  name: string;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS';
  subject?: string;
  content: string;
  variables?: any;
  isActive: boolean;
  isDefault: boolean;
  createdByUser: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Automation {
  id: number;
  name: string;
  triggerType: 'LEAD_CREATED' | 'LEAD_UPDATED' | 'LEAD_STATUS_CHANGED' | 'LEAD_ASSIGNED';
  template: {
    id: number;
    name: string;
    type: string;
  };
  conditions?: any;
  delay?: number;
  isActive: boolean;
  createdAt: string;
}

interface Provider {
  id: number;
  name: string;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS';
  config: any;
  isActive: boolean;
  isDefault: boolean;
}

interface EmailTemplate {
  id: number;
  name: string;
  category: 'WELCOME' | 'EMAIL_VERIFICATION' | 'EMAIL_CHANGE_CONFIRMATION' | 'PASSWORD_RESET' | 'WELCOME_SERIES' | 'ONBOARDING' | 'NEWSLETTER' | 'MARKETING' | 'SYSTEM_NOTIFICATION' | 'CUSTOM';
  type: 'EMAIL';
  subject: string;
  htmlContent: string;
  textContent: string;
  variables?: any;
  metadata?: any;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'ARCHIVED' | 'REJECTED';
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const CommunicationPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('email-templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEmailTemplateModal, setShowEmailTemplateModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewData, setPreviewData] = useState<any>(null);

  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'EMAIL' as 'EMAIL' | 'WHATSAPP' | 'SMS',
    subject: '',
    content: '',
    isDefault: false
  });

  const [emailTemplateForm, setEmailTemplateForm] = useState({
    name: '',
    category: 'WELCOME' as EmailTemplate['category'],
    subject: '',
    htmlContent: '',
    textContent: '',
    variables: {} as Record<string, boolean>,
    isActive: true,
    isDefault: false,
    status: 'ACTIVE' as EmailTemplate['status']
  });

  const [automationForm, setAutomationForm] = useState({
    name: '',
    triggerType: 'LEAD_CREATED' as 'LEAD_CREATED' | 'LEAD_UPDATED' | 'LEAD_STATUS_CHANGED' | 'LEAD_ASSIGNED',
    templateId: '',
    conditions: '',
    delay: 0
  });

  const [providerForm, setProviderForm] = useState({
    name: '',
    type: 'EMAIL' as 'EMAIL' | 'WHATSAPP' | 'SMS',
    config: '',
    isDefault: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTemplates(),
        fetchEmailTemplates(),
        fetchAutomations(),
        fetchProviders()
      ]);
    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/communications/templates', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/business-settings/email-templates', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      if (data.success) {
        setEmailTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

  const fetchAutomations = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/automation/workflows', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      if (data.success) {
        setAutomations(data.data.automations);
      }
    } catch (error) {
      console.error('Error fetching automations:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/communication/providers', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      if (data.success) {
        setProviders(data.data.providers);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const url = editingTemplate
        ? `/api/communications/templates/${editingTemplate.id}`
        : '/api/communications/templates';

      const response = await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateForm),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingTemplate ? 'Template updated successfully' : 'Template created successfully');
        setShowTemplateModal(false);
        setEditingTemplate(null);
        setTemplateForm({ name: '', type: 'EMAIL', subject: '', content: '', isDefault: false });
        await fetchTemplates();
      } else {
        toast.error(data.message || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/communications/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Template deleted successfully');
        await fetchTemplates();
      } else {
        toast.error(data.message || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      isDefault: template.isDefault
    });
    setShowTemplateModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'SMS':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTriggerTypeLabel = (triggerType: string) => {
    switch (triggerType) {
      case 'LEAD_CREATED':
        return 'Lead Created';
      case 'LEAD_UPDATED':
        return 'Lead Updated';
      case 'LEAD_STATUS_CHANGED':
        return 'Status Changed';
      case 'LEAD_ASSIGNED':
        return 'Lead Assigned';
      default:
        return triggerType;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'WELCOME': 'Welcome Email',
      'EMAIL_VERIFICATION': 'Email Verification',
      'EMAIL_CHANGE_CONFIRMATION': 'Email Change Confirmation',
      'PASSWORD_RESET': 'Password Reset',
      'WELCOME_SERIES': 'Welcome Series',
      'ONBOARDING': 'Onboarding',
      'NEWSLETTER': 'Newsletter',
      'MARKETING': 'Marketing',
      'SYSTEM_NOTIFICATION': 'System Notification',
      'CUSTOM': 'Custom'
    };
    return labels[category] || category;
  };

  const handleSaveEmailTemplate = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userIdStr = localStorage.getItem('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : 1;

      const url = editingEmailTemplate
        ? `/api/business-settings/email-templates/${editingEmailTemplate.id}`
        : '/api/business-settings/email-templates';

      const payload = {
        ...emailTemplateForm,
        createdBy: userId,
      };

      // If setting as default, ensure only one default per category
      if (emailTemplateForm.isDefault) {
        // First unset other defaults for this category
        const existingDefaults = emailTemplates.filter(
          t => t.category === emailTemplateForm.category && t.isDefault && t.id !== editingEmailTemplate?.id
        );
        for (const template of existingDefaults) {
          await fetch(`/api/business-settings/email-templates/${template.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...template, isDefault: false }),
          });
        }
      }

      const response = await fetch(url, {
        method: editingEmailTemplate ? 'PUT' : 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingEmailTemplate ? 'Email template updated successfully' : 'Email template created successfully');
        setShowEmailTemplateModal(false);
        setEditingEmailTemplate(null);
        setEmailTemplateForm({
          name: '',
          category: 'WELCOME',
          subject: '',
          htmlContent: '',
          textContent: '',
          variables: {},
          isActive: true,
          isDefault: false,
          status: 'ACTIVE'
        });
        await fetchEmailTemplates();
      } else {
        toast.error(data.message || 'Failed to save email template');
      }
    } catch (error) {
      console.error('Error saving email template:', error);
      toast.error('Failed to save email template');
    }
  };

  const handleDeleteEmailTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this email template?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/business-settings/email-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Email template deleted successfully');
        await fetchEmailTemplates();
      } else {
        toast.error(data.message || 'Failed to delete email template');
      }
    } catch (error) {
      console.error('Error deleting email template:', error);
      toast.error('Failed to delete email template');
    }
  };

  const handleEditEmailTemplate = (template: EmailTemplate) => {
    setEditingEmailTemplate(template);
    setEmailTemplateForm({
      name: template.name,
      category: template.category,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      variables: template.variables || {},
      isActive: template.isActive,
      isDefault: template.isDefault,
      status: template.status
    });
    setShowEmailTemplateModal(true);
  };

  const handlePreviewEmailTemplate = async (template: EmailTemplate) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/business-settings/email-templates/preview/${template.id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      if (data.success) {
        setPreviewData(data.data);
      }
    } catch (error) {
      console.error('Error previewing email template:', error);
      toast.error('Failed to preview email template');
    }
  };

  const addVariable = (variable: string) => {
    setEmailTemplateForm(prev => ({
      ...prev,
      variables: { ...prev.variables, [variable]: true }
    }));
  };

  const filteredEmailTemplates = selectedCategory === 'ALL'
    ? emailTemplates
    : emailTemplates.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Communication Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'email-templates', label: 'Email Templates', icon: FileText },
            { id: 'templates', label: 'Message Templates', icon: Mail },
            // { id: 'automations', label: 'Automations', icon: Zap },
            // { id: 'providers', label: 'Providers', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-weconnect-red text-weconnect-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Email Templates Tab */}
      {activeTab === 'email-templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Email Templates
            </h2>
            <button
              onClick={() => {
                setEditingEmailTemplate(null);
                setEmailTemplateForm({
                  name: '',
                  category: 'WELCOME',
                  subject: '',
                  htmlContent: '',
                  textContent: '',
                  variables: {},
                  isActive: true,
                  isDefault: false,
                  status: 'ACTIVE'
                });
                setShowEmailTemplateModal(true);
              }}
              className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Email Template
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              <option value="WELCOME">Welcome</option>
              <option value="EMAIL_VERIFICATION">Email Verification</option>
              <option value="EMAIL_CHANGE_CONFIRMATION">Email Change</option>
              <option value="PASSWORD_RESET">Password Reset</option>
              <option value="WELCOME_SERIES">Welcome Series</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="NEWSLETTER">Newsletter</option>
              <option value="MARKETING">Marketing</option>
              <option value="SYSTEM_NOTIFICATION">System Notification</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredEmailTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {getCategoryLabel(template.category)}
                        </span>
                        {template.isDefault && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        {!template.isActive && (
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${template.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            template.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {template.status}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject: {template.subject}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.htmlContent.length > 150
                          ? `${template.htmlContent.substring(0, 150).replace(/<[^>]*>/g, '')}...`
                          : template.htmlContent.replace(/<[^>]*>/g, '')
                        }
                      </p>

                      {template.variables && Object.keys(template.variables).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="text-xs text-gray-500">Variables: </span>
                          {Object.keys(template.variables).map((key) => (
                            <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {'{'}{key}{'}'}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Updated: {new Date(template.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePreviewEmailTemplate(template)}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditEmailTemplate(template)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmailTemplate(template.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEmailTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedCategory === 'ALL' ? 'No email templates found' : `No templates found for ${getCategoryLabel(selectedCategory)}`}
              </p>
              <button
                onClick={() => {
                  setEditingEmailTemplate(null);
                  setEmailTemplateForm({
                    name: '',
                    category: selectedCategory !== 'ALL' ? selectedCategory as EmailTemplate['category'] : 'WELCOME',
                    subject: '',
                    htmlContent: '',
                    textContent: '',
                    variables: {},
                    isActive: true,
                    isDefault: false,
                    status: 'ACTIVE'
                  });
                  setShowEmailTemplateModal(true);
                }}
                className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Create your first email template
              </button>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Message Templates
            </h2>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setTemplateForm({ name: '', type: 'EMAIL', subject: '', content: '', isDefault: false });
                setShowTemplateModal(true);
              }}
              className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTypeIcon(template.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        {template.isDefault && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        {!template.isActive && (
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>

                      {template.subject && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subject: {template.subject}
                        </p>
                      )}

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.content.length > 100
                          ? `${template.content.substring(0, 100)}...`
                          : template.content
                        }
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created by {template.createdByUser.firstName} {template.createdByUser.lastName} on{' '}
                        {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No templates found</p>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Create your first template
              </button>
            </div>
          )}
        </div>
      )}

      {/* Automations Tab */}
      {activeTab === 'automations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Automation Rules
            </h2>
            <button
              onClick={() => setShowAutomationModal(true)}
              className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Automation
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <Zap className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {automation.name}
                        </h3>
                        {!automation.isActive && (
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Trigger:</strong> {getTriggerTypeLabel(automation.triggerType)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Template:</strong> {automation.template.name} ({automation.template.type})
                        </p>
                        {automation.delay && automation.delay > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Delay:</strong> {automation.delay} minutes
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Created on {new Date(automation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {automations.length === 0 && (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No automations found</p>
              <button
                onClick={() => setShowAutomationModal(true)}
                className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Create your first automation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Email Template Modal */}
      {showEmailTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingEmailTemplate ? 'Edit Email Template' : 'Create New Email Template'}
                </h3>
                <button
                  onClick={() => {
                    setShowEmailTemplateModal(false);
                    setPreviewData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={emailTemplateForm.name}
                      onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                      placeholder="Welcome Email Template"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={emailTemplateForm.category}
                      onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, category: e.target.value as EmailTemplate['category'] })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                    >
                      <option value="WELCOME">Welcome</option>
                      <option value="EMAIL_VERIFICATION">Email Verification</option>
                      <option value="EMAIL_CHANGE_CONFIRMATION">Email Change Confirmation</option>
                      <option value="PASSWORD_RESET">Password Reset</option>
                      <option value="WELCOME_SERIES">Welcome Series</option>
                      <option value="ONBOARDING">Onboarding</option>
                      <option value="NEWSLETTER">Newsletter</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="SYSTEM_NOTIFICATION">System Notification</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    value={emailTemplateForm.subject}
                    onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                    placeholder="{appName} - Welcome {firstName}"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{variableName}'} for dynamic values (e.g., {'{firstName}'}, {'{email}'}, {'{password}'}, {'{appName}'})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    HTML Content *
                  </label>
                  <textarea
                    value={emailTemplateForm.htmlContent}
                    onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, htmlContent: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="<p>Hello {firstName},</p><p>Your account has been created...</p>"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plain Text Content *
                  </label>
                  <textarea
                    value={emailTemplateForm.textContent}
                    onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, textContent: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="Hello {firstName}, Your account has been created..."
                  />
                </div>

                {/* Available Variables Helper */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {['firstName', 'lastName', 'email', 'password', 'appName', 'verificationLink', 'resetLink'].map((varName) => (
                      <button
                        key={varName}
                        type="button"
                        onClick={() => {
                          const varText = `{${varName}}`;
                          setEmailTemplateForm(prev => ({
                            ...prev,
                            htmlContent: prev.htmlContent + varText,
                            textContent: prev.textContent + varText,
                            variables: { ...prev.variables, [varName]: true }
                          }));
                        }}
                        className="text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                      >
                        {'{'}{varName}{'}'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click on a variable to insert it into your template. Welcome emails should include {'{email}'} and {'{password}'} fields.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={emailTemplateForm.isActive}
                      onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, isActive: e.target.checked })}
                      className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={emailTemplateForm.isDefault}
                      onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, isDefault: e.target.checked })}
                      className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Set as Default
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={emailTemplateForm.status}
                      onChange={(e) => setEmailTemplateForm({ ...emailTemplateForm, status: e.target.value as EmailTemplate['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="APPROVED">Approved</option>
                      <option value="ACTIVE">Active</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    setShowEmailTemplateModal(false);
                    setPreviewData(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEmailTemplate}
                  disabled={!emailTemplateForm.name || !emailTemplateForm.subject || !emailTemplateForm.htmlContent || !emailTemplateForm.textContent}
                  className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingEmailTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Email Preview
                </h3>
                <button
                  onClick={() => setPreviewData(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{previewData.subject}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    HTML Preview:
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700" dangerouslySetInnerHTML={{ __html: previewData.htmlContent }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plain Text Preview:
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 text-sm whitespace-pre-wrap">
                    {previewData.textContent}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setPreviewData(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                      placeholder="Welcome Email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type *
                    </label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>
                </div>

                {templateForm.type === 'EMAIL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                      placeholder="Welcome to {{companyName}}"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message Content *
                  </label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                    placeholder="Hi {{leadFirstName}}, welcome to {{companyName}}..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available variables: {'{{leadFirstName}}, {{leadLastName}}, {{leadEmail}}, {{leadPhone}}, {{leadCompany}}, {{companyName}}, {{assignedUserName}}'}
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={templateForm.isDefault}
                    onChange={(e) => setTemplateForm({ ...templateForm, isDefault: e.target.checked })}
                    className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Set as default template for this type
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!templateForm.name || !templateForm.content}
                  className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationPage;