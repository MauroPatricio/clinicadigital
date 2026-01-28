# Multi-Clinic Platform - Frontend Setup Guide

## Installation

```bash
cd admin-web
npm install recharts
npm install
```

## Environment Setup

Create `.env` file in `admin-web/`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

```bash
# Start backend (in separate terminal)
cd backend
npm run seed  # Populate demo data
npm run dev   # Start backend server

# Start frontend
cd admin-web
npm run dev
```

## Login Credentials

Use these credentials from the seeded database:

### Owner Account
- **Email:** `owner@clinica.mz`
- **Password:** `admin123`
- **Access:** All 3 clinics, analytics, organization settings

### Manager Accounts
- **Clinic 1:** `manager1@clinicamz.co.mz` / `admin123`
- **Clinic 2:** `manager2@clinicamz.co.mz` / `admin123`
- **Clinic 3:** `manager3@clinicamz.co.mz` / `admin123`
- **Access:** Single clinic operations

### Staff (Doctor) Accounts
- **Clinic 1:** `doctor1.clinic1@clinicamz.co.mz` / `admin123`
- **Clinic 2:** `doctor1.clinic2@clinicamz.co.mz` / `admin123`
- **Clinic 3:** `doctor1.clinic3@clinicamz.co.mz` / `admin123`
- **Access:** Personal schedule and patients

## Features Implemented

### ✅ Context & State Management
- **AuthContext** - Hierarchical role authentication
- **ClinicContext** - Multi-clinic switching for owners

### ✅ Premium UI Components
- **StatCard** - Analytics cards with trend indicators
- **SkeletonLoader** - 4 loading state variants
- **Sidebar** - Role-based navigation with gradient design
- **ClinicSelector** - Multi-clinic switcher (owner only)
- **NotificationBell** - Real-time notifications with dropdown

### ✅ Role-Specific Dashboards

**Owner Dashboard** (`/owner/dashboard`):
- Multi-clinic revenue overview
- Best performing clinic & staff
- Service distribution charts (Recharts)
- Peak hours analysis
- No-show rate tracking

**Manager Dashboard** (`/manager/dashboard`):
- Today's appointments list
- Revenue & staff metrics
- Room availability
- Top performer leaderboard

**Staff Dashboard** (`/staff/dashboard`):
- Personal daily schedule
- Monthly performance metrics
- Patient contact information
- Completion rate & ratings

### ✅ Management Features

**Clinic Management (Owner)**
- List all clinics with status & stats
- **Compare Clinics:** Side-by-side performance comparison
- Revenue/Appointment comparison charts

**Staff Management (Manager)**
- Filterable staff list (role, name)
- Staff profiles with activity status & ratings
- Efficiency metrics

### ✅ Navigation Structure

**Owner Routes:**
- `/owner/dashboard` - Overview
- `/owner/clinics` - Clinic list
- `/owner/clinics/compare` - Performance comparison
- `/owner/organization` - Settings
- `/owner/subscription` - Plan management

**Manager Routes:**
- `/manager/dashboard` - Daily operations
- `/manager/staff` - Staff management
- `/manager/appointments` - Appointments
- `/manager/patients` - Patient list
- `/manager/rooms` - Room management

**Staff Routes:**
- `/staff/dashboard` - Personal metrics
- `/staff/schedule` - My schedule
- `/staff/patients` - My patients
- `/staff/messages` - Messages (coming soon)

## Architecture Highlights

### Protected Routes
- Role-based access control
- Automatic redirection to appropriate dashboard
- Nested route protection

### API Integration
- Centralized Axios instance with interceptors
- Automatic token injection
- 401 error handling with auto-logout

### Multi-Clinic Support
- Owner can switch between clinics
- Manager/Staff locked to assigned clinic
- Context-aware components

## Testing the Application

1. **Login as Owner** → See all 3 clinics, revenue charts, and compare them.
2. **Login as Manager** → See single clinic, today's operations, and manage staff.
3. **Login as Staff** → See personal schedule.
4. **Switch clinics** (as owner) using ClinicSelector.
5. **Check notifications** using the bell icon.

## Next Development Steps

### Phase 9: UI/UX Polish
- [ ] Implement dark mode
- [ ] Add page transitions
- [ ] Responsive improvements
- [ ] Error boundaries

### Phase 10: Additional Features
- [ ] Clinic management (add/edit clinics)
- [ ] Staff management interface (add/edit)
- [ ] Room management UI
- [ ] Real-time notifications (socket.io)
- [ ] Chat system

### Phase 11: Testing
- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)

## Troubleshooting

**404 on dashboard routes:**
- Ensure backend is running
- Check API_URL in `.env`
- Verify login credentials

**Charts not rendering:**
- Install recharts: `npm install recharts`
- Check browser console for errors

**Sidebar not showing:**
- Clear localStorage and re-login
- Check user.roleType in localStorage

**Multi-clinic switching not working:**
- Only owners can switch clinics
- Verify user is logged in as owner

## File Structure

```
admin-web/src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx
│   ├── clinics/
│   │   └── ClinicSelector.jsx
│   ├── layout/
│   │   ├── MainLayout.jsx
│   │   └── Sidebar.jsx
│   ├── notifications/
│   │   └── NotificationBell.jsx
│   └── premium/
│       ├── StatCard.jsx
│       └── SkeletonLoader.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ClinicContext.jsx
├── pages/
│   ├── owner/
│   │   ├── OwnerDashboard.jsx
│   │   ├── ClinicsListPage.jsx
│   │   └── CompareClinicsPage.jsx
│   ├── manager/
│   │   ├── ManagerDashboard.jsx
│   │   └── StaffManagementPage.jsx
│   └── staff/
│       └── StaffDashboard.jsx
├── services/
│   ├── api.js
│   └── authService.js
└── App.jsx
```

## Support

For issues or questions, check:
- Backend logs for API errors
- Browser console for frontend errors
- Network tab for failed requests
