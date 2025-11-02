import React, { useEffect, useState } from 'react';
import { Button, Card, Input } from '../../components/ui';
import { CheckCircle, Clock, CalendarDays, User, Plus, Trash2 } from 'lucide-react';
import { tasksService, TaskPayload } from '../../services/tasksService';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [users, setUsers] = useState<Array<{ id: number; firstName: string; lastName: string }>>([]);
  const [form, setForm] = useState<{ title: string; description: string; dueDate: string; priority: 'LOW'|'MEDIUM'|'HIGH'|'URGENT'; assignedTo?: number | '' }>(
    { title: '', description: '', dueDate: '', priority: 'MEDIUM', assignedTo: '' }
  );

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await tasksService.list({ status: 'PENDING,IN_PROGRESS,COMPLETED', limit: 50 });
      const list = res?.data?.tasks || res?.data?.items || res?.tasks || [];
      const mapped = list.map((t: any) => ({
        ...t,
        id: String(t.id),
        assignedToUser: t.assignedUser,
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
    refresh();
  }, []);

  const createTask = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      const payload: TaskPayload = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        assignedTo: form.assignedTo === '' ? undefined : (form.assignedTo as number),
        createdBy: Number(localStorage.getItem('userId') || '1'),
      };
      await tasksService.create(payload);
      toast.success('Task created');
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

  const removeTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksService.remove(Number(taskId));
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Task Management</h1>
        <Button onClick={() => setShowNew(v => !v)} className="flex items-center gap-2">
          <Plus size={16} /> New Task
        </Button>
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

      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-weconnect-red border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </Card>
        ) : tasks.length === 0 ? (
          <Card className="p-8 text-center text-gray-600 dark:text-gray-300">No tasks yet</Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleComplete(task)} className="mt-1">
                    {task.status === 'COMPLETED' ? (
                      <CheckCircle className="text-green-600" />
                    ) : (
                      <Clock className="text-gray-400" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-semibold ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>{task.title}</h3>
                      <span className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700">
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {task.dueDate && (
                        <span className="flex items-center"><CalendarDays size={14} className="mr-1" />{new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                      {task.assignedToUser && (
                        <span className="flex items-center"><User size={14} className="mr-1" />{task.assignedToUser.firstName} {task.assignedToUser.lastName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="SM" variant="GHOST" onClick={() => removeTask(task.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksPage;
