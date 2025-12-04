import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { Card, CardHeader, CardContent, Button, PageLoader } from '../../components/ui';
import { Workflow, ArrowLeft, Save, Plus, Edit3, Trash2, Target } from 'lucide-react';
import { toast } from 'react-toastify';
import { Pipeline, DealStage } from '../../features/business-settings/types';

const DealStagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { pipelines, defaultPipeline, addPipeline, updatePipeline, deletePipeline, setDefaultPipeline, addDealStage, updateDealStage, deleteDealStage, getDealStages, isLoading } = useBusinessSettings();
  
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [isEditingPipeline, setIsEditingPipeline] = useState(false);
  const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null);
  const [pipelineFormData, setPipelineFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
    isActive: true,
  });

  const [isEditingStage, setIsEditingStage] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageFormData, setStageFormData] = useState({
    name: '',
    description: '',
    probability: 0,
    color: '#6B7280',
    isActive: true,
    isClosedWon: false,
    isClosedLost: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(defaultPipeline?.id || pipelines[0].id || '');
    }
  }, [pipelines, defaultPipeline, selectedPipelineId]);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const dealStages = selectedPipeline?.stages || [];

  const resetPipelineForm = () => {
    setPipelineFormData({
      name: '',
      description: '',
      isDefault: false,
      isActive: true,
    });
    setIsEditingPipeline(false);
    setEditingPipelineId(null);
  };

  const resetStageForm = () => {
    setStageFormData({
      name: '',
      description: '',
      probability: 0,
      color: '#6B7280',
      isActive: true,
      isClosedWon: false,
      isClosedLost: false,
    });
    setIsEditingStage(false);
    setEditingStageId(null);
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setPipelineFormData({
      name: pipeline.name,
      description: pipeline.description || '',
      isDefault: pipeline.isDefault,
      isActive: pipeline.isActive,
    });
    setEditingPipelineId(pipeline.id || null);
    setIsEditingPipeline(true);
  };

  const handleEditStage = (stage: DealStage) => {
    setStageFormData({
      name: stage.name,
      description: stage.description || '',
      probability: stage.probability,
      color: stage.color,
      isActive: stage.isActive,
      isClosedWon: stage.isClosedWon,
      isClosedLost: stage.isClosedLost,
    });
    setEditingStageId(stage.id || null);
    setIsEditingStage(true);
  };

  const handleSubmitPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = pipelineFormData.name.trim();
    if (!name) {
      toast.error('Pipeline name is required');
      return;
    }
    setIsSaving(true);
    
    try {
      if (editingPipelineId) {
        await updatePipeline(editingPipelineId, pipelineFormData);
        toast.success('Pipeline updated successfully');
      } else {
        const newPipeline = {
          ...pipelineFormData,
          stages: [],
        };
        await addPipeline(newPipeline);
        toast.success('Pipeline created successfully');
      }
      resetPipelineForm();
    } catch (error) {
      console.error('Failed to save pipeline:', error);
      toast.error('Failed to save pipeline');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPipelineId) {
      toast.error('Please select a pipeline first');
      return;
    }
    if (!stageFormData.name.trim()) {
      toast.error('Stage name is required');
      return;
    }

    setIsSaving(true);
    
    try {
      const stageData = {
        ...stageFormData,
        sortOrder: dealStages.length,
      };

      if (editingStageId) {
        await updateDealStage(editingStageId, stageData);
        toast.success('Deal stage updated successfully');
      } else {
        await addDealStage(selectedPipelineId, stageData);
        toast.success('Deal stage added successfully');
      }
      resetStageForm();
    } catch (error) {
      console.error('Failed to save deal stage:', error);
      toast.error('Failed to save deal stage');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePipeline = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this pipeline? This action cannot be undone.')) {
      try {
        await deletePipeline(id);
        toast.success('Pipeline deleted successfully');
        if (selectedPipelineId === id) {
          setSelectedPipelineId(pipelines[0]?.id || '');
        }
      } catch (error) {
        console.error('Failed to delete pipeline:', error);
        toast.error('Failed to delete pipeline');
      }
    }
  };

  const handleDeleteStage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this deal stage? This action cannot be undone.')) {
      try {
        await deleteDealStage(id);
        toast.success('Deal stage deleted successfully');
      } catch (error) {
        console.error('Failed to delete deal stage:', error);
        toast.error('Failed to delete deal stage');
      }
    }
  };

  const handleSetDefaultPipeline = async (id: string) => {
    try {
      await setDefaultPipeline(id);
    } catch (error) {
      console.error('Failed to set default pipeline:', error);
      toast.error('Failed to set default pipeline');
    }
  };

  const predefinedColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
  ];

  if (isLoading) {
    return <PageLoader message="Loading deal stages..." />;
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
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
            <Workflow className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Deal Stages & Pipelines
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure sales pipelines and deal stages for your CRM
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pipeline Management */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pipelines
                </h3>
                <Button
                  variant="OUTLINE"
                  size="sm"
                  onClick={() => setIsEditingPipeline(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pipelines.map((pipeline) => (
                <div
                  key={pipeline.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPipelineId === pipeline.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedPipelineId(pipeline.id || '')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                          {pipeline.name}
                        </h4>
                        {pipeline.isDefault && (
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {pipeline.stages.length} stages
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="GHOST"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPipeline(pipeline);
                        }}
                        className="p-1"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      {!pipeline.isDefault && (
                        <Button
                          variant="GHOST"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePipeline(pipeline.id!);
                          }}
                          className="p-1"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pipeline Form */}
          {isEditingPipeline && (
            <Card className="mt-4">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingPipelineId ? 'Edit Pipeline' : 'Add Pipeline'}
                </h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPipeline} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pipeline Name *
                    </label>
                    <input
                      type="text"
                      value={pipelineFormData.name}
                      onChange={(e) => setPipelineFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={pipelineFormData.description}
                      onChange={(e) => setPipelineFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={pipelineFormData.isDefault}
                      onChange={(e) => setPipelineFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
                      Set as default pipeline
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="PRIMARY"
                      size="sm"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : (editingPipelineId ? 'Update' : 'Add')}
                    </Button>
                    <Button
                      type="button"
                      variant="OUTLINE"
                      size="sm"
                      onClick={resetPipelineForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Deal Stages Management */}
        <div className="lg:col-span-3">
          {selectedPipeline ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedPipeline.name} - Deal Stages
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {dealStages.length} stages configured
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!selectedPipeline.isDefault && (
                        <Button
                          variant="OUTLINE"
                          size="sm"
                          onClick={() => handleSetDefaultPipeline(selectedPipeline.id!)}
                          className="flex items-center gap-1"
                        >
                          <Target className="w-4 h-4" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="OUTLINE"
                        size="sm"
                        onClick={() => setIsEditingStage(true)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Stage
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {dealStages.length === 0 ? (
                    <div className="text-center py-8">
                      <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Deal Stages Found
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Add your first deal stage to start managing your sales pipeline.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dealStages
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((stage, index) => (
                          <div
                            key={stage.id}
                            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: stage.color }}
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="GHOST"
                                  size="sm"
                                  onClick={() => handleEditStage(stage)}
                                  className="p-1"
                                >
                                  <Edit3 className="w-4 h-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="GHOST"
                                  size="sm"
                                  onClick={() => handleDeleteStage(stage.id!)}
                                  className="p-1"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {stage.name}
                              </h4>
                              {stage.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {stage.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Probability: {stage.probability}%
                                </span>
                                <div className="flex gap-1">
                                  {stage.isClosedWon && (
                                    <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                                      Won
                                    </span>
                                  )}
                                  {stage.isClosedLost && (
                                    <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full">
                                      Lost
                                    </span>
                                  )}
                                  {!stage.isActive && (
                                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stage Form */}
              {isEditingStage && (
                <Card className="mt-4">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {editingStageId ? 'Edit Deal Stage' : 'Add Deal Stage'}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitStage} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Stage Name *
                          </label>
                          <input
                            type="text"
                            value={stageFormData.name}
                            onChange={(e) => setStageFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Probability (%) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={stageFormData.probability}
                            onChange={(e) => setStageFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={stageFormData.description}
                          onChange={(e) => setStageFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Color
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="color"
                            value={stageFormData.color}
                            onChange={(e) => setStageFormData(prev => ({ ...prev, color: e.target.value }))}
                            className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                          />
                          <div className="grid grid-cols-5 gap-1">
                            {predefinedColors.map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setStageFormData(prev => ({ ...prev, color }))}
                                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={stageFormData.isActive}
                            onChange={(e) => setStageFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                          <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                            Active
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isClosedWon"
                            checked={stageFormData.isClosedWon}
                            onChange={(e) => setStageFormData(prev => ({ 
                              ...prev, 
                              isClosedWon: e.target.checked,
                              isClosedLost: e.target.checked ? false : prev.isClosedLost
                            }))}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                          <label htmlFor="isClosedWon" className="text-sm text-gray-700 dark:text-gray-300">
                            Closed Won
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isClosedLost"
                            checked={stageFormData.isClosedLost}
                            onChange={(e) => setStageFormData(prev => ({ 
                              ...prev, 
                              isClosedLost: e.target.checked,
                              isClosedWon: e.target.checked ? false : prev.isClosedWon
                            }))}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                          <label htmlFor="isClosedLost" className="text-sm text-gray-700 dark:text-gray-300">
                            Closed Lost
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          variant="PRIMARY"
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? 'Saving...' : (editingStageId ? 'Update' : 'Add')}
                        </Button>
                        <Button
                          type="button"
                          variant="OUTLINE"
                          onClick={resetStageForm}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No Pipeline Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a pipeline from the left panel to manage its deal stages.
                </p>
                <Button
                  variant="PRIMARY"
                  onClick={() => setIsEditingPipeline(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create First Pipeline
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealStagesPage;