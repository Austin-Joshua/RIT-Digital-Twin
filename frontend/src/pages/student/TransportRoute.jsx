import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import { FaBus, FaMapMarkerAlt } from 'react-icons/fa';

const TransportRoute = () => {
    const [routeInfo, setRouteInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                // Fetch student's assigned transport route (Mocking for now if endpoint isn't fully returning structure)
                const res = await api.get('/transport/my-route').catch(() => ({ data: { routeName: "Route 5 - T Nagar", vehicleNumber: "TN-01-AB-1234", driverName: "Ramesh", stops: ["T Nagar", "Saidapet", "Guindy", "Campus"] } }));
                setRouteInfo(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoute();
    }, []);

    if (loading) return <div style={{ padding: '24px' }}><Skeleton height="400px" /></div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', color: '#0B2C6B', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaBus /> My Transport Route
            </h2>

            {routeInfo ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Route Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1.1rem' }}>
                            <div><strong>Route Name:</strong> {routeInfo.routeName}</div>
                            <div><strong>Vehicle No:</strong> {routeInfo.vehicleNumber}</div>
                            <div><strong>Driver:</strong> {routeInfo.driverName}</div>
                        </div>

                        <h4 style={{ marginTop: '32px', marginBottom: '16px', color: '#666' }}>Stops</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(routeInfo.stops || []).map((stop, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                    <FaMapMarkerAlt color="#3b82f6" /> {stop}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        {/* Placeholder Map (OSM/Google Maps iframe) */}
                        <iframe
                            title="Live Map Placeholder"
                            width="100%"
                            height="100%"
                            style={{ border: 0, borderRadius: '8px', minHeight: '400px' }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=79.998,13.045,80.005,13.055&layer=mapnik&marker=13.050,80.001`}
                        ></iframe>
                    </div>
                </div>
            ) : (
                <div style={{ background: '#fef2f2', color: '#991b1b', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                    You are not assigned to any college transport route.
                </div>
            )}
        </div>
    );
};

export default TransportRoute;
