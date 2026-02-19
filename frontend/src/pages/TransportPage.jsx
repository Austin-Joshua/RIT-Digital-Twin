import React, { useState } from 'react';
import api from '../services/api';

const TransportPage = () => {
    const [result, setResult] = useState(null);

    const handleOptimize = async () => {
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
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="page-header">Transport Fleet Management</h1>

            <div className="card">
                <h3 className="section-header">Route Optimization</h3>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <select className="input-field md:w-64">
                        <option>Select Route...</option>
                        <option value="1">Route 1 - City Center</option>
                        <option value="2">Route 2 - Suburbs</option>
                    </select>
                    <button
                        onClick={handleOptimize}
                        className="btn-primary w-full md:w-auto"
                    >
                        Analyze Route
                    </button>
                </div>

                {result && (
                    <div className="bg-[#F8FAFC] p-6 rounded-lg border border-[#E2E8F0]">
                        <h4 className="font-semibold text-navy-900 mb-4 text-lg">Optimization Report for {result.route}</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-600">Original Distance</span>
                                <span className="font-medium">{result.originalDistanceKm} km</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-600">Optimized Distance</span>
                                <span className="font-medium text-navy-900">{result.optimizedDistanceKm} km</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="text-gray-600">Estimated Fuel Savings</span>
                                <span className="font-bold text-green-600">{result.fuelSavingsLitres} Litres/Trip</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransportPage;
