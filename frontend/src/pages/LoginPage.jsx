import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (!success) {
            setError('Invalid credentials. Try admin@ritchennai.edu.in / admin123');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, var(--rit-navy) 0%, #052033 100%)'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--rit-navy)', margin: 0 }}>RIT Digital Twin</h2>
                    <p style={{ color: '#666' }}>Smart Campus Login</p>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            required
                        />
                    </div>
                    <button type="submit" className="rit-primary-btn" style={{ width: '100%' }}>
                        Sign In
                    </button>
                </form>
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8em', color: '#888' }}>
                    Unauthorized access is prohibited.
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
