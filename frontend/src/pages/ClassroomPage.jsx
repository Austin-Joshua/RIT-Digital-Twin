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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card border-l-4 border-blue-500 p-4">
                    <p className="text-gray-500 text-xs uppercase font-bold">Total Rooms</p>
                    <h3 className="text-2xl font-bold">48</h3>
                </div>
                <div className="card border-l-4 border-green-500 p-4">
                    <p className="text-gray-500 text-xs uppercase font-bold">Occupied</p>
                    <h3 className="text-2xl font-bold">36</h3>
                </div>
                <div className="card border-l-4 border-gold-500 p-4">
                    <p className="text-gray-500 text-xs uppercase font-bold">Available</p>
                    <h3 className="text-2xl font-bold">12</h3>
                </div>
                <div className="card border-l-4 border-teal-500 p-4">
                    <p className="text-gray-500 text-xs uppercase font-bold">Smart Rooms</p>
                    <h3 className="text-2xl font-bold">24</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Allocation Logic */}
                <div className="card lg:col-span-1">
                    <h3 className="section-header">Allocation Simulation</h3>
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
                            className="btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? 'Simulating...' : 'Run Algorithm'}
                        </button>
                    </form>
                </div>

                {/* Recommendations Table */}
                <div className="card lg:col-span-2">
                    <h3 className="section-header">Allocation Recommendations</h3>
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
                        <div className="py-20 text-center text-gray-400">
                            <FaBuilding className="text-4xl mx-auto mb-2 opacity-20" />
                            <p>Run simulation to see recommendations</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassroomPage;
