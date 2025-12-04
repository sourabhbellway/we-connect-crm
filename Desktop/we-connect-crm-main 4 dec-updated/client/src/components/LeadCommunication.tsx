import React, { useState, useEffect } from 'react';
import { 
  Mail, MessageSquare, Send, Clock, CheckCircle, XCircle, 
  AlertCircle, Plus, Eye, Trash2, Edit, User, Calendar,
  Phone, Building, ArrowLeft, ArrowRight, Download, Paperclip
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
}

interface Template {
  id: number;
  name: string;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS';
  subject?: string;
  content: string;
}

interface Message {
  id: number;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS';
  direction: 'INBOUND' | 'OUTBOUND';
  subject?: string;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  templateId?: number;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface LeadCommunicationProps {
  lead: Lead;
}

const LeadCommunication: React.FC<LeadCommunicationProps> = ({ lead }) => {
  const [activeTab, setActiveTab] = useState('compose');
  const [composeType, setComposeType] = useState<'EMAIL' | 'WHATSAPP' | 'SMS'>('EMAIL');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [composeForm, setComposeForm] = useState({
    templateId: '',
    subject: '',
    content: '',
    useTemplate: false
  });

  useEffect(() => {
    fetchTemplates();
    fetchMessages();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/communications/templates', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      if (data.success && data.data?.templates) {
        setTemplates(data.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/communications/messages?leadId=${lead.id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      if (data.success) {
        const list = data.data?.messages || data.data?.items || [];
        setMessages(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (template) {
      setComposeForm({
        ...composeForm,
        templateId,
        subject: template.subject || '',
        content: template.content,
        useTemplate: true
      });
      setComposeType(template.type);
    }
  };

  const handleSendMessage = async () => {
    if (!composeForm.content.trim()) {
      toast.error('Message content is required');
      return;
    }

    if (composeType === 'EMAIL' && !composeForm.subject.trim()) {
      toast.error('Email subject is required');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userIdStr = localStorage.getItem('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : undefined;

      let url = '';
      let payload: any = {};

      if (composeType === 'EMAIL') {
        url = '/api/communications/send-email';
        payload = {
          leadId: lead.id,
          to: lead.email,
          subject: composeForm.subject,
          content: composeForm.content,
          templateId: composeForm.useTemplate && composeForm.templateId
            ? parseInt(composeForm.templateId, 10)
            : undefined,
          userId,
        };
      } else {
        // WHATSAPP and SMS both go through WhatsApp send endpoint for now
        url = '/api/communications/send-whatsapp';
        payload = {
          leadId: lead.id,
          to: lead.phone,
          content: composeForm.content,
          templateId: composeForm.useTemplate && composeForm.templateId
            ? parseInt(composeForm.templateId, 10)
            : undefined,
          userId,
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${composeType.toLowerCase()} sent successfully`);
        setComposeForm({
          templateId: '',
          subject: '',
          content: '',
          useTemplate: false
        });
        await fetchMessages(); // Refresh messages
      } else {
        throw new Error(data.message || `Failed to send ${composeType.toLowerCase()}`);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'text-blue-600 bg-blue-100';
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'READ': return 'text-purple-600 bg-purple-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <Clock className="h-4 w-4" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />;
      case 'READ': return <Eye className="h-4 w-4" />;
      case 'FAILED': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'WHATSAPP': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'SMS': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const replaceVariables = (content: string) => {
    return content
      .replace(/\{\{leadFirstName\}\}/g, lead.firstName)
      .replace(/\{\{leadLastName\}\}/g, lead.lastName)
      .replace(/\{\{leadEmail\}\}/g, lead.email)
      .replace(/\{\{leadPhone\}\}/g, lead.phone || '')
      .replace(/\{\{leadCompany\}\}/g, lead.company || '');
  };

  const filteredTemplates = templates.filter(t => t.type === composeType && t.isActive);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'compose'
                ? 'border-weconnect-red text-weconnect-red dark:text-weconnect-red'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Compose Message
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-weconnect-red text-weconnect-red dark:text-weconnect-red'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Communication History
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Send Message to {lead.firstName} {lead.lastName}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Building className="h-4 w-4" />
                <span>{lead.company || 'No Company'}</span>
              </div>
            </div>

            {/* Message Type Selection */}
            <div className="flex space-x-4">
              <button
                onClick={() => setComposeType('EMAIL')}
                disabled={!lead.email}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  composeType === 'EMAIL'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                } ${!lead.email ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
                {!lead.email && <span className="ml-2 text-xs">(No email)</span>}
              </button>
              <button
                onClick={() => setComposeType('WHATSAPP')}
                disabled={!lead.phone}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  composeType === 'WHATSAPP'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                } ${!lead.phone ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
                {!lead.phone && <span className="ml-2 text-xs">(No phone)</span>}
              </button>
              <button
                onClick={() => setComposeType('SMS')}
                disabled={!lead.phone}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  composeType === 'SMS'
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                } ${!lead.phone ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
                {!lead.phone && <span className="ml-2 text-xs">(No phone)</span>}
              </button>
            </div>

            {/* Template Selection */}
            {filteredTemplates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Use Template (Optional)
                </label>
                <select
                  value={composeForm.templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a template...</option>
                  {filteredTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject Field (Email only) */}
            {composeType === 'EMAIL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email subject"
                />
              </div>
            )}

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Content *
              </label>
              <textarea
                value={composeForm.content}
                onChange={(e) => setComposeForm({...composeForm, content: e.target.value})}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                placeholder={`Enter your ${composeType.toLowerCase()} message...`}
              />
              <div className="mt-2 text-xs text-gray-500">
                <strong>Preview with variables:</strong>
                <p className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded border text-gray-700 dark:text-gray-300">
                  {replaceVariables(composeForm.content) || 'Enter content to see preview...'}
                </p>
              </div>
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSendMessage}
                disabled={sending || !composeForm.content.trim() || (composeType === 'EMAIL' && !composeForm.subject.trim())}
                className="bg-weconnect-red text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send {composeType}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Communication History
            </h3>

            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getMessageTypeIcon(message.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {message.type} {message.direction === 'OUTBOUND' ? 'to' : 'from'} {lead.firstName}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMessageStatusColor(message.status)}`}>
                              {getMessageStatusIcon(message.status)}
                              <span className="ml-1">{message.status}</span>
                            </span>
                          </div>
                          {message.subject && (
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                              Subject: {message.subject}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {message.direction === 'OUTBOUND' ? (
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                        ) : (
                          <ArrowLeft className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.sentAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Sent by {message.user.firstName} {message.user.lastName}
                      </span>
                      <div className="flex items-center space-x-4">
                        {message.deliveredAt && (
                          <span>
                            Delivered: {new Date(message.deliveredAt).toLocaleString()}
                          </span>
                        )}
                        {message.readAt && (
                          <span>
                            Read: {new Date(message.readAt).toLocaleString()}
                          </span>
                        )}
                        {message.errorMessage && (
                          <span className="text-red-500">
                            Error: {message.errorMessage}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No communications yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start a conversation by sending an email or WhatsApp message
                </p>
                <button
                  onClick={() => setActiveTab('compose')}
                  className="mt-4 bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Send First Message
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCommunication;