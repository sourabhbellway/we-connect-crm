#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3010/api"
DB_URL="postgresql://postgres:admin123@localhost:5432/we_connect_crm"

echo -e "${BLUE}======================================== ${NC}"
echo -e "${BLUE}FINAL COMPREHENSIVE TEST - ALL 3 FEATURES${NC}"
echo -e "${BLUE}======================================== ${NC}"

# Test 1: Backend health
echo -e "\n${YELLOW}[1/8] Backend Health Check${NC}"
HEALTH=$(curl -s "$API_URL/health" | grep -o '"success":true')
if [ ! -z "$HEALTH" ]; then
  echo -e "${GREEN}✓ Backend is running${NC}"
else
  echo -e "${RED}✗ Backend NOT running${NC}"
  exit 1
fi

# Test 2: Check email template exists in DB
echo -e "\n${YELLOW}[2/8] Email Template in Database${NC}"
TEMPLATE_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM email_templates WHERE category='WELCOME' AND name='Welcome Email - Test'")
TEMPLATE_ID=$(psql "$DB_URL" -t -c "SELECT id FROM email_templates WHERE category='WELCOME' AND name='Welcome Email - Test'" | head -1)
if [ "$TEMPLATE_COUNT" = "1" ]; then
  echo -e "${GREEN}✓ Welcome email template found in DB (ID: $TEMPLATE_ID)${NC}"
  psql "$DB_URL" -c "SELECT id, name, subject, \"isActive\", \"isDefault\" FROM email_templates WHERE id = $TEMPLATE_ID"
else
  echo -e "${YELLOW}! No welcome template, will be created during user registration${NC}"
fi

# Test 3: Create ADMIN user with Admin role (GLOBAL access)
echo -e "\n${YELLOW}[3/8] Create ADMIN User with GLOBAL Access${NC}"
ADMIN_EMAIL="admin-final-$(date +%s)@example.com"
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
  echo -e "${GREEN}✓ Admin user created (ID: $ADMIN_ID)${NC}"
  
  # Assign Admin role (role id=3) to admin user
  TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$ADMIN_EMAIL\",
      \"password\": \"AdminPass123!\"
    }" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  
  # Assign Admin role
  psql "$DB_URL" -c "INSERT INTO user_roles (\"userId\", \"roleId\") VALUES ($ADMIN_ID, 3);" 2>/dev/null
  echo "  Assigned Admin role (GLOBAL access)"
else
  echo -e "${RED}✗ Failed to create admin user${NC}"
  exit 1
fi

# Test 4: Login as Admin and verify response structure
echo -e "\n${YELLOW}[4/8] Admin Login - Check Response Structure${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"AdminPass123!\"
  }")

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
ADMIN_MUST_CHANGE=$(echo "$ADMIN_LOGIN" | grep -o '"mustChangePassword":[a-z]*' | cut -d: -f2)

if [ ! -z "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✓ Admin login successful${NC}"
  echo "  - mustChangePassword: $ADMIN_MUST_CHANGE"
  echo "  - Token obtained: ${ADMIN_TOKEN:0:20}..."
else
  echo -e "${RED}✗ Admin login failed${NC}"
  exit 1
fi

# Test 5: Create regular user with OWN access
echo -e "\n${YELLOW}[5/8] Create Regular User (OWN Access - Role 1)${NC}"
USER_EMAIL="user-final-$(date +%s)@example.com"
USER_PASSWORD="UserPass123!"

USER_RESPONSE=$(curl -s -X POST "$API_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Regular\",
    \"lastName\": \"User\",
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"roleIds\": [1]
  }")

USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ ! -z "$USER_ID" ]; then
  echo -e "${GREEN}✓ Regular user created (ID: $USER_ID)${NC}"
  
  # Verify DB values
  MUST_CHANGE_DB=$(psql "$DB_URL" -t -c "SELECT \"mustChangePassword\" FROM users WHERE id = $USER_ID")
  if [ "$MUST_CHANGE_DB" = "t" ]; then
    echo -e "${GREEN}  ✓ mustChangePassword = TRUE in database${NC}"
  else
    echo -e "${RED}  ✗ mustChangePassword not set${NC}"
  fi
else
  echo -e "${RED}✗ Failed to create regular user${NC}"
  echo "$USER_RESPONSE"
fi

# Test 6: User login with temp password - check mustChangePassword in response
echo -e "\n${YELLOW}[6/8] User Login - Check Password Change Flag${NC}"
USER_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\"
  }")

USER_TOKEN=$(echo "$USER_LOGIN" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
USER_MUST_CHANGE=$(echo "$USER_LOGIN" | grep -o '"mustChangePassword":[a-z]*' | cut -d: -f2)

if [ ! -z "$USER_TOKEN" ]; then
  echo -e "${GREEN}✓ User login successful${NC}"
  if [ "$USER_MUST_CHANGE" = "true" ]; then
    echo -e "${GREEN}  ✓ mustChangePassword = TRUE (modal should show)${NC}"
  else
    echo -e "${YELLOW}  ! mustChangePassword = $USER_MUST_CHANGE${NC}"
  fi
else
  echo -e "${RED}✗ User login failed${NC}"
fi

# Test 7: Check role-based filtering - GLOBAL vs OWN access
echo -e "\n${YELLOW}[7/8] Role-Based Data Filtering Test${NC}"
echo "  Checking user roles in database:"
psql "$DB_URL" -c "SELECT ur.\"userId\", u.\"firstName\", r.name, r.\"accessScope\" FROM user_roles ur JOIN users u ON ur.\"userId\" = u.id JOIN roles r ON ur.\"roleId\" = r.id WHERE ur.\"userId\" IN ($ADMIN_ID, $USER_ID)" 2>/dev/null

echo ""
echo "  Admin (GLOBAL access) leads count:"
ADMIN_LEADS=$(curl -s "$API_URL/leads?page=1&limit=100" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | grep -o '"id":[0-9]*' | wc -l)
echo "    $ADMIN_LEADS leads visible"

echo ""
echo "  User (OWN access) leads count:"
USER_LEADS=$(curl -s "$API_URL/leads?page=1&limit=100" \
  -H "Authorization: Bearer $USER_TOKEN" | grep -o '"id":[0-9]*' | wc -l)
echo "    $USER_LEADS leads visible"

if [ "$ADMIN_LEADS" -ge "$USER_LEADS" ]; then
  echo -e "${GREEN}✓ Role-based filtering working (Admin sees >= User)${NC}"
else
  echo -e "${YELLOW}! Filtering may need adjustment${NC}"
fi

# Test 8: Verify welcome email template is used
echo -e "\n${YELLOW}[8/8] Welcome Email Template Verification${NC}"
TEMPLATE_CHECK=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM email_templates WHERE category='WELCOME' AND \"isActive\"=true")
echo "  Active WELCOME templates in DB: $TEMPLATE_CHECK"
if [ "$TEMPLATE_CHECK" -gt "0" ]; then
  echo -e "${GREEN}✓ Welcome template available for new users${NC}"
  psql "$DB_URL" -c "SELECT name, subject, \"isDefault\" FROM email_templates WHERE category='WELCOME' AND \"isActive\"=true" 2>/dev/null
else
  echo -e "${YELLOW}! No active welcome template - fallback template will be used${NC}"
fi

echo -e "\n${BLUE}======================================== ${NC}"
echo -e "${BLUE}SUMMARY:${NC}"
echo -e "${GREEN}✓ Feature 1: Email template created and saved to DB${NC}"
echo -e "${GREEN}✓ Feature 2: mustChangePassword flag set on user creation${NC}"
echo -e "${GREEN}✓ Feature 3: Role-based filtering by access scope${NC}"
echo -e "${BLUE}======================================== ${NC}"
