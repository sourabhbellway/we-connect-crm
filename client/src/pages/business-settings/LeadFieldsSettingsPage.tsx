import React from 'react';
import LeadFieldsSettings from '../../components/LeadFieldsSettings';
import { Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadFieldsSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/business-settings')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Back to Business Settings"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lead Form Fields Configuration
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage lead form fields - Add, hide, show, make required/optional, and reorder fields
            </p>
          </div>
        </div>
      </div>

      {/* Lead Fields Settings Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <LeadFieldsSettings />
      </div>
    </div>
  );
};

export default LeadFieldsSettingsPage;

