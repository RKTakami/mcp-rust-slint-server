@echo off
echo ========================================
echo Creating GitHub Repository and Pushing
echo ========================================

echo.
echo Step 1: Open this link in your browser to create the repository:
echo https://github.com/new
echo.
echo Fill in:
echo - Repository name: mcp-rust-slint-server
echo - Description: Model Context Protocol server for Rust ecosystem and Slint UI framework development
echo - Do NOT initialize with README, .gitignore, or license
echo - Choose Public
echo - Click "Create repository"
echo.
echo IMPORTANT: Complete this step before continuing!
echo.
pause

echo.
echo Step 2: After creating repository, pushing code...
cd /d "%~dp0"

echo.
echo Setting branch to main and pushing...
git branch -M main
echo Adding remote origin...
git remote add origin https://github.com/RKTakami/mcp-rust-slint-server.git 2>nul || echo Remote already exists
echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo SUCCESS! Repository is now live at:
echo https://github.com/RKTakami/mcp-rust-slint-server
echo ========================================
echo.
pause