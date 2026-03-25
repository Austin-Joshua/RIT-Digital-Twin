import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const ClubsPage = () => {
    const { user } = useAuth();
    const role = (user?.role || '').replace('ROLE_', '').toUpperCase();

    const [clubs, setClubs] = useState([]);
    const [myMemberships, setMyMemberships] = useState([]);
    const [studentRef, setStudentRef] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [clubMembers, setClubMembers] = useState([]);
    const [memberFilters, setMemberFilters] = useState({ query: '', status: 'all' });
    const [memberEdits, setMemberEdits] = useState({});
    const [newMembership, setNewMembership] = useState({
        studentIdNumber: '',
        roleType: 'member',
        joinedDate: new Date().toISOString().slice(0, 10),
        status: 'active'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [newClub, setNewClub] = useState({
        clubName: '',
        description: '',
        category: 'technical',
        contactEmail: '',
        status: 'active'
    });

    const canManageClubs = role === 'ADMIN';
    const canManageMembers = role === 'ADMIN' || role === 'FACULTY' || role === 'HOD';
    const canViewAnalytics = role === 'ADMIN' || role === 'HOD';

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            const clubsPromise = api.get('/clubs');
            const studentInvolvementPromise = role === 'STUDENT' ? api.get('/clubs/student/me/involvement') : Promise.resolve({ data: [] });
            const studentRefPromise = role === 'STUDENT' ? api.get('/clubs/student/me') : Promise.resolve({ data: null });
            const analyticsPromise = canViewAnalytics ? api.get('/clubs/analytics') : Promise.resolve({ data: null });
            const facultyPromise = canManageClubs || canViewAnalytics ? api.get('/clubs/faculty-options') : Promise.resolve({ data: [] });

            const [clubsRes, studentRes, studentRefRes, analyticsRes, facultyRes] = await Promise.all([
                clubsPromise,
                studentInvolvementPromise,
                studentRefPromise,
                analyticsPromise,
                facultyPromise
            ]);
            const clubsData = clubsRes?.data || [];
            setClubs(clubsData);
            setFacultyOptions(facultyRes?.data || []);
            if (role === 'STUDENT') {
                setMyMemberships(studentRes?.data || []);
                setStudentRef(studentRefRes?.data || null);
            }
            if (canViewAnalytics) setAnalytics(analyticsRes?.data || null);
            if (clubsData.length > 0 && !selectedClubId) setSelectedClubId(String(clubsData[0].clubId));
        } catch (e) {
            setError('Unable to load clubs right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [role]);

    useEffect(() => {
        const loadMembers = async () => {
            if (!canManageMembers || !selectedClubId) return;
            try {
                const res = await api.get(`/clubs/${selectedClubId}/members`);
                const members = Array.isArray(res.data) ? res.data : [];
                setClubMembers(members);
                const editState = {};
                members.forEach((m) => {
                    editState[m.membershipId] = { roleType: m.roleType, status: m.status };
                });
                setMemberEdits(editState);
            } catch (e) {
                setClubMembers([]);
            }
        };
        loadMembers();
    }, [selectedClubId, canManageMembers]);

    const myMembershipByClubId = useMemo(() => {
        const map = new Map();
        myMemberships.forEach((m) => map.set(m.clubId, m));
        return map;
    }, [myMemberships]);

    const filteredMembers = useMemo(() => {
        const query = memberFilters.query.trim().toLowerCase();
        return clubMembers.filter((m) => {
            const matchesQuery = !query
                || String(m.studentName || '').toLowerCase().includes(query)
                || String(m.studentId || '').toLowerCase().includes(query)
                || String(m.roleType || '').toLowerCase().includes(query)
                || String(m.department || '').toLowerCase().includes(query);
            const matchesStatus = memberFilters.status === 'all'
                || String(m.status || '').toLowerCase() === memberFilters.status;
            return matchesQuery && matchesStatus;
        });
    }, [clubMembers, memberFilters]);

    const departmentChartData = useMemo(() => (
        (analytics?.participationByDepartment || []).map((item) => ({
            name: item.department || 'NA',
            count: Number(item.count || 0)
        }))
    ), [analytics]);

    const yearChartData = useMemo(() => (
        (analytics?.participationByYear || []).map((item) => ({
            year: String(item.year ?? '0'),
            count: Number(item.count || 0)
        }))
    ), [analytics]);

    const handleCreateClub = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.post('/clubs', newClub);
            setNewClub({
                clubName: '',
                description: '',
                category: 'technical',
                contactEmail: '',
                status: 'active'
            });
            await loadData();
        } catch (e) {
            setError('Could not create club.');
        } finally {
            setSaving(false);
        }
    };

    const toggleClubStatus = async (club) => {
        try {
            await api.patch(`/clubs/${club.clubId}/status`, {
                status: club.status === 'active' ? 'inactive' : 'active'
            });
            await loadData();
        } catch (e) {
            setError('Status update failed.');
        }
    };

    const assignCoordinator = async (clubId, facultyUserId) => {
        try {
            setSaving(true);
            await api.patch(`/clubs/${clubId}/coordinator`, { facultyUserId });
            await loadData();
        } catch (e) {
            setError('Coordinator assignment failed.');
        } finally {
            setSaving(false);
        }
    };

    const requestJoin = async (clubId) => {
        if (role !== 'STUDENT') return;
        try {
            setSaving(true);
            const myStudentId = studentRef?.studentId;
            if (!myStudentId) {
                setError('Membership request unavailable until your student profile is linked.');
                return;
            }
            await api.post('/clubs/memberships/request', {
                studentId: myStudentId,
                clubId,
                roleType: 'member',
                status: 'active'
            });
            await loadData();
        } catch (e) {
            setError('Unable to submit join request.');
        } finally {
            setSaving(false);
        }
    };

    const setMemberEditField = (membershipId, key, value) => {
        setMemberEdits((prev) => ({
            ...prev,
            [membershipId]: {
                ...(prev[membershipId] || {}),
                [key]: value
            }
        }));
    };

    const saveMemberInline = async (membershipId) => {
        const edit = memberEdits[membershipId];
        if (!edit) return;
        try {
            setSaving(true);
            await api.put(`/clubs/memberships/${membershipId}`, {
                roleType: edit.roleType,
                status: edit.status
            });
            const res = await api.get(`/clubs/${selectedClubId}/members`);
            setClubMembers(Array.isArray(res.data) ? res.data : []);
            await loadData();
        } catch (e) {
            setError('Membership update failed.');
        } finally {
            setSaving(false);
        }
    };

    const deactivateMember = async (membershipId) => {
        try {
            setSaving(true);
            await api.delete(`/clubs/memberships/${membershipId}`);
            const res = await api.get(`/clubs/${selectedClubId}/members`);
            setClubMembers(Array.isArray(res.data) ? res.data : []);
            await loadData();
        } catch (e) {
            setError('Could not deactivate membership.');
        } finally {
            setSaving(false);
        }
    };

    const exportSelectedClubMembers = async () => {
        if (!selectedClubId) return;
        try {
            const res = await api.get(`/clubs/${selectedClubId}/export`, { responseType: 'text' });
            const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `club-${selectedClubId}-members.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            setError('CSV export failed.');
        }
    };

    const createMembership = async (e) => {
        e.preventDefault();
        if (!selectedClubId) {
            setError('Select a club before adding a member.');
            return;
        }
        if (!newMembership.studentIdNumber.trim()) {
            setError('Student ID is required.');
            return;
        }
        try {
            setSaving(true);
            setError('');
            await api.post('/clubs/memberships', {
                clubId: Number(selectedClubId),
                studentIdNumber: newMembership.studentIdNumber.trim(),
                roleType: newMembership.roleType,
                joinedDate: newMembership.joinedDate,
                status: newMembership.status
            });
            setNewMembership((prev) => ({
                ...prev,
                studentIdNumber: '',
                roleType: 'member',
                status: 'active'
            }));
            const res = await api.get(`/clubs/${selectedClubId}/members`);
            setClubMembers(Array.isArray(res.data) ? res.data : []);
            await loadData();
        } catch (e) {
            setError('Could not add membership. Check student ID and role permissions.');
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="stu-dashboard" style={{ display: 'grid', gap: '18px' }}>
            <div className="stu-info-card" style={{ borderTopColor: 'var(--color-primary-navy)' }}>
                <div className="info-header">Club Management</div>
                <div className="info-body">
                    <div style={{ color: 'var(--theme-text-muted)', fontSize: '14px' }}>
                        Institutional clubs and student participation hub.
                    </div>
                    {error ? <div style={{ marginTop: '10px', color: '#ef4444', fontSize: '13px' }}>{error}</div> : null}
                </div>
            </div>

            {canManageClubs && (
                <div className="stu-info-card" style={{ borderTopColor: '#7c3aed' }}>
                    <div className="info-header">Admin Management Panel</div>
                    <div className="info-body">
                        <form onSubmit={handleCreateClub} style={{ display: 'grid', gap: '10px' }}>
                            <input value={newClub.clubName} onChange={(e) => setNewClub({ ...newClub, clubName: e.target.value })} placeholder="Club Name" required />
                            <input value={newClub.description} onChange={(e) => setNewClub({ ...newClub, description: e.target.value })} placeholder="Description" required />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px' }}>
                                <input value={newClub.category} onChange={(e) => setNewClub({ ...newClub, category: e.target.value })} placeholder="Category" required />
                                <input value={newClub.contactEmail} onChange={(e) => setNewClub({ ...newClub, contactEmail: e.target.value })} placeholder="Contact Email" />
                                <select value={newClub.status} onChange={(e) => setNewClub({ ...newClub, status: e.target.value })}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <button className="table-btn primary" disabled={saving} type="submit">Add New Club</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="stu-info-card" style={{ borderTopColor: '#0ea5e9' }}>
                <div className="info-header">All Clubs</div>
                <div className="info-body" style={{ padding: '0' }}>
                    <div className="stu-data-table-wrapper">
                        <table className="stu-data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Coordinator</th>
                                    <th>Members</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clubs.map((club) => {
                                    const mine = myMembershipByClubId.get(club.clubId);
                                    return (
                                        <tr key={club.clubId}>
                                            <td>{club.clubName}</td>
                                            <td>{club.description}</td>
                                            <td>{club.category}</td>
                                            <td>
                                                {canManageClubs ? (
                                                    <select
                                                        value={club.facultyCoordinatorId || ''}
                                                        onChange={(e) => assignCoordinator(club.clubId, Number(e.target.value))}
                                                        disabled={saving}
                                                    >
                                                        <option value="">Not Assigned</option>
                                                        {facultyOptions.map((f) => (
                                                            <option key={f.id} value={f.id}>
                                                                {f.name}{f.department ? ` (${f.department})` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : club.facultyCoordinator}
                                            </td>
                                            <td>{club.memberCount}</td>
                                            <td>
                                                <span className={`status-badge ${club.status === 'active' ? 'approved' : 'pending'}`}>{club.status}</span>
                                            </td>
                                            <td>
                                                {canManageClubs ? (
                                                    <button className="table-btn" onClick={() => toggleClubStatus(club)}>Activate/Deactivate</button>
                                                ) : role === 'STUDENT' ? (
                                                    mine
                                                        ? <span className="status-badge approved">{mine.roleType}</span>
                                                        : <button className="table-btn" disabled={saving} onClick={() => requestJoin(club.clubId)}>Join Request</button>
                                                ) : (
                                                    <span style={{ color: 'var(--theme-text-muted)', fontSize: '12px' }}>Read only</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {role === 'STUDENT' && (
                <div className="stu-info-card" style={{ borderTopColor: '#ec4899' }}>
                    <div className="info-header">My Club Involvement</div>
                    <div className="info-body">
                        {myMemberships.length === 0 ? (
                            <div>You are not currently enrolled in any club.</div>
                        ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {myMemberships.map((m) => (
                                    <div key={m.membershipId} style={{ border: '1px solid var(--theme-border)', borderRadius: '8px', padding: '12px' }}>
                                        <div style={{ fontWeight: 700 }}>{m.clubName}</div>
                                        <div style={{ color: 'var(--theme-text-muted)', fontSize: '13px' }}>{m.clubDescription}</div>
                                        <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                            Role: <strong>{m.roleType}</strong> | Joined: {m.joinedDate} | Coordinator: {m.facultyCoordinator} | Status: {m.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {canViewAnalytics && analytics && (
                <div className="stu-info-card" style={{ borderTopColor: '#16a34a' }}>
                    <div className="info-header">Club Analytics</div>
                    <div className="info-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px', marginBottom: '12px' }}>
                            <div>Active Clubs: <strong>{analytics.activeClubs}</strong></div>
                            <div>Inactive Clubs: <strong>{analytics.inactiveClubs}</strong></div>
                            <div>Active Memberships: <strong>{analytics.activeMemberships}</strong></div>
                            <div>Engagement Rate: <strong>{analytics.studentEngagementRate}%</strong></div>
                        </div>
                        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' }}>
                            <div style={{ height: '260px', border: '1px solid var(--theme-border)', borderRadius: '8px', padding: '10px' }}>
                                <div style={{ fontWeight: 700, marginBottom: '8px' }}>Participation by Department</div>
                                <ResponsiveContainer width="100%" height="85%">
                                    <BarChart data={departmentChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ height: '260px', border: '1px solid var(--theme-border)', borderRadius: '8px', padding: '10px' }}>
                                <div style={{ fontWeight: 700, marginBottom: '8px' }}>Participation by Year</div>
                                <ResponsiveContainer width="100%" height="85%">
                                    <PieChart>
                                        <Pie data={yearChartData} dataKey="count" nameKey="year" outerRadius={80} label>
                                            {yearChartData.map((entry, index) => (
                                                <Cell
                                                    key={`year-cell-${index}`}
                                                    fill={['#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444'][index % 5]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {canManageMembers && (
                <div className="stu-info-card">
                    <div className="info-header">Membership CRUD (Search, Filter, Inline Edit)</div>
                    <div className="info-body" style={{ fontSize: '13px', color: 'var(--theme-text-muted)', display: 'grid', gap: '10px' }}>
                        <form onSubmit={createMembership} style={{ display: 'grid', gap: '10px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--theme-text)' }}>Add New Member</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px' }}>
                                <input
                                    placeholder="Student ID Number (e.g., RIT2021001)"
                                    value={newMembership.studentIdNumber}
                                    onChange={(e) => setNewMembership((prev) => ({ ...prev, studentIdNumber: e.target.value }))}
                                    required
                                />
                                <input
                                    placeholder="Role (member/core_member/president...)"
                                    value={newMembership.roleType}
                                    onChange={(e) => setNewMembership((prev) => ({ ...prev, roleType: e.target.value }))}
                                    required
                                />
                                <input
                                    type="date"
                                    value={newMembership.joinedDate}
                                    onChange={(e) => setNewMembership((prev) => ({ ...prev, joinedDate: e.target.value }))}
                                    required
                                />
                                <select
                                    value={newMembership.status}
                                    onChange={(e) => setNewMembership((prev) => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                                <button className="table-btn primary" disabled={saving || !selectedClubId} type="submit">
                                    Add Membership
                                </button>
                            </div>
                        </form>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px' }}>
                            <select value={selectedClubId} onChange={(e) => setSelectedClubId(e.target.value)}>
                                <option value="">Select Club</option>
                                {clubs.map((club) => (
                                    <option key={club.clubId} value={club.clubId}>{club.clubName}</option>
                                ))}
                            </select>
                            <input
                                placeholder="Search student / role / department"
                                value={memberFilters.query}
                                onChange={(e) => setMemberFilters((prev) => ({ ...prev, query: e.target.value }))}
                            />
                            <select
                                value={memberFilters.status}
                                onChange={(e) => setMemberFilters((prev) => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <button className="table-btn" onClick={exportSelectedClubMembers}>Export Member List</button>
                        </div>
                        <div className="stu-data-table-wrapper">
                            <table className="stu-data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Department</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((m) => (
                                        <tr key={m.membershipId}>
                                            <td>
                                                <div style={{ fontWeight: 700 }}>{m.studentName}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>ID: {m.studentId}</div>
                                            </td>
                                            <td>{m.department || '-'}</td>
                                            <td>
                                                <input
                                                    value={memberEdits[m.membershipId]?.roleType || ''}
                                                    onChange={(e) => setMemberEditField(m.membershipId, 'roleType', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={memberEdits[m.membershipId]?.status || 'active'}
                                                    onChange={(e) => setMemberEditField(m.membershipId, 'status', e.target.value)}
                                                >
                                                    <option value="active">active</option>
                                                    <option value="inactive">inactive</option>
                                                </select>
                                            </td>
                                            <td>{m.joinedDate}</td>
                                            <td style={{ display: 'flex', gap: '6px' }}>
                                                <button className="table-btn" disabled={saving} onClick={() => saveMemberInline(m.membershipId)}>Save</button>
                                                <button className="table-btn" disabled={saving} onClick={() => deactivateMember(m.membershipId)}>Deactivate</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredMembers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', color: 'var(--theme-text-muted)' }}>
                                                No memberships match the current filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClubsPage;
