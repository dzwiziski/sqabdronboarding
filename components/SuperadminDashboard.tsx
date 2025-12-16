import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, RefreshCw, X, Eye, EyeOff, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers, updateUserProfile, deleteUserProfile, UserProfile } from '../services/firestoreService';
import { getNextMonday } from '../utils/dateUtils';
import AISettingsPanel from './AISettingsPanel';

interface UserWithId {
    id: string;
    profile: UserProfile;
}

const SuperadminDashboard: React.FC = () => {
    const { createUserAsAdmin } = useAuth();
    const [users, setUsers] = useState<UserWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'superadmin' | 'manager' | 'bdr'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithId | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'ai-settings'>('users');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'bdr' as 'bdr' | 'manager',
        managerId: '',
        startDate: getNextMonday(new Date()).toISOString().split('T')[0]
    });
    const [showPassword, setShowPassword] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = users.filter(u => filter === 'all' || u.profile.role === filter);
    const managers = users.filter(u => u.profile.role === 'manager');

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);

        try {
            await createUserAsAdmin(
                formData.email,
                formData.password,
                formData.name,
                formData.role,
                formData.role === 'bdr' ? formData.managerId || null : null,
                formData.role === 'bdr' && formData.startDate ? new Date(formData.startDate + 'T00:00:00') : null
            );
            setShowCreateModal(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'bdr',
                managerId: '',
                startDate: getNextMonday(new Date()).toISOString().split('T')[0]
            });
            await loadUsers();
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateUser = async (userId: string, updates: any) => {
        try {
            await updateUserProfile(userId, updates);
            await loadUsers();
            setEditingUser(null);
        } catch (err) {
            console.error('Error updating user:', err);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

        try {
            await deleteUserProfile(userId);
            await loadUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superadmin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'bdr': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Shield size={24} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Superadmin Dashboard</h2>
                        <p className="text-sm text-slate-400">Manage users and AI settings</p>
                    </div>
                </div>
                {activeTab === 'users' && (
                    <div className="flex gap-2">
                        <button onClick={loadUsers} className="p-2 text-slate-400 hover:text-white transition-colors" title="Refresh">
                            <RefreshCw size={18} />
                        </button>
                        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors">
                            <Plus size={18} /> Create User
                        </button>
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'users'
                        ? 'text-blue-400 border-blue-400'
                        : 'text-slate-400 border-transparent hover:text-white'
                        }`}
                >
                    <Users size={18} />
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('ai-settings')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'ai-settings'
                        ? 'text-blue-400 border-blue-400'
                        : 'text-slate-400 border-transparent hover:text-white'
                        }`}
                >
                    <Settings size={18} />
                    AI Settings
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'ai-settings' ? (
                <AISettingsPanel />
            ) : (
                <>

                    {/* Filters */}
                    <div className="flex gap-2">
                        {['all', 'superadmin', 'manager', 'bdr'].map(f => (
                            <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                {f !== 'all' && <span className="ml-1 text-xs">({users.filter(u => u.profile.role === f).length})</span>}
                            </button>
                        ))}
                    </div>

                    {/* Users Table */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Name</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Email</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Role</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Manager</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Created</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                                        <td className="px-4 py-3 text-sm text-white font-medium">{user.profile.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-400">{user.profile.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.profile.role)}`}>
                                                {user.profile.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-400">
                                            {user.profile.managerId ? users.find(u => u.id === user.profile.managerId)?.profile.name || 'Unknown' : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-400">
                                            {user.profile.createdAt?.toDate().toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-red-400 hover:text-red-300 transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <Users size={48} className="text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">No users found</p>
                            </div>
                        )}
                    </div>

                    {/* Create User Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                            <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-md w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">Create New User</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Name</label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Password</label>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Role</label>
                                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as 'bdr' | 'manager' })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                                            <option value="bdr">BDR</option>
                                            <option value="manager">Manager</option>
                                        </select>
                                    </div>
                                    {formData.role === 'bdr' && (
                                        <>
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Assign Manager</label>
                                                <select value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                                                    <option value="">No Manager</option>
                                                    {managers.map(m => <option key={m.id} value={m.id}>{m.profile.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.startDate}
                                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">Recommended: Start on a Monday</p>
                                            </div>
                                        </>
                                    )}
                                    {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800">Cancel</button>
                                        <button type="submit" disabled={creating} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white flex items-center justify-center gap-2">
                                            {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create User</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SuperadminDashboard;
