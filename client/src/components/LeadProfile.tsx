// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { STORAGE_KEYS } from '../constants';
// import {
//     ArrowLeft, ArrowRight, User, Mail, Phone, Building, Calendar,
//     Edit, Tag, Star, Clock, Activity, Phone as PhoneCallIcon,
//     MessageSquare, FileText, Link as LinkIcon,
//     Users, TrendingUp, CheckCircle, XCircle,
//     Trash2, Eye, Plus, PhoneCall
// } from 'lucide-react';
// import { leadService, Lead } from '../services/leadService';
// import { useBusinessSettings } from '../contexts/BusinessSettingsContext';
// import { useAuth } from '../contexts/AuthContext';
// import { toast } from 'react-toastify';
// import { userService } from '../services/userService';
// import { activityService } from '../services/activityService';
// import { notesService, Note } from '../services/notesService';
// import { tasksService } from '../services/tasksService';
// import { communicationService, Meeting } from '../services/communicationService';
// import BackButton from './BackButton';
// import { Button, Container, Card } from './ui';
// import LeadTransferModal from './LeadTransferModal';
// import LeadCommunication from './LeadCommunication';
// import LeadConversionModal from './LeadConversionModal';
// import QuotationManager from './shared/QuotationManager';
// import TaskManager from './shared/TaskManager';
// import ActivityTimeline from './shared/ActivityTimeline';

// // Call log interfaces
// interface CallLog {
//     id: number;
//     phoneNumber: string;
//     callType: 'INBOUND' | 'OUTBOUND';
//     callStatus: 'INITIATED' | 'RINGING' | 'ANSWERED' | 'COMPLETED' | 'FAILED' | 'BUSY' | 'NO_ANSWER' | 'CANCELLED';
//     duration?: number;
//     startTime?: string;
//     endTime?: string;
//     notes?: string;
//     outcome?: string;
//     isAnswered: boolean;
//     createdAt: string;
//     user: {
//         id: number;
//         firstName: string;
//         lastName: string;
//     };
// }

// const LeadProfile: React.FC = () => {
//     const { id } = useParams<{ id: string }>();
//     const navigate = useNavigate();
//     const { hasPermission, user } = useAuth();
//     const {
//         getLeadSourceById
//     } = useBusinessSettings();

//     const [lead, setLead] = useState<Lead | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [activeTab, setActiveTab] = useState('overview');

//     // Modal states
//     const [showAddNote, setShowAddNote] = useState(false);
//     const [showAddFile, setShowAddFile] = useState(false);
//     const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
//     const [showTransferModal, setShowTransferModal] = useState(false);
//     const [showAssignModal, setShowAssignModal] = useState(false);
//     const [showConversionModal, setShowConversionModal] = useState(false);
//     const [isConverting, setIsConverting] = useState(false);

//     // Activities will be fetched from API
//     const [activities, setActivities] = useState<any[]>([]);

//     // Notes state
//     const [dynamicNotes, setDynamicNotes] = useState<Note[]>([]);
//     const [notesLoading, setNotesLoading] = useState(false);
//     const [activitiesLoading, setActivitiesLoading] = useState(false);
//     const [files, setFiles] = useState<any[]>([]);

//     // Call logs states
//     const [callLogs, setCallLogs] = useState<CallLog[]>([]);
//     const [callLogsLoading, setCallLogsLoading] = useState(false);
//     const [showAddCallLog, setShowAddCallLog] = useState(false);
//     const [isInitiatingCall, setIsInitiatingCall] = useState(false);

//     // Tasks/Next Steps states
//     const [tasks, setTasks] = useState<any[]>([]);
//     const [tasksLoading, setTasksLoading] = useState(false);
//     const [tasksRefreshKey, setTasksRefreshKey] = useState(0);

//     // Quotations/Proposals states
//     const [quotations, setQuotations] = useState<any[]>([]);
//     const [quotationsLoading, setQuotationsLoading] = useState(false);

//     // Invoices states
//     const [invoices, setInvoices] = useState<any[]>([]);
//     const [invoicesLoading, setInvoicesLoading] = useState(false);

//     // Meetings states
//     const [meetings, setMeetings] = useState<Meeting[]>([]);
//     const [meetingsLoading, setMeetingsLoading] = useState(false);

//     // Form states
//     const [noteForm, setNoteForm] = useState({ title: '', content: '', isPinned: false });
//     const [callLogForm, setCallLogForm] = useState({
//         phoneNumber: '',
//         callType: 'OUTBOUND' as 'INBOUND' | 'OUTBOUND',
//         notes: '',
//         outcome: ''
//     });
//     const [meetingForm, setMeetingForm] = useState({
//         title: '',
//         date: '',
//         time: '',
//         duration: '30',
//         location: '',
//         link: '',
//         notes: ''
//     });
//     const [showCreateTask, setShowCreateTask] = useState(false);
//     const [taskForm, setTaskForm] = useState({
//         title: '',
//         description: '',
//         dueDate: '',
//         priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
//         assignedTo: ''
//     });
//     const [users, setUsers] = useState<Array<{ id: number; firstName: string; lastName: string }>>([]);

//     useEffect(() => {
//         if (id) {
//             fetchLead(parseInt(id));
//             fetchLeadActivities(parseInt(id));
//             fetchTasks(parseInt(id));
//             fetchFiles(parseInt(id));
//             fetchNotes(parseInt(id));
//             if (activeTab === 'call-logs') {
//                 fetchCallLogs(parseInt(id));
//             }
//             if (activeTab === 'proposals') {
//                 fetchQuotations(parseInt(id));
//                 fetchInvoices(parseInt(id));
//             }
//             if (activeTab === 'meetings') {
//                 fetchMeetings(parseInt(id));
//             }
//         }

//         // Fetch users for task assignment
//         (async () => {
//             try {
//                 const resp = await userService.getUsers({ page: 1, limit: 100 });
//                 const items = resp?.data?.users || resp?.data || resp?.users || [];
//                 setUsers(items.map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName })));
//             } catch (e) {
//                 // ignore
//             }
//         })();
//     }, [id, activeTab]);

//     // Fetch activities for the lead
//     const fetchLeadActivities = async (leadId: number) => {
//         try {
//             setActivitiesLoading(true);
//             const response = await activityService.getActivitiesByLeadId(leadId, 1, 100);
//             const activities = response?.data?.items || [];

//             // Transform activities to match ActivityTimeline format with detailed messages
//             const transformedActivities = activities.map((activity: any) => {
//                 // Enhance description with metadata changes if available
//                 let enhancedDescription = activity.description || '';

//                 if (activity.metadata && activity.metadata.changes && Array.isArray(activity.metadata.changes)) {
//                     // If metadata has changes array, use it for detailed description
//                     enhancedDescription = activity.metadata.changes.join(', ');
//                 } else if (activity.metadata) {
//                     // Build detailed description from metadata
//                     const metaParts: string[] = [];

//                     if (activity.metadata.oldStatus && activity.metadata.newStatus) {
//                         metaParts.push(`Status: ${String(activity.metadata.oldStatus).toLowerCase()} → ${String(activity.metadata.newStatus).toLowerCase()}`);
//                     }
//                     if (activity.metadata.oldPriority && activity.metadata.newPriority) {
//                         metaParts.push(`Priority: ${String(activity.metadata.oldPriority).toLowerCase()} → ${String(activity.metadata.newPriority).toLowerCase()}`);
//                     }
//                     if (activity.metadata.newAssignedTo && activity.metadata.oldAssignedTo !== activity.metadata.newAssignedTo) {
//                         metaParts.push('Assignment changed');
//                     }
//                     if (activity.metadata.scheduledAt) {
//                         metaParts.push(`Scheduled for ${new Date(activity.metadata.scheduledAt).toLocaleString()}`);
//                     }

//                     if (metaParts.length > 0) {
//                         enhancedDescription = metaParts.join(', ');
//                     }
//                 }

//                 return {
//                     id: String(activity.id),
//                     type: mapActivityType(activity.type),
//                     title: activity.title,
//                     description: enhancedDescription || activity.description,
//                     createdAt: activity.createdAt,
//                     isCompleted: true,
//                     user: activity.user ? {
//                         id: String(activity.user.id),
//                         firstName: activity.user.firstName || '',
//                         lastName: activity.user.lastName || '',
//                     } : undefined,
//                 };
//             });

//             setActivities(transformedActivities);
//         } catch (err: any) {
//             console.error('Error fetching lead activities:', err);
//             setActivities([]);
//         } finally {
//             setActivitiesLoading(false);
//         }
//     };

//     // Map backend ActivityType to ActivityTimeline type
//     const mapActivityType = (type: string): any => {
//         const typeMap: Record<string, any> = {
//             'TASK_CREATED': 'NOTE',
//             'TASK_UPDATED': 'NOTE',
//             'TASK_COMPLETED': 'NOTE',
//             'LEAD_UPDATED': 'NOTE',
//             'LEAD_STATUS_CHANGED': 'STAGE_CHANGED',
//             'LEAD_ASSIGNED': 'NOTE',
//             'LEAD_CONVERTED': 'STAGE_CHANGED',
//             'COMMUNICATION_LOGGED': 'MEETING',
//             'FILE_UPLOADED': 'NOTE',
//             'FILE_DELETED': 'NOTE',
//             'QUOTATION_CREATED': 'QUOTE_SENT',
//             'QUOTATION_UPDATED': 'QUOTE_SENT',
//             'INVOICE_CREATED': 'PAYMENT_RECEIVED',
//             'INVOICE_UPDATED': 'PAYMENT_RECEIVED',
//         };
//         return typeMap[type] || 'OTHER';
//     };

//     // Fetch meetings for the lead
//     const fetchMeetings = async (leadId: number) => {
//         try {
//             setMeetingsLoading(true);
//             const response = await communicationService.getMeetings(leadId);
//             console.log('Meetings response:', response);
//             const meetings = response?.data?.items || [];
//             setMeetings(meetings);
//         } catch (err: any) {
//             console.error('Error fetching meetings:', err);
//             console.error('Error details:', err?.response?.data || err?.message);
//             toast.error(err?.response?.data?.message || 'Failed to fetch meetings');
//             setMeetings([]);
//         } finally {
//             setMeetingsLoading(false);
//         }
//     };

//     // Fetch notes for the lead
//     const fetchNotes = async (leadId: number) => {
//         try {
//             setNotesLoading(true);
//             const response = await notesService.getNotesByLeadId(leadId);
//             const notes = response?.data?.notes || [];
//             setDynamicNotes(notes);
//         } catch (err: any) {
//             console.error('Error fetching notes:', err);
//             toast.error('Failed to fetch notes');
//             setDynamicNotes([]);
//         } finally {
//             setNotesLoading(false);
//         }
//     };

//     // Fetch call logs for the lead
//     const fetchCallLogs = async (leadId: number) => {
//         try {
//             setCallLogsLoading(true);
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
//             const response = await fetch(`/api/call-logs/lead/${leadId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to fetch call logs');
//             }

//             const data = await response.json();
//             setCallLogs(data.data?.callLogs || data.callLogs || []);
//         } catch (err: any) {
//             console.error('Error fetching call logs:', err);
//             toast.error('Failed to load call logs');
//         } finally {
//             setCallLogsLoading(false);
//         }
//     };

//     // Fetch tasks for the lead
//     const fetchTasks = async (leadId: number) => {
//         try {
//             setTasksLoading(true);
//             const response = await tasksService.list({
//                 entityType: 'lead',
//                 entityId: leadId.toString(),
//                 status: 'PENDING,IN_PROGRESS,COMPLETED',
//             });

//             const list = response?.data?.tasks || response?.data?.items || response?.tasks || [];
//             // Sort by due date and priority
//             const sortedTasks = list.sort((a: any, b: any) => {
//                 if (a.dueDate && b.dueDate) {
//                     return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
//                 }
//                 return 0;
//             });
//             setTasks(sortedTasks);
//         } catch (err: any) {
//             console.error('Error fetching tasks:', err);
//             // Don't show error toast for tasks, just set empty array
//             setTasks([]);
//         } finally {
//             setTasksLoading(false);
//         }
//     };

//     // Fetch quotations/proposals for the lead
//     const fetchQuotations = async (leadId: number) => {
//         try {
//             setQuotationsLoading(true);
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
//             const response = await fetch(`/api/quotations?entityType=lead&entityId=${leadId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to fetch quotations');
//             }

//             const data = await response.json();
//             setQuotations(data.data?.items || data.data?.quotations || data.quotations || []);
//         } catch (err: any) {
//             console.error('Error fetching quotations:', err);
//             setQuotations([]);
//         } finally {
//             setQuotationsLoading(false);
//         }
//     };

//     // Fetch invoices for the lead
//     const fetchInvoices = async (leadId: number) => {
//         try {
//             setInvoicesLoading(true);
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
//             const response = await fetch(`/api/invoices?entityType=lead&entityId=${leadId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to fetch invoices');
//             }

//             const data = await response.json();
//             setInvoices(data.data?.items || data.data?.invoices || data.invoices || []);
//         } catch (err: any) {
//             console.error('Error fetching invoices:', err);
//             setInvoices([]);
//         } finally {
//             setInvoicesLoading(false);
//         }
//     };

//     const fetchLead = async (leadId: number) => {
//         try {
//             setLoading(true);
//             setError(null);
//             const response = await leadService.getLeadById(leadId);
//             setLead(response.data.lead || response.data || response);
//         } catch (err: any) {
//             const message = err?.response?.data?.message || 'Failed to load lead';
//             setError(message);
//             toast.error(message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleEdit = () => {
//         if (lead) {
//             navigate(`/leads/${lead.id}/edit`);
//         }
//     };

//     const handleDelete = async () => {
//         if (!lead || !confirm('Are you sure you want to delete this lead?')) return;

//         try {
//             await leadService.deleteLead(lead.id);
//             toast.success('Lead deleted successfully');
//             navigate('/leads');
//         } catch (err: any) {
//             const message = err?.response?.data?.message || 'Failed to delete lead';
//             toast.error(message);
//         }
//     };

//     const handleTransferComplete = (updatedLead: Lead) => {
//         setLead(updatedLead);
//         setShowTransferModal(false);
//         setShowAssignModal(false);
//     };

//     // Dynamic functionality methods
//     const handleScheduleMeeting = async () => {
//         if (!meetingForm.title.trim() || !meetingForm.date || !meetingForm.time) {
//             toast.error('Please fill in all required fields');
//             return;
//         }

//         if (!lead || !user) {
//             toast.error('Lead or user information missing');
//             return;
//         }

//         try {
//             const scheduledDateTime = new Date(`${meetingForm.date}T${meetingForm.time}`);
//             let content = `Meeting scheduled with ${lead.firstName} ${lead.lastName}`;
//             if (meetingForm.location) {
//                 content += `\nLocation: ${meetingForm.location}`;
//             }
//             if (meetingForm.link) {
//                 content += `\nMeeting Link: ${meetingForm.link}`;
//             }
//             if (meetingForm.notes) {
//                 content += `\n\nNotes: ${meetingForm.notes}`;
//             }

//             const response = await communicationService.createMeeting({
//                 leadId: lead.id,
//                 userId: user.id,
//                 type: 'MEETING',
//                 subject: meetingForm.title,
//                 content: content,
//                 direction: 'outbound',
//                 duration: meetingForm.duration ? parseInt(meetingForm.duration) : undefined,
//                 scheduledAt: scheduledDateTime.toISOString(),
//             });

//             if (response.success) {
//                 toast.success('Meeting scheduled successfully');

//                 // Try to send email notification to lead
//                 try {
//                     await fetch('/api/communication/send-meeting-email', {
//                         method: 'POST',
//                         headers: {
//                             'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             leadId: lead.id,
//                             leadEmail: lead.email,
//                             meetingTitle: meetingForm.title,
//                             meetingDate: meetingForm.date,
//                             meetingTime: meetingForm.time,
//                             location: meetingForm.location,
//                             link: meetingForm.link,
//                             notes: meetingForm.notes,
//                         }),
//                     });
//                 } catch (emailErr) {
//                     console.warn('Failed to send meeting email:', emailErr);
//                 }

//                 setShowScheduleMeeting(false);
//                 setMeetingForm({
//                     title: '',
//                     date: '',
//                     time: '',
//                     duration: '30',
//                     location: '',
//                     link: '',
//                     notes: ''
//                 });

//                 // Refresh meetings and activities
//                 if (id) {
//                     fetchMeetings(parseInt(id));
//                     fetchLeadActivities(parseInt(id));
//                 }
//             }
//         } catch (error: any) {

//             toast.error(error?.response?.data?.message || 'Failed to schedule meeting');
//         }
//     };

//     const handleAddNote = async () => {
//         if (!noteForm.title.trim() || !noteForm.content.trim()) {
//             toast.error('Please fill in all fields');
//             return;
//         }

//         if (!id || !user?.id) {
//             toast.error('Invalid lead or user information');
//             return;
//         }

//         try {
//             const response = await notesService.createNote({
//                 title: noteForm.title,
//                 content: noteForm.content,
//                 isPinned: noteForm.isPinned,
//                 leadId: parseInt(id),
//                 createdBy: user.id,
//             });

//             if (response.success) {
//                 const newNote = response.data.note;
//                 setDynamicNotes([newNote, ...dynamicNotes]);
//                 setNoteForm({ title: '', content: '', isPinned: false });
//                 setShowAddNote(false);
//                 toast.success('Note added successfully');

//                 // Refresh activities to show the new note activity
//                 if (id) {
//                     fetchLeadActivities(parseInt(id));
//                 }
//             } else {
//                 toast.error(response.message || 'Failed to add note');
//             }
//         } catch (error: any) {

//             toast.error(error?.response?.data?.message || 'Failed to add note');
//         }
//     };

//     const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const uploadedFiles = Array.from(event.target.files || []);
//         if (uploadedFiles.length === 0) return;



//         try {
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

//             if (!token) {
//                 toast.error('Please login again to upload files');
//                 return;
//             }

//             for (const file of uploadedFiles) {

//                 const formData = new FormData();
//                 formData.append('file', file);
//                 formData.append('entityType', 'lead');
//                 formData.append('entityId', lead?.id?.toString() || '');



//                 const response = await fetch('/api/files/upload', {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     },
//                     body: formData,
//                 });

//                 console.log('Upload response status:', response.status);

//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({}));
//                     console.error('Upload failed:', errorData);
//                     throw new Error(errorData.message || `Failed to upload ${file.name}`);
//                 }

//                 const responseData = await response.json();
//                 console.log('Upload successful, response:', responseData);
//             }

//             toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);

//             // Refresh files list
//             if (lead?.id) {
//                 fetchFiles(lead.id);
//             }
//         } catch (error: any) {
//             console.error('Error uploading files:', error);
//             toast.error(error.message || 'Failed to upload files');
//         }

//         setShowAddFile(false);
//     };

//     // Fetch files from backend
//     const fetchFiles = async (leadId: number) => {
//         try {
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

//             if (!token) {
//                 console.warn('No auth token found, skipping file fetch');
//                 return;
//             }


//             const response = await fetch(`/api/files?entityType=lead&entityId=${leadId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });



//             if (response.ok) {
//                 const data = await response.json();
//                 console.log('Files response data:', data);
//                 const filesList = data.data?.files || data.files || [];
//                 console.log('Setting files:', filesList);
//                 setFiles(filesList);
//             } else {
//                 const errorText = await response.text();
//                 console.error('Failed to fetch files:', response.status, errorText);
//                 if (response.status === 403 || response.status === 401) {
//                     console.warn('Authentication failed when fetching files');
//                 }
//             }
//         } catch (error) {
//             console.error('Error fetching files:', error);
//         }
//     };

//     const handleQuickAction = (action: string) => {
//         switch (action) {
//             case 'call':
//                 // Switch to call-logs tab and initiate call
//                 setActiveTab('call-logs');
//                 setTimeout(() => handleInitiateCall(), 100);
//                 break;
//             case 'email':
//                 // Switch to communication tab to compose email
//                 setActiveTab('communication');
//                 toast.info('Opening email composer...');
//                 break;
//             case 'meeting':
//                 // Pre-fill meeting form with lead details
//                 setMeetingForm({
//                     ...meetingForm,
//                     title: `Meeting with ${lead?.firstName} ${lead?.lastName}`,
//                     date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
//                     time: '14:00'
//                 });
//                 setShowScheduleMeeting(true);
//                 break;
//             case 'convert':
//                 // Open conversion modal
//                 setShowConversionModal(true);
//                 break;
//         }
//     };

//     // Initiate call and send notification to mobile app

//     const handleInitiateCall = async () => {
//         if (!lead?.phone) {
//             toast.error('No phone number available for this lead');
//             return;
//         }

//         try {
//             setIsInitiatingCall(true);
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

//             // सीधे फोन डायलर खोलें
//             window.location.href = `tel:${lead.phone}`;

//             // कॉल लॉग बनाने के लिए API कॉल करें
//             const response = await fetch('/api/call-logs', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     leadId: lead.id,
//                     userId: user?.id, // यहाँ userId जोड़ें
//                     phoneNumber: lead.phone,
//                     callType: 'OUTBOUND',
//                     callStatus: 'INITIATED',
//                 }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to log call');
//             }

//             await response.json();

//             toast.success('Call initiated!');

//             // कॉल लॉग्स रीफ्रेश करें
//             if (activeTab === 'call-logs') {
//                 fetchCallLogs(lead.id);
//             }

//         } catch (error: any) {
//             console.error('Error initiating call:', error);
//             toast.error(error.message || 'Unable to log call. Please try manually calling.');
//         } finally {
//             setIsInitiatingCall(false);
//         }
//     };
//     // Add manual call log
//     const handleAddCallLog = async () => {
//         if (!callLogForm.phoneNumber.trim()) {
//             toast.error('Please enter a phone number');
//             return;
//         }

//         try {
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
//             const response = await fetch('/api/call-logs', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     leadId: lead?.id,
//                     phoneNumber: callLogForm.phoneNumber,
//                     callType: callLogForm.callType,
//                     notes: callLogForm.notes,
//                     outcome: callLogForm.outcome,
//                 }),
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to add call log');
//             }

//             toast.success('Call log added successfully');
//             setShowAddCallLog(false);
//             setCallLogForm({ phoneNumber: '', callType: 'OUTBOUND', notes: '', outcome: '' });

//             // Refresh call logs
//             if (lead?.id) {
//                 fetchCallLogs(lead.id);
//             }

//         } catch (error: any) {
//             console.error('Error adding call log:', error);
//             toast.error('Failed to add call log');
//         }
//     };

//     const handleDeleteNote = async (noteId: number) => {
//         if (!confirm('Are you sure you want to delete this note?')) {
//             return;
//         }

//         try {
//             const response = await notesService.deleteNote(noteId);
//             if (response.success) {
//                 setDynamicNotes(dynamicNotes.filter(note => note.id !== noteId));
//                 toast.success('Note deleted successfully');

//                 // Refresh activities to show the delete activity
//                 if (id) {
//                     fetchLeadActivities(parseInt(id));
//                 }
//             } else {
//                 toast.error(response.message || 'Failed to delete note');
//             }
//         } catch (error: any) {
//             console.error('Error deleting note:', error);
//             toast.error(error?.response?.data?.message || 'Failed to delete note');
//         }
//     };

//     const handleTogglePinNote = async (noteId: number) => {
//         const note = dynamicNotes.find(n => n.id === noteId);
//         if (!note) return;

//         try {
//             const response = await notesService.updateNote(noteId, {
//                 isPinned: !note.isPinned,
//             });

//             if (response.success) {
//                 setDynamicNotes(dynamicNotes.map(n =>
//                     n.id === noteId ? response.data.note : n
//                 ));
//                 toast.success('Note updated successfully');

//                 // Refresh activities to show the update activity
//                 if (id) {
//                     fetchLeadActivities(parseInt(id));
//                 }
//             } else {
//                 toast.error(response.message || 'Failed to update note');
//             }
//         } catch (error: any) {
//             console.error('Error updating note:', error);
//             toast.error(error?.response?.data?.message || 'Failed to update note');
//         }
//     };

//     const handlePreviewFile = async (file: any) => {
//         try {
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
//             const resp = await fetch(`/api/files/${file.id}/download?disposition=inline`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             if (!resp.ok) throw new Error('Failed to preview file');
//             const blob = await resp.blob();
//             const url = URL.createObjectURL(blob);
//             window.open(url, '_blank');
//             setTimeout(() => URL.revokeObjectURL(url), 30000);
//         } catch (e: any) {
//             toast.error(e.message || 'Unable to preview file');
//         }
//     };

//     const handleDownloadFile = async (file: any) => {
//         try {
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
//             const resp = await fetch(`/api/files/${file.id}/download?disposition=attachment`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             if (!resp.ok) throw new Error('Failed to download file');
//             const blob = await resp.blob();
//             const url = URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = file.name || 'download';
//             document.body.appendChild(a);
//             a.click();
//             a.remove();
//             setTimeout(() => URL.revokeObjectURL(url), 30000);
//         } catch (e: any) {
//             toast.error(e.message || 'Unable to download file');
//         }
//     };

//     const handleDeleteFile = async (fileId: number | string) => {
//         if (!confirm('Are you sure you want to delete this file?')) return;

//         try {
//             const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
//             const response = await fetch(`/api/files/${fileId}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to delete file');
//             }

//             toast.success('File deleted successfully');

//             // Refresh files list
//             if (lead?.id) {
//                 fetchFiles(lead.id);
//             }
//         } catch (error: any) {
//             console.error('Error deleting file:', error);
//             toast.error('Failed to delete file');
//         }
//     };

//     // Handle lead conversion
//     const resetConversionStatus = async () => {
//         if (!lead) return false;
//         try {
//             await leadService.updateLead(lead.id, { status: 'qualified' });
//             await fetchLead(lead.id);
//             toast.info('Lead conversion status reset. You can try converting again.');
//             return true;
//         } catch (e: any) {
//             console.error('Failed to reset conversion status:', e);
//             toast.error(e?.response?.data?.message || 'Failed to reset conversion status');
//             return false;
//         }
//     };

//     const handleConvert = async (conversionData: any) => {
//         if (!lead) return;

//         try {
//             setIsConverting(true);
//             const response = await leadService.convertLead(lead.id, conversionData);

//             toast.success('Lead converted successfully!');
//             setShowConversionModal(false);

//             // Refresh lead data
//             await fetchLead(lead.id);

//             // Navigate to the created entities
//             if (response.data?.deal?.id) {
//                 setTimeout(() => {
//                     navigate(`/deals/${response.data.deal.id}`);
//                 }, 1500);
//             }
//         } catch (error: any) {
//             console.error('Error converting lead:', error);
//             const message = error?.response?.data?.message || 'Failed to convert lead';
//             // If backend blocks because already converted, offer/reset and retry once
//             const alreadyConverted = /already\s*converted/i.test(message) || error?.response?.status === 409;
//             if (alreadyConverted) {
//                 // Try forced conversion first (server may accept force=true)
//                 try {
//                     const forceRes = await leadService.convertLeadForce(lead.id, conversionData);
//                     toast.success('Lead converted successfully!');
//                     setShowConversionModal(false);
//                     await fetchLead(lead.id);
//                     if (forceRes.data?.deal?.id) {
//                         setTimeout(() => navigate(`/deals/${forceRes.data.deal.id}`), 1200);
//                     }
//                     return;
//                 } catch (forceErr: any) {
//                     // If force failed, fall back to resetting status then retry
//                     const ok = await resetConversionStatus();
//                     if (ok) {
//                         try {
//                             const retryRes = await leadService.convertLead(lead.id, conversionData);
//                             toast.success('Lead converted successfully!');
//                             setShowConversionModal(false);
//                             await fetchLead(lead.id);
//                             if (retryRes.data?.deal?.id) {
//                                 setTimeout(() => navigate(`/deals/${retryRes.data.deal.id}`), 1200);
//                             }
//                             return;
//                         } catch (retryErr: any) {
//                             const m = retryErr?.response?.data?.message || 'Failed to convert lead after reset';
//                             toast.error(m);
//                         }
//                     } else {
//                         toast.error(forceErr?.response?.data?.message || message);
//                     }
//                 }
//             } else {
//                 toast.error(message);
//             }
//         } finally {
//             setIsConverting(false);
//         }
//     };

//     const getStatusColor = (status: string) => {
//         const statusColors: Record<string, string> = {
//             'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
//             'contacted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
//             'qualified': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
//             'proposal': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
//             'negotiation': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
//             'closed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
//             'lost': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
//         };
//         return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
//     };

//     const handleStatusChange = async (newStatus: string) => {
//         if (!lead) return;
//         try {
//             await leadService.updateLead(lead.id, { status: newStatus });
//             setLead({ ...lead, status: newStatus });
//             toast.success('Lead status updated successfully');
//         } catch (error) {
//             console.error('Failed to update lead status:', error);
//             toast.error((error as any)?.response?.data?.message || 'Failed to update lead status');
//         }
//     };


//     const getCallStatusColor = (status: string) => {
//         switch (status) {
//             case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
//             case 'ANSWERED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
//             case 'FAILED': case 'NO_ANSWER': case 'BUSY': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
//             case 'INITIATED': case 'RINGING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
//             case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
//             default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
//         }
//     };

//     const formatDuration = (seconds?: number) => {
//         if (!seconds) return 'N/A';
//         const minutes = Math.floor(seconds / 60);
//         const remainingSeconds = seconds % 60;
//         return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//     };

//     const getCallTypeIcon = (type: string) => {
//         return type === 'INBOUND' ?
//             <ArrowLeft className="h-4 w-4 text-green-500" /> :
//             <ArrowRight className="h-4 w-4 text-blue-500" />;
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//                 <Container>
//                     <div className="py-8">
//                         <div className="mb-8">
//                             <BackButton to="/leads" />
//                         </div>
//                         <div className="animate-pulse">
//                             <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
//                                 <div className="flex items-center space-x-6 mb-6">
//                                     <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
//                                     <div className="flex-1">
//                                         <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
//                                         <div className="space-y-2">
//                                             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
//                                             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                                     <div className="lg:col-span-2">
//                                         <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
//                                     </div>
//                                     <div className="space-y-4">
//                                         <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
//                                         <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </Container>
//             </div>
//         );
//     }

//     if (error || !lead) {
//         return (
//             <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//                 <Container>
//                     <div className="py-8">
//                         <div className="mb-8">
//                             <BackButton to="/leads" />
//                         </div>
//                         <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm">
//                             <XCircle className="h-20 w-20 text-weconnect-red mx-auto mb-6" />
//                             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//                                 {error || 'Lead not found'}
//                             </h2>
//                             <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
//                                 The lead you're looking for doesn't exist or you don't have permission to view it.
//                             </p>
//                             <Button
//                                 variant="PRIMARY"
//                                 onClick={() => navigate('/leads')}
//                                 className="px-8 py-3"
//                             >
//                                 Back to Leads
//                             </Button>
//                         </div>
//                     </div>
//                 </Container>
//             </div>
//         );
//     }

//     // Use source from API if available, otherwise fallback to context
//     const leadSource = lead?.source || getLeadSourceById(lead?.sourceId?.toString() || '');

//     const tabs = [
//         { id: 'overview', label: 'Overview', icon: Eye },
//         { id: 'activity', label: 'Activity', icon: Activity },
//         { id: 'notes', label: 'Notes', icon: FileText },
//         { id: 'files', label: 'Files', icon: LinkIcon },
//         { id: 'proposals', label: 'Proposals', icon: FileText },
//         { id: 'call-logs', label: 'Call Logs', icon: PhoneCall },
//         { id: 'meetings', label: 'Meetings', icon: Calendar },
//         { id: 'tasks', label: 'Tasks', icon: CheckCircle },
//         { id: 'communication', label: 'Communication', icon: MessageSquare },
//     ];

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//             {/* Header - Compact */}
//             <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
//                 <div className="mx-auto px-6">
//                     <div className="py-4">
//                         <div className="flex items-center justify-end mb-4">
//                             {/* Actions */}
//                             <div className="flex items-center space-x-2">
//                                 {hasPermission('lead.update') && (
//                                     <button
//                                         onClick={handleEdit}
//                                         className="flex items-center px-3 py-1.5 bg-weconnect-red text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
//                                     >
//                                         <Edit className="h-4 w-4 mr-1.5" />
//                                         Edit
//                                     </button>
//                                 )}
//                                 <BackButton to="/leads" />
//                             </div>
//                         </div>

//                         {/* Lead Header - Compact */}
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-4">
//                                 {/* Avatar */}
//                                 <div className="flex-shrink-0">
//                                     <div className="h-14 w-14 rounded-xl bg-weconnect-red flex items-center justify-center shadow-lg">
//                                         <span className="text-white font-bold text-xl">
//                                             {lead.firstName[0]}{lead.lastName[0]}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 {/* Info */}
//                                 <div className="flex-1">
//                                     <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
//                                         {lead.firstName} {lead.lastName}
//                                     </h1>

//                                     <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
//                                         {lead.company && (
//                                             <span className="flex items-center">
//                                                 <Building className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
//                                                 {lead.company}
//                                             </span>
//                                         )}
//                                         {lead.email && (
//                                             <span className="flex items-center">
//                                                 <Mail className="h-3.5 w-3.5 mr-1.5 text-green-500" />
//                                                 {lead.email}
//                                             </span>
//                                         )}
//                                         {lead.phone && (
//                                             <span className="flex items-center">
//                                                 <Phone className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
//                                                 {lead.phone}
//                                             </span>
//                                         )}
//                                     </div>

//                                     <div className="flex flex-wrap items-center gap-2">
//                                         {/* Status Dropdown */}
//                                         <select
//                                             value={lead.status}
//                                             onChange={(e) => handleStatusChange(e.target.value)}
//                                             className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(lead.status)}`}
//                                         >
//                                             <option value="new">New</option>
//                                             <option value="contacted">Contacted</option>
//                                             <option value="qualified">Qualified</option>
//                                             <option value="proposal">Proposal</option>
//                                             <option value="negotiation">Negotiation</option>
//                                             <option value="closed">Closed</option>
//                                             <option value="lost">Lost</option>
//                                             <option value="converted">Converted</option>
//                                         </select>

//                                         {leadSource && (
//                                             <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
//                                                 {leadSource.name}
//                                             </span>
//                                         )}

//                                         {lead.assignedUser && (
//                                             <span className="flex items-center px-2.5 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs">
//                                                 <User className="h-3 w-3 mr-1.5 text-orange-500" />
//                                                 {lead.assignedUser.firstName} {lead.assignedUser.lastName}
//                                             </span>
//                                         )}

//                                         {/* Lead Score - Only show if filled */}
//                                         {lead.leadScore !== null && lead.leadScore !== undefined && lead.leadScore > 0 && (
//                                             <div className="flex items-center px-2.5 py-1 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
//                                                 <TrendingUp className="h-3 w-3 mr-1.5 text-green-600 dark:text-green-400" />
//                                                 <span className="text-xs font-semibold text-green-600 dark:text-green-400">
//                                                     Score: {lead.leadScore}/10
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Quick Actions in Header */}
//                             <div className="flex items-center gap-2">
//                                 <button
//                                     onClick={() => handleQuickAction('call')}
//                                     className="flex items-center px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
//                                     title="Call Lead"
//                                 >
//                                     <PhoneCallIcon className="h-4 w-4 mr-1.5" />
//                                     Call
//                                 </button>

//                                 <button
//                                     onClick={() => handleQuickAction('email')}
//                                     className="flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
//                                     title="Send Email"
//                                 >
//                                     <Mail className="h-4 w-4 mr-1.5" />
//                                     Email
//                                 </button>

//                                 <button
//                                     onClick={() => handleQuickAction('meeting')}
//                                     className="flex items-center px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm"
//                                     title="Schedule Meeting"
//                                 >
//                                     <Calendar className="h-4 w-4 mr-1.5" />
//                                     Meeting
//                                 </button>

//                                 <button
//                                     onClick={() => setShowCreateTask(true)}
//                                     className="flex items-center px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-sm"
//                                     title="Create Task"
//                                 >
//                                     <CheckCircle className="h-4 w-4 mr-1.5" />
//                                     Task
//                                 </button>

//                                 <button
//                                     onClick={() => setShowAssignModal(true)}
//                                     className="flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm"
//                                     title="Assign Lead"
//                                 >
//                                     <Users className="h-4 w-4 mr-1.5" />
//                                     Assign
//                                 </button>

//                                 <button
//                                     onClick={() => setShowConversionModal(true)}
//                                     className="flex items-center px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-sm"
//                                     title="Convert Lead"
//                                 >
//                                     <TrendingUp className="h-4 w-4 mr-1.5" />
//                                     Convert
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="mx-auto px-6 py-6">
//                 <div className="space-y-6">
//                     {/* Tabs - Compact */}
//                     <div className="border-b border-gray-200 dark:border-gray-700">
//                         <nav className="-mb-px flex space-x-6 overflow-x-auto">
//                             {tabs.map((tab) => {
//                                 const Icon = tab.icon;
//                                 return (
//                                     <button
//                                         key={tab.id}
//                                         onClick={() => setActiveTab(tab.id)}
//                                         className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
//                                             ? 'border-weconnect-red text-weconnect-red dark:text-weconnect-red'
//                                             : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
//                                             }`}
//                                     >
//                                         <Icon className="h-4 w-4 mr-1.5" />
//                                         {tab.label}
//                                     </button>
//                                 );
//                             })}
//                         </nav>
//                     </div>

//                     {/* Tab Content - Full Width */}
//                     <div>
//                         {activeTab === 'overview' && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                 <div className="flex items-center justify-between mb-6">
//                                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                         Lead Details
//                                     </h3>
//                                     <div className="text-sm text-gray-500 dark:text-gray-400">
//                                         Created {new Date(lead.createdAt).toLocaleDateString()}
//                                     </div>
//                                 </div>

//                                 {/* 4 Column Grid */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                                     {/* Column 1 */}
//                                     <div className="space-y-4">
//                                         {lead.position && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Position
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">{lead.position}</p>
//                                             </div>
//                                         )}

//                                         {lead.website && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Website
//                                                 </label>
//                                                 <p className="text-sm">
//                                                     <a
//                                                         href={lead.website.startsWith('http://') || lead.website.startsWith('https://') ? lead.website : `https://${lead.website}`}
//                                                         target="_blank"
//                                                         rel="noopener noreferrer"
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             const url = lead.website?.startsWith('http://') || lead.website?.startsWith('https://')
//                                                                 ? lead.website
//                                                                 : `https://${lead.website}`;
//                                                             window.open(url, '_blank', 'noopener,noreferrer');
//                                                         }}
//                                                         className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
//                                                     >
//                                                         {lead.website}
//                                                     </a>
//                                                 </p>
//                                             </div>
//                                         )}

//                                         {lead.industry && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Industry
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">{lead.industry}</p>
//                                             </div>
//                                         )}

//                                         {lead.address && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Address
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">{lead.address}</p>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Column 2 */}
//                                     <div className="space-y-4">
//                                         {(lead.city || lead.state || lead.country) && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Location
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">
//                                                     {[lead.city, lead.state, lead.country].filter(Boolean).join(', ') || 'N/A'}
//                                                 </p>
//                                             </div>
//                                         )}

//                                         {lead.zipCode && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Zip Code
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">{lead.zipCode}</p>
//                                             </div>
//                                         )}

//                                         {lead.companySize && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Company Size
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">{lead.companySize} employees</p>
//                                             </div>
//                                         )}

//                                         {lead.annualRevenue && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Annual Revenue
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">
//                                                     {lead.currency || 'USD'} {Number(lead.annualRevenue).toLocaleString()}
//                                                 </p>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Column 3 */}
//                                     <div className="space-y-4">
//                                         {lead.priority && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Priority
//                                                 </label>
//                                                 <p>
//                                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
//                                                         lead.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
//                                                             lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
//                                                                 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
//                                                         }`}>
//                                                         {lead.priority}
//                                                     </span>
//                                                 </p>
//                                             </div>
//                                         )}

//                                         {lead.budget && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Budget
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">
//                                                     {lead.currency || 'USD'} {Number(lead.budget).toLocaleString()}
//                                                 </p>
//                                             </div>
//                                         )}

//                                         {lead.preferredContactMethod && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Preferred Contact
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white capitalize">
//                                                     {lead.preferredContactMethod}
//                                                 </p>
//                                             </div>
//                                         )}

//                                         {lead.timezone && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Timezone
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">{lead.timezone}</p>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Column 4 */}
//                                     <div className="space-y-4">
//                                         {lead.linkedinProfile && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     LinkedIn
//                                                 </label>
//                                                 <p className="text-sm">
//                                                     <a
//                                                         href={lead.linkedinProfile.startsWith('http://') || lead.linkedinProfile.startsWith('https://') ? lead.linkedinProfile : `https://${lead.linkedinProfile}`}
//                                                         target="_blank"
//                                                         rel="noopener noreferrer"
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             const url = lead.linkedinProfile?.startsWith('http://') || lead.linkedinProfile?.startsWith('https://')
//                                                                 ? lead.linkedinProfile
//                                                                 : `https://${lead.linkedinProfile}`;
//                                                             window.open(url, '_blank', 'noopener,noreferrer');
//                                                         }}
//                                                         className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
//                                                     >
//                                                         {lead.linkedinProfile}
//                                                     </a>
//                                                 </p>
//                                             </div>
//                                         )}

//                                         {lead.lastContactedAt && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Last Contacted
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">
//                                                     {new Date(lead.lastContactedAt).toLocaleDateString()}<br />
//                                                     <span className="text-xs text-gray-500">{new Date(lead.lastContactedAt).toLocaleTimeString()}</span>
//                                                 </p>
//                                             </div>
//                                         )}

//                                         {lead.nextFollowUpAt && (
//                                             <div>
//                                                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
//                                                     Next Follow-up
//                                                 </label>
//                                                 <p className="text-sm text-gray-900 dark:text-white">
//                                                     {new Date(lead.nextFollowUpAt).toLocaleDateString()}<br />
//                                                     <span className="text-xs text-gray-500">{new Date(lead.nextFollowUpAt).toLocaleTimeString()}</span>
//                                                 </p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {lead.notes && (
//                                     <div className="mt-6">
//                                         <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
//                                             Notes
//                                         </label>
//                                         <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-md p-3">
//                                             {lead.notes}
//                                         </p>
//                                     </div>
//                                 )}

//                                 {lead.tags && lead.tags.length > 0 && (
//                                     <div className="mt-6">
//                                         <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
//                                             Tags
//                                         </label>
//                                         <div className="flex flex-wrap gap-2">
//                                             {lead.tags.map((leadTag: any) => {
//                                                 const tag = leadTag.tag || leadTag;
//                                                 return (
//                                                     <span
//                                                         key={tag.id || leadTag.id}
//                                                         className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
//                                                         style={{ backgroundColor: (tag.color || '#3B82F6') + '20', color: tag.color || '#3B82F6' }}
//                                                     >
//                                                         <Tag className="h-3 w-3 mr-1" />
//                                                         {tag.name || leadTag.name}
//                                                     </span>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === 'activity' && (
//                             activitiesLoading ? (
//                                 <Card className="p-6">
//                                     <div className="flex items-center justify-center py-12">
//                                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
//                                     </div>
//                                 </Card>
//                             ) : (
//                                 <ActivityTimeline
//                                     entityType="lead"
//                                     entityId={id || ''}
//                                     activities={activities}
//                                 />
//                             )
//                         )}

//                         {activeTab === 'notes' && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                 <div className="flex items-center justify-between mb-4">
//                                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                         Notes
//                                     </h3>
//                                     <button
//                                         onClick={() => setShowAddNote(true)}
//                                         className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
//                                     >
//                                         Add Note
//                                     </button>
//                                 </div>

//                                 {notesLoading ? (
//                                     <div className="flex items-center justify-center py-12">
//                                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
//                                     </div>
//                                 ) : dynamicNotes.length > 0 ? (
//                                     <div className="space-y-4">
//                                         {dynamicNotes.map((note) => (
//                                             <div key={note.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                                                 <div className="flex items-start justify-between mb-2">
//                                                     <h4 className="font-medium text-gray-900 dark:text-white">
//                                                         {note.title}
//                                                     </h4>
//                                                     <div className="flex items-center space-x-2">
//                                                         <button
//                                                             onClick={() => handleTogglePinNote(note.id)}
//                                                             className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${note.isPinned ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'
//                                                                 }`}
//                                                         >
//                                                             <Star className="h-4 w-4" fill={note.isPinned ? 'currentColor' : 'none'} />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => handleDeleteNote(note.id)}
//                                                             className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500 hover:text-red-500"
//                                                         >
//                                                             <Trash2 className="h-4 w-4" />
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
//                                                     {note.content}
//                                                 </p>
//                                                 <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
//                                                     <span>
//                                                         by {note.user ? `${note.user.firstName} ${note.user.lastName}` : 'Unknown User'}
//                                                     </span>
//                                                     <span>
//                                                         {new Date(note.createdAt).toLocaleDateString()}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div className="text-center py-12">
//                                         <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
//                                         <p className="text-gray-600 dark:text-gray-400 mb-2">No notes yet</p>
//                                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                                             Add notes to track important information about this lead
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === 'files' && (() => {
//                             console.log('Rendering files tab, files state:', files, 'length:', files.length);
//                             return (
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                     <div className="flex items-center justify-between mb-4">
//                                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                             Files & Attachments
//                                         </h3>
//                                         <label className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm cursor-pointer">
//                                             Upload File
//                                             <input
//                                                 type="file"
//                                                 multiple
//                                                 className="hidden"
//                                                 onChange={handleFileUpload}
//                                             />
//                                         </label>
//                                     </div>

//                                     {files.length > 0 ? (
//                                         <div className="space-y-3">
//                                             {files.map((file) => (
//                                                 <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                                                     <div className="flex items-center space-x-3">
//                                                         <FileText className="h-5 w-5 text-blue-500" />
//                                                         <div>
//                                                             <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
//                                                             <p className="text-xs text-gray-500 dark:text-gray-400">
//                                                                 {(file.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.createdAt).toLocaleDateString()}
//                                                             </p>
//                                                             <div className="mt-1 flex gap-3">
//                                                                 <button
//                                                                     onClick={() => handlePreviewFile(file)}
//                                                                     className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
//                                                                 >
//                                                                     Preview
//                                                                 </button>
//                                                                 <button
//                                                                     onClick={() => handleDownloadFile(file)}
//                                                                     className="text-green-600 dark:text-green-400 text-xs hover:underline"
//                                                                 >
//                                                                     Download
//                                                                 </button>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                     <button
//                                                         onClick={() => handleDeleteFile(file.id)}
//                                                         className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500"
//                                                     >
//                                                         <Trash2 className="h-4 w-4" />
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     ) : (
//                                         <div className="text-center py-12">
//                                             <LinkIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
//                                             <p className="text-gray-600 dark:text-gray-400 mb-2">No files uploaded yet</p>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                                 Upload documents, images, or other files related to this lead
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             );
//                         })()}

//                         {activeTab === 'call-logs' && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                 <div className="flex items-center justify-between mb-4">
//                                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                         Call Logs
//                                     </h3>
//                                     <div className="flex items-center space-x-3">
//                                         <button
//                                             onClick={() => {
//                                                 setCallLogForm({
//                                                     ...callLogForm,
//                                                     phoneNumber: lead?.phone || ''
//                                                 });
//                                                 setShowAddCallLog(true);
//                                             }}
//                                             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
//                                         >
//                                             <Plus className="h-4 w-4 mr-2" />
//                                             Add Call Log
//                                         </button>
//                                         <button
//                                             onClick={handleInitiateCall}
//                                             disabled={isInitiatingCall || !lead?.phone}
//                                             className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center disabled:opacity-50"
//                                         >
//                                             {isInitiatingCall ? (
//                                                 <>
//                                                     <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
//                                                     Initiating...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <PhoneCall className="h-4 w-4 mr-2" />
//                                                     Call Now
//                                                 </>
//                                             )}
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {callLogsLoading ? (
//                                     <div className="text-center py-12">
//                                         <div className="animate-spin h-8 w-8 border-2 border-weconnect-red border-t-transparent rounded-full mx-auto mb-4" />
//                                         <p className="text-gray-600 dark:text-gray-400">Loading call logs...</p>
//                                     </div>
//                                 ) : callLogs.length > 0 ? (
//                                     <div className="space-y-4">
//                                         {callLogs.map((callLog) => (
//                                             <div key={callLog.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
//                                                 <div className="flex items-start justify-between mb-3">
//                                                     <div className="flex items-center space-x-3">
//                                                         <div className="flex-shrink-0">
//                                                             {getCallTypeIcon(callLog.callType)}
//                                                         </div>
//                                                         <div>
//                                                             <div className="flex items-center space-x-2 mb-1">
//                                                                 <h4 className="font-medium text-gray-900 dark:text-white">
//                                                                     {callLog.callType} Call
//                                                                 </h4>
//                                                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallStatusColor(callLog.callStatus)}`}>
//                                                                     {callLog.callStatus.replace('_', ' ')}
//                                                                 </span>
//                                                             </div>
//                                                             <p className="text-sm text-gray-600 dark:text-gray-400">
//                                                                 <PhoneCallIcon className="h-4 w-4 inline mr-1" />
//                                                                 {callLog.phoneNumber}
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                     <div className="text-right">
//                                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                                             {formatDuration(callLog.duration)}
//                                                         </p>
//                                                         <p className="text-xs text-gray-500 dark:text-gray-400">
//                                                             {new Date(callLog.createdAt).toLocaleDateString()}
//                                                         </p>
//                                                     </div>
//                                                 </div>

//                                                 {callLog.notes && (
//                                                     <div className="mb-3">
//                                                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes:</p>
//                                                         <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-2">
//                                                             {callLog.notes}
//                                                         </p>
//                                                     </div>
//                                                 )}

//                                                 {callLog.outcome && (
//                                                     <div className="mb-3">
//                                                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outcome:</p>
//                                                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                                                             {callLog.outcome}
//                                                         </p>
//                                                     </div>
//                                                 )}

//                                                 <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
//                                                     <span>
//                                                         by {callLog.user.firstName} {callLog.user.lastName}
//                                                     </span>
//                                                     <span>
//                                                         {callLog.startTime && new Date(callLog.startTime).toLocaleTimeString()}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div className="text-center py-12">
//                                         <PhoneCall className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
//                                         <p className="text-gray-600 dark:text-gray-400 mb-2">No call logs found</p>
//                                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                                             Start making calls to track your communication history
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === 'proposals' && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                 {quotationsLoading ? (
//                                     <div className="text-center py-12">
//                                         <div className="animate-spin h-8 w-8 border-2 border-weconnect-red border-t-transparent rounded-full mx-auto mb-4" />
//                                         <p className="text-gray-600 dark:text-gray-400">Loading proposals...</p>
//                                     </div>
//                                 ) : (
//                                     <QuotationManager
//                                         entityType="lead"
//                                         entityId={lead.id.toString()}
//                                         quotations={quotations}
//                                         invoices={invoices}
//                                         onRefresh={() => {
//                                             fetchQuotations(lead.id);
//                                             fetchInvoices(lead.id);
//                                         }}
//                                     />
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === 'meetings' && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                 <div className="flex items-center justify-between mb-4">
//                                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                         Scheduled Meetings
//                                     </h3>
//                                     <button
//                                         onClick={() => setShowScheduleMeeting(true)}
//                                         className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center"
//                                     >
//                                         <Calendar className="h-4 w-4 mr-2" />
//                                         Schedule Meeting
//                                     </button>
//                                 </div>

//                                 {meetingsLoading ? (
//                                     <div className="flex items-center justify-center py-12">
//                                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
//                                     </div>
//                                 ) : meetings.length > 0 ? (
//                                     <div className="space-y-4">
//                                         {meetings.map((meeting) => (
//                                             <div key={meeting.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                                                 <div className="flex items-start justify-between mb-2">
//                                                     <div className="flex-1">
//                                                         <h4 className="font-medium text-gray-900 dark:text-white mb-1">
//                                                             {meeting.subject || 'Meeting'}
//                                                         </h4>
//                                                         {meeting.scheduledAt && (
//                                                             <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
//                                                                 <Calendar className="h-4 w-4 mr-2" />
//                                                                 {new Date(meeting.scheduledAt).toLocaleString()}
//                                                             </div>
//                                                         )}
//                                                         {meeting.duration && (
//                                                             <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
//                                                                 <Clock className="h-4 w-4 mr-2" />
//                                                                 {meeting.duration} minutes
//                                                             </div>
//                                                         )}
//                                                         {meeting.content && (
//                                                             <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 whitespace-pre-wrap">
//                                                                 {meeting.content.split('\n').map((line, idx) => {
//                                                                     // Enhanced URL regex to catch more patterns
//                                                                     const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|zoom\.us\/[^\s]+|meet\.google\.com\/[^\s]+|teams\.microsoft\.com\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;

//                                                                     // Check if line contains "Meeting Link:"
//                                                                     const trimmedLine = line.trim();
//                                                                     const lowerLine = trimmedLine.toLowerCase();
//                                                                     const meetingLinkMatch = lowerLine.match(/meeting\s+link\s*:/i);

//                                                                     if (meetingLinkMatch) {
//                                                                         // Extract the value after "Meeting Link:"
//                                                                         const matchIndex = trimmedLine.toLowerCase().indexOf('meeting link:');
//                                                                         const prefix = trimmedLine.substring(0, matchIndex + 'meeting link:'.length);
//                                                                         const value = trimmedLine.substring(matchIndex + 'meeting link:'.length).trim();

//                                                                         if (value) {
//                                                                             const finalUrl = value.startsWith('http://') || value.startsWith('https://')
//                                                                                 ? value
//                                                                                 : `https://${value}`;

//                                                                             return (
//                                                                                 <p key={idx} className="mb-1">
//                                                                                     <span>{prefix} </span>
//                                                                                     <a
//                                                                                         href={finalUrl}
//                                                                                         target="_blank"
//                                                                                         rel="noopener noreferrer"
//                                                                                         onClick={(e) => {
//                                                                                             e.preventDefault();
//                                                                                             e.stopPropagation();
//                                                                                             window.open(finalUrl, '_blank', 'noopener,noreferrer');
//                                                                                         }}
//                                                                                         className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
//                                                                                     >
//                                                                                         {value}
//                                                                                     </a>
//                                                                                 </p>
//                                                                             );
//                                                                         }
//                                                                     }

//                                                                     // Check if line starts with "Location:" or "Notes:"
//                                                                     const isLocationLine = lowerLine.startsWith('location:');
//                                                                     const isNotesLine = lowerLine.startsWith('notes:');

//                                                                     if (isLocationLine || isNotesLine) {
//                                                                         // Find colon index in the trimmed line
//                                                                         const colonIndex = trimmedLine.indexOf(':');
//                                                                         if (colonIndex === -1) {
//                                                                             return <p key={idx} className="mb-1">{line}</p>;
//                                                                         }

//                                                                         const prefix = trimmedLine.substring(0, colonIndex + 1);
//                                                                         const value = trimmedLine.substring(colonIndex + 1).trim();

//                                                                         // For Location and Notes, check if value looks like a URL
//                                                                         const urlMatch = value.match(urlRegex);

//                                                                         if (urlMatch && urlMatch.length > 0) {
//                                                                             // Found URL in the value
//                                                                             let lastIndex = 0;
//                                                                             const parts: React.ReactNode[] = [<span key="prefix">{prefix} </span>];

//                                                                             urlMatch.forEach((match, matchIdx) => {
//                                                                                 const matchIndex = value.indexOf(match, lastIndex);

//                                                                                 // Add text before the match
//                                                                                 if (matchIndex > lastIndex) {
//                                                                                     parts.push(
//                                                                                         <span key={`text-${matchIdx}`}>
//                                                                                             {value.substring(lastIndex, matchIndex)}
//                                                                                         </span>
//                                                                                     );
//                                                                                 }

//                                                                                 // Add the link
//                                                                                 let url = match.trim();
//                                                                                 if (!url.startsWith('http://') && !url.startsWith('https://')) {
//                                                                                     url = 'https://' + url;
//                                                                                 }
//                                                                                 parts.push(
//                                                                                     <a
//                                                                                         key={`link-${matchIdx}`}
//                                                                                         href={url}
//                                                                                         target="_blank"
//                                                                                         rel="noopener noreferrer"
//                                                                                         onClick={(e) => e.stopPropagation()}
//                                                                                         className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
//                                                                                     >
//                                                                                         {match.trim()}
//                                                                                     </a>
//                                                                                 );

//                                                                                 lastIndex = matchIndex + match.length;
//                                                                             });

//                                                                             // Add remaining text
//                                                                             if (lastIndex < value.length) {
//                                                                                 parts.push(
//                                                                                     <span key="text-end">
//                                                                                         {value.substring(lastIndex)}
//                                                                                     </span>
//                                                                                 );
//                                                                             }

//                                                                             return <p key={idx} className="mb-1">{parts}</p>;
//                                                                         }

//                                                                         // No URL found, show as normal text
//                                                                         return <p key={idx} className="mb-1">{line}</p>;
//                                                                     }

//                                                                     // Regular URL detection for other lines
//                                                                     const matches = line.match(urlRegex);

//                                                                     if (!matches || matches.length === 0) {
//                                                                         return <p key={idx} className="mb-1">{line}</p>;
//                                                                     }

//                                                                     let lastIndex = 0;
//                                                                     const parts: React.ReactNode[] = [];

//                                                                     matches.forEach((match, matchIdx) => {
//                                                                         const matchIndex = line.indexOf(match, lastIndex);

//                                                                         // Add text before the match
//                                                                         if (matchIndex > lastIndex) {
//                                                                             parts.push(
//                                                                                 <span key={`text-${matchIdx}`}>
//                                                                                     {line.substring(lastIndex, matchIndex)}
//                                                                                 </span>
//                                                                             );
//                                                                         }

//                                                                         // Add the link
//                                                                         let url = match;
//                                                                         if (!url.startsWith('http://') && !url.startsWith('https://')) {
//                                                                             url = 'https://' + url;
//                                                                         }
//                                                                         parts.push(
//                                                                             <a
//                                                                                 key={`link-${matchIdx}`}
//                                                                                 href={url}
//                                                                                 target="_blank"
//                                                                                 rel="noopener noreferrer"
//                                                                                 onClick={(e) => e.stopPropagation()}
//                                                                                 className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
//                                                                             >
//                                                                                 {match}
//                                                                             </a>
//                                                                         );

//                                                                         lastIndex = matchIndex + match.length;
//                                                                     });

//                                                                     // Add remaining text
//                                                                     if (lastIndex < line.length) {
//                                                                         parts.push(
//                                                                             <span key="text-end">
//                                                                                 {line.substring(lastIndex)}
//                                                                             </span>
//                                                                         );
//                                                                     }

//                                                                     return <p key={idx} className="mb-1">{parts}</p>;
//                                                                 })}
//                                                             </div>
//                                                         )}
//                                                         {meeting.outcome && (
//                                                             <p className="text-sm text-gray-600 dark:text-gray-400">
//                                                                 <span className="font-medium">Outcome:</span> {meeting.outcome}
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                     <div className="ml-4">
//                                                         {meeting.completedAt ? (
//                                                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
//                                                                 Completed
//                                                             </span>
//                                                         ) : (
//                                                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
//                                                                 Scheduled
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                                 {meeting.user && (
//                                                     <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
//                                                         <User className="h-3 w-3 mr-1" />
//                                                         Scheduled by {meeting.user.firstName} {meeting.user.lastName}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div className="text-center py-12">
//                                         <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                                         <p className="text-gray-500 dark:text-gray-400 mb-4">No meetings scheduled</p>
//                                         <button
//                                             onClick={() => setShowScheduleMeeting(true)}
//                                             className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
//                                         >
//                                             Schedule First Meeting
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === 'tasks' && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                                 <TaskManager
//                                     key={`tasks-${lead.id}-${tasksRefreshKey}`}
//                                     entityType="lead"
//                                     entityId={lead.id.toString()}
//                                     tasks={tasks.map((t: any) => ({
//                                         ...t,
//                                         id: String(t.id),
//                                         assignedTo: t.assignedUser ? {
//                                             id: String(t.assignedUser.id),
//                                             firstName: t.assignedUser.firstName,
//                                             lastName: t.assignedUser.lastName
//                                         } : undefined,
//                                         createdBy: t.createdByUser ? {
//                                             id: String(t.createdByUser.id),
//                                             firstName: t.createdByUser.firstName,
//                                             lastName: t.createdByUser.lastName
//                                         } : {
//                                             id: String(user?.id || ''),
//                                             firstName: user?.firstName || '',
//                                             lastName: user?.lastName || ''
//                                         },
//                                     }))}
//                                 />
//                             </div>
//                         )}

//                         {activeTab === 'communication' && (
//                             <LeadCommunication lead={lead} />
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Add Note Modal */}
//             {showAddNote && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddNote(false)}>
//                     <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Note</h3>
//                             <button
//                                 onClick={() => setShowAddNote(false)}
//                                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                             >
//                                 <XCircle className="h-5 w-5" />
//                             </button>
//                         </div>

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Title *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={noteForm.title}
//                                     onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Enter note title"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Content *
//                                 </label>
//                                 <textarea
//                                     value={noteForm.content}
//                                     onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
//                                     rows={4}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Enter note content"
//                                 />
//                             </div>

//                             <div className="flex items-center">
//                                 <input
//                                     type="checkbox"
//                                     id="isPinned"
//                                     checked={noteForm.isPinned}
//                                     onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
//                                     className="h-4 w-4 text-weconnect-red focus:ring-weconnect-red border-gray-300 rounded"
//                                 />
//                                 <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                                     Pin this note
//                                 </label>
//                             </div>
//                         </div>

//                         <div className="flex justify-end space-x-3 mt-6">
//                             <button
//                                 onClick={() => setShowAddNote(false)}
//                                 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleAddNote}
//                                 className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors"
//                             >
//                                 Add Note
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Schedule Meeting Modal */}
//             {showScheduleMeeting && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowScheduleMeeting(false)}>
//                     <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Meeting</h3>
//                             <button
//                                 onClick={() => setShowScheduleMeeting(false)}
//                                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                             >
//                                 <XCircle className="h-5 w-5" />
//                             </button>
//                         </div>

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Meeting Title *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={meetingForm.title}
//                                     onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Enter meeting title"
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         Date *
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={meetingForm.date}
//                                         onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
//                                         min={new Date().toISOString().split('T')[0]}
//                                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         Time *
//                                     </label>
//                                     <input
//                                         type="time"
//                                         value={meetingForm.time}
//                                         onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Duration (minutes)
//                                 </label>
//                                 <select
//                                     value={meetingForm.duration}
//                                     onChange={(e) => setMeetingForm({ ...meetingForm, duration: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                 >
//                                     <option value="15">15 minutes</option>
//                                     <option value="30">30 minutes</option>
//                                     <option value="45">45 minutes</option>
//                                     <option value="60">1 hour</option>
//                                     <option value="90">1.5 hours</option>
//                                     <option value="120">2 hours</option>
//                                 </select>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Location
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={meetingForm.location}
//                                     onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Office address, physical location, etc."
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Meeting Link
//                                 </label>
//                                 <input
//                                     type="url"
//                                     value={meetingForm.link}
//                                     onChange={(e) => setMeetingForm({ ...meetingForm, link: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="https://zoom.us/j/..., https://meet.google.com/..., etc."
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Notes
//                                 </label>
//                                 <textarea
//                                     value={meetingForm.notes}
//                                     onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
//                                     rows={3}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Meeting agenda, topics to discuss, etc."
//                                 />
//                             </div>
//                         </div>

//                         <div className="flex justify-end space-x-3 mt-6">
//                             <button
//                                 onClick={() => setShowScheduleMeeting(false)}
//                                 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleScheduleMeeting}
//                                 className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors"
//                             >
//                                 Schedule Meeting
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Lead Transfer Modal */}
//             <LeadTransferModal
//                 lead={lead}
//                 isOpen={showTransferModal}
//                 onClose={() => setShowTransferModal(false)}
//                 onTransferComplete={handleTransferComplete}
//                 mode="transfer"
//             />

//             {/* Lead Assignment Modal */}
//             <LeadTransferModal
//                 lead={lead}
//                 isOpen={showAssignModal}
//                 onClose={() => setShowAssignModal(false)}
//                 onTransferComplete={handleTransferComplete}
//                 mode="assign"
//             />

//             {/* Lead Conversion Modal */}
//             <LeadConversionModal
//                 isOpen={showConversionModal}
//                 onClose={() => setShowConversionModal(false)}
//                 onConvert={handleConvert}
//                 lead={lead}
//                 isConverting={isConverting}
//             />

//             {/* Create Task Modal */}
//             {showCreateTask && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateTask(false)}>
//                     <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Task</h3>
//                             <button
//                                 onClick={() => setShowCreateTask(false)}
//                                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                             >
//                                 <XCircle className="h-5 w-5" />
//                             </button>
//                         </div>

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Task Title *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={taskForm.title}
//                                     onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Enter task title"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Description
//                                 </label>
//                                 <textarea
//                                     value={taskForm.description}
//                                     onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
//                                     rows={3}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Enter task description"
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         Due Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={taskForm.dueDate}
//                                         onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         Priority
//                                     </label>
//                                     <select
//                                         value={taskForm.priority}
//                                         onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
//                                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     >
//                                         <option value="LOW">Low</option>
//                                         <option value="MEDIUM">Medium</option>
//                                         <option value="HIGH">High</option>
//                                         <option value="URGENT">Urgent</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Assign To
//                                 </label>
//                                 <select
//                                     value={taskForm.assignedTo}
//                                     onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                 >
//                                     <option value="">Unassigned</option>
//                                     {users.map(u => (
//                                         <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="flex justify-end space-x-3 mt-6">
//                             <button
//                                 onClick={() => {
//                                     setShowCreateTask(false);
//                                     setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' });
//                                 }}
//                                 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={async () => {
//                                     if (!taskForm.title.trim()) {
//                                         toast.error('Task title is required');
//                                         return;
//                                     }

//                                     if (!user?.id) {
//                                         toast.error('User information not available');
//                                         return;
//                                     }

//                                     if (!lead?.id) {
//                                         toast.error('Lead information not available');
//                                         return;
//                                     }

//                                     try {
//                                         // Format dueDate to ISO string if provided
//                                         let formattedDueDate: string | undefined;
//                                         if (taskForm.dueDate) {
//                                             const date = new Date(taskForm.dueDate);
//                                             formattedDueDate = date.toISOString();
//                                         }

//                                         const payload = {
//                                             title: taskForm.title,
//                                             description: taskForm.description || undefined,
//                                             status: 'PENDING' as const,
//                                             priority: taskForm.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
//                                             dueDate: formattedDueDate,
//                                             assignedTo: taskForm.assignedTo ? Number(taskForm.assignedTo) : undefined,
//                                             // Ensure createdBy is always a number (some auth payloads may have string IDs)
//                                             createdBy: Number((user as any)?.id || (user as any)?.userId),
//                                             // Link explicitly to this lead via direct relation field
//                                             leadId: Number(lead.id),
//                                         };

//                                         const response = await tasksService.create(payload);

//                                         if (response.success) {
//                                             toast.success('Task created successfully!');
//                                             setShowCreateTask(false);
//                                             setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' });

//                                             // Refresh tasks
//                                             if (lead?.id) {
//                                                 fetchTasks(lead.id);
//                                                 // Force TaskManager to refresh
//                                                 setTasksRefreshKey(prev => prev + 1);
//                                             }

//                                             // Refresh activities to show the new task activity
//                                             if (lead?.id) {
//                                                 fetchLeadActivities(lead.id);
//                                             }
//                                         } else {
//                                             throw new Error(response.message || 'Failed to create task');
//                                         }
//                                     } catch (error: any) {
//                                         console.error('Error creating task:', error);
//                                         toast.error(error?.response?.data?.message || error?.message || 'Failed to create task. Please try again.');
//                                     }
//                                 }}
//                                 className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors"
//                             >
//                                 Create Task
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Add Call Log Modal */}
//             {showAddCallLog && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddCallLog(false)}>
//                     <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Call Log</h3>
//                             <button
//                                 onClick={() => setShowAddCallLog(false)}
//                                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                             >
//                                 <XCircle className="h-5 w-5" />
//                             </button>
//                         </div>

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Lead Phone Number *
//                                 </label>
//                                 <input
//                                     type="tel"
//                                     value={callLogForm.phoneNumber}
//                                     onChange={(e) => setCallLogForm({ ...callLogForm, phoneNumber: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Enter or edit phone number"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Call Type *
//                                 </label>
//                                 <select
//                                     value={callLogForm.callType}
//                                     onChange={(e) => setCallLogForm({ ...callLogForm, callType: e.target.value as 'INBOUND' | 'OUTBOUND' })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                 >
//                                     <option value="OUTBOUND">Outbound</option>
//                                     <option value="INBOUND">Inbound</option>
//                                 </select>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Notes
//                                 </label>
//                                 <textarea
//                                     value={callLogForm.notes}
//                                     onChange={(e) => setCallLogForm({ ...callLogForm, notes: e.target.value })}
//                                     rows={3}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Add notes about the call"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Outcome
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={callLogForm.outcome}
//                                     onChange={(e) => setCallLogForm({ ...callLogForm, outcome: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
//                                     placeholder="Call outcome (e.g., Follow-up scheduled, Not interested)"
//                                 />
//                             </div>
//                         </div>

//                         <div className="flex justify-end space-x-3 mt-6">
//                             <button
//                                 onClick={() => setShowAddCallLog(false)}
//                                 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleAddCallLog}
//                                 className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors"
//                             >
//                                 Add Call Log
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default LeadProfile;




import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants';
import {
    ArrowLeft, ArrowRight, User, Mail, Phone, Building, Calendar,
    Edit, Tag, Star, Clock, Activity, Phone as PhoneCallIcon,
    MessageSquare, FileText, Link as LinkIcon,
    Users, TrendingUp, CheckCircle, XCircle,
    Trash2, Eye, Plus, PhoneCall
} from 'lucide-react';
import { leadService, Lead } from '../services/leadService';

import { useBusinessSettings } from '../contexts/BusinessSettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';
import { activityService } from '../services/activityService';
import { notesService, Note } from '../services/notesService';
import { tasksService } from '../services/tasksService';
import { communicationService, Meeting } from '../services/communicationService';
import BackButton from './BackButton';
import { Button, Container, Card } from './ui';
import LeadTransferModal from './LeadTransferModal';
import LeadCommunication from './LeadCommunication';
import LeadConversionModal from './LeadConversionModal';
import QuotationManager from './shared/QuotationManager';
import TaskManager from './shared/TaskManager';
import ActivityTimeline from './shared/ActivityTimeline';

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
    const { hasPermission, user } = useAuth();
    const {
        getLeadSourceById
    } = useBusinessSettings();

    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

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

    // Notes state
    const [dynamicNotes, setDynamicNotes] = useState<Note[]>([]);
    const [notesLoading, setNotesLoading] = useState(false);
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
    const [tasksRefreshKey, setTasksRefreshKey] = useState(0);

    // Quotations/Proposals states
    const [quotations, setQuotations] = useState<any[]>([]);
    const [quotationsLoading, setQuotationsLoading] = useState(false);

    // Invoices states
    const [invoices, setInvoices] = useState<any[]>([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);



    // Meetings states
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [meetingsLoading, setMeetingsLoading] = useState(false);

    // Form states
    const [noteForm, setNoteForm] = useState({ title: '', content: '', isPinned: false });
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
        link: '',
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
        // Request notification permission on app load
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }

        if (id) {
            fetchLead(parseInt(id));
            fetchLeadActivities(parseInt(id));
            fetchTasks(parseInt(id));
            fetchFiles(parseInt(id));
            fetchNotes(parseInt(id));
            if (activeTab === 'call-logs') {
                fetchCallLogs(parseInt(id));
            }
            if (activeTab === 'proposals') {
                fetchQuotations(parseInt(id));
                fetchInvoices(parseInt(id));
            }

            if (activeTab === 'meetings') {
                fetchMeetings(parseInt(id));
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

    // Fetch activities for lead
    const fetchLeadActivities = async (leadId: number) => {
        try {
            setActivitiesLoading(true);
            const response = await activityService.getActivitiesByLeadId(leadId, 1, 100);
            const activities = response?.data?.items || [];

            // Transform activities to match ActivityTimeline format with detailed messages
            const transformedActivities = activities.map((activity: any) => {
                // Enhance description with metadata changes if available
                let enhancedDescription = activity.description || '';

                if (activity.metadata && activity.metadata.changes && Array.isArray(activity.metadata.changes)) {
                    // If metadata has changes array, use it for detailed description
                    enhancedDescription = activity.metadata.changes.join(', ');
                } else if (activity.metadata) {
                    // Build detailed description from metadata
                    const metaParts: string[] = [];

                    if (activity.metadata.oldStatus && activity.metadata.newStatus) {
                        metaParts.push(`Status: ${String(activity.metadata.oldStatus).toLowerCase()} → ${String(activity.metadata.newStatus).toLowerCase()}`);
                    }
                    if (activity.metadata.oldPriority && activity.metadata.newPriority) {
                        metaParts.push(`Priority: ${String(activity.metadata.oldPriority).toLowerCase()} → ${String(activity.metadata.newPriority).toLowerCase()}`);
                    }
                    if (activity.metadata.newAssignedTo && activity.metadata.oldAssignedTo !== activity.metadata.newAssignedTo) {
                        metaParts.push('Assignment changed');
                    }
                    if (activity.metadata.scheduledAt) {
                        metaParts.push(`Scheduled for ${new Date(activity.metadata.scheduledAt).toLocaleString()}`);
                    }

                    if (metaParts.length > 0) {
                        enhancedDescription = metaParts.join(', ');
                    }
                }

                return {
                    id: String(activity.id),
                    type: mapActivityType(activity.type),
                    title: activity.title,
                    description: enhancedDescription || activity.description,
                    createdAt: activity.createdAt,
                    isCompleted: true,
                    user: activity.user ? {
                        id: String(activity.user.id),
                        firstName: activity.user.firstName || '',
                        lastName: activity.user.lastName || '',
                    } : undefined,
                };
            });

            setActivities(transformedActivities);
        } catch (err: any) {
            console.error('Error fetching lead activities:', err);
            setActivities([]);
        } finally {
            setActivitiesLoading(false);
        }
    };

    // Map backend ActivityType to ActivityTimeline type
    const mapActivityType = (type: string): any => {
        const typeMap: Record<string, any> = {
            'TASK_CREATED': 'NOTE',
            'TASK_UPDATED': 'NOTE',
            'TASK_COMPLETED': 'NOTE',
            'LEAD_UPDATED': 'NOTE',
            'LEAD_STATUS_CHANGED': 'STAGE_CHANGED',
            'LEAD_ASSIGNED': 'NOTE',
            'LEAD_CONVERTED': 'STAGE_CHANGED',
            'COMMUNICATION_LOGGED': 'MEETING',
            'FILE_UPLOADED': 'NOTE',
            'FILE_DELETED': 'NOTE',
            'QUOTATION_CREATED': 'QUOTE_SENT',
            'QUOTATION_UPDATED': 'QUOTE_SENT',
            'INVOICE_CREATED': 'PAYMENT_RECEIVED',
            'INVOICE_UPDATED': 'PAYMENT_RECEIVED',
        };
        return typeMap[type] || 'OTHER';
    };

    // Fetch meetings for the lead
    const fetchMeetings = async (leadId: number) => {
        try {
            setMeetingsLoading(true);
            const response = await communicationService.getMeetings(leadId);
            console.log('Meetings response:', response);
            const meetings = response?.data?.items || [];
            setMeetings(meetings);
        } catch (err: any) {
            console.error('Error fetching meetings:', err);
            console.error('Error details:', err?.response?.data || err?.message);
            toast.error(err?.response?.data?.message || 'Failed to fetch meetings');
            setMeetings([]);
        } finally {
            setMeetingsLoading(false);
        }
    };

    // Fetch notes for the lead
    const fetchNotes = async (leadId: number) => {
        try {
            setNotesLoading(true);
            const response = await notesService.getNotesByLeadId(leadId);
            const notes = response?.data?.notes || [];
            setDynamicNotes(notes);
        } catch (err: any) {
            console.error('Error fetching notes:', err);
            toast.error('Failed to fetch notes');
            setDynamicNotes([]);
        } finally {
            setNotesLoading(false);
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
            console.log('Fetched call logs:', data); // Added logging

            const logs = data.data?.callLogs || data.callLogs || [];
            // Sort by createdAt desc to show newest first
            const sortedLogs = logs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setCallLogs(sortedLogs);

            // Log the count
            console.log(`Found ${sortedLogs.length} call logs`);
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
            const response = await tasksService.list({
                entityType: 'lead',
                entityId: leadId.toString(),
                status: 'PENDING,IN_PROGRESS,COMPLETED',
            });

            const list = response?.data?.tasks || response?.data?.items || response?.tasks || [];
            // Sort by due date and priority
            const sortedTasks = list.sort((a: any, b: any) => {
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
            setQuotations(data.data?.items || data.data?.quotations || data.quotations || []);
        } catch (err: any) {
            console.error('Error fetching quotations:', err);
            setQuotations([]);
        } finally {
            setQuotationsLoading(false);
        }
    };

    // Fetch invoices for the lead
    const fetchInvoices = async (leadId: number) => {
        try {
            setInvoicesLoading(true);
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const response = await fetch(`/api/invoices?entityType=lead&entityId=${leadId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch invoices');
            }

            const data = await response.json();
            setInvoices(data.data?.items || data.data?.invoices || data.invoices || []);
        } catch (err: any) {
            console.error('Error fetching invoices:', err);
            setInvoices([]);
        } finally {
            setInvoicesLoading(false);
        }
    };

    // Fetch payments for the lead


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
    const handleScheduleMeeting = async () => {
        if (!meetingForm.title.trim() || !meetingForm.date || !meetingForm.time) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!lead || !user) {
            toast.error('Lead or user information missing');
            return;
        }

        try {
            const scheduledDateTime = new Date(`${meetingForm.date}T${meetingForm.time}`);
            let content = `Meeting scheduled with ${lead.firstName} ${lead.lastName}`;
            if (meetingForm.location) {
                content += `\nLocation: ${meetingForm.location}`;
            }
            if (meetingForm.link) {
                content += `\nMeeting Link: ${meetingForm.link}`;
            }
            if (meetingForm.notes) {
                content += `\n\nNotes: ${meetingForm.notes}`;
            }

            const response = await communicationService.createMeeting({
                leadId: lead.id,
                userId: user.id,
                type: 'MEETING',
                subject: meetingForm.title,
                content: content,
                direction: 'outbound',
                duration: meetingForm.duration ? parseInt(meetingForm.duration) : undefined,
                scheduledAt: scheduledDateTime.toISOString(),
            });

            if (response.success) {
                toast.success('Meeting scheduled successfully');

                // Try to send email notification to lead
                try {
                    await fetch('/api/communication/send-meeting-email', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            leadId: lead.id,
                            leadEmail: lead.email,
                            meetingTitle: meetingForm.title,
                            meetingDate: meetingForm.date,
                            meetingTime: meetingForm.time,
                            location: meetingForm.location,
                            link: meetingForm.link,
                            notes: meetingForm.notes,
                        }),
                    });
                } catch (emailErr) {
                    console.warn('Failed to send meeting email:', emailErr);
                }

                setShowScheduleMeeting(false);
                setMeetingForm({
                    title: '',
                    date: '',
                    time: '',
                    duration: '30',
                    location: '',
                    link: '',
                    notes: ''
                });

                // Refresh meetings and activities
                if (id) {
                    fetchMeetings(parseInt(id));
                    fetchLeadActivities(parseInt(id));
                }
            }
        } catch (error: any) {

            toast.error(error?.response?.data?.message || 'Failed to schedule meeting');
        }
    };

    const handleAddNote = async () => {
        if (!noteForm.title.trim() || !noteForm.content.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!id || !user?.id) {
            toast.error('Invalid lead or user information');
            return;
        }

        try {
            const response = await notesService.createNote({
                title: noteForm.title,
                content: noteForm.content,
                isPinned: noteForm.isPinned,
                leadId: parseInt(id),
                createdBy: user.id,
            });

            if (response.success) {
                const newNote = response.data.note;
                setDynamicNotes([newNote, ...dynamicNotes]);
                setNoteForm({ title: '', content: '', isPinned: false });
                setShowAddNote(false);
                toast.success('Note added successfully');

                // Refresh activities to show the new note activity
                if (id) {
                    fetchLeadActivities(parseInt(id));
                }
            } else {
                toast.error(response.message || 'Failed to add note');
            }
        } catch (error: any) {

            toast.error(error?.response?.data?.message || 'Failed to add note');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = Array.from(event.target.files || []);
        if (uploadedFiles.length === 0) return;



        try {
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

            if (!token) {
                toast.error('Please login again to upload files');
                return;
            }

            for (const file of uploadedFiles) {

                const formData = new FormData();
                formData.append('file', file);
                formData.append('entityType', 'lead');
                formData.append('entityId', lead?.id?.toString() || '');



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


            const response = await fetch(`/api/files?entityType=lead&entityId=${leadId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });



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

            // सीधे फोन डायलर खोलें
            window.location.href = `tel:${lead.phone}`;

            // ब्राउज़र नोटिफिकेशन दिखाएं
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Call Initiated", {
                    body: `Calling ${lead.firstName} ${lead.lastName} at ${lead.phone}`,
                    icon: "/call-icon.png", // आप अपना आइकन यहाँ रख सकते हैं
                    tag: "call-initiation"
                });
            } else if ("Notification" in window && Notification.permission !== "denied") {
                // अगर अनुमति नहीं दी गई है, तो अनुमति मांगें
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        new Notification("Call Initiated", {
                            body: `Calling ${lead.firstName} ${lead.lastName} at ${lead.phone}`,
                            icon: "/call-icon.png",
                            tag: "call-initiation"
                        });
                    }
                });
            }

            // कॉल लॉग बनाने के लिए API कॉल करें
            const response = await fetch('/api/call-logs', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    leadId: lead.id,
                    userId: user?.id, // यहाँ userId जोड़ें
                    phoneNumber: lead.phone,
                    callType: 'OUTBOUND',
                    callStatus: 'INITIATED',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to log call');
            }

            const responseData = await response.json();
            console.log('Call log saved:', responseData); // यह लॉग जरूर देखें

            toast.success('Call initiated! Check your phone and notifications.');

            // कॉल लॉग्स रीफ्रेश करें
            fetchCallLogs(lead.id);

        } catch (error: any) {
            console.error('Error initiating call:', error);
            toast.error(error.message || 'Unable to log call. Please try manually calling.');
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
                    userId: user?.id,
                    phoneNumber: callLogForm.phoneNumber,
                    callType: callLogForm.callType,
                    notes: callLogForm.notes,
                    outcome: callLogForm.outcome,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add call log');
            }

            const responseData = await response.json();
            console.log('Manual call log saved:', responseData);

            toast.success('Call log added successfully');
            setShowAddCallLog(false);
            setCallLogForm({ phoneNumber: '', callType: 'OUTBOUND', notes: '', outcome: '' });

            // Optimistic / Immediate Update
            if (responseData.success && responseData.data?.item) {
                const newLog = {
                    ...responseData.data.item,
                    user: {
                        id: user?.id,
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                    }
                };
                setCallLogs(prevLogs => [newLog, ...prevLogs]);
            } else if (lead?.id) {
                fetchCallLogs(lead.id);
            }

            // Always refresh activities
            if (lead?.id) {
                fetchLeadActivities(lead.id);
            }

        } catch (error: any) {
            console.error('Error adding call log:', error);
            toast.error('Failed to add call log');
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const response = await notesService.deleteNote(noteId);
            if (response.success) {
                setDynamicNotes(dynamicNotes.filter(note => note.id !== noteId));
                toast.success('Note deleted successfully');

                // Refresh activities to show the delete activity
                if (id) {
                    fetchLeadActivities(parseInt(id));
                }
            } else {
                toast.error(response.message || 'Failed to delete note');
            }
        } catch (error: any) {
            console.error('Error deleting note:', error);
            toast.error(error?.response?.data?.message || 'Failed to delete note');
        }
    };

    const handleTogglePinNote = async (noteId: number) => {
        const note = dynamicNotes.find(n => n.id === noteId);
        if (!note) return;

        try {
            const response = await notesService.updateNote(noteId, {
                isPinned: !note.isPinned,
            });

            if (response.success) {
                setDynamicNotes(dynamicNotes.map(n =>
                    n.id === noteId ? response.data.note : n
                ));
                toast.success('Note updated successfully');

                // Refresh activities to show the update activity
                if (id) {
                    fetchLeadActivities(parseInt(id));
                }
            } else {
                toast.error(response.message || 'Failed to update note');
            }
        } catch (error: any) {
            console.error('Error updating note:', error);
            toast.error(error?.response?.data?.message || 'Failed to update note');
        }
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

    const handleStatusChange = async (newStatus: string) => {
        if (!lead) return;
        try {
            await leadService.updateLead(lead.id, { status: newStatus });
            setLead({ ...lead, status: newStatus });
            toast.success('Lead status updated successfully');
        } catch (error) {
            console.error('Failed to update lead status:', error);
            toast.error((error as any)?.response?.data?.message || 'Failed to update lead status');
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

    // Use source from API if available, otherwise fallback to context
    const leadSource = lead?.source || getLeadSourceById(lead?.sourceId?.toString() || '');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Eye },
        { id: 'activity', label: 'Activity', icon: Activity },
        { id: 'notes', label: 'Notes', icon: FileText },
        { id: 'files', label: 'Files', icon: LinkIcon },
        { id: 'proposals', label: 'Proposals', icon: FileText },

        { id: 'call-logs', label: 'Call Logs', icon: PhoneCall },
        { id: 'meetings', label: 'Meetings', icon: Calendar },
        { id: 'tasks', label: 'Tasks', icon: CheckCircle },
        { id: 'communication', label: 'Communication', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header - Compact */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="mx-auto px-6">
                    <div className="py-4">
                        <div className="flex items-center justify-end mb-4">
                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                {hasPermission('lead.update') && (
                                    <button
                                        onClick={handleEdit}
                                        className="flex items-center px-3 py-1.5 bg-weconnect-red text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                    >
                                        <Edit className="h-4 w-4 mr-1.5" />
                                        Edit
                                    </button>
                                )}
                                <BackButton to="/leads" />
                            </div>
                        </div>

                        {/* Lead Header - Compact */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="h-14 w-14 rounded-xl bg-weconnect-red flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-xl">
                                            {lead.firstName[0]}{lead.lastName[0]}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                        {lead.firstName} {lead.lastName}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {lead.company && (
                                            <span className="flex items-center">
                                                <Building className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                                {lead.company}
                                            </span>
                                        )}
                                        {lead.email && (
                                            <span className="flex items-center">
                                                <Mail className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                                {lead.email}
                                            </span>
                                        )}
                                        {lead.phone && (
                                            <span className="flex items-center">
                                                <Phone className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                                                {lead.phone}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Status Dropdown */}
                                        <select
                                            value={lead.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(lead.status)}`}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="qualified">Qualified</option>
                                            <option value="proposal">Proposal</option>
                                            <option value="negotiation">Negotiation</option>
                                            <option value="closed">Closed</option>
                                            <option value="lost">Lost</option>
                                            <option value="converted">Converted</option>
                                        </select>

                                        {leadSource && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                                {leadSource.name}
                                            </span>
                                        )}

                                        {lead.assignedUser && (
                                            <span className="flex items-center px-2.5 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs">
                                                <User className="h-3 w-3 mr-1.5 text-orange-500" />
                                                {lead.assignedUser.firstName} {lead.assignedUser.lastName}
                                            </span>
                                        )}

                                        {/* Lead Score - Only show if filled */}
                                        {lead.leadScore !== null && lead.leadScore !== undefined && lead.leadScore > 0 && (
                                            <div className="flex items-center px-2.5 py-1 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <TrendingUp className="h-3 w-3 mr-1.5 text-green-600 dark:text-green-400" />
                                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                                    Score: {lead.leadScore}/10
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions in Header */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleQuickAction('call')}
                                    className="flex items-center px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
                                    title="Call Lead"
                                >
                                    <PhoneCallIcon className="h-4 w-4 mr-1.5" />
                                    Call
                                </button>

                                <button
                                    onClick={() => handleQuickAction('email')}
                                    className="flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                                    title="Send Email"
                                >
                                    <Mail className="h-4 w-4 mr-1.5" />
                                    Email
                                </button>

                                <button
                                    onClick={() => handleQuickAction('meeting')}
                                    className="flex items-center px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm"
                                    title="Schedule Meeting"
                                >
                                    <Calendar className="h-4 w-4 mr-1.5" />
                                    Meeting
                                </button>

                                <button
                                    onClick={() => setShowCreateTask(true)}
                                    className="flex items-center px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-sm"
                                    title="Create Task"
                                >
                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                    Task
                                </button>

                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm"
                                    title="Assign Lead"
                                >
                                    <Users className="h-4 w-4 mr-1.5" />
                                    Assign
                                </button>

                                <button
                                    onClick={() => setShowConversionModal(true)}
                                    className="flex items-center px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-sm"
                                    title="Convert Lead"
                                >
                                    <TrendingUp className="h-4 w-4 mr-1.5" />
                                    Convert
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto px-6 py-6">
                <div className="space-y-6">
                    {/* Tabs - Compact */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-weconnect-red text-weconnect-red dark:text-weconnect-red'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4 mr-1.5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content - Full Width */}
                    <div>
                        {activeTab === 'overview' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Lead Details
                                    </h3>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Created {new Date(lead.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* 4 Column Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Column 1 */}
                                    <div className="space-y-4">
                                        {lead.position && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Position
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">{lead.position}</p>
                                            </div>
                                        )}

                                        {lead.website && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Website
                                                </label>
                                                <p className="text-sm">
                                                    <a
                                                        href={lead.website.startsWith('http://') || lead.website.startsWith('https://') ? lead.website : `https://${lead.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const url = lead.website?.startsWith('http://') || lead.website?.startsWith('https://')
                                                                ? lead.website
                                                                : `https://${lead.website}`;
                                                            window.open(url, '_blank', 'noopener,noreferrer');
                                                        }}
                                                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                                                    >
                                                        {lead.website}
                                                    </a>
                                                </p>
                                            </div>
                                        )}

                                        {lead.industry && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Industry
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">{lead.industry}</p>
                                            </div>
                                        )}

                                        {lead.address && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Address
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">{lead.address}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-4">
                                        {(lead.city || lead.state || lead.country) && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Location
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {[lead.city, lead.state, lead.country].filter(Boolean).join(', ') || 'N/A'}
                                                </p>
                                            </div>
                                        )}

                                        {lead.zipCode && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Zip Code
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">{lead.zipCode}</p>
                                            </div>
                                        )}

                                        {lead.companySize && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Company Size
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">{lead.companySize} employees</p>
                                            </div>
                                        )}

                                        {lead.annualRevenue && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Annual Revenue
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {lead.currency || 'USD'} {Number(lead.annualRevenue).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Column 3 */}
                                    <div className="space-y-4">
                                        {lead.priority && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Priority
                                                </label>
                                                <p>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                        lead.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                            lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {lead.priority}
                                                    </span>
                                                </p>
                                            </div>
                                        )}

                                        {lead.budget && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Budget
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {lead.currency || 'USD'} {Number(lead.budget).toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                        {lead.preferredContactMethod && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Preferred Contact
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white capitalize">
                                                    {lead.preferredContactMethod}
                                                </p>
                                            </div>
                                        )}

                                        {lead.timezone && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Timezone
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">{lead.timezone}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Column 4 */}
                                    <div className="space-y-4">
                                        {lead.linkedinProfile && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    LinkedIn
                                                </label>
                                                <p className="text-sm">
                                                    <a
                                                        href={lead.linkedinProfile.startsWith('http://') || lead.linkedinProfile.startsWith('https://') ? lead.linkedinProfile : `https://${lead.linkedinProfile}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const url = lead.linkedinProfile?.startsWith('http://') || lead.linkedinProfile?.startsWith('https://')
                                                                ? lead.linkedinProfile
                                                                : `https://${lead.linkedinProfile}`;
                                                            window.open(url, '_blank', 'noopener,noreferrer');
                                                        }}
                                                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                                                    >
                                                        {lead.linkedinProfile}
                                                    </a>
                                                </p>
                                            </div>
                                        )}

                                        {lead.lastContactedAt && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Last Contacted
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {new Date(lead.lastContactedAt).toLocaleDateString()}<br />
                                                    <span className="text-xs text-gray-500">{new Date(lead.lastContactedAt).toLocaleTimeString()}</span>
                                                </p>
                                            </div>
                                        )}

                                        {lead.nextFollowUpAt && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    Next Follow-up
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {new Date(lead.nextFollowUpAt).toLocaleDateString()}<br />
                                                    <span className="text-xs text-gray-500">{new Date(lead.nextFollowUpAt).toLocaleTimeString()}</span>
                                                </p>
                                            </div>
                                        )}
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
                                            {lead.tags.map((leadTag: any) => {
                                                const tag = leadTag.tag || leadTag;
                                                return (
                                                    <span
                                                        key={tag.id || leadTag.id}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: (tag.color || '#3B82F6') + '20', color: tag.color || '#3B82F6' }}
                                                    >
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {tag.name || leadTag.name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            activitiesLoading ? (
                                <Card className="p-6">
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
                                    </div>
                                </Card>
                            ) : (
                                <ActivityTimeline
                                    entityType="lead"
                                    entityId={id || ''}
                                    activities={activities}
                                />
                            )
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

                                {notesLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
                                    </div>
                                ) : dynamicNotes.length > 0 ? (
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
                                                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${note.isPinned ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'
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
                                                        by {note.user ? `${note.user.firstName} ${note.user.lastName}` : 'Unknown User'}
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
                            );
                        })()}

                        {activeTab === 'call-logs' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Call Logs
                                    </h3>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => {
                                                setCallLogForm({
                                                    ...callLogForm,
                                                    phoneNumber: lead?.phone || ''
                                                });
                                                setShowAddCallLog(true);
                                            }}
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
                                                        {new Date(callLog.startTime || callLog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                        invoices={invoices}
                                        onRefresh={() => {
                                            fetchQuotations(lead.id);
                                            fetchInvoices(lead.id);
                                        }}
                                    />
                                )}
                            </div>
                        )}



                        {activeTab === 'meetings' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Scheduled Meetings
                                    </h3>
                                    <button
                                        onClick={() => setShowScheduleMeeting(true)}
                                        className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center"
                                    >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Schedule Meeting
                                    </button>
                                </div>

                                {meetingsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
                                    </div>
                                ) : meetings.length > 0 ? (
                                    <div className="space-y-4">
                                        {meetings.map((meeting) => (
                                            <div key={meeting.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                            {meeting.subject || 'Meeting'}
                                                        </h4>
                                                        {meeting.scheduledAt && (
                                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                <Calendar className="h-4 w-4 mr-2" />
                                                                {new Date(meeting.scheduledAt).toLocaleString()}
                                                            </div>
                                                        )}
                                                        {meeting.duration && (
                                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                <Clock className="h-4 w-4 mr-2" />
                                                                {meeting.duration} minutes
                                                            </div>
                                                        )}
                                                        {meeting.content && (
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 whitespace-pre-wrap">
                                                                {meeting.content.split('\n').map((line, idx) => {
                                                                    // Enhanced URL regex to catch more patterns
                                                                    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|zoom\.us\/[^\s]+|meet\.google\.com\/[^\s]+|teams\.microsoft\.com\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;

                                                                    // Check if line contains "Meeting Link:"
                                                                    const trimmedLine = line.trim();
                                                                    const lowerLine = trimmedLine.toLowerCase();
                                                                    const meetingLinkMatch = lowerLine.match(/meeting\s+link\s*:/i);

                                                                    if (meetingLinkMatch) {
                                                                        // Extract value after "Meeting Link:"
                                                                        const matchIndex = trimmedLine.toLowerCase().indexOf('meeting link:');
                                                                        const prefix = trimmedLine.substring(0, matchIndex + 'meeting link:'.length);
                                                                        const value = trimmedLine.substring(matchIndex + 'meeting link:'.length).trim();

                                                                        if (value) {
                                                                            const finalUrl = value.startsWith('http://') || value.startsWith('https://')
                                                                                ? value
                                                                                : `https://${value}`;

                                                                            return (
                                                                                <p key={idx} className="mb-1">
                                                                                    <span>{prefix} </span>
                                                                                    <a
                                                                                        href={finalUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            window.open(finalUrl, '_blank', 'noopener,noreferrer');
                                                                                        }}
                                                                                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                                                                                    >
                                                                                        {value}
                                                                                    </a>
                                                                                </p>
                                                                            );
                                                                        }
                                                                    }

                                                                    // Check if line starts with "Location:" or "Notes:"
                                                                    const isLocationLine = lowerLine.startsWith('location:');
                                                                    const isNotesLine = lowerLine.startsWith('notes:');

                                                                    if (isLocationLine || isNotesLine) {
                                                                        // Find colon index in the trimmed line
                                                                        const colonIndex = trimmedLine.indexOf(':');
                                                                        if (colonIndex === -1) {
                                                                            return <p key={idx} className="mb-1">{line}</p>;
                                                                        }

                                                                        const prefix = trimmedLine.substring(0, colonIndex + 1);
                                                                        const value = trimmedLine.substring(colonIndex + 1).trim();

                                                                        // For Location and Notes, check if value looks like a URL
                                                                        const urlMatch = value.match(urlRegex);

                                                                        if (urlMatch && urlMatch.length > 0) {
                                                                            // Found URL in the value
                                                                            let lastIndex = 0;
                                                                            const parts: React.ReactNode[] = [<span key="prefix">{prefix} </span>];

                                                                            urlMatch.forEach((match, matchIdx) => {
                                                                                const matchIndex = value.indexOf(match, lastIndex);

                                                                                // Add text before the match
                                                                                if (matchIndex > lastIndex) {
                                                                                    parts.push(
                                                                                        <span key={`text-${matchIdx}`}>
                                                                                            {value.substring(lastIndex, matchIndex)}
                                                                                        </span>
                                                                                    );
                                                                                }

                                                                                // Add the link
                                                                                let url = match.trim();
                                                                                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                                                                    url = 'https://' + url;
                                                                                }
                                                                                parts.push(
                                                                                    <a
                                                                                        key={`link-${matchIdx}`}
                                                                                        href={url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                                                                                    >
                                                                                        {match.trim()}
                                                                                    </a>
                                                                                );

                                                                                lastIndex = matchIndex + match.length;
                                                                            });

                                                                            // Add remaining text
                                                                            if (lastIndex < value.length) {
                                                                                parts.push(
                                                                                    <span key="text-end">
                                                                                        {value.substring(lastIndex)}
                                                                                    </span>
                                                                                );
                                                                            }

                                                                            return <p key={idx} className="mb-1">{parts}</p>;
                                                                        }

                                                                        // No URL found, show as normal text
                                                                        return <p key={idx} className="mb-1">{line}</p>;
                                                                    }

                                                                    // Regular URL detection for other lines
                                                                    const matches = line.match(urlRegex);

                                                                    if (!matches || matches.length === 0) {
                                                                        return <p key={idx} className="mb-1">{line}</p>;
                                                                    }

                                                                    let lastIndex = 0;
                                                                    const parts: React.ReactNode[] = [];

                                                                    matches.forEach((match, matchIdx) => {
                                                                        const matchIndex = line.indexOf(match, lastIndex);

                                                                        // Add text before the match
                                                                        if (matchIndex > lastIndex) {
                                                                            parts.push(
                                                                                <span key={`text-${matchIdx}`}>
                                                                                    {line.substring(lastIndex, matchIndex)}
                                                                                </span>
                                                                            );
                                                                        }

                                                                        // Add the link
                                                                        let url = match;
                                                                        if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                                                            url = 'https://' + url;
                                                                        }
                                                                        parts.push(
                                                                            <a
                                                                                key={`link-${matchIdx}`}
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                                                                            >
                                                                                {match}
                                                                            </a>
                                                                        );

                                                                        lastIndex = matchIndex + match.length;
                                                                    });

                                                                    // Add remaining text
                                                                    if (lastIndex < line.length) {
                                                                        parts.push(
                                                                            <span key="text-end">
                                                                                {line.substring(lastIndex)}
                                                                            </span>
                                                                        );
                                                                    }

                                                                    return <p key={idx} className="mb-1">{parts}</p>;
                                                                })}
                                                            </div>
                                                        )}
                                                        {meeting.outcome && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Outcome:</span> {meeting.outcome}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        {meeting.completedAt ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                Scheduled
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {meeting.user && (
                                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                        <User className="h-3 w-3 mr-1" />
                                                        Scheduled by {meeting.user.firstName} {meeting.user.lastName}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">No meetings scheduled</p>
                                        <button
                                            onClick={() => setShowScheduleMeeting(true)}
                                            className="bg-weconnect-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                                        >
                                            Schedule First Meeting
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <TaskManager
                                    key={`tasks-${lead.id}-${tasksRefreshKey}`}
                                    entityType="lead"
                                    entityId={lead.id.toString()}
                                    tasks={tasks.map((t: any) => ({
                                        ...t,
                                        id: String(t.id),
                                        assignedTo: t.assignedUser ? {
                                            id: String(t.assignedUser.id),
                                            firstName: t.assignedUser.firstName,
                                            lastName: t.assignedUser.lastName
                                        } : undefined,
                                        createdBy: t.createdByUser ? {
                                            id: String(t.createdByUser.id),
                                            firstName: t.createdByUser.firstName,
                                            lastName: t.createdByUser.lastName
                                        } : {
                                            id: String(user?.id || ''),
                                            firstName: user?.firstName || '',
                                            lastName: user?.lastName || ''
                                        },
                                    }))}
                                />
                            </div>
                        )}

                        {activeTab === 'communication' && (
                            <LeadCommunication lead={lead} />
                        )}
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
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={meetingForm.location}
                                    onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                                    placeholder="Office address, physical location, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Meeting Link
                                </label>
                                <input
                                    type="url"
                                    value={meetingForm.link}
                                    onChange={(e) => setMeetingForm({ ...meetingForm, link: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                                    placeholder="https://zoom.us/j/..., https://meet.google.com/..., etc."
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
                                onClick={handleScheduleMeeting}
                                className="px-4 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors"
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

                                    if (!user?.id) {
                                        toast.error('User information not available');
                                        return;
                                    }

                                    if (!lead?.id) {
                                        toast.error('Lead information not available');
                                        return;
                                    }

                                    try {
                                        // Format dueDate to ISO string if provided
                                        let formattedDueDate: string | undefined;
                                        if (taskForm.dueDate) {
                                            const date = new Date(taskForm.dueDate);
                                            formattedDueDate = date.toISOString();
                                        }

                                        const payload = {
                                            title: taskForm.title,
                                            description: taskForm.description || undefined,
                                            status: 'PENDING' as const,
                                            priority: taskForm.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
                                            dueDate: formattedDueDate,
                                            assignedTo: taskForm.assignedTo ? Number(taskForm.assignedTo) : undefined,
                                            // Ensure createdBy is always a number (some auth payloads may have string IDs)
                                            createdBy: Number((user as any)?.id || (user as any)?.userId),
                                            // Link explicitly to this lead via direct relation field
                                            leadId: Number(lead.id),
                                        };

                                        const response = await tasksService.create(payload);

                                        if (response.success) {
                                            toast.success('Task created successfully!');
                                            setShowCreateTask(false);
                                            setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' });

                                            // Refresh tasks
                                            if (lead?.id) {
                                                fetchTasks(lead.id);
                                                // Force TaskManager to refresh
                                                setTasksRefreshKey(prev => prev + 1);
                                            }

                                            // Refresh activities to show the new task activity
                                            if (lead?.id) {
                                                fetchLeadActivities(lead.id);
                                            }
                                        } else {
                                            throw new Error(response.message || 'Failed to create task');
                                        }
                                    } catch (error: any) {
                                        console.error('Error creating task:', error);
                                        toast.error(error?.response?.data?.message || error?.message || 'Failed to create task. Please try again.');
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
                                    Lead Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={callLogForm.phoneNumber}
                                    onChange={(e) => setCallLogForm({ ...callLogForm, phoneNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter or edit phone number"
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
                                    placeholder="Add notes about call"
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
