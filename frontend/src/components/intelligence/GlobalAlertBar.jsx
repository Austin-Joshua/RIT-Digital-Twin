import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaLightbulb, FaTimes } from 'react-icons/fa';

const GlobalAlertBar = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await api.get('/intelligence/alerts');
                setAlerts(response.data);
            } catch (error) {
                console.error("Alert fetch failed", error);
            }
        };
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const removeAlert = (idx) => {
        setAlerts(prev => prev.filter((_, i) => i !== idx));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full px-4 md:px-0">
            <AnimatePresence>
                {alerts.map((alert, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className={`p-4 rounded-xl shadow-2xl border-l-4 flex gap-4 items-start ${alert.priority === 'CRITICAL' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                            }`}
                    >
                        <div className={`mt-1 ${alert.priority === 'CRITICAL' ? 'text-red-500' : 'text-yellow-600'}`}>
                            {alert.priority === 'CRITICAL' ? <FaExclamationTriangle size={20} /> : <FaLightbulb size={20} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center justify-between">
                                {alert.category} ALERT
                                <button onClick={() => removeAlert(idx)} className="text-gray-400 hover:text-gray-600">
                                    <FaTimes />
                                </button>
                            </h4>
                            <p className="text-xs text-gray-700 mt-1">{alert.message}</p>
                            <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/50 inline-block px-2 py-0.5 rounded">
                                AI Suggestion: {alert.suggestion}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default GlobalAlertBar;
