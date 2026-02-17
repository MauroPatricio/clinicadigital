
// Store server start time
const startTime = process.uptime();

/**
 * Get current system uptime in seconds
 * @returns {number} Uptime in seconds
 */
export const getUptimeSeconds = () => {
    return process.uptime();
};

/**
 * Format seconds into HH:MM:SS string
 * @param {number} seconds 
 * @returns {string} Formatted time string
 */
export const formatUptime = (seconds) => {
    const pad = (s) => (s < 10 ? '0' : '') + s;
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
};

/**
 * Get formatted uptime since server start
 * @returns {string} HH:MM:SS
 */
export const getFormattedUptime = () => {
    return formatUptime(process.uptime());
};
