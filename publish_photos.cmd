@echo off
cd /d "%~dp0"
python publish_photos.py
if errorlevel 1 pause
