import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LuCalendar,
    LuClock,
    LuUserCheck,
    LuUserX,
    LuRefreshCw,
    LuSearch,
    LuSend,
    LuFilter,
    LuShieldCheck,
    LuBookOpen,
    LuUserPlus,
    LuBan
} from 'react-icons/lu';
import { useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../hooks/AuthContext';
import { useToast } from '../../hooks/ToastContext';

const SubstitutionOverridePanel = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [searchParams] = useSearchParams();
    const initialSlotId = searchParams.get('slotId');

    const role = (user?.role?.roleName || user?.role || '').toString().toUpperCase();
    const isHodOrAdmin = role.includes('HOD') || role.includes('ADMIN');

    // Navigation Tabs
    const [activeTab, setActiveTab] = useState(isHodOrAdmin && !initialSlotId ? 'pending' : 'request');

    // Tab 1: Request State
    const [timetableSlots, setTimetableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(initialSlotId || '');
    const [substitutionDate, setSubstitutionDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [reason, setReason] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Tab 2: Pending Approvals State (HOD / Admin)
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [actionModal, setActionModal] = useState({ open: false, type: 'approve', item: null, remarks: '' });
    const [actionSubmitting, setActionSubmitting] = useState(false);

    // Tab 3: History & My Requests State
    const [mySubstitutions, setMySubstitutions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyFilter, setHistoryFilter] = useState('ALL');

    // Load Faculty's Timetable Slots
    const fetchTimetableSlots = useCallback(async () => {
        setLoadingSlots(true);
        try {
            const res = await api.get('/academic/faculty/timetable');
            setTimetableSlots(res.data || []);
            if (!selectedSlotId && res.data?.length > 0 && !initialSlotId) {
                setSelectedSlotId(String(res.data[0].id));
            }
        } catch (err) {
            console.error('Failed to load faculty timetable slots', err);
        } finally {
            setLoadingSlots(false);
        }
    }, [selectedSlotId, initialSlotId]);

    // Load Eligible Candidates when slot or date changes
    const fetchEligibleCandidates = useCallback(async (slotId, date) => {
        if (!slotId || !date) return;
        setLoadingCandidates(true);
        setSelectedCandidateId(null);
        try {
            const res = await api.get(`/api/faculty/substitutions/eligible?slotId=${slotId}&date=${date}`);
            setCandidates(res.data || []);
        } catch (err) {
            console.error('Failed to load eligible substitutes', err);
            addToast(err.response?.data?.message || 'Failed to analyze faculty availability', 'error');
            setCandidates([]);
        } finally {
            setLoadingCandidates(false);
        }
    }, [addToast]);

    // Load Pending Approvals (for HOD / Admin)
    const fetchPendingRequests = useCallback(async () => {
        if (!isHodOrAdmin) return;
        setLoadingPending(true);
        try {
            const res = await api.get('/api/faculty/substitutions/pending');
            setPendingRequests(res.data || []);
        } catch (err) {
            console.error('Failed to load pending substitutions', err);
        } finally {
            setLoadingPending(false);
        }
    }, [isHodOrAdmin]);

    // Load My Substitutions & Audit Trail
    const fetchMySubstitutions = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const res = await api.get('/api/faculty/substitutions/my');
            setMySubstitutions(res.data || []);
        } catch (err) {
            console.error('Failed to load substitution history', err);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        fetchTimetableSlots();
        fetchMySubstitutions();
        if (isHodOrAdmin) fetchPendingRequests();
    }, [fetchTimetableSlots, fetchMySubstitutions, fetchPendingRequests, isHodOrAdmin]);

    useEffect(() => {
        if (selectedSlotId && substitutionDate) {
            fetchEligibleCandidates(selectedSlotId, substitutionDate);
        }
    }, [selectedSlotId, substitutionDate, fetchEligibleCandidates]);

    const selectedSlotObj = useMemo(() => {
        return timetableSlots.find(s => String(s.id) === String(selectedSlotId));
    }, [timetableSlots, selectedSlotId]);

    // Submit Substitution Request
    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        if (!selectedSlotId) {
            addToast('Please select a timetable class slot to cover', 'warning');
            return;
        }
        if (!selectedCandidateId) {
            addToast('Please select an eligible substitute faculty member', 'warning');
            return;
        }
        if (!substitutionDate) {
            addToast('Please choose a valid substitution date', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                timetableSlotId: Number(selectedSlotId),
                substituteFacultyId: Number(selectedCandidateId),
                substitutionDate: substitutionDate,
                reason: reason.trim() || 'Official class substitution'
            };
            const res = await api.post('/api/faculty/substitutions/request', payload);
            addToast(
                res.data.status === 'APPROVED'
                    ? 'Class substitution successfully approved and recorded!'
                    : 'Substitution request submitted! Substitute and HOD notified.',
                'success'
            );
            setReason('');
            fetchMySubstitutions();
            if (isHodOrAdmin) fetchPendingRequests();
            setActiveTab('history');
        } catch (err) {
            console.error('Substitution request failed', err);
            addToast(err.response?.data?.message || 'Failed to submit substitution request', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Execute Approval / Rejection
    const handleExecuteAction = async () => {
        if (!actionModal.item) return;
        setActionSubmitting(true);
        try {
            const endpoint = `/api/faculty/substitutions/${actionModal.item.id}/${actionModal.type}`;
            await api.put(endpoint, { remarks: actionModal.remarks });
            addToast(`Substitution #${actionModal.item.id} has been ${actionModal.type}d successfully`, 'success');
            setActionModal({ open: false, type: 'approve', item: null, remarks: '' });
            fetchPendingRequests();
            fetchMySubstitutions();
        } catch (err) {
            console.error(`Failed to ${actionModal.type} substitution`, err);
            addToast(err.response?.data?.message || `Failed to ${actionModal.type} substitution`, 'error');
        } finally {
            setActionSubmitting(false);
        }
    };

    // Cancel Request
    const handleCancelRequest = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this substitution request?')) return;
        try {
            await api.put(`/api/faculty/substitutions/${id}/cancel`);
            addToast('Substitution request cancelled successfully', 'info');
            fetchMySubstitutions();
            if (isHodOrAdmin) fetchPendingRequests();
        } catch (err) {
            console.error('Cancel substitution failed', err);
            addToast(err.response?.data?.message || 'Failed to cancel substitution request', 'error');
        }
    };

    // Filtered History
    const filteredHistory = useMemo(() => {
        if (historyFilter === 'ALL') return mySubstitutions;
        return mySubstitutions.filter(s => s.status === historyFilter);
    }, [mySubstitutions, historyFilter]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-7xl mx-auto flex flex-col gap-6"
        >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold">
                            <LuRefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--theme-text)] m-0">Faculty Class Substitutions</h1>
                            <p className="text-sm text-[var(--theme-text-muted)] m-0">
                                Authoritative clash prevention, workload balancing, and institutional approval workflow
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1 bg-[var(--theme-bg-muted)] border border-[var(--theme-border)] rounded-xl">
                    <button
                        onClick={() => setActiveTab('request')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'request'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                        }`}
                    >
                        <LuUserPlus className="w-4 h-4" /> Request Substitution
                    </button>

                    {isHodOrAdmin && (
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative ${
                                activeTab === 'pending'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                            }`}
                        >
                            <LuShieldCheck className="w-4 h-4" /> Pending Approvals
                            {pendingRequests.length > 0 && (
                                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'history'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                        }`}
                    >
                        <LuClock className="w-4 h-4" /> My Log & Audit History
                    </button>
                </div>
            </div>

            {/* TAB 1: REQUEST SUBSTITUTION */}
            {activeTab === 'request' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel: Slot & Date Selection */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--theme-border)] shadow-sm">
                            <h2 className="text-base font-black text-[var(--theme-text)] mb-4 flex items-center gap-2">
                                <LuBookOpen className="text-blue-500" /> 1. Select Class & Date
                            </h2>

                            <form onSubmit={handleSubmitRequest} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase mb-1">
                                        Substitution Date
                                    </label>
                                    <input
                                        type="date"
                                        value={substitutionDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setSubstitutionDate(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-muted)] text-[var(--theme-text)] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase mb-1">
                                        Assigned Class Slot
                                    </label>
                                    {loadingSlots ? (
                                        <div className="p-3 text-xs text-[var(--theme-text-muted)]">Loading assigned timetable slots...</div>
                                    ) : timetableSlots.length === 0 ? (
                                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                            No timetable slots assigned to your profile.
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedSlotId}
                                            onChange={(e) => setSelectedSlotId(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-muted)] text-[var(--theme-text)] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">-- Choose a Class Slot --</option>
                                            {timetableSlots.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.dayOfWeek} • {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)} | {s.subject?.subjectCode || s.subject?.subjectName} ({s.section})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {selectedSlotObj && (
                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-2">
                                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                            Selected Class Overview
                                        </div>
                                        <div className="text-sm font-black text-[var(--theme-text)]">
                                            {selectedSlotObj.subject?.subjectCode} — {selectedSlotObj.subject?.subjectName}
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs text-[var(--theme-text-muted)] font-semibold">
                                            <span className="px-2 py-0.5 rounded bg-[var(--theme-bg-muted)] border border-[var(--theme-border)]">
                                                Section: {selectedSlotObj.section}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-[var(--theme-bg-muted)] border border-[var(--theme-border)]">
                                                {selectedSlotObj.dayOfWeek}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-[var(--theme-bg-muted)] border border-[var(--theme-border)]">
                                                {selectedSlotObj.startTime?.slice(0, 5)} to {selectedSlotObj.endTime?.slice(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase mb-1">
                                        Reason for Substitution
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g. Attending Anna University Board of Studies meeting / On-duty leave / Medical"
                                        className="w-full px-3 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-muted)] text-[var(--theme-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !selectedSlotId || !selectedCandidateId}
                                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    <LuSend className="w-4 h-4" />
                                    {submitting ? 'Submitting Request...' : isHodOrAdmin ? 'Authorize & Assign Substitute' : 'Submit Substitution Request'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Panel: AI Match & Eligible Substitute Candidates */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--theme-border)] shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-base font-black text-[var(--theme-text)] m-0 flex items-center gap-2">
                                        <LuUserCheck className="text-emerald-500" /> 2. Eligible Substitute Faculty
                                    </h2>
                                    <p className="text-xs text-[var(--theme-text-muted)] m-0">
                                        Identified using clash prevention, approved leave records, and subject expertise
                                    </p>
                                </div>
                                <button
                                    onClick={() => fetchEligibleCandidates(selectedSlotId, substitutionDate)}
                                    className="p-2 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-bg-muted)] text-[var(--theme-text-muted)]"
                                    title="Refresh Availability"
                                >
                                    <LuRefreshCw className={`w-4 h-4 ${loadingCandidates ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {loadingCandidates ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3 text-sm text-[var(--theme-text-muted)]">
                                    <LuRefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                                    <span>Evaluating timetable conflicts and workload balances...</span>
                                </div>
                            ) : candidates.length === 0 ? (
                                <div className="py-12 text-center text-sm text-[var(--theme-text-muted)] border-2 border-dashed border-[var(--theme-border)] rounded-xl">
                                    Select a class slot and date to analyze faculty availability.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {candidates.map((cand) => {
                                        const isAvailable = cand.availabilityStatus === 'AVAILABLE';
                                        const isSelected = selectedCandidateId === cand.facultyId;

                                        return (
                                            <div
                                                key={cand.facultyId}
                                                onClick={() => isAvailable && setSelectedCandidateId(cand.facultyId)}
                                                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm'
                                                        : isAvailable
                                                        ? 'border-[var(--theme-border)] bg-[var(--card-bg)] hover:border-blue-300'
                                                        : 'border-[var(--theme-border)] bg-[var(--theme-bg-muted)] opacity-60 cursor-not-allowed'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name="substitute"
                                                            checked={isSelected}
                                                            disabled={!isAvailable}
                                                            onChange={() => setSelectedCandidateId(cand.facultyId)}
                                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <div>
                                                            <div className="font-bold text-sm text-[var(--theme-text)] flex items-center gap-2">
                                                                {cand.facultyName}
                                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--theme-bg-muted)] border border-[var(--theme-border)] text-[var(--theme-text-muted)]">
                                                                    {cand.departmentCode || 'Dept'}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-[var(--theme-text-muted)] mt-0.5 flex items-center gap-3">
                                                                <span>Load: {cand.weeklyWorkloadHours} hrs/wk</span>
                                                                {cand.subjectExpert && (
                                                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                                        ★ Subject Expert
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                                            {cand.matchScore}% Match
                                                        </div>
                                                        <div className="mt-1">
                                                            {isAvailable ? (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                                    <FaCheckCircle className="w-3 h-3" /> Available
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                                                    <FaTimesCircle className="w-3 h-3" /> {cand.conflictReason || 'Conflict'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: PENDING APPROVALS (HOD & ADMIN) */}
            {activeTab === 'pending' && isHodOrAdmin && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-[var(--theme-text)] m-0">Department Approval Queue</h2>
                            <p className="text-xs text-[var(--theme-text-muted)] m-0">
                                Review requested class substitutions, conflict diagnostics, and remarks
                            </p>
                        </div>
                        <button
                            onClick={fetchPendingRequests}
                            className="px-3 py-1.5 rounded-lg border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text)] hover:bg-[var(--theme-bg-muted)] flex items-center gap-1.5"
                        >
                            <LuRefreshCw className={`w-3.5 h-3.5 ${loadingPending ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    </div>

                    {loadingPending ? (
                        <div className="py-16 text-center text-sm text-[var(--theme-text-muted)]">
                            <LuRefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                            Loading pending substitution requests...
                        </div>
                    ) : pendingRequests.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[var(--theme-text-muted)] border-2 border-dashed border-[var(--theme-border)] rounded-2xl bg-[var(--card-bg)]">
                            <FaCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <div className="font-bold text-[var(--theme-text)]">All Caught Up!</div>
                            <div>No pending class substitutions awaiting your approval.</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--theme-border)] shadow-sm space-y-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                                Request #{req.id} • {req.substitutionDate}
                                            </div>
                                            <div className="font-black text-base text-[var(--theme-text)] mt-0.5">
                                                {req.subjectCode} — {req.subjectName}
                                            </div>
                                            <div className="text-xs text-[var(--theme-text-muted)] font-semibold mt-0.5">
                                                Section {req.section} | {req.dayOfWeek} {req.startTime?.slice(0, 5)} - {req.endTime?.slice(0, 5)}
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            Awaiting Approval
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[var(--theme-bg-muted)] border border-[var(--theme-border)] space-y-1.5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-[var(--theme-text-muted)]">Original Faculty:</span>
                                            <span className="font-bold text-[var(--theme-text)]">{req.originalFacultyName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[var(--theme-text-muted)]">Proposed Substitute:</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{req.substituteFacultyName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[var(--theme-text-muted)]">Reason:</span>
                                            <span className="font-medium text-[var(--theme-text)] italic">&quot;{req.reason}&quot;</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <button
                                            onClick={() => setActionModal({ open: true, type: 'approve', item: req, remarks: 'Approved' })}
                                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                        >
                                            <FaCheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                        <button
                                            onClick={() => setActionModal({ open: true, type: 'reject', item: req, remarks: '' })}
                                            className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                        >
                                            <FaTimesCircle className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: MY SUBSTITUTIONS & AUDIT HISTORY */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-[var(--theme-text)] m-0">Substitution Audit Trail</h2>
                            <p className="text-xs text-[var(--theme-text-muted)] m-0">
                                Complete lifecycle history of requested, approved, completed, and cancelled substitutions
                            </p>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--theme-text-muted)]">Filter:</span>
                            {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setHistoryFilter(st)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        historyFilter === st
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-[var(--theme-bg-muted)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)]'
                                    }`}
                                >
                                    {st.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loadingHistory ? (
                        <div className="py-16 text-center text-sm text-[var(--theme-text-muted)]">
                            <LuRefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                            Loading substitution audit history...
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[var(--theme-text-muted)] border-2 border-dashed border-[var(--theme-border)] rounded-2xl bg-[var(--card-bg)]">
                            No records found matching filter &quot;{historyFilter}&quot;.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-[var(--theme-border)] bg-[var(--card-bg)] shadow-sm">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-[var(--theme-bg-muted)] border-b border-[var(--theme-border)] text-[var(--theme-text-muted)] uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="p-3.5">ID / Date</th>
                                        <th className="p-3.5">Subject & Period</th>
                                        <th className="p-3.5">Original Faculty</th>
                                        <th className="p-3.5">Substitute Faculty</th>
                                        <th className="p-3.5">Status</th>
                                        <th className="p-3.5">Audit Remarks</th>
                                        <th className="p-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--theme-border)] font-medium text-[var(--theme-text)]">
                                    {filteredHistory.map((sub) => {
                                        const isRequester = sub.requestedByName === user?.username || sub.originalFacultyName === user?.username;
                                        const canCancel = sub.status === 'PENDING_APPROVAL' && (isRequester || isHodOrAdmin);

                                        return (
                                            <tr key={sub.id} className="hover:bg-[var(--theme-bg-muted)]/50 transition-colors">
                                                <td className="p-3.5 whitespace-nowrap">
                                                    <div className="font-bold text-blue-600 dark:text-blue-400">#{sub.id}</div>
                                                    <div className="text-[11px] text-[var(--theme-text-muted)]">{sub.substitutionDate}</div>
                                                </td>
                                                <td className="p-3.5">
                                                    <div className="font-bold">{sub.subjectCode} ({sub.section})</div>
                                                    <div className="text-[11px] text-[var(--theme-text-muted)]">
                                                        {sub.dayOfWeek} • {sub.startTime?.slice(0, 5)} - {sub.endTime?.slice(0, 5)}
                                                    </div>
                                                </td>
                                                <td className="p-3.5 whitespace-nowrap font-semibold">
                                                    {sub.originalFacultyName}
                                                </td>
                                                <td className="p-3.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                                                    {sub.substituteFacultyName}
                                                </td>
                                                <td className="p-3.5 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                                        sub.status === 'APPROVED'
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                            : sub.status === 'PENDING_APPROVAL'
                                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                            : sub.status === 'REJECTED'
                                                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                                            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                    }`}>
                                                        {sub.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 max-w-xs">
                                                    <div className="text-[11px] text-[var(--theme-text-muted)]">
                                                        {sub.actionRemarks || sub.reason || '--'}
                                                    </div>
                                                    {sub.actionedByName && (
                                                        <div className="text-[10px] text-[var(--theme-text-muted)] font-semibold mt-0.5">
                                                            By: {sub.actionedByName}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3.5 text-right whitespace-nowrap">
                                                    {canCancel && (
                                                        <button
                                                            onClick={() => handleCancelRequest(sub.id)}
                                                            className="px-2.5 py-1 rounded-lg border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                                                        >
                                                            <LuBan className="w-3.5 h-3.5" /> Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Approval / Rejection Modal */}
            <AnimatePresence>
                {actionModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--theme-border)] shadow-2xl space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                {actionModal.type === 'approve' ? (
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                        <FaCheckCircle className="w-5 h-5" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
                                        <FaTimesCircle className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-base font-black text-[var(--theme-text)] m-0">
                                        {actionModal.type === 'approve' ? 'Approve Substitution' : 'Reject Substitution'}
                                    </h3>
                                    <p className="text-xs text-[var(--theme-text-muted)] m-0">
                                        Request #{actionModal.item?.id} • {actionModal.item?.subjectCode} ({actionModal.item?.substitutionDate})
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase mb-1">
                                    {actionModal.type === 'approve' ? 'Approval Remarks (Optional)' : 'Rejection Reason (Required)'}
                                </label>
                                <textarea
                                    rows={3}
                                    value={actionModal.remarks}
                                    onChange={(e) => setActionModal(prev => ({ ...prev, remarks: e.target.value }))}
                                    placeholder={actionModal.type === 'approve' ? 'e.g. Approved. Substitute informed.' : 'e.g. Both faculty needed for NBA accreditation meeting.'}
                                    className="w-full px-3 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-muted)] text-[var(--theme-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={actionModal.type === 'reject'}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setActionModal({ open: false, type: 'approve', item: null, remarks: '' })}
                                    className="px-4 py-2 rounded-xl border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text)] hover:bg-[var(--theme-bg-muted)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExecuteAction}
                                    disabled={actionSubmitting || (actionModal.type === 'reject' && !actionModal.remarks.trim())}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 ${
                                        actionModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {actionSubmitting ? 'Processing...' : actionModal.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SubstitutionOverridePanel;
