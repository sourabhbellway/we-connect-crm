import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { Card, CardHeader, CardContent, Button, PageLoader } from '../../components/ui';
import { Users, ArrowLeft, Save, Plus, Edit3, Trash2, Move, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { LeadSource } from '../../features/business-settings/types';

interface LeadSourceFormData extends Omit<LeadSource, 'id'> {}

// Predefined color palette for lead sources
const predefinedColors = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1',
  '#64748B', '#374151', '#7C2D12', '#B91C1C', '#365314'
];

// Get a random color from the palette, avoiding any colors in "excludeColors".
// If all colors are excluded, it falls back to the full palette.
const getRandomColor = (excludeColors: string[] = []) => {
  const availableColors = predefinedColors.filter(color => !excludeColors.includes(color));
  const pool = availableColors.length > 0 ? availableColors : predefinedColors;
  return pool[Math.floor(Math.random() * pool.length)];
};

const LeadSourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const { leadSources, addLeadSource, updateLeadSource, deleteLeadSource, reorderLeadSources, isLoading } = useBusinessSettings();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadSourceFormData>(() => ({
    name: '',
    description: '',
    color: getRandomColor(),
    isActive: true,
    sortOrder: 0,
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const resetForm = () => {
    const usedColors = leadSources
      .map(s => s.color)
      .filter((c): c is string => Boolean(c));

    setFormData({
      name: '',
      description: '',
      color: getRandomColor(usedColors),
      isActive: true,
      sortOrder: leadSources.length,
    });
    setIsEditing(false);
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (source: LeadSource) => {
    setFormData({
      name: source.name,
      description: source.description || '',
      color: source.color || getRandomColor(),
      isActive: source.isActive,
      sortOrder: source.sortOrder,
    });
    setEditingId(source.id || null);
    setIsEditing(true);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: { name?: string } = {};
    const trimmedName = (formData.name || '').trim();

    if (!trimmedName) {
      validationErrors.name = 'Lead source name is required';
    } else if (trimmedName.length > 50) {
      validationErrors.name = 'Lead source name must be at most 50 characters';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);
    
    try {
      if (editingId) {
        await updateLeadSource(editingId, { ...formData, name: trimmedName });
        // toast.success('Lead source updated successfully');
      } else {
        await addLeadSource({ ...formData, name: trimmedName });
        // toast.success('Lead source added successfully');
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save lead source:', error);
      // toast.error('Failed to save lead source');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead source? This action cannot be undone.')) {
      try {
        await deleteLeadSource(id);
        toast.success('Lead source deleted successfully');
      } catch (error) {
        console.error('Failed to delete lead source:', error);
      
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateLeadSource(id, { isActive: !isActive });
    } catch (error) {
      console.error('Failed to update lead source:', error);
     
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading lead sources..." />;
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
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lead Sources Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure and manage lead source options for your CRM
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
                {isEditing ? 'Edit Lead Source' : 'Add New Lead Source'}
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, name: value }));

                      const trimmed = value.trim();
                      if (!trimmed) {
                        setErrors(prev => ({ ...prev, name: 'Lead source name is required' }));
                      } else if (trimmed.length > 50) {
                        setErrors(prev => ({ ...prev, name: 'Lead source name must be at most 50 characters' }));
                      } else {
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={`w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.name
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Website, Referral, Social Media"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of this lead source"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded border-2 ${formData.color === color ? 'border-gray-800 dark:border-white' : 'border-gray-300 dark:border-gray-600'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
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

        {/* Lead Sources List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lead Sources ({leadSources.length})
                </h3>
                <Button
                  variant="PRIMARY"
                  size="SM"
                  onClick={resetForm}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {leadSources.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Lead Sources Found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first lead source to start tracking where your leads come from.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leadSources
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((source, index) => (
                      <div
                        key={source.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: source.color }}
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              #{index + 1}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {source.name}
                              </h4>
                              {!source.isActive && (
                                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {source.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {source.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                        
                          
                          <Button
                            variant="GHOST"
                            size="sm"
                            onClick={() => handleEdit(source)}
                            className="p-1"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4 text-blue-500" />
                          </Button>
                          
                          <Button
                            variant="GHOST"
                            size="sm"
                            onClick={() => handleDelete(source.id!)}
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
      {leadSources.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lead Source Analytics
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {leadSources.filter(s => s.isActive).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Sources</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {leadSources.filter(s => !s.isActive).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadSourcesPage;