#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3010/api"
DB_URL="postgresql://postgres:admin123@localhost:5432/we_connect_crm"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}WECONNECT CRM - FULL FLOW TEST${NC}"
echo -e "${BLUE}========================================${NC}"

# Test 1: Check backend health
echo -e "\n${YELLOW}Test 1: Backend Health Check${NC}"
HEALTH=$(curl -s "$API_URL/health" | grep -o '"success":true')
if [ ! -z "$HEALTH" ]; then
  echo -e "${GREEN}✓ Backend is running${NC}"
else
  echo -e "${RED}✗ Backend is NOT running${NC}"
  exit 1
fi

# Test 2: Create test admin user
echo -e "\n${YELLOW}Test 2: Create Admin User${NC}"
ADMIN_EMAIL="admin-test-$(date +%s)@example.com"
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Admin\",
    \"lastName\": \"User\",
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"AdminPass123!\",
    \"companyName\": \"Test Company\"
  }")

ADMIN_ID=$(echo "$ADMIN_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ ! -z "$ADMIN_ID" ]; then
  echo -e "${GREEN}✓ Admin created with ID: $ADMIN_ID${NC}"
else
  echo -e "${RED}✗ Failed to create admin${NC}"
  echo "$ADMIN_RESPONSE"
  exit 1
fi

# Test 3: Login to get token
echo -e "\n${YELLOW}Test 3: Login and Get Token${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"AdminPass123!\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful, token obtained${NC}"
else
  echo -e "${RED}✗ Failed to login${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

# Test 4: Create welcome email template
echo -e "\n${YELLOW}Test 4: Create Welcome Email Template${NC}"
TEMPLATE_RESPONSE=$(curl -s -X POST "$API_URL/business-settings/email-templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Email - Test",
    "category": "WELCOME",
    "type": "EMAIL",
    "subject": "Welcome to WeConnect CRM, {{firstName}}!",
    "htmlContent": "<h1>Welcome {{firstName}}!</h1><p>Your temporary password is: <strong>{{tempPassword}}</strong></p>",
    "textContent": "Welcome {{firstName}}. Your temporary password is: {{tempPassword}}",
    "variables": ["firstName", "tempPassword"],
    "isActive": true,
    "isDefault": true,
    "status": "ACTIVE"
  }')

TEMPLATE_ID=$(echo "$TEMPLATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
TEMPLATE_SUCCESS=$(echo "$TEMPLATE_RESPONSE" | grep -o '"success":true')

if [ ! -z "$TEMPLATE_SUCCESS" ] && [ ! -z "$TEMPLATE_ID" ]; then
  echo -e "${GREEN}✓ Welcome email template created with ID: $TEMPLATE_ID${NC}"
else
  echo -e "${RED}✗ Failed to create email template${NC}"
  echo "$TEMPLATE_RESPONSE"
fi

# Test 5: Verify template in database
echo -e "\n${YELLOW}Test 5: Verify Email Template in Database${NC}"
DB_TEMPLATE=$(psql "$DB_URL" -c "SELECT id, name, category FROM email_templates WHERE name = 'Welcome Email - Test';" 2>&1 | tail -1)
if [ ! -z "$DB_TEMPLATE" ] && [ "$DB_TEMPLATE" != "(0 rows)" ]; then
  echo -e "${GREEN}✓ Email template found in database${NC}"
  echo "  Data: $DB_TEMPLATE"
else
  echo -e "${RED}✗ Email template NOT in database${NC}"
fi

# Test 6: Create regular user
echo -e "\n${YELLOW}Test 6: Create Regular User (with temp password)${NC}"
USER_EMAIL="user-test-$(date +%s)@example.com"
TEMP_PASSWORD="TempPass123!"

# Simulate user creation by admin - this should set mustChangePassword=true
USER_RESPONSE=$(curl -s -X POST "$API_URL/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Regular\",
    \"lastName\": \"User\",
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$TEMP_PASSWORD\",
    \"roleIds\": [2]
  }")

USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ ! -z "$USER_ID" ]; then
  echo -e "${GREEN}✓ Regular user created with ID: $USER_ID${NC}"
else
  echo -e "${RED}✗ Failed to create regular user${NC}"
  echo "$USER_RESPONSE"
fi

# Test 7: Check if user has mustChangePassword set to true
echo -e "\n${YELLOW}Test 7: Check mustChangePassword in Database${NC}"
if [ ! -z "$USER_ID" ]; then
  DB_MUST_CHANGE=$(psql "$DB_URL" -c "SELECT \"mustChangePassword\" FROM users WHERE id = $USER_ID;" 2>&1 | tail -1)
  echo "  mustChangePassword value: $DB_MUST_CHANGE"
  if [ "$DB_MUST_CHANGE" == "t" ] || [ "$DB_MUST_CHANGE" == "true" ]; then
    echo -e "${GREEN}✓ mustChangePassword is TRUE${NC}"
  else
    echo -e "${YELLOW}! mustChangePassword is FALSE (may need to be set on creation)${NC}"
  fi
fi

# Test 8: Login with regular user and check response
echo -e "\n${YELLOW}Test 8: Login with Regular User and Check Response${NC}"
if [ ! -z "$USER_ID" ]; then
  USER_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$USER_EMAIL\",
      \"password\": \"$TEMP_PASSWORD\"
    }")
  
  MUST_CHANGE_FLAG=$(echo "$USER_LOGIN_RESPONSE" | grep -o '"mustChangePassword":[a-z]*')
  USER_TOKEN=$(echo "$USER_LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  
  if [ ! -z "$MUST_CHANGE_FLAG" ]; then
    echo -e "${GREEN}✓ Login response contains mustChangePassword field${NC}"
    echo "  Value: $MUST_CHANGE_FLAG"
  else
    echo -e "${YELLOW}! mustChangePassword field not in login response${NC}"
  fi
fi

# Test 9: Check role-based filtering
echo -e "\n${YELLOW}Test 9: Check Roles in Database${NC}"
ADMIN_ROLES=$(psql "$DB_URL" -c "SELECT r.name, r.\"accessScope\" FROM user_roles ur JOIN roles r ON ur.\"roleId\" = r.id WHERE ur.\"userId\" = $ADMIN_ID;" 2>&1)
echo "Admin Roles:"
echo "$ADMIN_ROLES" | tail -3

if [ ! -z "$USER_ID" ]; then
  USER_ROLES=$(psql "$DB_URL" -c "SELECT r.name, r.\"accessScope\" FROM user_roles ur JOIN roles r ON ur.\"roleId\" = r.id WHERE ur.\"userId\" = $USER_ID;" 2>&1)
  echo "Regular User Roles:"
  echo "$USER_ROLES" | tail -3
fi

# Test 10: Test leads filtering
echo -e "\n${YELLOW}Test 10: Test Leads Data Filtering${NC}"
if [ ! -z "$ADMIN_ID" ]; then
  ADMIN_LEADS=$(curl -s "$API_URL/leads?page=1&limit=5" \
    -H "Authorization: Bearer $TOKEN" | grep -o '"id":[0-9]*' | wc -l)
  echo "  Admin can see: $ADMIN_LEADS leads"
fi

if [ ! -z "$USER_ID" ] && [ ! -z "$USER_TOKEN" ]; then
  USER_LEADS=$(curl -s "$API_URL/leads?page=1&limit=5" \
    -H "Authorization: Bearer $USER_TOKEN" | grep -o '"id":[0-9]*' | wc -l)
  echo "  Regular user can see: $USER_LEADS leads"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}TEST COMPLETE${NC}"
echo -e "${BLUE}========================================${NC}"
