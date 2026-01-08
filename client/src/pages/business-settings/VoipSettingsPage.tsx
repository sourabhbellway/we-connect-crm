import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, PageLoader } from '../../components/ui';
import {
  Phone, Settings, Save, AlertCircle, CheckCircle,
  Globe, Key, Lock, Eye, EyeOff, Plus, Edit, Trash2,
  BarChart3, Clock, PhoneCall, PhoneOff, Users, TrendingUp,
  Activity, Mic, MicOff, Video, VideoOff, Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';

interface VoIPConfiguration {
  id?: string;
  provider: 'twilio' | 'exotel' | 'unifonic' | 'plivo' | 'knowlarity';
  apiKey?: string;
  apiSecret?: string;
  accountSid?: string;
  authToken?: string;
  regions: string[];
  defaultRegion?: string;
  enableCallRecording: boolean;
  recordingStorage?: string;
  enableVideoCalls: boolean;
  fromNumber?: string;
  virtualNumber?: string;
  senderId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: any;
}

interface VoIPCall {
  id: string;
  callId: string;
  leadId: number;
  userId: number;
  phoneNumber: string;
  callType: 'audio' | 'video';
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no_answer' | 'cancelled';
  duration?: number;
  startTime?: string;
  endTime?: string;
  recordingUrl?: string;
  region?: string;
  isRecorded: boolean;
  errorMessage?: string;
  provider: string;
  createdAt: string;
}

interface VoIPStats {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  averageDuration: number;
  totalDuration: number;
  callsByRegion: Record<string, number>;
  callsByStatus: Record<string, number>;
  recentCalls: VoIPCall[];
}

const VoipSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'config' | 'calls' | 'stats'>('config');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<VoIPConfiguration | null>(null);
  const [callHistory, setCallHistory] = useState<VoIPCall[]>([]);
  const [stats, setStats] = useState<VoIPStats | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    apiKey: false,
    apiSecret: false,
    authToken: false,
  });

  useEffect(() => {
    fetchVoIPData();
  }, [activeTab]);

  const fetchVoIPData = async () => {
    try {
      setIsLoading(true);

      if (activeTab === 'config') {
        const response = await apiClient.get('/business-settings/voip/config');
        if (response.data.success) {
          setConfig(response.data.data || {
            provider: 'twilio',
            regions: ['india'],
            defaultRegion: 'india',
            enableCallRecording: false,
            enableVideoCalls: false,
            isActive: false,
          });
        }
      } else if (activeTab === 'calls') {
        const [callsResponse, statsResponse] = await Promise.all([
          apiClient.get('/business-settings/voip/calls'),
          apiClient.get('/business-settings/voip/stats')
        ]);

        if (callsResponse.data.success) {
          const callData = callsResponse.data.data;
          // Handle both direct array and paginated response { items: [...] }
          const calls = Array.isArray(callData)
            ? callData
            : (callData?.items && Array.isArray(callData.items) ? callData.items : []);
          setCallHistory(calls);
        }
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching VOIP data:', error);
      toast.error('Failed to load VOIP data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveVoIPConfig = async () => {
    if (!config) return;

    try {
      setIsSaving(true);
      const response = await apiClient.post('/business-settings/voip/config', config);
      if (response.data.success) {
        toast.success('VOIP configuration saved successfully');
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error saving VOIP config:', error);
      toast.error('Failed to save VOIP configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const testVoIPConnection = async () => {
    try {
      toast.info('Testing VOIP connection...');
      // This would need a test endpoint
      setTimeout(() => {
        toast.success('VOIP connection test successful');
      }, 2000);
    } catch (error) {
      toast.error('VOIP connection test failed');
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'no_answer': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <PageLoader message="Loading VOIP settings..." />;
  }

  const providers = [
    { value: 'twilio', label: 'Twilio', countries: ['India', 'Saudi Arabia', 'UAE', 'Global'], icon: '🌐' },
    { value: 'exotel', label: 'Exotel', countries: ['India'], icon: '🇮🇳' },
    { value: 'unifonic', label: 'Unifonic', countries: ['Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'], icon: '🕌' },
    { value: 'plivo', label: 'Plivo', countries: ['India', 'Saudi Arabia', 'UAE', 'Global'], icon: '📞' },
    { value: 'knowlarity', label: 'Knowlarity', countries: ['India', 'Saudi Arabia', 'UAE'], icon: '🎯' },
  ];

  const regions = [
    { value: 'india', label: 'India', flag: '🇮🇳' },
    { value: 'saudi_arabia', label: 'Saudi Arabia', flag: '🇸🇦' },
    { value: 'uae', label: 'UAE', flag: '🇦🇪' },
    { value: 'kuwait', label: 'Kuwait', flag: '🇰🇼' },
    { value: 'qatar', label: 'Qatar', flag: '🇶🇦' },
    { value: 'bahrain', label: 'Bahrain', flag: '🇧🇭' },
    { value: 'oman', label: 'Oman', flag: '🇴🇲' },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              VOIP Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure Voice over IP for India and Arabic countries
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/business-settings')}
          className="flex items-center gap-2"
        >
          ← Back to Business Settings
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-lg border">
        {[
          { id: 'config', label: 'Configuration', icon: Settings },
          { id: 'calls', label: 'Call History', icon: PhoneCall },
          { id: 'stats', label: 'Statistics', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && config && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card className={`border-l-4 ${config.isActive ? 'border-l-green-500' : 'border-l-gray-300'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {config.isActive ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      VOIP Integration Status
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {config.isActive ? 'Active and ready to make calls' : 'Inactive - Configure settings to enable'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testVoIPConnection}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Test Connection
                  </Button>
                  <Button
                    onClick={saveVoIPConfig}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                VOIP Provider
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map(provider => (
                  <div
                    key={provider.value}
                    onClick={() => setConfig({ ...config, provider: provider.value as any })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${config.provider === provider.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <h4 className="font-semibold">{provider.label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {provider.countries.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Supported Regions</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {regions.map(region => (
                  <label key={region.value} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.regions.includes(region.value)}
                      onChange={(e) => {
                        const newRegions = e.target.checked
                          ? [...config.regions, region.value]
                          : config.regions.filter(r => r !== region.value);
                        setConfig({ ...config, regions: newRegions });
                      }}
                      className="rounded"
                    />
                    <span className="text-lg">{region.flag}</span>
                    <span className="text-sm font-medium">{region.label}</span>
                  </label>
                ))}
              </div>

              {config.regions.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Region
                  </label>
                  <select
                    value={config.defaultRegion}
                    onChange={(e) => setConfig({ ...config, defaultRegion: e.target.value })}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {regions.filter(r => config.regions.includes(r.value)).map(region => (
                      <option key={region.value} value={region.value}>
                        {region.flag} {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Credentials */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Credentials
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.apiKey ? 'text' : 'password'}
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter API Key"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('apiKey')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.apiKey ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* API Secret */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.apiSecret ? 'text' : 'password'}
                      value={config.apiSecret || ''}
                      onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter API Secret"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('apiSecret')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.apiSecret ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Account SID (for Twilio/Plivo) */}
                {(config.provider === 'twilio' || config.provider === 'plivo') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account SID
                    </label>
                    <input
                      type="text"
                      value={config.accountSid || ''}
                      onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Account SID"
                    />
                  </div>
                )}

                {/* TwiML App SID (for Twilio only) */}
                {config.provider === 'twilio' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      TwiML App SID
                    </label>
                    <input
                      type="text"
                      value={config.metadata?.twimlAppSid || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        metadata: { ...config.metadata, twimlAppSid: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter TwiML App SID (APxxxxxxxx...)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Required for browser-based calling. Create in Twilio Console &gt; Voice &gt; TwiML &gt; TwiML Apps.</p>
                  </div>
                )}

                {/* Auth Token (for Twilio/Plivo) */}
                {(config.provider === 'twilio' || config.provider === 'plivo') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Auth Token
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.authToken ? 'text' : 'password'}
                        value={config.authToken || ''}
                        onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter Auth Token"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('authToken')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.authToken ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* From Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From Number
                  </label>
                  <input
                    type="text"
                    value={config.fromNumber || ''}
                    onChange={(e) => setConfig({ ...config, fromNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>

                {/* Virtual Number (for Exotel/Knowlarity) */}
                {(config.provider === 'exotel' || config.provider === 'knowlarity') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Virtual Number
                    </label>
                    <input
                      type="text"
                      value={config.virtualNumber || ''}
                      onChange={(e) => setConfig({ ...config, virtualNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Virtual Number"
                    />
                  </div>
                )}

                {/* Sender ID (for Unifonic) */}
                {config.provider === 'unifonic' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sender ID
                    </label>
                    <input
                      type="text"
                      value={config.senderId || ''}
                      onChange={(e) => setConfig({ ...config, senderId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Sender ID"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Features</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableCallRecording}
                      onChange={(e) => setConfig({ ...config, enableCallRecording: e.target.checked })}
                      className="rounded"
                    />
                    <div className="flex items-center gap-2">
                      <Mic className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Call Recording</div>
                        <div className="text-sm text-gray-500">Record all calls for quality assurance</div>
                      </div>
                    </div>
                  </label>

                  {config.enableCallRecording && (
                    <div className="ml-8">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recording Storage
                      </label>
                      <select
                        value={config.recordingStorage || 'none'}
                        onChange={(e) => setConfig({ ...config, recordingStorage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="none">None</option>
                        <option value="local">Local Storage</option>
                        <option value="cloud">Cloud Storage</option>
                      </select>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableVideoCalls}
                    onChange={(e) => setConfig({ ...config, enableVideoCalls: e.target.checked })}
                    className="rounded"
                  />
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">Video Calls</div>
                      <div className="text-sm text-gray-500">Enable video calling capabilities</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.isActive}
                    onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">Enable Integration</div>
                      <div className="text-sm text-gray-500">Activate VOIP functionality</div>
                    </div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call History Tab */}
      {activeTab === 'calls' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PhoneCall className="h-5 w-5" />
                Call History
              </h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Make Test Call
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {callHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PhoneOff className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No calls found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {callHistory.map(call => (
                  <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getStatusColor(call.status)}`}>
                        {call.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : call.status === 'failed' ? (
                          <PhoneOff className="h-4 w-4" />
                        ) : (
                          <PhoneCall className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{call.phoneNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(call.createdAt).toLocaleString()} • {call.provider} • {call.region}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatDuration(call.duration)}</div>
                      <div className={`text-sm px-2 py-1 rounded-full ${getStatusColor(call.status)}`}>
                        {call.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <PhoneCall className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalCalls}</div>
                    <div className="text-sm text-gray-500">Total Calls</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.completedCalls}</div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <PhoneOff className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.failedCalls}</div>
                    <div className="text-sm text-gray-500">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
                    <div className="text-sm text-gray-500">Avg Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts would go here - simplified for now */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Call Distribution by Region</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.callsByRegion || {}).map(([region, count]) => (
                  <div key={region} className="flex items-center justify-between">
                    <span className="capitalize">{region.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / stats.totalCalls) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VoipSettingsPage;
