import React, { useState } from 'react';
import { useToast } from '../../hooks/ToastContext';
import { FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaCheckCircle, FaRegStar, FaInfoCircle } from 'react-icons/fa';

const EventsClubs = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('events');

    const events = [
        { id: 1, title: 'RIT Ideathon 2024', date: 'March 15, 2024', time: '09:00 AM', location: 'Main Auditorium', category: 'Hackathon', registered: true, seats: 12 },
        { id: 2, title: 'Guest Lecture: ML in Finance', date: 'March 18, 2024', time: '01:30 PM', location: 'Seminar Hall 1', category: 'Academic', registered: false, seats: 45 },
        { id: 3, title: 'Cultural Fest - Ignite', date: 'April 5, 2024', time: '05:00 PM', location: 'Open Ground', category: 'Cultural', registered: false, seats: 500 },
    ];

    const clubs = [
        { id: 101, name: 'Coding Club', icon: '💻', members: 120, description: 'Competitive programming and open-source contributions.', joined: true },
        { id: 102, name: 'Google Developer Student Club', icon: '🚀', members: 340, description: 'Learn, build, and scale with Google technologies.', joined: false },
        { id: 103, name: 'Robotics Society', icon: '🤖', members: 85, description: 'Building autonomous robots and IoT devices.', joined: true },
        { id: 104, name: 'Photography Club', icon: '📸', members: 150, description: 'Capturing campus moments and learning composition.', joined: false },
        { id: 105, name: 'STEAM Club', icon: '🎨', members: 110, description: 'Interdisciplinary innovation in science, tech, arts, and maths.', joined: false },
        { id: 106, name: 'Techsparks Club', icon: '⚡', members: 95, description: 'Student-led tech events, hackathons, and peer mentoring.', joined: true },
    ];

    const centers = [
        { id: 201, name: 'Apple Centre of Excellence', icon: '🍏', members: 60, description: 'Advanced iOS app development, Swift/SwiftUI engineering, and Apple ecosystem research.', joined: true },
        { id: 202, name: 'VR & AR Centre of Excellence', icon: '🥽', members: 45, description: 'Virtual Reality, Augmented Reality, 3D spatial computing, and immersive simulation labs.', joined: false },
        { id: 203, name: 'Cyber Security & Digital Forensics Centre', icon: '🛡️', members: 75, description: 'Network defense, ethical hacking, cryptography, vulnerability assessment, and digital forensics.', joined: false },
        { id: 204, name: 'AI & Robotics Centre of Excellence', icon: '🤖', members: 90, description: 'Artificial intelligence, computer vision, autonomous robotics, and machine learning solutions.', joined: true },
        { id: 205, name: 'IoT & Smart Systems Centre', icon: '📡', members: 65, description: 'Internet of Things, embedded hardware design, smart sensor networks, and edge computing.', joined: false },
        { id: 206, name: 'Electric Vehicle & Green Tech Centre', icon: '⚡', members: 50, description: 'EV powertrain engineering, battery management systems, and sustainable green tech research.', joined: false },
    ];

    const toggleRegistration = (title) => {
        addToast(`Registration updated for ${title}`, 'success');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaRegStar className="text-gold-500" /> Campus Events, Clubs & Centers of Excellence
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Discover opportunities, research centers, join communities, and RSVP to events</p>
                </div>
            </div>

            <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'events' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                    >
                        <FaCalendarAlt /> Upcoming Events
                    </button>
                    <button
                        onClick={() => setActiveTab('clubs')}
                        className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'clubs' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                    >
                        <FaUsers /> Student Clubs
                    </button>
                    <button
                        onClick={() => setActiveTab('centers')}
                        className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'centers' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                    >
                        <FaRegStar /> Centers of Excellence
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'events' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map(event => (
                                <div key={event.id} className="border border-gray-100 dark:border-navy-700 rounded-xl p-5 hover:shadow-md transition-all bg-gray-50/50 dark:bg-navy-900/30 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md">
                                            {event.category}
                                        </span>
                                        {event.registered && <FaCheckCircle className="text-green-500 text-lg" title="RSVP Confirmed" />}
                                    </div>
                                    <h3 className="font-bold text-navy-900 dark:text-white mb-2 text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-gold-500 transition-colors">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <FaCalendarAlt className="text-gray-400" />
                                            <span>{event.date} • {event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <FaMapMarkerAlt className="text-gray-400" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-gray-200 dark:border-navy-700 pt-4">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            <strong className="text-navy-900 dark:text-white">{event.seats}</strong> seats left
                                        </span>
                                        <button
                                            onClick={() => toggleRegistration(event.title)}
                                            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${event.registered ? 'bg-gray-200 text-gray-600 dark:bg-navy-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400' : 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 hover:bg-navy-800 dark:hover:bg-gold-600'}`}
                                        >
                                            {event.registered ? 'Cancel RSVP' : 'Register Now'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'clubs' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {clubs.map(club => (
                                <div key={club.id} className="flex flex-col sm:flex-row gap-5 border border-gray-100 dark:border-navy-700 rounded-xl p-5 hover:shadow-md transition-all bg-gray-50/50 dark:bg-navy-900/30">
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-navy-700 flex items-center justify-center text-3xl shrink-0">
                                        {club.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-navy-900 dark:text-white text-lg">{club.name}</h3>
                                            {club.joined ? (
                                                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-200 dark:border-green-800">Member</span>
                                            ) : null}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{club.description}</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                <FaUsers /> {club.members} active members
                                            </span>
                                            {!club.joined && (
                                                <button
                                                    onClick={() => addToast(`Request sent to join ${club.name}`, 'success')}
                                                    className="text-xs font-bold text-blue-600 dark:text-gold-500 hover:underline"
                                                >
                                                    Request to Join
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'centers' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {centers.map(center => (
                                <div key={center.id} className="flex flex-col sm:flex-row gap-5 border border-amber-200/60 dark:border-gold-500/30 rounded-xl p-5 hover:shadow-md transition-all bg-amber-50/30 dark:bg-navy-900/40">
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-navy-800 shadow-sm border border-gold-300 dark:border-gold-500/40 flex items-center justify-center text-3xl shrink-0">
                                        {center.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-navy-900 dark:text-white text-lg">{center.name}</h3>
                                            {center.joined ? (
                                                <span className="text-xs font-bold text-amber-700 dark:text-gold-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded border border-amber-300 dark:border-gold-500/40">Enrolled</span>
                                            ) : null}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{center.description}</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                <FaUsers /> {center.members} researchers & students
                                            </span>
                                            {!center.joined && (
                                                <button
                                                    onClick={() => addToast(`Application submitted for ${center.name}`, 'success')}
                                                    className="text-xs font-bold text-amber-700 dark:text-gold-500 hover:underline"
                                                >
                                                    Apply to Join Center
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Policy Note */}
            <div className="bg-blue-50 dark:bg-navy-900/40 p-4 rounded-xl text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-navy-800 flex gap-3">
                <FaInfoCircle className="text-lg shrink-0" />
                <p>Registering for an event automatically marks you as &apos;On Duty&apos; (OD) for the respective hours if it conflicts with scheduled academic classes, pending HOD approval.</p>
            </div>
        </div>
    );
};

export default EventsClubs;
