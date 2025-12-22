import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Button, Card, PageLoader } from '../../components/ui';
import { toast } from 'react-toastify';
import { teamsService, Team } from '../../services/teamsService';
import { userService } from '../../services/userService';

const TeamsPage = () => {
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTeam, setEditTeam] = useState<Team | null>(null);
    const [viewTeam, setViewTeam] = useState<Team | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        managerId: '',
        memberIds: [] as string[],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamsData, usersResponse] = await Promise.all([
                teamsService.getAll(),
                userService.getUsers(),
            ]);
            setTeams(teamsData);
            // Handle both paginated and non-paginated responses
            const fetchedUsers = usersResponse.data?.users || (Array.isArray(usersResponse.data) ? usersResponse.data : []) || [];
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (team?: Team) => {
        if (team) {
            setEditTeam(team);
            setFormData({
                name: team.name,
                description: team.description || '',
                managerId: team.managerId?.toString() || '',
                memberIds: team.members?.map(m => m.id.toString()) || [],
            });
        } else {
            setEditTeam(null);
            setFormData({
                name: '',
                description: '',
                managerId: '',
                memberIds: [],
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditTeam(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                managerId: formData.managerId ? parseInt(formData.managerId) : undefined,
                memberIds: formData.memberIds.map(id => parseInt(id)),
            };

            if (editTeam) {
                await teamsService.update(editTeam.id, payload);
                toast.success('Team updated successfully');
            } else {
                await teamsService.create(payload);
                toast.success('Team created successfully');
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error saving team:', error);
            toast.error('Failed to save team');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this team? Members will be unassigned.')) {
            try {
                await teamsService.delete(id);
                toast.success('Team deleted successfully');
                fetchData();
            } catch (error) {
                console.error('Error deleting team:', error);
                toast.error('Failed to delete team');
            }
        }
    };

    const handleMemberSelection = (userId: string) => {
        setFormData(prev => {
            const currentMembers = prev.memberIds;
            if (currentMembers.includes(userId)) {
                return { ...prev, memberIds: currentMembers.filter(id => id !== userId) };
            } else {
                return { ...prev, memberIds: [...currentMembers, userId] };
            }
        });
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <PageLoader />;

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage teams, managers, and members
                    </p>
                </div>
                <Button variant="PRIMARY" onClick={() => handleOpenModal()} icon={<Plus size={18} />}>
                    Create Team
                </Button>
            </div>

            <Card>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-medium">Team Name</th>
                                <th className="px-6 py-4 font-medium">Manager</th>
                                <th className="px-6 py-4 font-medium">Members</th>
                                <th className="px-6 py-4 font-medium">Created At</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredTeams.length > 0 ? (
                                filteredTeams.map((team) => (
                                    <tr key={team.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{team.name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {team.manager ? `${team.manager.firstName} ${team.manager.lastName}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {team._count?.members || 0} Members
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {new Date(team.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => setViewTeam(team)}
                                                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(team)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(team.id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No teams found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editTeam ? 'Edit Team' : 'Create Team'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Team Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Team Lead (Manager)
                                </label>
                                <select
                                    value={formData.managerId}
                                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Manager</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Team Members
                                </label>
                                <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                                    {users
                                        .filter(user => !user.teamId || (editTeam && user.teamId === editTeam.id))
                                        .map(user => (
                                            <div key={user.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.memberIds.includes(user.id.toString())}
                                                    onChange={() => handleMemberSelection(user.id.toString())}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {user.firstName} {user.lastName} ({user.email})
                                                    {user.team && <span className="text-xs text-gray-400 ml-1">({user.team.name})</span>}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select users to add to this team.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button variant="SECONDARY" onClick={handleCloseModal} type="button">
                                    Cancel
                                </Button>
                                <Button variant="PRIMARY" type="submit">
                                    {editTeam ? 'Update Team' : 'Create Team'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Team Details
                            </h2>
                            <button
                                onClick={() => setViewTeam(null)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Name</h3>
                                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{viewTeam.name}</p>
                            </div>

                            {viewTeam.description && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                                    <p className="text-base text-gray-700 dark:text-gray-300 mt-1">{viewTeam.description}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Manager</h3>
                                <div className="flex items-center mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold mr-3">
                                        {viewTeam.manager?.firstName?.[0] || 'M'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {viewTeam.manager?.firstName} {viewTeam.manager?.lastName}
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">Team Lead</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Team Members ({viewTeam.members?.length || 0})
                                </h3>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                                    {viewTeam.members && viewTeam.members.length > 0 ? (
                                        viewTeam.members.map((member) => (
                                            <div key={member.id} className="p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium text-xs mr-3">
                                                    {member.firstName[0]}{member.lastName[0]}
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {member.firstName} {member.lastName}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                                            No members assigned to this team.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <Button variant="SECONDARY" onClick={() => setViewTeam(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;
