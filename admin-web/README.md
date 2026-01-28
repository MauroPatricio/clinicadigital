# Clínica Digital - Admin Web Panel

React-based admin panel for managing the Clínica Digital system.

## Features

- ✅ Modern UI with Tailwind CSS
- ✅ Authentication with JWT
- ✅ Protected routes with role-based access
- ✅ Responsive design
- ✅ Toast notifications
- 🚧 Dashboard with real-time statistics
- 🚧 Patient management
- 🚧 Appointment management
- 🚧 Doctor management
- 🚧 Billing & reports

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Charts for dashboard
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Backend API running on http://localhost:5000

### Installation

```bash
cd admin-web
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

## Project Structure

```
admin-web/
├── src/
│   ├── components/          # Reusable components
│   ├── context/             # React contexts
│   ├── layouts/             # Layout components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

## Demo Credentials

```
Email: admin@ clinica.com
Password: admin123
```

(Create this user in the backend first)

## Next Steps

- [ ] Complete dashboard with statistics
- [ ] Add patient management interface
- [ ] Add appointment calendar
- [ ] Add billing interface
- [ ] Add charts and analytics
- [ ] Add real-time updates with Socket.IO

## License

MIT
