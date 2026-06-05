@echo off
title CLC-UFA — перезапуск сервера
color 0A

echo.
echo  [1/3] Останавливаем процесс на порту 3000...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%p /F >nul 2>&1
    echo        Убит PID %%p
)

echo  [2/3] Чистим кэш .next...
if exist ".next" (
    rmdir /s /q ".next"
    echo        Кэш удалён
) else (
    echo        Кэш уже чистый
)

echo  [3/3] Запускаем сервер...
echo.
echo  http://localhost:3000
echo  ----------------------------------------
npm run dev
