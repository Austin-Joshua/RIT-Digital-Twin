import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { user, login } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/', { replace: true });
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* ── Left Branding Panel ── */}
            <div className="login-brand-panel">
                <div className="brand-bg-pattern" />
                <div className="brand-content">
                    <div className="brand-icon-ring">
                        <span className="brand-icon-text">RIT</span>
                    </div>
                    <h1 className="brand-title">Smart Campus</h1>
                    <h2 className="brand-subtitle">Intelligence Platform</h2>
                    <p className="brand-tagline">
                        Digital Twin · IoT Analytics · Predictive Intelligence
                    </p>
                </div>
                <div className="brand-footer">
                    Rajalakshmi Institute of Technology
                </div>
            </div>

            {/* ── Right Login Form ── */}
            <div className="login-form-panel">
                <div className="login-form-wrapper">
                    {/* Mobile Logo */}
                    <div className="mobile-logo">
                        <div className="mobile-logo-icon">RIT</div>
                    </div>

                    <div className="login-heading">
                        <h2>Welcome back</h2>
                        <p>Sign in to your institutional account</p>
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-link">Forgot password?</a>
                        </div>

                        <button
                            className="login-btn"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="login-btn-loading">
                                    <svg className="spinner" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : (
                                <>
                                    Sign In
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>&copy; 2026 Rajalakshmi Institute of Technology</p>
                        <p>Authorized Personnel Only</p>
                    </div>
                </div>
            </div>

            <style>{`
                /* ── Page Layout ── */
                .login-page {
                    display: flex;
                    min-height: 100vh;
                    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                }

                /* ── Left Brand Panel ── */
                .login-brand-panel {
                    flex: 0 0 45%;
                    background: linear-gradient(160deg, #07204F 0%, #0B2C6B 40%, #123C8C 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    padding: 3rem;
                }

                .brand-bg-pattern {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.08) 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%),
                        radial-gradient(ellipse at 60% 80%, rgba(212,175,55,0.05) 0%, transparent 50%);
                    animation: patternShift 15s ease-in-out infinite alternate;
                }

                @keyframes patternShift {
                    0%   { opacity: 0.7; transform: scale(1); }
                    100% { opacity: 1;   transform: scale(1.05); }
                }

                .brand-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                }

                .brand-icon-ring {
                    width: 100px;
                    height: 100px;
                    border-radius: 24px;
                    border: 2px solid rgba(212,175,55,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 2rem;
                    background: rgba(255,255,255,0.06);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
                    animation: floatIcon 6s ease-in-out infinite;
                }

                @keyframes floatIcon {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-8px); }
                }

                .brand-icon-text {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #D4AF37;
                    letter-spacing: 3px;
                    text-shadow: 0 2px 8px rgba(212,175,55,0.3);
                }

                .brand-title {
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: #fff;
                    margin: 0;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }

                .brand-subtitle {
                    font-size: 1.15rem;
                    font-weight: 400;
                    color: rgba(212,175,55,0.9);
                    margin: 0.5rem 0 0;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .brand-tagline {
                    margin-top: 1.5rem;
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.5);
                    letter-spacing: 0.5px;
                }

                /* ── Bold RIT Name in footer ── */
                .brand-footer {
                    position: absolute;
                    bottom: 2.5rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #D4AF37;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    text-shadow: 0 2px 12px rgba(212,175,55,0.25);
                }

                /* ── Right Form Panel ── */
                .login-form-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #F4F6F9;
                    padding: 2rem;
                }

                .login-form-wrapper {
                    width: 100%;
                    max-width: 420px;
                }

                .mobile-logo {
                    display: none;
                    justify-content: center;
                    margin-bottom: 2rem;
                }

                .mobile-logo-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #0B2C6B, #123C8C);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #D4AF37;
                    font-weight: 800;
                    font-size: 1.15rem;
                    letter-spacing: 2px;
                    box-shadow: 0 4px 16px rgba(11,44,107,0.25);
                }

                .login-heading {
                    margin-bottom: 2rem;
                }

                .login-heading h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #0B2C6B;
                    margin: 0 0 0.35rem;
                }

                .login-heading p {
                    font-size: 0.9rem;
                    color: #6B7280;
                    margin: 0;
                }

                /* ── Error ── */
                .login-error {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    background: #FEF2F2;
                    border: 1px solid #FECACA;
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    margin-bottom: 1.5rem;
                    color: #DC2626;
                    font-size: 0.85rem;
                    font-weight: 500;
                    animation: shakeError 0.4s ease;
                }

                @keyframes shakeError {
                    0%, 100% { transform: translateX(0); }
                    20%  { transform: translateX(-6px); }
                    40%  { transform: translateX(6px); }
                    60%  { transform: translateX(-4px); }
                    80%  { transform: translateX(4px); }
                }

                /* ── Form ── */
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.45rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 14px;
                    color: #9CA3AF;
                    pointer-events: none;
                    transition: color 0.2s;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 0.75rem 0.75rem 0.75rem 2.75rem;
                    border: 1.5px solid #E5E7EB;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    color: #1F2937;
                    background: #fff;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .input-wrapper input::placeholder {
                    color: #C0C5CE;
                }

                .input-wrapper input:focus {
                    border-color: #0B2C6B;
                    box-shadow: 0 0 0 3px rgba(11,44,107,0.1);
                }

                .input-wrapper:focus-within .input-icon {
                    color: #0B2C6B;
                }

                .password-toggle {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #9CA3AF;
                    padding: 4px;
                    display: flex;
                    transition: color 0.2s;
                }

                .password-toggle:hover {
                    color: #0B2C6B;
                }

                /* ── Options Row ── */
                .form-options {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 0.25rem;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.82rem;
                    color: #6B7280;
                    cursor: pointer;
                    user-select: none;
                }

                .remember-me input {
                    accent-color: #0B2C6B;
                    width: 15px;
                    height: 15px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .forgot-link {
                    font-size: 0.82rem;
                    font-weight: 500;
                    color: #0B2C6B;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .forgot-link:hover {
                    color: #D4AF37;
                }

                /* ── Submit Button ── */
                .login-btn {
                    width: 100%;
                    padding: 0.85rem;
                    border: none;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #0B2C6B 0%, #123C8C 100%);
                    color: #fff;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 14px rgba(11,44,107,0.3);
                    margin-top: 0.5rem;
                    letter-spacing: 0.3px;
                }

                .login-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(11,44,107,0.4);
                    background: linear-gradient(135deg, #0D3477 0%, #1548A0 100%);
                }

                .login-btn:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(11,44,107,0.3);
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .login-btn-loading {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .spinner {
                    width: 18px;
                    height: 18px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }

                /* ── Footer ── */
                .login-footer {
                    text-align: center;
                    margin-top: 2.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #E5E7EB;
                }

                .login-footer p {
                    margin: 0;
                    font-size: 0.72rem;
                    color: #9CA3AF;
                    line-height: 1.6;
                }

                /* ── Responsive ── */
                @media (max-width: 900px) {
                    .login-brand-panel {
                        display: none;
                    }
                    .mobile-logo {
                        display: flex;
                    }
                    .login-form-panel {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
