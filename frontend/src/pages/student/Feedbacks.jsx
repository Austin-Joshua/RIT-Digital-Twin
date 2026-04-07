import React from 'react';
import { motion } from 'framer-motion';
import { FaCommentDots, FaUserTie, FaBuilding, FaBookOpen, FaUtensils, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const FeedbackCard = ({ title, icon, description, status, period, color }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -mr-12 -mt-12`}></div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-50 dark:bg-${color}-900/30 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                {React.cloneElement(icon, { className: `text-2xl text-${color}-600 dark:text-${color}-400` })}
            </div>
            
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{title}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    status === 'Submitted' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                    status === 'Closed' ? 'bg-slate-100 text-slate-400 border border-slate-200' :
                    'bg-amber-100 text-amber-600 border border-amber-200 animate-pulse'
                }`}>
                    {status}
                </span>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-6 leading-relaxed">
                {description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1">
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
            {/* Header Section with Glassmorphism */}
            <div className="relative p-8 rounded-[40px] overflow-hidden shadow-2xl border border-white/20" 
                 style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)', backdropFilter: 'blur(10px)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tight">
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                                <FaCommentDots className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" /> 
                            </div>
                            Integrity Insights
                        </h1>
                        <p className="mt-2 text-blue-100/80 font-medium max-w-xl text-lg">
                            Empower your academic journey by providing authentic feedback. Your voice drives our excellence.
                        </p>
                    </div>
                    
                    {/* Completion Index Mini Card */}
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/10 shadow-inner flex items-center gap-5">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                                    strokeDasharray={175} strokeDashoffset={175 * (1 - 0.75)} 
                                    className="text-amber-400" strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-white font-black text-xs">75%</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-widest text-blue-200 font-bold block mb-1">Feedback Index</span>
                            <span className="text-xl font-black text-white">3/4 Completed</span>
                        </div>
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
            <div className="p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg text-3xl">
                    💡
                </div>
                <div className="flex-1 space-y-2">
                    <h4 className="font-black text-slate-900 dark:text-white text-lg">Why your feedback matters?</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        At RIT, we treat every feedback as a mission-critical data point for our Digital Twin ecosystem. 
                        Faculty appraisals directly influence professional development pathways, ensuring we deliver the highest quality education.
                    </p>
                </div>
                <button className="whitespace-nowrap px-8 py-4 rounded-2xl bg-slate-900 dark:bg-black text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                    View Impact Report
                </button>
            </div>
        </div>
    );
};

export default Feedbacks;
