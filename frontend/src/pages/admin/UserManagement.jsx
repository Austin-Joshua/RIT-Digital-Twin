import React, { useState, useEffect } from 'react';
import { LuSearch, LuUnlock, LuLock, LuShieldAlert, LuUserX, LuRefreshCcw } from 'react-icons/lu';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            addToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUnlock = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/unlock`);
            addToast('User account unlocked successfully', 'success');
            fetchUsers();
        } catch (error) {
            addToast('Failed to unlock user', 'error');
        }
    };

    const handleDeactivate = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this account?')) return;
        try {
            await api.post(`/admin/users/${userId}/deactivate`);
            addToast('User account deactivated', 'success');
            fetchUsers();
        } catch (error) {
            addToast('Failed to deactivate user', 'error');
        }
    };

    const handleResetPassword = async (userId) => {
        const newPassword = window.prompt('Enter new password for this user:');
        if (!newPassword) return;
        try {
            await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
            addToast('Password reset. User must change it on next login.', 'success');
        } catch (error) {
            addToast('Failed to reset password', 'error');
        }
    };

    const filteredUsers = users.filter(u => 
        (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--theme-text)]">User Account Management</h1>
                    <p className="text-[var(--theme-text-muted)]">Manage security states and credentials for university accounts</p>
                </div>
            </div>

            <div className="mb-6 relative max-w-md">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by name, email, or username..."
                    className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg-muted)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--theme-border)] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-[var(--theme-bg-muted)] text-[var(--theme-text-muted)] text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Failed Attempts</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--theme-border)] text-[var(--theme-text)]">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center">Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center">No users found</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.userId} className="hover:bg-[var(--theme-bg-muted)] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold">{user.firstName} {user.lastName}</div>
                                    <div className="text-xs text-[var(--theme-text-muted)]">{user.username}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold uppercase">
                                        {user.role?.roleName || user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1 text-xs font-medium ${
                                        user.accountStatus === 'active' ? 'text-green-500' :
                                        user.accountStatus === 'locked' ? 'text-red-500' : 'text-gray-500'
                                    }`}>
                                        {user.accountStatus === 'active' ? <LuUnlock size={14}/> : <LuLock size={14}/>}
                                        {user.accountStatus?.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-mono ${user.failedLoginAttempts > 0 ? 'text-orange-500 font-bold' : ''}`}>
                                        {user.failedLoginAttempts}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            title="Unlock Account"
                                            onClick={() => handleUnlock(user.userId)}
                                            disabled={user.accountStatus !== 'locked'}
                                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg disabled:opacity-30"
                                        >
                                            <LuUnlock size={18} />
                                        </button>
                                        <button 
                                            title="Reset Password"
                                            onClick={() => handleResetPassword(user.userId)}
                                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                                        >
                                            <LuRefreshCcw size={18} />
                                        </button>
                                        <button 
                                            title="Deactivate Account"
                                            onClick={() => handleDeactivate(user.userId)}
                                            disabled={user.accountStatus === 'deactivated'}
                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg disabled:opacity-30"
                                        >
                                            <LuUserX size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
