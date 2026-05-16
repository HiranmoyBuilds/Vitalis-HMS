@echo off
title Vitalis HMS Auto-Starter
echo Starting Vitalis Hospital Management System...

:: Start Backend
start /min cmd /c "cd /d c:\Users\lenovo\OneDrive\Desktop\HMS AntiG\backend && node server.js"

:: Start Frontend
start /min cmd /c "cd /d c:\Users\lenovo\OneDrive\Desktop\HMS AntiG\frontend && npm run dev"

echo System is running in the background.
echo Opening browser...
timeout /t 5
start http://localhost:5173
exit
