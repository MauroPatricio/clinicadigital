import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { getFormattedUptime, getUptimeSeconds } from '../utils/uptimeUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get version
const packageJsonPath = path.join(__dirname, '../../package.json');
let packageVersion = '1.0.0';

try {
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageVersion = packageData.version;
} catch (error) {
    console.error('Error reading package.json:', error);
}

/**
 * @desc    Get API status page (HTML)
 * @route   GET /status
 * @access  Public
 */
export const getStatusPage = (req, res) => {
    const statusHtmlPath = path.join(__dirname, '../views/status.html');

    // If we want to inject data server-side, we could read the file and replace placeholders
    // For now, we'll serve the static HTML file and let it fetch data via JS or just serve static assets
    // But since the requirement implies dynamic data on the page, let's use a simple replacement approach
    // or just serve the HTML which will fetch the JSON endpoint.
    // The most robust way for a simple status page is to serve the HTML which polls the JSON endpoint.

    res.sendFile(statusHtmlPath);
};

/**
 * @desc    Get API status data (JSON)
 * @route   GET /api/status
 * @access  Public
 */
export const getStatusData = async (req, res) => {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado';
    const dbState = mongoose.connection.readyState; // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting

    // Calculate uptime
    const uptime = getFormattedUptime();
    const uptimeSeconds = getUptimeSeconds();

    // Environment
    const environment = process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento';

    res.status(200).json({
        success: true,
        data: {
            status: 'online',
            message: 'API Online',
            database: {
                status: dbStatus,
                state: dbState,
                text: dbStatus
            },
            system: {
                version: `v${packageVersion}`,
                environment: environment,
                uptime: uptime,
                uptimeSeconds: uptimeSeconds,
                timestamp: new Date().toISOString()
            }
        }
    });
};
