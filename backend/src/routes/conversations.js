const express = require('express');
const { auth } = require('../middleware/auth');
const dbService = require('../services/devDatabaseService');
const router = express.Router();

// Get all conversations with counts
router.get('/', auth, async (req, res) => {
  try {
    console.log('📬 Fetching conversations from in-memory database...');
    
    const conversations = await dbService.getAllConversations();
    
    console.log(`📊 Found ${conversations.length} conversations`);
    
    const allConversations = conversations.map(conv => ({
      id: conv.conversationId,
      phone: conv.phoneNumber,
      name: conv.phoneNumber,
      lastMessage: 'No messages',
      lastMessageAt: conv.updatedAt,
      status: conv.status || 'open',
      unreadCount: conv.unreadCount || 0
    }));
    
    const counts = {
      all: allConversations.length,
      open: allConversations.filter(c => c.status === 'open').length,
      pending: allConversations.filter(c => c.status === 'pending').length,
      closed: allConversations.filter(c => c.status === 'closed').length
    };
    
    console.log('✅ Conversations formatted for frontend');
    
    res.json({
      conversations: allConversations,
      counts,
      total: allConversations.length
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(200).json({ 
      conversations: [],
      counts: { all: 0, open: 0, pending: 0, closed: 0 },
      total: 0
    });
  }
});

// Get conversation by ID with messages
router.get('/:id', auth, async (req, res) => {
  try {
    const messages = await dbService.getMessagesByConversation(req.params.id);
    
    res.json({
      conversation: { conversationId: req.params.id },
      messages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

module.exports = router;