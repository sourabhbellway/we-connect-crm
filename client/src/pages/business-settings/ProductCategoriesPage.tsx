import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, PageLoader } from '../../components/ui';
import { Package, ArrowLeft, Save, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { productCategoriesService } from '../../services/productCategoriesService';

interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

const ProductCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await productCategoriesService.getProductCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load product categories');
      setCategories([]);
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

  const handleEdit = (category: ProductCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
    setEditingId(category.id);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: { name?: string } = {};
    const trimmedName = (formData.name || '').trim();
    if (!trimmedName) {
      validationErrors.name = 'Category name is required';
    } else if (trimmedName.length > 100) {
      validationErrors.name = 'Category name must be at most 100 characters';
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
        await productCategoriesService.updateProductCategory(editingId, payload);
        toast.success('Category updated successfully');
      } else {
        await productCategoriesService.createProductCategory(payload);
        toast.success('Category added successfully');
      }
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      const errorMessage = error?.response?.data?.message?.message ||
                          error?.response?.data?.message ||
                          'Failed to save category';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await productCategoriesService.deleteProductCategory(id);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await productCategoriesService.toggleProductCategory(id);
      toast.success('Category updated successfully');
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading product categories..." />;
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
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Product Categories
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage categories for organizing your products
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
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, name: value }));
                      if (!value.trim()) {
                        setErrors(prev => ({ ...prev, name: 'Category name is required' }));
                      } else if (value.length > 100) {
                        setErrors(prev => ({ ...prev, name: 'Category name must be at most 100 characters' }));
                      } else {
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={`w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.name
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Electronics, Clothing, Home & Garden"
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
                    placeholder="Brief description of this category"
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

        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Categories ({categories.length})
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
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Categories Found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first product category to start organizing your products.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </h4>
                          {category.isActive === false && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="GHOST"
                          size="SM"
                          onClick={() => handleToggleActive(category.id, category.isActive)}
                          className="p-1"
                          title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {category.isActive ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>

                        <Button
                          variant="GHOST"
                          size="SM"
                          onClick={() => handleEdit(category)}
                          className="p-1"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-blue-500" />
                        </Button>

                        <Button
                          variant="GHOST"
                          size="SM"
                          onClick={() => handleDelete(category.id)}
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
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Categories Analytics
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {categories.filter(c => c.isActive).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Categories</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {categories.filter(c => !c.isActive).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductCategoriesPage;