import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FaBrain, FaLightbulb, FaArrowRight } from 'react-icons/fa';

const AIInsightPanel = ({ category }) => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await api.get('/intelligence/insights');
                // Filter by category if provided, otherwise show global
                setInsights(category ? response.data.filter(i => i.category === category) : response.data);
                setLoading(false);
            } catch (error) {
                console.error("Insights fetch failed", error);
            }
        };
        fetchInsights();
    }, [category]);

    if (loading) return null;

    return (
        <div className="card bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-indigo-500 rounded-lg">
                    <FaBrain className="text-white" />
                </div>
                <h3 className="text-lg font-black tracking-tight">Digital Twin AI Insights</h3>
            </div>

            <div className="space-y-4 relative z-10">
                {insights.map((insight, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ x: 5 }}
                        className="p-4 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/15 transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <FaLightbulb className="text-yellow-400 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-indigo-300 uppercase mb-1">{insight.category}</p>
                                <p className="text-sm font-medium text-gray-100 leading-relaxed">{insight.message}</p>
                                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                                    <FaArrowRight className="text-[8px]" />
                                    {insight.suggestion}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {insights.length === 0 && (
                    <p className="text-center text-gray-400 text-xs py-10 italic">Intelligence engine is processing campus data...</p>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <button className="text-[10px] font-black uppercase text-indigo-400 tracking-widest hover:text-white transition-colors">
                    View Comprehensive Analysis
                </button>
            </div>
        </div>
    );
};

export default AIInsightPanel;
