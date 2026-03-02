import { useState } from 'react';
import api from '../../services/api';
import './SmartClassroom.css';

const DEPARTMENTS = [
    'CSE', 'ECE', 'MECH', 'EEE', 'CIVIL', 'IT', 'AIDS', 'BME', 'S&H', 'MBA'
];

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const ROOM_TYPES = [
    { value: '', label: 'Any Type' },
    { value: 'LECTURE_HALL', label: 'Lecture Hall' },
    { value: 'LAB', label: 'Laboratory' },
    { value: 'SEMINAR', label: 'Seminar Hall' },
    { value: 'TUTORIAL', label: 'Tutorial Room' },
    { value: 'AUDITORIUM', label: 'Auditorium' },
    { value: 'CONFERENCE', label: 'Conference Room' }
];

const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
];

function SmartClassroomPage() {
    const [formData, setFormData] = useState({
        studentCount: '',
        department: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        roomType: '',
        requireAc: false,
        requireProjector: false,
        requireSmartBoard: false
    });

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('simulate');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResults(null);

        try {
            const payload = {
                ...formData,
                studentCount: parseInt(formData.studentCount, 10)
            };
            const response = await api.post('/api/simulation/classroom', payload);
            setResults(response.data);
            setActiveTab('results');
        } catch (err) {
            setError(err.response?.data?.message || 'The simulation could not be completed. Please verify your inputs and try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreClass = (score) => {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-fair';
        return 'score-poor';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    const formatRoomType = (type) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="smart-classroom-page">
            {/* Page Header */}
            <div className="module-header">
                <div className="module-header-content">
                    <div className="module-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                    </div>
                    <div>
                        <h1>Smart Classroom Allocation Engine</h1>
                        <p>AI-powered room assignment optimizer for optimal space utilization</p>
                    </div>
                </div>
                <div className="module-stats">
                    <div className="stat-chip">
                        <span className="stat-icon">🏫</span>
                        <span>20 Classrooms</span>
                    </div>
                    <div className="stat-chip">
                        <span className="stat-icon">📊</span>
                        <span>10 Buildings</span>
                    </div>
                    <div className="stat-chip">
                        <span className="stat-icon">⚡</span>
                        <span>Real-time Analysis</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'simulate' ? 'active' : ''}`}
                    onClick={() => setActiveTab('simulate')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Run Simulation
                </button>
                <button
                    className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
                    onClick={() => setActiveTab('results')}
                    disabled={!results}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Results {results && `(${results.totalRecommendations})`}
                </button>
            </div>

            {/* Simulation Form Tab */}
            {activeTab === 'simulate' && (
                <div className="simulation-form-container">
                    <form onSubmit={handleSubmit} className="simulation-form">
                        <div className="form-section">
                            <h3 className="form-section-title">
                                <span className="section-number">1</span>
                                Class Details
                            </h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="studentCount">Student Count *</label>
                                    <input
                                        type="number"
                                        id="studentCount"
                                        name="studentCount"
                                        value={formData.studentCount}
                                        onChange={handleChange}
                                        placeholder="Enter number of students"
                                        min="1"
                                        max="500"
                                        required
                                    />
                                    <span className="form-hint">Between 1 and 500</span>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="department">Department</label>
                                    <select id="department" name="department" value={formData.department} onChange={handleChange}>
                                        <option value="">All Departments</option>
                                        {DEPARTMENTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="roomType">Room Type</label>
                                    <select id="roomType" name="roomType" value={formData.roomType} onChange={handleChange}>
                                        {ROOM_TYPES.map(rt => (
                                            <option key={rt.value} value={rt.value}>{rt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">
                                <span className="section-number">2</span>
                                Time Slot Preference
                            </h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="dayOfWeek">Day of Week</label>
                                    <select id="dayOfWeek" name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
                                        <option value="">Any Day</option>
                                        {DAYS.map(d => (
                                            <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="startTime">Start Time</label>
                                    <select id="startTime" name="startTime" value={formData.startTime} onChange={handleChange}>
                                        <option value="">Select start time</option>
                                        {TIME_SLOTS.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endTime">End Time</label>
                                    <select id="endTime" name="endTime" value={formData.endTime} onChange={handleChange}>
                                        <option value="">Select end time</option>
                                        {TIME_SLOTS.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">
                                <span className="section-number">3</span>
                                Amenity Requirements
                            </h3>
                            <div className="amenity-grid">
                                <label className="amenity-checkbox">
                                    <input
                                        type="checkbox"
                                        name="requireProjector"
                                        checked={formData.requireProjector}
                                        onChange={handleChange}
                                    />
                                    <span className="amenity-icon">📽️</span>
                                    <span>Projector</span>
                                </label>
                                <label className="amenity-checkbox">
                                    <input
                                        type="checkbox"
                                        name="requireAc"
                                        checked={formData.requireAc}
                                        onChange={handleChange}
                                    />
                                    <span className="amenity-icon">❄️</span>
                                    <span>Air Conditioning</span>
                                </label>
                                <label className="amenity-checkbox">
                                    <input
                                        type="checkbox"
                                        name="requireSmartBoard"
                                        checked={formData.requireSmartBoard}
                                        onChange={handleChange}
                                    />
                                    <span className="amenity-icon">🖥️</span>
                                    <span>Smart Board</span>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="form-error">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading || !formData.studentCount}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Running Simulation...
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    Run Allocation Simulation
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && results && (
                <div className="results-container">
                    {/* Summary Cards */}
                    <div className="results-summary">
                        <div className="summary-card">
                            <div className="summary-value">{results.totalRoomsEvaluated}</div>
                            <div className="summary-label">Rooms Evaluated</div>
                        </div>
                        <div className="summary-card highlight">
                            <div className="summary-value">{results.totalRecommendations}</div>
                            <div className="summary-label">Recommendations</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value">{results.executionTimeMs}ms</div>
                            <div className="summary-label">Execution Time</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value">#{results.simulationId}</div>
                            <div className="summary-label">Simulation ID</div>
                        </div>
                    </div>

                    {results.summary && (
                        <div className="results-insight">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <p>{results.summary}</p>
                        </div>
                    )}

                    {/* Recommendations Grid */}
                    <div className="recommendations-grid">
                        {results.recommendations?.map((rec, index) => (
                            <div key={rec.classroomId} className={`recommendation-card ${index === 0 ? 'top-pick' : ''}`}>
                                {index === 0 && <div className="top-pick-badge">⭐ Top Pick</div>}
                                <div className="rec-header">
                                    <div className="rec-room">
                                        <h3>{rec.roomNumber}</h3>
                                        <span className="rec-building">{rec.buildingName} ({rec.buildingCode})</span>
                                    </div>
                                    <div className={`rec-score ${getScoreClass(rec.suitabilityScore)}`}>
                                        <span className="score-value">{rec.suitabilityScore}</span>
                                        <span className="score-label">{getScoreLabel(rec.suitabilityScore)}</span>
                                    </div>
                                </div>

                                <div className="rec-details">
                                    <div className="rec-detail">
                                        <span className="detail-label">Capacity</span>
                                        <span className="detail-value">{rec.capacity} seats</span>
                                    </div>
                                    <div className="rec-detail">
                                        <span className="detail-label">Floor</span>
                                        <span className="detail-value">Floor {rec.floor}</span>
                                    </div>
                                    <div className="rec-detail">
                                        <span className="detail-label">Type</span>
                                        <span className="detail-value">{formatRoomType(rec.roomType)}</span>
                                    </div>
                                    <div className="rec-detail">
                                        <span className="detail-label">Utilization</span>
                                        <span className="detail-value">{rec.utilizationPercent}%</span>
                                    </div>
                                </div>

                                {/* Utilization Bar */}
                                <div className="utilization-bar-container">
                                    <div className="utilization-labels">
                                        <span>Space Utilization</span>
                                        <span>{rec.utilizationPercent}%</span>
                                    </div>
                                    <div className="utilization-bar">
                                        <div
                                            className={`utilization-fill ${rec.utilizationPercent >= 85 ? 'optimal' : rec.utilizationPercent >= 60 ? 'good' : 'low'}`}
                                            style={{ width: `${Math.min(rec.utilizationPercent, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="wasted-label">{rec.wastedCapacity} seats unused</span>
                                </div>

                                {/* Amenities */}
                                <div className="rec-amenities">
                                    {rec.hasProjector && <span className="amenity-tag">📽️ Projector</span>}
                                    {rec.hasAc && <span className="amenity-tag">❄️ AC</span>}
                                    {rec.hasSmartBoard && <span className="amenity-tag">🖥️ Smart Board</span>}
                                    {rec.hasWifi && <span className="amenity-tag">📶 WiFi</span>}
                                </div>

                                {/* Availability */}
                                <div className={`rec-availability ${rec.availabilityStatus === 'AVAILABLE' ? 'available' : 'occupied'}`}>
                                    <span className="availability-dot"></span>
                                    {rec.availabilityStatus === 'AVAILABLE' ? 'Available for requested slot' : 'Slot occupied'}
                                </div>

                                {rec.conflictingSlots?.length > 0 && (
                                    <div className="rec-conflicts">
                                        <span className="conflict-label">Conflicts:</span>
                                        {rec.conflictingSlots.map((c, i) => (
                                            <span key={i} className="conflict-item">{c}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {results.recommendations?.length === 0 && (
                        <div className="no-results">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="8" y1="15" x2="16" y2="15" />
                                <line x1="9" y1="9" x2="9.01" y2="9" />
                                <line x1="15" y1="9" x2="15.01" y2="9" />
                            </svg>
                            <h3>No Classrooms Found</h3>
                            <p>No classrooms match your criteria. Try reducing the student count or removing amenity requirements.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SmartClassroomPage;
