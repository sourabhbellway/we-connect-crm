import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { RefreshCw, CheckCircle, XCircle, Settings, Eye, EyeOff } from 'lucide-react';
import { STORAGE_KEYS } from '../constants';

interface Integration {
  name: string;
  displayName: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>;
  instructions: string;
}

interface IntegrationStatus {
  enabled: boolean;
  configured: boolean;
}

interface BusinessSettings {
  metaAdsApiKey?: string;
  metaAdsApiSecret?: string;
  metaAdsEnabled?: boolean;
  indiamartApiKey?: string;
  indiamartEnabled?: boolean;
  tradindiaApiKey?: string;
  tradindiaApiSecret?: string;
  tradindiaEnabled?: boolean;
}

const IntegrationSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, IntegrationStatus>>({});
  const [settings, setSettings] = useState<BusinessSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchIntegrationsAndStatus();
  }, []);

  const fetchIntegrationsAndStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch available integrations
      const integrationsResponse = await fetch('/api/business-settings/integrations/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
      });
      
      if (integrationsResponse.ok) {
        const integrationsData = await integrationsResponse.json();
        setIntegrations(integrationsData.data.integrations);
      }

      // Fetch integration status
      const statusResponse = await fetch('/api/business-settings/integrations/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setIntegrationStatus(statusData.data.integrations);
      }

      // Fetch current settings
      const settingsResponse = await fetch('/api/business-settings/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
      });
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData.data.settings);
      }
      
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integration settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleShowSecret = (integrationName: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [integrationName]: !prev[integrationName],
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/business-settings/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save settings');
      }

      toast.success('Integration settings saved successfully');
      await fetchIntegrationsAndStatus(); // Refresh status
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testIntegration = async (integrationName: string) => {
    try {
      setTesting(integrationName);
      
      const response = await fetch(`/api/business-settings/integrations/${integrationName}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Connection test failed');
      }

      toast.success(`${integrationName} connection test successful`);
    } catch (error: any) {
      toast.error(error.message || `${integrationName} connection test failed`);
    } finally {
      setTesting(null);
    }
  };

  const syncIntegration = async (integrationName: string) => {
    try {
      setSyncing(integrationName);
      
      const response = await fetch(`/api/business-settings/integrations/${integrationName}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Lead sync failed');
      }

      toast.success(result.message || `${integrationName} leads synced successfully`);
    } catch (error: any) {
      toast.error(error.message || `${integrationName} lead sync failed`);
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading integration settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Third-Party Integrations
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure integrations to automatically import leads from external platforms.
        </p>
      </div>

      {integrations.map((integration) => (
        <div key={integration.name} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {integration.displayName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {integration.description}
                </p>
                <div className="flex items-center space-x-2">
                  {integrationStatus[integration.name.replace('-', '')]?.configured ? (
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Configured</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Not configured</span>
                    </div>
                  )}
                  {integrationStatus[integration.name.replace('-', '')]?.enabled && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Enabled
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {integrationStatus[integration.name.replace('-', '')]?.configured && (
                <>
                  <button
                    onClick={() => testIntegration(integration.name)}
                    disabled={testing === integration.name || syncing === integration.name}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {testing === integration.name ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      'Test'
                    )}
                  </button>
                  <button
                    onClick={() => syncIntegration(integration.name)}
                    disabled={testing === integration.name || syncing === integration.name}
                    className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {syncing === integration.name ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      'Sync Now'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Configuration</h4>
              
              {/* Enable/Disable toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Integration
                </label>
                <input
                  type="checkbox"
                  checked={settings[`${integration.name.replace('-', '')}Enabled` as keyof BusinessSettings] as boolean || false}
                  onChange={(e) => handleSettingChange(`${integration.name.replace('-', '')}Enabled`, e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* API Fields */}
              {integration.fields.map((field) => {
                const fieldKey = `${integration.name.replace('-', '')}${field.name === 'apiKey' ? 'ApiKey' : 'ApiSecret'}` as keyof BusinessSettings;
                const isSecret = field.type === 'password';
                const showSecret = showSecrets[`${integration.name}-${field.name}`];
                
                return (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label} {field.required && '*'}
                    </label>
                    <div className="relative">
                      <input
                        type={isSecret && !showSecret ? 'password' : 'text'}
                        value={settings[fieldKey] as string || ''}
                        onChange={(e) => handleSettingChange(fieldKey, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                      />
                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleShowSecret(`${integration.name}-${field.name}`)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Setup Instructions</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                  {integration.instructions}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
};

export default IntegrationSettings;
