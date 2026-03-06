import React, { useState } from 'react';
import { FaUsers, FaExclamationTriangle, FaComments, FaCheckCircle, FaFileAlt, FaChartLine } from 'react-icons/fa';
import DetailModal from '../../components/common/DetailModal';

const ProctorDashboard = () => {
    const [selectedWard, setSelectedWard] = useState(null);

    const wards = [
        { reg: '211520104015', name: 'Manikandan V', cgpa: 6.2, attendance: 68, risk: 'high', issues: ['Low Attendance', '2 Arrears'], phone: '+91 9876543210', email: 'manikandan.v@ritchennai.edu.in', dept: 'B.E. CSE', year: 'III Year' },
        { reg: '211520104016', name: 'Naveen Kumar M', cgpa: 8.4, attendance: 92, risk: 'low', issues: [], phone: '+91 9876543211', email: 'naveen.m@ritchennai.edu.in', dept: 'B.E. CSE', year: 'III Year' },
        { reg: '211520104017', name: 'Oviya S', cgpa: 7.1, attendance: 76, risk: 'medium', issues: ['Declining Math Score'], phone: '+91 9876543212', email: 'oviya.s@ritchennai.edu.in', dept: 'B.E. CSE', year: 'III Year' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6 overflow-hidden">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                        <FaUsers style={{ color: 'var(--color-accent-gold)' }} /> Proctor & Mentorship Ward
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--theme-text-muted)' }}>Track the psychological, academic, and disciplinary well-being of assigned students.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wards.map((ward, i) => (
                    <div key={i}
                        className="p-6 rounded-xl border shadow-sm relative transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between"
                        style={{
                            background: ward.risk === 'high' ? 'var(--color-error-100)' : ward.risk === 'medium' ? 'var(--color-warning-100)' : 'var(--card-bg)',
                            borderColor: ward.risk === 'high' ? 'var(--color-error)' : ward.risk === 'medium' ? 'var(--color-warning)' : 'var(--theme-border)',
                            borderTop: ward.risk === 'high' ? '4px solid var(--color-error)' : 'none'
                        }}
                        onClick={() => setSelectedWard(ward)}>

                        <div>
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
                                <div className="p-2 rounded flex flex-col items-center justify-center" style={{ background: 'var(--theme-bg-muted)' }}>
                                    <div className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--theme-text-muted)' }}>CGPA</div>
                                    <div className="text-xl font-black" style={{ color: ward.cgpa < 7 ? 'var(--color-error)' : 'var(--theme-text)' }}>{ward.cgpa}</div>
                                </div>
                                <div className="p-2 rounded flex flex-col items-center justify-center" style={{ background: 'var(--theme-bg-muted)' }}>
                                    <div className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--theme-text-muted)' }}>Attendance</div>
                                    <div className="text-xl font-black" style={{ color: ward.attendance < 75 ? 'var(--color-error)' : 'var(--theme-text)' }}>{ward.attendance}%</div>
                                </div>
                            </div>

                            {ward.issues.length > 0 && (
                                <div className="mb-4 flex-1">
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
                        </div>

                        <div className="mt-4 pt-4 border-t flex gap-2" style={{ borderColor: 'var(--theme-border)' }}>
                            <button
                                className="flex-1 py-2 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 hover:opacity-90"
                                style={{ background: 'var(--color-primary-navy)', color: 'white' }}
                                onClick={(e) => { e.stopPropagation(); /* Log meeting logic */ }}
                            >
                                <FaComments /> Log Meeting
                            </button>
                            <button
                                className="flex-1 py-2 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 hover:opacity-90"
                                style={{ background: 'var(--color-accent-gold)', color: 'white' }}
                                onClick={(e) => { e.stopPropagation(); setSelectedWard(ward); }}
                            >
                                <FaFileAlt /> View Report
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <DetailModal
                isOpen={!!selectedWard}
                onClose={() => setSelectedWard(null)}
                title={<div className="flex items-center gap-2"><FaChartLine /> Student Detailed Report</div>}
            >
                {selectedWard && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl" style={{ background: 'var(--theme-bg-muted)' }}>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-500">Name</p>
                                <p className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{selectedWard.name}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-500">Register No</p>
                                <p className="font-bold text-lg font-mono" style={{ color: 'var(--theme-text)' }}>{selectedWard.reg}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-500">Department</p>
                                <p className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{selectedWard.dept}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-500">Year</p>
                                <p className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{selectedWard.year}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border rounded-xl p-4" style={{ borderColor: 'var(--theme-border)', background: 'var(--card-bg)' }}>
                                <h3 className="font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>Academic Performance</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold" style={{ color: 'var(--theme-text-muted)' }}>Current CGPA</span>
                                        <span className={`text-lg font-black ${selectedWard.cgpa < 7 ? 'text-red-500' : 'text-green-500'}`}>{selectedWard.cgpa}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full ${selectedWard.cgpa < 7 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(selectedWard.cgpa / 10) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-xl p-4" style={{ borderColor: 'var(--theme-border)', background: 'var(--card-bg)' }}>
                                <h3 className="font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>Attendance Overview</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold" style={{ color: 'var(--theme-text-muted)' }}>Overall Attendance</span>
                                        <span className={`text-lg font-black ${selectedWard.attendance < 75 ? 'text-red-500' : 'text-green-500'}`}>{selectedWard.attendance}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full ${selectedWard.attendance < 75 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${selectedWard.attendance}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedWard.issues.length > 0 && (
                            <div className="border rounded-xl p-4" style={{ borderColor: 'var(--theme-border)', background: 'var(--color-error-100)' }}>
                                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-error)' }}><FaExclamationTriangle /> Flagged Concerns</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    {selectedWard.issues.map((issue, idx) => (
                                        <li key={idx} className="font-medium" style={{ color: 'var(--theme-text)' }}>{issue}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="border rounded-xl p-4" style={{ borderColor: 'var(--theme-border)', background: 'var(--card-bg)' }}>
                            <h3 className="font-bold mb-3 border-b pb-2" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>Contact Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <p><span className="font-bold uppercase text-xs" style={{ color: 'var(--theme-text-muted)' }}>Email:</span> <br /> <span style={{ color: 'var(--theme-text)' }}>{selectedWard.email}</span></p>
                                <p><span className="font-bold uppercase text-xs" style={{ color: 'var(--theme-text-muted)' }}>Phone:</span> <br /> <span style={{ color: 'var(--theme-text)' }}>{selectedWard.phone}</span></p>
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>
        </div>
    );
};

export default ProctorDashboard;
