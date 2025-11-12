#!/bin/bash

# Deployment Verification Script
# Run this after deployment to verify everything is working

echo "🔍 Verifying Scravo Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URLs are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "${RED}Usage: ./verify-deployment.sh <backend-url> <frontend-url>${NC}"
    echo "Example: ./verify-deployment.sh https://scravo-backend.onrender.com https://scravo.vercel.app"
    exit 1
fi

BACKEND_URL=$1
FRONTEND_URL=$2

echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test 1: Backend Health Check
echo "1️⃣  Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "${GREEN}✅ Backend is healthy (HTTP $HEALTH_RESPONSE)${NC}"
else
    echo "${RED}❌ Backend health check failed (HTTP $HEALTH_RESPONSE)${NC}"
fi
echo ""

# Test 2: Backend API Test Endpoint
echo "2️⃣  Testing Backend API..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/test")
if [ "$API_RESPONSE" = "200" ]; then
    echo "${GREEN}✅ Backend API is working (HTTP $API_RESPONSE)${NC}"
else
    echo "${RED}❌ Backend API test failed (HTTP $API_RESPONSE)${NC}"
fi
echo ""

# Test 3: Frontend Accessibility
echo "3️⃣  Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "${GREEN}✅ Frontend is accessible (HTTP $FRONTEND_RESPONSE)${NC}"
else
    echo "${RED}❌ Frontend test failed (HTTP $FRONTEND_RESPONSE)${NC}"
fi
echo ""

# Test 4: Check Admin Exists Endpoint
echo "4️⃣  Testing Auth Endpoints..."
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/check-admin")
if [ "$AUTH_RESPONSE" = "200" ]; then
    echo "${GREEN}✅ Auth endpoints working (HTTP $AUTH_RESPONSE)${NC}"
else
    echo "${RED}❌ Auth endpoints failed (HTTP $AUTH_RESPONSE)${NC}"
fi
echo ""

# Test 5: Check Marketplace Endpoint
echo "5️⃣  Testing Marketplace Endpoints..."
LISTINGS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/listings/marketplace")
if [ "$LISTINGS_RESPONSE" = "200" ] || [ "$LISTINGS_RESPONSE" = "401" ]; then
    echo "${GREEN}✅ Marketplace endpoints accessible (HTTP $LISTINGS_RESPONSE)${NC}"
else
    echo "${RED}❌ Marketplace endpoints failed (HTTP $LISTINGS_RESPONSE)${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment Verification Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Visit $FRONTEND_URL"
echo "   2. Register a new user account"
echo "   3. Test creating a listing"
echo "   4. Test placing an order"
echo ""
echo "🔧 If any tests failed:"
echo "   - Check Render/Vercel logs"
echo "   - Verify environment variables"
echo "   - Check MongoDB Atlas connection"
echo "   - Verify CORS settings"
