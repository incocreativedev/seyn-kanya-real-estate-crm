#!/bin/bash

# Convert SVG icons to PNG format for PWA compatibility
# This script requires imagemagick to be installed
# Install with: brew install imagemagick (macOS) or apt-get install imagemagick (Ubuntu)

echo "Converting SVG icons to PNG format..."

# Create images directory if it doesn't exist
mkdir -p images

# Check if imagemagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu: sudo apt-get install imagemagick"
    echo "  Or use an online SVG to PNG converter"
    exit 1
fi

# Convert app icons
for size in 16 32 48 72 96 144 192 256 384 512; do
    if [ -f "images/icon-${size}.svg" ]; then
        echo "Converting icon-${size}.svg to PNG..."
        convert "images/icon-${size}.svg" "images/icon-${size}.png"
    else
        echo "⚠️  Warning: icon-${size}.svg not found"
    fi
done

# Convert shortcut icons
echo "Converting shortcut icons..."
for icon in "shortcut-add-client" "shortcut-add-property"; do
    if [ -f "images/${icon}.svg" ]; then
        convert "images/${icon}.svg" "images/${icon}.png"
        echo "Converted ${icon}.svg to PNG"
    fi
done

# Convert screenshots (these should be replaced with actual screenshots)
echo "Converting screenshot placeholders..."
for screenshot in "screenshot-wide" "screenshot-narrow"; do
    if [ -f "images/${screenshot}.svg" ]; then
        convert "images/${screenshot}.svg" "images/${screenshot}.png"
        echo "Converted ${screenshot}.svg to PNG"
    fi
done

echo "✅ Icon conversion completed!"
echo ""
echo "📝 Next steps:"
echo "1. Replace screenshot placeholders with actual app screenshots"
echo "2. Test PWA installation on mobile devices"
echo "3. Deploy to Netlify with environment variables configured"
echo ""
echo "🔧 Manual conversion (if ImageMagick not available):"
echo "   Use online converters like:"
echo "   - https://convertio.co/svg-png/"
echo "   - https://cloudconvert.com/svg-to-png"
echo "   - https://www.zamzar.com/convert/svg-to-png/"