import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaTools, FaMicroscope, FaExclamationTriangle, FaCheckCircle, FaHistory } from 'react-icons/fa';
import Card from '../../components/common/Card';

const MaintenanceModule = () => {
    const [assets, setAssets] = useState([]);
    const [criticalAssets, setCriticalAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const criticalRes = await api.get('/campus/assets/critical');
                setCriticalAssets(criticalRes.data);
                // Defaulting to first department (CSE=1) for demo
                const assetsRes = await api.get('/campus/assets/dept/1');
                setAssets(assetsRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Asset fetch failed", error);
            }
        };
        fetchData();
    }, []);

    const recordMaintenance = async (assetId) => {
        try {
            await api.post(`/campus/assets/${assetId}/maintenance?description=Scheduled Preventive&cost=500.0&type=PREVENTIVE`);
            // Refresh
            const criticalRes = await api.get('/campus/assets/critical');
            setCriticalAssets(criticalRes.data);
        } catch (error) {
            console.error("Maintenance logging failed", error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="page-header flex items-center gap-3">
                <FaTools className="text-teal-600" />
                Maintenance & Asset Monitoring
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card title="Total Assets" value={assets.length} icon={<FaMicroscope />} />
                <Card title="Critical Repairs" value={criticalAssets.length} color="red" icon={<FaExclamationTriangle />} />
                <Card title="Health Score" value="94%" color="green" icon={<FaCheckCircle />} />
                <Card title="Upcoming Maint." value="12" color="teal" icon={<FaHistory />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card">
                    <h3 className="section-header">Lab Equipment Status</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 text-xs text-gray-500 font-bold uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Asset</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-center">Next Maintenance</th>
                                    <th className="px-6 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {assets.map((asset, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 text-sm">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{asset.assetName}</div>
                                            <div className="text-[10px] text-gray-500">SN: {asset.serialNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${asset.status === 'OPERATIONAL' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            {asset.nextMaintenanceDate || 'Not Scheduled'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => recordMaintenance(asset.id)} className="p-2 hover:bg-teal-50 text-teal-600 rounded-lg">
                                                <FaTools />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card bg-red-50/50 border-red-100">
                    <h3 className="section-header text-red-900 border-red-200">Critical Alerts</h3>
                    <div className="space-y-3">
                        {criticalAssets.map((asset, idx) => (
                            <div key={idx} className="p-3 bg-white border border-red-200 rounded-xl shadow-sm">
                                <p className="font-bold text-red-900 text-xs">{asset.assetName}</p>
                                <p className="text-[10px] text-red-700 mt-1">Status: {asset.status}</p>
                                <button onClick={() => recordMaintenance(asset.id)} className="mt-2 w-full py-1.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-700">
                                    Schedule Repair
                                </button>
                            </div>
                        ))}
                        {criticalAssets.length === 0 && (
                            <div className="text-center py-10">
                                <FaCheckCircle className="text-green-500 mx-auto text-3xl mb-2" />
                                <p className="text-xs text-gray-500 font-bold">All assets healthy</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceModule;
