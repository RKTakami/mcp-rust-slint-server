@echo off
echo ========================================
echo MCP Rust/Slint Server - GitHub Push
echo ========================================

echo.
echo Step 1: Creating GitHub repository...
echo 1. Go to https://github.com/new
echo 2. Repository name: mcp-rust-slint-server
echo 3. Description: Model Context Protocol server for Rust ecosystem and Slint UI framework development
echo 4. Do NOT initialize with README, .gitignore, or license
echo 5. Choose Public or Private
echo 6. Click 'Create repository'
echo.
echo IMPORTANT: Do this first before continuing!
echo.
pause

echo.
echo Step 2: Pushing code to GitHub...
cd /d "%~dp0"

echo Setting up main branch...
git branch -M main

echo.
echo Adding remote origin...
git remote add origin https://github.com/RKTakami/mcp-rust-slint-server.git

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Repository should now be available at:
echo https://github.com/RKTakami/mcp-rust-slint-server
echo ========================================
echo.
pause