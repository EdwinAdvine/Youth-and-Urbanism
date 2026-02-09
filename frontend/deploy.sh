#!/bin/bash

# Define paths (adjust if your web root or build output dir differs)
REPO_DIR="/www/wwwroot/urbanhomeschoolrepo.co.ke/frontend"  # Where your code lives—updated based on your paths
BUILD_DIR="$REPO_DIR/dist"  # Vite build output
WEB_ROOT="/www/wwwroot/urbanhomeschool.co.ke"  # Your actual domain's public root

# Function for error handling
handle_error() {
    echo "Error: $1" >&2
    exit 1
}

# Ensure we're in the repo directory
cd "$REPO_DIR" || handle_error "Failed to cd into $REPO_DIR"

# Install dependencies
echo "Installing dependencies..."
npm install || handle_error "npm install failed"

# Build the React app
echo "Building the app..."
npm run build || handle_error "npm run build failed"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    handle_error "Build directory $BUILD_DIR does not exist after build"
fi

# Copy build files to web root (use rsync for efficiency and to avoid overwriting configs if needed)
echo "Deploying to web root..."
rsync -av --delete --exclude='.user.ini' --exclude='.htaccess' --exclude='.well-known' "$BUILD_DIR/" "$WEB_ROOT/" || handle_error "Failed to copy build to $WEB_ROOT"

echo "Deployment complete!"