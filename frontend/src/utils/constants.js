/**
 * Application-wide constants.
 */

export const APP_NAME = 'RIT Digital Twin';
export const APP_SUBTITLE = 'Smart Campus Intelligence Platform';
export const INSTITUTION = 'Rajalakshmi Institute of Technology, Chennai';
export const COPYRIGHT_YEAR = 2026;

/** API base URL (proxied in Docker, direct in dev) */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/** Simulation module identifiers */
export const MODULES = {
    CLASSROOM: 'classroom',
    ENERGY: 'energy',
    TRANSPORT: 'transport',
    CROWD: 'crowd',
    SUSTAINABILITY: 'sustainability',
    PREDICTIVE: 'predictive',
};

/** JWT token key in localStorage */
export const TOKEN_KEY = 'rit_dt_token';
export const USER_KEY = 'rit_dt_user';

/** Chart dimensions for Recharts */
export const CHART_CONFIG = {
    ASPECT_RATIO: 2.5,
    MARGIN: { top: 10, right: 20, left: 0, bottom: 5 },
    ANIMATION_DURATION: 800,
};
