import React, { useState, useEffect } from 'react';
import { X, Users, ArrowRight, User, AlertCircle } from 'lucide-react';
import { userService } from '../services/userService';
import { leadService, Lead } from '../services/leadService';
import { toast } from 'react-toastify';

interface LeadTransferModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete: (updatedLead: Lead) => void;
  mode: 'assign' | 'transfer'; // assign = simple assignment, transfer = transfer with notes
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles?: Array<{ name: string }>;
}

const LeadTransferModal: React.FC<LeadTransferModalProps> = ({
  lead,
  isOpen,
  onClose,
  onTransferComplete,
  mode = 'assign'
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setNotes('');
      setSelectedUserId(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({ page: 1, limit: 100 });
      // Handle different response structures
      const items = Array.isArray(response?.data) 
        ? response.data 
        : response?.data?.users || response?.data || response?.users || [];
      setUsers(items);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead) return;

    try {
      setSubmitting(true);
      
      let response;
      if (mode === 'transfer') {
        response = await leadService.transferLead(lead.id, selectedUserId, notes);
      } else {
        response = await leadService.assignLead(lead.id, selectedUserId);
      }

      const updatedLead = response.data?.lead || response.lead;
      onTransferComplete(updatedLead);
      
      const actionText = mode === 'transfer' ? 'transferred' : 'assigned';
      const userName = selectedUserId 
        ? users.find(u => u.id === selectedUserId)?.firstName + ' ' + users.find(u => u.id === selectedUserId)?.lastName
        : 'Unassigned';
      
      toast.success(`Lead ${actionText} to ${userName} successfully`);
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || `Failed to ${mode} lead`;
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = users.find(u => u.id === selectedUserId);
  const currentUser = lead?.assignedUser;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-weconnect-red rounded-lg">
              {mode === 'transfer' ? (
                <ArrowRight className="w-5 h-5 text-white" />
              ) : (
                <Users className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'transfer' ? 'Transfer Lead' : 'Assign Lead'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lead ? `${lead.firstName} ${lead.lastName}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Current Assignment */}
            {currentUser && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Currently assigned to:
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* User Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {mode === 'transfer' ? 'Transfer to:' : 'Assign to:'}
              </label>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* User Selection */}
            <div className="mb-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {/* Unassign option */}
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUserId === null
                        ? 'border-weconnect-red bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedUserId(null)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Unassigned
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Remove current assignment
                        </p>
                      </div>
                    </div>
                  </div>

                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUserId === user.id
                          ? 'border-weconnect-red bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                        {user.roles && user.roles.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300">
                            {user.roles[0].name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && searchTerm && (
                    <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      No users found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Transfer Notes (only for transfer mode) */}
            {mode === 'transfer' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transfer Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add a note about why this lead is being transferred..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            )}

            {/* Summary */}
            {selectedUser && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>{lead?.firstName} {lead?.lastName}</strong> will be {mode === 'transfer' ? 'transferred' : 'assigned'} to{' '}
                  <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                </p>
              </div>
            )}

            {selectedUserId === null && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>{lead?.firstName} {lead?.lastName}</strong> will be unassigned
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium text-white bg-weconnect-red rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{mode === 'transfer' ? 'Transferring...' : 'Assigning...'}</span>
                </div>
              ) : (
                mode === 'transfer' ? 'Transfer Lead' : 'Assign Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadTransferModal;