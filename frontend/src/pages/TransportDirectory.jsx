import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { transportRoutes } from '../data/transportRoutes';
import { LuBus, LuSearch, LuPhone, LuMapPin, LuClock, LuNavigation, LuRoute, LuCircleCheckBig } from 'react-icons/lu';

const TransportPage = () => {
    const [routes, setRoutes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadConnectedRoutes = () => {
            const stored = localStorage.getItem('connectivity_transport_routes');
            if (stored) {
                const simulatedRoutes = JSON.parse(stored);
                const mappedRoutes = simulatedRoutes.map((r, idx) => ({
                    id: `sim-${idx}`,
                    routeNumber: r.routeCode,
                    busNumber: `RIT-${r.routeCode}`,
                    routeName: r.routeName + (r.isEv ? ' (EV Route)' : ''),
                    startPoint: r.origin,
                    endPoint: 'RIT Campus',
                    currentOccupancy: r.students,
                    capacity: Math.round(r.students / (r.occupancyPercent / 100)) || 50,
                    stops: [], // Simulation relies on live rendering, stops omitted for brevity
                    coordinatorName: 'AI Fleet Management',
                }));
                setRoutes(mappedRoutes);
            } else {
                fetchRoutes();
            }
        };

        loadConnectedRoutes();
        window.addEventListener('storage', loadConnectedRoutes);
        return () => window.removeEventListener('storage', loadConnectedRoutes);
    }, []);

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/transport/routes');
            if (res.data && res.data.length > 0) {
                setRoutes(res.data);
            } else {
                setRoutes(transportRoutes);
            }
        } catch { setRoutes(transportRoutes); }
        finally { setLoading(false); }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) { fetchRoutes(); return; }
        setSearching(true);
        try {
            const res = await api.get(`/transport/search?query=${searchQuery}`);
            if (res.data && res.data.length > 0) {
                setRoutes(res.data);
            } else {
                const q = searchQuery.toLowerCase();
                setRoutes(transportRoutes.filter(r => r.routeNumber.toLowerCase().includes(q) || r.routeName.toLowerCase().includes(q) || r.startPoint.toLowerCase().includes(q)));
            }
        } catch {
            const q = searchQuery.toLowerCase();
            setRoutes(transportRoutes.filter(r => r.routeNumber.toLowerCase().includes(q) || r.routeName.toLowerCase().includes(q) || r.startPoint.toLowerCase().includes(q)));
        }
        finally { setSearching(false); }
    };

    const viewRouteDetails = async (route) => {
        setSelectedRoute(route);
        try {
            const res = await api.get(`/transport/routes/${route.id}/stops`);
            if (res.data && res.data.length > 0) {
                setStops(res.data);
            } else {
                setStops(route.stops || []);
            }
        } catch { setStops(route.stops || []); }
    };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--color-primary-navy)', borderRadius: '10px', padding: '10px', color: 'white', fontSize: '20px', display: 'flex' }}>
                        <LuBus />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--theme-text)' }}>RIT Transport Directory</h2>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text-muted)' }}>Official bus routes, boarding points & timings</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: 'var(--color-primary-navy)', color: 'white', fontSize: '13px', fontWeight: '600' }}>
                        <LuPhone style={{ color: '#D4AF37' }} />
                        <div>
                            <div style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Helpline</div>
                            <div>63807 51700 / 75488 62447</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', color: 'var(--theme-text)', fontSize: '13px', fontWeight: '600' }}>
                        <LuBus color="var(--color-primary-navy)" />
                        {routes.length} Active Routes
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 sm:p-5 md:p-6" style={{ background: 'var(--color-primary-navy)', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10 items-stretch sm:items-center">
                    <div className="flex items-center border border-white/20 rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-white/10 flex-1 focus-within:border-[#D4AF37] transition-colors">
                        <LuSearch color="#D4AF37" className="text-xl flex-shrink-0 mr-3" />
                        <input
                            type="text"
                            placeholder="Search Route No (R01) or Area (Ennore)..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-300"
                        />
                    </div>
                    <button type="submit" disabled={searching} className="w-full sm:w-auto px-6 py-3 sm:py-[13px] rounded-lg border-none cursor-pointer text-[var(--color-primary-navy)] font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 flex-shrink-0 whitespace-nowrap" style={{ background: '#D4AF37' }}>
                        {searching ? 'Searching...' : 'Search Route'}
                    </button>
                </form>
            </div>

            {/* Main Grid / Mobile Flow */}
            <div style={{
                display: isMobile ? 'block' : 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
                gap: '20px',
                alignItems: 'start'
            }}>

                {/* Route List - Hidden on mobile if detail is selected */}
                {(!isMobile || !selectedRoute) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: isMobile ? 'none' : '70vh', overflowY: 'auto', paddingRight: '4px' }}>
                        {loading ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>Loading routes...</div>
                        ) : routes.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>No routes found.</div>
                        ) : routes.map(route => (
                            <div
                                key={route.id}
                                onClick={() => viewRouteDetails(route)}
                                style={{
                                    background: selectedRoute?.id === route.id ? 'rgba(11,44,107,0.1)' : 'var(--card-bg)',
                                    border: `1.5px solid ${selectedRoute?.id === route.id ? 'var(--color-primary-navy)' : 'var(--theme-border)'}`,
                                    borderLeft: `5px solid ${selectedRoute?.id === route.id ? 'var(--color-primary-navy)' : '#D4AF37'}`,
                                    borderRadius: '10px',
                                    padding: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    transform: selectedRoute?.id === route.id ? 'translateX(2px)' : 'none',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', color: 'var(--color-primary-navy)' }}>{route.routeNumber}</span>
                                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: 'var(--color-primary-navy)', color: 'white', letterSpacing: '0.5px' }}>{route.busNumber}</span>
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--theme-text)', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{route.routeName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                                    <LuMapPin style={{ flexShrink: 0 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route.startPoint} → {route.endPoint}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Route Detail Panel */}
                <AnimatePresence mode="wait">
                    {selectedRoute ? (
                        <motion.div key={selectedRoute.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Back Button for Mobile */}
                            {isMobile && (
                                <button
                                    onClick={() => setSelectedRoute(null)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                                        background: 'var(--color-primary-navy)', border: 'none',
                                        borderRadius: '8px', color: 'white', fontWeight: '600', width: 'fit-content',
                                        cursor: 'pointer', marginBottom: '8px', fontSize: '14px'
                                    }}
                                >
                                    <LuNavigation style={{ transform: 'rotate(-90deg)' }} /> Back to Route List
                                </button>
                            )}

                            {/* Route Header Card */}
                            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '14px', borderTop: '4px solid var(--color-primary-navy)', padding: '20px 24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', fontStyle: 'italic', color: 'var(--color-primary-navy)' }}>{selectedRoute.routeNumber} — {selectedRoute.routeName}</h2>
                                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--theme-text-muted)' }}>{selectedRoute.startPoint} → RIT Campus</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Capacity</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--theme-text)' }}>{selectedRoute.currentOccupancy || 'N/A'} / {selectedRoute.capacity || 'N/A'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        { icon: <LuPhone />, label: 'Coordinator', value: selectedRoute.coordinatorName || 'To be Assigned', sub: selectedRoute.coordinatorPhone || '' },
                                        { icon: <LuBus />, label: 'Bus Details', value: selectedRoute.busNumber, sub: 'Compliant with University Standards' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(11,44,107,0.05)', borderRadius: '10px', border: '1px solid var(--theme-border)' }}>
                                            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--color-primary-navy)', fontSize: '16px', display: 'flex', flexShrink: 0 }}>{item.icon}</div>
                                            <div>
                                                <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--theme-text-muted)', letterSpacing: '0.5px' }}>{item.label}</div>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--theme-text)' }}>{item.value}</div>
                                                {item.sub && <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>{item.sub}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stops Timeline */}
                            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '14px', padding: '20px 24px' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '700', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <LuClock color="var(--color-primary-navy)" /> Boarding Points & Timings
                                </h3>

                                <div style={{ position: 'relative', paddingLeft: '32px', borderLeft: '2px solid var(--theme-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {stops.length > 0 ? stops.map((stop, idx) => (
                                        <div key={stop.id} style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--card-bg)', border: '3px solid var(--color-primary-navy)' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--theme-border)', transition: 'background 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(11,44,107,0.05)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--theme-text)' }}>{stop.stopName}</div>
                                                    {stop.landmark && <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', fontStyle: 'italic' }}>{stop.landmark}</div>}
                                                </div>
                                                <div style={{ padding: '5px 12px', borderRadius: '8px', background: 'var(--color-primary-navy)', color: 'white', fontSize: '13px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', flexShrink: 0 }}>
                                                    {stop.pickupTime ? stop.pickupTime.substring(0, 5) : '--:--'} AM
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ fontSize: '14px', color: 'var(--theme-text-muted)', padding: '12px 0' }}>No boarding points recorded yet.</div>
                                    )}

                                    {/* Destination */}
                                    <div style={{ position: 'relative', paddingTop: '8px', borderTop: '1px dashed var(--theme-border)' }}>
                                        <div style={{ position: 'absolute', left: '-42px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
                                            <LuCircleCheckBig />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: '900', fontSize: '15px', textTransform: 'uppercase', color: 'var(--theme-text)', letterSpacing: '0.5px' }}>🏫 RIT Campus</div>
                                            <div style={{ fontWeight: '700', color: 'var(--color-primary-navy)', borderBottom: '2px solid var(--color-primary-navy)', fontSize: '13px' }}>Reach On-Time</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden' }}>
                                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--theme-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <LuNavigation color="var(--color-primary-navy)" />
                                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--theme-text)' }}>Route Map</span>
                                </div>
                                <iframe
                                    width="100%" height="280" frameBorder="0" style={{ border: 0, display: 'block' }}
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedRoute.startPoint + ' to Rajalakshmi Institute of Technology, Chennai')}&t=&z=11&ie=UTF8&iwloc=&output=embed`}
                                    allowFullScreen title={`${selectedRoute.routeName} Map`}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', background: 'var(--card-bg)', border: '1.5px dashed var(--theme-border)', borderRadius: '14px', gap: '12px', color: 'var(--theme-text-muted)' }}>
                            <LuRoute style={{ fontSize: '48px', opacity: 0.3 }} />
                            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--theme-text)' }}>Select a Route</div>
                            <div style={{ fontSize: '13px' }}>Click any route from the left panel to view its timetable and boarding points.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TransportPage;
