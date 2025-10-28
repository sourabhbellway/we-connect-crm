import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Building, Calendar, Edit, Trash2, MapPin, Tag,
  MessageSquare, Clock, CheckCircle, FileText, CreditCard, Bell, Plus,
  Activity, Users, BarChart3, Settings, Filter, Download, Eye, AlertCircle, XCircle, Award,
  PhoneCall, Star, TrendingUp, ArrowRight, Link as LinkIcon
} from 'lucide-react';
import { Button, Card } from './ui';
import BackButton from './BackButton';
import { contactService } from '../services/contactService';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessSettings } from '../contexts/BusinessSettingsContext';
import { PERMISSIONS } from '../constants';
import { toast } from 'react-toastify';
import ActivityTimeline from './shared/ActivityTimeline';
import TaskManager from './shared/TaskManager';
import CommunicationCenter from './shared/CommunicationCenter';
import PaymentTracker from './shared/PaymentTracker';
import NotificationPanel from './shared/NotificationPanel';
import QuotationManager from './shared/QuotationManager';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  company?: string;
  position?: string;
  department?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  linkedinProfile?: string;
  twitterHandle?: string;
  notes?: string;
  tags?: string[];
  assignedTo?: string;
  assignedToName?: string;
  companyId?: string;
  companyName?: string;
  leadScore?: number;
  lastContactedAt?: string;
  preferredContactMethod?: string;
  timezone?: string;
  birthday?: string;
  industry?: string;
  isActive: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
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
  deals?: any[];
}

const ContactProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { formatCurrency } = useBusinessSettings();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);

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
    { id: 'deals', label: 'Deals', icon: Building },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  useEffect(() => {
    if (id) {
      fetchContact();
      fetchTasks(id);
    }
  }, [id]);

  const fetchContact = async () => {
    try {
      setIsLoading(true);
      const response = await contactService.getContact(parseInt(id!));
      setContact(response.data);
    } catch (error: any) {
      console.error('Failed to fetch contact:', error);
      if (error.response?.status === 404) {
        toast.error('Contact not found');
        navigate('/contacts');
      } else {
        toast.error('Failed to load contact details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contact || !window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await contactService.deleteContact(parseInt(contact.id));
      toast.success('Contact deleted successfully');
      navigate('/contacts');
    } catch (error: any) {
      console.error('Failed to delete contact:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete contact';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    if (score >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
  };

  // Fetch tasks for the contact
  const fetchTasks = async (contactId: string) => {
    try {
      setTasksLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/tasks?entityType=contact&entityId=${contactId}&status=PENDING,IN_PROGRESS&limit=3`, {
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
          title: `Meeting with ${contact?.firstName} ${contact?.lastName}`,
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

  if (!contact) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Contact Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The contact you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/contacts')}>Back to Contacts</Button>
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
              <BackButton to="/contacts" />
              <div className="flex space-x-3">
              {hasPermission(PERMISSIONS.CONTACT.UPDATE) && (
                <Button 
                  variant="SECONDARY"
                  size="SM"
                  onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                  className="flex items-center gap-2 hover-lift"
                >
                  <Edit size={16} />
                  Edit Contact
                </Button>
              )}
              {hasPermission(PERMISSIONS.CONTACT.DELETE) && (
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

            {/* Contact Header */}
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-2xl bg-weconnect-red flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {contact.firstName?.[0]}{contact.lastName?.[0]}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {contact.firstName} {contact.lastName}
                </h1>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {contact.position && contact.company 
                    ? `${contact.position} at ${contact.company}`
                    : contact.position || contact.company || 'Contact'}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                  <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                    <Mail className="h-4 w-4 mr-2 text-green-500" />
                    {contact.email}
                  </span>
                  {contact.phone && (
                    <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                      <Phone className="h-4 w-4 mr-2 text-purple-500" />
                      {contact.phone}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {contact.assignedToName && (
                    <span className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm">
                      <User className="h-4 w-4 mr-2 text-orange-500" />
                      {contact.assignedToName}
                    </span>
                  )}
                  {contact.isBlacklisted && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Blacklisted
                    </span>
                  )}
                  {!contact.isActive && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                      <XCircle className="h-4 w-4 mr-2" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200 min-w-[200px]">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Lead Score</div>
                <div className="text-4xl font-bold text-green-600 mb-2">{contact.leadScore ?? 0}</div>
                <div className="flex items-center justify-center mb-3">
                  <Award className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {typeof contact.leadScore === 'number' && contact.leadScore >= 80 ? 'Hot Lead' :
                     typeof contact.leadScore === 'number' && contact.leadScore >= 60 ? 'Warm Lead' :
                     typeof contact.leadScore === 'number' && contact.leadScore >= 40 ? 'Cold Lead' : 'New Contact'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${contact.leadScore ?? 0}%` }}></div>
                </div>
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
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
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
            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail size={18} className="mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white">
                      <a href={`mailto:${contact.email}`} className="hover:text-weconnect-red transition-colors">
                        {contact.email}
                      </a>
                    </p>
                  </div>
                </div>
                {contact.phone && (
                  <div className="flex items-center">
                    <Phone size={18} className="mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white">
                        <a href={`tel:${contact.phone}`} className="hover:text-weconnect-red transition-colors">
                          {contact.phone}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                {contact.alternatePhone && (
                  <div className="flex items-center">
                    <Phone size={18} className="mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Alternate Phone</p>
                      <p className="text-gray-900 dark:text-white">
                        <a href={`tel:${contact.alternatePhone}`} className="hover:text-weconnect-red transition-colors">
                          {contact.alternatePhone}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center">
                    <Building size={18} className="mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                      <p className="text-gray-900 dark:text-white">{contact.company}</p>
                    </div>
                  </div>
                )}
                {contact.position && (
                  <div className="flex items-center">
                    <User size={18} className="mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                      <p className="text-gray-900 dark:text-white">{contact.position}</p>
                    </div>
                  </div>
                )}
                {contact.department && (
                  <div className="flex items-center">
                    <Building size={18} className="mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                      <p className="text-gray-900 dark:text-white">{contact.department}</p>
                    </div>
                  </div>
                )}
                {contact.assignedToName && (
                  <div className="flex items-center">
                    <User size={18} className="mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                      <p className="text-gray-900 dark:text-white">{contact.assignedToName}</p>
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
              
              {contact.address && (
                <div className="mb-6">
                  <div className="flex items-start">
                    <MapPin size={18} className="mr-3 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-gray-900 dark:text-white whitespace-pre-line">
                        {contact.address}
                        {contact.city && (
                          <span>, {contact.city}</span>
                        )}
                        {contact.state && (
                          <span>, {contact.state}</span>
                        )}
                        {contact.zipCode && (
                          <span> {contact.zipCode}</span>
                        )}
                        {contact.country && (
                          <span>, {contact.country}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {contact.website && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</p>
                  <a 
                    href={contact.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-weconnect-red hover:underline"
                  >
                    {contact.website}
                  </a>
                </div>
              )}

              {(contact.linkedinProfile || contact.twitterHandle) && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Social Media</p>
                  <div className="space-y-2">
                    {contact.linkedinProfile && (
                      <div>
                        <a 
                          href={contact.linkedinProfile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {contact.twitterHandle && (
                      <div>
                        <a 
                          href={`https://twitter.com/${contact.twitterHandle}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          @{contact.twitterHandle}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {contact.tags && contact.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <Tag size={18} className="mr-3 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {contact.notes && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">{contact.notes}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'activities' && (
          <ActivityTimeline 
            entityType="contact"
            entityId={contact.id}
            activities={contact.activities || []}
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
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
                            note.isPinned ? 'text-yellow-500' : 'text-gray-400'
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
                  Add notes to keep track of important information about this contact
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
                  Upload documents, images, or other files related to this contact
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
                <Button size="SM" variant="PRIMARY" className="flex items-center gap-2" disabled={!contact.phone}>
                  <PhoneCall size={16} />
                  Call Now
                </Button>
              </div>
            </div>
            
            {contact.callLogs && contact.callLogs.length > 0 ? (
              <div className="space-y-4">
                {contact.callLogs.map((callLog: any) => (
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
            entityType="contact"
            entityId={contact.id}
            tasks={contact.tasks || []}
          />
        )}

        {activeTab === 'communications' && (
          <CommunicationCenter 
            entityType="contact"
            entityId={contact.id}
            communications={contact.communications || []}
            callLogs={contact.callLogs || []}
          />
        )}

        {activeTab === 'deals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Associated Deals
              </h2>
              {hasPermission('deal.create') && (
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  New Deal
                </Button>
              )}
            </div>
            {(!contact.deals || contact.deals.length === 0) ? (
              <Card className="p-8 text-center">
                <Building size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Associated Deals
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create deals for this contact to track sales opportunities.
                </p>
                {hasPermission('deal.create') && (
                  <Button>Create First Deal</Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.deals.map((deal: any) => (
                  <Card key={deal.id} className="p-4 hover:shadow-lg transition-shadow">
                    <Link to={`/deals/${deal.id}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {deal.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {deal.stage} • {deal.probability}% probability
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${deal.value?.toLocaleString()}
                      </p>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quotations' && (
          <QuotationManager 
            entityType="contact"
            entityId={contact.id}
            quotations={contact.quotations || []}
            invoices={contact.invoices || []}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentTracker 
            entityType="contact"
            entityId={contact.id}
            payments={contact.payments || []}
            invoices={contact.invoices || []}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationPanel 
            entityType="contact"
            entityId={contact.id}
            notifications={contact.notifications || []}
          />
        )}
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
                  toast.success('Meeting scheduled successfully!');
                  setShowScheduleMeeting(false);
                  setMeetingForm({ title: '', date: '', time: '', duration: '30', location: '', notes: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactProfile;
