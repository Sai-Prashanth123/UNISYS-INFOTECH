#!/bin/bash
# Docker Build Script for UNISYS INFOTECH Backend (Bash)

echo "Building Docker image for UNISYS INFOTECH Backend..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    exit 1
fi

# Build the image
docker build -t unisys-backend:latest .

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Docker image built successfully!"
    echo ""
    echo "To run the container, use one of the following:"
    echo "  docker-compose up -d"
    echo "  OR"
    echo "  docker run -d -p 5001:5001 -e SUPABASE_URL=... -e JWT_SECRET=... unisys-backend:latest"
    echo ""
    echo "See DOCKER_README.md for more information."
else
    echo ""
    echo "✗ Docker build failed. Check the errors above."
    exit 1
fi






