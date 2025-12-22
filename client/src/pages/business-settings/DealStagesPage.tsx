import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { Card, CardHeader, CardContent, Button, PageLoader } from '../../components/ui';
import { Workflow, ArrowLeft, Plus, Edit3, Trash2, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import { DealStatus } from '../../features/business-settings/types';

const DealStagesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    dealStatuses, addDealStatus, updateDealStatus, deleteDealStatus, isLoading
  } = useBusinessSettings();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    sortOrder: 0,
    isActive: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
      sortOrder: dealStatuses.length,
      isActive: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (status: DealStatus) => {
    setFormData({
      name: status.name,
      color: status.color || '#3B82F6',
      sortOrder: status.sortOrder,
      isActive: status.isActive,
    });
    setEditingId(status.id || null);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    if (!name) {
      toast.error('Status name is required');
      return;
    }
    setIsSaving(true);

    try {
      if (editingId) {
        await updateDealStatus(editingId, formData);
        toast.success('Deal status updated successfully');
      } else {
        await addDealStatus(formData);
        toast.success('Deal status added successfully');
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save deal status:', error);
      toast.error('Failed to save deal status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this status? This may affect deals using it.')) {
      try {
        await deleteDealStatus(id);
        toast.success('Deal status deleted successfully');
      } catch (error) {
        console.error('Failed to delete deal status:', error);
        toast.error('Failed to delete deal status');
      }
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading deal statuses..." />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
              <Workflow className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Deal Status Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure dynamic stages and statuses for deals
              </p>
            </div>
          </div>
        </div>
        {!isEditing && (
          <Button
            variant="PRIMARY"
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Status
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Available Statuses
              </h3>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {dealStatuses.length} Total
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {dealStatuses.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No statuses defined yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dealStatuses.sort((a, b) => a.sortOrder - b.sortOrder).map((status) => (
                    <div
                      key={status.id}
                      className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-all bg-white dark:bg-gray-800 group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: status.color || '#3B82F6' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{status.name}</span>
                            {!status.isActive && (
                              <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full font-bold">INACTIVE</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Order: {status.sortOrder}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="GHOST"
                          size="SM"
                          onClick={() => handleEdit(status)}
                          className="p-1.5 h-8 w-8 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="GHOST"
                          size="SM"
                          onClick={() => handleDelete(status.id!)}
                          className="p-1.5 h-8 w-8 hover:bg-red-50 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div>
          {isEditing ? (
            <Card className="sticky top-6 border-2 border-orange-100 dark:border-orange-900/30">
              <CardHeader className="border-b pb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Status' : 'New Status'}
                </h3>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Status Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="e.g., Contacted, Qualified, Won"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          className="w-10 h-10 p-0.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-500 uppercase">{formData.color}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Sort Order</label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Status is Active
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" variant="PRIMARY" className="flex-1" disabled={isSaving}>
                      {isSaving ? 'Saving...' : (editingId ? 'Update Status' : 'Add Status')}
                    </Button>
                    <Button type="button" variant="GHOST" onClick={resetForm} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-orange-50/50 dark:bg-orange-900/10 border-dashed border-2 border-orange-200 dark:border-orange-800">
              <CardContent className="p-8 text-center">
                <Tag className="w-12 h-12 text-orange-200 dark:text-orange-800 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Management</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                  Select a status to edit or click "Add Status" to create a new one. These statuses are used for deals.
                </p>
                <Button
                  variant="OUTLINE"
                  size="SM"
                  onClick={() => { resetForm(); setIsEditing(true); }}
                  className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Status
                </Button>
              </CardContent>
            </Card>
          )
          }
        </div>
      </div>
    </div>
  );
};

export default DealStagesPage;