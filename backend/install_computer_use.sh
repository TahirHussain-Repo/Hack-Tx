#!/bin/bash

echo "=========================================="
echo "Installing Computer Use Dependencies"
echo "=========================================="
echo ""

echo "Step 1: Installing Python packages..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python packages"
    exit 1
fi
echo ""

echo "Step 2: Installing Playwright browsers..."
python -m playwright install chromium
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Playwright browsers"
    exit 1
fi
echo ""

echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Make sure your .env file has GEMINI_API_KEY set"
echo "2. Run: python server.py"
echo ""

