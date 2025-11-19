const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null },
    lastMessage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
