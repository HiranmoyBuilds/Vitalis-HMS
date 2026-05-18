const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a secure chat message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Message content cannot be blank.' });
  }

  try {
    let finalReceiverId = receiverId;

    // If receiverId is not provided or set to virtual 'admin', default to an admin (e.g. for patient support inquiries)
    if (!finalReceiverId || finalReceiverId === 'admin') {
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) {
        return res.status(404).json({ message: 'No support administrators are online.' });
      }
      finalReceiverId = admin._id;
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: finalReceiverId,
      content: content.trim(),
    });

    // Populate sender details for live broadcast
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role');

    // If real-time Socket.io dispatch is attached
    if (req.io) {
      req.io.to(finalReceiverId.toString()).emit('receiveMessage', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complete chat transcript with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getMessagesBetween = async (req, res) => {
  let targetUserId = req.params.userId;

  try {
    // If targetUserId is set to virtual 'admin', find the System Admin account
    if (targetUserId === 'admin') {
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        return res.status(404).json({ message: 'No support administrators are online.' });
      }
      targetUserId = adminUser._id;
    }

    // Retrieve full transcript sorted chronologically
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: targetUserId },
        { sender: targetUserId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .sort({ createdAt: 1 });

    // Mark any incoming unread messages in this conversation as read
    await Message.updateMany(
      { sender: targetUserId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active support contacts list (Admin Inbox)
// @route   GET /api/messages/contacts/list
// @access  Private/Admin
const getChatContacts = async (req, res) => {
  try {
    // Find all patients in the system
    const patients = await User.find({ role: 'patient' }).select('name email role');
    
    // Fetch last message details for each patient thread
    const contacts = await Promise.all(
      patients.map(async (patient) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: patient._id, receiver: req.user._id },
            { sender: req.user._id, receiver: patient._id }
          ]
        })
        .sort({ createdAt: -1 });

        // Calculate unread count from this specific patient
        const unreadCount = await Message.countDocuments({
          sender: patient._id,
          receiver: req.user._id,
          isRead: false
        });

        return {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          role: patient.role,
          unreadCount,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            sender: lastMessage.sender,
            isRead: lastMessage.isRead
          } : null
        };
      })
    );

    // Sort inbox: patients with recent messages first, then the rest alphabetically
    contacts.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessagesBetween,
  getChatContacts,
};
