# Multi-Clinic Platform Seeder

## Quick Start

```bash
# 1. Make sure MongoDB is running
# 2. Configure .env file with MONGODB_URI
# 3. Run the seeder
npm run seed
```

## What Gets Created

### Organization & Ownership
- **1 Organization**: "Rede Clínicas Moçambique"
- **1 Owner Account**: `owner@clinica.mz`
- **Pro Subscription**: Active for 1 year with all features enabled

### Clinics (3)
1. **Clínica Central - Maputo**
   - Manager: `manager1@clinicamz.co.mz`
   - Specialties: Clínica Geral, Pediatria, Cardiologia, Dermatologia
   - 5 Rooms (3 consultation, 1 procedure, 1 emergency)
   
2. **Clínica Matola**
   - Manager: `manager2@clinicamz.co.mz`
   - Specialties: Clínica Geral, Pediatria, Ginecologia
   - 5 Rooms
   
3. **Clínica Beira**
   - Manager: `manager3@clinicamz.co.mz`
   - Specialties: Clínica Geral, Ortopedia, Medicina Interna
   - 5 Rooms

### Staff (12 members - 4 per clinic)
- **2 Doctors** per clinic
- **1 Nurse** per clinic
- **1 Receptionist** per clinic

Example logins:
- `doctor1.clinic1@clinicamz.co.mz` - Dr. João Mateus (Clínica Geral)
- `doctor2.clinic1@clinicamz.co.mz` - Dra. Sofia Armando (Pediatria)
- `nurse1.clinic1@clinicamz.co.mz` - Enf. Beatriz Nunes
- `reception.clinic1@clinicamz.co.mz` - Recep. Lucas Fernandes

### Patients (10)
- Distributed across all 3 clinics
- Each with complete profile, emergency contact, and insurance

### Appointments (30)
- Spread over the last 10 days
- Mix of statuses: scheduled, confirmed, completed, no-show
- Includes timestamps for analytics (confirmedAt, startedAt, completedAt)

### Insurance Providers (2)
- EMOSE - Empresa Moçambicana de Seguros
- MCS - Mozambique Companhia de Seguros

### Rooms (15 total - 5 per clinic)
- Consultation rooms
- Procedure rooms
- Emergency rooms
- All with equipment tracking

## Login Credentials

**All accounts use the same password: `admin123`**

### Primary Accounts
| Role | Email | Access Level |
|------|-------|--------------|
| Owner | `owner@clinica.mz` | All 3 clinics + analytics |
| Manager 1 | `manager1@clinicamz.co.mz` | Clínica Central only |
| Manager 2 | `manager2@clinicamz.co.mz` | Clínica Matola only |
| Manager 3 | `manager3@clinicamz.co.mz` | Clínica Beira only |

### Testing Different Roles
```bash
# Test Owner Dashboard (multi-clinic view)
POST /api/auth/login
{ "email": "owner@clinica.mz", "password": "admin123" }

# Then access: GET /api/analytics/owner-dashboard

# Test Manager Dashboard (single clinic)
POST /api/auth/login
{ "email": "manager1@clinicamz.co.mz", "password": "admin123" }

# Then access: GET /api/analytics/manager-dashboard

# Test Staff Dashboard (doctor view)
POST /api/auth/login
{ "email": "doctor1.clinic1@clinicamz.co.mz", "password": "admin123" }

# Then access: GET /api/analytics/staff-dashboard
```

## Testing Scenarios

### 1. Multi-Clinic Management (Owner)
```bash
# Login as owner
# View all clinics: GET /api/clinics
# Compare performance: GET /api/clinics/compare?startDate=2024-01-01
# View organization stats: GET /api/organizations/{orgId}/stats
```

### 2. Clinic Operations (Manager)
```bash
# Login as manager1
# View clinic details: GET /api/clinics/{clinicId}
# View today's appointments (filtered automatically)
# Check staff performance: GET /api/analytics/staff-performance/{clinicId}
```

### 3. Staff Workflow (Doctor)
```bash
# Login as doctor
# View personal schedule: GET /api/analytics/staff-dashboard
# Access patient records
# Create prescriptions
```

### 4. Subscription & Access Control
```bash
# Try accessing analytics without Pro plan (should fail)
# Try accessing other clinic's data as Manager (should fail)
# Try creating 6th clinic on Pro plan with max 5 (should fail)
```

## Verification Checklist

After seeding, verify:
- [ ] Server starts without errors
- [ ] All login credentials work
- [ ] Owner can see all 3 clinics
- [ ] Managers can only see their assigned clinic
- [ ] Analytics dashboards return data
- [ ] Appointments are visible with correct timestamps
- [ ] Room availability is tracked correctly
- [ ] Subscription status shows as "active"

## Cleanup

To reset the database and seed again:
```bash
npm run seed
# The seed script automatically clears all data before creating new data
```

## Troubleshooting

**Error: MongoDB connection failed**
- Ensure MongoDB is running
- Check MONGODB_URI in .env file

**Error: Duplicate key error**
- Run the seed script again (it clears old data automatically)

**Error: Cannot read property of undefined**
- Check that all models are properly imported
- Verify mongoose connection is established

## Next Steps

1. Start the backend: `npm run dev`
2. Test API endpoints using Postman or similar
3. Build frontend to visualize the multi-clinic platform
4. Implement remaining features (staff management UI, chat, etc.)
