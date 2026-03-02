import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Edit2, Save, X, ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

interface FieldConfig {
  id: number;
  entityType: string;
  fieldName: string;
  label: string;
  isRequired: boolean;
  isVisible: boolean;
  displayOrder: number;
  section: string;
  placeholder?: string;
  helpText?: string;
  validation?: any;
  options?: any;
}

interface LeadSection {
  id: number;
  key: string;
  label: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

const LeadFieldsSettings: React.FC = () => {
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [sections, setSections] = useState<LeadSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<FieldConfig>>({});
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState<Partial<LeadSection>>({
    key: '',
    label: '',
    icon: 'MessageSquare',
    color: 'blue'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchFields(), fetchSections()]);
    setLoading(false);
  };

  const fetchSections = async () => {
    try {
      const response = await apiClient.get('/business-settings/lead-sections');
      if (response.data?.success) {
        setSections(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchFields = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/business-settings/field-configs/lead');
      if (response.data?.success) {
        setFields(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
      toast.error('Failed to load field settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: FieldConfig) => {
    setEditingId(field.id);
    setEditForm(field);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      await apiClient.put(`/business-settings/field-configs/${editingId}`, editForm);
      toast.success('Field updated successfully');
      setEditingId(null);
      setEditForm({});
      fetchFields();
      try { window.dispatchEvent(new CustomEvent('fieldConfigsUpdated')); } catch { }
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error('Failed to update field');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleToggleVisibility = async (field: FieldConfig) => {
    try {
      await apiClient.put(`/business-settings/field-configs/${field.id}`, {
        isVisible: !field.isVisible,
      });
      setFields(fields.map(f =>
        f.id === field.id ? { ...f, isVisible: !f.isVisible } : f
      ));
      toast.success(`Field ${!field.isVisible ? 'shown' : 'hidden'}`);
      try { window.dispatchEvent(new CustomEvent('fieldConfigsUpdated')); } catch { }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Failed to update field visibility');
    }
  };

  const handleReorder = async (field: FieldConfig, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === field.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];

    try {
      const updates = newFields.map((f, index) => ({
        id: f.id,
        displayOrder: index
      }));

      await Promise.all(
        updates.map(update =>
          apiClient.put(`/business-settings/field-configs/${update.id}`, {
            displayOrder: update.displayOrder
          })
        )
      );

      setFields(newFields);
      toast.success('Field order updated');
      try { window.dispatchEvent(new CustomEvent('fieldConfigsUpdated')); } catch { }
    } catch (error) {
      console.error('Error reordering fields:', error);
      toast.error('Failed to reorder fields');
    }
  };

  const handleToggleRequired = async (field: FieldConfig) => {
    try {
      await apiClient.put(`/business-settings/field-configs/${field.id}`, {
        isRequired: !field.isRequired,
      });
      setFields(fields.map(f =>
        f.id === field.id ? { ...f, isRequired: !f.isRequired } : f
      ));
      toast.success(`Field ${!field.isRequired ? 'marked as required' : 'marked as optional'}`);
    } catch (error) {
      console.error('Error updating required status:', error);
      toast.error('Failed to update field');
    }
    // Notify other components to refresh their field configs
    try { window.dispatchEvent(new CustomEvent('fieldConfigsUpdated')); } catch { }
  };

  // Add new field
  const [newField, setNewField] = useState<Partial<FieldConfig>>({
    entityType: 'lead',
    fieldName: '',
    label: '',
    isRequired: false,
    isVisible: true,
    displayOrder: fields.length,
    section: 'personal',
    validation: { type: 'text' },
  });

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select/Dropdown' },
    { value: 'multiselect', label: 'Multi-Select' },
    { value: 'date', label: 'Date' },
    { value: 'datetime', label: 'Date & Time' },
    { value: 'checkbox', label: 'Checkbox' },
  ];

  const handleAddField = async () => {
    if (!newField.fieldName || !newField.label) {
      toast.error('Field key and label are required');
      return;
    }
    try {
      setLoading(true);
      const fieldData = {
        ...newField,
        displayOrder: fields.length,
        validation: newField.validation || { type: 'text' },
      };
      await apiClient.post('/business-settings/field-configs', fieldData);
      toast.success('Field added');
      setNewField({
        entityType: 'lead',
        fieldName: '',
        label: '',
        isRequired: false,
        isVisible: true,
        displayOrder: fields.length,
        section: 'personal',
        validation: { type: 'text' },
      });
      await fetchFields();
      try { window.dispatchEvent(new CustomEvent('fieldConfigsUpdated')); } catch { }
    } catch (error) {
      console.error('Error adding field:', error);
      toast.error('Failed to add field');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteField = async (id: number) => {
    if (!confirm('Delete this field? This cannot be undone.')) return;
    try {
      await apiClient.delete(`/business-settings/field-configs/${id}`);
      toast.success('Field deleted');
      await fetchFields();
      try { window.dispatchEvent(new CustomEvent('fieldConfigsUpdated')); } catch { }
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Failed to delete field');
    }
  };

  const handleSaveSection = async () => {
    if (!sectionForm.key || !sectionForm.label) {
      toast.error('Key and Label are required');
      return;
    }
    try {
      if (editingSectionId) {
        await apiClient.put(`/business-settings/lead-sections/${editingSectionId}`, sectionForm);
        toast.success('Section updated');
      } else {
        await apiClient.post('/business-settings/lead-sections', sectionForm);
        toast.success('Section created');
      }
      setEditingSectionId(null);
      setSectionForm({ key: '', label: '', icon: 'MessageSquare', color: 'blue' });
      await fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm('Delete this section? This will not delete fields in it, but they will become unassigned.')) return;
    try {
      await apiClient.delete(`/business-settings/lead-sections/${id}`);
      toast.success('Section deleted');
      await fetchSections();
    } catch (error: any) {
      console.error('Error deleting section:', error);
      toast.error(error.response?.data?.message || 'Failed to delete section');
    }
  };

  const getSectionColor = (sectionKey: string) => {
    const section = sections.find(s => s.key === sectionKey);
    return section?.color || 'gray';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Lead Form Fields</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Show, hide, reorder, and configure lead form fields</p>
        </div>
        <button
          onClick={() => setShowSectionManager(!showSectionManager)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          {showSectionManager ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showSectionManager ? 'Close Section Manager' : 'Manage Sections'}
        </button>
      </div>

      {showSectionManager && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/10">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Manage Lead Form Sections</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Key (Internal)</label>
              <input
                type="text"
                placeholder="e.g. basic_info"
                value={sectionForm.key}
                onChange={(e) => setSectionForm({ ...sectionForm, key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Label (Display)</label>
              <input
                type="text"
                placeholder="e.g. Basic Information"
                value={sectionForm.label}
                onChange={(e) => setSectionForm({ ...sectionForm, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Color</label>
              <select
                value={sectionForm.color}
                onChange={(e) => setSectionForm({ ...sectionForm, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
                <option value="indigo">Indigo</option>
                <option value="red">Red</option>
                <option value="gray">Gray</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveSection}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                {editingSectionId ? 'Update Section' : 'Add Section'}
              </button>
              {editingSectionId && (
                <button
                  onClick={() => {
                    setEditingSectionId(null);
                    setSectionForm({ key: '', label: '', icon: 'MessageSquare', color: 'blue' });
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {sections.map(s => (
              <div
                key={s.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${editingSectionId === s.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
                  } bg-white dark:bg-gray-800`}
              >
                <span className={`w-2 h-2 rounded-full bg-${s.color}-500`}></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{s.label}</span>
                <button
                  onClick={() => {
                    setEditingSectionId(s.id);
                    setSectionForm(s);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                {!['personal', 'company', 'location', 'lead_management', 'notes'].includes(s.key) && (
                  <button
                    onClick={() => handleDeleteSection(s.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Field Key</label>
            <input
              type="text"
              placeholder="e.g. customField"
              value={newField.fieldName || ''}
              onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Label</label>
            <input
              type="text"
              placeholder="Display Label"
              value={newField.label || ''}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Field Type</label>
            <select
              value={(newField.validation as any)?.type || 'text'}
              onChange={(e) => setNewField({
                ...newField,
                validation: { ...(newField.validation as any || {}), type: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
            >
              {fieldTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Section</label>
            <select
              value={newField.section || (sections[0]?.key || 'personal')}
              onChange={(e) => setNewField({ ...newField, section: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
            >
              {sections.map(s => (
                <option key={s.id} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 items-center">
            <label className="inline-flex items-center text-sm">
              <input
                type="checkbox"
                checked={newField.isRequired || false}
                onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
                className="mr-2"
              />
              Required
            </label>
            <label className="inline-flex items-center text-sm">
              <input
                type="checkbox"
                checked={newField.isVisible !== false}
                onChange={(e) => setNewField({ ...newField, isVisible: e.target.checked })}
                className="mr-2"
              />
              Visible
            </label>
          </div>
          <div className="col-span-full flex justify-end">
            <button
              onClick={handleAddField}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Field Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Label</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Section</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Visible</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Required</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {fields.map((field, index) => (
              <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{field.fieldName}</span>
                </td>
                <td className="px-6 py-4">
                  {editingId === field.id ? (
                    <input
                      type="text"
                      value={editForm.label || ''}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {(field.validation as any)?.type || 'text'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                    ${getSectionColor(field.section) === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      getSectionColor(field.section) === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        getSectionColor(field.section) === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          getSectionColor(field.section) === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                            getSectionColor(field.section) === 'indigo' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                              getSectionColor(field.section) === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                    {sections.find(s => s.key === field.section)?.label || field.section.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleVisibility(field)}
                    className="inline-flex items-center justify-center p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={field.isVisible ? 'Hide field' : 'Show field'}
                  >
                    {field.isVisible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleRequired(field)}
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors ${field.isRequired
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/50'
                      }`}
                  >
                    {field.isRequired ? 'Required' : 'Optional'}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {editingId === field.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="inline-flex items-center p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(field)}
                          className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {!['firstName', 'lastName', 'email', 'phone', 'company'].includes(field.fieldName) && (
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="inline-flex items-center p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleReorder(field, 'up')}
                          disabled={index === 0}
                          className="inline-flex items-center p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReorder(field, 'down')}
                          disabled={index === fields.length - 1}
                          className="inline-flex items-center p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Total fields: {fields.length} • Visible: {fields.filter(f => f.isVisible).length} • Required: {fields.filter(f => f.isRequired).length}
        </p>
      </div>
    </div>
  );
};

export default LeadFieldsSettings;
