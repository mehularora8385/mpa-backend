const app = require('./app');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Initialize database connection
const db = require('./config/database');

// Sync database models
db.sync({ alter: false })
  .then(() => {
    console.log('\n✅ Database connected and models synced');
  })
  .catch((err) => {
    console.error('\n❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🚀 MPA Backend Server Running                    ║
║                                                            ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(30)}║
║  Port: ${PORT.toString().padEnd(47)}║
║  URL: http://${HOST}:${PORT}                              ║
║  API Base: http://${HOST}:${PORT}/api                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;
