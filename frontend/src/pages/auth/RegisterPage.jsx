import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ThemeContext } from '../../context/ThemeContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        inviteCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isDarkMode } = useContext(ThemeContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const email = formData.email.trim();
        const username = formData.username.trim();

        if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.ritchennai\.edu\.in$/)) {
            setError('Registration restricted to departmental @department.ritchennai.edu.in email addresses.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', { ...formData, email, username });
            navigate('/login?registered=true');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-wrapper">


            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--glass-border)',
                    padding: 'clamp(16px, 3vw, 32px)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    width: '100%'
                }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-accent-gold)', marginBottom: '4px' }}>Create Account</h2>
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem' }}>Register for access to the RIT Digital Twin Platform.</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                            color: 'var(--color-danger)',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            marginBottom: '16px',
                            borderLeft: '4px solid var(--color-danger)'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Input
                        label="Username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Preferred username"
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., username@cse.ritchennai.edu.in"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Secure password"
                        required
                    />

                    <Input
                        label="Invite Code (Optional)"
                        type="password"
                        name="inviteCode"
                        value={formData.inviteCode}
                        onChange={handleChange}
                        placeholder="Invitation code"
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            marginTop: '4px',
                            padding: '8px',
                            fontSize: '0.95rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-primary-navy)',
                            color: '#ffffff',
                            fontWeight: '700'
                        }}
                    >
                        {loading ? 'Processing...' : 'Create Account'}
                    </Button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Already have an account? {' '}
                    <Link to="/login" style={{ color: 'var(--color-accent-gold)', fontWeight: '600', textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
