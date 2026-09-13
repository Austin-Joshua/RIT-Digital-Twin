import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

export default function PageTransition() {
    const location = useLocation();
    return (
        <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
        >
            <Outlet />
        </motion.div>
    );
}
