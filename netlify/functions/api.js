const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

let cachedDb = null;

const agentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  passwordHash: String,
  businessName: String,
  role: { type: String, default: 'agent' },
  method: { type: String, default: 'email' },
  createdAt: { type: Date, default: Date.now }
});

const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  cachedDb = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
  });
  return cachedDb;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const isValid = await bcrypt.compare(password, agent.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { agentId: agent._id, email: agent.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      accessToken: token,
      refreshToken: token,
      agent: {
        agentId: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const exists = await Agent.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const agent = await Agent.create({ name, email, passwordHash, businessName });

    const token = jwt.sign(
      { agentId: agent._id, email: agent.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      agent: { agentId: agent._id, name: agent.name, email: agent.email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await Agent.findById(decoded.agentId);
    
    if (!agent) return res.status(404).json({ error: 'User not found' });

    res.json({
      agent: {
        agentId: agent._id,
        email: agent.email,
        name: agent.name,
        role: agent.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/conversations', async (req, res) => {
  res.json([]);
});

app.get('/api/whatsapp/verification-status', (req, res) => {
  res.json({
    meta_verification_status: 'pending',
    webhook_verified: false,
    whatsapp_number_status: 'pending',
    can_send_messages: false,
    phone_number: 'Not configured',
    business_account_id: 'Not configured',
    last_message_received_at: null,
    blocking_issues: [],
    non_blocking_issues: ['Configure WhatsApp Business API']
  });
});

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (!cachedDb) {
    try {
      await connectDB();
    } catch (err) {
      console.error('DB connection failed:', err.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database connection failed' })
      };
    }
  }
  
  return serverless(app)(event, context);
};
