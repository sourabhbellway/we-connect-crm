import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { teamsService, Team } from '../services/teamsService';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import {
  WorkflowTrigger,
  ConditionOperator,
  ConditionLogic,
  ActionType,
  WorkflowCondition,
  WorkflowAction,
  CreateWorkflowPayload,
  getFieldsForTrigger,
  getDefaultCondition,
  FieldOption,
} from '../services/automationService';

interface WorkflowBuilderProps {
  onClose: () => void;
  onSave: (workflow: CreateWorkflowPayload) => Promise<void>;
  initialWorkflow?: CreateWorkflowPayload;
}

const TRIGGER_OPTIONS = [
  { value: WorkflowTrigger.LEAD_CREATED, label: 'Lead Created' },
  { value: WorkflowTrigger.LEAD_UPDATED, label: 'Lead Updated' },
  { value: WorkflowTrigger.LEAD_STATUS_CHANGED, label: 'Lead Status Changed' },
  { value: WorkflowTrigger.LEAD_ASSIGNED, label: 'Lead Assigned' },
  { value: WorkflowTrigger.DEAL_CREATED, label: 'Deal Created' },
  { value: WorkflowTrigger.DEAL_UPDATED, label: 'Deal Updated' },
  { value: WorkflowTrigger.DEAL_STAGE_CHANGED, label: 'Deal Stage Changed' },
  { value: WorkflowTrigger.TASK_CREATED, label: 'Task Created' },
  { value: WorkflowTrigger.TASK_COMPLETED, label: 'Task Completed' },
];

const OPERATOR_OPTIONS = [
  { value: ConditionOperator.EQUALS, label: 'Equals' },
  { value: ConditionOperator.NOT_EQUALS, label: 'Not Equals' },
  { value: ConditionOperator.CONTAINS, label: 'Contains' },
  { value: ConditionOperator.NOT_CONTAINS, label: 'Does Not Contain' },
  { value: ConditionOperator.GREATER_THAN, label: 'Greater Than' },
  { value: ConditionOperator.LESS_THAN, label: 'Less Than' },
  { value: ConditionOperator.GREATER_THAN_OR_EQUAL, label: 'Greater Than or Equal' },
  { value: ConditionOperator.LESS_THAN_OR_EQUAL, label: 'Less Than or Equal' },
  { value: ConditionOperator.IS_EMPTY, label: 'Is Empty' },
  { value: ConditionOperator.IS_NOT_EMPTY, label: 'Is Not Empty' },
];

const ACTION_OPTIONS = [
  { value: ActionType.ASSIGN_TO_USER, label: 'Assign to User' },
  { value: ActionType.ASSIGN_TO_TEAM, label: 'Assign to Team' },
  { value: ActionType.CHANGE_STATUS, label: 'Change Status' },
  { value: ActionType.SEND_EMAIL, label: 'Send Email' },
  { value: ActionType.SEND_WHATSAPP, label: 'Send WhatsApp' },
  { value: ActionType.CREATE_TASK, label: 'Create Task' },
  { value: ActionType.ADD_TAG, label: 'Add Tag' },
  { value: ActionType.REMOVE_TAG, label: 'Remove Tag' },
  { value: ActionType.UPDATE_FIELD, label: 'Update Field' },
  { value: ActionType.SEND_WEBHOOK, label: 'Send Webhook' },
];

// Utility function to group fields by category (local helper for UI display)
const groupFieldsByCategory = (fields: any[]) => {
  return fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, any[]>);
};

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onClose, onSave, initialWorkflow }) => {
  const [name, setName] = useState(initialWorkflow?.name || '');
  const [description, setDescription] = useState(initialWorkflow?.description || '');
  const [isActive, setIsActive] = useState(initialWorkflow?.isActive ?? true);
  const [trigger, setTrigger] = useState<WorkflowTrigger>(
    initialWorkflow?.trigger || WorkflowTrigger.LEAD_CREATED
  );
  const [conditionLogic, setConditionLogic] = useState<ConditionLogic>(
    initialWorkflow?.conditions?.logic || ConditionLogic.AND
  );
  const [conditions, setConditions] = useState<WorkflowCondition[]>(
    initialWorkflow?.conditions?.conditions || [
      getDefaultCondition(trigger),
    ]
  );
  const [actions, setActions] = useState<WorkflowAction[]>(
    initialWorkflow?.actions || [{ type: ActionType.ASSIGN_TO_USER, config: {} }]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [draggedConditionIndex, setDraggedConditionIndex] = useState<number | null>(null);
  const [draggedActionIndex, setDraggedActionIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Load users for Assign to User action
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getUsers();
        // Handle both paginated (response.data.users) and flat (response.data) structures
        const list = (Array.isArray(response?.data) ? response.data : response?.data?.users) ?? [];
        setUsers(list);
      } catch (err) {
        console.error('Failed to load users for workflow builder', err);
      }
    };
    fetchUsers();

    const fetchTeams = async () => {
      try {
        const list = await teamsService.getAll();
        setTeams(list || []);
      } catch (err) {
        console.error('Failed to load teams for workflow builder', err);
      }
    };
    fetchTeams();
  }, []);

  const addCondition = () => {
    setConditions([...conditions, getDefaultCondition(trigger)]);
  };

  // Handle trigger change - reset conditions with appropriate defaults
  const handleTriggerChange = (newTrigger: WorkflowTrigger) => {
    setTrigger(newTrigger);
    // Reset conditions to use defaults for the new trigger type
    setConditions([getDefaultCondition(newTrigger)]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof WorkflowCondition, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const addAction = () => {
    setActions([...actions, { type: ActionType.ASSIGN_TO_USER, config: {} }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, type: ActionType) => {
    const newActions = [...actions];
    newActions[index] = { type, config: {} };
    setActions(newActions);
  };

  const updateActionConfig = (index: number, key: string, value: any) => {
    const newActions = [...actions];
    newActions[index].config[key] = value;
    setActions(newActions);
  };

  const handleDragStartCondition = (index: number) => {
    setDraggedConditionIndex(index);
  };

  const handleDragOverCondition = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedConditionIndex === null || draggedConditionIndex === index) return;

    const newConditions = [...conditions];
    const draggedItem = newConditions[draggedConditionIndex];
    newConditions.splice(draggedConditionIndex, 1);
    newConditions.splice(index, 0, draggedItem);

    setConditions(newConditions);
    setDraggedConditionIndex(index);
  };

  const handleDragEndCondition = () => {
    setDraggedConditionIndex(null);
  };

  const handleDragStartAction = (index: number) => {
    setDraggedActionIndex(index);
  };

  const handleDragOverAction = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedActionIndex === null || draggedActionIndex === index) return;

    const newActions = [...actions];
    const draggedItem = newActions[draggedActionIndex];
    newActions.splice(draggedActionIndex, 1);
    newActions.splice(index, 0, draggedItem);

    setActions(newActions);
    setDraggedActionIndex(index);
  };

  const handleDragEndAction = () => {
    setDraggedActionIndex(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name,
        description,
        isActive,
        trigger,
        conditions: {
          logic: conditionLogic,
          conditions,
        },
        actions,
      });
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderActionConfig = (action: WorkflowAction, index: number) => {
    switch (action.type) {
      case ActionType.ASSIGN_TO_USER:
        return (
          <select
            value={action.config.userId || ''}
            onChange={(e) => updateActionConfig(index, 'userId', parseInt(e.target.value) || '')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="" disabled>Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>
        );
      case ActionType.ASSIGN_TO_TEAM:
        return (
          <select
            value={action.config.teamId || ''}
            onChange={(e) => updateActionConfig(index, 'teamId', parseInt(e.target.value) || '')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="" disabled>Select Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        );
      case ActionType.CHANGE_STATUS:
        return (
          <input
            type="text"
            placeholder="New Status"
            value={action.config.status || ''}
            onChange={(e) => updateActionConfig(index, 'status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );
      case ActionType.SEND_EMAIL:
        return (
          <div className="space-y-2">
            <input
              type="email"
              placeholder="To Email"
              value={action.config.to || ''}
              onChange={(e) => updateActionConfig(index, 'to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <input
              type="text"
              placeholder="Subject"
              value={action.config.subject || ''}
              onChange={(e) => updateActionConfig(index, 'subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <textarea
              placeholder="Message"
              value={action.config.body || ''}
              onChange={(e) => updateActionConfig(index, 'body', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        );
      case ActionType.CREATE_TASK:
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Task Title"
              value={action.config.title || ''}
              onChange={(e) => updateActionConfig(index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <textarea
              placeholder="Task Description"
              value={action.config.description || ''}
              onChange={(e) => updateActionConfig(index, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        );
      case ActionType.ADD_TAG:
      case ActionType.REMOVE_TAG:
        return (
          <input
            type="text"
            placeholder="Tag Name"
            value={action.config.tag || ''}
            onChange={(e) => updateActionConfig(index, 'tag', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );
      case ActionType.UPDATE_FIELD:
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Field Name"
              value={action.config.field || ''}
              onChange={(e) => updateActionConfig(index, 'field', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <input
              type="text"
              placeholder="New Value"
              value={action.config.value || ''}
              onChange={(e) => updateActionConfig(index, 'value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initialWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workflow Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Auto-assign new leads"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-weconnect-red border-gray-300 rounded focus:ring-weconnect-red"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active (workflow will run automatically)
              </label>
            </div>
          </div>

          {/* Trigger */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🎯 Trigger</h3>
            <select
              value={trigger}
              onChange={(e) => handleTriggerChange(e.target.value as WorkflowTrigger)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {TRIGGER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">⚡ Conditions</h3>
              <select
                value={conditionLogic}
                onChange={(e) => setConditionLogic(e.target.value as ConditionLogic)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={ConditionLogic.AND}>All (AND)</option>
                <option value={ConditionLogic.OR}>Any (OR)</option>
              </select>
            </div>

            <div className="space-y-2">
              {conditions.map((condition, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStartCondition(index)}
                  onDragOver={(e) => handleDragOverCondition(e, index)}
                  onDragEnd={handleDragEndCondition}
                  className="flex items-center gap-2 bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-move hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {Object.entries(groupFieldsByCategory(getFieldsForTrigger(trigger))).map(([category, fields]) => (
                      <optgroup key={category} label={category}>
                        {(fields as FieldOption[]).map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {OPERATOR_OPTIONS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  {condition.operator !== ConditionOperator.IS_EMPTY &&
                    condition.operator !== ConditionOperator.IS_NOT_EMPTY && (
                      <input
                        type="text"
                        value={condition.value || ''}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    )}
                  <button
                    onClick={() => removeCondition(index)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addCondition}
              className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Condition
            </button>
          </div>

          {/* Actions */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🚀 Actions</h3>

            <div className="space-y-3">
              {actions.map((action, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStartAction(index)}
                  onDragOver={(e) => handleDragOverAction(e, index)}
                  onDragEnd={handleDragEndAction}
                  className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-move hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400 mt-2" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={action.type}
                          onChange={(e) => updateAction(index, e.target.value as ActionType)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          {ACTION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeAction(index)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                      {renderActionConfig(action, index)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addAction}
              className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Action
            </button>
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
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
