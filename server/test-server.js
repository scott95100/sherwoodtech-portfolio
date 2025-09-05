// Minimal test server for Railway debugging
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

// Minimal health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Test server is working!',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'production'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Health check passed',
    port: PORT 
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🌐 Server accessible at http://0.0.0.0:${PORT}`);
  console.log('📊 Environment variables:', {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    totalVars: Object.keys(process.env).length
  });
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

console.log('🚀 Test server starting...');
