@echo off
echo ========================================
echo Admin Dashboard - Vercel Deployment
echo ========================================
echo.

echo Checking Vercel CLI...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
)

echo.
echo Starting deployment...
echo.

vercel --prod

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set environment variables in Vercel Dashboard
echo 2. Test the deployed site
echo 3. Configure custom domain (optional)
echo.
pause
