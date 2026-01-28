# Clínica Digital - Backend API

## Overview

This is the backend API for the Clínica Digital management system. It provides a comprehensive REST API for managing appointments, patients, doctors, medical records, billing, telemedicine, and more.

## Technology Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Agora.io** - Video calling (telemedicine)

## Getting Started

### Prerequisites

- Node.js 16+ installed
- MongoDB installed locally OR MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   The `.env` file has been created with basic configuration. Update the following as needed:
   
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret for JWT tokens (change in production!)
   - Other service credentials (email, SMS, payment gateways, etc.)

3. **Start MongoDB** (if running locally):
   ```bash
   # Windows
   mongod

   # macOS/Linux
   sudo systemctl start mongod
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

## API Documentation

### Health Check

```
GET /health
```

Returns API status and timestamp.

### Authentication Endpoints

| Endpoint | Method |Access | Description |
|----------|--------|-------|-------------|
| `/api/auth/register` | POST | Public | Register new user |
| `/api/auth/login` | POST | Public | Login user |
| `/api/auth/refresh` | POST | Public | Refresh access token |
| `/api/auth/logout` | POST | Private | Logout user |
| `/api/auth/me` | GET | Private | Get current user |
| `/api/auth/biometric-setup` | POST | Private | Enable/disable biometric auth |
| `/api/auth/register-device` | POST | Private | Register FCM token |

### Appointment Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/appointments` | GET | Private | Get all appointments |
| `/api/appointments` | POST | Private (Patient) | Create appointment |
| `/api/appointments/availability` | GET | Public | Check doctor availability |
| `/api/appointments/:id` | PUT | Private (Admin/Receptionist/Doctor) | Update appointment |
| `/api/appointments/:id` | DELETE | Private (Patient/Admin) | Cancel appointment |
| `/api/appointments/:id/confirm` | POST | Private (Admin/Receptionist) | Confirm appointment |

### Medical Records Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/medical-records` | GET | Private | Get medical records |
| `/api/medical-records` | POST | Private (Doctor) | Create medical record |
| `/api/medical-records/:id` | GET | Private | Get record details |
| `/api/medical-records/:id` | PUT | Private (Doctor) | Update record |
| `/api/medical-records/:id/attachments` | POST | Private (Doctor) | Add attachment |
| `/api/medical-records/patient/:id/history` | GET | Private (Doctor/Admin) | Get patient history |

### Billing & Payment Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/billing/invoices` | GET | Private | Get all bills |
| `/api/billing/invoices` | POST | Private (Admin/Receptionist) | Create bill |
| `/api/billing/invoices/:id` | GET | Private | Get bill details |
| `/api/billing/reports` | GET | Private (Admin) | Financial reports |
| `/api/billing/stats` | GET | Private (Admin) | Billing statistics |
| `/api/payments/mpesa` | POST | Private | Process M-Pesa payment |
| `/api/payments/card` | POST | Private | Process card payment |
| `/api/payments/:id` | GET | Private | Get payment details |
| `/api/payments/:id/receipt` | GET | Private | Get payment receipt |
| `/api/payments/:id/refund` | POST | Private (Admin) | Refund payment |

### Telemedicine Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/telemedicine/room` | POST | Private | Create video room |
| `/api/telemedicine/token` | GET | Private | Get Agora token |
| `/api/telemedicine/active` | GET | Private (Doctor/Admin) | Get active consultations |
| `/api/telemedicine/:id/recording` | POST | Private (Doctor) | Manage recording |
| `/api/telemedicine/:id/documents` | POST | Private | Share documents |
| `/api/telemedicine/:id/end` | POST | Private (Doctor) | End consultation |

### Patient Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/patients` | GET | Private (Admin/Doctor/Nurse) | Get all patients |
| `/api/patients/:id` | GET | Private | Get patient details |
| `/api/patients/:id` | PUT | Private (Admin/Doctor/Nurse) | Update patient |
| `/api/patients/:id/triage` | POST | Private (Doctor/Nurse) | Set risk classification |

### Doctor Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/doctors` | GET | Public | Get all doctors |
| `/api/doctors/:id` | GET | Public | Get doctor details |
| `/api/doctors/:id` | PUT | Private (Doctor/Admin) | Update doctor profile |
| `/api/doctors/:id/stats` | GET | Private (Doctor/Admin) | Get doctor statistics |

### Prescription Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/prescriptions` | POST | Private (Doctor) | Create prescription |
| `/api/prescriptions/:id` | GET | Private | Get prescription |
| `/api/prescriptions/check-interactions` | GET | Private (Doctor) | Check drug interactions |

### Notification Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/notifications` | GET | Private | Get user notifications |
| `/api/notifications/:id/read` | PUT | Private | Mark as read |
| `/api/notifications` | POST | Private (Admin) | Create notification |

### Laboratory Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/lab/orders` | GET | Private | Get lab orders |
| `/api/lab/orders` | POST | Private (Doctor) | Create lab order |
| `/api/lab/orders/:id` | GET | Private | Get order details |
| `/api/lab/orders/:id` | PUT | Private (Admin/Nurse) | Update order |
| `/api/lab/orders/:id/results` | POST | Private (Admin/Nurse) | Upload results |
| `/api/lab/orders/:id/notify` | POST | Private (Admin) | Notify patient |

### Chat Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/chat/conversations` | GET | Private | Get conversations |
| `/api/chat/conversations` | POST | Private | Create conversation |
| `/api/chat/conversations/:id/messages` | GET | Private | Get messages |
| `/api/chat/conversations/:id/messages` | POST | Private | Send message |
| `/api/chat/conversations/:id/read` | PUT | Private | Mark as read |

### File Upload Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/upload/single` | POST | Private | Upload single file |
| `/api/upload/multiple` | POST | Private | Upload multiple files |

## Database Models

The system includes the following models:

- **User** - Base user with authentication
- **Patient** - Patient profile with medical history
- **Doctor** - Doctor profile with specialization and availability
- **Appointment** - Appointment scheduling
- **MedicalRecord** - Digital medical records
- **Prescription** - Digital prescriptions
- **MedicationReminder** - Medication reminders
- **Bill** - Billing and invoices
- **Payment** - Payment transactions
- **LabOrder** - Laboratory exam orders
- **Chat** - Secure messaging
- **Notification** - Push/SMS/Email notifications
- **Schedule** - Doctor shift management
- **Clinic** - Clinic locations

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection
│   │   └── logger.js    # Winston logger setup
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   └── appointmentController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   └── errorHandler.js
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   └── ... (more models)
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   └── appointmentRoutes.js
│   └── app.js           # Express app setup
├── logs/                # Application logs
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json
└── README.md
```

## Next Steps

The following features are planned:

1. **Telemedicine API** - Video call room management with Agora.io
2. **Medical Records API** - CRUD operations for medical records
3. **Prescription API** - Digital prescriptions with pharmacy integration
4. **Billing & Payments** - Invoice generation and payment processing
5. **Laboratory Module** - Lab order and results management
6. **Notification Service** - Multi-channel notifications (Push/SMS/Email)
7. **Chat Service** - Real-time secure messaging with Socket.IO
8. **File Upload** - Secure file handling for medical documents

## Testing

Once dependencies are installed, you can test the API:

### 1. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "patient",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+258 84 123 4567"
    }
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Check doctor availability
```bash
curl http://localhost:5000/api/appointments/availability?doctorId=<DOCTOR_ID>&date=2025-12-15
```

## Environment Configuration

See `.env.example` for all available environment variables. Key configurations include:

- Database connection
- JWT secrets
- Email/SMS service credentials
- Payment gateway credentials
- Video calling service credentials
- Google Maps API key

## Logging

Logs are written to the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Helmet.js for HTTP security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Request validation
- Role-based access control

## License

MIT

## Contact

For questions or support, please contact the development team.
