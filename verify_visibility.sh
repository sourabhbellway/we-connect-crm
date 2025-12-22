#!/bin/bash

# Login as Admin and store token
ADMIN_RES=$(curl -s -X POST http://localhost:3010/api/auth/login -H "Content-Type: application/json" -d '{"email": "admin@weconnect.com", "password": "admin123"}')
ADMIN_TOKEN=$(echo $ADMIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f3)

# Login as Test User and store token
USER_RES=$(curl -s -X POST http://localhost:3010/api/auth/login -H "Content-Type: application/json" -d '{"email": "test@weconnect.com", "password": "test123"}')
USER_TOKEN=$(echo $USER_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f3)

echo "Admin Token: ${ADMIN_TOKEN:0:10}..."
echo "User Token: ${USER_TOKEN:0:10}..."

if [ -z "$ADMIN_TOKEN" ] || [ -z "$USER_TOKEN" ]; then
  echo "Failed to get tokens"
  exit 1
fi

# 1. Create Lead as Admin
echo "Creating Lead as Admin..."
LEAD_RES=$(curl -s -X POST http://localhost:3010/api/leads \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Admin", "lastName": "Lead", "email": "admin.lead@example.com", "status": "NEW"}')
LEAD_ID=$(echo $LEAD_RES | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo "Created Admin Lead ID: $LEAD_ID"

# 2. Try to access Admin Lead as Test User (Should fail)
echo "Accessing Admin Lead ($LEAD_ID) as Test User:"
ACCESS_RES=$(curl -s -X GET http://localhost:3010/api/leads/$LEAD_ID \
  -H "Authorization: Bearer $USER_TOKEN")
echo "Response: $ACCESS_RES"

# 3. Create Lead as Test User
echo "Creating Lead as Test User..."
USER_LEAD_RES=$(curl -s -X POST http://localhost:3010/api/leads \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "User", "lastName": "Lead", "email": "user.lead@example.com", "status": "NEW"}')
USER_LEAD_ID=$(echo $USER_LEAD_RES | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo "Created User Lead ID: $USER_LEAD_ID"

# 4. Try to access User Lead as Admin (Should succeed)
echo "Accessing User Lead ($USER_LEAD_ID) as Admin:"
ADMIN_ACCESS_RES=$(curl -s -X GET http://localhost:3010/api/leads/$USER_LEAD_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Response: $ADMIN_ACCESS_RES"
