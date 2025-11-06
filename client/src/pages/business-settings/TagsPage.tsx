import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, PageLoader } from '../../components/ui';
import { Tag, ArrowLeft, Save, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { tagService, Tag as TagType } from '../../services/tagService';

interface TagFormData {
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
}

const TagsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    color: '#6B7280',
    description: '',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const data = await tagService.getTags();
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      toast.error('Failed to load tags');
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#6B7280',
      description: '',
      isActive: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (tag: TagType) => {
    setFormData({
      name: tag.name,
      color: tag.color || '#6B7280',
      description: tag.description || '',
      isActive: tag.isActive !== undefined ? tag.isActive : true,
    });
    setEditingId(tag.id);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.name.trim()) {
      toast.error('Tag name is required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Only send fields that the backend accepts
      const payload = {
        name: formData.name.trim(),
        color: formData.color || '#3B82F6',
        description: formData.description || undefined,
        isActive: formData.isActive,
      };
      
      if (editingId) {
        const result = await tagService.updateTag(editingId, payload);
        if (result) {
          toast.success('Tag updated successfully');
        }
      } else {
        const result = await tagService.createTag(payload);
        if (result) {
          toast.success('Tag added successfully');
        }
      }
      resetForm();
      fetchTags();
    } catch (error: any) {
      console.error('Failed to save tag:', error);
      const errorMessage = error?.response?.data?.message?.message || 
                          error?.response?.data?.message || 
                          'Failed to save tag';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      try {
        await tagService.deleteTag(id);
        toast.success('Tag deleted successfully');
        fetchTags();
      } catch (error) {
        console.error('Failed to delete tag:', error);
        toast.error('Failed to delete tag');
      }
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await tagService.updateTag(id, { isActive: !isActive });
      toast.success('Tag updated successfully');
      fetchTags();
    } catch (error) {
      console.error('Failed to update tag:', error);
      toast.error('Failed to update tag');
    }
  };

  const predefinedColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1',
    '#64748B', '#374151', '#7C2D12', '#B91C1C', '#365314'
  ];

  if (isLoading) {
    return <PageLoader message="Loading tags..." />;
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
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
            <Tag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tags Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure and manage tags for organizing leads and deals
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
                {isEditing ? 'Edit Tag' : 'Add New Tag'}
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tag Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Hot Lead, VIP, Follow-up"
                    required
                  />
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
                    placeholder="Brief description of this tag"
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

        {/* Tags List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tags ({tags.length})
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
              {tags.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Tags Found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first tag to start organizing your leads and deals.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: tag.color || '#6B7280' }}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {tag.name}
                            </h4>
                            {tag.isActive === false && (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          {tag.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {tag.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="GHOST"
                          size="sm"
                          onClick={() => handleToggleActive(tag.id, tag.isActive !== false)}
                          className="p-1"
                          title={tag.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          {tag.isActive !== false ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        
                        <Button
                          variant="GHOST"
                          size="sm"
                          onClick={() => handleEdit(tag)}
                          className="p-1"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-blue-500" />
                        </Button>
                        
                        <Button
                          variant="GHOST"
                          size="sm"
                          onClick={() => handleDelete(tag.id)}
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
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tags Analytics
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {tags.filter(t => t.isActive !== false).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Tags</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {tags.filter(t => t.isActive === false).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Tags</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TagsPage;

