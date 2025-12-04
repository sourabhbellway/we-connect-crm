import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, DollarSign, Calendar, User, Building, TrendingUp, Edit, Trash2, Tag, Target,
  Phone, Mail, MessageSquare, Clock, CheckCircle, FileText, CreditCard, Bell, Plus,
  Activity, Users, BarChart3, Settings, Filter, Download, Eye
} from 'lucide-react';
import { Button, Card } from './ui';
import { dealService } from '../services/dealService';
import { useBusinessSettings } from '../contexts/BusinessSettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  useEffect(() => {
    if (id) {
      fetchDeal();
    }
  }, [id]);

  const fetchDeal = async () => {
    try {
      setIsLoading(true);
      const response = await dealService.getDeal(parseInt(id!));
      setDeal(response.data);
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
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

      {/* Deal Info Card */}
      <Card variant="ELEVATED" className="mb-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <DollarSign size={36} className="text-white" />
          </div>
          <div className="ml-6 flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {deal.title}
              </h1>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(deal.value, deal.currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center mt-2 space-x-3">
              <span 
                className="px-3 py-1 text-sm font-medium rounded-full text-white"
                style={{ backgroundColor: getStageColor(deal.stage) }}
              >
                {deal.stage}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {deal.probability}% probability
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Deal Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign size={18} className="mr-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Deal Value</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(deal.value, deal.currency)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Target size={18} className="mr-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stage</p>
                  <p className="text-gray-900 dark:text-white">{deal.stage}</p>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp size={18} className="mr-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Probability</p>
                  <p className="text-gray-900 dark:text-white">{deal.probability}%</p>
                </div>
              </div>
              {deal.contactName && (
                <div className="flex items-center">
                  <User size={18} className="mr-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact</p>
                    <p className="text-gray-900 dark:text-white">
                      {deal.contactId ? (
                        <Link 
                          to={`/contacts/${deal.contactId}`}
                          className="hover:text-weconnect-red transition-colors"
                        >
                          {deal.contactName}
                        </Link>
                      ) : (
                        deal.contactName
                      )}
                    </p>
                  </div>
                </div>
              )}
              {deal.companyName && (
                <div className="flex items-center">
                  <Building size={18} className="mr-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                    <p className="text-gray-900 dark:text-white">{deal.companyName}</p>
                  </div>
                </div>
              )}
              {deal.assignedToName && (
                <div className="flex items-center">
                  <User size={18} className="mr-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                    <p className="text-gray-900 dark:text-white">{deal.assignedToName}</p>
                  </div>
                </div>
              )}
              {deal.expectedCloseDate && (
                <div className="flex items-center">
                  <Calendar size={18} className="mr-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expected Close</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(deal.expectedCloseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Additional Details
            </h3>
            
            {deal.description && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-line">{deal.description}</p>
                </div>
              </div>
            )}
            
            {deal.tags && deal.tags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <Tag size={18} className="mr-4 text-gray-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tags</p>
                </div>
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
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-line">{deal.notes}</p>
                </div>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Created: {new Date(deal.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {new Date(deal.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Deal Progress</span>
            <span>{deal.probability}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-300" 
              style={{ 
                width: `${deal.probability}%`,
                backgroundColor: getStageColor(deal.stage)
              }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Deal Activity
        </h3>
        <div className="text-center py-8">
          <Calendar size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Deal activity and communication history will be displayed here
          </p>
        </div>
      </div>

      {/* Related Records */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Related Records
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Associated Contact</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Contact information will be linked here
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Associated Company</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Company information will be linked here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealProfile;