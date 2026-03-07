import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FaBrain, FaLightbulb, FaArrowRight, FaRobot, FaMagic } from 'react-icons/fa';

const MOCK_INSIGHTS = {
    STUDENT: [
        { category: 'ACADEMIC', message: 'Your performance in Labs is 15% higher than theory.', suggestion: 'Review theory notes before Friday.' },
        { category: 'CAREER', message: 'Your skills align 92% with Full Stack roles.', suggestion: 'Check new React internships.' }
    ],
    FACULTY: [
        { category: 'CLASS_PULSE', message: 'CSE-A participation dropped by 10% today.', suggestion: 'Try interactive quiz in next hour.' },
        { category: 'RESEARCH', message: 'Your paper on ML matches 3 current grants.', suggestion: 'Draft proposal by EOW.' }
    ],
    PARENT: [
        { category: 'CELEBRATION', message: 'Ram ranked in the top 5% for Coding velocity this week!', suggestion: 'Celebrate this milestone at dinner.' },
        { category: 'MILESTONE', message: 'Project "Eco-Track" was selected for the Campus Showcase.', suggestion: 'View project details and feedback.' },
        { category: 'FORECAST', message: 'Ram is on track for 8.7 CGPA. Excellent trajectory.', suggestion: 'Keep up the positive encouragement!' }
    ],
    ADMIN: [
        { category: 'INFRA', message: 'Block C energy spike detected (A/C load).', suggestion: 'Optimize schedules for Room 302.' },
        { category: 'SENTIMENT', message: 'Campus vibe is "Excited" (85% positive).', suggestion: 'Broadcast sports event update.' }
    ],
    BOSS: [
        { category: 'STRATEGIC', message: 'Enrollment trends suggest 12% growth in CSE next year.', suggestion: 'Review Faculty hiring plan for Q3.' },
        { category: 'SECURITY', message: 'Unusual login pattern detected from new IP range.', suggestion: 'Verify Global System Audit logs.' },
        { category: 'FINANCIAL', message: 'Energy optimization saved ₹1.2L this month.', suggestion: 'Reallocate savings to Research fund.' }
    ]
};

const AIInsightPanel = ({ role = 'STUDENT', category }) => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await api.get('/intelligence/insights');
                const data = category ? response.data.filter(i => i.category === category) : response.data;
                setInsights(data.length > 0 ? data : (MOCK_INSIGHTS[role] || MOCK_INSIGHTS.STUDENT));
            } catch (error) {
                setInsights(MOCK_INSIGHTS[role] || MOCK_INSIGHTS.STUDENT);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [category, role]);

    if (loading) return (
        <div className="animate-pulse bg-gray-100 dark:bg-slate-900/10 h-64 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center">
            <FaMagic className="text-gray-300 dark:text-slate-900/20 text-4xl animate-bounce" />
        </div>
    );

    return (
        <div className="card bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 text-slate-900 dark:text-white border border-blue-100 dark:border-none shadow-xl relative overflow-hidden p-6 rounded-2xl">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white shadow-sm dark:bg-white/10 dark:backdrop-blur-md rounded-xl border border-blue-100 dark:border-white/20 dark:shadow-inner">
                        <FaBrain className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white">RIT AI Wisdom</h3>
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase mt-1 tracking-widest">{role} Interface</p>
                    </div>
                </div>
                <FaRobot className="text-slate-300 dark:text-white/20 text-2xl" />
            </div>

            <div className="space-y-4 relative z-10">
                {insights.map((insight, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-blue-50 dark:border-white/10 hover:border-blue-200 dark:hover:border-white/20 shadow-sm dark:shadow-none transition-all cursor-pointer"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-50 dark:bg-gold-500/20 rounded-lg">
                                <FaLightbulb className="text-amber-500 dark:text-gold-400 text-xs" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-widest">{insight.category}</p>
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-gray-100 leading-snug">{insight.message}</p>
                                <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-teal-400 uppercase tracking-wider group">
                                    <FaArrowRight className="text-[8px] group-hover:translate-x-1 transition-transform" />
                                    {insight.suggestion}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-5 border-t border-blue-100 dark:border-white/10 text-center relative z-10">
                <button className="group text-[10px] font-black uppercase text-blue-600 dark:text-blue-300 tracking-widest hover:text-blue-700 dark:hover:text-white transition-colors flex items-center gap-2 mx-auto">
                    Global Predictive Analysis
                    <FaArrowRight className="text-[8px] group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default AIInsightPanel;
