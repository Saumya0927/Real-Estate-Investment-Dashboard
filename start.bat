@echo off
echo Starting Real Estate Investment Dashboard...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Check if backend node_modules exists
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo Please update .env file with your configuration
)

echo.
echo Setup complete! Starting services...
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001
echo Lambda Functions: http://localhost:3002
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start all services
npx concurrently ^
    --names "FRONTEND,BACKEND,LAMBDA" ^
    --prefix-colors "blue,green,yellow" ^
    "npm run dev" ^
    "cd backend && npm run dev" ^
    "cd lambda && python local_server.py"