import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const success = await login(email, password);
            if (!success) {
                setError('Invalid credentials. Please check your email and password.');
            }
        } catch (err) {
            setError('An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-split-screen">
            {/* Left Pane - Branding */}
            <div className="login-left-pane">
                <div className="brand-large">
                    <h1>RIT</h1>
                    <p>Digital Twin &<br />Smart Campus Intelligence</p>
                </div>
            </div>

            {/* Right Pane - Login Form */}
            <div className="login-right-pane">
                <div className="login-form-container">
                    <div className="login-header">
                        <h2>Sign In</h2>
                        <p>Access your institutional account</p>
                    </div>

                    {error && (
                        <div className="form-error" style={{ textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email or Username</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g., student@ritchennai.edu.in"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            <div className="forgot-password">
                                <Link to="#">Forgot Password?</Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-login"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <div className="login-options">
                        <Link to="#" className="opt-link">Login via OTP</Link>
                        <Link to="#" className="opt-link">Alumni / Parent Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
