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
                // Map the backend entity to UI expected fields
                const mappedAlumni = response.data.map(a => ({
                    id: a.id,
                    name: a.name,
                    batch: a.batch,
                    dept: a.department,
                    company: a.company,
                    role: a.designation,
                    location: 'International', // default
                    contribution: 'Alumni Network' // default
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaUserGraduate className="text-gold-500" /> Alumni Connectivity Portal
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Foster lifelong relationships, track career paths, and manage alumni contributions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white text-navy-900 dark:bg-navy-800 dark:text-white border border-gray-200 dark:border-navy-600 px-4 py-2 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors flex items-center gap-2">
                        <FaEnvelope /> Bulk Email
                    </button>
                    <button className="bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 px-4 py-2 font-bold rounded-lg hover:bg-navy-800 transition-colors">
                        Organize Event
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-navy-900 to-blue-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                    <FaUserGraduate className="absolute -bottom-4 -right-4 text-8xl opacity-10" />
                    <div className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Registered Alumni</div>
                    <div className="text-4xl font-black mb-1">12,450+</div>
                    <div className="text-sm text-blue-100">Across 45 Countries</div>
                </div>
                <div className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl p-6 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl">
                        <FaMoneyBillWave className="text-3xl" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Endowment</div>
                        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹4.2 Cr</div>
                        <div className="text-xs text-gray-400 mt-1">From 840 Donors</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-navy-900 dark:text-white mb-3">Upcoming Drives</h3>
                    <div className="space-y-3">
                        {upcomingEvents.map((ev, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-navy-900/50">
                                <div>
                                    <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{ev.title}</div>
                                    <div className="text-xs text-gray-500">{ev.date}</div>
                                </div>
                                <div className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                    {ev.attending} RSVPs
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-navy-900 dark:text-white">Alumni Directory</h3>
                    <div className="flex gap-2">
                        <select className="px-3 py-1.5 text-sm border border-gray-200 dark:border-navy-600 rounded bg-white dark:bg-navy-900 text-gray-800 dark:text-white outline-none">
                            <option value="">All Batches</option>
                            <option value="2016">Class of 2016</option>
                            <option value="2018">Class of 2018</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white dark:bg-navy-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-navy-700">
                                <th className="p-4 font-bold">Alumnus Name</th>
                                <th className="p-4 font-bold">Current Role & Company</th>
                                <th className="p-4 font-bold">Location</th>
                                <th className="p-4 font-bold">Key Contribution</th>
                                <th className="p-4 font-bold text-center">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {alumni.map(al => (
                                <tr key={al.id} className="border-b border-gray-50 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-900/30">
                                    <td className="p-4">
                                        <div className="font-bold text-navy-900 dark:text-white">{al.name}</div>
                                        <div className="text-xs text-gray-400 font-medium mt-0.5">{al.dept} • {al.batch}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{al.role}</div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">{al.company}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <FaMapMarkerAlt className="text-gray-400" /> {al.location}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${al.contribution.includes('Donor')
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                            : al.contribution.includes('Speaker')
                                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                            }`}>
                                            {al.contribution}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <FaEnvelope className="text-lg mx-auto" />
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
