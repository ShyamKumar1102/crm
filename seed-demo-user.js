const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const agentSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  method: String,
  isActive: Boolean,
  createdAt: Date
});

const Agent = mongoose.model('Agent', agentSchema);

async function seedDemoUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Agent.findOne({ email: 'demo@whatsapp.com' });
    if (existing) {
      console.log('Demo user already exists');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('password123', 10);
    await Agent.create({
      name: 'Demo User',
      email: 'demo@whatsapp.com',
      passwordHash,
      role: 'admin',
      method: 'email',
      isActive: true,
      createdAt: new Date()
    });

    console.log('✅ Demo user created: demo@whatsapp.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedDemoUser();
