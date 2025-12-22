import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, PageLoader } from '../../components/ui';
import { Ruler, ArrowLeft, Save, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { unitTypesService } from '../../services/unitTypesService';

interface UnitType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UnitTypeFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

const UnitTypesPage: React.FC = () => {
  const navigate = useNavigate();
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UnitTypeFormData>({
    name: '',
    description: '',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    fetchUnitTypes();
  }, []);

  const fetchUnitTypes = async () => {
    try {
      setIsLoading(true);
      const data = await unitTypesService.getAll();
      setUnitTypes(data);
    } catch (error) {
      console.error('Failed to fetch unit types:', error);
      toast.error('Failed to load unit types');
      setUnitTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (unitType: UnitType) => {
    setFormData({
      name: unitType.name,
      description: unitType.description || '',
      isActive: unitType.isActive,
    });
    setEditingId(unitType.id);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: { name?: string } = {};
    const trimmedName = (formData.name || '').trim();
    if (!trimmedName) {
      validationErrors.name = 'Unit type name is required';
    } else if (trimmedName.length > 50) {
      validationErrors.name = 'Unit type name must be at most 50 characters';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const payload = {
        name: trimmedName,
        description: formData.description || undefined,
        isActive: formData.isActive,
      };

      if (editingId) {
        await unitTypesService.update(editingId, payload);
        toast.success('Unit type updated successfully');
      } else {
        await unitTypesService.create(payload);
        toast.success('Unit type added successfully');
      }
      resetForm();
      fetchUnitTypes();
    } catch (error: any) {
      console.error('Failed to save unit type:', error);
      const errorMessage = error?.response?.data?.message?.message ||
                          error?.response?.data?.message ||
                          'Failed to save unit type';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this unit type? This action cannot be undone.')) {
      try {
        await unitTypesService.delete(id);
        toast.success('Unit type deleted successfully');
        fetchUnitTypes();
      } catch (error) {
        console.error('Failed to delete unit type:', error);
        toast.error('Failed to delete unit type');
      }
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await unitTypesService.toggle(id);
      toast.success('Unit type updated successfully');
      fetchUnitTypes();
    } catch (error) {
      console.error('Failed to update unit type:', error);
      toast.error('Failed to update unit type');
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading unit types..." />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="GHOST"
          size="SM"
          onClick={() => navigate('/business-settings')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <Ruler className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Unit Types
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage measurement units for your products
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
                {isEditing ? 'Edit Unit Type' : 'Add New Unit Type'}
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, name: value }));
                      if (!value.trim()) {
                        setErrors(prev => ({ ...prev, name: 'Unit type name is required' }));
                      } else if (value.length > 50) {
                        setErrors(prev => ({ ...prev, name: 'Unit type name must be at most 50 characters' }));
                      } else {
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={`w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.name
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., piece, kg, liter, meter"
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
                    placeholder="Brief description of this unit type"
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

        {/* Unit Types List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Unit Types ({unitTypes.length})
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
              {unitTypes.length === 0 ? (
                <div className="text-center py-8">
                  <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Unit Types Found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first unit type to start measuring your products.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unitTypes.map((unitType) => (
                    <div
                      key={unitType.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {unitType.name}
                          </h4>
                          {unitType.isActive === false && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        {unitType.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {unitType.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="GHOST"
                          size="SM"
                          onClick={() => handleToggleActive(unitType.id, unitType.isActive)}
                          className="p-1"
                          title={unitType.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {unitType.isActive ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>

                        <Button
                          variant="GHOST"
                          size="SM"
                          onClick={() => handleEdit(unitType)}
                          className="p-1"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-blue-500" />
                        </Button>

                        <Button
                          variant="GHOST"
                          size="SM"
                          onClick={() => handleDelete(unitType.id)}
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
      {unitTypes.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Unit Types Analytics
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {unitTypes.filter(c => c.isActive).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Unit Types</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {unitTypes.filter(c => !c.isActive).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Unit Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnitTypesPage;