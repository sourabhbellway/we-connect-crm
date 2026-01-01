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
    Upload,
    FileSpreadsheet,
    FileDown,
    X,
    CheckSquare,
    Square,
    Check
} from "lucide-react";
import ProductDetails from "./ProductDetails";
import ConfirmModal from "./ConfirmModal";
import SearchInput from "./SearchInput";
import DropdownFilter from "./DropdownFilter";
import { toast } from "react-toastify";
import { exportToCsv } from "../utils/exportUtils";
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

    // Debounced search
    const { searchValue, debouncedSearchValue, setSearch, isSearching } =
        useDebouncedSearch("", 500);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [debouncedSearchValue, filters.status, filters.category, filters.type, currentPage]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const api = await productsService.list({
                search: debouncedSearchValue,
                page: currentPage,
                limit: pageSize,
            });

            const list: Product[] = (api?.data?.items as Product[])
                ?? (api?.data?.products as Product[])
                ?? (Array.isArray(api?.data) ? (api.data as Product[]) : undefined)
                ?? (api?.products as Product[])
                ?? ([] as Product[]);

            setProducts(list || []);

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
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
            toast.error(error?.response?.data?.message || 'Failed - status update');
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
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    const clearFilters = () => {
        setFilters({ search: "", status: "", category: "", type: "" });
        setCurrentPage(1);
        setSearch("");
    };

    const handleDownloadTemplate = () => {
        const headers = ['name', 'sku', 'type', 'category', 'price', 'cost', 'currency', 'unit', 'taxRate', 'stockQuantity', 'minStockLevel', 'isActive'];
        const sampleData = [['Sample Product', 'SKU001', 'PHYSICAL', 'Electronics', '100', '70', 'USD', 'pcs', '10', '50', '10', 'YES']];
        exportToCsv('products_import_template.csv', headers, sampleData);
    };

    const handleExportProducts = async () => {
        try {
            setIsExporting(true);
            const response = await productsService.bulkExport({
                search: debouncedSearchValue || undefined,
            });
            const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Products exported successfully');
        } catch (error) {
            toast.error('Failed to export products');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.csv')) {
                toast.error('Please upload a CSV file');
                return;
            }
            setImportFile(file);
        }
    };

    const handleBulkImport = async () => {
        if (!importFile) return;
        try {
            setIsImporting(true);
            const res = await productsService.bulkImport(importFile);
            if (res.success) {
                toast.success(res.message || 'Imported products successfully');
                setShowImportModal(false);
                setImportFile(null);
                fetchProducts();
            } else {
                toast.error(res.message || 'Failed to import products');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to import products');
        } finally {
            setIsImporting(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure? ${selectedIds.length} items.`)) return;
        try {
            setIsLoading(true);
            await productsService.bulkDelete(selectedIds);
            toast.success('Deleted successfully');
            setSelectedIds([]);
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length && products.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const isSearchActive = !!debouncedSearchValue;
    const isStatusActive = !!filters.status;
    const isCategoryActive = !!filters.category;
    const hasActiveFilters = isSearchActive || isStatusActive || isCategoryActive;

    const isColumnVisible = (id: string) => visibleColumns.includes(id);

    return (
        <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="w-full sm:w-48">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <div className="flex items-center gap-2">{t("common.search")}
                                    {isSearching && <Search className="h-3 w-3 animate-pulse text-blue-500" />}
                                </div>
                            </label>
                            <SearchInput value={searchValue} onChange={handleSearch} placeholder="Search products..." />
                        </div>

                        <div className="w-full sm:w-48">
                            <DropdownFilter
                                label="Status"
                                value={filters.status}
                                onChange={(val) => handleFilterChange("status", val as string)}
                                options={[
                                    { value: "", label: "All Statuses" },
                                    { value: "active", label: "Active" },
                                    { value: "inactive", label: "Inactive" },
                                ]}
                            />
                        </div>

                        <div className="w-full sm:w-48">
                            <DropdownFilter
                                label="Category"
                                value={filters.category}
                                onChange={(val) => handleFilterChange("category", val as string)}
                                options={[{ value: "", label: "All Categories" }]}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <button
                            onClick={handleExportProducts}
                            disabled={isExporting}
                            className="px-4 py-3 bg-white dark:bg-gray-800 border rounded-full text-sm font-semibold disabled:opacity-50 flex items-center"
                        >
                            <FileDown className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export'}
                        </button>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-3 bg-white dark:bg-gray-800 border rounded-full text-sm font-semibold flex items-center"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </button>
                        {hasPermission("product.create") && (
                            <button
                                onClick={handleAddProduct}
                                className="px-4 py-3 bg-[#ef444e] text-white rounded-full text-sm font-semibold flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </button>
                        )}
                    </div>
                </div>

                <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ml-auto w-fit">
                    <button
                        className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                        className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                        onClick={() => setViewMode('card')}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        All Products {pagination && `(${pagination.totalProducts})`}
                    </h3>
                </div>

                <MetaBar
                    currentPage={pagination?.currentPage || 1}
                    itemsPerPage={pageSize}
                    totalItems={pagination?.totalProducts || products.length}
                    onItemsPerPageChange={() => { }}
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

                {selectedIds.length > 0 && (
                    <div className="m-4 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 rounded-lg p-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedIds.length} selected</span>
                        <div className="flex gap-2">
                            <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs flex items-center">
                                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                            </button>
                            <button onClick={() => setSelectedIds([])} className="text-xs text-gray-500 dark:text-gray-400">Cancel</button>
                        </div>
                    </div>
                )}

                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                        {isLoading ? (
                            <div className="col-span-full py-20 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto rounded-full"></div></div>
                        ) : error ? (
                            <NoResults title="Error" description={error} isError />
                        ) : products.length === 0 ? (
                            <NoResults description="No products found" showClearButton={hasActiveFilters} onClear={clearFilters} />
                        ) : (
                            products.map((product) => (
                                <div key={product.id} className={`p-4 rounded-lg border relative group ${selectedIds.includes(product.id) ? 'ring-2 ring-indigo-500' : ''}`}>
                                    <button onClick={() => toggleSelection(product.id)} className="absolute top-2 left-2 z-10 p-1 bg-white border rounded shadow-sm">
                                        {selectedIds.includes(product.id) ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-gray-300" />}
                                    </button>
                                    <div className="flex items-center gap-3 mb-3 mt-4">
                                        <div className="p-2 bg-red-500 rounded-lg"><Package className="h-5 w-5 text-white" /></div>
                                        <div>
                                            {/* --- FIXED: Dark Mode Text --- */}
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{product.name}</h4>
                                            <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                                        </div>
                                    </div>
                                    {/* --- FIXED: Dark Mode Text --- */}
                                    <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">{product.price} {product.currency}</div>
                                    <div className="flex justify-between items-center border-t pt-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => handleViewProduct(product)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"><Eye className="h-4 w-4" /></button>
                                            <button onClick={() => handleEditProduct(product)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600"><Edit className="h-4 w-4" /></button>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => toggleProductStatus(product)} className="p-1">{product.isActive ? <ToggleRight className="text-green-600 h-5 w-5" /> : <ToggleLeft className="text-gray-400 h-5 w-5" />}</button>
                                            <button onClick={() => handleDeleteProduct(product)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900 text-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-start">
                                        <button onClick={toggleSelectAll}>
                                            {selectedIds.length === products.length && products.length > 0 ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                                        </button>
                                    </th>
                                    <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider ${!isColumnVisible('product') ? 'hidden' : ''} dark:text-white`}>Product</th>
                                    <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider ${!isColumnVisible('sku') ? 'hidden' : ''} dark:text-white`}>SKU</th>
                                    <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider ${!isColumnVisible('category') ? 'hidden' : ''} dark:text-white`}>Category</th>
                                    <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider ${!isColumnVisible('price') ? 'hidden' : ''} dark:text-white`}>Price</th>
                                    <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider ${!isColumnVisible('status') ? 'hidden' : ''} dark:text-white`}>Status</th>
                                    <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <TableLoader rows={8} columns={7} />
                                ) : products.length === 0 ? (
                                    <tr><td colSpan={7} className="py-20"><NoResults description="No results" onClear={clearFilters} showClearButton={hasActiveFilters} /></td></tr>
                                ) : (
                                    products.map(p => (
                                        <tr key={p.id} className={selectedIds.includes(p.id) ? 'bg-indigo-50/30' : ''}>
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggleSelection(p.id)}>
                                                    {selectedIds.includes(p.id) ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                                                </button>
                                            </td>
                                            <td className={`px-6 py-4 ${!isColumnVisible('product') ? 'hidden' : ''}`}>
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center mr-3"><Package className="h-5 w-5 text-white" /></div>
                                                    {/* --- FIXED: Dark Mode Text --- */}
                                                    <div><div className="font-medium text-gray-900 dark:text-white">{p.name}</div><div className="text-xs text-gray-500 dark:text-gray-300 truncate w-40">{p.description}</div></div>
                                                </div>
                                            </td>
                                            {/* --- FIXED: Dark Mode Text --- */}
                                            <td className={`px-6 py-4 text-sm ${!isColumnVisible('sku') ? 'hidden' : ''} dark:text-white`}>{p.sku || '-'}</td>
                                            {/* --- FIXED: Dark Mode Text --- */}
                                            <td className={`px-6 py-4 text-sm ${!isColumnVisible('category') ? 'hidden' : ''} dark:text-white`}>{p.category || '-'}</td>
                                            {/* --- FIXED: Dark Mode Text --- */}
                                            <td className={`px-6 py-4 text-sm ${!isColumnVisible('price') ? 'hidden' : ''} dark:text-white`}>{p.price} {p.currency}</td>
                                            <td className={`px-6 py-4 ${!isColumnVisible('status') ? 'hidden' : ''}`}>
                                                <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-end">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleViewProduct(p)} className="text-gray-400 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                                                    {hasPermission("product.update") && (
                                                        <>
                                                            <button onClick={() => handleEditProduct(p)} className="text-blue-600"><Edit className="h-4 w-4" /></button>
                                                            <button onClick={() => toggleProductStatus(p)}>{p.isActive ? <ToggleRight className="text-green-600 h-5 w-5" /> : <ToggleLeft className="text-gray-400 h-5 w-5" />}</button>
                                                        </>
                                                    )}
                                                    {hasPermission("product.delete") && <button onClick={() => handleDeleteProduct(p)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

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

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg overflow-hidden shadow-xl border">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white"><Upload className="w-5 h-5" /> Import Products</h3>
                            <button onClick={() => { setShowImportModal(false); setImportFile(null); }}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">Upload CSV. Must have 'name' and 'price'.</p>
                            <button onClick={handleDownloadTemplate} className="text-sm text-blue-600 flex items-center gap-1 mb-4"><FileSpreadsheet className="w-4 h-4" /> Template</button>
                            <div className="border-2 border-dashed rounded-xl p-8 text-center">
                                {importFile ? (
                                    <div>
                                        <FileSpreadsheet className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium">{importFile.name}</p>
                                        <button onClick={() => setImportFile(null)} className="text-xs text-red-500 mt-2">Remove</button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer">
                                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <span className="text-blue-600 font-medium">Click to upload</span>
                                        <input type="file" className="hidden" accept=".csv" onChange={handleImportFile} />
                                    </label>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => { setShowImportModal(false); setImportFile(null); }} className="px-4 py-2 border rounded-lg text-gray-900 dark:text-white">Cancel</button>
                                <button onClick={handleBulkImport} disabled={!importFile || isImporting} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2">
                                    {isImporting ? 'Importing...' : 'Start Import'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={showDeleteModal && !!productToDelete}
                title="Delete Product"
                description={`Are you sure you want to delete ${productToDelete?.name}?`}
                confirmText="Delete"
                loading={isDeleting}
                onConfirm={confirmDeleteProduct}
                onClose={() => { setShowDeleteModal(false); setProductToDelete(null); }}
            />

            {showProductForm && (
                <ProductForm
                    onClose={() => { setShowProductForm(false); setProductToEdit(undefined); }}
                    onSave={() => { setShowProductForm(false); fetchProducts(); }}
                    initialProduct={productToEdit}
                />
            )}

            {viewingProduct && (
                <ProductDetails product={viewingProduct} onClose={() => setViewingProduct(null)} />
            )}
        </div>
    );
};

export default Products;
