const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// POST /api/chat/start
exports.startChat = async (req, res) => {
  try {
    const { userId, itemId, serviceId } = req.body;
    const me = req.user._id;

    // Determine participant ids
    const other = userId;
    if (!other) return res.status(400).json({ message: 'userId is required' });

    // Try to find existing chat with same participants and item/service
    const filter = {
      participants: { $all: [me, other] },
      itemId: itemId || null,
      serviceId: serviceId || null,
    };

    let chat = await Chat.findOne(filter);
    if (!chat) {
      chat = await Chat.create({ participants: [me, other], itemId: itemId || null, serviceId: serviceId || null });
    }

    res.json({ chatId: chat._id, chat });
  } catch (err) {
    res.status(500).json({ message: 'Error starting chat', error: err.message });
  }
};

// GET /api/chat - get all chats for logged in user
exports.getChats = async (req, res) => {
  try {
    const me = req.user._id;
    const chats = await Chat.find({ participants: me })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email profilePicture')
      .lean();

    // Count unread messages for each chat
    const chatIds = chats.map(c => c._id);
    const unreadCounts = await Message.aggregate([
      { $match: { chatId: { $in: chatIds }, receiver: req.user._id, read: false } },
      { $group: { _id: '$chatId', count: { $sum: 1 } } }
    ]);

    const unreadMap = {};
    unreadCounts.forEach(u => { unreadMap[u._id.toString()] = u.count; });

    const enriched = chats.map(c => ({
      ...c,
      unread: unreadMap[c._id.toString()] || 0
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chats', error: err.message });
  }
};

// GET /api/chat/:chatId/messages
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

// POST /api/chat/:chatId/message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, media } = req.body;
    const sender = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Determine receiver (other participant)
    const other = chat.participants.find(p => p.toString() !== sender.toString());
    if (!other) return res.status(400).json({ message: 'No other participant in chat' });

    const message = await Message.create({ chatId, sender, receiver: other, text: text || '', media: media || '' });

    // Update chat lastMessage and updatedAt
    chat.lastMessage = text || (media ? '📷 Image' : '');
    await chat.save();

    res.json({ message, chat });
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

// PATCH /api/chat/:chatId/read
exports.markRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Message.updateMany({ chatId, receiver: req.user._id, read: false }, { $set: { read: true } });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking read', error: err.message });
  }
};

// Admin: get all chats
exports.getAllChats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const chats = await Chat.find().populate('participants', 'name email').sort({ updatedAt: -1 }).lean();
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all chats', error: err.message });
  }
};

// POST /api/chat/:chatId/upload
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // File is saved by multer to public/uploads
    const urlPath = `/uploads/${req.file.filename}`;
    res.json({ url: urlPath });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading media', error: err.message });
  }
};
