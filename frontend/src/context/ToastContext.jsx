import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ toast, onClose }) => {
    const getBgColor = () => {
        switch (toast.type) {
            case 'success': return 'var(--color-success)';
            case 'error': return 'var(--color-danger)';
            case 'warning': return 'var(--color-warning)';
            default: return 'var(--color-primary-navy)';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            onClick={onClose}
            style={{
                pointerEvents: 'auto',
                padding: '12px 24px',
                backgroundColor: getBgColor(),
                color: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '200px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: 'var(--font-size-body)'
            }}
        >
            <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '⚠️'}</span>
            {toast.message}
        </motion.div>
    );
};
