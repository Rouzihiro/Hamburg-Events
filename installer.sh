#!/bin/bash
set -e

echo "🔧 Installing Node.js and npm..."
sudo dnf install -y nodejs npm

# echo "📦 Installing required system dependencies for Chromium..."
# sudo dnf install -y \
#   libXcomposite libXcursor libXdamage libXext libXi \
#   libXrandr libXScrnSaver libXtst alsa-lib atk at-spi2-atk \
#   at-spi2-core cups-libs gtk3 libdrm libxshmfence nss \
#   libgbm pango xdg-utils
#
echo "📦 Installing Playwright..."
npm install playwright

echo "🌐 Downloading Chromium via Playwright..."
npx playwright install chromium

echo "✅ All done. You can now run your script with: node screenshot.js"

