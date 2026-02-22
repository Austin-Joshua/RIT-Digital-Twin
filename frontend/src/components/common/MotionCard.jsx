import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import { fadeInUp } from '../../styles/animation-variants';

const MotionCard = ({ children, ...props }) => {
    return (
        <motion.div variants={fadeInUp}>
            <Card {...props}>
                {children}
            </Card>
        </motion.div>
    );
};

export default MotionCard;
