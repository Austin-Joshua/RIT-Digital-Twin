import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

const CampusMap3D = lazy(() => import('../../components/CampusMap3D'));

const CampusMap = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '16px',
                height: 'calc(100vh - 100px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}
        >
            <div>
                <h1 style={{ fontSize: '1.7rem', color: 'var(--theme-text)', fontWeight: '800', marginBottom: '4px' }}>
                    Live IoT Campus Map (3D)
                </h1>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.95rem' }}>
                    Photorealistic 3D RIT Chennai campus with IoT overlays for occupancy, energy, and temperature.
                </p>
            </div>

            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--theme-border)', boxShadow: 'var(--shadow-soft)' }}>
                <Suspense fallback={
                    <div style={{ height: '100%', minHeight: '600px', display: 'grid', placeItems: 'center', color: 'var(--theme-text-muted)' }}>
                        Loading 3D campus renderer...
                    </div>
                }>
                    <CampusMap3D />
                </Suspense>
            </div>
        </motion.div>
    );
};

export default CampusMap;
