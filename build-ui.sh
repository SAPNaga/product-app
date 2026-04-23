#!/bin/bash
set -e

echo "Building Vue UI..."
cd app/ui
rm -rf dist
npm install
npm run build
cd ../..

echo "Copying Vue dist to approuter..."
rm -rf app/router/resources
mkdir -p app/router/resources
cp -r app/ui/dist/* app/router/resources/

echo "Creating productui.zip from dist/ (for HTML5 repo)..."
cd app/ui/dist
rm -f ../../../productui.zip
zip -r ../../../productui.zip . -x "*.DS_Store"
cd ../../..

echo "Preparing resources folder..."
mkdir -p resources
mv productui.zip resources/productui.zip

echo "Done!"
ls -la resources/
ls -la app/router/resources/