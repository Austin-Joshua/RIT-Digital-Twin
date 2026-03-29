import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useToast } from '../../hooks/ToastContext';
import api from '../../services/api';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { addToast } = useToast();

    const handleSave = async () => {
        if (!newPassword || !confirmPassword) {
            addToast('Please fill in both fields', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }

        try {
            // Making API request
            const _response = await api.post('/auth/change-password', { newPassword });
            addToast('Password successfully changed!', 'success');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Change password error:", error);
            const errorMsg = error.response?.data?.message || 'Your password could not be updated at this time. Please try again later.';
            addToast(errorMsg, 'error');
        }
    };

    return (
        <div className="stu-report-page">
            <div className="stu-info-card" style={{ maxWidth: '500px', margin: '20px 0', background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                <div style={{ padding: '12px 15px', borderBottom: '1px solid var(--theme-border)', fontSize: '14px', color: 'var(--theme-text)', fontWeight: 'bold' }}>
                    Change Password
                </div>
                <form autoComplete="off" style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--theme-text)' }}>
                            New Password <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                                style={{ width: '100%', height: '38px', padding: '6px 40px 6px 12px', border: '1px solid var(--theme-border)', borderRadius: '4px', outline: 'none', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)' }}
                                placeholder="Enter new password"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--theme-text-muted)', fontSize: '16px' }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--theme-text)' }}>
                            Repeat New Password <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                                style={{ width: '100%', height: '38px', padding: '6px 40px 6px 12px', border: '1px solid var(--theme-border)', borderRadius: '4px', outline: 'none', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)' }}
                                placeholder="Repeat new password"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--theme-text-muted)', fontSize: '16px' }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.preventDefault(); handleSave(); }}
                        className="px-6 py-2 rounded-lg font-bold text-white transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
                        style={{ background: 'var(--color-primary-navy)', boxShadow: '0 4px 15px rgba(11, 44, 107, 0.3)' }}
                    >
                        Save Password
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '30px', color: 'var(--theme-text-muted)', fontSize: '12px' }}>
                © All rights reserved.
                <span style={{ float: 'right' }}><img src="/assets/images/rit-icon.png" alt="RIT-IMS" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> RIT-IMS</span>
            </div>
        </div>
    );
};

export default ChangePassword;
