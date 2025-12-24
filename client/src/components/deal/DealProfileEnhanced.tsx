import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, Calendar, User, Building, TrendingUp, Edit, Trash2, Tag, Target,
  Phone, Mail, MessageSquare, Clock, CheckCircle, FileText, CreditCard, Bell, Plus,
  Activity, Users, BarChart3, Settings, Filter, Download, Eye, RotateCcw, MapPin
} from 'lucide-react';
import { Button, Card } from '../ui';
import { dealService } from '../../services/dealService';
import { leadService } from '../../services/leadService';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { STORAGE_KEYS } from '../../constants';
import ActivityTimeline from '../shared/ActivityTimeline';
import TaskManager from '../shared/TaskManager';
import CommunicationCenter from '../shared/CommunicationCenter';
import LeadCommunication from '../LeadCommunication';
import PaymentTracker from '../shared/PaymentTracker';
import NotificationPanel from '../shared/NotificationPanel';
import QuotationManager from '../shared/QuotationManager';
import { activityService } from '../../services/activityService';
import { tasksService } from '../../services/tasksService';

interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: string;
  status: 'DRAFT' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  contactId?: string;
  contactName?: string;
  companyName?: string;
  assignedToId?: string;
  assignedToName?: string;
  leadId?: string;
  leadName?: string;
  tags?: string[];
  notes?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  products?: Array<{
    id: string | number;
    name: string;
    quantity: number;
    price: number;
  }>;
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

const DealProfileEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatCurrency, getDealStages, getCurrency } = useBusinessSettings();
  const { user, hasPermission } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUndoingConversion, setIsUndoingConversion] = useState(false);

  // Lead details linked to this deal
  const [leadDetails, setLeadDetails] = useState<any | null>(null);
  const [leadLoading, setLeadLoading] = useState(false);

  // Dynamic data states
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Loading states for dynamic data
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [communicationsLoading, setCommunicationsLoading] = useState(false);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'pipeline', label: 'Pipeline Progress', icon: TrendingUp },
    { id: 'quotations', label: 'Quotes & Proposals', icon: FileText },
    { id: 'activities', label: 'Sales Activities', icon: Activity },
    { id: 'tasks', label: 'Action Items', icon: CheckCircle },
    { id: 'communications', label: 'Communication', icon: MessageSquare },
    { id: 'payments', label: 'Payments & Revenue', icon: CreditCard },
    { id: 'notifications', label: 'Alerts', icon: Bell }
  ];

  // Ensure active tab is valid; default to overview if unknown
  useEffect(() => {
    const ids = tabs.map(t => t.id);
    if (!ids.includes(activeTab)) {
      setActiveTab('overview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stage data for stepper
  const stagesList = getDealStages();
  const currentStageIndex = Math.max(0, stagesList.findIndex((s: any) => s.name === (deal?.stage || '')));

  const deriveStatusFromStage = (stage: any): Deal['status'] => {
    const name = String(stage?.name || '').toLowerCase();
    if (stage?.isClosedWon) return 'WON';
    if (stage?.isClosedLost) return 'LOST';
    if (name.includes('negotiation')) return 'NEGOTIATION';
    if (name.includes('proposal')) return 'PROPOSAL';
    // default early stages treated as draft in backend
    return 'DRAFT';
  };

  const handleChangeStage = async (targetIndex: number) => {
    if (!deal) return;
    const target = stagesList[targetIndex];
    if (!target) return;
    try {
      const newStatus = deriveStatusFromStage(target);
      const payload: Partial<any> = {
        status: newStatus,
        probability: typeof target.probability === 'number' ? target.probability : deal.probability,
      };
      await dealService.updateDeal(parseInt(deal.id), payload as any);
      // Optimistically update UI
      setDeal(prev => prev ? ({ ...prev, stage: target.name, status: newStatus, probability: payload.probability! }) : prev);
      toast.success(`Stage changed to ${target.name}`);
    } catch (e) {
      console.error('Failed to change stage', e);
      toast.error('Failed to change stage');
    }
  };

  const gotoPrevStage = () => handleChangeStage(Math.max(0, currentStageIndex - 1));
  const gotoNextStage = () => handleChangeStage(Math.min(stagesList.length - 1, currentStageIndex + 1));

  useEffect(() => {
    if (id) {
      fetchDeal();
    }
  }, [id]);

  // Keep URL in sync with active tab for deep-linking and refresh persistence
  useEffect(() => {
    const current = searchParams.get('tab');
    if (activeTab && current !== activeTab) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', activeTab);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fetch tab-specific data when tab changes
  useEffect(() => {
    if (!deal) return;

    switch (activeTab) {
      case 'overview':
        // Fetch data for overview tab
        fetchActivities();
        fetchTasks();
        break;
      case 'activities':
        fetchActivities();
        break;
      case 'tasks':
        fetchTasks();
        break;
      case 'communications':
        fetchCommunications();
        break;
      case 'quotations':
        fetchQuotations();
        break;
      case 'payments':
        fetchPayments();
        break;
      case 'notifications':
        fetchNotifications();
        break;
    }
  }, [activeTab, deal]);

  const fetchDeal = async () => {
    try {
      setIsLoading(true);
      const response = await dealService.getDeal(parseInt(id!));
      const dealData = response.data;

      // Map API response to Deal interface with proper field extraction
      const mappedDeal = {
        ...dealData,
        id: dealData.id?.toString() || id!,
        value: Number(dealData.value ?? 0),
        contactName: dealData.contact ? `${dealData.contact.firstName} ${dealData.contact.lastName}` : undefined,
        contactId: dealData.contact?.id?.toString(),
        companyName: dealData.companies?.name,
        assignedToName: dealData.assignedUser ? `${dealData.assignedUser.firstName} ${dealData.assignedUser.lastName}` : undefined,
        assignedToId: dealData.assignedUser?.id?.toString(),
        leadId: dealData.lead?.id?.toString() || dealData.leadId?.toString(),
        leadName: dealData.lead ? `${dealData.lead.firstName} ${dealData.lead.lastName}` : undefined,
      };

      setDeal(mappedDeal);

      // If this deal came from a lead, fetch the lead details for company/contact info
      if (mappedDeal.leadId) {
        fetchLeadDetails(mappedDeal.leadId);
      }

      // Set initial tasks from deal response
      if (dealData.tasks && dealData.tasks.length > 0) {
        setTasks(dealData.tasks);
      }
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

  // Fetch dynamic data functions
  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      // Prefer activities linked to the source lead if available
      if (deal?.leadId) {
        const res = await activityService.getActivitiesByLeadId(parseInt(deal.leadId), 1, 5);
        const items = res?.data?.items || res?.items || res?.data?.activities || [];
        setActivities(items);
        return;
      }
      // Fallback: show global recent activities (best-effort)
      const res = await activityService.getRecentActivities(5);
      const items = res?.data?.items || res?.items || [];
      setActivities(items);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchLeadDetails = async (leadId: string) => {
    try {
      setLeadLoading(true);
      const res = await leadService.getLeadById(parseInt(leadId));
      const raw = (res && (res.data?.lead || res.data || res.lead)) ?? res;
      setLeadDetails(raw);
    } catch (e) {
      console.error('Failed to fetch linked lead details:', e);
      setLeadDetails(null);
    } finally {
      setLeadLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      // Try modern query first (entityType/entityId), also pass dealId for back-compat
      const res = await tasksService.list({
        page: 1,
        limit: 10,
        status: 'PENDING,IN_PROGRESS',
        entityType: 'deal',
        entityId: deal?.id || id!,
        dealId: deal ? parseInt(deal.id) : parseInt(id!),
      });
      const list = res?.data?.tasks || res?.data?.items || res?.tasks || res?.items || [];
      // Sort: by dueDate (earliest first), else by createdAt desc
      const sorted = [...list].sort((a: any, b: any) => {
        if (a?.dueDate && b?.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a?.dueDate) return -1;
        if (b?.dueDate) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setTasks(sorted);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchCommunications = async () => {
    try {
      setCommunicationsLoading(true);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      // If deal is linked to a lead, mirror communications and calls from the lead profile
      if (deal?.leadId) {
        const leadId = deal.leadId;
        const [msgsRes, callsRes] = await Promise.all([
          fetch(`/api/communication/messages/lead/${leadId}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch(`/api/call-logs/lead/${leadId}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          })
        ]);

        if (msgsRes.ok) {
          const data = await msgsRes.json();
          const msgs = data?.data?.messages || data?.messages || [];
          // Map to CommunicationCenter shape
          const mapped = msgs.map((m: any) => ({
            id: String(m.id),
            type: m.type, // 'EMAIL' | 'WHATSAPP' | 'SMS'
            subject: m.subject,
            content: m.content,
            direction: (m.direction || '').toLowerCase(), // 'inbound' | 'outbound'
            createdAt: m.sentAt || m.createdAt,
            user: m.user ? { firstName: m.user.firstName, lastName: m.user.lastName } : undefined,
          }));
          setCommunications(mapped);
        }
        if (callsRes.ok) {
          const data = await callsRes.json();
          setCallLogs(data?.data?.callLogs || data?.callLogs || []);
        }
        return;
      }

      // Fallback: deal-scoped communications
      const [commResponse, callsResponse] = await Promise.all([
        fetch(`/api/communications?entityType=deal&entityId=${id}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(`/api/call-logs?entityType=deal&entityId=${id}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
      ]);

      if (commResponse.ok) {
        const data = await commResponse.json();
        setCommunications(data.data?.communications || data.communications || []);
      }
      if (callsResponse.ok) {
        const data = await callsResponse.json();
        setCallLogs(data.data?.callLogs || data.callLogs || []);
      }
    } catch (error) {
      console.error('Failed to fetch communications:', error);
    } finally {
      setCommunicationsLoading(false);
    }
  };

  const fetchQuotations = async () => {
    try {
      setQuotationsLoading(true);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      // Fetch quotations and invoices in parallel
      const [quotesResponse, invoicesResponse] = await Promise.all([
        fetch(`/api/quotations?entityType=deal&entityId=${id}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(`/api/invoices?entityType=deal&entityId=${id}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
      ]);

      if (quotesResponse.ok) {
        const data = await quotesResponse.json();
        setQuotations(data.data?.quotations || data.quotations || []);
      }

      if (invoicesResponse.ok) {
        const data = await invoicesResponse.json();
        setInvoices(data.data?.invoices || data.invoices || []);
      }
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
    } finally {
      setQuotationsLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      const [paymentsResponse, invoicesResponse] = await Promise.all([
        fetch(`/api/payments?entityType=deal&entityId=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/invoices?entityType=deal&entityId=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (paymentsResponse.ok) {
        const data = await paymentsResponse.json();
        setPayments(data.data?.payments || data.payments || []);
      }

      if (invoicesResponse.ok) {
        const data = await invoicesResponse.json();
        setInvoices(data.data?.invoices || data.invoices || []);
      }
    } catch (error) {
      console.error('Failed to fetch payments or invoices:', error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`/api/notifications?entityType=deal&entityId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data?.notifications || data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="mx-auto p-6">
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
    <div className="mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/deals"
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Deals
          </Link>
        </div>
        <div className="flex space-x-3">
          {deal.leadId && (
            <Button
              variant="OUTLINE"
              onClick={handleUndoConversion}
              disabled={isUndoingConversion}
              className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
            >
              <RotateCcw size={16} />
              {isUndoingConversion ? 'Undoing...' : 'Undo Conversion'}
            </Button>
          )}
          {hasPermission('deal.update') && (
            <Button
              variant="OUTLINE"
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

      {/* Deal Header Card */}
      <Card variant="ELEVATED" className="p-6 rounded-2xl shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4">
              <DollarSign size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {deal.companyName || leadDetails?.company || '—'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Deal: <span className="font-semibold text-gray-900 dark:text-white">{deal.title}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(deal.status)}`}
                >
                  {deal.status}
                </span>
                <span
                  className="px-2.5 py-1 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: getStageColor(deal.stage) }}
                >
                  {deal.stage}
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityColor(deal.priority)}`}>
                  {deal.priority}
                </span>
                {/* Stage Controls */}
                <div className="ml-2 flex items-center gap-2">
                  <button onClick={gotoPrevStage} className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Prev</button>
                  <select
                    className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    value={stagesList[currentStageIndex]?.name || ''}
                    onChange={(e) => {
                      const idx = stagesList.findIndex((s: any) => s.name === e.target.value);
                      handleChangeStage(idx);
                    }}
                  >
                    {stagesList.map((s: any) => (
                      <option key={s.id || s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <button onClick={gotoNextStage} className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Next</button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {deal.probability}% win probability • Expected close: {
                  deal.expectedCloseDate
                    ? new Date(deal.expectedCloseDate).toLocaleDateString()
                    : 'Not set'
                }
              </p>

              {(deal.companyName || leadDetails?.company || leadDetails) && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  {(deal.companyName || leadDetails?.company) && (
                    <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
                      <Building size={14} className="mr-1.5 text-blue-500" />
                      {deal.companyName || leadDetails?.company}
                    </span>
                  )}
                  {leadDetails && (
                    <>
                      <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
                        <User size={14} className="mr-1.5 text-emerald-500" />
                        {`${leadDetails.firstName || ''} ${leadDetails.lastName || ''}`.trim()}
                      </span>
                      {leadDetails.email && (
                        <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
                          <Mail size={14} className="mr-1.5 text-indigo-500" />
                          {leadDetails.email}
                        </span>
                      )}
                      {leadDetails.phone && (
                        <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
                          <Phone size={14} className="mr-1.5 text-purple-500" />
                          {leadDetails.phone}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}

              {deal.leadId && (
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
                  <span className="text-gray-500">Converted from lead:</span>{' '}
                  <Link
                    to={`/leads/${deal.leadId}`}
                    className="text-weconnect-red hover:underline font-medium"
                  >
                    {deal.leadName || `Lead #${deal.leadId}`}
                  </Link>
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(deal.value, deal.currency)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Opportunity Value
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Expected Revenue: {formatCurrency(deal.value * (deal.probability / 100), deal.currency)}
            </p>
          </div>
        </div>

        {/* Pipeline Stepper */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Pipeline</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{deal.stage}</span>
          </div>
          <div className="flex items-center">
            {stagesList.map((s: any, idx: number) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const color = getStageColor(s.name);
              return (
                <React.Fragment key={s.name}>
                  <div className="flex flex-col items-center min-w-[60px]">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                        isCurrent ? 'bg-white text-gray-800' : 'bg-white text-gray-400'
                        }`}
                      style={isCurrent ? { borderColor: color } : {}}
                      title={s.name}
                    >
                      {isCompleted ? '✓' : ''}
                    </div>
                    <span className={`mt-2 text-[11px] ${isCompleted || isCurrent ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} truncate max-w-[100px]`}>{s.name}</span>
                  </div>
                  {idx < stagesList.length - 1 && (
                    <div className="w-10 sm:w-16 md:w-24 h-[2px] mx-2 rounded-full bg-gray-300 dark:bg-gray-600">
                      <div
                        className="h-[2px] rounded-full"
                        style={{ width: isCompleted ? '100%' : '0%', backgroundColor: color }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" role="tablist" aria-label="Deal profile tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${isActive
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

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div id="panel-overview" role="tabpanel" aria-labelledby="overview" className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deal Value</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(deal.value, deal.currency)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expected Revenue</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(deal.value * (deal.probability / 100), deal.currency)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Win Probability</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{deal.probability}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Target size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Days to Close</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {deal.expectedCloseDate
                        ? Math.max(0, Math.ceil((new Date(deal.expectedCloseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Clock size={20} className="text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Deal Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Deal Information
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Created {new Date(deal.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Deal Title
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{deal.title}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Deal Value
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                          {formatCurrency(deal.value, deal.currency)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Expected Revenue
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                          {formatCurrency(deal.value * (deal.probability / 100), deal.currency)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Pipeline Stage
                        </label>
                        <p className="mt-1">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getStageColor(deal.stage) }}
                          >
                            {deal.stage}
                          </span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Expected Close Date
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {deal.expectedCloseDate
                            ? new Date(deal.expectedCloseDate).toLocaleDateString()
                            : 'Not set'
                          }
                        </p>
                      </div>

                      {deal.leadId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Source Lead
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            <Link
                              to={`/leads/${deal.leadId}`}
                              className="hover:text-weconnect-red transition-colors font-medium"
                            >
                              {deal.leadName || `Lead #${deal.leadId}`}
                            </Link>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                            {deal.status}
                          </span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Win Probability
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{deal.probability}%</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Priority
                        </label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(deal.priority)}`}>
                            {deal.priority}
                          </span>
                        </p>
                      </div>

                      {(deal.contactName || leadDetails) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Contact Person
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <User size={14} className="text-gray-400" />
                            {deal.contactName || (leadDetails ? `${leadDetails.firstName || ''} ${leadDetails.lastName || ''}`.trim() : '—')}
                          </p>
                        </div>
                      )}

                      {(deal.companyName || leadDetails?.company) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Company
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <Building size={14} className="text-gray-400" />
                            {deal.companyName || leadDetails?.company}
                          </p>
                        </div>
                      )}

                      {leadDetails?.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Email
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            {leadDetails.email}
                          </p>
                        </div>
                      )}

                      {leadDetails?.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Phone
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            {leadDetails.phone}
                          </p>
                        </div>
                      )}

                      {(leadDetails?.address || leadDetails?.city || leadDetails?.state || leadDetails?.zipCode || leadDetails?.country) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Address
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-start gap-2">
                            <MapPin size={14} className="text-gray-400 mt-0.5" />
                            <span>
                              {[
                                leadDetails?.address,
                                [leadDetails?.city, leadDetails?.state].filter(Boolean).join(', '),
                                [leadDetails?.zipCode, leadDetails?.country].filter(Boolean).join(' ')
                              ].filter(Boolean).join(' • ')}
                            </span>
                          </p>
                        </div>
                      )}

                      {deal.assignedToName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Sales Rep
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{deal.assignedToName}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {deal.description && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Description
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                        {deal.description}
                      </p>
                    </div>
                  )}

                  {deal.notes && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Notes
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                        {deal.notes}
                      </p>
                    </div>
                  )}

                  {deal.tags && deal.tags.length > 0 && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {deal.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Recent Activities Summary */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Activities
                    </h3>
                    <Button
                      size="SM"
                      variant="GHOST"
                      onClick={() => setActiveTab('activities')}
                    >
                      View All
                    </Button>
                  </div>
                  {activitiesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-weconnect-red"></div>
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.slice(0, 3).map((activity: any) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Activity size={16} className="text-gray-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      No recent activities
                    </p>
                  )}
                </Card>

                {/* Products/Services */}
                {deal.products && deal.products.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Products & Services
                    </h3>
                    <div className="space-y-3">
                      {deal.products.map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Quantity: {product.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(product.price * product.quantity, deal.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Next Steps / Action Items */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Next Steps
                    </h3>
                    <Button
                      size="SM"
                      variant="GHOST"
                      onClick={() => setActiveTab('tasks')}
                    >
                      View All
                    </Button>
                  </div>
                  {tasksLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-weconnect-red"></div>
                    </div>
                  ) : tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.slice(0, 3).map((task: any) => (
                        <div key={task.id} className="flex items-start space-x-3">
                          <CheckCircle size={16} className="text-gray-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </p>
                            {task.dueDate && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      No pending tasks
                    </p>
                  )}
                </Card>

                {/* Timeline & Dates */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar size={18} className="mr-3 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {deal.expectedCloseDate && (
                      <div className="flex items-center">
                        <Calendar size={18} className="mr-3 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Expected Close</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {deal.actualCloseDate && (
                      <div className="flex items-center">
                        <CheckCircle size={18} className="mr-3 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(deal.actualCloseDate).toLocaleDateString()}
                          </p>
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
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pipeline Progress
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Current Stage: {deal.stage}</span>
                  <span>{deal.probability}% Win Probability</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                    style={{
                      width: `${deal.probability}%`,
                      backgroundColor: getStageColor(deal.stage)
                    }}
                  >
                    <span className="text-xs text-white font-semibold">{deal.probability}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Expected Outcome</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Deal Value</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(deal.value, deal.currency)}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expected Revenue</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(deal.value * (deal.probability / 100), deal.currency)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <span className="text-gray-900 dark:text-white">{new Date(deal.createdAt).toLocaleDateString()}</span>
                  </div>
                  {deal.expectedCloseDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Expected Close</span>
                      <span className="text-gray-900 dark:text-white font-semibold">{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {deal.actualCloseDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Closed</span>
                      <span className="text-gray-900 dark:text-white">{new Date(deal.actualCloseDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'activities' && (
          activitiesLoading ? (
            <Card className="p-6" id="panel-activities" role="tabpanel" aria-labelledby="activities">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
              </div>
            </Card>
          ) : (
            <div id="panel-activities" role="tabpanel" aria-labelledby="activities">
              <ActivityTimeline
                entityType="deal"
                entityId={deal.id}
                activities={activities}
              />
            </div>
          )
        )}

        {activeTab === 'tasks' && (
          tasksLoading ? (
            <Card className="p-6" id="panel-tasks" role="tabpanel" aria-labelledby="tasks">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
              </div>
            </Card>
          ) : (
            <div id="panel-tasks" role="tabpanel" aria-labelledby="tasks">
              <TaskManager
                entityType="deal"
                entityId={deal.id}
                tasks={tasks}
              />
            </div>
          )
        )}

        {activeTab === 'communications' && (
          <div id="panel-communications" role="tabpanel" aria-labelledby="communications">
            {deal.leadId && leadDetails ? (
              <LeadCommunication
                lead={{
                  id: parseInt(deal.leadId),
                  firstName: leadDetails.firstName || '',
                  lastName: leadDetails.lastName || '',
                  email: leadDetails.email || '',
                  phone: leadDetails.phone || '',
                  company: leadDetails.company || deal.companyName || ''
                }}
              />
            ) : (
              communicationsLoading ? (
                <Card className="p-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
                  </div>
                </Card>
              ) : (
                <CommunicationCenter
                  entityType="deal"
                  entityId={deal.id}
                  communications={communications}
                  callLogs={callLogs}
                />
              )
            )}
          </div>
        )}

        {activeTab === 'quotations' && (
          quotationsLoading ? (
            <Card className="p-6" id="panel-quotations" role="tabpanel" aria-labelledby="quotations">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
              </div>
            </Card>
          ) : (
            <div id="panel-quotations" role="tabpanel" aria-labelledby="quotations">
              <QuotationManager
                entityType="deal"
                entityId={deal.id}
                quotations={quotations}
                invoices={invoices}
              />
            </div>
          )
        )}

        {activeTab === 'payments' && (
          paymentsLoading ? (
            <Card className="p-6" id="panel-payments" role="tabpanel" aria-labelledby="payments">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
              </div>
            </Card>
          ) : (
            <div id="panel-payments" role="tabpanel" aria-labelledby="payments">
              <PaymentTracker
                entityType="deal"
                entityId={deal.id}
                payments={payments}
                invoices={invoices}
                currency={deal.currency}
              />
            </div>
          )
        )}

        {activeTab === 'notifications' && (
          <div id="panel-notifications" role="tabpanel" aria-labelledby="notifications">
            <NotificationPanel
              entityType="deal"
              entityId={deal.id}
              notifications={notifications}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DealProfileEnhanced;
