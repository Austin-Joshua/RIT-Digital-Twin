import React from 'react';
import { motion } from 'framer-motion';
import { FaCommentDots, FaUserTie, FaBuilding, FaBookOpen, FaUtensils, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const FeedbackCard = ({ title, icon, description, status, period, color }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="relative p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--theme-border)] shadow-sm overflow-hidden group"
    >
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-50 dark:bg-${color}-900/30 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                {React.cloneElement(icon, { className: `text-2xl text-${color}-600 dark:text-${color}-400` })}
            </div>
            
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-[var(--theme-text)] text-lg tracking-tight">{title}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    status === 'Submitted' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                    status === 'Closed' ? 'bg-slate-100 text-slate-400 border border-slate-200' :
                    'bg-amber-100 text-amber-600 border border-amber-200 animate-pulse'
                }`}>
                    {status}
                </span>
            </div>
            
            <p className="text-[var(--theme-text-muted)] text-xs font-medium mb-6 leading-relaxed">
                {description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--theme-border)]">
                <div className="text-[10px] uppercase font-bold text-[var(--theme-text-muted)] tracking-widest flex items-center gap-1">
                    <FaExclamationCircle className="text-[8px]" /> {period}
                </div>
                <button 
                    disabled={status === 'Closed' || status === 'Submitted'}
                    className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                        status === 'Submitted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        status === 'Closed' ? 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed' :
                        'bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30 active:scale-95'
                    }`}
                >
                    {status === 'Submitted' ? 'View Details' : status === 'Closed' ? 'Period Ended' : 'Start Feedback'}
                </button>
            </div>
        </div>
    </motion.div>
);

const Feedbacks = () => {
    const feedbackCategories = [
        {
            title: 'Faculty Performance',
            icon: <FaUserTie />,
            description: 'Evaluate course delivery, subject expertise, and mentor availability for the current semester.',
            status: 'Active',
            period: 'Valid until 15th April',
            color: 'blue'
        },
        {
            title: 'Course Curriculum',
            icon: <FaBookOpen />,
            description: 'Share your thoughts on Subject depth, credit distribution, and industry relevance of your major.',
            status: 'Submitted',
            period: 'Submited on 28th Mar',
            color: 'emerald'
        },
        {
            title: 'Campus Infrastructure',
            icon: <FaBuilding />,
            description: 'Feedback on classroom facilities, lab equipment, and general campus maintenance.',
            status: 'Active',
            period: 'Ends in 4 days',
            color: 'amber'
        },
        {
            title: 'Canteen & Mess',
            icon: <FaUtensils />,
            description: 'Rate food quality, hygiene standards, and variety across all campus dining facilities.',
            status: 'Closed',
            period: 'Cycle #1 Ended',
            color: 'rose'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-2">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-4 text-[var(--theme-text)] tracking-tight">
                        <FaCommentDots className="text-[#0B2C6B] dark:text-blue-400" /> 
                        Feedback Portal
                    </h1>
                    <p className="mt-2 text-[var(--theme-text-muted)] font-medium max-w-xl text-lg">
                        Empower your academic journey by providing authentic feedback. Your voice drives our excellence.
                    </p>
                </div>
                
                {/* Completion Index Mini Card */}
                <div className="bg-[var(--theme-bg-muted)] p-4 rounded-xl border border-[var(--theme-border)] shadow-sm flex items-center gap-5">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[var(--theme-border)]" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                                strokeDasharray={125} strokeDashoffset={125 * (1 - 0.75)} 
                                className="text-blue-500" strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-[var(--theme-text)] font-black text-[10px]">75%</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] font-bold block mb-1">Feedback Index</span>
                        <span className="text-xl font-black text-[var(--theme-text)]">3/4 Completed</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {feedbackCategories.map((cat, idx) => (
                    <FeedbackCard key={idx} {...cat} />
                ))}
            </div>

            {/* Informational Section */}
            <div className="stu-info-card p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="w-16 h-16 bg-[var(--theme-bg-muted)] border border-[var(--theme-border)] rounded-full flex items-center justify-center shadow-sm text-3xl">
                    💡
                </div>
                <div className="flex-1 space-y-2">
                    <h4 className="font-black text-[var(--theme-text)] text-lg">Why your feedback matters?</h4>
                    <p className="text-sm text-[var(--theme-text-muted)] font-medium leading-relaxed">
                        At RIT, we treat every feedback as a mission-critical data point for our campus ecosystem. 
                        Your feedback directly influences continuous improvement, ensuring we deliver the highest quality education.
                    </p>
                </div>
                <button className="whitespace-nowrap px-8 py-3 rounded-xl bg-[var(--color-primary-navy)] text-white font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">
                    View Impact Report
                </button>
            </div>
        </div>
    );
};

export default Feedbacks;
