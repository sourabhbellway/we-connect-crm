import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, Calendar, User, Building, TrendingUp, Edit, Trash2, Target,
  Phone, Mail, MessageSquare, CheckCircle, FileText, CreditCard, Bell,
  Activity, BarChart3, Eye, PhoneCall, Star, Plus, XCircle, Clock, AlertCircle,
  Link as LinkIcon, RotateCcw
} from 'lucide-react';
import { Button, Card } from './ui';
import BackButton from './BackButton';
import { dealService } from '../services/dealService';
import { leadService } from '../services/leadService';
import { useBusinessSettings } from '../contexts/BusinessSettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { STORAGE_KEYS } from '../constants';
import ActivityTimeline from './shared/ActivityTimeline';
import TaskManager from './shared/TaskManager';
import CommunicationCenter from './shared/CommunicationCenter';
import PaymentTracker from './shared/PaymentTracker';
import NotificationPanel from './shared/NotificationPanel';
import QuotationManager from './shared/QuotationManager';

interface Deal {
  id: string;
  title: string;
  description?: string;
  value?: number | null;
  currency: string;
  stage: string;
  status?: 'DRAFT' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  company?: string;
  companyName?: string;
  assignedToId?: string;
  assignedToName?: string;
  tags?: string[];
  notes?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  nextFollowUpAt?: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Enhanced fields
  activities?: any[];
  communications?: any[];
  followUps?: any[];
  tasks?: any[];
  quotations?: any[];
  invoices?: any[];
  payments?: any[];
  callLogs?: any[];
  notifications?: any[];
}

const DealProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatCurrency, getDealStages, getCurrency } = useBusinessSettings();
  const { user, hasPermission } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUndoingConversion, setIsUndoingConversion] = useState(false);

  // Modal and form states
  const [showAddNote, setShowAddNote] = useState(false);
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', isPinned: false });
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    location: '',
    notes: ''
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Files', icon: LinkIcon },
    { id: 'call-logs', label: 'Call Logs', icon: PhoneCall },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  useEffect(() => {
    if (id) {
      fetchDeal();
      fetchTasks(id);
    }
  }, [id]);

  const fetchDeal = async () => {
    try {
      setIsLoading(true);
      const res = await dealService.getDeal(parseInt(id!));
      const d: any = res.data;
      const mappedDeal: Deal = {
        ...d,
        id: String(d.id ?? id),
        value: Number(d.value ?? 0),
        currency: d.currency || getCurrency(),
        contactName: d.contact ? `${d.contact.firstName || ''} ${d.contact.lastName || ''}`.trim() : undefined,
        contactId: d.contact?.id ? String(d.contact.id) : undefined,
        contactEmail: d.contact?.email,
        contactPhone: d.contact?.phone,
        companyName: d.companies?.name,
        assignedToName: d.assignedUser ? `${d.assignedUser.firstName || ''} ${d.assignedUser.lastName || ''}`.trim() : undefined,
        assignedToId: d.assignedUser?.id ? String(d.assignedUser.id) : undefined,
        // lead linkage
        leadId: d.lead?.id ? String(d.lead.id) : d.leadId ? String(d.leadId) : undefined,
        // Preserve existing optional arrays if present
        activities: d.activities || [],
        communications: d.communications || [],
        followUps: d.followUps || [],
        tasks: d.tasks || [],
        quotations: d.quotations || [],
        invoices: d.invoices || [],
        payments: d.payments || [],
        callLogs: d.callLogs || [],
        notifications: d.notifications || [],
      } as Deal;
      setDeal(mappedDeal);
    } catch (error: any) {
      console.error('Failed to fetch deal:', error);
      if (error.response?.status === 404) {
        toast.error('Deal not found');
        navigate('/deals');
      } else {
        toast.error('Failed to load deal details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deal || !window.confirm('Are you sure you want to delete this deal?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await dealService.deleteDeal(parseInt(deal.id));
      toast.success('Deal deleted successfully');
      navigate('/deals');
    } catch (error) {
      console.error('Failed to delete deal:', error);
      toast.error('Failed to delete deal');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUndoConversion = async () => {
    if (!deal?.leadId) {
      toast.error('This deal is not linked to a lead');
      return;
    }

    if (!window.confirm('Are you sure you want to undo the lead conversion? This will revert the lead to its previous status and delete this deal.')) {
      return;
    }

    try {
      setIsUndoingConversion(true);
      const response = await leadService.undoConversion(parseInt(deal.leadId));

      if (response.success) {
        toast.success('Lead conversion undone successfully');
        // Navigate to the lead profile
        navigate(`/leads/${deal.leadId}`);
      } else {
        toast.error(response.message || 'Failed to undo conversion');
      }
    } catch (error: any) {
      console.error('Failed to undo conversion:', error);
      toast.error(error?.response?.data?.message || 'Failed to undo conversion');
    } finally {
      setIsUndoingConversion(false);
    }
  };

  const getStageColor = (stage: string) => {
    const stages = getDealStages();
    const stageData = stages.find(s => s.name === stage);
    return stageData?.color || '#6B7280';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PROPOSAL: 'bg-blue-100 text-blue-800',
      NEGOTIATION: 'bg-yellow-100 text-yellow-800',
      WON: 'bg-green-100 text-green-800',
      LOST: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  // Fetch tasks for the deal
  const fetchTasks = async (dealId: string) => {
    try {
      setTasksLoading(true);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`/api/tasks?entityType=deal&entityId=${dealId}&status=PENDING,IN_PROGRESS&limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      const sortedTasks = (data.data?.tasks || data.tasks || []).sort((a: any, b: any) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
      setTasks(sortedTasks);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

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
      author: { firstName: user?.firstName || 'Current', lastName: user?.lastName || 'User' }
    };
    setNotes([newNote, ...notes]);
    setNoteForm({ title: '', content: '', isPinned: false });
    setShowAddNote(false);
    toast.success('Note added successfully');
  };

  const handleTogglePinNote = (noteId: number) => {
    setNotes(notes.map(note =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ));
    toast.success('Note updated successfully');
  };

  const handleDeleteNote = (noteId: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    uploadedFiles.forEach(file => {
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: { firstName: user?.firstName || 'Current', lastName: user?.lastName || 'User' }
      };
      setFiles(prev => [...prev, newFile]);
    });
    toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
  };

  const handleDeleteFile = (fileId: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(file => file.id !== fileId));
      toast.success('File deleted successfully');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'call':
        setActiveTab('call-logs');
        toast.info('Initiating call...');
        break;
      case 'email':
        setActiveTab('communications');
        toast.info('Opening email composer...');
        break;
      case 'meeting':
        setMeetingForm({
          ...meetingForm,
          title: `Meeting for ${deal?.title}`,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: '14:00'
        });
        setShowScheduleMeeting(true);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <DollarSign size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Deal Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The deal you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/deals')}>Back to Deals</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <BackButton to="/deals" />
              <div className="flex space-x-3">
                {deal.leadId && (
                  <>
                    <Button
                      variant="SECONDARY"
                      size="SM"
                      onClick={() => navigate(`/leads/${deal.leadId}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Lead
                    </Button>
                    <Button
                      variant="SECONDARY"
                      size="SM"
                      onClick={handleUndoConversion}
                      disabled={isUndoingConversion}
                      className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    >
                      <RotateCcw size={16} />
                      {isUndoingConversion ? 'Undoing...' : 'Undo Conversion'}
                    </Button>
                  </>
                )}
                {hasPermission('deal.update') && (
                  <Button
                    variant="SECONDARY"
                    size="SM"
                    onClick={() => navigate(`/deals/${deal.id}/edit`)}
                    className="flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Deal
                  </Button>
                )}
                {hasPermission('deal.delete') && (
                  <Button
                    variant="DESTRUCTIVE"
                    size="SM"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
            </div>

            {/* Deal Header */}
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-2xl bg-weconnect-red flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {deal.title?.[0]}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {deal.title}
                </h1>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {deal.company || deal.companyName || 'No company specified'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                  {deal.companyName && (
                    <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                      <Building className="h-4 w-4 mr-2 text-blue-500" />
                      {deal.companyName}
                    </span>
                  )}
                  {deal.contactName && (
                    <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                      <User className="h-4 w-4 mr-2 text-orange-500" />
                      {deal.contactName}
                    </span>
                  )}
                  {deal.contactEmail && (
                    <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                      <Mail className="h-4 w-4 mr-2 text-green-500" />
                      {deal.contactEmail}
                    </span>
                  )}
                  {deal.contactPhone && (
                    <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                      <Phone className="h-4 w-4 mr-2 text-purple-500" />
                      {deal.contactPhone}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {deal.stage && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200">
                      {deal.stage}
                    </span>
                  )}
                  {deal.priority && (
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${deal.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        al.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          de.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-ay-100 text-gray-800'
                      }`}>
                      {deal.priority}
                    </span>
                  )}
                  {deal.assignedToName && (
                    <span className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm">
                      <User className="h-4 w-4 mr-2 text-orange-500" />
                      {deal.assignedToName}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200 min-w-[220px]">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Deal Value</div>
                <div className="text-4xl font-bold text-green-600 mb-2">{formatCurrency(deal.value || 0, deal.currency || getCurrency())}</div>
                {typeof deal.probability === 'number' && (
                  <>
                    <div className="flex items-center justify-center mb-3">
                      <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {deal.probability}% Probability
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${deal.probability}%` }}></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-4">
              {tabs.map((tab) => {
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
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deal Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Deal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Target size={18} className="mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Stage</p>
                      <p className="text-gray-900 dark:text-white">{deal.stage}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp size={18} className="mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Probability</p>
                      <p className="text-gray-900 dark:text-white">{deal.probability}%</p>
                    </div>
                  </div>
                  {deal.contactName && (
                    <div className="flex items-center">
                      <User size={18} className="mr-3 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Contact</p>
                        <p className="text-gray-900 dark:text-white">
                          {deal.contactName || '—'}
                        </p>
                      </div>
                    </div>
                  )}
                  {deal.companyName && (
                    <div className="flex items-center">
                      <Building size={18} className="mr-3 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                        <p className="text-gray-900 dark:text-white">{deal.companyName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Deal is linked to this company</p>
                      </div>
                    </div>
                  )}
                  {deal.assignedToName && (
                    <div className="flex items-center">
                      <User size={18} className="mr-3 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                        <p className="text-gray-900 dark:text-white">{deal.assignedToName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Additional Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Additional Details
                </h3>

                {deal.description && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-900 dark:text-white whitespace-pre-line">{deal.description}</p>
                    </div>
                  </div>
                )}

                {deal.tags && deal.tags.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {deal.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {deal.notes && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-900 dark:text-white whitespace-pre-line">{deal.notes}</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'activities' && (
            <ActivityTimeline
              entityType="deal"
              entityId={deal.id}
              activities={deal.activities || []}
            />
          )}

          {activeTab === 'notes' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notes
                </h3>
                <Button
                  size="SM"
                  onClick={() => setShowAddNote(true)}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Note
                </Button>
              </div>

              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {note.isPinned && <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />}
                          {note.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTogglePinNote(note.id)}
                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${note.isPinned ? 'text-yellow-500' : 'text-gray-400'
                              }`}
                          >
                            <Star className="h-4 w-4" fill={note.isPinned ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500"
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
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No notes yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Add notes to keep track of important information about this deal
                  </p>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'files' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Files & Attachments
                </h3>
                <label className="cursor-pointer">
                  <Button size="SM" as="span" className="flex items-center gap-2">
                    <Plus size={16} />
                    Upload File
                  </Button>
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
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
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
                  <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No files uploaded yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Upload documents, images, or other files related to this deal
                  </p>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'call-logs' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Call Logs
                </h3>
                <div className="flex items-center space-x-3">
                  <Button size="SM" className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Call Log
                  </Button>
                  <Button size="SM" variant="PRIMARY" className="flex items-center gap-2" disabled={!deal.contactPhone}>
                    <PhoneCall size={16} />
                    Call Now
                  </Button>
                </div>
              </div>

              {deal.callLogs && deal.callLogs.length > 0 ? (
                <div className="space-y-4">
                  {deal.callLogs.map((callLog: any) => (
                    <div key={callLog.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <PhoneCall className="h-5 w-5 text-green-500" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {callLog.callType} Call
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {callLog.phoneNumber}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(callLog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {callLog.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {callLog.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PhoneCall className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No call logs found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Start making calls to track your communication history
                  </p>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'tasks' && (
            <TaskManager
              entityType="deal"
              entityId={deal.id}
              tasks={deal.tasks || []}
            />
          )}

          {activeTab === 'communications' && (
            <CommunicationCenter
              entityType="deal"
              entityId={deal.id}
              communications={deal.communications || []}
              callLogs={deal.callLogs || []}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationManager
              entityType="deal"
              entityId={deal.id}
              quotations={deal.quotations || []}
              invoices={deal.invoices || []}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentTracker
              entityType="deal"
              entityId={deal.id}
              payments={deal.payments || []}
              invoices={deal.invoices || []}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationPanel
              entityType="deal"
              entityId={deal.id}
              notifications={deal.notifications || []}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DealProfile;
