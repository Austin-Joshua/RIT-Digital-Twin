import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoInformationCircleOutline } from 'react-icons/io5';

const KPIDetailsModal = ({ isOpen, onClose, title, value, label, description, icon: Icon, image, colorClass = 'blue' }) => {
    if (!isOpen) return null;

    const colorMap = {
        blue: {
            bg: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
            iconBg: 'rgba(25, 118, 210, 0.1)',
            iconColor: '#1976d2'
        },
        green: {
            bg: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
            iconBg: 'rgba(46, 125, 50, 0.1)',
            iconColor: '#2e7d32'
        },
        yellow: {
            bg: 'linear-gradient(135deg, #f57f17 0%, #fbc02d 100%)',
            iconBg: 'rgba(251, 192, 45, 0.1)',
            iconColor: '#f57f17'
        },
        teal: {
            bg: 'linear-gradient(135deg, #006064 0%, #00acc1 100%)',
            iconBg: 'rgba(0, 172, 193, 0.1)',
            iconColor: '#00acc1'
        },
        amber: {
            bg: 'linear-gradient(135deg, #f57f17 0%, #ffa000 100%)',
            iconBg: 'rgba(255, 160, 0, 0.1)',
            iconColor: '#ffa000'
        }
    };

    const theme = colorMap[colorClass] || colorMap.blue;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    className="border border-gray-100 dark:border-navy-700 rounded-[32px] w-full max-w-[500px] overflow-hidden shadow-2xl relative"
                    style={{ background: 'var(--card-bg)' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header Decorative Background */}
                    <div
                        className="h-32 w-full relative flex items-center justify-center"
                        style={{ background: theme.bg }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all backdrop-blur-sm"
                        >
                            <IoClose size={24} />
                        </button>

                        {Icon && (
                            <div className="absolute -bottom-10 p-5 rounded-3xl shadow-lg border-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                                <Icon size={40} className="text-navy-900 dark:text-gold-500" />
                            </div>
                        )}
                    </div>

                    <div className="pt-16 pb-8 px-8 text-center">
                        <h2 className="text-3xl font-black mb-1" style={{ color: 'var(--theme-text)' }}>
                            {value}
                        </h2>
                        <p className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--theme-text-muted)' }}>
                            {label}
                        </p>

                        <div className="rounded-2xl p-6 mb-8 text-left border" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                            <div className="flex items-start gap-3">
                                <IoInformationCircleOutline className="text-gold-500 mt-1 shrink-0" size={20} />
                                <div className="space-y-4">
                                    <p className="leading-relaxed font-medium" style={{ color: 'var(--theme-text)' }}>
                                        {description}
                                    </p>
                                    {image && (
                                        <div className="rounded-xl overflow-hidden shadow-inner border border-black/5 dark:border-white/10">
                                            <img src={image} alt={label} className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
                            style={{ background: 'var(--color-primary-navy)', color: 'white' }}
                        >
                            Understood
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default KPIDetailsModal;
