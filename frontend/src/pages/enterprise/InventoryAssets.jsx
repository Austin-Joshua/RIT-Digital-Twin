import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/ToastContext';
import { FaBoxes, FaDesktop, FaWrench, FaCubes, FaExclamationCircle } from 'react-icons/fa';
import api from '../../services/api';

const InventoryAssets = () => {
    const { addToast } = useToast();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await api.get('/assets');
                const mappedAssets = response.data.map(a => ({
                    id: 'AST-' + a.id,
                    name: a.assetName,
                    category: a.category,
                    location: a.location,
                    condition: a.status,
                    lastAudit: a.lastMaintained
                }));
                setAssets(mappedAssets);
            } catch (error) {
                console.error("Failed to fetch assets, using mock", error);
                setAssets([
                    { id: 'AST-C101', name: 'Dell Optiplex 7090', category: 'IT Asset', location: 'CSE Lab 1', condition: 'Good', lastAudit: '2024-02-15' },
                    { id: 'AST-C105', name: 'Dell Optiplex 7090', category: 'IT Asset', location: 'CSE Lab 1', condition: 'Needs Repair', lastAudit: '2024-02-15' },
                    { id: 'AST-L220', name: 'Proj-Epson EB-X41', category: 'Electronics', location: 'Seminar Hall 2', condition: 'Good', lastAudit: '2024-01-10' },
                    { id: 'AST-M056', name: 'Lathe Machine V2', category: 'Machinery', location: 'Mech Workshop', condition: 'Maintenance Due', lastAudit: '2023-11-05' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    const markMaintenance = (id) => {
        addToast(`Asset ${id} marked for maintenance schedule.`, 'success');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaBoxes className="text-gold-500" /> Equipment & Asset Inventory
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track infrastructure assets, schedule maintenance, and perform audits</p>
                </div>
                <button className="bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 px-4 py-2 font-bold rounded-lg hover:bg-navy-800 transition-colors">
                    + Register New Asset
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-lg">
                        <FaCubes className="text-2xl" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Assets</div>
                        <div className="text-2xl font-black text-navy-900 dark:text-white">4,250</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-lg">
                        <FaDesktop className="text-2xl" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">IT Systems</div>
                        <div className="text-2xl font-black text-navy-900 dark:text-white">1,820</div>
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 rounded-lg">
                        <FaExclamationCircle className="text-2xl" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-red-600/80 uppercase tracking-wider">Needs Action</div>
                        <div className="text-2xl font-black text-red-600">45</div>
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 rounded-lg">
                        <FaWrench className="text-2xl" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-amber-600/80 uppercase tracking-wider">In Maintenance</div>
                        <div className="text-2xl font-black text-amber-600">12</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-navy-900 dark:text-white">Active Asset Register</h3>
                    <input
                        type="text"
                        placeholder="Search by ID or Category..."
                        className="px-4 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-900 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 w-64"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white dark:bg-navy-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-navy-700">
                                <th className="p-4 font-bold">Asset ID & Name</th>
                                <th className="p-4 font-bold">Category</th>
                                <th className="p-4 font-bold">Location</th>
                                <th className="p-4 font-bold">Condition</th>
                                <th className="p-4 font-bold">Last Audit</th>
                                <th className="p-4 font-bold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {assets.map(asset => (
                                <tr key={asset.id} className="border-b border-gray-50 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-900/30">
                                    <td className="p-4">
                                        <div className="font-bold text-navy-900 dark:text-white">{asset.name}</div>
                                        <div className="text-xs text-gray-400 font-mono mt-0.5">{asset.id}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 font-medium">{asset.category}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{asset.location}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded border ${asset.condition === 'Good'
                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                            : asset.condition === 'Needs Repair'
                                                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                            }`}>
                                            {asset.condition}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">{asset.lastAudit}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => markMaintenance(asset.id)}
                                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 transition-colors"
                                        >
                                            Schedule Maint.
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryAssets;
