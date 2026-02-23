import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import api from '../../services/api';
import { FaBus, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const containerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
};

const center = {
    lat: 13.0827, // Chennai coordinates as default for RIT
    lng: 80.2707
};

const TransportRoute = ({ studentId }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY" // Placeholder for user to fill
    });

    const [routeData, setRouteData] = useState(null);
    const [directions, setDirections] = useState(null);

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const res = await api.get(`/api/operations/transport/student/${studentId}`);
                if (res.data && res.data.length > 0) {
                    setRouteData(res.data[0].route);
                }
            } catch (err) {
                console.error("Failed to fetch transport data", err);
            }
        };
        fetchRoute();
    }, [studentId]);

    useEffect(() => {
        if (isLoaded && routeData) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: routeData.startLocation,
                    destination: routeData.endLocation,
                    travelMode: window.google.maps.TravelMode.DRIVING
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    } else {
                        console.error(`error fetching directions ${result}`);
                    }
                }
            );
        }
    }, [isLoaded, routeData]);

    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 16px 0', borderBottom: '2px solid #0B2C6B', paddingBottom: '10px' }}>
                    <FaBus /> My Transport Route
                </h2>

                {routeData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Route Name</div>
                                <div style={{ fontWeight: 'bold' }}>{routeData.routeName}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Vehicle Number</div>
                                <div style={{ fontWeight: 'bold' }}>{routeData.vehicleNumber}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Pickup Point</div>
                                <div style={{ fontWeight: 'bold' }}><FaMapMarkerAlt color="#EF4444" /> {routeData.startLocation}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Estimated Time</div>
                                <div style={{ fontWeight: 'bold' }}><FaClock color="#0B2C6B" /> 07:30 AM</div>
                            </div>
                        </div>

                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={12}
                        >
                            {directions && <DirectionsRenderer directions={directions} />}
                        </GoogleMap>
                    </div>
                ) : (
                    <p>No transport route assigned yet.</p>
                )}
            </div>
        </div>
    );
};

export default TransportRoute;
