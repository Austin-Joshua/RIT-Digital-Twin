import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain, FaLightbulb, FaArrowRight, FaRobot, FaMagic, FaTimes } from 'react-icons/fa';

const AIInsightPanel = ({ role = 'STUDENT', category }) => {
    const navigate = useNavigate();
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInsight, setSelectedInsight] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await api.get('/intelligence/insights');
                const data = Array.isArray(response.data)
                    ? (category ? response.data.filter(i => i.category === category) : response.data)
                    : [];
                setInsights(data);
            } catch {
                setInsights([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [category]);

    if (loading) return (
        <div className="animate-pulse h-64 rounded-2xl border border-dashed flex items-center justify-center" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
            <FaMagic className="text-4xl animate-bounce" style={{ color: 'var(--theme-text-muted)' }} />
        </div>
    );

    return (
        <>
            <div
                className="card relative overflow-hidden p-6 rounded-2xl transition-all shadow-xl"
                style={{
                    background: 'var(--card-bg)',
                    color: 'var(--theme-text)',
                    border: '1px solid var(--theme-border)'
                }}
            >
                {/* Ambient background (theme-aware) */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full -mr-24 -mt-24 blur-3xl opacity-30" style={{ background: 'var(--color-primary-navy)' }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full -ml-16 -mb-16 blur-2xl opacity-20" style={{ background: 'var(--color-accent-gold)' }} />

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl border shadow-inner" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                            <FaBrain style={{ color: 'var(--theme-brand-strong)' }} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight leading-none" style={{ color: 'var(--theme-text)' }}>RIT AI Wisdom</h3>
                            <p className="text-[10px] font-bold uppercase mt-1 tracking-widest" style={{ color: 'var(--theme-accent)' }}>{role} Interface</p>
                        </div>
                    </div>
                    <FaRobot className="text-2xl" style={{ color: 'var(--theme-text-muted)' }} />
                </div>

                <div className="space-y-4 relative z-10">
                    {insights.length === 0 ? (
                        <p style={{ margin: 0 }}>No intelligence insights available</p>
                    ) : insights.map((insight, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.01 }}
                            className="p-4 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer shadow-sm"
                            style={{
                                background: 'var(--theme-bg-muted)',
                                borderColor: 'var(--theme-border)'
                            }}
                            onClick={() => setSelectedInsight(insight)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg" style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
                                    <FaLightbulb className="text-xs" style={{ color: 'var(--color-accent-gold)' }} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--theme-accent)' }}>{insight.category}</p>
                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-primary-navy)' }} />
                                    </div>
                                    <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--theme-text)' }}>{insight.message}</p>
                                    <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider group" style={{ color: 'var(--color-success)' }}>
                                        <FaArrowRight className="text-[8px] group-hover:translate-x-1 transition-transform" />
                                        {insight.suggestion}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-6 pt-5 border-t text-center relative z-10" style={{ borderColor: 'var(--theme-border)' }}>
                    <button
                        type="button"
                        className="group text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors"
                        style={{ color: 'var(--theme-accent)' }}
                        onClick={() => navigate('/predictions')}
                    >
                        Global Predictive Analysis
                        <FaArrowRight className="text-[8px] group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Click result modal */}
            <AnimatePresence>
                {selectedInsight && (
                    <div
                        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                        onClick={() => setSelectedInsight(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--theme-border)' }}>
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>{selectedInsight.category}</span>
                                <button type="button" onClick={() => setSelectedInsight(null)} style={{ color: 'var(--theme-text-muted)' }}>
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--theme-text)' }}>{selectedInsight.message}</p>
                                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                                    <FaArrowRight /> {selectedInsight.suggestion}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIInsightPanel;
