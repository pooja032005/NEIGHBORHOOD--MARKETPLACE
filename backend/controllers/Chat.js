const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Item = require('../models/Item');
const Service = require('../models/Service');
const { sendSellerChatNotification } = require('./notificationController');

// Very lightweight rule-based chatbot to acknowledge and answer common buyer questions
function generateAutoReply({ buyerName, productTitle, productType, price, location }) {
  const name = (buyerName || 'there').split(' ')[0];
  const title = productTitle || 'this listing';

  const baseIntro = `Hi ${name}, thanks for your message about ${title}.`;

  const lines = [baseIntro];

  if (price) {
    lines.push(`Current listed price is ₹${price}.`);
  }

  // Simple intent matching
  const lower = (text) => (text || '').toLowerCase();
  const intents = {
    availability: ['available', 'stock', 'in stock'],
    negotiate: ['negotiate', 'discount', 'offer', 'less'],
    delivery: ['deliver', 'delivery', 'ship', 'shipping'],
    pickup: ['pickup', 'pick up', 'collect'],
    condition: ['condition', 'used', 'new'],
    warranty: ['warranty', 'guarantee'],
    timeline: ['when', 'time', 'slot', 'date'],
  };

  const matchIntent = (text) => {
    const l = lower(text);
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(k => l.includes(k))) return intent;
    }
    return null;
  };

  return function build(text) {
    const intent = matchIntent(text);
    switch (intent) {
      case 'availability':
        lines.push('Availability: the listing is available unless marked sold.');
        break;
      case 'negotiate':
        lines.push('Pricing: the listed price is current; feel free to share a reasonable offer and the seller will confirm.');
        break;
      case 'delivery':
        lines.push('Delivery: please share your pin/location; the seller will confirm delivery options and any fees.');
        break;
      case 'pickup':
        lines.push('Pickup: share your preferred time window; the seller will confirm a slot.');
        break;
      case 'condition':
        lines.push('Condition: details match the description/photos; ask if you need close-ups.');
        break;
      case 'warranty':
        lines.push('Warranty: covered only if stated in the description; otherwise considered as-is.');
        break;
      case 'timeline':
        lines.push('Scheduling: share your preferred date/time; the seller will confirm.');
        break;
      default:
        lines.push('The seller has been notified and will reply shortly.');
    }

    if (location) {
      lines.push(`Typical meetup/delivery location: ${location}.`);
    }

    if (productType === 'service') {
      lines.push('For services, please include scope, hours needed, and preferred schedule.');
    }

    lines.push('Reply here with any specifics (quantity, timing, address) so the seller can finalize.');

    return lines.join(' ');
  };
}

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

    // Fetch product/service context for notifications and auto-replies
    let productTitle = 'this listing';
    let productType = null;
    let productPrice = null;
    let productLocation = null;
    try {
      if (chat.itemId) {
        const item = await Item.findById(chat.itemId).lean();
        if (item?.title) {
          productTitle = item.title;
          productType = 'item';
        }
        if (item?.price) productPrice = item.price;
        if (item?.location) productLocation = item.location;
      } else if (chat.serviceId) {
        const service = await Service.findById(chat.serviceId).lean();
        if (service?.title) {
          productTitle = service.title;
          productType = 'service';
        }
        if (service?.price) productPrice = service.price;
        if (service?.location) productLocation = service.location;
      }
    } catch (ctxErr) {
      console.error('chat context load error (non-blocking):', ctxErr.message);
    }

    // Notify seller/admin when a buyer sends a chat message (non-blocking)
    try {
      const receiverUser = await User.findById(other).lean();
      const senderUser = await User.findById(sender).lean();
      const senderName = senderUser?.name || 'Buyer';
      const receiverRole = receiverUser?.role;

      if (receiverRole === 'seller' || receiverRole === 'admin') {
        const preview = (text && text.trim()) ? text.trim().slice(0, 180) : 'sent an attachment';
        await sendSellerChatNotification({
          sellerEmail: receiverUser?.email,
          sellerPhone: receiverUser?.phone,
          buyerName: senderName,
          messagePreview: preview,
          productTitle,
          productType,
        });
      }
    } catch (notifyErr) {
      console.error('chat notification error (non-blocking):', notifyErr.message);
    }

    // Lightweight auto-reply to acknowledge every buyer question to sellers
    try {
      const receiverUser = await User.findById(other).lean();
      const senderUser = await User.findById(sender).lean();
      const receiverRole = receiverUser?.role;
      const senderRole = senderUser?.role;

      const shouldAutoReply = receiverRole === 'seller' && senderRole !== 'seller';
      if (shouldAutoReply) {
        const autoBuilder = generateAutoReply({
          buyerName: senderUser?.name,
          productTitle,
          productType,
          price: productPrice,
          location: productLocation,
        });
        const autoReplyText = `[Auto-reply] ${autoBuilder(text)}`;

        await Message.create({
          chatId,
          sender: other, // from seller to buyer
          receiver: sender,
          text: autoReplyText,
          media: '',
        });

        // Update chat lastMessage to the auto reply so buyer sees the acknowledgment
        chat.lastMessage = autoReplyText;
        await chat.save();
      } else {
        // Update chat lastMessage and updatedAt to the buyer/sender message
        chat.lastMessage = text || (media ? '📷 Image' : '');
        await chat.save();
      }
    } catch (autoErr) {
      console.error('auto-reply error (non-blocking):', autoErr.message);
      // Fallback lastMessage update if auto-reply failed
      chat.lastMessage = text || (media ? '📷 Image' : '');
      await chat.save();
    }

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
