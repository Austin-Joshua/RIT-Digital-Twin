import React, { useState } from 'react';
import api from '../services/api';
import { FaBuilding, FaChalkboardTeacher, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const ClassroomPage = () => {
    const [formData, setFormData] = useState({
        department: '',
        studentStrength: 60,
        timeSlot: '09:00',
        needsProjector: false
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

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
                <div className="stu-kpi-card blue cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5" onClick={() => alert('Campus Capacity: 48 Rooms across 4 blocks.')}>
                    <div className="kpi-main z-10">
                        <div className="kpi-value text-2xl md:text-4xl font-bold mb-1">48</div>
                        <div className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Total Rooms</div>
                    </div>
                    <FaBuilding className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                    <div className="kpi-more text-[9px] md:text-xs mt-3 bg-black/10 py-1.5 px-2 rounded w-full text-center">Campus Capacity</div>
                </div>
                <div className="stu-kpi-card green cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5" onClick={() => alert('36 Rooms are currently occupied by various departments.')}>
                    <div className="kpi-main z-10">
                        <div className="kpi-value text-2xl md:text-4xl font-bold mb-1">36</div>
                        <div className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Occupied</div>
                    </div>
                    <FaCheckCircle className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                    <div className="kpi-more text-[9px] md:text-xs mt-3 bg-black/10 py-1.5 px-2 rounded w-full text-center">Live Status</div>
                </div>
                <div className="stu-kpi-card yellow cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5" onClick={() => alert('12 Rooms are available for instant booking.')}>
                    <div className="kpi-main z-10">
                        <div className="kpi-value text-2xl md:text-4xl font-bold mb-1">12</div>
                        <div className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Available</div>
                    </div>
                    <FaExclamationTriangle className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                    <div className="kpi-more text-[9px] md:text-xs mt-3 bg-black/10 py-1.5 px-2 rounded w-full text-center">Instant Booking</div>
                </div>
                <div className="stu-kpi-card teal cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5" onClick={() => alert('24 Rooms are equipped with smart-boards and AR support.')}>
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
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Room</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Building</th>
                                            <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase">Capacity</th>
                                            <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase">Facilities</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.map((room, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-bold text-navy-900">{room.roomNumber}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{room.building?.buildingName || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-center">{room.capacity}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {room.hasProjector && <FaChalkboardTeacher className="text-blue-500 inline" />}
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
        </div>
    );
};

export default ClassroomPage;
