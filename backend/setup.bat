@echo off
echo Creating .env file for backend...
(
echo NODE_ENV=development
echo PORT=5000
echo MONGODB_URI=mongodb://localhost:27017/clinicadigital
echo JWT_SECRET=clinica-digital-secret-key-2024-secure
echo JWT_REFRESH_SECRET=clinica-digital-refresh-secret-key-2024-secure
) > .env

echo .env file created successfully!
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Run: npm run dev
