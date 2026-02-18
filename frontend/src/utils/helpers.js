/**
 * Format a number with commas as thousands separator.
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
    if (num == null) return '—';
    return Number(num).toLocaleString('en-IN');
};

/**
 * Format a number as percentage.
 * @param {number} value - Value 0–100 or 0–1
 * @param {number} decimals
 * @returns {string}
 */
export const formatPercent = (value, decimals = 1) => {
    if (value == null) return '—';
    const pct = value > 1 ? value : value * 100;
    return `${pct.toFixed(decimals)}%`;
};

/**
 * Clamp a value between min and max.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Generate a deterministic color from a string (for charts).
 */
export const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 55%, 50%)`;
};

/**
 * Truncate text with ellipsis.
 */
export const truncate = (text, maxLen = 80) => {
    if (!text || text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
};

/**
 * Capitalize first letter of a string.
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Chart color palette (institutional RIT theme).
 */
export const CHART_COLORS = [
    '#003366', '#c9a227', '#2e7d32', '#1565c0',
    '#ef6c00', '#6a1b9a', '#00838f', '#c62828',
    '#4e7a27', '#5d4037', '#1a237e', '#ad1457',
];

/**
 * Grade label from score.
 */
export const scoreToGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
};
