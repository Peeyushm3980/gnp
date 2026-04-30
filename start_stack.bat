@echo off
:: Redirecting all output to a log file since there is no visible console
exec > D:\gnp\process_log.txt 2>&1

:: 1. RUN FRONTEND (Using 'start /b' to run in background of this script)
echo [%date% %time%] Launching Frontend...
cd /d D:\gnp\gnp-erp
start /b "" npm run dev

:: 2. RUN NGROK
echo [%date% %time%] Launching Ngrok...
start /b "" "D:\ngrok-v3-stable-windows-amd64\ngrok.exe" http 8000

:: 3. RUN BACKEND (This stays in the foreground of the script)
echo [%date% %time%] Launching Backend...
cd /d D:\gnp\gnp-backend
call .\venv\Scripts\activate
set PYTHONPATH=%CD%\src
cd src
uvicorn main:app --host 0.0.0.0 --port 8000