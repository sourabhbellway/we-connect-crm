import React, { useState, useEffect } from 'react';
import {
    Plus, Edit, Trash2, Webhook as WebhookIcon,
    CheckCircle, XCircle, Clock, Zap, Shield, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { Card, Button, Input } from '../../components/ui';
import FormModal from '../../components/FormModal';

interface Webhook {
    id: number;
    name: string;
    url: string;
    events: string[];
    secret?: string;
    isActive: boolean;
    createdAt: string;
}

const AVAILABLE_EVENTS = [
    { id: 'lead.created', label: 'Lead Created', description: 'Triggered when a new lead is added' },
    { id: 'lead.status_changed', label: 'Lead Status Changed', description: 'Triggered when a lead status is updated' },
    { id: 'lead.assigned', label: 'Lead Assigned', description: 'Triggered when a lead is assigned to a user' },
    { id: 'deal.created', label: 'Deal Created', description: 'Triggered when a new deal is created' },
    { id: 'deal.won', label: 'Deal Won', description: 'Triggered when a deal stage is moved to Won' },
    { id: 'deal.lost', label: 'Deal Lost', description: 'Triggered when a deal stage is moved to Lost' },
    { id: 'task.due', label: 'Task Due', description: 'Triggered when a task reaches its due date' },
];

const WebhooksPage: React.FC = () => {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        events: [] as string[],
        secret: '',
        isActive: true
    });

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/webhooks-management');
            setWebhooks(response.data.data.webhooks);
        } catch (error) {
            console.error('Error fetching webhooks:', error);
            toast.error('Failed to load webhooks');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            url: '',
            events: [],
            secret: '',
            isActive: true
        });
        setEditingWebhook(null);
    };

    const handleEdit = (webhook: Webhook) => {
        setEditingWebhook(webhook);
        setFormData({
            name: webhook.name,
            url: webhook.url,
            events: webhook.events,
            secret: webhook.secret || '',
            isActive: webhook.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this webhook?')) return;

        try {
            await apiClient.delete(`/webhooks-management/${id}`);
            toast.success('Webhook deleted successfully');
            fetchWebhooks();
        } catch (error) {
            toast.error('Failed to delete webhook');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.url || formData.events.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            if (editingWebhook) {
                await apiClient.put(`/webhooks-management/${editingWebhook.id}`, formData);
                toast.success('Webhook updated successfully');
            } else {
                await apiClient.post('/webhooks-management', formData);
                toast.success('Webhook created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchWebhooks();
        } catch (error) {
            toast.error('Failed to save webhook');
        } finally {
            setSaving(false);
        }
    };

    const toggleEvent = (eventId: string) => {
        setFormData(prev => ({
            ...prev,
            events: prev.events.includes(eventId)
                ? prev.events.filter(e => e !== eventId)
                : [...prev.events, eventId]
        }));
    };

    const handleTest = async (id: number) => {
        try {
            toast.info('Sending test ping...');
            const response = await apiClient.post(`/webhooks-management/${id}/test`);
            toast.success(response.data.message || 'Test successful!');
        } catch (error) {
            toast.error('Webhook test failed');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <WebhookIcon className="h-7 w-7 text-weconnect-red" />
                        Webhooks
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configure external URLs to be notified when events occur in your CRM
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Webhook
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-weconnect-red" />
                </div>
            ) : webhooks.length === 0 ? (
                <Card variant="OUTLINED" className="text-center py-12">
                    <WebhookIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No webhooks configured</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Get started by adding your first webhook to sync your CRM data with other applications.
                    </p>
                    <Button onClick={() => setShowModal(true)}>Create Webhook</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {webhooks.map((webhook) => (
                        <Card key={webhook.id} variant="ELEVATED" className="overflow-hidden group">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {webhook.name}
                                            </h3>
                                            {webhook.isActive ? (
                                                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    <CheckCircle className="h-3 w-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                                    <XCircle className="h-3 w-3" /> Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-mono bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded truncate">
                                            <Zap className="h-3 w-3 text-weconnect-red flex-shrink-0" />
                                            {webhook.url}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 transition-opacity">
                                        <Button variant="OUTLINE" size="SM" onClick={() => handleTest(webhook.id)}>
                                            Test
                                        </Button>
                                        <Button variant="OUTLINE" size="SM" onClick={() => handleEdit(webhook)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="DESTRUCTIVE" size="SM" onClick={() => handleDelete(webhook.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {webhook.events.map(event => (
                                        <span key={event} className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-800">
                                            {event}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Added on {new Date(webhook.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" /> SECURE (HMAC-SHA256)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Webhook Modal using FormModal */}
            {showModal && (
                <FormModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
                    onSubmit={handleSubmit}
                    submitText={editingWebhook ? 'Update Webhook' : 'Create Webhook'}
                    disabled={saving}
                >
                    <div className="space-y-4 pt-2">
                        <Input
                            label="Webhook Name"
                            placeholder="e.g. Integration"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Target URL"
                            placeholder="https://your-api.com/webhook"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                        />
                        {/* <Input
              label="Secret (Optional)"
              placeholder="Custom secret for signature verification"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              type="password"
            /> */}

                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Subscription Events
                            </label>
                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg dark:border-gray-700">
                                {AVAILABLE_EVENTS.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => toggleEvent(event.id)}
                                        className={`
                      p-2 rounded-lg border cursor-pointer transition-all duration-200
                      ${formData.events.includes(event.id)
                                                ? 'border-weconnect-red bg-red-50 dark:bg-red-900/10'
                                                : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}
                    `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                {event.label}
                                            </span>
                                            {formData.events.includes(event.id) && <CheckCircle className="h-3 w-3 text-weconnect-red" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="rounded text-weconnect-red focus:ring-weconnect-red"
                            />
                            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                                Enable this webhook
                            </label>
                        </div>
                    </div>
                </FormModal>
            )}
        </div>
    );
};

export default WebhooksPage;
