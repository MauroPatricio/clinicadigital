import api from './api';

/**
 * Security Service
 * Handles security logs, audit trails, and backup management
 */

const securityService = {
    /**
     * Get access logs
     * @param {Object} filters - { clinicId, userId, startDate, endDate, action }
     */
    getAccessLogs: async (filters) => {
        try {
            const response = await api.get('/owner/security/logs', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching access logs:', error);
            // Return mock data
            return [
                {
                    id: 1,
                    user: 'admin@clinica.pt',
                    action: 'login',
                    timestamp: '2026-02-13 09:15:23',
                    ip: '192.168.1.100',
                    device: 'Chrome Browser',
                    location: 'Lisboa, Portugal',
                    status: 'success',
                },
                {
                    id: 2,
                    user: 'maria.santos@clinica.pt',
                    action: 'login',
                    timestamp: '2026-02-13 08:45:12',
                    ip: '192.168.1.105',
                    device: 'Mobile - iOS',
                    location: 'Porto, Portugal',
                    status: 'success',
                },
                {
                    id: 3,
                    user: 'unknown@test.com',
                    action: 'login',
                    timestamp: '2026-02-13 03:22:45',
                    ip: '45.123.67.89',
                    device: 'Firefox Browser',
                    location: 'Unknown',
                    status: 'failed',
                    reason: 'Invalid credentials',
                },
            ];
        }
    },

    /**
     * Get change history / audit trail
     * @param {Object} filters - { entityType, entityId, userId, startDate, endDate }
     */
    getChangeHistory: async (filters) => {
        try {
            const response = await api.get('/owner/security/history', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching change history:', error);
            // Return mock data
            return [
                {
                    id: 1,
                    entityType: 'patient',
                    entityId: 'P12345',
                    entityName: 'João Silva',
                    field: 'phone',
                    oldValue: '912345678',
                    newValue: '918765432',
                    changedBy: 'Rececionista Ana',
                    timestamp: '2026-02-12 14:30:00',
                    action: 'update',
                },
                {
                    id: 2,
                    entityType: 'appointment',
                    entityId: 'A5678',
                    entityName: 'Consulta - Maria Santos',
                    field: 'status',
                    oldValue: 'scheduled',
                    newValue: 'completed',
                    changedBy: 'Dr. António Costa',
                    timestamp: '2026-02-12 11:15:00',
                    action: 'update',
                },
                {
                    id: 3,
                    entityType: 'user',
                    entityId: 'U123',
                    entityName: 'Pedro Alves',
                    field: 'role',
                    oldValue: 'staff',
                    newValue: 'manager',
                    changedBy: 'Admin',
                    timestamp: '2026-02-11 16:45:00',
                    action: 'update',
                },
            ];
        }
    },

    /**
     * Get backup list
     * @param {string} clinicId
     */
    getBackups: async (clinicId) => {
        try {
            const response = await api.get(`/owner/security/backups/${clinicId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching backups:', error);
            // Return mock data
            return [
                {
                    id: 1,
                    name: 'backup_2026_02_13_auto',
                    type: 'automatic',
                    date: '2026-02-13 02:00:00',
                    size: '245 MB',
                    status: 'completed',
                    duration: '3m 45s',
                },
                {
                    id: 2,
                    name: 'backup_2026_02_12_auto',
                    type: 'automatic',
                    date: '2026-02-12 02:00:00',
                    size: '243 MB',
                    status: 'completed',
                    duration: '3m 52s',
                },
                {
                    id: 3,
                    name: 'backup_2026_02_10_manual',
                    type: 'manual',
                    date: '2026-02-10 15:30:00',
                    size: '240 MB',
                    status: 'completed',
                    duration: '4m 12s',
                    createdBy: 'Admin',
                },
            ];
        }
    },

    /**
     * Create manual backup
     * @param {string} clinicId
     */
    createBackup: async (clinicId) => {
        try {
            const response = await api.post(`/owner/security/backups/${clinicId}`);
            return response.data;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    },

    /**
     * Restore from backup
     * @param {number} backupId
     */
    restoreBackup: async (backupId) => {
        try {
            const response = await api.post(`/owner/security/backups/${backupId}/restore`);
            return response.data;
        } catch (error) {
            console.error('Error restoring backup:', error);
            throw error;
        }
    },

    /**
     * Get backup schedule configuration
     * @param {string} clinicId
     */
    getBackupSchedule: async (clinicId) => {
        try {
            const response = await api.get(`/owner/security/backups/${clinicId}/schedule`);
            return response.data;
        } catch (error) {
            console.error('Error fetching backup schedule:', error);
            return {
                enabled: true,
                frequency: 'daily',
                time: '02:00',
                retention: 30,
            };
        }
    },

    /**
     * Update backup schedule
     * @param {string} clinicId
     * @param {Object} schedule
     */
    updateBackupSchedule: async (clinicId, schedule) => {
        try {
            const response = await api.put(`/owner/security/backups/${clinicId}/schedule`, schedule);
            return response.data;
        } catch (error) {
            console.error('Error updating backup schedule:', error);
            throw error;
        }
    },
};

export default securityService;
