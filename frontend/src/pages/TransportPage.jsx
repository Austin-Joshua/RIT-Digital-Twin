import React, { useState } from 'react';
import api from '../services/api';
import { FaBus, FaRoute, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TransportPage = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const fleetStatus = [
        { busId: 'B-001', route: 'City Center', status: 'On Track', efficiency: '94%' },
        { busId: 'B-002', route: 'Suburbs', status: 'Delayed', efficiency: '82%' },
        { busId: 'B-003', route: 'Campus Shuttle', status: 'On Track', efficiency: '98%' },
        { busId: 'B-004', route: 'Airport', status: 'On Track', efficiency: '91%' },
    ];

    const handleOptimize = async () => {
        setLoading(true);
        try {
            const response = await api.post('/transport/optimize/1');
            setResult(JSON.parse(response.data.resultJson));
        } catch (error) {
            setResult({
                route: "Route 1 - Main City",
                originalDistanceKm: 25.0,
                optimizedDistanceKm: 22.5,
                fuelSavingsLitres: 1.5
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="page-header">Transport Fleet Management</h1>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card border-l-4 border-navy-900">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-navy-900 rounded-lg"><FaBus /></div>
                        <div>
                            <p className="text-gray-500 text-sm">Active Fleet</p>
                            <h3 className="text-xl font-bold">12 / 12</h3>
                        </div>
                    </div>
                </div>
                <div className="card border-l-4 border-green-500">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg"><FaCheckCircle /></div>
                        <div>
                            <p className="text-gray-500 text-sm">On-Time Rate</p>
                            <h3 className="text-xl font-bold">92%</h3>
                        </div>
                    </div>
                </div>
                <div className="card border-l-4 border-gold-500">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gold-50 text-gold-600 rounded-lg"><FaRoute /></div>
                        <div>
                            <p className="text-gray-500 text-sm">Routes Optimized</p>
                            <h3 className="text-xl font-bold">8 / 12</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fleet Overview Table */}
                <div className="card">
                    <h3 className="section-header !text-[18px]">Fleet Real-time Status</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bus ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Route</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Efficiency</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fleetStatus.map((bus, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-4 text-sm font-medium text-navy-900">{bus.busId}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{bus.route}</td>
                                        <td className="px-4 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bus.status === 'On Track' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {bus.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 font-bold">{bus.efficiency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Simulation Panel */}
                <div className="card">
                    <h3 className="section-header !text-[18px]">AI Route Optimization</h3>
                    <p className="text-gray-600 mb-4 text-sm">Select a route to simulate fuel efficiency gains using AI pathfinding.</p>
                    <div className="space-y-4">
                        <select className="input-field w-full">
                            <option>Select Route...</option>
                            <option value="1">Route 1 - City Center</option>
                            <option value="2">Route 2 - Suburbs</option>
                        </select>
                        <button
                            onClick={handleOptimize}
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Analyzing...' : 'Analyze Route'}
                        </button>

                        {result && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4 animate-in fade-in duration-300">
                                <h4 className="font-semibold text-navy-900 mb-2 text-sm uppercase">Report: {result.route}</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Old Distance</span>
                                        <span className="font-medium">{result.originalDistanceKm} km</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">New Distance</span>
                                        <span className="font-bold text-navy-900">{result.optimizedDistanceKm} km</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-blue-200">
                                        <span className="text-gray-700 font-semibold">Fuel Savings</span>
                                        <span className="font-bold text-green-600">{result.fuelSavingsLitres} L/Trip</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportPage;
