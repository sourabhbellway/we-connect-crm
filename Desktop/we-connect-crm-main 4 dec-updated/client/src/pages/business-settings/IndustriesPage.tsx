import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, PageLoader } from '../../components/ui';
import { Building2, ArrowLeft, Save, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { industryService, Industry } from '../../services/industryService';

interface IndustryFormData {
  name: string;
  isActive: boolean;
}

const IndustriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<IndustryFormData>({
    name: '',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      setIsLoading(true);
      const data = await industryService.getIndustries();
      setIndustries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch industries:', error);
      toast.error('Failed to load industries');
      setIndustries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      isActive: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (industry: Industry) => {
    setFormData({
      name: industry.name,
      isActive: industry.isActive !== undefined ? industry.isActive : true,
    });
    setEditingId(industry.id);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.name.trim()) {
      toast.error('Industry name is required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Only send fields that the backend accepts
      const payload = {
        name: formData.name.trim(),
        isActive: formData.isActive,
      };
      
      if (editingId) {
        const result = await industryService.updateIndustry(editingId, payload);
        if (result) {
          toast.success('Industry updated successfully');
        }
      } else {
        const result = await industryService.createIndustry(payload);
        if (result) {
          toast.success('Industry added successfully');
        }
      }
      resetForm();
      fetchIndustries();
    } catch (error: any) {
      console.error('Failed to save industry:', error);
      const errorMessage = error?.response?.data?.message?.message || 
                          error?.response?.data?.message || 
                          'Failed to save industry';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this industry? This action cannot be undone.')) {
      try {
        await industryService.deleteIndustry(id);
        toast.success('Industry deleted successfully');
        fetchIndustries();
      } catch (error) {
        console.error('Failed to delete industry:', error);
        toast.error('Failed to delete industry');
      }
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await industryService.updateIndustry(id, { isActive: !isActive });
      toast.success('Industry updated successfully');
      fetchIndustries();
    } catch (error) {
      console.error('Failed to update industry:', error);
      toast.error('Failed to update industry');
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading industries..." />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
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
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Industries Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure and manage industry options for leads and companies
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Industry' : 'Add New Industry'}
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Industry Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Active (available for selection)
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="PRIMARY"
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="OUTLINE"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Industries List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Industries ({industries.length})
                </h3>
                <Button
                  variant="OUTLINE"
                  size="sm"
                  onClick={resetForm}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {industries.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Industries Found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first industry to start categorizing your leads and companies.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {industries
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((industry) => (
                      <div
                        key={industry.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {industry.name}
                              </h4>
                              {industry.isActive === false && (
                                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {industry.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {industry.description}
                              </p>
                            )}
                            {industry.fields && industry.fields.length > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {industry.fields.length} custom field{industry.fields.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="GHOST"
                            size="sm"
                            onClick={() => handleToggleActive(industry.id, industry.isActive !== false)}
                            className="p-1"
                            title={industry.isActive !== false ? 'Deactivate' : 'Activate'}
                          >
                            {industry.isActive !== false ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                          
                          <Button
                            variant="GHOST"
                            size="sm"
                            onClick={() => handleEdit(industry)}
                            className="p-1"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4 text-blue-500" />
                          </Button>
                          
                          <Button
                            variant="GHOST"
                            size="sm"
                            onClick={() => handleDelete(industry.id)}
                            className="p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Card */}
      {industries.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Industries Analytics
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {industries.filter(i => i.isActive !== false).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Industries</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {industries.filter(i => i.isActive === false).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Industries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IndustriesPage;

