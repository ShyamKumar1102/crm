const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not defined');
  cachedDb = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2
  });
  return cachedDb;
}

// Load models first
require('../../backend/src/models/Agent.model');
require('../../backend/src/models/RefreshToken.model');

const authRoutes = require('../../backend/src/routes/auth');
const conversationsRoutes = require('../../backend/src/routes/conversations');
const messagesRoutes = require('../../backend/src/routes/messages');
const webhookRoutes = require('../../backend/src/routes/webhook.routes');
const whatsappRoutes = require('../../backend/src/routes/whatsapp.routes');
const templateRoutes = require('../../backend/src/routes/template.routes');
const analyticsRoutes = require('../../backend/src/routes/analytics');
const aiRoutes = require('../../backend/src/routes/ai');
const mobileRoutes = require('../../backend/src/routes/mobile');
const gdprRoutes = require('../../backend/src/routes/gdpr');

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/gdpr', gdprRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend running on Netlify',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
  }
  return serverless(app)(event, context);
};
