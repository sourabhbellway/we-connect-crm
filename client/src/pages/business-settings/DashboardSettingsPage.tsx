import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Button, Input, PageLoader } from '../../components/ui';
import { businessSettingsService, DashboardSettings } from '../../services/businessSettingsService';
import { ArrowLeft, Save, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<DashboardSettings>({
    salesPipelineFlow: 'Sales Pipeline Flow',
    performanceScorecard: 'Performance Scorecard',
    dealVelocityVolume: 'Deal Velocity & Volume',
    topPerformersMonth: 'Top Performers This Month',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await businessSettingsService.getDashboardSettings();
        if (response.success) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (key: keyof DashboardSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await businessSettingsService.updateDashboardSettings(settings);
      if (response.success) {
        setHasChanges(false);
        // Show success message or toast
      }
    } catch (error) {
      console.error('Error saving dashboard settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      salesPipelineFlow: 'Sales Pipeline Flow',
      performanceScorecard: 'Performance Scorecard',
      dealVelocityVolume: 'Deal Velocity & Volume',
      topPerformersMonth: 'Top Performers This Month',
    });
    setHasChanges(true);
  };

  if (isLoading) {
    return <PageLoader message="Loading dashboard settings..." />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="GHOST"
          size="SM"
          onClick={() => navigate('/business-settings')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize the names of your dashboard sections
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <Card variant="ELEVATED" className="max-w-2xl">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Section Names
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Change the display names for each dashboard section to match your business terminology.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sales Pipeline Flow
              </label>
              <Input
                value={settings.salesPipelineFlow}
                onChange={(e) => handleInputChange('salesPipelineFlow', e.target.value)}
                placeholder="Enter section name"
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The name for the sales pipeline chart section
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Performance Scorecard
              </label>
              <Input
                value={settings.performanceScorecard}
                onChange={(e) => handleInputChange('performanceScorecard', e.target.value)}
                placeholder="Enter section name"
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The name for the performance metrics radial chart section
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deal Velocity & Volume
              </label>
              <Input
                value={settings.dealVelocityVolume}
                onChange={(e) => handleInputChange('dealVelocityVolume', e.target.value)}
                placeholder="Enter section name"
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The name for the deal velocity and volume chart section
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top Performers This Month
              </label>
              <Input
                value={settings.topPerformersMonth}
                onChange={(e) => handleInputChange('topPerformersMonth', e.target.value)}
                placeholder="Enter section name"
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The name for the top performers leaderboard section
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="PRIMARY"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="SECONDARY"
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card variant="ELEVATED" className="max-w-2xl">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preview
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            How your dashboard sections will appear with the current names.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {settings.salesPipelineFlow}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {settings.performanceScorecard}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {settings.dealVelocityVolume}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {settings.topPerformersMonth}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSettingsPage;