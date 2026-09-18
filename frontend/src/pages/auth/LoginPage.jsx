import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FaEye, FaEyeSlash, FaLock, FaExclamationTriangle, FaShieldAlt, FaGoogle } from 'react-icons/fa';
import { ThemeContext } from '../../hooks/ThemeContext';
import { getBackendRootURL } from '../../services/api';

const AUTH_PRIMARY_BLUE = '#123D8A';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 900; // 15 minutes – mirrors backend block duration

/** Parse "X attempts remaining" from backend messages */
function parseRemainingAttempts(msg) {
    if (!msg) return null;
    const m = msg.match(/(\d+)\s+attempt[s]?\s+remaining/i);
    return m ? parseInt(m[1], 10) : null;
}

/** Detect account/IP locked messages from backend */
function isLockedMessage(msg) {
    if (!msg) return false;
    return /locked|blocked|contact admin|too many/i.test(msg);
}

/** Network / server-side error – not a credential failure */
function isNetworkError(msg) {
    if (!msg) return false;
    return /timeout|network|server|unavailable|waking/i.test(msg);
}

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');

    // Real attempt tracking state
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [lockoutCountdown, setLockoutCountdown] = useState(0);

    const countdownRef = useRef(null);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode } = useContext(ThemeContext);

    // ── Backend health-check poll ──────────────────────────────
    useEffect(() => {
        let timeoutId;
        const checkConnection = async () => {
            const controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), 15000);
            try {
                const healthUrl = `${getBackendRootURL()}/actuator/health`;
                const response = await fetch(healthUrl, {
                    signal: controller.signal,
                    mode: 'cors',
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                setBackendStatus(response.ok ? 'online' : 'offline');
            } catch {
                setBackendStatus('offline');
            } finally {
                clearTimeout(timeoutId);
            }
        };
        checkConnection();
        const interval = setInterval(checkConnection, 10000);
        return () => { if (timeoutId) clearTimeout(timeoutId); clearInterval(interval); };
    }, []);

    // ── Lockout countdown ──────────────────────────────────────
    useEffect(() => {
        if (isLockedOut && lockoutCountdown > 0) {
            countdownRef.current = setInterval(() => {
                setLockoutCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        setIsLockedOut(false);
                        setFailedAttempts(0);
                        setRemainingAttempts(MAX_ATTEMPTS);
                        setError('');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(countdownRef.current);
    }, [isLockedOut, lockoutCountdown]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error && !isLockedOut) setError('');
    };

    // ── Severity colours based on remaining attempts ───────────
    const getSeverity = () => {
        if (remainingAttempts <= 1) return { color: '#dc2626', bg: 'rgba(220,38,38,0.12)', border: '#dc2626' };
        if (remainingAttempts <= 2) return { color: '#ea580c', bg: 'rgba(234,88,12,0.12)', border: '#ea580c' };
        if (remainingAttempts <= 3) return { color: '#d97706', bg: 'rgba(217,119,6,0.12)', border: '#d97706' };
        return { color: '#ca8a04', bg: 'rgba(202,138,4,0.10)', border: '#ca8a04' };
    };

    /**
     * Central handler: called after any failed attempt.
     * Parses backend message to get authoritative remaining count.
     */
    const processFailedAttempt = (serverMsg) => {
        // Hard lock from server
        if (isLockedMessage(serverMsg)) {
            setIsLockedOut(true);
            setRemainingAttempts(0);
            setFailedAttempts(MAX_ATTEMPTS);
            setLockoutCountdown(LOCKOUT_SECONDS);
            setError(serverMsg);
            return;
        }

        const newFailed = failedAttempts + 1;
        setFailedAttempts(newFailed);

        const parsed = parseRemainingAttempts(serverMsg);
        if (parsed !== null) {
            setRemainingAttempts(parsed);
            if (parsed === 0) { setIsLockedOut(true); setLockoutCountdown(LOCKOUT_SECONDS); }
        } else {
            const localRemaining = Math.max(0, MAX_ATTEMPTS - newFailed);
            setRemainingAttempts(localRemaining);
            if (localRemaining === 0) { setIsLockedOut(true); setLockoutCountdown(LOCKOUT_SECONDS); }
        }
        setError(serverMsg);
    };

    // ── Password submit ────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLockedOut) return;
        setError('');
        setLoading(true);
        try {
            const result = await login(credentials.username.trim(), (credentials.password || '').trim());
            if (result.success) {
                setFailedAttempts(0); setRemainingAttempts(MAX_ATTEMPTS); setIsLockedOut(false);
                const role = (result.role || '').replace('ROLE_', '').replace(/_/g, '').toUpperCase();
                if (role === 'STUDENT') navigate('/student', { replace: true });
                else if (role === 'PARENT') navigate('/parent', { replace: true });
                else if (role === 'HOD') navigate('/hod', { replace: true });
                else navigate('/', { replace: true });
            } else {
                processFailedAttempt(result.message || 'Invalid username or password.');
            }
        } catch (_err) {
            const msg = _err?.message || '';
            if (msg.includes('timeout') || msg.includes('ECONNABORTED')) {
                setError('Server is waking up (cold start). Please wait 15–30 seconds and try again.');
            } else if (msg.includes('Network Error')) {
                setError('Cannot reach backend server. It may be starting up — please retry in a moment.');
            } else {
                processFailedAttempt(msg || 'Authentication service unavailable.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Google Sign-In ─────────────────────────────────────────
    const handleGoogleLogin = async () => {
        if (isLockedOut) return;
        setError('');
        setLoading(true);
        try {
            const result = await googleLogin();
            if (result.success) {
                setFailedAttempts(0); setRemainingAttempts(MAX_ATTEMPTS); setIsLockedOut(false);
                const role = (result.role || '').replace('ROLE_', '').replace(/_/g, '').toUpperCase();
                if (role === 'STUDENT') navigate('/student', { replace: true });
                else if (role === 'PARENT') navigate('/parent', { replace: true });
                else if (role === 'HOD') navigate('/hod', { replace: true });
                else navigate('/', { replace: true });
            } else {
                processFailedAttempt(result.message || 'Google sign-in failed.');
            }
        } catch {
            setError('Google sign-in failed.');
        } finally {
            setLoading(false);
        }
    };

    const severity = getSeverity();
    const showAttemptWarning = failedAttempts > 0 && !isLockedOut;
    const isNetErr = isNetworkError(error) && !isLockedMessage(error) && failedAttempts === 0;
    const formattedCountdown = lockoutCountdown > 0
        ? `${Math.floor(lockoutCountdown / 60)}:${String(lockoutCountdown % 60).padStart(2, '0')}`
        : null;

    return (
        <div className="auth-form-wrapper">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'var(--card-bg)',
                    border: `1.5px solid ${isLockedOut ? '#dc2626' : 'var(--theme-border)'}`,
                    padding: 'clamp(16px, 3vw, 28px)',
                    borderRadius: '16px',
                    boxShadow: isLockedOut
                        ? '0 12px 40px rgba(220,38,38,0.15)'
                        : '0 12px 40px rgba(0,0,0,0.08)',
                    width: '100%', maxWidth: '420px',
                    position: 'relative', zIndex: 2,
                    transition: 'border-color 0.3s, box-shadow 0.3s'
                }}
            >
                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ minWidth: 0, flex: 1, paddingTop: '2px' }}>
                        <h2 style={{
                            fontSize: '1.45rem', fontWeight: 650,
                            color: isDarkMode ? '#FFD700' : '#B8860B',
                            margin: 0, lineHeight: 1.2, letterSpacing: '0.01em'
                        }}>Login</h2>
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.4, margin: '6px 0 0' }}>
                            Sign in with your IMS user ID and password
                        </p>
                    </div>
                    {/* Backend status pill */}
                    <div style={{
                        flexShrink: 0,
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        height: '26px', padding: '0 10px', borderRadius: '999px',
                        background: backendStatus === 'online' ? 'rgba(22,163,74,0.12)'
                            : backendStatus === 'checking' ? 'rgba(59,130,246,0.12)' : 'rgba(220,38,38,0.12)',
                        border: `1px solid ${backendStatus === 'online' ? 'var(--color-success)'
                            : backendStatus === 'checking' ? '#3B82F6' : 'var(--color-danger)'}`,
                        fontSize: '11px', fontWeight: 650, letterSpacing: '0.04em',
                        color: backendStatus === 'online' ? 'var(--color-success)'
                            : backendStatus === 'checking' ? '#3B82F6' : 'var(--color-danger)'
                    }}>
                        <span style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: 'currentColor',
                            animation: backendStatus === 'checking' ? 'pulse 1.5s infinite' : 'none'
                        }} />
                        {backendStatus === 'checking' ? 'CHECKING' : backendStatus.toUpperCase()}
                    </div>
                </div>

                {/* ── LOCKOUT BANNER ── */}
                <AnimatePresence>
                    {isLockedOut && (
                        <motion.div
                            key="lockout-banner"
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8 }}
                            style={{
                                backgroundColor: 'rgba(220,38,38,0.10)',
                                border: '1.5px solid #dc2626',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                marginBottom: '16px',
                                display: 'flex', flexDirection: 'column', gap: '8px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaLock size={15} color="#dc2626" />
                                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.9rem' }}>
                                    Account Temporarily Locked
                                </span>
                            </div>
                            <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                                You have exceeded <strong>{MAX_ATTEMPTS} failed login attempts</strong>.
                                Your account is locked for security reasons.
                            </p>
                            {formattedCountdown && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: 'rgba(220,38,38,0.08)', borderRadius: '8px', padding: '8px 10px'
                                }}>
                                    <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>⏱ Unlocks in approximately:</span>
                                    <span style={{
                                        color: '#dc2626', fontWeight: 800, fontSize: '1rem',
                                        fontFamily: 'monospace', letterSpacing: '0.08em'
                                    }}>
                                        {formattedCountdown}
                                    </span>
                                </div>
                            )}
                            <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.79rem', margin: 0 }}>
                                Contact your administrator to unlock the account immediately.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── ATTEMPT WARNING (1st fail onwards, pre-lockout) ── */}
                <AnimatePresence>
                    {showAttemptWarning && (
                        <motion.div
                            key="attempt-warning"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                backgroundColor: severity.bg,
                                border: `1.5px solid ${severity.border}`,
                                borderRadius: '10px',
                                padding: '10px 14px',
                                marginBottom: '12px',
                                display: 'flex', flexDirection: 'column', gap: '8px'
                            }}
                        >
                            {/* Error text + attempt dots */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                                    <FaExclamationTriangle size={13} color={severity.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <span style={{ color: severity.color, fontSize: '0.83rem', fontWeight: 600, lineHeight: 1.4 }}>
                                        {isNetworkError(error) ? error : (error || `Invalid credentials.`)}
                                    </span>
                                </div>
                                {/* Dot meter */}
                                <div style={{ display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center', paddingTop: '2px' }}>
                                    {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0.6 }}
                                            animate={{ scale: 1 }}
                                            style={{
                                                width: '9px', height: '9px', borderRadius: '2px',
                                                background: i < failedAttempts ? severity.color : 'rgba(0,0,0,0.12)',
                                                transition: 'background 0.3s'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Progress bar + label */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: severity.color }}>
                                    <span style={{ fontWeight: 500 }}>Attempts used: <strong>{failedAttempts}</strong> / {MAX_ATTEMPTS}</span>
                                    <span style={{ fontWeight: 700 }}>
                                        {remainingAttempts} remaining
                                    </span>
                                </div>
                                <div style={{ height: '5px', background: 'rgba(0,0,0,0.10)', borderRadius: '999px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(failedAttempts / MAX_ATTEMPTS) * 100}%` }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                        style={{ height: '100%', background: severity.color, borderRadius: '999px' }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Network / server error (no attempt increment) ── */}
                <AnimatePresence>
                    {isNetErr && (
                        <motion.div
                            key="net-error"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                backgroundColor: 'rgba(220,38,38,0.10)',
                                color: 'var(--color-danger)',
                                padding: '12px 16px', borderRadius: '12px',
                                fontSize: '0.875rem', marginBottom: '16px',
                                borderLeft: '4px solid var(--color-danger)'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── FORM ── */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Input
                        label="User ID"
                        type="text"
                        name="username"
                        id="login-username"
                        value={credentials.username}
                        onChange={handleChange}
                        placeholder="Register No / Email / User ID"
                        required
                        disabled={isLockedOut}
                    />

                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        id="login-password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        disabled={isLockedOut}
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLockedOut}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                style={{
                                    background: 'transparent', border: 'none',
                                    cursor: isLockedOut ? 'not-allowed' : 'pointer',
                                    color: 'var(--theme-text-muted)',
                                    fontSize: '1.2rem', padding: '4px',
                                    display: 'flex', alignItems: 'center'
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        }
                    />

                    <Button
                        type="submit"
                        id="login-submit-btn"
                        disabled={loading || isLockedOut}
                        style={{
                            width: '100%', marginTop: '4px',
                            padding: '8px 16px', fontSize: '0.95rem',
                            borderRadius: '8px',
                            backgroundColor: isLockedOut ? '#6b7280' : AUTH_PRIMARY_BLUE,
                            color: '#ffffff', border: 'none', fontWeight: '700',
                            cursor: isLockedOut ? 'not-allowed' : 'pointer',
                            opacity: isLockedOut ? 0.65 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'background-color 0.2s, opacity 0.2s'
                        }}
                    >
                        {isLockedOut
                            ? <><FaLock size={13} /> Account Locked</>
                            : loading ? 'Authenticating...' : 'Sign In'}
                    </Button>

                    {/* OR divider */}
                    <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: '15px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--theme-border)' }} />
                        <span style={{ color: 'var(--theme-text-muted)', fontSize: '0.85rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--theme-border)' }} />
                    </div>

                    {/* Google Sign-In */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            type="button"
                            id="login-google-btn"
                            onClick={handleGoogleLogin}
                            disabled={loading || isLockedOut}
                            style={{
                                width: '100%', padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--theme-border)',
                                background: isDarkMode ? '#2d2d2d' : '#ffffff',
                                color: 'var(--theme-text)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                cursor: (loading || isLockedOut) ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem', fontWeight: '600',
                                transition: 'background 0.2s',
                                opacity: isLockedOut ? 0.5 : 1
                            }}
                        >
                            <FaGoogle color="#4285F4" />
                            Sign in with Google
                        </button>
                    </div>
                </form>

                {/* ── Security notice ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', marginTop: '12px',
                    color: 'var(--theme-text-muted)', fontSize: '0.74rem'
                }}>
                    <FaShieldAlt size={10} />
                    <span>Secured · Accounts lock after {MAX_ATTEMPTS} failed attempts</span>
                </div>

                <div style={{ marginTop: '8px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    New to the platform?{' '}
                    <Link to="/register" style={{ color: 'var(--color-accent-gold)', fontWeight: '600', textDecoration: 'none' }}>
                        Request Access
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
