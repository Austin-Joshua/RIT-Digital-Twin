import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaBus, FaRoute, FaCheckCircle, FaSearch, FaPhoneAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const TransportPage = () => {
    const [routes, setRoutes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/transport/routes');
            setRoutes(response.data);
        } catch (error) {
            console.error("Error fetching routes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchRoutes();
            return;
        }
        setSearching(true);
        try {
            const response = await api.get(`/transport/search?query=${searchQuery}`);
            setRoutes(response.data);
        } catch (error) {
            console.error("Error searching routes:", error);
        } finally {
            setSearching(false);
        }
    };

    const viewRouteDetails = async (route) => {
        setSelectedRoute(route);
        try {
            const response = await api.get(`/transport/routes/${route.id}/stops`);
            setStops(response.data);
        } catch (error) {
            console.error("Error fetching stops:", error);
            setStops([]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="stu-welcome h2 !mb-0" style={{ fontSize: '24px' }}>Official RIT Transport Directory</h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg font-black italic tracking-tight" style={{ background: 'var(--color-primary-navy)', color: 'white' }}>
                        <FaPhoneAlt className="animate-pulse" style={{ color: 'var(--color-accent-gold)' }} />
                        <div>
                            <span className="text-[10px] uppercase tracking-widest block opacity-70">Helpline</span>
                            <span>63807 51700 / 75488 62447</span>
                        </div>
                    </div>
                    <div className="flex gap-2 text-sm px-4 py-2 rounded-lg border shadow-sm font-semibold h-full items-center" style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}>
                        <FaBus style={{ color: 'var(--color-primary-navy)' }} /> {routes.length} Active Routes
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card border-none shadow-xl overflow-hidden relative" style={{ background: 'var(--color-primary-navy)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 p-6">
                    <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <FaSearch style={{ color: 'var(--color-accent-gold)' }} /> Find Your Route
                    </h3>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <input
                            type="text"
                            className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all font-medium"
                            placeholder="Search by Route No (e.g. R01) or Area (e.g. Ennore)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={searching}
                            className="px-8 py-3 rounded-lg font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            style={{ background: 'var(--color-accent-gold)', color: 'var(--color-primary-navy)' }}
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Route List */}
                <div className="lg:col-span-1 space-y-4 max-h-[40vh] lg:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 font-medium">Loading Routes...</div>
                    ) : routes.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 font-medium">No routes found matching your query.</div>
                    ) : (
                        routes.map((route) => (
                            <div
                                key={route.id}
                                onClick={() => viewRouteDetails(route)}
                                className="card cursor-pointer transition-all border-l-8 hover:shadow-2xl"
                                style={{
                                    background: selectedRoute?.id === route.id ? 'var(--color-primary-100)' : 'var(--card-bg)',
                                    borderColor: selectedRoute?.id === route.id ? 'var(--color-primary-navy)' : 'var(--color-accent-gold)',
                                    transform: selectedRoute?.id === route.id ? 'scale(1.02)' : 'none',
                                    color: 'var(--theme-text)'
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-black text-2xl italic" style={{ color: 'var(--color-primary-navy)' }}>{route.routeNumber}</div>
                                        <div className="font-bold mt-1 line-clamp-1" style={{ color: 'var(--theme-text)' }}>{route.routeName}</div>
                                    </div>
                                    <div className="text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase" style={{ background: 'var(--color-primary-navy)', color: 'white' }}>{route.busNumber}</div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                    <FaMapMarkerAlt className="text-navy-900/40 dark:text-gold-500/50" />
                                    <span>{route.startPoint} <span className="mx-1 text-gold-500">→</span> {route.endPoint}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Route Details / Timings */}
                <div className="lg:col-span-2">
                    {selectedRoute ? (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="card bg-white" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)', borderTop: '8px solid var(--color-primary-navy)' }}>
                                <div className="flex justify-between items-end border-b pb-4 mb-4" style={{ borderColor: 'var(--theme-border)' }}>
                                    <div>
                                        <h2 className="text-2xl font-black italic tracking-tighter" style={{ color: 'var(--color-primary-navy)' }}>{selectedRoute.routeNumber} Detailed Schedule</h2>
                                        <p style={{ color: 'var(--theme-text-muted)', fontWeight: 500 }}>{selectedRoute.routeName}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Capacity</div>
                                        <div className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>{selectedRoute.currentOccupancy} / {selectedRoute.capacity}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border mb-6" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg shadow-sm" style={{ background: 'var(--card-bg)', color: 'var(--color-primary-navy)' }}><FaPhoneAlt /></div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Coordinator</div>
                                            <div className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{selectedRoute.coordinatorName || 'To be Assigned'}</div>
                                            <div className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>{selectedRoute.coordinatorPhone || '--'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-lg shadow-sm" style={{ background: 'var(--card-bg)', color: 'var(--color-primary-navy)' }}><FaBus /></div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Bus Details</div>
                                            <div className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{selectedRoute.busNumber}</div>
                                            <div className="text-[10px] font-medium italic" style={{ color: 'var(--theme-text-muted)' }}>Compliant with University Standards</div>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="section-header !text-[16px] mb-4 flex items-center gap-2 dark:text-white">
                                    <FaClock className="text-navy-900 dark:text-gold-500" /> Boarding Points & Timings
                                </h3>

                                <div className="relative pl-8 space-y-6 ml-2 pt-2" style={{ borderLeft: '2px solid var(--theme-border)' }}>
                                    {stops.length > 0 ? stops.map((stop, _idx) => (
                                        <div key={stop.id} className="relative group">
                                            <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 z-10 group-hover:scale-125 transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--color-primary-navy)' }}></div>
                                            <div className="flex justify-between items-center p-3 rounded-lg transition-all border border-transparent hover:bg-[var(--theme-bg-muted)] hover:border-[var(--theme-border)]">
                                                <div>
                                                    <div className="font-bold" style={{ color: 'var(--theme-text)' }}>{stop.stopName}</div>
                                                    {stop.landmark && <div className="text-[10px] font-medium italic" style={{ color: 'var(--theme-text-muted)' }}>{stop.landmark}</div>}
                                                </div>
                                                <div className="px-3 py-1 rounded text-sm font-black italic tracking-widest" style={{ background: 'var(--color-primary-navy)', color: 'white' }}>
                                                    {stop.pickupTime ? stop.pickupTime.substring(0, 5) : '--:--'} AM
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="font-medium italic py-4" style={{ color: 'var(--theme-text-muted)' }}>No specific boarding points recorded for this route yet.</div>
                                    )}

                                    {/* Final Stop */}
                                    <div className="relative group pt-4 border-t border-dashed" style={{ borderColor: 'var(--theme-border)' }}>
                                        <div className="absolute -left-[41px] top-[18px] w-6 h-6 rounded-full flex items-center justify-center text-white z-10" style={{ background: 'var(--color-primary-navy)' }}>
                                            <FaCheckCircle className="text-[10px]" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="font-black tracking-tight uppercase" style={{ color: 'var(--theme-text)' }}>RIT Campus</div>
                                            <div className="font-bold border-b-2" style={{ color: 'var(--color-primary-navy)', borderColor: 'var(--color-primary-navy)' }}>Reach On-Time</div>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="section-header !text-[16px] mb-4 flex items-center gap-2 mt-8" style={{ color: 'var(--theme-text)' }}>
                                    <FaMapMarkerAlt style={{ color: 'var(--color-primary-navy)' }} /> Interactive Route Map
                                </h3>
                                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-navy-700 h-[300px] w-full">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0, filter: 'contrast(1.1) saturate(1.1)' }}
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedRoute.startPoint + ' to Rajalakshmi Institute of Technology, Chennai')}&t=&z=11&ie=UTF8&iwloc=&output=embed`}
                                        allowFullScreen
                                        title={`${selectedRoute.routeName} Map`}
                                        className="dark:invert dark:hue-rotate-180" // simple trick for dark mode google maps
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center card border-dashed border-2 opacity-60" style={{ borderColor: 'var(--theme-border)' }}>
                            <div className="p-6 rounded-full mb-4 text-4xl" style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text-muted)' }}>
                                <FaRoute />
                            </div>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>Select a route to view its timetable</h3>
                            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Click any route from the left panel to see its boarding points.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransportPage;
