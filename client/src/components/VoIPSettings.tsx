import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Phone, Video, Settings, Save, X, Copy, Eye, EyeOff, AlertCircle, CheckCircle, Clock, FileText, Filter,
  Plus, Edit, Trash2, Globe, Server, Key, Shield, Mic, MicOff, VideoOff, PhoneOff, PhoneCall, VideoIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../services/apiClient';

interface VoIPConfig {
  id: number;
  provider: string;
  apiKey: string;
  apiSecret: string;
  accountSid?: string;
  authToken?: string;
  regions: string[];
  defaultRegion?: 'india' | 'arabic';
  enableCallRecording: boolean;
  recordingStorage?: 's3' | 'local' | 'none';
  enableVideoCalls: boolean;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface VoIPCall {
  id: number;
  callId: string;
  leadId: number;
  userId: number;
  phoneNumber: string;
  callType: 'audio' | 'video';
  status: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  recordingUrl?: string;
  region?: 'india' | 'arabic';
  isRecorded: boolean;
  errorMessage?: string;
  errorCode?: string;
  provider: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  lead?: {
    firstName: string;
    lastName: string;
    company?: string;
  };
}

interface VoIPStats {
  totalCalls: number;
  answeredCalls: number;
  completedCalls: number;
  videoCalls: number;
  audioCalls: number;
  averageCallDuration: number;
  indiaCalls: number;
  arabicCalls: number;
  answerRate: number;
  completionRate: number;
}

const VoIPSettings: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('configuration');
  const [config, setConfig] = useState<VoIPConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [calls, setCalls] = useState<VoIPCall[]>([]);
  const [stats, setStats] = useState<VoIPStats | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    accountSid: '',
    authToken: '',
    regions: ['india'],
    defaultRegion: 'india' as 'india' | 'arabic',
    enableCallRecording: false,
    recordingStorage: 'none' as 's3' | 'local' | 'none',
    enableVideoCalls: false,
    isActive: true,
  });

  useEffect(() => {
    fetchVoIPConfig();
    fetchVoIPWebhookUrl();
  }, []);

  useEffect(() => {
    if (activeTab === 'call-history') {
      fetchVoIPCallHistory();
    } else if (activeTab === 'statistics') {
      fetchVoIPStatistics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (config) {
      setFormData({
        provider: config.provider || 'twilio',
        apiKey: config.apiKey || '',
        apiSecret: config.apiSecret || '',
        accountSid: config.accountSid || '',
        authToken: config.authToken || '',
        regions: config.regions || ['india'],
        defaultRegion: config.defaultRegion || 'india',
        enableCallRecording: config.enableCallRecording || false,
        recordingStorage: config.recordingStorage || 'none',
        enableVideoCalls: config.enableVideoCalls || false,
        isActive: config.isActive !== undefined ? config.isActive : true,
      });
    }
  }, [config]);

  const fetchVoIPConfig = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/communications/voip/config');
      if (response.data.success) {
        setConfig(response.data.data.config);
      } else {
        toast.error(response.data.message || 'Failed to fetch VoIP configuration');
      }
    } catch (error) {
      console.error('Error fetching VoIP config:', error);
      toast.error('Failed to fetch VoIP configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchVoIPWebhookUrl = async () => {
    try {
      const baseUrl = window.location.origin;
      const response = await apiClient.get(`/communications/voip/webhook-url?baseUrl=${baseUrl}`);
      if (response.data.success) {
        setWebhookUrl(response.data.data.voipWebhook);
      }
    } catch (error) {
      console.error('Error fetching VoIP webhook URL:', error);
    }
  };

  const fetchVoIPCallHistory = async () => {
    try {
      setCallHistoryLoading(true);
      const response = await apiClient.get('/communications/voip/calls');
      if (response.data.success) {
        setCalls(response.data.data.calls);
      } else {
        toast.error(response.data.message || 'Failed to fetch VoIP call history');
      }
    } catch (error) {
      console.error('Error fetching VoIP call history:', error);
      toast.error('Failed to fetch VoIP call history');
    } finally {
      setCallHistoryLoading(false);
    }
  };

  const fetchVoIPStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await apiClient.get('/communications/voip/stats');
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch VoIP statistics');
      }
    } catch (error) {
      console.error('Error fetching VoIP statistics:', error);
      toast.error('Failed to fetch VoIP statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegionChange = (region: 'india' | 'arabic') => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region],
    }));
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const response = await apiClient.post('/communications/voip/config', formData);
      if (response.data.success) {
        toast.success('VoIP configuration saved successfully');
        setConfig(response.data.data.config);
      } else {
        toast.error(response.data.message || 'Failed to save VoIP configuration');
      }
    } catch (error) {
      console.error('Error saving VoIP config:', error);
      toast.error('Failed to save VoIP configuration');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    });
  };

  const getCallStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'initiated':
        return 'text-blue-600 bg-blue-100';
      case 'ringing':
        return 'text-purple-600 bg-purple-100';
      case 'answered':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-emerald-600 bg-emerald-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'busy':
        return 'text-amber-600 bg-amber-100';
      case 'no_answer':
        return 'text-gray-600 bg-gray-100';
      case 'cancelled':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCallStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'initiated':
        return <Clock className="h-4 w-4" />;
      case 'ringing':
        return <PhoneCall className="h-4 w-4" />;
      case 'answered':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <X className="h-4 w-4" />;
      case 'busy':
        return <PhoneOff className="h-4 w-4" />;
      case 'no_answer':
        return <PhoneOff className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getCallTypeIcon = (type: string) => {
    return type === 'video' ? <VideoIcon className="h-4 w-4 text-blue-500" /> : <Phone className="h-4 w-4 text-green-500" />;
  };

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('VoIP Settings')}
        </h1>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {config?.isActive ? (
              <>✓ {t('Active')}</>
            ) : (
              <>✗ {t('Inactive')}</>
            )}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'configuration', label: t('Configuration'), icon: Settings },
            { id: 'call-history', label: t('Call History'), icon: Clock },
            { id: 'statistics', label: t('Statistics'), icon: ChartBar },
            { id: 'webhook', label: t('Webhook'), icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-weconnect-red text-weconnect-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('VoIP Provider Configuration')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('VoIP Provider')}
                </label>
                <select
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                >
                  <option value="twilio">Twilio</option>
                  <option value="agora">Agora</option>
                  <option value="vonage">Vonage</option>
                  <option value="plivo">Plivo</option>
                </select>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('API Key')}
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white pr-10"
                    placeholder="Enter API Key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
                  >
                    {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* API Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('API Secret')}
                </label>
                <div className="relative">
                  <input
                    type={showApiSecret ? 'text' : 'password'}
                    name="apiSecret"
                    value={formData.apiSecret}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white pr-10"
                    placeholder="Enter API Secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
                  >
                    {showApiSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Account SID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Account SID')}
                </label>
                <input
                  type="text"
                  name="accountSid"
                  value={formData.accountSid}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Enter Account SID"
                />
              </div>

              {/* Auth Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Auth Token')}
                </label>
                <div className="relative">
                  <input
                    type={showAuthToken ? 'text' : 'password'}
                    name="authToken"
                    value={formData.authToken}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white pr-10"
                    placeholder="Enter Auth Token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthToken(!showAuthToken)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
                  >
                    {showAuthToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Regions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Supported Regions')}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.regions.includes('india')}
                      onChange={() => handleRegionChange('india')}
                      className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">India</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.regions.includes('arabic')}
                      onChange={() => handleRegionChange('arabic')}
                      className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Arabic Countries</span>
                  </label>
                </div>
              </div>

              {/* Default Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Default Region')}
                </label>
                <select
                  name="defaultRegion"
                  value={formData.defaultRegion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                >
                  <option value="india">India</option>
                  <option value="arabic">Arabic Countries</option>
                </select>
              </div>

              {/* Call Features */}
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  {t('Call Features')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enableCallRecording"
                      checked={formData.enableCallRecording}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('Enable Call Recording')}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enableVideoCalls"
                      checked={formData.enableVideoCalls}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('Enable Video Calls')}
                    </span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Recording Storage')}
                    </label>
                    <select
                      name="recordingStorage"
                      value={formData.recordingStorage}
                      onChange={handleInputChange}
                      disabled={!formData.enableCallRecording}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    >
                      <option value="none">None</option>
                      <option value="s3">AWS S3</option>
                      <option value="local">Local Storage</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('Enable VoIP Service')}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="bg-weconnect-red text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('Saving')}...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('Save Configuration')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call History Tab */}
      {activeTab === 'call-history' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('VoIP Call History')}
            </h2>

            {callHistoryLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red mx-auto"></div>
              </div>
            ) : calls.length > 0 ? (
              <div className="space-y-4">
                {calls.map((call) => (
                  <div
                    key={call.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getCallTypeIcon(call.callType)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {call.callType === 'video' ? 'Video Call' : 'VoIP Call'} to {call.phoneNumber}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCallStatusColor(call.status)}`}>
                              {getCallStatusIcon(call.status)}
                              <span className="ml-1">{call.status}</span>
                            </span>
                          </div>
                          {call.lead && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {call.lead.firstName} {call.lead.lastName} - {call.lead.company || 'No Company'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(call.createdAt).toLocaleString()}
                        </span>
                        {call.region && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${call.region === 'india' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {call.region === 'india' ? 'India' : 'Arabic'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-4">
                        {call.duration && (
                          <span>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {Math.floor(call.duration / 60)}:{String(call.duration % 60).padStart(2, '0')} min
                          </span>
                        )}
                        {call.isRecorded && call.recordingUrl && (
                          <span className="flex items-center">
                            <Mic className="h-3 w-3 inline mr-1" />
                            <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                              Recording Available
                            </a>
                          </span>
                        )}
                        {call.user && (
                          <span>
                            <User className="h-3 w-3 inline mr-1" />
                            {call.user.firstName} {call.user.lastName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        {call.provider && (
                          <span>
                            Provider: {call.provider}
                          </span>
                        )}
                        {call.errorMessage && (
                          <span className="text-red-500">
                            Error: {call.errorMessage}
                          </span>
                        )}
                      </div>
                    </div>

                    {call.metadata && Object.keys(call.metadata).length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>Metadata:</strong> {JSON.stringify(call.metadata)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No VoIP calls found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  VoIP calls will appear here once made or received
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('VoIP Statistics')}
            </h2>

            {statsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red mx-auto"></div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Calls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Calls</h3>
                    <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCalls}</p>
                </div>

                {/* Answered Calls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Answered Calls</h3>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.answeredCalls}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stats.answerRate.toFixed(1)}% answer rate
                  </p>
                </div>

                {/* Completed Calls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Calls</h3>
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedCalls}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stats.completionRate.toFixed(1)}% completion rate
                  </p>
                </div>

                {/* Video Calls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Video Calls</h3>
                    <VideoIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.videoCalls}</p>
                </div>

                {/* Audio Calls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Audio Calls</h3>
                    <Phone className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.audioCalls}</p>
                </div>

                {/* Average Duration */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Call Duration</h3>
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(stats.averageCallDuration / 60)}:{String(Math.round(stats.averageCallDuration) % 60).padStart(2, '0')} min
                  </p>
                </div>

                {/* India Calls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">India Calls</h3>
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.indiaCalls}</p>
                </div>

                {/* Arabic Calls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Arabic Calls</h3>
                    <Globe className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.arabicCalls}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No statistics available</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Statistics will appear here once VoIP calls are made
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Webhook Tab */}
      {activeTab === 'webhook' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('VoIP Webhook Configuration')}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Webhook URL')}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {t('Copy')}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Configure this URL in your VoIP provider webhook settings for call status updates
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  {t('Webhook Setup Instructions')}
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Log in to your VoIP provider dashboard</li>
                  <li>Navigate to Webhook or API settings</li>
                  <li>Add a new webhook endpoint</li>
                  <li>Paste the webhook URL above</li>
                  <li>Select call status events (initiated, answered, completed, failed, etc.)</li>
                  <li>Save the webhook configuration</li>
                  <li>Test the webhook connection</li>
                </ol>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  {t('Supported Webhook Events')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {['initiated', 'ringing', 'answered', 'completed', 'failed', 'busy', 'no_answer', 'cancelled'].map(event => (
                    <div key={event} className="bg-white dark:bg-gray-600 px-3 py-2 rounded border text-center">
                      {event}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-md font-medium text-yellow-800 dark:text-yellow-300 mb-2 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {t('Important Notes')}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-200">
                  <li>Ensure your VoIP provider supports webhooks</li>
                  <li>Configure proper authentication for webhook requests</li>
                  <li>Test webhook connectivity before going live</li>
                  <li>Monitor webhook logs for any issues</li>
                  <li>Contact support if you need assistance with webhook setup</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Temporary ChartBar icon for statistics
const ChartBar = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
  </svg>
);

export default VoIPSettings;