import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, padding = 'var(--spacing-lg)', glass = false, hoverEffect = true, ...props }) => {
    return (
        <motion.div
            whileHover={hoverEffect ? {
                y: -4,
                boxShadow: 'var(--shadow-medium)',
                borderColor: 'var(--color-accent-gold)'
            } : {}}
            style={{
                background: glass ? 'var(--glass-bg)' : 'var(--card-bg)',
                backdropFilter: glass ? 'blur(10px)' : 'none',
                border: `1px solid ${glass ? 'var(--glass-border)' : 'var(--theme-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: padding,
                boxShadow: 'var(--shadow-soft)',
                color: 'var(--theme-text)',
                transition: 'background-color var(--transition-speed), border-color 0.2s, box-shadow 0.2s',
                cursor: (hoverEffect || props.onClick) ? 'pointer' : 'default',
                ...props.style
            }}
            onClick={props.onClick}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
