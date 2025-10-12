@echo off
echo Iniciando ngrok para Angular...
echo.
echo Asegurate de que:
echo 1. Angular este corriendo en puerto 4200
echo 2. Hayas configurado tu authtoken de ngrok
echo.
echo Presiona cualquier tecla para continuar...
pause
echo.
echo Iniciando ngrok...
ngrok http 4200
