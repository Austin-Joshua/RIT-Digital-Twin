import React from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '../../styles/animation-variants';

const AnimatedChartContainer = ({ children, ...props }) => {
    return (
        <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', height: '100%' }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedChartContainer;
