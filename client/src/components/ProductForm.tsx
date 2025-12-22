import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Package, Plus } from 'lucide-react';
import { productsService, Product, CreateProductDto, UpdateProductDto } from '../services/productsService';
import { productCategoriesService, ProductCategory } from '../services/productCategoriesService';
import { unitTypesService, UnitType } from '../services/unitTypesService';
import { API_BASE_URL } from '../config/config';
import { toast } from 'react-toastify';
import { taxesService, Tax } from '../services/taxesService';
import { useBusinessSettings } from '../contexts/BusinessSettingsContext';

interface ProductFormProps {
  onClose: () => void;
  onSave: () => void;
  initialProduct?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSave, initialProduct }) => {
  const navigate = useNavigate();
  const { currencySettings } = useBusinessSettings();
  const [formData, setFormData] = useState<CreateProductDto & UpdateProductDto>({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    sku: initialProduct?.sku || '',
    type: initialProduct?.type || 'PHYSICAL',
    category: initialProduct?.category || '',
    price: initialProduct?.price || 0,
    cost: initialProduct?.cost || 0,
    currency: initialProduct?.currency || currencySettings?.primary || 'INR',
    unit: initialProduct?.unit || 'pcs',
    taxRate: initialProduct?.taxRate || 0,
    hsnCode: initialProduct?.hsnCode || '',


    isActive: initialProduct?.isActive ?? true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [unitTypesLoading, setUnitTypesLoading] = useState(true);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [taxesLoading, setTaxesLoading] = useState(true);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' }));
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'File size must be less than 5MB' }));
        return;
      }
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await productCategoriesService.getProductCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load product categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch unit types on component mount
  useEffect(() => {
    const fetchUnitTypes = async () => {
      try {
        const fetchedUnitTypes = await unitTypesService.getAll();
        setUnitTypes(fetchedUnitTypes);
      } catch (error) {
        console.error('Failed to fetch unit types:', error);
        toast.error('Failed to load unit types');
      } finally {
        setUnitTypesLoading(false);
      }
    };

    fetchUnitTypes();
  }, []);

  // Fetch taxes on component mount
  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        const fetchedTaxes = await taxesService.getAll();
        setTaxes(fetchedTaxes);
      } catch (error) {
        console.error('Failed to fetch taxes:', error);
        toast.error('Failed to load tax rates');
      } finally {
        setTaxesLoading(false);
      }
    };

    fetchTaxes();
  }, []);

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Ensure numeric fields are properly converted and type is valid
      const productData: any = {
        ...formData,
        // Ensure type is a valid ProductType enum value (PHYSICAL, DIGITAL, SERVICE)
        type: formData.type === 'product' ? 'PHYSICAL' : (formData.type || 'PHYSICAL'),
        price: Number(formData.price) || 0,
        cost: formData.cost ? Number(formData.cost) : undefined,
        taxRate: formData.taxRate ? Number(formData.taxRate) : undefined,

      };


      // Remove empty strings and convert to null/undefined
      if (!productData.description || !productData.description.trim()) {
        productData.description = undefined;
      }
      if (!productData.sku || !productData.sku.trim()) {
        productData.sku = undefined;
      }
      if (!productData.category || !productData.category.trim()) {
        productData.category = undefined;
      }
      if (!productData.hsnCode || !productData.hsnCode.trim()) {
        productData.hsnCode = undefined;
      }

      let createdProduct: any = null;

      if (initialProduct) {
        // Update existing product
        createdProduct = await productsService.update(initialProduct.id, productData);
        if (!createdProduct.success) {
          throw new Error(createdProduct.message || 'Failed to update product');
        }
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        createdProduct = await productsService.create(productData);
        if (!createdProduct.success) {
          throw new Error(createdProduct.message || 'Failed to create product');
        }
        toast.success('Product created successfully!');
      }

      // Upload file if selected
      if (selectedFile) {
        try {
          const productId = initialProduct?.id || createdProduct?.data?.product?.id || createdProduct?.id;

          if (productId) {
            const formDataUpload = new FormData();
            formDataUpload.append('file', selectedFile);
            formDataUpload.append('entityType', 'product');
            formDataUpload.append('entityId', productId.toString());
            formDataUpload.append('name', selectedFile.name);

            const uploadResponse = await fetch(`${API_BASE_URL}/files/upload`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`,
              },
              body: formDataUpload,
            });

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload image');
            }

            const uploadResult = await uploadResponse.json();
            if (uploadResult.success && uploadResult.data?.file?.id) {
              const imageUrl = `/api/files/${uploadResult.data.file.id}/download`;

              // Update product with image URL
              await productsService.update(productId, { ...productData, image: imageUrl });
            }
          }
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          toast.error('Product saved but failed to upload image.');
        }
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to save product. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {initialProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Enter SKU"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">{currencySettings?.symbol || '₹'}</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost Price
                </label> */}
                <div className="relative">
                  {/* <span className="absolute left-3 top-2 text-gray-500">{currencySettings?.symbol || '₹'}</span> */}
                  {/* <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  /> */}
                </div>
              </div>





              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit Type
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  disabled={unitTypesLoading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">
                    {unitTypesLoading ? 'Loading unit types...' : 'Select Unit Type'}
                  </option>
                  {unitTypes.filter(unit => unit.isActive).map((unit) => (
                    <option key={unit.id} value={unit.name}>
                      {unit.name.charAt(0).toUpperCase() + unit.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tax & Compliance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Tax & Compliance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax Rate (%)
                </label>
                <select
                  value={formData.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                  disabled={taxesLoading}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 ${errors.taxRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                  <option value="0">No Tax (0%)</option>
                  {!taxesLoading && taxes.filter(t => t.isActive).map((tax) => (
                    <option key={tax.id} value={Number(tax.rate)}>
                      {tax.name} ({tax.rate}%)
                    </option>
                  ))}
                  {taxesLoading && <option disabled>Loading taxes...</option>}
                </select>
                {errors.taxRate && <p className="text-red-500 text-sm mt-1">{errors.taxRate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HSN Code
                </label>
                <input
                  type="text"
                  value={formData.hsnCode}
                  onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                  placeholder="e.g., 8471"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Category & Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Category & Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/business-settings/product-categories')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded transition-colors"
                    title="Manage Product Categories"
                  >
                    <Plus size={12} />
                    Categories
                  </button>
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={categoriesLoading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                  </option>
                  {categories.filter(cat => cat.isActive).map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                  <option value="digital">Digital Product</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-weconnect-red border-gray-300 rounded focus:ring-weconnect-red"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active (product will be available for sale)
              </label>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Product Image
            </h3>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Upload product image
                    </span>
                    <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                {selectedFile && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Selected: {selectedFile.name}
                    </p>
                  </div>
                )}
                {errors.image && <p className="text-red-500 text-sm mt-2">{errors.image}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-weconnect-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : initialProduct ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;