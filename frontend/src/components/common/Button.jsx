import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ variant = 'primary', children, ...props }) => {
    const getStyles = () => {
        const base = {
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: 'var(--font-size-body)',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'var(--font-primary)',
            transition: 'background-color 0.2s, color 0.2s, box-shadow 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-sm)',
            boxShadow: 'var(--shadow-soft)',
            outline: 'none'
        };

        if (variant === 'primary') {
            return {
                ...base,
                backgroundColor: 'var(--color-primary-navy)',
                color: '#ffffff',
            };
        }

        if (variant === 'gold') {
            return {
                ...base,
                backgroundColor: 'var(--color-accent-gold)',
                color: '#ffffff',
            };
        }

        if (variant === 'danger') {
            return {
                ...base,
                backgroundColor: 'var(--color-danger)',
                color: '#ffffff',
            };
        }

        return base;
    };

    return (
        <motion.button
            whileHover={{
                scale: 1.02,
                filter: 'brightness(1.1)',
                boxShadow: 'var(--shadow-medium)'
            }}
            whileTap={{ scale: 0.98 }}
            style={getStyles()}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
