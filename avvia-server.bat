@echo off
cd /d "%~dp0"
echo Avvio il server locale per la Compagnia connessa via QR...
echo (richiede Node.js installato: https://nodejs.org)
echo.
node server\server.js
pause
