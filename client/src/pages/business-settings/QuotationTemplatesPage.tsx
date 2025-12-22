import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../../components/ui';
import { FileText, ArrowLeft, Plus, Edit3, Trash2, Star, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

interface QuotationTemplate {
  id: number;
  name: string;
  description?: string;
  headerContent?: string;
  footerContent?: string;
  termsAndConditions?: string;
  validityDays: number;
  showTax: boolean;
  showDiscount: boolean;
  logoPosition: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const QuotationTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuotationTemplate | null>(null);
  
  const [formData, setFormData] = useState<Partial<QuotationTemplate>>({
    name: '',
    description: '',
    headerContent: '',
    footerContent: '',
    termsAndConditions: '',
    validityDays: 30,
    showTax: true,
    showDiscount: true,
    logoPosition: 'left',
    isDefault: false,
    isActive: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/business-settings/quotation-templates');
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch quotation templates:', error);
      toast.error('Failed to load quotation templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('Template name is required');
      return;
    }

    try {
      if (editingTemplate) {
        const response = await axios.put(`/api/business-settings/quotation-templates/${editingTemplate.id}`, formData);
        if (response.data.success) {
          toast.success('Template updated successfully');
          setShowForm(false);
          setEditingTemplate(null);
          resetForm();
          fetchTemplates();
        }
      } else {
        const response = await axios.post('/api/business-settings/quotation-templates', formData);
        if (response.data.success) {
          toast.success('Template created successfully');
          setShowForm(false);
          resetForm();
          fetchTemplates();
        }
      }
    } catch (error: any) {
      console.error('Failed to save template:', error);
      toast.error(error.response?.data?.message || 'Failed to save template');
    }
  };

  const handleEdit = (template: QuotationTemplate) => {
    setEditingTemplate(template);
    setFormData(template);
    setShowForm(true);
  };

  const handleSetDefault = async (id: number) => {
    try {
      const response = await axios.put(`/api/business-settings/quotation-templates/${id}/set-default`);
      if (response.data.success) {
        toast.success('Default template updated successfully');
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to set default template:', error);
      toast.error('Failed to set default template');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`/api/business-settings/quotation-templates/${id}`);
        if (response.data.success) {
          toast.success('Template deleted successfully');
          fetchTemplates();
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
        toast.error('Failed to delete template');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      headerContent: '',
      footerContent: '',
      termsAndConditions: '',
      validityDays: 30,
      showTax: true,
      showDiscount: true,
      logoPosition: 'left',
      isDefault: false,
      isActive: true,
    });
  };

  const handleChange = (field: keyof QuotationTemplate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="GHOST"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingTemplate(null);
                resetForm();
              }}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure quotation template settings
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Template Settings
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Standard Quotation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.validityDays || 30}
                    onChange={(e) => handleChange('validityDays', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Brief description of this template"
                  rows={2}
                />
              </div>

              {/* Header Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Header Content
                </label>
                <textarea
                  value={formData.headerContent || ''}
                  onChange={(e) => handleChange('headerContent', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Header text or HTML (will appear at top of quotation)"
                  rows={3}
                />
              </div>

              {/* Footer Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Footer Content
                </label>
                <textarea
                  value={formData.footerContent || ''}
                  onChange={(e) => handleChange('footerContent', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Footer text or HTML (will appear at bottom of quotation)"
                  rows={3}
                />
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  value={formData.termsAndConditions || ''}
                  onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter terms and conditions for this quotation"
                  rows={5}
                />
              </div>

              {/* Display Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo Position
                  </label>
                  <select
                    value={formData.logoPosition || 'left'}
                    onChange={(e) => handleChange('logoPosition', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showTax"
                      checked={formData.showTax || false}
                      onChange={(e) => handleChange('showTax', e.target.checked)}
                      className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="showTax" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Show Tax
                    </label>
                  </div>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showDiscount"
                      checked={formData.showDiscount || false}
                      onChange={(e) => handleChange('showDiscount', e.target.checked)}
                      className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="showDiscount" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Show Discount
                    </label>
                  </div>
                </div>
              </div>

              {/* Status Options */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive || false}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Active (make this template available for use)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault || false}
                    onChange={(e) => handleChange('isDefault', e.target.checked)}
                    className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Set as default template
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
                <Button
                  type="button"
                  variant="OUTLINE"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="GHOST"
            size="sm"
            onClick={() => navigate('/business-settings')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quotation Templates
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage quotation templates for your business
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Templates Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first quotation template to get started
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="group hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      {template.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {template.description || 'No description'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Template Info */}
                <div className="mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Validity:</span>
                    <span className="font-medium">{template.validityDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Show Tax:</span>
                    <span className="font-medium">{template.showTax ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Show Discount:</span>
                    <span className="font-medium">{template.showDiscount ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={template.isActive ? 'text-green-600' : 'text-red-600'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {!template.isDefault && (
                    <Button
                      variant="OUTLINE"
                      size="sm"
                      onClick={() => handleSetDefault(template.id)}
                      className="flex items-center gap-2 justify-center"
                    >
                      <Star className="w-4 h-4" />
                      Set Default
                    </Button>
                  )}

                  <Button
                    variant="OUTLINE"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex items-center gap-2 justify-center"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Button>

                  {!template.isDefault && (
                    <Button
                      variant="OUTLINE"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="flex items-center gap-2 justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 col-span-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
}
        </div>
      )}

      {/* Info Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                About Quotation Templates
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quotation templates define the design and structure of quotations generated in deal management. 
                When you create a quotation from a deal, it will use the default template's settings for header, footer, 
                terms, and display options. Products and services will be automatically fetched from the deal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationTemplatesPage;
