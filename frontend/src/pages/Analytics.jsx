import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Analytics = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('/analytics/predictions')
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2>Predictive Analytics Layer</h2>
            {data && (
                <div className="rit-card">
                    <h3>Strategic Forecasts</h3>
                    <p><strong>Next Semester Infrastructure Demand:</strong> {data.nextSemesterDemand}</p>
                    <p><strong>Predicted Energy Growth:</strong> {data.predictedEnergyGrowth}</p>
                </div>
            )}
        </div>
    );
};

export default Analytics;
