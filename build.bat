@echo off
REM Install backend dependencies
echo Installing backend dependencies...
cd "servicedir-backend copy\servicedir-backend copy"
call npm install
cd ..\..

REM Install frontend dependencies and build
echo Installing frontend dependencies...
cd "service-directory copy\service-directory copy"
call npm install
call npm run build
cd ..\..

echo Build completed successfully!
