#!/bin/bash
# Quick resign and install script for Basketball Tracker
# Run this every 7 days (or when you see "untrusted developer" error)

set -e

echo "🏀 Basketball Tracker - Re-sign and Install"
echo "==========================================="
echo ""

# Build the app
echo "📦 Building app..."
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -destination 'id=00008150-001971942EC0401C' \
  -allowProvisioningUpdates \
  build \
  | grep -E "Build succeeded|error:" || true

echo ""
echo "📱 Installing on iPhone..."
xcrun devicectl device install app \
  --device 00008150-001971942EC0401C \
  /Users/brandontaylor/Library/Developer/Xcode/DerivedData/App-blfukttgiafqckbymjvwrgetxwxn/Build/Products/Debug-iphoneos/App.app

echo ""
echo "✅ Done! App re-signed and installed."
echo "⏰ Next resign needed in ~7 days"
