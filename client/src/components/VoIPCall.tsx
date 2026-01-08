import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Phone, Video, Mic, MicOff, VideoOff, PhoneOff, PhoneCall, PhoneIncoming, PhoneOutgoing,
    Clock, User, Copy, Check, X, AlertCircle, ArrowLeft, ArrowRight, MoreVertical
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../services/apiClient';

interface VoIPCallProps {
    leadId?: number;
    phoneNumber?: string;
    leadName?: string;
    onClose: () => void;
    onCallComplete?: (callData: any) => void;
}

interface CallStatus {
    status: 'idle' | 'connecting' | 'ringing' | 'in_call' | 'ended' | 'failed';
    message?: string;
    errorCode?: string;
}

const VoIPCall: React.FC<VoIPCallProps> = ({ leadId, phoneNumber, leadName, onClose, onCallComplete }) => {
    const { t } = useTranslation();
    const [callStatus, setCallStatus] = useState<CallStatus>({ status: 'idle' });
    const [callType, setCallType] = useState<'audio' | 'video'>('audio');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callId, setCallId] = useState<string | null>(null);
    const [region, setRegion] = useState<'india' | 'arabic'>('india');
    const [showRegionSelector, setShowRegionSelector] = useState(false);
    const [callDetails, setCallDetails] = useState<any>(null);

    const callTimerRef = useRef<NodeJS.Timeout | null>(null);
    const callRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
            if (callStatus.status === 'in_call' || callStatus.status === 'connecting' || callStatus.status === 'ringing') {
                endCall();
            }
        };
    }, []);

    useEffect(() => {
        if (callStatus.status === 'in_call') {
            // Start call timer
            callTimerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
    }, [callStatus.status]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const startCall = async () => {
        try {
            if (!phoneNumber) {
                toast.error('Phone number is required');
                return;
            }

            setCallStatus({ status: 'connecting', message: 'Connecting to VoIP service...' });

            // 1. Initiate call on backend to get Access Token
            // Note: The correct endpoint is /communications/voip/initiate (without 'calls')
            const response = await apiClient.post('/communications/voip/initiate', {
                leadId,
                phoneNumber,
                callType,
                region,
                metadata: {
                    leadName,
                    initiatedFrom: 'web_app',
                }
            });

            if (response.data.success) {
                const { callId, token, provider } = response.data.data;
                setCallId(callId);

                if (provider === 'twilio' && token) {
                    // Dynamic Twilio Implementation
                    try {
                        // Dynamically import Twilio SDK to avoid SSR issues if any
                        const { Device } = await import('@twilio/voice-sdk');

                        const device = new Device(token, {
                            logLevel: 1,
                            // Set codec preferences if needed
                            codecPreferences: ['opus', 'pcmu'] as any
                        });

                        device.on('error', (error: any) => {
                            console.error('Twilio Device Error:', error);
                            setCallStatus({
                                status: 'failed',
                                message: 'Call connection error: ' + error.message,
                                errorCode: error.code
                            });
                        });

                        device.on('connect', (conn: any) => {
                            setCallStatus({ status: 'in_call', message: 'Call connected' });
                            callRef.current = conn;

                            conn.on('disconnect', () => {
                                setCallStatus({ status: 'ended', message: 'Call ended' });
                                callRef.current = null;
                            });
                        });

                        // Connect the call
                        // We pass the phoneNumber as a param to the TwiML app
                        await device.connect({
                            params: {
                                To: phoneNumber,
                                CallId: callId, // Pass internal call ID for webhook correlation
                                Region: region
                            }
                        });

                        setCallStatus({ status: 'ringing', message: 'Calling...' });

                    } catch (sdkError) {
                        console.error('Twilio SDK Error:', sdkError);
                        setCallStatus({
                            status: 'failed',
                            message: 'Failed to initialize voice client',
                            errorCode: 'SDK_ERROR'
                        });
                    }
                } else {
                    // Fallback to simulation if no token or provider (mock mode)
                    setCallStatus({ status: 'ringing', message: 'Calling (Mock)...' });
                    setCallDetails(response.data.data.callDetails);

                    // Simulate call being answered
                    setTimeout(() => {
                        setCallStatus({ status: 'in_call', message: 'Call connected' });
                    }, 3000);
                }

                toast.success('Call initiated successfully');
            } else {
                setCallStatus({
                    status: 'failed',
                    message: response.data.message || 'Failed to initiate call',
                    errorCode: response.data.errorCode
                });
                toast.error(response.data.message || 'Failed to initiate call');
            }
        } catch (error) {
            console.error('Error initiating call:', error);
            setCallStatus({
                status: 'failed',
                message: 'Failed to initiate call',
                errorCode: 'NETWORK_ERROR'
            });
            toast.error('Failed to initiate call');
        }
    };

    const endCall = async () => {
        try {
            if (!callId) {
                setCallStatus({ status: 'ended', message: 'Call ended' });
                return;
            }

            setCallStatus({ status: 'ended', message: 'Ending call...' });

            const response = await apiClient.post('/communications/voip/calls/end', {
                callId,
                callDuration,
                metadata: {
                    endedBy: 'user',
                }
            });

            if (response.data.success) {
                setCallStatus({ status: 'ended', message: 'Call ended' });

                // Disconnect Twilio call if active
                if (callRef.current) {
                    callRef.current.disconnect();
                    callRef.current = null;
                }

                if (onCallComplete) {
                    onCallComplete(response.data.data);
                }

                toast.success('Call ended successfully');
            } else {
                setCallStatus({
                    status: 'failed',
                    message: response.data.message || 'Failed to end call',
                    errorCode: response.data.errorCode
                });
                toast.error(response.data.message || 'Failed to end call');
            }
        } catch (error) {
            console.error('Error ending call:', error);
            setCallStatus({
                status: 'failed',
                message: 'Failed to end call',
                errorCode: 'NETWORK_ERROR'
            });
            toast.error('Failed to end call');
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // In a real implementation, this would control the actual audio stream
    };

    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        // In a real implementation, this would control the actual video stream
    };

    const copyCallId = () => {
        if (callId) {
            navigator.clipboard.writeText(callId).then(() => {
                toast.success('Call ID copied to clipboard');
            });
        }
    };

    const getStatusIcon = () => {
        switch (callStatus.status) {
            case 'idle':
                return <Phone className="h-8 w-8 text-gray-400" />;
            case 'connecting':
                return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>;
            case 'ringing':
                return <PhoneCall className="h-8 w-8 text-blue-500 animate-pulse" />;
            case 'in_call':
                return <PhoneIncoming className="h-8 w-8 text-green-500" />;
            case 'ended':
                return <PhoneOff className="h-8 w-8 text-red-500" />;
            case 'failed':
                return <AlertCircle className="h-8 w-8 text-red-500" />;
            default:
                return <Phone className="h-8 w-8 text-gray-400" />;
        }
    };

    const getStatusText = () => {
        switch (callStatus.status) {
            case 'idle':
                return 'Ready to call';
            case 'connecting':
                return callStatus.message || 'Connecting...';
            case 'ringing':
                return callStatus.message || 'Ringing...';
            case 'in_call':
                return `Call in progress - ${formatDuration(callDuration)}`;
            case 'ended':
                return callStatus.message || 'Call ended';
            case 'failed':
                return callStatus.message || 'Call failed';
            default:
                return 'Unknown status';
        }
    };

    const getStatusColor = () => {
        switch (callStatus.status) {
            case 'idle':
                return 'text-gray-600';
            case 'connecting':
                return 'text-blue-600';
            case 'ringing':
                return 'text-blue-600';
            case 'in_call':
                return 'text-green-600';
            case 'ended':
                return 'text-red-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('VoIP Call')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Call Info */}
                <div className="p-6">
                    {/* Contact Info */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {callType === 'video' ? (
                                    <Video className="h-8 w-8 text-blue-500" />
                                ) : (
                                    <Phone className="h-8 w-8 text-green-500" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                    {leadName || phoneNumber}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {phoneNumber}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowRegionSelector(!showRegionSelector)}
                                className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                {region === 'india' ? '🇮🇳 India' : '🇦🇪 Arabic'}
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Region Selector */}
                    {showRegionSelector && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Select Region')}
                            </h4>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setRegion('india');
                                        setShowRegionSelector(false);
                                    }}
                                    className={`flex-1 px-4 py-2 rounded-lg border text-sm ${region === 'india' ? 'bg-weconnect-red text-white border-weconnect-red' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                                >
                                    🇮🇳 India
                                </button>
                                <button
                                    onClick={() => {
                                        setRegion('arabic');
                                        setShowRegionSelector(false);
                                    }}
                                    className={`flex-1 px-4 py-2 rounded-lg border text-sm ${region === 'arabic' ? 'bg-weconnect-red text-white border-weconnect-red' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                                >
                                    🇦🇪 Arabic Countries
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Call Type Selector */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('Call Type')}
                        </h4>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCallType('audio')}
                                className={`flex-1 px-4 py-2 rounded-lg border text-sm flex items-center justify-center ${callType === 'audio' ? 'bg-weconnect-red text-white border-weconnect-red' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                            >
                                <Phone className="h-4 w-4 mr-2" />
                                {t('Audio Call')}
                            </button>
                            <button
                                onClick={() => setCallType('video')}
                                className={`flex-1 px-4 py-2 rounded-lg border text-sm flex items-center justify-center ${callType === 'video' ? 'bg-weconnect-red text-white border-weconnect-red' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                            >
                                <Video className="h-4 w-4 mr-2" />
                                {t('Video Call')}
                            </button>
                        </div>
                    </div>

                    {/* Call Status */}
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="mb-4">
                            {getStatusIcon()}
                        </div>
                        <p className={`text-lg font-medium ${getStatusColor()}`}>
                            {getStatusText()}
                        </p>

                        {/* Call ID */}
                        {callId && (
                            <div className="mt-4 flex items-center space-x-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Call ID: {callId}</span>
                                <button
                                    onClick={copyCallId}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* Error Message */}
                        {callStatus.status === 'failed' && callStatus.message && (
                            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-sm text-red-600 dark:text-red-300 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {callStatus.message}
                                </p>
                                {callStatus.errorCode && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                        Error Code: {callStatus.errorCode}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Call Controls */}
                    <div className="flex justify-center space-x-4 mb-6">
                        {callStatus.status === 'in_call' && (
                            <button
                                onClick={toggleMute}
                                className={`p-3 rounded-full border-2 ${isMuted ? 'bg-red-500 border-red-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}
                            >
                                {isMuted ? (
                                    <MicOff className="h-5 w-5 text-white" />
                                ) : (
                                    <Mic className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                )}
                            </button>
                        )}

                        {callStatus.status === 'in_call' && callType === 'video' && (
                            <button
                                onClick={toggleVideo}
                                className={`p-3 rounded-full border-2 ${isVideoOff ? 'bg-red-500 border-red-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}
                            >
                                {isVideoOff ? (
                                    <VideoOff className="h-5 w-5 text-white" />
                                ) : (
                                    <Video className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4">
                        {callStatus.status === 'idle' && (
                            <button
                                onClick={startCall}
                                className="bg-weconnect-red text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                            >
                                {callType === 'video' ? (
                                    <Video className="h-5 w-5 mr-2" />
                                ) : (
                                    <Phone className="h-5 w-5 mr-2" />
                                )}
                                {callType === 'video' ? 'Start Video Call' : 'Start Audio Call'}
                            </button>
                        )}

                        {(callStatus.status === 'connecting' || callStatus.status === 'ringing') && (
                            <button
                                onClick={endCall}
                                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                            >
                                <PhoneOff className="h-5 w-5 mr-2" />
                                Cancel Call
                            </button>
                        )}

                        {callStatus.status === 'in_call' && (
                            <button
                                onClick={endCall}
                                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                            >
                                <PhoneOff className="h-5 w-5 mr-2" />
                                End Call
                            </button>
                        )}

                        {(callStatus.status === 'ended' || callStatus.status === 'failed') && (
                            <button
                                onClick={onClose}
                                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                            >
                                <Check className="h-5 w-5 mr-2" />
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoIPCall;
