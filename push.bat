@echo off
cd /d D:\clc-ufa3

echo Введите комментарий к изменениям:
set /p msg="> "

git add .
git commit -m "%msg%"
git push

echo.
echo Готово! Сайт обновится через 2-3 минуты.
pause
