@echo off
echo ========================================
echo  Demarrage Backend - Gestion de Stages
echo ========================================
echo.

echo [1/3] Demarrage du serveur Laravel...
start "Laravel Server" cmd /k "php artisan serve"
timeout /t 2 >nul

echo [2/3] Demarrage Laravel Reverb (WebSocket)...
start "Laravel Reverb" cmd /k "php artisan reverb:start"
timeout /t 2 >nul

echo [3/3] Ouverture du navigateur...
timeout /t 3 >nul
start http://localhost:8000

echo.
echo ========================================
echo  Backend demarre avec succes!
echo ========================================
echo  - API: http://localhost:8000/api
echo  - Reverb: ws://localhost:8080
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause >nul
