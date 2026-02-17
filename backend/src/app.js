import 'dotenv/config'; // Must be first
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit'; // Fixed import order
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import logger from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// API Routes
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import telemedicineRoutes from './routes/telemedicineRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import labRoutes from './routes/labRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
// Multi-clinic routes
import organizationRoutes from './routes/organizationRoutes.js';
import clinicManagementRoutes from './routes/clinicManagementRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
// Owner routes
import ownerAnalyticsRoutes from './routes/ownerAnalyticsRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import premiumFinanceRoutes from './routes/premiumFinanceRoutes.js';
import multiClinicRoutes from './routes/multiClinicRoutes.js';
import advancedAnalyticsRoutes from './routes/advancedAnalyticsRoutes.js';
// User & Permission Management
import userRoutes from './routes/userRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import ownerLabRoutes from './routes/ownerLabRoutes.js';
import statusRoutes from './routes/statusRoutes.js';

// Batch 5: Pharmacy & Stock
import stockRoutes from './routes/stockRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: [
            process.env.FRONTEND_WEB_URL,
            process.env.FRONTEND_MOBILE_URL,
            'http://localhost:4173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173'
        ],
        credentials: true
    }
});

// Connect to MongoDB (non-blocking)
connectDB().catch(err => {
    console.log('\x1b[31m%s\x1b[0m', '⚠ Servidor iniciado sem conexão MongoDB');
    logger.error('Failed to connect to MongoDB on startup');
});

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
    origin: [
        process.env.FRONTEND_WEB_URL,
        process.env.FRONTEND_MOBILE_URL,
        'http://localhost:4173'
    ],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Clínica Digital API is running',
        timestamp: new Date().toISOString()
    });
});

// Status Page Route (HTML & API)
app.use('/', statusRoutes);

// Status Page Routes
// Moved import to top and app.use to appropriate location

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Core authentication
app.use('/api/auth', authRoutes);
// User & Permission Management (Owner only)
app.use('/api/users', userRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/audit-logs', auditLogRoutes);
// Standard routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/telemedicine', telemedicineRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reports', reportsRoutes);
// Multi-clinic routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/clinics', clinicManagementRoutes);
app.use('/api/analytics', analyticsRoutes);
// Owner premium routes
app.use('/api/owner/analytics', ownerAnalyticsRoutes);
app.use('/api/owner/finance', financeRoutes); // Basic Finance
app.use('/api/owner/finance/premium', premiumFinanceRoutes); // Premium Finance
app.use('/api/owner/multi-clinic', multiClinicRoutes); // Multi-Clinic
app.use('/api/owner/advanced-analytics', advancedAnalyticsRoutes);
app.use('/api/owner/laboratory', ownerLabRoutes); // Laboratory Management

// Batch 5: Pharmacy & Stock
app.use('/api/stock', stockRoutes);
app.use('/api/suppliers', supplierRoutes);


// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        logger.info(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        logger.info(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });
});

// Make io available to routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
    // Get machine IP address
    const { networkInterfaces } = await import('os');
    const nets = networkInterfaces();
    let machineIP = 'localhost';

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                machineIP = net.address;
                break;
            }
        }
        if (machineIP !== 'localhost') break;
    }

    console.log('\x1b[36m%s\x1b[0m', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\x1b[32m%s\x1b[0m', `✓ Servidor disponível e escutando na porta ${PORT}`);
    console.log('\x1b[33m%s\x1b[0m', `  IP da máquina: ${machineIP}`);
    console.log('\x1b[36m%s\x1b[0m', `  Local: http://localhost:${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', `  Rede: http://${machineIP}:${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    httpServer.close(() => process.exit(1));
});

export default app;
