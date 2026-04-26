import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaHandshake, FaMoneyBillWave, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import api from '../../services/api';

const AlumniPortal = () => {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlumni = async () => {
            try {
                const response = await api.get('/alumni');
                const mappedAlumni = response.data.map(a => ({
                    id: a.id,
                    name: a.name,
                    batch: a.batch,
                    dept: a.department,
                    company: a.company,
                    role: a.designation,
                    location: 'International',
                    contribution: 'Alumni Network'
                }));
                setAlumni(mappedAlumni);
            } catch (error) {
                console.error("Failed to fetch alumni, using mock", error);
                setAlumni([
                    { id: 1, name: 'Sathish Kumar', batch: '2016', dept: 'CSE', company: 'Google', role: 'Software Engineer', location: 'Mountain View, CA', contribution: 'Guest Speaker' },
                    { id: 2, name: 'Priya Raj', batch: '2018', dept: 'ECE', company: 'Intel', role: 'Hardware Architect', location: 'Bangalore, India', contribution: 'Mentor' },
                    { id: 3, name: 'Arun Prakash', batch: '2015', dept: 'Mech', company: 'TVS Motors', role: 'Design Lead', location: 'Chennai, India', contribution: 'Fund Donor' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchAlumni();
    }, []);

    const upcomingEvents = [
        { title: 'Global Alumni Meet 2024', date: 'August 15, 2024', attending: 450 },
        { title: 'Tech Startup Pitch (Alumni Track)', date: 'September 10, 2024', attending: 120 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            {/* Enhanced Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-accent-gold)' }}>
                        <FaUserGraduate /> Alumni Connectivity Portal
                    </h1>
                    <p className="mt-1 font-medium italic" style={{ color: 'var(--theme-text-muted)' }}>Foster lifelong relationships, track career paths, and manage alumni contributions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm" style={{ background: 'var(--card-bg)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}>
                        <FaEnvelope /> Bulk Email
                    </button>
                    <button className="px-4 py-2 font-bold rounded-lg transition-all active:scale-95 shadow-lg hover:opacity-90"
                        style={{ background: 'var(--color-accent-gold)', color: 'var(--theme-brand-strong)' }}>
                        Organize Event
                    </button>
                </div>
            </div>

            {/* Enhanced KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-navy-900 via-blue-900 to-navy-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-white/10 group cursor-default">
                    <FaUserGraduate className="absolute -bottom-4 -right-4 text-9xl opacity-10 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="text-sm font-bold text-gold-400 uppercase tracking-widest mb-2">Registered Alumni</div>
                        <div className="text-5xl font-black mb-1 drop-shadow-md text-white">12,450+</div>
                        <div className="text-sm text-blue-100 font-medium tracking-wide">Across 45 Countries Globally</div>
                    </div>
                </div>

                <div className="rounded-2xl p-6 shadow-xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300" style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }}>
                    <div className="p-5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-3xl shadow-inner group-hover:scale-110 transition-transform">
                        <FaMoneyBillWave className="text-4xl" />
                    </div>
                    <div>
                        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Total Endowment</div>
                        <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm">₹4.2 Cr</div>
                        <div className="text-xs mt-1 font-bold" style={{ color: 'var(--theme-text-muted)' }}>From 840 Verified Donors</div>
                    </div>
                </div>

                <div className="rounded-2xl p-5 shadow-xl hover:translate-y-[-4px] transition-all duration-300" style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }}>
                    <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                        <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></span> Upcoming Drives
                    </h3>
                    <div className="space-y-3">
                        {upcomingEvents.map((ev, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-navy-600" style={{ background: 'var(--theme-bg-muted)' }}>
                                <div>
                                    <div className="font-bold text-sm" style={{ color: 'var(--theme-text)' }}>{ev.title}</div>
                                    <div className="text-[10px] uppercase font-bold mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>{ev.date}</div>
                                </div>
                                <div className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
                                    {ev.attending} RSVPs
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Directory Table */}
            <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }}>
                <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                    <h3 className="font-black uppercase tracking-wider" style={{ color: 'var(--theme-text)' }}>Alumni Directory</h3>
                    <div className="flex gap-2">
                        <select className="px-4 py-2 text-xs font-bold border rounded-xl outline-none focus:ring-2 focus:ring-gold-500 transition-all shadow-sm" style={{ background: 'var(--card-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}>
                            <option value="">All Batches</option>
                            <option value="2016">Class of 2016</option>
                            <option value="2018">Class of 2018</option>
                        </select>
                        <button className="px-4 py-2 text-white text-xs font-black rounded-xl hover:opacity-80 transition-all" style={{ background: 'var(--color-primary-navy)' }}>FILTER</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase font-black tracking-widest border-b" style={{ background: 'var(--card-bg)', color: 'var(--theme-text-muted)', borderColor: 'var(--theme-border)' }}>
                                <th className="p-5">Alumnus Name</th>
                                <th className="p-5">Current Role & Company</th>
                                <th className="p-5">Location</th>
                                <th className="p-5">Key Contribution</th>
                                <th className="p-5 text-center">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {alumni.map(al => (
                                <tr key={al.id} className="border-b transition-colors hover:bg-gray-50/50 dark:hover:bg-navy-900/30" style={{ borderColor: 'var(--theme-border)' }}>
                                    <td className="p-5">
                                        <div className="font-black text-base" style={{ color: 'var(--theme-text)' }}>{al.name}</div>
                                        <div className="text-[10px] font-bold uppercase mt-1 tracking-tighter" style={{ color: 'var(--theme-text-muted)' }}>{al.dept} • {al.batch} BATCH</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-bold" style={{ color: 'var(--theme-text)' }}>{al.role}</div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400 font-black mt-1 uppercase italic tracking-tighter">{al.company}</div>
                                    </td>
                                    <td className="p-5 font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-gold-500" /> {al.location}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-4 py-1.5 text-[9px] uppercase font-black tracking-widest rounded-lg border shadow-sm ${al.contribution.includes('Donor')
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                            : al.contribution.includes('Speaker')
                                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                            }`}>
                                            {al.contribution}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gold-500 hover:bg-navy-900 dark:hover:bg-white transition-all rounded-2xl mx-auto shadow-inner" style={{ background: 'var(--theme-bg-muted)' }}>
                                            <FaEnvelope className="text-lg" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AlumniPortal;
