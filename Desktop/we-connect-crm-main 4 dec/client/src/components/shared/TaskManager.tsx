import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Circle, Clock, User, Calendar, Filter, Search, 
  AlertCircle, Flag, CalendarDays,
  Target, TrendingUp
} from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { tasksService } from '../../services/tasksService';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedAt?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TaskManagerProps {
  entityType: 'lead' | 'deal' | 'contact' | 'company';
  entityId: string;
  tasks: Task[];
}

const TaskManager: React.FC<TaskManagerProps> = ({ 
  entityType, 
  entityId, 
  tasks: initialTasks 
}) => {
  const { user, hasPermission } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '', // ISO yyyy-mm-dd
  });

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

const refresh = async () => {
    try {
      setIsLoading(true);
      const res = await tasksService.list({ entityType: entityType as any, entityId, status: 'PENDING,IN_PROGRESS,COMPLETED' });
      const list = res?.data?.tasks || res?.data?.items || res?.tasks || res?.items || [];
      const mapped = list.map((t: any) => ({
        ...t,
        id: String(t.id),
        assignedTo: t.assignedUser ? { id: String(t.assignedUser.id), firstName: t.assignedUser.firstName, lastName: t.assignedUser.lastName } : undefined,
        createdBy: t.createdByUser ? { id: String(t.createdByUser.id), firstName: t.createdByUser.firstName, lastName: t.createdByUser.lastName } : undefined,
      }));
      setTasks(mapped);
    } catch (e) {
      // fall back to initial tasks
      setTasks(initialTasks || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!form.title.trim()) {
        toast.error('Please enter a task title');
        return;
      }
      const creatorId = Number((user as any)?.id || (user as any)?.userId);
      if (!creatorId) {
        toast.error('Unable to determine current user');
        return;
      }
      setIsCreating(true);
      const link: any = {};
      if (entityType === 'deal') link.dealId = Number(entityId);
      if (entityType === 'lead') link.leadId = Number(entityId);
      if (entityType === 'contact') link.contactId = Number(entityId);

      await tasksService.create({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        priority: form.priority as any,
        status: 'PENDING',
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        createdBy: creatorId,
        // Link directly using relation IDs only (leadId/dealId/contactId)
        ...link,
      });
      toast.success('Task created');
      setShowCreate(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
      await refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    })
    .sort((a, b) => {
      // Sort by priority and due date
      const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
      MEDIUM: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      HIGH: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
      URGENT: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      IN_PROGRESS: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      COMPLETED: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      CANCELLED: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'HIGH':
        return <Flag size={16} className="text-orange-600" />;
      case 'MEDIUM':
        return <TrendingUp size={16} className="text-blue-600" />;
      default:
        return <Target size={16} className="text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock size={20} className="text-blue-600" />;
      case 'CANCELLED':
        return <Circle size={20} className="text-red-600" />;
      default:
        return <Circle size={20} className="text-gray-400" />;
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'COMPLETED') {
        // Reopen task
        const res = await tasksService.update(Number(taskId), { status: 'PENDING' });
        const updated = res?.data?.task || res?.task;
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'PENDING', completedAt: undefined } : t)));
        toast.success('Task reopened');
      } else {
        const res = await tasksService.complete(Number(taskId));
        const updated = res?.data?.task || res?.task;
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() } : t)));
        toast.success('Task marked as completed');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update task');
    }
  };

  // Group tasks by status for better visualization
  const groupedTasks = {
    pending: filteredTasks.filter(task => task.status === 'PENDING'),
    inProgress: filteredTasks.filter(task => task.status === 'IN_PROGRESS'),
    completed: filteredTasks.filter(task => task.status === 'COMPLETED'),
    cancelled: filteredTasks.filter(task => task.status === 'CANCELLED')
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const overdueTasks = tasks.filter(task => task.dueDate && isOverdue(task.dueDate) && task.status !== 'COMPLETED').length;

return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Task Management
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>{totalTasks} total</span>
            <span>{completedTasks} completed</span>
            {overdueTasks > 0 && (
              <span className="text-red-600 dark:text-red-400 font-medium">{overdueTasks} overdue</span>
            )}
          </div>
        </div>
        {hasPermission('task.create') && (
          <Button onClick={() => setShowCreate(v => !v)}>{showCreate ? 'Cancel' : 'New Task'}</Button>
        )}
      </div>

      {/* Create Task */}
      {showCreate && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="Optional details"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={handleCreate} disabled={isCreating} className="bg-weconnect-red hover:bg-red-600">
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
            <Button variant="OUTLINE" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-weconnect-red focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-weconnect-red focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-weconnect-red focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{groupedTasks.completed.length} Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{groupedTasks.inProgress.length} In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>{groupedTasks.pending.length} Pending</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
{isLoading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-weconnect-red border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </Card>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Tasks Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first task to start organizing your work.'
              }
            </p>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Status Toggle */}
                  <button
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    className="mt-1 hover:scale-110 transition-transform"
                  >
                    {getStatusIcon(task.status)}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${task.status === 'COMPLETED' 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)}
                          <span className="ml-1">{task.priority}</span>
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      {task.dueDate && (
                        <div className={`flex items-center ${isOverdue(task.dueDate) && task.status !== 'COMPLETED' 
                          ? 'text-red-600 dark:text-red-400 font-medium' 
                          : ''
                        }`}>
                          <CalendarDays size={14} className="mr-1" />
                          {formatDueDate(task.dueDate)}
                        </div>
                      )}
                      
                      {task.assignedTo && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <User size={14} className="mr-1" />
                          {task.assignedTo.firstName} {task.assignedTo.lastName}
                        </div>
                      )}

                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="mr-1" />
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {task.completedAt && (
                      <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ Completed on {new Date(task.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </Card>
          ))
        )}
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedTasks} of {totalTasks} completed ({Math.round((completedTasks / totalTasks) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            ></div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TaskManager;