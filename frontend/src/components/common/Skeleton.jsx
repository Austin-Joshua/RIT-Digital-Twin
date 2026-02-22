import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)', margin = '0' }) => {
    return (
        <div style={{
            width,
            height,
            borderRadius,
            margin,
            overflow: 'hidden',
            backgroundColor: 'var(--theme-bg)',
            position: 'relative',
            border: '1px solid var(--theme-border)'
        }}>
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                }}
            />
            {/* Dark mode support - darker shimmer */}
            <style>
                {`
                    .dark .skeleton-shimmer {
                        background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.2), transparent);
                    }
                `}
            </style>
        </div>
    );
};

export default Skeleton;
