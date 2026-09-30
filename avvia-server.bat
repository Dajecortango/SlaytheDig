@echo off
cd /d "%~dp0"

echo ============================================
echo   Slay the Dig - Compagnia connessa via QR
echo ============================================
echo (richiede Node.js installato: https://nodejs.org)
echo.
echo Avvio il server locale...

start "SlayTheDigServer" /min node server\server.js

REM Aspetta che il server sia pronto prima di aprire la finestra di gioco
timeout /t 2 /nobreak >nul

REM Cerca Edge o Chrome nei percorsi di installazione piu' comuni
set "BROWSER_EXE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if not defined BROWSER_EXE (
    echo Non trovo Edge o Chrome nei percorsi di installazione consueti.
    echo Apri manualmente il browser su http://localhost:8787/index.html
    echo Questa finestra resta aperta finche' non la chiudi: il server si ferma alla chiusura.
    pause
    goto :stop
)

echo Apro il gioco in una finestra dedicata, senza barra degli indirizzi...
REM Un profilo dedicato (invece di quello normale del browser) serve a essere sicuri che si apra
REM un processo NUOVO anche se il browser e' gia' aperto altrove: solo cosi' "start /wait" aspetta
REM davvero la chiusura di QUESTA finestra invece di tornare subito (il browser normale userebbe
REM l'istanza gia' in esecuzione e il comando finirebbe all'istante).
start "" /wait "%BROWSER_EXE%" --app=http://localhost:8787/index.html --user-data-dir="%~dp0tools\browser-profile" --start-maximized

:stop
echo.
echo Finestra di gioco chiusa: fermo il tunnel ngrok (se attivo) e il server...
curl -s -X POST http://localhost:8787/api/ngrok/stop >nul 2>nul
taskkill /f /fi "WINDOWTITLE eq SlayTheDigServer*" >nul 2>nul
echo Fatto.
