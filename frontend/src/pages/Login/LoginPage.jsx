import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineExclamationCircle } from 'react-icons/hi';
import { FiGrid, FiZap, FiTruck, FiUsers, FiBarChart2, FiActivity } from 'react-icons/fi';
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        try {
            await login({ username, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: <FiGrid />, label: 'Smart Classrooms' },
        { icon: <FiZap />, label: 'Energy Analytics' },
        { icon: <FiTruck />, label: 'Transport Routes' },
        { icon: <FiUsers />, label: 'Crowd Management' },
        { icon: <FiBarChart2 />, label: 'Sustainability' },
        { icon: <FiActivity />, label: 'Predictive AI' },
    ];

    return (
        <div className="login-page">
            {/* Left Branding Panel */}
            <div className="login-branding">
                <div className="login-branding-content">
                    <div className="login-logo-container">
                        <span className="logo-text">RIT</span>
                    </div>
                    <h1>
                        Digital <span className="accent">Twin</span>
                    </h1>
                    <p className="subtitle">Smart Campus Intelligence Platform</p>
                    <p className="tagline">Rajalakshmi Institute of Technology, Chennai</p>

                    <div className="login-features">
                        {features.map((f, i) => (
                            <div className="login-feature-item" key={i}>
                                <span className="feature-icon">{f.icon}</span>
                                <span>{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="login-form-panel">
                <div className="login-form-container">
                    <div className="login-form-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to access your campus intelligence dashboard</p>
                    </div>

                    {error && (
                        <div className="login-error-banner">
                            <HiOutlineExclamationCircle />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <div className="form-input-wrapper">
                                <HiOutlineUser className="input-icon" />
                                <input
                                    id="username"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="form-input-wrapper">
                                <HiOutlineLockClosed className="input-icon" />
                                <input
                                    id="password"
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="spinner" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="quick-login-section">
                        <h3>Quick Access</h3>
                        <div className="quick-login-grid">
                            <button
                                className="quick-btn admin"
                                onClick={() => { setUsername('admin@ritchennai.edu.in'); setPassword('admin123'); }}
                                title="Login as Admin"
                            >
                                <FiZap className="quick-icon" />
                                <span>Admin</span>
                            </button>
                            <button
                                className="quick-btn faculty"
                                onClick={() => { setUsername('faculty@ritchennai.edu.in'); setPassword('faculty123'); }}
                                title="Login as Faculty"
                            >
                                <FiUsers className="quick-icon" />
                                <span>Faculty</span>
                            </button>
                            <button
                                className="quick-btn student"
                                onClick={() => { setUsername('student@ritchennai.edu.in'); setPassword('student123'); }}
                                title="Login as Student"
                            >
                                <HiOutlineUser className="quick-icon" />
                                <span>Student</span>
                            </button>
                        </div>
                    </div>

                    <div className="login-footer">
                        <p>
                            &copy; 2026{' '}
                            <span className="college-name">Rajalakshmi Institute of Technology</span>
                        </p>
                        <p>Smart Campus Intelligence Platform</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
