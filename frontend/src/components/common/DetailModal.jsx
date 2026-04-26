import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

const DetailModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--theme-border)',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        position: 'relative'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        padding: '24px 32px',
                        borderBottom: '1px solid var(--theme-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--glass-bg)'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--theme-text)',
                            margin: 0
                        }}>
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--theme-text)',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                display: 'flex',
                                padding: '8px',
                                borderRadius: '50%',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <IoClose />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '32px',
                        overflowY: 'auto',
                        maxHeight: 'calc(90vh - 80px)'
                    }}>
                        {children}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DetailModal;
