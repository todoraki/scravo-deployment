#!/bin/bash

# Scravo Backend Deployment Script for Render
# This script is executed by Render during deployment

echo "🚀 Starting Scravo Backend Deployment..."

# Navigate to backend directory
cd backend

echo "📦 Installing dependencies..."
npm ci --only=production

echo "✅ Backend deployment preparation complete!"
echo "🎯 Starting server with: npm start"
