import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email.endsWith('@ritchennai.edu.in')) {
            setError('Registration is restricted to official @ritchennai.edu.in email addresses.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login?registered=true');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                width: '100%'
            }}
        >
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--color-accent-gold)', marginBottom: '8px' }}>Register</h2>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.95rem' }}>Join the RIT institutional digital platform.</p>
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
                        marginBottom: '24px',
                        borderLeft: '4px solid var(--color-danger)'
                    }}
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Input
                    label="Username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username"
                    required
                />

                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email"
                    required
                />

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="password"
                    required
                />

                <Input
                    label="Institutional Invite Code (Optional)"
                    type="password"
                    name="inviteCode"
                    value={formData.inviteCode}
                    onChange={handleChange}
                    placeholder="invite code"
                />

                <Button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        marginTop: '16px',
                        padding: '16px 32px',
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        backgroundColor: 'var(--color-primary-navy, #0b2c6b)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: '700',
                        boxShadow: '0 8px 16px rgba(11, 44, 107, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.8 : 1
                    }}
                    onMouseOver={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 20px rgba(11, 44, 107, 0.3)';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(11, 44, 107, 0.2)';
                        }
                    }}
                >
                    {loading ? 'Processing...' : 'Register'}
                </Button>
            </form>

            <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Already have access? {' '}
                <Link to="/login" style={{ color: 'var(--color-accent-gold)', fontWeight: '600', textDecoration: 'none' }}>
                    Sign In
                </Link>
            </div>
        </motion.div>
    );
};

export default RegisterPage;
