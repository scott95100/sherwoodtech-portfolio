// Minimal test server for Railway debugging
const express = require('express');
const app = express();

// Railway port handling - be very explicit
const PORT = process.env.PORT || 8080;

console.log('🔍 Port Configuration Debug:');
console.log('process.env.PORT:', process.env.PORT);
console.log('Final PORT value:', PORT);
console.log('PORT type:', typeof PORT);

// Minimal health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Test server is working!',
    timestamp: new Date().toISOString(),
    port: PORT,
    envPort: process.env.PORT,
    env: process.env.NODE_ENV || 'production',
    railwayEnv: {
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      RAILWAY_SERVICE_ID: process.env.RAILWAY_SERVICE_ID,
      RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Health check passed',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Start server with better error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🌐 Server accessible at http://0.0.0.0:${PORT}`);
  console.log('📊 Environment variables:', {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    totalVars: Object.keys(process.env).length,
    isRailway: !!process.env.RAILWAY_ENVIRONMENT
  });
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`🚫 Port ${PORT} is already in use!`);
  }
});

server.on('listening', () => {
  console.log('🎉 Server is now listening and ready!');
  console.log('Address:', server.address());
});

console.log('🚀 Test server starting...');
