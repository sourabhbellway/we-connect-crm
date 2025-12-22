// Authentication Debug Script
// Run this in your browser console to diagnose auth issues

console.log('=== WeConnect CRM Authentication Debug ===');

// Check localStorage tokens
console.log('\n1. LocalStorage Check:');
const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
const refreshToken = localStorage.getItem('refreshToken');
const userId = localStorage.getItem('userId');
const tokenExpiry = localStorage.getItem('tokenExpiry');

console.log('authToken:', authToken ? 'Present' : 'Missing');
console.log('refreshToken:', refreshToken ? 'Present' : 'Missing');
console.log('userId:', userId || 'Missing');
console.log('tokenExpiry:', tokenExpiry || 'Missing');

if (tokenExpiry) {
  const expiry = new Date(tokenExpiry);
  const now = new Date();
  console.log('Token expires at:', expiry.toLocaleString());
  console.log('Token expired:', expiry <= now ? 'YES - EXPIRED' : 'NO - Valid');
}

// Parse JWT token if available
if (authToken) {
  console.log('\n2. JWT Token Analysis:');
  try {
    const base64Url = authToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    console.log('Token userId:', payload.userId);
    console.log('Token email:', payload.email);
    console.log('Token roles:', payload.roles?.map(r => r.name).join(', '));
    console.log('Token issued at:', new Date(payload.iat * 1000).toLocaleString());
    console.log('Token expires at:', new Date(payload.exp * 1000).toLocaleString());
    
    // Check userId match
    if (payload.userId && userId) {
      const match = payload.userId === parseInt(userId);
      console.log('UserId match:', match ? 'YES' : 'NO - MISMATCH!');
      if (!match) {
        console.warn('WARNING: Token userId does not match stored userId!');
      }
    }
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
  }
}

// Test API call
console.log('\n3. API Test:');
if (authToken) {
  fetch('/api/leads', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('API Response Status:', response.status);
    if (response.status === 200) {
      console.log('✅ Authentication working correctly');
    } else if (response.status === 401) {
      console.log('❌ Authentication failed - token invalid or expired');
    } else {
      console.log('⚠️ Unexpected response status');
    }
    return response.json();
  })
  .then(data => {
    console.log('API Response:', data);
  })
  .catch(error => {
    console.error('API Error:', error);
  });
} else {
  console.log('❌ No auth token available for testing');
}

// Provide fix suggestions
console.log('\n4. Troubleshooting:');
if (!authToken) {
  console.log('Solution: Please log in again to get a new authentication token');
} else if (tokenExpiry && new Date(tokenExpiry) <= new Date()) {
  console.log('Solution: Token has expired. Please log out and log in again');
} else {
  console.log('If issues persist, try: localStorage.clear(); then refresh and login again');
}