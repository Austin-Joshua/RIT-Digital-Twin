import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] font-sans">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                {/* Header Strip */}
                <div className="bg-navy-900 h-2 w-full"></div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 bg-navy-900 rounded-md mx-auto mb-4 flex items-center justify-center text-gold-500 font-bold text-2xl shadow-subtle">
                            RIT
                        </div>
                        <h2 className="text-[22px] font-semibold text-navy-900 mb-1">Smart Campus Portal</h2>
                        <p className="text-[14px] text-gray-500">Institutional Governance Login</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm" role="alert">
                            <p className="font-bold">Login Failed</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-700 text-[14px] font-medium mb-1" htmlFor="username">
                                Username / Institutional ID
                            </label>
                            <input
                                className="input-field"
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-[14px] font-medium mb-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="input-field"
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm mt-2">
                            <div className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-navy-900 border-gray-300 rounded focus:ring-navy-900" />
                                <label className="ml-2 text-gray-600">Remember me</label>
                            </div>
                            <a href="#" className="text-secondary-navy hover:underline font-medium">Forgot Password?</a>
                        </div>

                        <button
                            className="w-full btn-primary mt-6"
                            type="submit"
                        >
                            Secure Login
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 py-4 px-8 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        &copy; 2026 Rajalakshmi Institute of Technology. <br />Authorized Personnel Only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
