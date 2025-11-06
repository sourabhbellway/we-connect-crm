import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../../components/ui';
import { CheckCircle, Clock, CalendarDays, User, Plus, Search, CheckCircle2 } from 'lucide-react';
import { tasksService, TaskPayload } from '../../services/tasksService';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import ListToolbar from '../../components/list/ListToolbar';
import DropdownFilter from '../../components/DropdownFilter';
import { useAuth } from '../../contexts/AuthContext';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [users, setUsers] = useState<Array<{ id: number; firstName: string; lastName: string }>>([]);
  const [form, setForm] = useState<{ title: string; description: string; dueDate: string; priority: 'LOW'|'MEDIUM'|'HIGH'|'URGENT'; assignedTo?: number | '' }>(
    { title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' }
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const refresh = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter !== 'ALL' ? statusFilter : 'PENDING,IN_PROGRESS,COMPLETED';
      const res = await tasksService.list({ 
        status: statusParam,
        search: searchQuery || undefined,
        limit: 100 
      });
      const list = res?.data?.tasks || res?.data?.items || res?.tasks || [];
      const mapped = list.map((t: any) => ({
        ...t,
        id: String(t.id),
        assignedToUser: t.assignedUser,
        createdByUser: t.createdByUser,
        lead: t.lead,
      }));
      setTasks(mapped);
    } catch (e) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const resp = await userService.getUsers({ page: 1, limit: 100 });
        const items = resp?.data?.users || resp?.data || resp?.users || [];
        setUsers(items.map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName })));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery]);

  const createTask = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!user?.id) { toast.error('User information not available'); return; }
    try {
      // Format dueDate to ISO string if provided
      let formattedDueDate: string | undefined;
      if (form.dueDate) {
        const date = new Date(form.dueDate);
        formattedDueDate = date.toISOString();
      }
      
      const payload: TaskPayload = {
        title: form.title,
        description: form.description || undefined,
        status: 'PENDING',
        priority: form.priority,
        dueDate: formattedDueDate,
        assignedTo: form.assignedTo === '' ? undefined : (form.assignedTo as number),
        createdBy: user.id,
      };
      await tasksService.create(payload);
      toast.success('Task created successfully');
      setShowNew(false);
      setForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' });
      refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create task');
    }
  };

  const toggleComplete = async (task: any) => {
    try {
      if (task.status === 'COMPLETED') {
        await tasksService.update(Number(task.id), { status: 'PENDING' });
        toast.success('Task reopened');
      } else {
        await tasksService.complete(Number(task.id));
        toast.success('Task completed');
      }
      refresh();
    } catch {
      toast.error('Failed to update task');
    }
  };


  // Filter tasks based on priority
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="space-y-4">
        <ListToolbar
          title="Task Management"
          subtitle="Manage and track all your tasks"
          addLabel="New Task"
          onAdd={() => setShowNew(v => !v)}
        />
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-weconnect-red dark:text-white text-sm"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="w-full sm:w-48 sm:min-w-[200px]">
            <DropdownFilter
              label="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as string)}
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </div>

          {/* Priority Filter */}
          <div className="w-full sm:w-48 sm:min-w-[200px]">
            <DropdownFilter
              label="Priority"
              value={priorityFilter}
              onChange={(value) => setPriorityFilter(value as string)}
              options={[
                { value: 'ALL', label: 'All Priority' },
                { value: 'URGENT', label: 'Urgent' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
            />
          </div>
        </div>
      </div>

      {showNew && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Title</label>
              <Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" rows={3} />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Assign To</label>
              <select value={form.assignedTo ?? ''} onChange={(e) => setForm({ ...form, assignedTo: e.target.value ? Number(e.target.value) : '' })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="OUTLINE" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createTask}>Create Task</Button>
          </div>
        </Card>
      )}

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
        <div className="p-6">
        {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-weconnect-red border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No tasks found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </p>
            </div>
        ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(task);
                      }}
                      className="mt-1 flex-shrink-0"
                      title={task.status === 'COMPLETED' ? 'Reopen task' : 'Complete task'}
                    >
                    {task.status === 'COMPLETED' ? (
                        <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    ) : (
                        <Clock className="text-gray-400 dark:text-gray-500" size={20} />
                    )}
                  </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-base font-semibold ${task.status === 'COMPLETED' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                    )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                      )}
                      {task.assignedToUser && (
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {task.assignedToUser.firstName} {task.assignedToUser.lastName}
                          </span>
                        )}
                        {task.lead && (
                          <span className="flex items-center gap-1">
                            Lead: {task.lead.firstName} {task.lead.lastName}
                          </span>
                        )}
                        {task.createdByUser && (
                          <span className="flex items-center gap-1">
                            Created by: {task.createdByUser.firstName} {task.createdByUser.lastName}
                          </span>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
                </div>
          )}
              </div>
      </div>
    </div>
  );
};

export default TasksPage;
