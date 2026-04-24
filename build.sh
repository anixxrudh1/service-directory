#!/bin/bash

# Install and build backend
echo "Building backend..."
cd "servicedir-backend copy/servicedir-backend copy"
npm ci --omit=dev
cd ../..

# Install and build frontend
echo "Building frontend..."
cd "service-directory copy/service-directory copy"
npm ci
npm run build
cd ../..

echo "Build completed successfully!"
