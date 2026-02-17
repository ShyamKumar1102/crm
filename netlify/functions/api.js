const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// Define Agent model inline
const agentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  passwordHash: String,
  businessName: String,
  businessType: String,
  businessAddress: String,
  businessPhone: String,
  website: String,
  role: { type: String, default: 'agent' },
  method: { type: String, enum: ['email', 'phone'], default: 'email' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);

// Auth routes inline
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password, method } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Finding agent:', email);
    const agent = await Agent.findOne({ email });
    if (!agent) {
      console.log('Agent not found');
      return res.status(404).json({ message: 'Account not found' });
    }

    console.log('Agent found:', agent._id);
    if (!agent.passwordHash) {
      console.log('No password hash');
      return res.status(400).json({ message: 'Invalid account' });
    }

    console.log('Comparing passwords');
    const isValidPassword = await bcrypt.compare(password, agent.passwordHash);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('Generating tokens');
    const accessToken = jwt.sign(
      { agentId: agent._id, email: agent.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { agentId: agent._id, email: agent.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful');
    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      agent: {
        agentId: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, businessName, businessType, businessAddress, businessPhone, website } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!businessName) {
      return res.status(400).json({ message: 'Business name is required' });
    }

    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const agent = await Agent.create({
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      businessName,
      businessType,
      businessAddress,
      businessPhone,
      website,
      method: 'email'
    });

    const token = jwt.sign(
      { agentId: agent._id, email: agent.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      agent: {
        agentId: agent._id,
        name: agent.name,
        email: agent.email,
        businessName: agent.businessName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await Agent.findById(decoded.agentId);
    
    if (!agent) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      agent: {
        agentId: agent._id,
        email: agent.email,
        phone: agent.phone,
        name: agent.name,
        role: agent.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await Agent.findById(decoded.agentId);
    
    if (!agent) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      agent: {
        agentId: agent._id,
        email: agent.email,
        phone: agent.phone,
        name: agent.name,
        role: agent.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

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
  
  console.log('Function invoked:', event.path);
  console.log('Environment check:', {
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
  
  try {
    await connectToDatabase();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
  
  return serverless(app)(event, context);
};
