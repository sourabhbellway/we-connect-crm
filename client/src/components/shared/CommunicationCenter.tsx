import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, Plus, Search } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../contexts/AuthContext';

interface Communication {
  id: string;
  type: 'CALL' | 'EMAIL' | 'SMS' | 'MEETING' | 'NOTE';
  subject?: string;
  content: string;
  direction: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface CallLog {
  id: string;
  phoneNumber: string;
  callType: 'INBOUND' | 'OUTBOUND';
  duration?: number;
  startTime?: string;
  notes?: string;
  createdAt: string;
}

interface CommunicationCenterProps {
  entityType: 'lead' | 'deal' | 'contact' | 'company';
  entityId: string;
  communications: Communication[];
  callLogs: CallLog[];
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ 
  entityType, 
  entityId, 
  communications, 
  callLogs 
}) => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('communications');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Communication Center
        </h2>
        {hasPermission(`${entityType}.create`) && (
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            New Communication
          </Button>
        )}
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'communications', label: 'Communications', icon: MessageSquare },
            { id: 'calls', label: 'Call Logs', icon: Phone }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-weconnect-red text-weconnect-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'communications' && (
        <div className="space-y-4">
          {communications.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Communications Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start tracking communications to build a comprehensive history.
              </p>
              {hasPermission(`${entityType}.create`) && (
                <Button>Add Communication</Button>
              )}
            </Card>
          ) : (
            communications.map((comm) => (
              <Card key={comm.id} className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    {comm.type === 'CALL' && <Phone size={20} className="text-blue-600 dark:text-blue-300" />}
                    {comm.type === 'EMAIL' && <Mail size={20} className="text-blue-600 dark:text-blue-300" />}
                    {comm.type !== 'CALL' && comm.type !== 'EMAIL' && <MessageSquare size={20} className="text-blue-600 dark:text-blue-300" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {comm.subject || comm.type}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{comm.content}</p>
                    {comm.user && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {comm.user.firstName} {comm.user.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="space-y-4">
          {callLogs.length === 0 ? (
            <Card className="p-8 text-center">
              <Phone size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Call Logs Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Call logs will appear here when you make or receive calls.
              </p>
              {hasPermission(`${entityType}.create`) && (
                <Button>Log Call</Button>
              )}
            </Card>
          ) : (
            callLogs.map((call) => (
              <Card key={call.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Phone size={20} className={`${call.callType === 'INBOUND' ? 'text-green-600' : 'text-blue-600'}`} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {call.phoneNumber}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {call.callType} • {call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : 'No duration'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(call.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {call.notes && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{call.notes}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter;