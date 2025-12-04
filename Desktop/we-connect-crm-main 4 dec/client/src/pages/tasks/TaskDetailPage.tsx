import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Clock, CalendarDays, User, Mail, Phone, Building,
  ArrowLeft, AlertCircle, Flag
} from 'lucide-react';
import { tasksService } from '../../services/tasksService';
import { toast } from 'react-toastify';
import BackButton from '../../components/BackButton';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

interface TaskDetail {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedAt?: string;
  assignedTo?: number;
  createdBy: number;
  leadId?: number;
  dealId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  lead?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
  };
}

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksService.get(Number(id));
      const taskData = response?.data?.task || response?.task;
      if (taskData) {
        setTask(taskData);
      } else {
        setError('Task not found');
      }
    } catch (err: any) {
      console.error('Error fetching task:', err);
      setError(err?.response?.data?.message || 'Failed to load task');
      toast.error(err?.response?.data?.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!task) return;
    try {
      setIsUpdating(true);
      if (task.status === 'COMPLETED') {
        await tasksService.update(task.id, { status: 'PENDING' });
        toast.success('Task reopened');
      } else {
        await tasksService.complete(task.id);
        toast.success('Task completed');
      }
      fetchTask();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };


  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto px-6 py-6">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-weconnect-red"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto px-6 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm">
            <AlertCircle className="h-20 w-20 text-weconnect-red mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Task not found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              The task you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button
              variant="PRIMARY"
              onClick={() => navigate('/task-management')}
              className="px-8 py-3"
            >
              Back to Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto px-6">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <BackButton to="/task-management" />
              
              {/* Actions */}
              <div className="flex items-center space-x-3">
                <Button
                  variant={task.status === 'COMPLETED' ? 'SECONDARY' : 'PRIMARY'}
                  onClick={handleToggleComplete}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {task.status === 'COMPLETED' ? (
                    <>
                      <Clock className="h-4 w-4" />
                      Reopen Task
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Complete Task
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Task Header */}
            <div className="flex items-start space-x-6">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                <div className={`h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg ${
                  task.status === 'COMPLETED' 
                    ? 'bg-green-500' 
                    : task.status === 'IN_PROGRESS'
                    ? 'bg-blue-500'
                    : 'bg-yellow-500'
                }`}>
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle className="h-10 w-10 text-white" />
                  ) : (
                    <Clock className="h-10 w-10 text-white" />
                  )}
                </div>
              </div>

              {/* Task Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {task.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${getPriorityColor(task.priority)}`}>
                    <Flag className="h-4 w-4 mr-2" />
                    {task.priority} Priority
                  </span>
                </div>

                {task.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-6">
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Task Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Priority
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </p>
                  </div>

                  {task.dueDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Due Date
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {task.completedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Completed At
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {new Date(task.completedAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Created At
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(task.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Lead Information */}
              {task.lead && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Related Lead
                    </h3>
                    <Button
                      variant="SECONDARY"
                      size="SM"
                      onClick={() => navigate(`/leads/${task.lead?.id}`)}
                    >
                      View Lead
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Name
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {task.lead.firstName} {task.lead.lastName}
                      </p>
                    </div>
                    
                    {task.lead.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Email
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {task.lead.email}
                        </p>
                      </div>
                    )}
                    
                    {task.lead.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Phone
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {task.lead.phone}
                        </p>
                      </div>
                    )}
                    
                    {task.lead.company && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Company
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {task.lead.company}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assigned To */}
              {task.assignedUser && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Assigned To
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-weconnect-red flex items-center justify-center">
                      <span className="text-white font-bold">
                        {task.assignedUser.firstName[0]}{task.assignedUser.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.assignedUser.firstName} {task.assignedUser.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Assigned User</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Created By */}
              {task.createdByUser && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Created By
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {task.createdByUser.firstName[0]}{task.createdByUser.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.createdByUser.firstName} {task.createdByUser.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Creator</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant={task.status === 'COMPLETED' ? 'SECONDARY' : 'PRIMARY'}
                    fullWidth
                    onClick={handleToggleComplete}
                    disabled={isUpdating}
                  >
                    {task.status === 'COMPLETED' ? 'Reopen Task' : 'Complete Task'}
                  </Button>
                  {task.lead && (
                    <Button
                      variant="SECONDARY"
                      fullWidth
                      onClick={() => navigate(`/leads/${task.lead?.id}`)}
                    >
                      View Lead Profile
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;

