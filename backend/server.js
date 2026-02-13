import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await testConnection();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`✅ CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
