import React from 'react';
import { FaUsers, FaExclamationTriangle, FaComments, FaCheckCircle } from 'react-icons/fa';

const ProctorDashboard = () => {
    const wards = [
        { reg: '211520104015', name: 'Manikandan V', cgpa: 6.2, attendance: 68, risk: 'high', issues: ['Low Attendance', '2 Arrears'] },
        { reg: '211520104016', name: 'Naveen Kumar M', cgpa: 8.4, attendance: 92, risk: 'low', issues: [] },
        { reg: '211520104017', name: 'Oviya S', cgpa: 7.1, attendance: 76, risk: 'medium', issues: ['Declining Math Score'] },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                        <FaUsers style={{ color: 'var(--color-accent-gold)' }} /> Proctor & Mentorship Ward
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--theme-text-muted)' }}>Track the psychological, academic, and disciplinary well-being of assigned students.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {wards.map((ward, i) => (
                    <div key={i}
                        className="p-6 rounded-xl border shadow-sm relative overflow-hidden"
                        style={{
                            background: ward.risk === 'high' ? 'var(--color-error-100)' : ward.risk === 'medium' ? 'var(--color-warning-100)' : 'var(--card-bg)',
                            borderColor: ward.risk === 'high' ? 'var(--color-error)' : ward.risk === 'medium' ? 'var(--color-warning)' : 'var(--theme-border)',
                            borderTop: ward.risk === 'high' ? '4px solid var(--color-error)' : 'none'
                        }}>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{ward.name}</h3>
                                <p className="font-mono text-sm" style={{ color: 'var(--theme-text-muted)' }}>{ward.reg}</p>
                            </div>
                            {ward.risk === 'high' ? (
                                <FaExclamationTriangle style={{ color: 'var(--color-error)', fontSize: '24px' }} />
                            ) : ward.risk === 'medium' ? (
                                <FaExclamationTriangle style={{ color: 'var(--color-warning)', fontSize: '24px' }} />
                            ) : (
                                <FaCheckCircle style={{ color: 'var(--color-success)', fontSize: '24px' }} />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-2 rounded" style={{ background: 'var(--theme-bg-muted)' }}>
                                <div className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--theme-text-muted)' }}>CGPA</div>
                                <div className="text-lg font-black" style={{ color: ward.cgpa < 7 ? 'var(--color-error)' : 'var(--theme-text)' }}>{ward.cgpa}</div>
                            </div>
                            <div className="p-2 rounded" style={{ background: 'var(--theme-bg-muted)' }}>
                                <div className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Attendance</div>
                                <div className="text-lg font-black" style={{ color: ward.attendance < 75 ? 'var(--color-error)' : 'var(--theme-text)' }}>{ward.attendance}%</div>
                            </div>
                        </div>

                        {ward.issues.length > 0 && (
                            <div className="mb-4">
                                <div className="text-xs uppercase font-bold tracking-wider mb-2" style={{ color: 'var(--theme-text-muted)' }}>Flagged Issues</div>
                                <ul className="space-y-1">
                                    {ward.issues.map((issue, idx) => (
                                        <li key={idx} className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-error)' }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-error)' }}></span> {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t flex gap-2" style={{ borderColor: 'var(--theme-border)' }}>
                            <button
                                className="flex-1 py-2 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2"
                                style={{ background: 'var(--color-primary-navy)', color: 'white' }}
                            >
                                <FaComments /> Log Meeting
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProctorDashboard;
