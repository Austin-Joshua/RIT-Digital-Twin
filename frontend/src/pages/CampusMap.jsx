import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const buildingIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
});

// RIT Chennai – Rajalakshmi Institute of Technology (from Google Maps)
const RIT_CENTER = [13.0382427, 80.0453935];

const CampusMap = () => {
    const [activeBuses, setActiveBuses] = useState([
        { id: 1, route: 'R44 - Tambaram', position: [13.0379, 80.0449], status: 'Moving', speed: '24 km/h' },
        { id: 2, route: 'R12 - Adyar', position: [13.0387, 80.0458], status: 'Stopped', speed: '0 km/h' },
        { id: 3, route: 'R05 - Navallur', position: [13.0381, 80.0461], status: 'Approaching', speed: '15 km/h' }
    ]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Simulate real-time bus movement
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBuses(prev => prev.map(bus => ({
                ...bus,
                position: [
                    bus.position[0] + (Math.random() - 0.5) * 0.0005,
                    bus.position[1] + (Math.random() - 0.5) * 0.0005
                ]
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: isMobile ? '12px' : '24px',
                height: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 100px)',
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '10px' : '20px'
            }}
        >
            <div>
                <h1 style={{ fontSize: isMobile ? '1.4rem' : '2rem', color: 'var(--theme-text)', fontWeight: '800', marginBottom: '4px' }}>Live IoT Campus Map</h1>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: isMobile ? '0.8rem' : '1rem' }}>Real-time spatial visualization of campus assets and transport.</p>
            </div>

            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--theme-border)', boxShadow: 'var(--shadow-soft)' }}>
                <MapContainer center={RIT_CENTER} zoom={17} style={{ height: '100%', width: '100%' }}>
                    {/* Modern Clean Map Tiles */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {/* Campus Boundary Radius */}
                    <Circle center={RIT_CENTER} pathOptions={{ fillColor: '#0B2C6B', color: '#0B2C6B', weight: 2 }} radius={220}>
                        <Popup>RIT Geo-Fence Zone</Popup>
                    </Circle>

                    {/* Institutional Blocks – approximate positions around the real campus location */}
                    <Marker position={[13.03835, 80.04540]} icon={buildingIcon}>
                        <Popup>
                            <strong>Main Academic Block</strong><br />
                            Power Usage: 45 kW<br />
                            HVAC Status: Optimal<br />
                            Env Sensors: Temp, CO₂, Noise
                        </Popup>
                    </Marker>

                    <Marker position={[13.03810, 80.04505]} icon={buildingIcon}>
                        <Popup>
                            <strong>Steve Jobs Block (Labs)</strong><br />
                            Occupancy: 84%<br />
                            Lab Safety: Normal<br />
                            Air Quality: 42 AQI (Good)
                        </Popup>
                    </Marker>

                    <Marker position={[13.03795, 80.04555]} icon={buildingIcon}>
                        <Popup>
                            <strong>RIT Canteen</strong><br />
                            Queue Status: 10–15 min<br />
                            Cold Storage: 3°C (OK)
                        </Popup>
                    </Marker>

                    <Marker position={[13.03885, 80.04570]} icon={buildingIcon}>
                        <Popup>
                            <strong>Ground & Open Area</strong><br />
                            Smart Lights: 12/12 Online<br />
                            Crowd Density: Low
                        </Popup>
                    </Marker>

                    <Marker position={[13.03780, 80.04490]} icon={buildingIcon}>
                        <Popup>
                            <strong>Main Gate / Bus Bay</strong><br />
                            Bus GPS Gateway Online<br />
                            Gate Camera: Streaming
                        </Popup>
                    </Marker>

                    {/* Live Buses */}
                    {activeBuses.map(bus => (
                        <Marker key={bus.id} position={bus.position} icon={busIcon}>
                            <Popup>
                                <div style={{ minWidth: '150px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#0B2C6B', marginBottom: '5px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                        {bus.route}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '3px' }}>
                                        <span>Status:</span>
                                        <span style={{ color: bus.status === 'Moving' ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>{bus.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span>Speed:</span>
                                        <span>{bus.speed}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </motion.div>
    );
};

export default CampusMap;
