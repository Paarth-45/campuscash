@echo off
REM ==============================================================================
REM CampusCash - Self-Signed SSL Certificate Generator (Windows)
REM Creates a development/staging SSL certificate for HTTPS testing
REM ==============================================================================

set SSL_DIR=%~dp0..\ssl
if not exist "%SSL_DIR%" mkdir "%SSL_DIR%"

echo Generating self-signed SSL certificate in %SSL_DIR%...

openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
  -keyout "%SSL_DIR%\privkey.pem" ^
  -out "%SSL_DIR%\fullchain.pem" ^
  -subj "/C=IN/ST=Karnataka/L=Bengaluru/O=CampusCash/OU=Dev/CN=localhost"

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Self-signed SSL certificates successfully generated:
    echo   - Key:  %SSL_DIR%\privkey.pem
    echo   - Cert: %SSL_DIR%\fullchain.pem
    echo You can now mount ./ssl:/etc/nginx/ssl in docker-compose.prod.yml
) else (
    echo [ERROR] OpenSSL command failed. Please ensure OpenSSL is installed and available in PATH.
)
pause
