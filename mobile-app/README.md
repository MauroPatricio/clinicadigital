# Clínica Digital - Mobile App

React Native mobile application for patients and doctors built with Expo.

## Features

- ✅ Authentication with biometric support
- ✅ Home dashboard
- ✅ Appointments list and management
- ✅ Appointment booking wizard (3 steps)
- ✅ Medical records viewer
- ✅ Profile management
- ✅ Video consultations (Agora SDK)
- ✅ Payment processing (M-Pesa & Cards)
- ✅ Push notifications (Expo Notifications)

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- Redux Toolkit
- React Native Paper (UI)
- Axios for API calls
- Socket.IO for real-time features

## Getting Started

### Prerequisites

- Node.js 16+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
cd mobile-app
npm install
```

### Development

```bash
# Start Expo
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── api/              # API services
├── components/       # Reusable components
├── screens/          # App screens
├── navigation/       # Navigation config
├── store/            # Redux store
└── services/         # Business logic
```

## Environment

Update API URL in `src/services/api.ts` for your environment:
- Development: `http://localhost:5000/api`
- Production: Your production API URL

## Next Steps

- [x] Authentication
- [x] Navigation
- [ ] Appointments screen
- [ ] Medical records
- [ ] Telemedicine
- [ ] Payments
- [ ] Notifications

## License

MIT
