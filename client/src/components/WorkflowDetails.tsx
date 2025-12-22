import React from 'react';
import { X, Zap, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Workflow, ActionType, ConditionOperator } from '../services/automationService';

interface WorkflowDetailsProps {
    workflow: Workflow;
    onClose: () => void;
}

const WorkflowDetails: React.FC<WorkflowDetailsProps> = ({ workflow, onClose }) => {
    const getOperatorLabel = (operator: ConditionOperator) => {
        return operator.replace(/_/g, ' ').toLowerCase();
    };

    const getActionLabel = (type: ActionType) => {
        return type.replace(/_/g, ' ').toLowerCase();
    };

    const renderActionConfig = (action: any) => {
        const entries = Object.entries(action.config);
        if (entries.length === 0) return null;

        return (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                {entries.map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                        <span className="font-medium capitalize">{key}:</span>
                        <span className="break-all">{String(value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {workflow.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${workflow.isActive
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                    }`}
                            >
                                {workflow.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Created {new Date(workflow.createdAt).toLocaleDateString()}
                            </span>
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
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Description */}
                    {workflow.description && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Description
                            </h3>
                            <p className="text-gray-900 dark:text-white">{workflow.description}</p>
                        </div>
                    )}

                    {/* Trigger */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Trigger</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    When {workflow.trigger.replace(/_/g, ' ').toLowerCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Conditions</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Match {workflow.conditions.logic.toLowerCase()} of the following
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 pl-12">
                                {workflow.conditions.conditions.map((condition, index) => (
                                    <div
                                        key={index}
                                        className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm"
                                    >
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {condition.field}
                                        </span>
                                        <span className="mx-2 text-gray-500">
                                            {getOperatorLabel(condition.operator)}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {String(condition.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Actions</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Execute the following actions
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pl-12">
                                {workflow.actions.map((action, index) => (
                                    <div
                                        key={index}
                                        className="relative bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                            {getActionLabel(action.type)}
                                        </div>
                                        {renderActionConfig(action)}
                                    </div>
                                ))}
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

export default WorkflowDetails;
