import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff, Clock, Search, Filter, ChevronDown, ChevronUp, Download, MoreHorizontal } from 'lucide-react';
import apiClient from '../services/apiClient';
import { formatDateTime, formatDuration } from '../utils/dateUtils';

interface VoIPCallHistoryProps {
    leadId?: number;
    phoneNumber?: string;
    onCallClick?: (call: any) => void;
}

interface CallRecord {
    id: string;
    leadId: number;
    phoneNumber: string;
    callType: 'audio' | 'video';
    callStatus: 'completed' | 'missed' | 'failed' | 'in_progress';
    direction: 'inbound' | 'outbound';
    startTime: string;
    endTime: string | null;
    duration: number | null;
    region: 'india' | 'arabic';
    recordingUrl: string | null;
    createdAt: string;
    metadata: any;
}

const VoIPCallHistory: React.FC<VoIPCallHistoryProps> = ({ leadId, phoneNumber, onCallClick }) => {
    const { t } = useTranslation();
    const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        callType: 'all',
        callStatus: 'all',
        direction: 'all',
        region: 'all',
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'startTime',
        direction: 'desc',
    });
    const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCallHistory();
    }, [leadId, phoneNumber]);

    const fetchCallHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = {};
            if (leadId) params.leadId = leadId;
            if (phoneNumber) params.phoneNumber = phoneNumber;

            const response = await apiClient.get('/communications/voip/calls/history', { params });

            if (response.data.success) {
                setCallHistory(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch call history');
            }
        } catch (error) {
            console.error('Error fetching call history:', error);
            setError('Failed to fetch call history');
        } finally {
            setLoading(false);
        }
    };

    const getCallStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <PhoneOff className="h-4 w-4 text-green-500" />;
            case 'missed':
                return <PhoneMissed className="h-4 w-4 text-red-500" />;
            case 'failed':
                return <PhoneOff className="h-4 w-4 text-gray-500" />;
            case 'in_progress':
                return <Phone className="h-4 w-4 text-blue-500 animate-pulse" />;
            default:
                return <Phone className="h-4 w-4 text-gray-500" />;
        }
    };

    const getCallStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return t('Completed');
            case 'missed':
                return t('Missed');
            case 'failed':
                return t('Failed');
            case 'in_progress':
                return t('In Progress');
            default:
                return t('Unknown');
        }
    };

    const getCallStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            case 'missed':
                return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            case 'failed':
                return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
            case 'in_progress':
                return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
        }
    };

    const getDirectionIcon = (direction: string) => {
        switch (direction) {
            case 'inbound':
                return <PhoneIncoming className="h-4 w-4 text-blue-500" />;
            case 'outbound':
                return <PhoneOutgoing className="h-4 w-4 text-green-500" />;
            default:
                return <Phone className="h-4 w-4 text-gray-500" />;
        }
    };

    const getDirectionText = (direction: string) => {
        switch (direction) {
            case 'inbound':
                return t('Inbound');
            case 'outbound':
                return t('Outbound');
            default:
                return t('Unknown');
        }
    };

    const getRegionFlag = (region: string) => {
        switch (region) {
            case 'india':
                return '🇮🇳';
            case 'arabic':
                return '🇦🇪';
            default:
                return '🌍';
        }
    };

    const filteredCallHistory = callHistory
        .filter(call => {
            // Search filter
            const searchMatch = searchTerm === '' ||
                call.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (call.metadata?.leadName && call.metadata.leadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                call.id.toLowerCase().includes(searchTerm.toLowerCase());

            // Type filter
            const typeMatch = filters.callType === 'all' || call.callType === filters.callType;

            // Status filter
            const statusMatch = filters.callStatus === 'all' || call.callStatus === filters.callStatus;

            // Direction filter
            const directionMatch = filters.direction === 'all' || call.direction === filters.direction;

            // Region filter
            const regionMatch = filters.region === 'all' || call.region === filters.region;

            return searchMatch && typeMatch && statusMatch && directionMatch && regionMatch;
        })
        .sort((a, b) => {
            if (sortConfig.key === 'startTime') {
                return sortConfig.direction === 'desc'
                    ? new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
                    : new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            }
            return 0;
        });

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const toggleExpand = (callId: string) => {
        setExpandedCallId(expandedCallId === callId ? null : callId);
    };

    const downloadRecording = (recordingUrl: string) => {
        if (recordingUrl) {
            window.open(recordingUrl, '_blank');
        }
    };

    const getCallTypeText = (callType: string) => {
        return callType === 'video' ? t('Video Call') : t('Audio Call');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('Search calls...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-transparent"
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <Filter className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                        {t('Filters')}
                        {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                    </button>

                    {showFilters && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('Call Type')}
                                    </label>
                                    <select
                                        value={filters.callType}
                                        onChange={(e) => setFilters({ ...filters, callType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    >
                                        <option value="all">{t('All Types')}</option>
                                        <option value="audio">{t('Audio Call')}</option>
                                        <option value="video">{t('Video Call')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('Call Status')}
                                    </label>
                                    <select
                                        value={filters.callStatus}
                                        onChange={(e) => setFilters({ ...filters, callStatus: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    >
                                        <option value="all">{t('All Statuses')}</option>
                                        <option value="completed">{t('Completed')}</option>
                                        <option value="missed">{t('Missed')}</option>
                                        <option value="failed">{t('Failed')}</option>
                                        <option value="in_progress">{t('In Progress')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('Direction')}
                                    </label>
                                    <select
                                        value={filters.direction}
                                        onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    >
                                        <option value="all">{t('All Directions')}</option>
                                        <option value="inbound">{t('Inbound')}</option>
                                        <option value="outbound">{t('Outbound')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('Region')}
                                    </label>
                                    <select
                                        value={filters.region}
                                        onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    >
                                        <option value="all">{t('All Regions')}</option>
                                        <option value="india">{t('India')}</option>
                                        <option value="arabic">{t('Arabic Countries')}</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => {
                                        setFilters({
                                            callType: 'all',
                                            callStatus: 'all',
                                            direction: 'all',
                                            region: 'all',
                                        });
                                        setSearchTerm('');
                                    }}
                                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                                >
                                    {t('Reset Filters')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Call History Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Call ID')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Type')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Status')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Direction')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('startTime')}>
                                <div className="flex items-center">
                                    {t('Date & Time')}
                                    {sortConfig.key === 'startTime' && (
                                        sortConfig.direction === 'desc' ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronUp className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Duration')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Region')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCallHistory.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {t('No call history found')}
                                </td>
                            </tr>
                        ) : (
                            filteredCallHistory.map(call => (
                                <React.Fragment key={call.id}>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {call.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {getCallTypeText(call.callType)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCallStatusColor(call.callStatus)}`}>
                                                {getCallStatusIcon(call.callStatus)}
                                                <span className="ml-1">{getCallStatusText(call.callStatus)}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                {getDirectionIcon(call.direction)}
                                                <span className="ml-2">{getDirectionText(call.direction)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="ml-2">{formatDateTime(call.startTime)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {call.duration ? formatDuration(call.duration) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <span className="text-lg">{getRegionFlag(call.region)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center space-x-2">
                                                {call.recordingUrl && (
                                                    <button
                                                        onClick={() => downloadRecording(call.recordingUrl)}
                                                        className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                                                        title={t('Download Recording')}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => toggleExpand(call.id)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    title={t('View Details')}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Details */}
                                    {expandedCallId === call.id && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                            {t('Call Details')}
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">{t('Phone Number')}</span>
                                                                <span className="text-gray-900 dark:text-white">{call.phoneNumber}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">{t('Lead ID')}</span>
                                                                <span className="text-gray-900 dark:text-white">{call.leadId}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">{t('Call ID')}</span>
                                                                <span className="text-gray-900 dark:text-white">{call.id}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">{t('Start Time')}</span>
                                                                <span className="text-gray-900 dark:text-white">{formatDateTime(call.startTime)}</span>
                                                            </div>
                                                            {call.endTime && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500 dark:text-gray-400">{t('End Time')}</span>
                                                                    <span className="text-gray-900 dark:text-white">{formatDateTime(call.endTime)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                            {t('Additional Info')}
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            {call.metadata?.leadName && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500 dark:text-gray-400">{t('Lead Name')}</span>
                                                                    <span className="text-gray-900 dark:text-white">{call.metadata.leadName}</span>
                                                                </div>
                                                            )}
                                                            {call.metadata?.initiatedFrom && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500 dark:text-gray-400">{t('Initiated From')}</span>
                                                                    <span className="text-gray-900 dark:text-white">{call.metadata.initiatedFrom}</span>
                                                                </div>
                                                            )}
                                                            {call.metadata?.endedBy && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500 dark:text-gray-400">{t('Ended By')}</span>
                                                                    <span className="text-gray-900 dark:text-white">{call.metadata.endedBy}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {call.recordingUrl && (
                                                    <div className="mt-4">
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                            {t('Call Recording')}
                                                        </h4>
                                                        <audio
                                                            src={call.recordingUrl}
                                                            controls
                                                            className="w-full"
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('Showing {{count}} of {{total}} calls', { count: filteredCallHistory.length, total: callHistory.length })}
                    </p>
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">{t('Total Duration')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formatDuration(callHistory.reduce((sum, call) => sum + (call.duration || 0), 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoIPCallHistory;
