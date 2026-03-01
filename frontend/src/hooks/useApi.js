import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls with loading + error state management.
 * Usage:
 *   const { data, loading, error, execute } = useApi();
 *   execute(() => api.post('/simulate/energy', payload));
 */
const useApi = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (apiCall) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall();
            setData(response.data);
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'An error occurred';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
};

export default useApi;
