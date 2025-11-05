import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '../constants';
import {
  ArrowLeft, ArrowRight, User, Mail, Phone, Building, Calendar,
  Edit, Tag, Star, Clock, Activity, Phone as PhoneCallIcon, 
  MessageSquare, FileText, Link as LinkIcon,
  Users, TrendingUp, Award, AlertCircle, CheckCircle, XCircle,
  MoreVertical, Trash2, Share, Eye, Plus, PhoneCall, RefreshCw
} from 'lucide-react';
import { leadService, Lead } from '../services/leadService';
import { useBusinessSettings } from '../contexts/BusinessSettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';
import TableLoader from './TableLoader';
import BackButton from './BackButton';
import { Button, Grid, GridItem, Container, Card } from './ui';
import { UI_CONFIG } from '../constants';
import LeadTransferModal from './LeadTransferModal';
import LeadCommunication from './LeadCommunication';
import LeadConversionModal from './LeadConversionModal';
import QuotationManager from './shared/QuotationManager';
import TaskManager from './shared/TaskManager';

// Call log interfaces
interface CallLog {
  id: number;
  phoneNumber: string;
  callType: 'INBOUND' | 'OUTBOUND';
  callStatus: 'INITIATED' | 'RINGING' | 'ANSWERED' | 'COMPLETED' | 'FAILED' | 'BUSY' | 'NO_ANSWER' | 'CANCELLED';
  duration?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  outcome?: string;
  isAnswered: boolean;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const LeadProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const { 
    leadSources, 
    formatCurrency, 
    getLeadSourceById,
    defaultPipeline,
    getDealStages 
  } = useBusinessSettings();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showActions, setShowActions] = useState(false);
  
  // Modal states
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  // Activities will be fetched from API
  const [activities, setActivities] = useState<any[]>([]);

  const [notes] = useState([
    {
      id: 1,
      title: 'Initial contact notes',
      content: 'Lead is very interested in our enterprise solution. They have budget approved and decision-making authority.',
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { firstName: 'John', lastName: 'Doe' }
    },
    {
      id: 2,
      title: 'Technical requirements',
      content: 'Need integration with their existing CRM system. Timeline is flexible but prefer implementation by Q2.',
      isPinned: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      author: { firstName: 'Jane', lastName: 'Smith' }
    }
  ]);

  // Dynamic data states
  const [dynamicNotes, setDynamicNotes] = useState(notes);
  const [dynamicActivities, setDynamicActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  
  // Call logs states
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [callLogsLoading, setCallLogsLoading] = useState(false);
  const [showAddCallLog, setShowAddCallLog] = useState(false);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  
  // Tasks/Next Steps states
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  // Quotations/Proposals states
  const [quotations, setQuotations] = useState<any[]>([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  
  // Form states
  const [noteForm, setNoteForm] = useState({ title: '', content: '', isPinned: false });
  const [activityForm, setActivityForm] = useState({ type: 'note', title: '', description: '' });
  const [callLogForm, setCallLogForm] = useState({
    phoneNumber: '',
    callType: 'OUTBOUND' as 'INBOUND' | 'OUTBOUND',
    notes: '',
    outcome: ''
  });
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    location: '',
    notes: ''
  });
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    assignedTo: ''
  });
  const [users, setUsers] = useState<Array<{ id: number; firstName: string; lastName: string }>>([]);

  useEffect(() => {
    if (id) {
      fetchLead(parseInt(id));
      fetchLeadActivities(parseInt(id));
      fetchTasks(parseInt(id));
      fetchFiles(parseInt(id));
      if (activeTab === 'call-logs') {
        fetchCallLogs(parseInt(id));
      }
      if (activeTab === 'proposals') {
        fetchQuotations(parseInt(id));
      }
    }
    
    // Fetch users for task assignment
    (async () => {
      try {
        const resp = await userService.getUsers({ page: 1, limit: 100 });
        const items = resp?.data?.users || resp?.data || resp?.users || [];
        setUsers(items.map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName })));
      } catch (e) {
        // ignore
      }
    })();
  }, [id, activeTab]);

  // Fetch activities for the lead
  const fetchLeadActivities = async (leadId: number) => {
    try {
      setActivitiesLoading(true);
      // Since there's no lead-specific activity endpoint, we'll show empty for now
      // In the future, you can implement /api/activities/lead/${leadId}
      setDynamicActivities([]);
    } catch (err: any) {
      console.error('Error fetching lead activities:', err);
      setDynamicActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Fetch call logs for the lead
  const fetchCallLogs = async (leadId: number) => {
    try {
      setCallLogsLoading(true);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`/api/call-logs/lead/${leadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch call logs');
      }
      
      const data = await response.json();
      setCallLogs(data.data.callLogs || []);
    } catch (err: any) {
      console.error('Error fetching call logs:', err);
      toast.error('Failed to load call logs');
    } finally {
      setCallLogsLoading(false);
    }
  };

  // Fetch tasks for the lead
  const fetchTasks = async (leadId: number) => {
    try {
      setTasksLoading(true);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`/api/tasks?entityType=lead&entityId=${leadId}&status=PENDING,IN_PROGRESS&limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      // Sort by due date and priority
      const sortedTasks = (data.data?.tasks || data.tasks || []).sort((a: any, b: any) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
      setTasks(sortedTasks);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      // Don't show error toast for tasks, just set empty array
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch quotations/proposals for the lead
  const fetchQuotations = async (leadId: number) => {
    try {
      setQuotationsLoading(true);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`/api/quotations?entityType=lead&entityId=${leadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotations');
      }
      
      const data = await response.json();
      setQuotations(data.data?.quotations || data.quotations || []);
    } catch (err: any) {
      console.error('Error fetching quotations:', err);
      setQuotations([]);
    } finally {
      setQuotationsLoading(false);
    }
  };

  const fetchLead = async (leadId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await leadService.getLeadById(leadId);
      setLead(response.data.lead || response.data || response);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to load lead';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (lead) {
      navigate(`/leads/${lead.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!lead || !confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await leadService.deleteLead(lead.id);
      toast.success('Lead deleted successfully');
      navigate('/leads');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to delete lead';
      toast.error(message);
    }
  };

  const handleTransferComplete = (updatedLead: Lead) => {
    setLead(updatedLead);
    setShowTransferModal(false);
    setShowAssignModal(false);
  };

  // Dynamic functionality methods
  const handleAddNote = () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const newNote = {
      id: Date.now(),
      title: noteForm.title,
      content: noteForm.content,
      isPinned: noteForm.isPinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { firstName: 'Current', lastName: 'User' } // You can get this from auth context
    };

    setDynamicNotes([newNote, ...dynamicNotes]);
    setNoteForm({ title: '', content: '', isPinned: false });
    setShowAddNote(false);
    toast.success('Note added successfully');

    // Add activity for note creation
    const noteActivity = {
      id: Date.now() + 1,
      type: 'note',
      title: `Added note: ${newNote.title}`,
      description: newNote.content.substring(0, 100) + (newNote.content.length > 100 ? '...' : ''),
      timestamp: new Date().toISOString(),
      author: { firstName: 'Current', lastName: 'User' }
    };
    setDynamicActivities([noteActivity, ...dynamicActivities]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    if (uploadedFiles.length === 0) return;
    
    console.log('Starting file upload, files:', uploadedFiles.length);
    console.log('Lead ID:', lead?.id);
    
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        toast.error('Please login again to upload files');
        return;
      }
      
      for (const file of uploadedFiles) {
        console.log('Uploading file:', file.name);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', 'lead');
        formData.append('entityId', lead?.id?.toString() || '');
        
        console.log('FormData - entityType:', 'lead', 'entityId:', lead?.id);
        
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Upload failed:', errorData);
          throw new Error(errorData.message || `Failed to upload ${file.name}`);
        }
        
        const responseData = await response.json();
        console.log('Upload successful, response:', responseData);
      }
      
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      
      // Refresh files list
      if (lead?.id) {
        fetchFiles(lead.id);
      }
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Failed to upload files');
    }
    
    setShowAddFile(false);
  };
  
  // Fetch files from backend
  const fetchFiles = async (leadId: number) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        console.warn('No auth token found, skipping file fetch');
        return;
      }
      
      console.log('Fetching files for lead:', leadId);
      const response = await fetch(`/api/files?entityType=lead&entityId=${leadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Files fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Files response data:', data);
        const filesList = data.data?.files || data.files || [];
        console.log('Setting files:', filesList);
        setFiles(filesList);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch files:', response.status, errorText);
        if (response.status === 403 || response.status === 401) {
          console.warn('Authentication failed when fetching files');
        }
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'call':
        // Switch to call-logs tab and initiate call
        setActiveTab('call-logs');
        setTimeout(() => handleInitiateCall(), 100);
        break;
      case 'email':
        // Switch to communication tab to compose email
        setActiveTab('communication');
        toast.info('Opening email composer...');
        break;
      case 'meeting':
        // Pre-fill meeting form with lead details
        setMeetingForm({
          ...meetingForm,
          title: `Meeting with ${lead?.firstName} ${lead?.lastName}`,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          time: '14:00'
        });
        setShowScheduleMeeting(true);
        break;
      case 'convert':
        // Open conversion modal
        setShowConversionModal(true);
        break;
    }
  };

  // Initiate call and send notification to mobile app
  const handleInitiateCall = async () => {
    if (!lead?.phone) {
      toast.error('No phone number available for this lead');
      return;
    }

    try {
      setIsInitiatingCall(true);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await fetch('/api/call-logs/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          phoneNumber: lead.phone,
          deviceToken: localStorage.getItem('fcm_token'), // For mobile notification
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to initiate call');
      }

      const data = await response.json();
      toast.success('Call initiated! Check your mobile device.');
      
      // Refresh call logs if on that tab
      if (activeTab === 'call-logs') {
        fetchCallLogs(lead.id);
      }
      
    } catch (error: any) {
      console.error('Error initiating call:', error);
      // Show user-friendly error message
      toast.error(error.message || 'Unable to initiate call. Please try manually calling.');
      // Fallback: Open phone dialer with number
      if (lead?.phone) {
        window.location.href = `tel:${lead.phone}`;
      }
    } finally {
      setIsInitiatingCall(false);
    }
  };

  // Add manual call log
  const handleAddCallLog = async () => {
    if (!callLogForm.phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch('/api/call-logs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead?.id,
          phoneNumber: callLogForm.phoneNumber,
          callType: callLogForm.callType,
          notes: callLogForm.notes,
          outcome: callLogForm.outcome,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add call log');
      }

      toast.success('Call log added successfully');
      setShowAddCallLog(false);
      setCallLogForm({ phoneNumber: '', callType: 'OUTBOUND', notes: '', outcome: '' });
      
      // Refresh call logs
      if (lead?.id) {
        fetchCallLogs(lead.id);
      }
      
    } catch (error: any) {
      console.error('Error adding call log:', error);
      toast.error('Failed to add call log');
    }
  };

  const handleDeleteNote = (noteId: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setDynamicNotes(dynamicNotes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    }
  };

  const handleTogglePinNote = (noteId: number) => {
    setDynamicNotes(dynamicNotes.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ));
    toast.success('Note updated successfully');
  };

  const handlePreviewFile = async (file: any) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const resp = await fetch(`/api/files/${file.id}/download?disposition=inline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Failed to preview file');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e: any) {
      toast.error(e.message || 'Unable to preview file');
    }
  };

  const handleDownloadFile = async (file: any) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const resp = await fetch(`/api/files/${file.id}/download?disposition=attachment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Failed to download file');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e: any) {
      toast.error(e.message || 'Unable to download file');
    }
  };

  const handleDeleteFile = async (fileId: number | string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      toast.success('File deleted successfully');
      
      // Refresh files list
      if (lead?.id) {
        fetchFiles(lead.id);
      }
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Handle lead conversion
  const resetConversionStatus = async () => {
    if (!lead) return false;
    try {
      await leadService.updateLead(lead.id, { status: 'qualified' });
      await fetchLead(lead.id);
      toast.info('Lead conversion status reset. You can try converting again.');
      return true;
    } catch (e: any) {
      console.error('Failed to reset conversion status:', e);
      toast.error(e?.response?.data?.message || 'Failed to reset conversion status');
      return false;
    }
  };

  const handleConvert = async (conversionData: any) => {
    if (!lead) return;
    
    try {
      setIsConverting(true);
      const response = await leadService.convertLead(lead.id, conversionData);
      
      toast.success('Lead converted successfully!');
      setShowConversionModal(false);
      
      // Refresh lead data
      await fetchLead(lead.id);
      
      // Navigate to the created entities
      if (response.data?.deal?.id) {
        setTimeout(() => {
          navigate(`/deals/${response.data.deal.id}`);
        }, 1500);
      } else if (response.data?.contact?.id) {
        setTimeout(() => {
          navigate(`/contacts/${response.data.contact.id}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error converting lead:', error);
      const message = error?.response?.data?.message || 'Failed to convert lead';
      // If backend blocks because already converted, offer/reset and retry once
      const alreadyConverted = /already\s*converted/i.test(message) || error?.response?.status === 409;
      if (alreadyConverted) {
        // Try forced conversion first (server may accept force=true)
        try {
          const forceRes = await leadService.convertLeadForce(lead.id, conversionData);
          toast.success('Lead converted successfully!');
          setShowConversionModal(false);
          await fetchLead(lead.id);
          if (forceRes.data?.deal?.id) {
            setTimeout(() => navigate(`/deals/${forceRes.data.deal.id}`), 1200);
          } else if (forceRes.data?.contact?.id) {
            setTimeout(() => navigate(`/contacts/${forceRes.data.contact.id}`), 1200);
          }
          return;
        } catch (forceErr: any) {
          // If force failed, fall back to resetting status then retry
          const ok = await resetConversionStatus();
          if (ok) {
            try {
              const retryRes = await leadService.convertLead(lead.id, conversionData);
              toast.success('Lead converted successfully!');
              setShowConversionModal(false);
              await fetchLead(lead.id);
              if (retryRes.data?.deal?.id) {
                setTimeout(() => navigate(`/deals/${retryRes.data.deal.id}`), 1200);
              } else if (retryRes.data?.contact?.id) {
                setTimeout(() => navigate(`/contacts/${retryRes.data.contact.id}`), 1200);
              }
              return;
            } catch (retryErr: any) {
              const m = retryErr?.response?.data?.message || 'Failed to convert lead after reset';
              toast.error(m);
            }
          } else {
            toast.error(forceErr?.response?.data?.message || message);
          }
        }
      } else {
        toast.error(message);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'contacted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'qualified': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'proposal': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'negotiation': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'closed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'lost': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Clock className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'call': return <PhoneCallIcon className="h-4 w-4 text-green-500" />;
      case 'note': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'task': return <CheckCircle className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'ANSWERED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'FAILED': case 'NO_ANSWER': case 'BUSY': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'INITIATED': case 'RINGING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCallTypeIcon = (type: string) => {
    return type === 'INBOUND' ? 
      <ArrowLeft className="h-4 w-4 text-green-500" /> : 
      <ArrowRight className="h-4 w-4 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="py-8">
            <div className="mb-8">
              <BackButton to="/leads" />
            </div>
            <div className="animate-pulse">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="py-8">
            <div className="mb-8">
              <BackButton to="/leads" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm">
              <XCircle className="h-20 w-20 text-weconnect-red mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {error || 'Lead not found'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                The lead you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button
                variant="PRIMARY"
                onClick={() => navigate('/leads')}
                className="px-8 py-3"
              >
                Back to Leads
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const leadSource = getLeadSourceById(lead.sourceId?.toString() || '');
  const dealStages = getDealStages();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Files', icon: LinkIcon },
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'call-logs', label: 'Call Logs', icon: PhoneCall },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className=" mx-auto px-6">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <BackButton to="/leads" />
              
              {/* Actions */}
              <div className="flex items-center space-x-3">
                {hasPermission('lead.update') && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 bg-weconnect-red text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Lead
                  </button>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {showActions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => {/* TODO: Implement share */}}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Share className="h-4 w-4 mr-3" />
                          Share Lead
                        </button>
                        <button
                          onClick={() => setShowAssignModal(true)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Users className="h-4 w-4 mr-3" />
                          Assign Lead
                        </button>
                        <button
                          onClick={() => setShowTransferModal(true)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ArrowRight className="h-4 w-4 mr-3" />
                          Transfer Lead
                        </button>
                        <button
                          onClick={() => {
                            setShowActions(false);
                            setShowConversionModal(true);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <TrendingUp className="h-4 w-4 mr-3" />
                          Convert Lead
                        </button>
                        <button
                          onClick={async () => {
                            setShowActions(false);
                            await resetConversionStatus();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <RefreshCw className="h-4 w-4 mr-3" />
                          Reset Conversion Status
                        </button>
                        {hasPermission('lead.delete') && (
                          <>
                            <hr className="my-1 border-gray-200 dark:border-gray-600" />
                            <button
                              onClick={handleDelete}
                              className="flex items-center w-full px-4 py-2 text-sm text-weconnect-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-3" />
                              Delete Lead
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lead Header */}
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-2xl bg-weconnect-red flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {lead.firstName} {lead.lastName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                  {lead.company && (
                    <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                      <Building className="h-4 w-4 mr-2 text-blue-500" />
                      {lead.company}
                    </span>
                  )}
                  {lead.email && (
                    <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                      <Mail className="h-4 w-4 mr-2 text-green-500" />
                      {lead.email}
                    </span>
                  )}
                  {lead.phone && (
                    <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                      <Phone className="h-4 w-4 mr-2 text-purple-500" />
                      {lead.phone}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  
                  {leadSource && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200">
                      {leadSource.name}
                    </span>
                  )}

                  {lead.assignedUser && (
                    <span className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm">
                      <User className="h-4 w-4 mr-2 text-orange-500" />
                      {lead.assignedUser.firstName} {lead.assignedUser.lastName}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200 min-w-[200px]">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Lead Score</div>
                <div className="text-4xl font-bold text-green-600 mb-2">{lead.leadScore || 0}</div>
                <div className="flex items-center justify-center mb-3">
                  <Award className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {(lead.leadScore || 0) >= 80 ? 'Hot Lead' : (lead.leadScore || 0) >= 60 ? 'Warm Lead' : (lead.leadScore || 0) >= 40 ? 'Cold Lead' : 'New Lead'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${lead.leadScore || 0}%` }}></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className=" mx-auto px-6">
        <div className="py-6 space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-weconnect-red text-weconnect-red dark:text-weconnect-red'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                {activeTab === 'overview' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Lead Information
                      </h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Created {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Email
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{lead.email}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Phone
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{lead.phone || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Company
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{lead.company || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Position
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{lead.position || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Status
                          </label>
                          <p className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Source
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {leadSource?.name || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Assigned To
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {lead.assignedUser 
                              ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}`
                              : 'Unassigned'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {lead.notes && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Notes
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                          {lead.notes}
                        </p>
                      </div>
                    )}

                    {lead.tags && lead.tags.length > 0 && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {lead.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Activity
                    </h3>
                    
                    {dynamicActivities.length > 0 ? (
                      <div className="space-y-4">
                        {dynamicActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex-shrink-0 mt-1">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {activity.title}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(activity.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                by {activity.author.firstName} {activity.author.lastName}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Activity className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">No activity found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Activity will appear here as you interact with this lead
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notes
                      </h3>
                      <button 
                        onClick={() => setShowAddNote(true)}
                        className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Add Note
                      </button>
                    </div>
                    
                    {dynamicNotes.length > 0 ? (
                      <div className="space-y-4">
                        {dynamicNotes.map((note) => (
                          <div key={note.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {note.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleTogglePinNote(note.id)}
                                  className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                    note.isPinned ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'
                                  }`}
                                >
                                  <Star className="h-4 w-4" fill={note.isPinned ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {note.content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>
                                by {note.author.firstName} {note.author.lastName}
                              </span>
                              <span>
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">No notes yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add notes to track important information about this lead
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'files' && (() => {
                  console.log('Rendering files tab, files state:', files, 'length:', files.length);
                  return (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Files & Attachments
                      </h3>
                      <label className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm cursor-pointer">
                        Upload File
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                    
                    {files.length > 0 ? (
                      <div className="space-y-3">
                        {files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                                <div className="mt-1 flex gap-3">
                                  <button
                                    onClick={() => handlePreviewFile(file)}
                                    className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                                  >
                                    Preview
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(file)}
                                    className="text-green-600 dark:text-green-400 text-xs hover:underline"
                                  >
                                    Download
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <LinkIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">No files uploaded yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Upload documents, images, or other files related to this lead
                        </p>
                      </div>
                    )}
                  </div>
                );})()}

                {activeTab === 'call-logs' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Call Logs
                      </h3>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => setShowAddCallLog(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Call Log
                        </button>
                        <button 
                          onClick={handleInitiateCall}
                          disabled={isInitiatingCall || !lead?.phone}
                          className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center disabled:opacity-50"
                        >
                          {isInitiatingCall ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Initiating...
                            </>
                          ) : (
                            <>
                              <PhoneCall className="h-4 w-4 mr-2" />
                              Call Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {callLogsLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-2 border-weconnect-red border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Loading call logs...</p>
                      </div>
                    ) : callLogs.length > 0 ? (
                      <div className="space-y-4">
                        {callLogs.map((callLog) => (
                          <div key={callLog.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {getCallTypeIcon(callLog.callType)}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {callLog.callType} Call
                                    </h4>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallStatusColor(callLog.callStatus)}`}>
                                      {callLog.callStatus.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <PhoneCallIcon className="h-4 w-4 inline mr-1" />
                                    {callLog.phoneNumber}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatDuration(callLog.duration)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(callLog.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            {callLog.notes && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-2">
                                  {callLog.notes}
                                </p>
                              </div>
                            )}
                            
                            {callLog.outcome && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outcome:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {callLog.outcome}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
                              <span>
                                by {callLog.user.firstName} {callLog.user.lastName}
                              </span>
                              <span>
                                {callLog.startTime && new Date(callLog.startTime).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <PhoneCall className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">No call logs found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Start making calls to track your communication history
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'proposals' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    {quotationsLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-2 border-weconnect-red border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Loading proposals...</p>
                      </div>
                    ) : (
                      <QuotationManager
                        entityType="lead"
                        entityId={lead.id.toString()}
                        quotations={quotations}
                        invoices={[]}
                        onRefresh={() => fetchQuotations(lead.id)}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'communication' && (
                  <LeadCommunication lead={lead} />
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('call')}
                    className="w-full flex items-center px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <PhoneCallIcon className="h-4 w-4 mr-3" />
                    Call Lead
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('email')}
                    className="w-full flex items-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-3" />
                    Send Email
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('meeting')}
                    className="w-full flex items-center px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    Schedule Meeting
                  </button>
                  
                    <button 
                      onClick={() => setShowAssignModal(true)}
                      className="w-full flex items-center px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      <Users className="h-4 w-4 mr-3" />
                      Assign Lead
                    </button>
                    
                    <button 
                      onClick={() => setShowTransferModal(true)}
                      className="w-full flex items-center px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 mr-3" />
                      Transfer Lead
                    </button>

                    <button 
                      onClick={() => setShowConversionModal(true)}
                      className="w-full flex items-center px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 mr-3" />
                      Convert Lead
                    </button>

                    <button 
                      onClick={() => setShowCreateTask(true)}
                      className="w-full flex items-center px-4 py-3 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-3" />
                      Create Task
                    </button>
                </div>
              </div>

              {/* Lead Score */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Lead Score
                </h3>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {lead.leadScore || 0}/100
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${lead.leadScore || 0}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {(lead.leadScore || 0) >= 80 ? 'Hot Lead - High conversion probability' : 
                     (lead.leadScore || 0) >= 60 ? 'Warm Lead - Good potential' : 
                     (lead.leadScore || 0) >= 40 ? 'Cold Lead - Needs nurturing' : 
                     'New Lead - Just started'}
                  </p>
                </div>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email engagement</span>
                    <span className="text-green-600 dark:text-green-400">+25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Company size</span>
                    <span className="text-green-600 dark:text-green-400">+20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Budget confirmed</span>
                    <span className="text-green-600 dark:text-green-400">+15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Multiple touchpoints</span>
                    <span className="text-green-600 dark:text-green-400">+25</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddNote(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Note</h3>
              <button 
                onClick={() => setShowAddNote(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Enter note title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Enter note content"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={noteForm.isPinned}
                  onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                  className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
                />
                <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Pin this note
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddNote(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule Meeting Modal */}
      {showScheduleMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowScheduleMeeting(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Meeting</h3>
              <button 
                onClick={() => setShowScheduleMeeting(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Enter meeting title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={meetingForm.duration}
                  onChange={(e) => setMeetingForm({ ...meetingForm, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location/Meeting Link
                </label>
                <input
                  type="text"
                  value={meetingForm.location}
                  onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Office, Zoom link, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Meeting agenda, topics to discuss, etc."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleMeeting(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!meetingForm.title || !meetingForm.date || !meetingForm.time) {
                    toast.error('Please fill in all required fields');
                    return;
                  }
                  
                  try {
                        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                    const meetingDateTime = new Date(`${meetingForm.date}T${meetingForm.time}`);
                    
                    // Create task for the meeting
                    const response = await fetch('/api/tasks', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        title: meetingForm.title,
                        description: `Meeting with ${lead?.firstName} ${lead?.lastName}\n\nLocation: ${meetingForm.location || 'TBD'}\n\nNotes: ${meetingForm.notes || 'N/A'}`,
                        entityType: 'lead',
                        entityId: lead?.id,
                        dueDate: meetingDateTime.toISOString(),
                        priority: 'HIGH',
                        status: 'PENDING',
                        notifyAt: new Date(meetingDateTime.getTime() - 15 * 60000).toISOString() // 15 min before
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to schedule meeting');
                    }
                    
                    toast.success('Meeting scheduled successfully! You will be notified 15 minutes before.');
                    setShowScheduleMeeting(false);
                    setMeetingForm({ title: '', date: '', time: '', duration: '30', location: '', notes: '' });
                    
                    // Refresh tasks
                    if (lead?.id) {
                      fetchTasks(lead.id);
                    }
                  } catch (error: any) {
                    console.error('Error scheduling meeting:', error);
                    toast.error('Failed to schedule meeting. Please try again.');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Lead Transfer Modal */}
      <LeadTransferModal
        lead={lead}
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransferComplete={handleTransferComplete}
        mode="transfer"
      />
      
      {/* Lead Assignment Modal */}
      <LeadTransferModal
        lead={lead}
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onTransferComplete={handleTransferComplete}
        mode="assign"
      />
      
      {/* Lead Conversion Modal */}
      <LeadConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        onConvert={handleConvert}
        lead={lead}
        isConverting={isConverting}
      />
      
      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateTask(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Task</h3>
              <button 
                onClick={() => setShowCreateTask(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign To
                </label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateTask(false);
                  setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!taskForm.title.trim()) {
                    toast.error('Task title is required');
                    return;
                  }
                  
                  try {
                    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                    const response = await fetch('/api/tasks', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        title: taskForm.title,
                        description: taskForm.description || undefined,
                        dueDate: taskForm.dueDate || undefined,
                        priority: taskForm.priority,
                        assignedTo: taskForm.assignedTo ? Number(taskForm.assignedTo) : undefined,
                        entityType: 'lead',
                        entityId: lead?.id,
                        status: 'PENDING',
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to create task');
                    }
                    
                    toast.success('Task created successfully!');
                    setShowCreateTask(false);
                    setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' });
                    
                    // Refresh tasks
                    if (lead?.id) {
                      fetchTasks(lead.id);
                    }
                  } catch (error: any) {
                    console.error('Error creating task:', error);
                    toast.error('Failed to create task. Please try again.');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Call Log Modal */}
      {showAddCallLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddCallLog(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Call Log</h3>
              <button 
                onClick={() => setShowAddCallLog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={callLogForm.phoneNumber}
                  onChange={(e) => setCallLogForm({ ...callLogForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder={lead?.phone || "Enter phone number"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Call Type *
                </label>
                <select
                  value={callLogForm.callType}
                  onChange={(e) => setCallLogForm({ ...callLogForm, callType: e.target.value as 'INBOUND' | 'OUTBOUND' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                >
                  <option value="OUTBOUND">Outbound</option>
                  <option value="INBOUND">Inbound</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={callLogForm.notes}
                  onChange={(e) => setCallLogForm({ ...callLogForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Add notes about the call"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Outcome
                </label>
                <input
                  type="text"
                  value={callLogForm.outcome}
                  onChange={(e) => setCallLogForm({ ...callLogForm, outcome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                  placeholder="Call outcome (e.g., Follow-up scheduled, Not interested)"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddCallLog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCallLog}
                className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors"
              >
                Add Call Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadProfile;
