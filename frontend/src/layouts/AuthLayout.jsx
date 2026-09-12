import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import AnimatedWaveBackground from '../components/auth/AnimatedWaveBackground';
import { useTheme } from '../hooks/useTheme';
import { FaMoon, FaSun } from 'react-icons/fa';

const AuthLayout = () => {
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();
    const isLogin = location.pathname === '/login';

    const ease = [0.4, 0, 0.2, 1];

    const panelVariants = {
        login: { x: 0, transition: { duration: 0.4, ease } },
        signup: { x: '100%', transition: { duration: 0.4, ease } }
    };

    const formPanelVariants = {
        login: { x: 0, transition: { duration: 0.4, ease } },
        signup: { x: '-100%', transition: { duration: 0.4, ease } }
    };

    const textVariants = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.3 } },
        exit: { opacity: 0, y: -15, transition: { duration: 0.15 } }
    };

    return (
        <div style={{
            minHeight: '100vh', width: '100vw', backgroundColor: 'var(--theme-bg)', display: 'flex', position: 'relative', transition: 'background-color var(--transition-speed)'
        }}>
            <div style={{ position: 'fixed', top: '20px', right: '25px', zIndex: 100 }}>
                <button onClick={toggleTheme} style={{
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '50%', cursor: 'pointer', color: 'var(--color-accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-subtle)', fontSize: '18px'
                }}>
                    {isDarkMode ? <FaMoon /> : <FaSun />}
                </button>
            </div>
            <div className="auth-wrapper" style={{ display: 'flex', width: '100%', height: '100vh', position: 'relative' }}>
                <motion.div className="brand-panel" animate={isLogin ? 'login' : 'signup'} variants={panelVariants} style={{
                    width: '50%', height: '100%',
                    background: 'linear-gradient(135deg, #0B2C6B 0%, #123C8C 100%)',
                    position: 'absolute', left: 0, zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px',
                    color: '#ffffff'
                }}>
                    <AnimatedWaveBackground />
                    <div className="brand-copy" style={{ position: 'relative', zIndex: 1, width: 'min(440px, 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img
                            src={isDarkMode ? "/assets/images/institutional-light-logo.png" : "/assets/images/institutional-dark-logo.png"}
                            alt="RIT Institutional Logo"
                            style={{ height: '72px', width: 'auto', display: 'block', margin: '0 auto 18px' }}
                        />
                        <AnimatePresence mode="wait">
                            <motion.div key={isLogin ? 'login-info' : 'signup-info'} initial="initial" animate="animate" exit="exit" variants={textVariants} style={{ width: '100%' }}>
                                <h1 style={{ fontSize: '2.6rem', fontWeight: 800, margin: '0 0 6px', lineHeight: 1.15, color: '#ffffff', textAlign: 'center' }}>
                                    Digital <span style={{ color: 'var(--color-accent-gold)' }}>Twin</span>
                                </h1>
                                <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.92)', margin: '0 0 18px', lineHeight: 1.4, fontWeight: 500, textAlign: 'center' }}>
                                    Smart Campus Intelligence Platform
                                </p>

                                <div className="brand-description" style={{
                                    fontSize: '0.95rem',
                                    color: 'rgba(255, 255, 255, 0.82)',
                                    lineHeight: 1.65,
                                    margin: '0 0 18px',
                                    padding: '14px 16px',
                                    background: 'rgba(0,0,0,0.12)',
                                    borderRadius: '12px',
                                    borderLeft: '3px solid var(--color-accent-gold)',
                                    textAlign: 'left'
                                }}>
                                    Rajalakshmi Institute of Technology is an engineering college in Chennai, Tamil Nadu, India.
                                    RIT is approved by AICTE and affiliated with Anna University, Chennai and accredited with <strong>&apos;A++&apos; Grade in NAAC</strong>.
                                </div>

                                <div className="brand-tagline" style={{
                                    fontSize: '0.98rem',
                                    fontStyle: 'italic',
                                    color: 'var(--color-accent-gold)',
                                    fontWeight: 500,
                                    margin: 0,
                                    borderLeft: '3px solid var(--color-accent-gold)',
                                    paddingLeft: '14px',
                                    textAlign: 'left'
                                }}>
                                    &quot;Innovation through data, excellence in education.&quot;
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
                <motion.div className="form-panel" animate={isLogin ? 'login' : 'signup'} variants={formPanelVariants} style={{
                    width: '50%', height: '100%', position: 'absolute', right: 0, zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px'
                }}>
                    <div style={{ maxWidth: '440px', width: '100%' }}>
                        <Outlet />
                    </div>
                </motion.div>
            </div>
            <style>{`
                @media (max-width: 1024px) {
                    .auth-wrapper { 
                        flex-direction: column !important; 
                        overflow-y: auto !important; 
                        height: auto !important; 
                        min-height: 100vh !important; 
                        justify-content: flex-start !important; 
                        align-items: center !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        gap: 0 !important;
                        background: var(--theme-bg) !important;
                    }
                    .brand-panel, .form-panel { 
                        width: 100% !important; 
                        position: relative !important; 
                        transform: none !important; 
                        left: auto !important; 
                        right: auto !important; 
                        margin: 0 !important;
                    }
                    .brand-panel { 
                        padding: 32px 20px 24px !important; 
                        height: auto !important; 
                        z-index: 10 !important; 
                        display: flex !important; 
                        flex-direction: column !important; 
                        align-items: center !important; 
                        text-align: center;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                    }
                    .brand-panel h1 { font-size: 1.4rem !important; margin-bottom: 6px !important; }
                    .brand-panel p, .brand-description, .brand-tagline { display: none !important; }
                    .brand-panel img { height: 60px !important; margin-left: auto; margin-right: auto; }
                    .form-panel { 
                        padding: 40px 20px !important; 
                        height: auto !important; 
                        display: flex !important; 
                        justify-content: center !important; 
                        align-items: flex-start !important; 
                        z-index: 1 !important;
                        flex: 1;
                    }
                    .auth-form-wrapper { width: 100% !important; max-width: 440px !important; margin: 0 auto !important; }
                }
                @media (max-width: 480px) {
                    .brand-panel { padding: 16px 16px 12px !important; }
                    .brand-panel h1 { font-size: 1.2rem !important; }
                    .brand-panel img { height: 48px !important; }
                    .form-panel { padding: 16px 12px !important; }
                    .auth-form-wrapper { padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default AuthLayout;
