import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
