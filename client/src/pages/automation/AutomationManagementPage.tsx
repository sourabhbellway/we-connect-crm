import React from 'react';
import { Zap, Plus } from 'lucide-react';

const AutomationManagementPage: React.FC = () => {
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
        <button
          className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
          onClick={() => { /* TODO: open builder modal/page */ }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-700 dark:text-gray-300">
          This is a placeholder page for Automation Management. Routing is now configured.
          You can implement the workflow list, builder, and logs here.
        </p>
      </div>
    </div>
  );
};

export default AutomationManagementPage;
