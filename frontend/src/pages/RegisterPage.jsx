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
        role: 'FACULTY'
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

            <form onSubmit={handleSubmit}>
                <Input
                    label="Full Name / ID"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Security Key"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <Button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        marginTop: '24px',
                        padding: '16px 32px',
                        fontSize: '1.2rem',
                        borderRadius: '12px',
                        backgroundColor: '#007bff',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: '700',
                        boxShadow: '0 10px 20px rgba(0, 123, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
