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
                <h1 className="page-header !mb-0">Official RIT Transport Directory</h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 shadow-sm font-semibold">
                        <FaPhoneAlt className="animate-pulse" />
                        <div>
                            <span className="text-xs uppercase tracking-wider block opacity-70">Helpline</span>
                            <span>63807 51700 / 75488 62447</span>
                        </div>
                    </div>
                    <div className="flex gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm font-semibold h-full items-center">
                        <FaBus className="text-navy-900" /> {routes.length} Active Routes
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card bg-navy-900 border-none shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 p-6">
                    <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <FaSearch className="text-gold-500" /> Find Your Route
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
                            className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-8 py-3 rounded-lg font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Route List */}
                <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 font-medium">Loading Routes...</div>
                    ) : routes.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 font-medium">No routes found matching your query.</div>
                    ) : (
                        routes.map((route) => (
                            <div
                                key={route.id}
                                onClick={() => viewRouteDetails(route)}
                                className={`card cursor-pointer transition-all border-l-4 hover:shadow-md ${selectedRoute?.id === route.id ? 'border-navy-900 bg-blue-50/50 scale-[1.02]' : 'border-gold-500 bg-white'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-navy-900 font-black text-xl italic">{route.routeNumber}</div>
                                        <div className="text-gray-700 font-bold mt-1 line-clamp-1">{route.routeName}</div>
                                    </div>
                                    <div className="text-xs font-bold text-navy-900/60 uppercase tracking-widest">{route.busNumber}</div>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                    <FaMapMarkerAlt className="text-navy-900/40" />
                                    <span>{route.startPoint} <span className="mx-1">→</span> {route.endPoint}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Route Details / Timings */}
                <div className="lg:col-span-2">
                    {selectedRoute ? (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="card border-t-8 border-navy-900">
                                <div className="flex justify-between items-end border-b border-gray-100 pb-4 mb-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-navy-900 italic tracking-tighter">{selectedRoute.routeNumber} Detailed Schedule</h2>
                                        <p className="text-gray-600 font-medium">{selectedRoute.routeName}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-400 uppercase">Capacity</div>
                                        <div className="text-lg font-bold text-navy-900">{selectedRoute.currentOccupancy} / {selectedRoute.capacity}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white rounded-lg text-navy-900 shadow-sm"><FaPhoneAlt /></div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coordinator</div>
                                            <div className="text-sm font-bold text-navy-900">{selectedRoute.coordinatorName || 'To be Assigned'}</div>
                                            <div className="text-sm text-blue-600 font-medium">{selectedRoute.coordinatorPhone || '--'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white rounded-lg text-navy-900 shadow-sm"><FaBus /></div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bus Details</div>
                                            <div className="text-sm font-bold text-navy-900">{selectedRoute.busNumber}</div>
                                            <div className="text-[10px] text-gray-500 font-medium italic">Compliant with University Standards</div>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="section-header !text-[16px] mb-4 flex items-center gap-2">
                                    <FaClock className="text-navy-900" /> Boarding Points & Timings
                                </h3>

                                <div className="relative pl-8 border-l-2 border-navy-900/10 space-y-6 ml-2 pt-2">
                                    {stops.length > 0 ? stops.map((stop, idx) => (
                                        <div key={stop.id} className="relative group">
                                            <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-navy-900 z-10 group-hover:scale-125 transition-all"></div>
                                            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                                <div>
                                                    <div className="font-bold text-navy-900">{stop.stopName}</div>
                                                    {stop.landmark && <div className="text-[10px] text-gray-500 font-medium italic">{stop.landmark}</div>}
                                                </div>
                                                <div className="bg-navy-900 text-white px-3 py-1 rounded text-sm font-black italic tracking-widest">
                                                    {stop.pickupTime ? stop.pickupTime.substring(0, 5) : '--:--'} AM
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-gray-400 font-medium italic py-4">No specific boarding points recorded for this route yet.</div>
                                    )}

                                    {/* Final Stop */}
                                    <div className="relative group pt-4 border-t border-gray-100 border-dashed">
                                        <div className="absolute -left-[41px] top-[18px] w-6 h-6 rounded-full bg-navy-900 flex items-center justify-center text-white z-10">
                                            <FaCheckCircle className="text-[10px]" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="font-black text-navy-900 tracking-tight uppercase">RIT Campus</div>
                                            <div className="text-navy-900 font-bold border-b-2 border-navy-900">Reach On-Time</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center card border-dashed border-2 border-gray-200 opacity-60">
                            <div className="p-6 bg-gray-50 rounded-full mb-4 text-gray-300 text-4xl">
                                <FaRoute />
                            </div>
                            <h3 className="text-gray-500 font-bold text-lg">Select a route to view its timetable</h3>
                            <p className="text-gray-400 text-sm">Click any route from the left panel to see its boarding points.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransportPage;
