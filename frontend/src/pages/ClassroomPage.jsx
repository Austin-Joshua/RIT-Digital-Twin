import React, { useState } from 'react';
import api from '../services/api';
import { FaBuilding, FaChalkboardTeacher, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import KPIDetailsModal from '../components/common/KPIDetailsModal';

const ClassroomPage = () => {
    const [formData, setFormData] = useState({
        department: '',
        studentStrength: 60,
        timeSlot: '09:00',
        needsProjector: false
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', value: '', label: '', description: '', icon: null, colorClass: 'blue' });

    const openModal = (title, value, label, description, icon, colorClass) => {
        setModal({ isOpen: true, title, value, label, description, icon, colorClass });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/classrooms/simulate', formData);
            const resultData = JSON.parse(response.data.resultJson);
            setResults(resultData);
        } catch (error) {
            console.error(error);
            setResults([
                { roomNumber: 'A-101', capacity: 60, hasProjector: true, building: { buildingName: 'Main Block' } },
                { roomNumber: 'B-204', capacity: 70, hasProjector: true, building: { buildingName: 'Science Block' } },
                { roomNumber: 'C-305', capacity: 50, hasProjector: false, building: { buildingName: 'Engineering Block' } }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="page-header">Infrastructure & Classroom Report</h1>

            {/* Status Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="stu-kpi-card blue cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5"
                    onClick={() => openModal('Campus Infrastructure', '48', 'Total Rooms', 'The campus currently features 48 dedicated lecture halls and laboratories equipped with modern learning facilities across 4 major blocks.', FaBuilding, 'blue')}>
                    <div className="kpi-main z-10">
                        <div className="kpi-value text-2xl md:text-4xl font-bold mb-1">48</div>
                        <div className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Total Rooms</div>
                    </div>
                    <FaBuilding className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                    <div className="kpi-more text-[9px] md:text-xs mt-3 bg-black/10 py-1.5 px-2 rounded w-full text-center">Campus Capacity</div>
                </div>
                <div className="stu-kpi-card green cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5"
                    onClick={() => openModal('Real-time Occupancy', '36', 'Occupied', 'A total of 36 rooms are currently being utilized for active classroom sessions and laboratory work by various departments.', FaCheckCircle, 'green')}>
                    <div className="kpi-main z-10">
                        <div className="kpi-value text-2xl md:text-4xl font-bold mb-1">36</div>
                        <div className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Occupied</div>
                    </div>
                    <FaCheckCircle className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                    <div className="kpi-more text-[9px] md:text-xs mt-3 bg-black/10 py-1.5 px-2 rounded w-full text-center">Live Status</div>
                </div>
                <div className="stu-kpi-card yellow cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5"
                    onClick={() => openModal('Instant Booking Status', '12', 'Available', 'There are 12 vacant rooms available for immediate booking, faculty meetings, or specialized student study sessions.', FaExclamationTriangle, 'yellow')}>
                    <div className="kpi-main z-10">
                        <div className="kpi-value text-2xl md:text-4xl font-bold mb-1">12</div>
                        <div className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Available</div>
                    </div>
                    <FaExclamationTriangle className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                    <div className="kpi-more text-[9px] md:text-xs mt-3 bg-black/10 py-1.5 px-2 rounded w-full text-center">Instant Booking</div>
                </div>
                <div className="stu-kpi-card teal cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5"
                    onClick={() => openModal('Smart Campus Technology', '24', 'Smart Rooms', '24 rooms are fully integrated with interactive smart-boards, high-speed Wi-Fi, and Augmented Reality (AR) support for immersive learning.', FaChalkboardTeacher, 'teal')}>
                    <div className="kpi-main z-10">
                        <div className="kpi-value text-2xl md:text-4xl font-bold mb-1">24</div>
                        <div className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Smart Rooms</div>
                    </div>
                    <FaChalkboardTeacher className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                    <div className="kpi-more text-[9px] md:text-xs mt-3 bg-black/10 py-1.5 px-2 rounded w-full text-center">High-Tech Facilities</div>
                </div>
            </div>

            <div className="stu-info-row">
                {/* Allocation Logic */}
                <div className="stu-info-card" style={{ borderTopColor: 'var(--color-primary-navy)' }}>
                    <div className="info-header">Allocation Simulation</div>
                    <div className="info-body">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1 text-sm">Department</label>
                                <select
                                    className="input-field w-full"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="">Select Dept...</option>
                                    <option value="CSE">CSE</option>
                                    <option value="MECH">Mechanical</option>
                                    <option value="CIVIL">Civil</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1 text-sm">Strength</label>
                                <input
                                    type="number"
                                    className="input-field w-full"
                                    value={formData.studentStrength}
                                    onChange={(e) => setFormData({ ...formData, studentStrength: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={formData.needsProjector}
                                    onChange={(e) => setFormData({ ...formData, needsProjector: e.target.checked })}
                                />
                                <label className="text-sm">Smart Projector</label>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                                style={{ width: '100%', marginTop: '10px' }}
                            >
                                {loading ? 'Simulating...' : 'Run Algorithm'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recommendations Table */}
                <div className="stu-info-card" style={{ borderTopColor: 'var(--color-accent-gold)' }}>
                    <div className="info-header">Allocation Recommendations</div>
                    <div className="info-body">
                        {results ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y min-w-[600px]" style={{ borderColor: 'var(--theme-border)' }}>
                                    <thead style={{ background: 'var(--theme-bg-muted)' }}>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Room</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Building</th>
                                            <th className="px-4 py-2 text-center text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Capacity</th>
                                            <th className="px-4 py-2 text-center text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Facilities</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                                        {results.map((room, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-navy-900/30 transition-colors">
                                                <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{room.roomNumber}</td>
                                                <td className="px-4 py-3 text-sm" style={{ color: 'var(--theme-text-muted)' }}>{room.building?.buildingName || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--theme-text-muted)' }}>{room.capacity}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {room.hasProjector && <FaChalkboardTeacher className="text-blue-500 dark:text-blue-400 inline text-lg" />}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
                                <FaBuilding style={{ fontSize: '48px', margin: '0 auto 12px', opacity: 0.2 }} />
                                <p>Run simulation to see recommendations</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <KPIDetailsModal
                {...modal}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
        </div>
    );
};

export default ClassroomPage;
