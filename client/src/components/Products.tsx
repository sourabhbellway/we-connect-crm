import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { productsService, Product } from "../services/productsService";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  Search,
  LayoutList,
  LayoutGrid,
  DollarSign,
  Tag,
  Hash,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import ProductDetails from "./ProductDetails";
import ConfirmModal from "./ConfirmModal";
import SearchInput from "./SearchInput";
import DropdownFilter from "./DropdownFilter";
import { toast } from "react-toastify";
import { useDebouncedSearch } from "../hooks/useDebounce";
import NoResults from "./NoResults";
import TableLoader from "./TableLoader";
import Pagination from "./Pagination";
import MetaBar from "./list/MetaBar";
import ProductForm from "./ProductForm";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Products: React.FC = () => {
  const { hasPermission } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'product',
    'sku',
    'category',
    'price',
    'status',
  ]);

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    type: "",
    search: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // Debounced search with 500ms delay for better UX
  const { searchValue, debouncedSearchValue, setSearch, isSearching } =
    useDebouncedSearch("", 500);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearchValue, filters.status, filters.category, filters.type, currentPage]);

  // Load column visibility preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem('products_visible_columns');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((c) => typeof c === 'string')) {
          setVisibleColumns(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('products_visible_columns', JSON.stringify(visibleColumns));
    } catch {
      // ignore
    }
  }, [visibleColumns]);

  // Keyboard shortcuts (do not override Ctrl/Cmd+K to allow browser omnibox)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear filters
      if (e.key === "Escape") {
        if (debouncedSearchValue || filters.status || filters.category || filters.type) {
          clearFilters();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filters, debouncedSearchValue]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const api = await productsService.list({
        search: debouncedSearchValue,
        page: currentPage,
        limit: pageSize,
      });

      // Supported API shapes:
      // 1) { success, data: { products: Product[], pagination: {...} } }
      // 2) { success, data: Product[] }
      // 3) { products: Product[], pagination? }
      const list: Product[] = (api?.data?.items as Product[])
        ?? (api?.data?.products as Product[])
        ?? (Array.isArray(api?.data) ? (api.data as Product[]) : undefined)
        ?? (api?.products as Product[])
        ?? ([] as Product[]);

      setProducts(list || []);

      // Prefer server pagination when provided
      const apiPagination = api?.data?.pagination || api?.pagination;
      if (apiPagination) {
        setPagination({
          currentPage: apiPagination.currentPage ?? currentPage,
          totalPages: apiPagination.totalPages ?? 1,
          totalProducts: apiPagination.totalItems ?? list.length ?? 0,
          hasNextPage: (apiPagination.currentPage ?? 1) < (apiPagination.totalPages ?? 1),
          hasPrevPage: (apiPagination.currentPage ?? 1) > 1,
        });
      } else {
        // Fallback: single-page
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalProducts: list.length,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      const errorMessage = error?.response?.data?.message || "Failed to fetch products";
      setError(errorMessage);
      toast.error(errorMessage, { toastId: "products_fetch_error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setShowProductForm(true);
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
  };

  const handleAddProduct = () => {
    setProductToEdit(undefined);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      await productsService.update(product.id, { isActive: !product.isActive });
      toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchProducts();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update product status';
      toast.error(msg);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);

    try {
      await productsService.remove(productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      let errorMessage = "An error occurred";

      if (error.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      category: "",
      type: "",
    });
    setCurrentPage(1);
    setSearch("");
  };

  const isSearchActive = !!debouncedSearchValue;
  const isStatusActive = !!filters.status;
  const isCategoryActive = !!filters.category;
  const isTypeActive = !!filters.type;
  const hasActiveFilters = isSearchActive || isStatusActive || isCategoryActive || isTypeActive;

  const isColumnVisible = (id: string) => visibleColumns.includes(id);
  const noResultsDescription = isSearchActive && (isStatusActive || isCategoryActive || isTypeActive)
    ? "No products match your search and filters. Try adjusting your filters or search terms. You can also clear all filters to see all products."
    : isSearchActive
      ? "No products found for your search. Try adjusting your search terms. You can also clear all filters to see all products."
      : (isStatusActive || isCategoryActive || isTypeActive)
        ? "No products found for the selected filters. Try adjusting your filters or clear all filters to see all products."
        : undefined;

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Filters - Stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center gap-2">{t("common.search")}
                  {isSearching && (
                    <div className="flex items-center gap-1 text-xs text-blue-500">
                      <Search className="h-3 w-3 animate-pulse" />
                      <span>Searching...</span>
                    </div>
                  )}
                </div>
              </label>
              <SearchInput
                value={searchValue}
                onChange={handleSearch}
                placeholder="Search products..."
              />
            </div>

            {/* Status */}
            <div className="w-full sm:w-48">
              <DropdownFilter
                label="Status"
                value={filters.status}
                onChange={(value) =>
                  handleFilterChange("status", value as string)
                }
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>

            {/* Category */}
            <div className="w-full sm:w-48">
              <DropdownFilter
                label="Category"
                value={filters.category}
                onChange={(value) =>
                  handleFilterChange("category", value as string)
                }
                options={[
                  { value: "", label: "All Categories" },
                  // Add more categories as needed
                ]}
              />
            </div>
          </div>

          {/* Add Product button - Full width on mobile, auto on desktop */}
          {hasPermission("product.create") && (
            <button
              onClick={handleAddProduct}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-[#ef444e] text-white rounded-full hover:bg-[#f26971] transition-colors text-sm font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          )}
        </div>

        {/* View toggle - Right aligned */}
        <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ml-auto">
          <button
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            onClick={() => setViewMode('card')}
            title="Card view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Products {pagination && `(${pagination.totalProducts})`}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your products and services
                {pagination && (
                  <span className="ml-2 text-gray-500">
                    • Showing {products.length} of {pagination.totalProducts} products
                    {pagination.totalPages > 1 &&
                      ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
                  </span>
                )}
                {(debouncedSearchValue || filters.status || filters.category || filters.type) && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    • Filters active
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2"></div>
          </div>
        </div>

        <div className="mb-4">
          <MetaBar
            currentPage={pagination?.currentPage || 1}
            itemsPerPage={pageSize}
            totalItems={pagination?.totalProducts || products.length}
            onItemsPerPageChange={(n) => {
              // This would need to be implemented if we want to change page size
            }}
            columnConfig={{
              columns: [
                { id: 'product', label: 'Product' },
                { id: 'sku', label: 'SKU' },
                { id: 'category', label: 'Category' },
                { id: 'price', label: 'Price' },

                { id: 'status', label: 'Status' },
              ],
              visibleColumns,
              onChange: setVisibleColumns,
              minVisible: 1,
            }}
          />
        </div>

        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {isLoading ? (
              <div className="col-span-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-20">
                <NoResults
                  title="Network or server error"
                  description={error}
                  icon={<Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                  isError
                />
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <NoResults
                  icon={<Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                  description={noResultsDescription}
                  showClearButton={hasActiveFilters}
                  onClear={clearFilters}
                />
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  style={{ minHeight: '280px' }}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#EF444E] to-[#ff5a64] rounded-lg shadow-2xl">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {product.sku || 'No SKU'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${product.isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                        }`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">{product.price} {product.currency}</span>
                        </div>
                      </div>
                      {product.category && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                          <Tag className="h-3 w-3 flex-shrink-0" />
                          <span>Category: {product.category}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {hasPermission("product.update") && (
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {hasPermission("product.update") && (
                          <button
                            onClick={() => toggleProductStatus(product)}
                            className={`p-1.5 rounded transition-colors ${product.isActive
                              ? "text-green-600 hover:text-green-900 hover:bg-green-50 dark:hover:bg-green-900/20"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                            title={product.isActive ? "Deactivate product" : "Activate product"}
                          >
                            {product.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          </button>
                        )}
                        {hasPermission("product.delete") && (
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pagination for Card View */}
            {products.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination?.currentPage || 1}
                  totalPages={pagination?.totalPages || 1}
                  totalItems={pagination?.totalProducts || products.length}
                  onPageChange={handlePageChange}
                  itemsPerPage={pageSize}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto relative">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('product') ? 'hidden' : ''}`}>
                    Product
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('sku') ? 'hidden' : ''}`}>
                    SKU
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('category') ? 'hidden' : ''}`}>
                    Category
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('price') ? 'hidden' : ''}`}>
                    Price
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              {isLoading ? (
                <TableLoader rows={8} columns={7} />
              ) : (
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {error ? (
                    <tr>
                      <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                        <NoResults
                          title="Network or server error"
                          description={error}
                          icon={<Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                          isError
                        />
                      </td>
                    </tr>
                  ) : products.length > 0 ? (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('product') ? 'hidden' : ''}`}>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('sku') ? 'hidden' : ''}`}>
                          {product.sku || '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('category') ? 'hidden' : ''}`}>
                          {product.category || '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!isColumnVisible('price') ? 'hidden' : ''}`}>
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {product.price} {product.currency}
                          </div>
                        </td>

                        <td className={`px-6 py-4 whitespace-nowrap ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.isActive
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                              }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="text-gray-500 hover:text-blue-600 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {hasPermission("product.update") && (
                              <>
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                  title="Edit product"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => toggleProductStatus(product)}
                                  className={[
                                    "p-1 rounded transition-colors",
                                    product.isActive
                                      ? "text-green-600 hover:text-green-900 hover:bg-green-50 dark:hover:bg-green-900/20"
                                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800",
                                  ].join(" ")}
                                  title={product.isActive ? "Deactivate product" : "Activate product"}
                                >
                                  {product.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                                </button>
                              </>
                            )}
                            {hasPermission("product.delete") && (
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                        <NoResults
                          icon={<Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                          description={noResultsDescription}
                          showClearButton={hasActiveFilters}
                          onClear={clearFilters}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalProducts}
            onPageChange={handlePageChange}
            itemsPerPage={50}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal && !!productToDelete}
        title="Delete Product"
        description={
          productToDelete ? (
            <div className="mb-2">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {productToDelete.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {productToDelete.sku || 'No SKU'}
                  </div>
                </div>
              </div>
              <p>
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>
          ) : null
        }
        confirmText="Delete Product"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDeleteProduct}
        onClose={() => {
          if (isDeleting) return;
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
      />

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          onClose={() => {
            setShowProductForm(false);
            setProductToEdit(undefined);
          }}
          onSave={() => {
            setShowProductForm(false);
            setProductToEdit(undefined);
            fetchProducts(); // Refresh the list
          }}
          initialProduct={productToEdit}
        />
      )}

      {viewingProduct && (
        <ProductDetails
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </div>
  );
};

export default Products;