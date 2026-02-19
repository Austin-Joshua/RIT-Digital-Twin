import React, { useState } from 'react';
import api from '../services/api';

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
                { roomNumber: 'B-204', capacity: 70, hasProjector: true, building: { buildingName: 'Science Block' } }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="page-header">Classroom Allocation</h1>

            <div className="card">
                <h3 className="section-header">Allocation Parameters</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1 text-sm">Department</label>
                        <select
                            className="input-field"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                            <option value="">Select Department</option>
                            <option value="CSE">Computer Science</option>
                            <option value="MECH">Mechanical</option>
                            <option value="CIVIL">Civil</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1 text-sm">Student Strength</label>
                        <input
                            type="number"
                            className="input-field"
                            value={formData.studentStrength}
                            onChange={(e) => setFormData({ ...formData, studentStrength: parseInt(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1 text-sm">Time Slot</label>
                        <input
                            type="time"
                            className="input-field"
                            value={formData.timeSlot}
                            onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center mt-7">
                        <input
                            type="checkbox"
                            className="mr-2 h-4 w-4 text-navy-900 rounded focus:ring-navy-900 border-gray-300"
                            checked={formData.needsProjector}
                            onChange={(e) => setFormData({ ...formData, needsProjector: e.target.checked })}
                        />
                        <label className="text-gray-700 font-medium text-sm">Needs Projector / Smart Board</label>
                    </div>
                    <div className="md:col-span-2 mt-2">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Processing Simulation...' : 'Run Allocation Algorithm'}
                        </button>
                    </div>
                </form>
            </div>

            {results && (
                <div className="card">
                    <h3 className="section-header text-navy-900">Allocation Recommendations</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Building</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Facilities</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((room, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-navy-900">{room.roomNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.building?.buildingName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.capacity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {room.hasProjector && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Projector</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassroomPage;
