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

// RIT Chennai Approximate Coordinates
const RIT_CENTER = [13.0483, 80.0573];

const CampusMap = () => {
    const [activeBuses, setActiveBuses] = useState([
        { id: 1, route: 'R44 - Tambaram', position: [13.0490, 80.0580], status: 'Moving', speed: '24 km/h' },
        { id: 2, route: 'R12 - Adyar', position: [13.0470, 80.0560], status: 'Stopped', speed: '0 km/h' },
        { id: 3, route: 'R05 - Navallur', position: [13.0485, 80.0555], status: 'Approaching', speed: '15 km/h' }
    ]);

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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '8px' }}>Live IoT Campus Map</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Real-time spatial visualization of campus assets, smart blocks, and active transport routes.</p>
            </div>

            <div style={{ flex: 1, minHeight: '600px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
                <MapContainer center={RIT_CENTER} zoom={16} style={{ height: '100%', width: '100%' }}>
                    {/* Modern Clean Map Tiles */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {/* Campus Boundary Radius */}
                    <Circle center={RIT_CENTER} pathOptions={{ fillColor: '#0B2C6B', color: '#0B2C6B', weight: 2 }} radius={300}>
                        <Popup>RIT Geo-Fence Zone</Popup>
                    </Circle>

                    {/* Institutional Blocks */}
                    <Marker position={[13.0483, 80.0573]} icon={buildingIcon}>
                        <Popup>
                            <strong>Main Block (Admin)</strong><br />
                            Power Usage: 45 kW<br />
                            HVAC Status: Optimal
                        </Popup>
                    </Marker>

                    <Marker position={[13.0495, 80.0585]} icon={buildingIcon}>
                        <Popup>
                            <strong>Green Building (CSE/IT)</strong><br />
                            Occupancy: 84%<br />
                            Air Quality: 42 AQI (Good)
                        </Popup>
                    </Marker>

                    <Marker position={[13.0475, 80.0550]} icon={buildingIcon}>
                        <Popup>
                            <strong>Boys Hostel</strong><br />
                            Water Tank Level: 68%<br />
                            WiFi Active Devices: 342
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
