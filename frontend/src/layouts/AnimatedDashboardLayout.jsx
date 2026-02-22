import React from 'react';
import { motion } from 'framer-motion';
import { containerVariants } from '../styles/animation-variants';

/**
 * AnimatedDashboardLayout
 * Orchestrates staggered entrance for child components.
 */
const AnimatedDashboardLayout = ({ children }) => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
        >
            {children}
        </motion.div>
    );
};

export default AnimatedDashboardLayout;
