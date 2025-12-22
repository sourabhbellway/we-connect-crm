import React from 'react';
import { X, Package, DollarSign, Tag, Calendar, Hash, CheckCircle, XCircle } from 'lucide-react';
import { Product } from '../services/productsService';

interface ProductDetailsProps {
    product: Product;
    onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-[#EF444E] to-[#ff5a64] rounded-xl shadow-lg">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {product.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${product.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                >
                                    {product.isActive ? (
                                        <><CheckCircle className="h-3 w-3" /> Active</>
                                    ) : (
                                        <><XCircle className="h-3 w-3" /> Inactive</>
                                    )}
                                </span>
                                {product.sku && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Hash className="h-3 w-3" /> {product.sku}
                                    </span>
                                )}
                            </div>
                        </div>
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
                    {/* Description */}
                    {product.description && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Description
                            </h3>
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>
                    )}

                    {/* Pricing Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                                <DollarSign className="h-5 w-5" />
                                <h3 className="font-semibold">Pricing</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {product.price} {product.currency}
                                    </span>
                                </div>
                                {product.cost && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {product.cost} {product.currency}
                                        </span>
                                    </div>
                                )}
                                {product.taxRate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Tax Rate:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {product.taxRate}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-400">
                                <Tag className="h-5 w-5" />
                                <h3 className="font-semibold">Details</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                                        {product.type}
                                    </span>
                                </div>
                                {product.category && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {product.category}
                                        </span>
                                    </div>
                                )}
                                {product.unit && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Unit:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {product.unit}
                                        </span>
                                    </div>
                                )}
                                {product.hsnCode && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">HSN Code:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {product.hsnCode}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Created: {new Date(product.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Updated: {new Date(product.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
