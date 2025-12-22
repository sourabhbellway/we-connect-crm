import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS } from '../../constants';
import { Zap, Plus, Play, Pause, Trash2, Clock, CheckCircle, XCircle, AlertCircle, LayoutList, LayoutGrid, Edit, Eye } from 'lucide-react';
import WorkflowDetails from '../../components/WorkflowDetails';
import WorkflowBuilder from '../../components/WorkflowBuilder';
import { automationService, Workflow, WorkflowExecution, CreateWorkflowPayload } from '../../services/automationService';
import { formatDistanceToNow } from 'date-fns';

const AutomationManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [viewingWorkflow, setViewingWorkflow] = useState<Workflow | null>(null);
  const [activeTab, setActiveTab] = useState<'workflows' | 'logs'>('workflows');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workflowsData, executionsData] = await Promise.all([
        automationService.getWorkflows(true),
        automationService.getExecutionHistory(),
      ]);
      setWorkflows(workflowsData);
      setExecutions(executionsData);
    } catch (error) {
      console.error('Failed to load automation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async (workflow: CreateWorkflowPayload) => {
    try {
      if (editingWorkflow) {
        await automationService.updateWorkflow(editingWorkflow.id, workflow);
      } else {
        await automationService.createWorkflow(workflow);
      }
      setShowBuilder(false);
      setEditingWorkflow(null);
      loadData();
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    }
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleViewWorkflow = (workflow: Workflow) => {
    setViewingWorkflow(workflow);
  };

  const handleToggleWorkflow = async (id: number, isActive: boolean) => {
    try {
      await automationService.toggleWorkflow(id, !isActive);
      loadData();
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
      alert('Failed to toggle workflow');
    }
  };

  const handleDeleteWorkflow = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await automationService.deleteWorkflow(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Failed to delete workflow');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'RUNNING':
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'RUNNING':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const renderWorkflowCard = (workflow: Workflow) => (
    <div
      key={workflow.id}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {workflow.name}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${workflow.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}
            >
              {workflow.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {workflow.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              {workflow.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              {workflow.trigger.replace(/_/g, ' ')}
            </span>
            <span>{workflow.conditions.conditions.length} conditions</span>
            <span>{workflow.actions.length} actions</span>
            {workflow._count && (
              <span>{workflow._count.executions} executions</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewWorkflow(workflow)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          {hasPermission(PERMISSIONS.AUTOMATION.UPDATE) && (
            <button
              onClick={() => handleToggleWorkflow(workflow.id, workflow.isActive)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={workflow.isActive ? 'Pause' : 'Activate'}
            >
              {workflow.isActive ? (
                <Pause className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Play className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
          {hasPermission(PERMISSIONS.AUTOMATION.UPDATE) && (
            <button
              onClick={() => handleEditWorkflow(workflow)}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </button>
          )}
          {hasPermission(PERMISSIONS.AUTOMATION.DELETE) && (
            <button
              onClick={() => handleDeleteWorkflow(workflow.id)}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
            <Zap className="h-6 w-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automation</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Build rules to automate your workflows</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          {hasPermission(PERMISSIONS.AUTOMATION.CREATE) && (
            <button
              className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
              onClick={() => {
                setEditingWorkflow(null);
                setShowBuilder(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </button>
          )}
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'workflows'
              ? 'border-weconnect-red text-weconnect-red'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            Workflows ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'logs'
              ? 'border-weconnect-red text-weconnect-red'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            Execution Logs ({executions.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
        </div>
      ) : activeTab === 'workflows' ? (
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No workflows yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first automation workflow to get started
              </p>
              {hasPermission(PERMISSIONS.AUTOMATION.CREATE) && (
                <button
                  onClick={() => {
                    setEditingWorkflow(null);
                    setShowBuilder(true);
                  }}
                  className="bg-weconnect-red text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </button>
              )}
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows.map((workflow) => renderWorkflowCard(workflow))}
              </div>
            ) : (
              <div className="space-y-4">
                {workflows.map((workflow) => renderWorkflowCard(workflow))}
              </div>
            )
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {executions.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No execution history
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Workflow executions will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trigger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {executions.map((execution) => (
                    <tr key={execution.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              execution.status
                            )}`}
                          >
                            {execution.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {execution.workflow.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {execution.workflow.trigger.replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {execution.duration ? `${execution.duration}ms` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showBuilder && (
        <WorkflowBuilder
          onClose={() => {
            setShowBuilder(false);
            setEditingWorkflow(null);
          }}
          onSave={handleSaveWorkflow}
          initialWorkflow={editingWorkflow || undefined}
        />
      )}

      {viewingWorkflow && (
        <WorkflowDetails
          workflow={viewingWorkflow}
          onClose={() => setViewingWorkflow(null)}
        />
      )}
    </div>
  );
};

export default AutomationManagementPage;
