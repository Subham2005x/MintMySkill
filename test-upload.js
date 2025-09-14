// Test script for upload endpoints
// Run with: node test-upload.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

// You'll need to get a valid JWT token first by logging in
const JWT_TOKEN = 'your-jwt-token-here'; // Replace with actual token from login

async function testImageUpload() {
  try {
    console.log('🖼️ Testing image upload...');
    
    // Create a simple test image file (you can replace with an actual image file)
    const testImagePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testImagePath, 'This is a test file for upload testing');
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    
    const response = await axios.post(`${API_BASE}/upload/image`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });
    
    console.log('✅ Image upload successful:', response.data);
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('❌ Image upload failed:', error.response?.data || error.message);
  }
}

async function testAPIEndpoints() {
  try {
    console.log('🔍 Testing API endpoints...');
    
    // Test if upload endpoint exists
    const response = await axios.get(`${API_BASE}`);
    console.log('✅ API endpoints:', response.data.endpoints);
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Instructions for getting JWT token
console.log(`
📋 UPLOAD TESTING INSTRUCTIONS:

1. First, start your backend server:
   node server.js

2. Get a JWT token by logging in:
   POST http://localhost:5000/api/auth/login
   Body: { "email": "test@example.com", "password": "password123" }
   
3. Copy the JWT token from the response

4. Update the JWT_TOKEN variable in this file with your actual token

5. Run this test script:
   node test-upload.js

🔑 Current JWT_TOKEN: ${JWT_TOKEN}
`);

// Run basic tests
testAPIEndpoints();

// Uncomment to test image upload (after setting JWT_TOKEN)
// testImageUpload();

module.exports = {
  testImageUpload,
  testAPIEndpoints
};