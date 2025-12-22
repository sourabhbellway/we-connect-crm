import React, { useState, useEffect } from 'react';
import { Bell, Volume2, VolumeX, Mail, Clock, Save, Loader2 } from 'lucide-react';
import { notificationService, NotificationPreference } from '../../services/notificationService';
import { toast } from 'react-toastify';

export const NotificationPreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      await notificationService.updatePreferences(preferences);
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleGlobal = (key: 'inAppEnabled' | 'emailEnabled' | 'soundEnabled') => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const togglePreference = (key: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      preferences: {
        ...preferences.preferences,
        [key]: !preferences.preferences[key as keyof typeof preferences.preferences],
      },
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Failed to load preferences. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const notificationTypes = [
    { key: 'leadCreated', label: 'New Lead Created', description: 'When a new lead is added to the system' },
    { key: 'leadUpdated', label: 'Lead Updated', description: 'When lead information is modified' },
    { key: 'leadAssigned', label: 'Lead Assigned to You', description: 'When a lead is assigned to you' },
    { key: 'leadStatusChanged', label: 'Lead Status Changed', description: 'When a lead status changes' },
    { key: 'clientReply', label: 'Client Reply', description: 'When a client responds via email or WhatsApp' },
    { key: 'paymentAdded', label: 'Payment Added', description: 'When a new payment is recorded' },
    { key: 'paymentUpdated', label: 'Payment Updated', description: 'When payment information is modified' },
    { key: 'taskAssigned', label: 'Task Assigned to You', description: 'When a task is assigned to you' },
    { key: 'taskDue', label: 'Task Due', description: 'When your task is due soon' },
    { key: 'meetingScheduled', label: 'Meeting Scheduled', description: 'When a meeting is scheduled with you' },
    { key: 'followUpDue', label: 'Follow-up Due', description: 'When a follow-up is due' },
    { key: 'dealCreated', label: 'Deal Created', description: 'When a new deal is created' },
    { key: 'dealWon', label: 'Deal Won', description: 'When a deal is marked as won' },
    { key: 'dealLost', label: 'Deal Lost', description: 'When a deal is marked as lost' },
    { key: 'quotationSent', label: 'Quotation Sent', description: 'When a quotation is sent to a client' },
    { key: 'quotationAccepted', label: 'Quotation Accepted', description: 'When a client accepts a quotation' },
    { key: 'invoiceSent', label: 'Invoice Sent', description: 'When an invoice is sent' },
    { key: 'invoicePaid', label: 'Invoice Paid', description: 'When an invoice is marked as paid' },
  ];

  return (
    <div className="p-6  mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage how you receive notifications
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Global Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Global Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  In-App Notifications
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show notifications in the application
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleGlobal('inAppEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.inAppEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.inAppEnabled ? 'translate-x-3' : '-translate-x-3'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preferences.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Notification Sound
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Play sound when new notification arrives
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleGlobal('soundEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.soundEnabled ? 'translate-x-3' : '-translate-x-3'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send notifications to your email
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleGlobal('emailEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.emailEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emailEnabled ? 'translate-x-3' : '-translate-x-3'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Do Not Disturb */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Do Not Disturb
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Silence notifications during specific hours (24-hour format)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Hour (0-23)
            </label>
            <input
              type="number"
              min="0"
              max="23"
              value={preferences.doNotDisturbStart ?? ''}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  doNotDisturbStart: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="22"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Example: 22 for 10 PM</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Hour (0-23)
            </label>
            <input
              type="number"
              min="0"
              max="23"
              value={preferences.doNotDisturbEnd ?? ''}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  doNotDisturbEnd: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="8"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Example: 8 for 8 AM</p>
          </div>
        </div>
      </div>

      {/* Individual Notification Types */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Types
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose which types of notifications you want to receive
        </p>
        <div className="space-y-3">
          {notificationTypes.map((type) => (
            <div key={type.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {type.label}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
              <button
                onClick={() => togglePreference(type.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${
                  preferences.preferences[type.key as keyof typeof preferences.preferences]
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.preferences[type.key as keyof typeof preferences.preferences]
                      ? 'translate-x-3'
                      : '-translate-x-3'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save All Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};
