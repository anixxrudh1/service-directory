#!/bin/bash
set -e

echo "Starting Render build process..."
echo "Current directory: $(pwd)"
echo "Directory listing:"
ls -la

# Determine which service to build based on environment
if [ "$RENDER_SERVICE_TYPE" = "web" ]; then
    echo "Building backend service..."
    cd "servicedir-backend copy/servicedir-backend copy"
    pwd
    ls -la
    npm ci --omit=dev
    echo "Backend build complete"
elif [ "$RENDER_SERVICE_TYPE" = "static" ]; then
    echo "Building frontend service..."
    cd "service-directory copy/service-directory copy"
    pwd
    ls -la
    npm ci
    npm run build
    echo "Frontend build complete"
else
    echo "Building both services..."
    # Backend
    cd "servicedir-backend copy/servicedir-backend copy"
    npm ci --omit=dev
    cd ../..
    # Frontend
    cd "service-directory copy/service-directory copy"
    npm ci
    npm run build
    cd ../..
fi

echo "Build process complete!"
