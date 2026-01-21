#!/usr/bin/env node

/**
 * Lead Validation Debug Script
 * 
 * This script tests the lead validation endpoint to identify why
 * lead submission is failing with validation errors.
 * 
 * Usage:
 *   node TEST_LEAD_VALIDATION.js
 * 
 * Requirements:
 *   - API must be running on localhost:3010
 *   - User must be authenticated (provide token below)
 */

const http = require('http');

// CONFIGURATION - Update these values
const API_BASE_URL = 'http://localhost:3010';
const AUTH_TOKEN = ''; // Provide your JWT token here

// Test data - modify as needed to test different scenarios
const testLeadData = {
  firstName: "Test",
  lastName: "Lead",
  email: "test@example.com",
  phone: "+971501234567",
  company: "Test Company",
  status: "new",
  priority: "medium",
};

// Make HTTP request
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (AUTH_TOKEN) {
      options.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runValidationTest() {
  console.log('\n========================================');
  console.log('🔍 LEAD VALIDATION DEBUG TEST');
  console.log('========================================\n');

  // Test 1: Check if API is running
  console.log('1️⃣  Testing API connectivity...');
  try {
    const healthCheck = await makeRequest('GET', '/api/leads/stats');
    console.log('   ✅ API is running');
    console.log('   Response:', JSON.stringify(healthCheck.data, null, 2));
  } catch (error) {
    console.log('   ❌ API is not running or not accessible');
    console.log('   Error:', error.message);
    console.log('\n💡 Start the API server first:');
    console.log('   cd api && npm run start:dev\n');
    process.exit(1);
  }

  // Test 2: Test validation endpoint
  console.log('\n2️⃣  Testing validation endpoint...');
  console.log('   Sending test data:', JSON.stringify(testLeadData, null, 2));
  
  try {
    const validationResult = await makeRequest('POST', '/api/leads/debug/validate', testLeadData);
    console.log('\n   📊 VALIDATION RESULT:');
    console.log('   Status:', validationResult.status);
    console.log('   Response:', JSON.stringify(validationResult.data, null, 2));
    
    if (validationResult.data.success) {
      console.log('\n   ✅ Validation PASSED - No errors found');
    } else {
      console.log('\n   ❌ Validation FAILED');
      console.log('   Errors:', validationResult.data.errors);
      console.log('\n💡 To fix these errors:');
      console.log('   1. Check the field configurations in the database');
      console.log('   2. Update the field to meet the validation requirements');
      console.log('   3. Or mark the field as not required in field configs');
    }
  } catch (error) {
    console.log('   ❌ Validation test failed');
    console.log('   Error:', error.message);
  }

  // Test 3: Try actual lead creation (if no errors)
  console.log('\n3️⃣  Testing actual lead creation...');
  console.log('   This will attempt to create a real lead with the test data.\n');
  
  try {
    const createResult = await makeRequest('POST', '/api/leads', testLeadData);
    console.log('   📊 CREATE RESULT:');
    console.log('   Status:', createResult.status);
    console.log('   Response:', JSON.stringify(createResult.data, null, 2));
    
    if (createResult.data.success) {
      console.log('\n   ✅ Lead created successfully!');
      console.log('   Lead ID:', createResult.data.data?.id);
    } else {
      console.log('\n   ❌ Lead creation failed');
      console.log('   Errors:', createResult.data.errors || createResult.data.message);
    }
  } catch (error) {
    console.log('   ❌ Create test failed');
    console.log('   Error:', error.message);
  }

  console.log('\n========================================');
  console.log('📋 TROUBLESHOOTING GUIDE');
  console.log('========================================');
  console.log(`
Common causes of validation failures:

1. MISSING FIELD CONFIGURATIONS
   - Check if field configs exist in database:
     SELECT * FROM "FieldConfig" WHERE "entityType" = 'lead';
   - If empty, validation is skipped automatically

2. REQUIRED FIELDS WITHOUT VALUES
   - Check which fields are marked as required:
     SELECT * FROM "FieldConfig" 
     WHERE "entityType" = 'lead' AND "isRequired" = true;

3. INVALID FIELD VALUES
   - Email must match pattern: ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$
   - Phone must have 7-15 digits
   - Numbers must be within min/max bounds

4. CHECK SERVER LOGS
   - Run API with: cd api && npm run start:dev
   - Look for validation output in the console

5. FRONTEND DEBUGGING
   - Open browser console (F12)
   - Submit the form again
   - Look for "🔍 LEAD SUBMISSION ERROR DEBUG" log
`);
  console.log('========================================\n');
}

// Run the test
runValidationTest().catch(console.error);

