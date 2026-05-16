const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification && notification.recipient.toString() === req.user._id.toString()) {
      notification.isRead = true;
      await notification.save();
      res.json({ message: 'Marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Public contact form endpoint
// @route   POST /api/notifications/public-contact
// @access  Public
const publicContact = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Find an admin to receive the notification
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      return res.status(404).json({ message: 'No administrative endpoint found' });
    }

    const notification = await Notification.create({
      recipient: admin._id,
      title: `Public Inquiry: ${name}`,
      message: `Message from ${email}: ${message}`,
      type: 'General',
      isRead: false
    });

    // If socket.io is available on the request object
    if (req.io) {
      req.io.to(admin._id.toString()).emit('newNotification', notification);
    }

    res.status(201).json({ success: true, message: 'Message transmitted to hospital administration' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create notification (Internal)
const createNotification = async (io, data) => {
  try {
    const notification = await Notification.create(data);
    io.to(data.recipient.toString()).emit('newNotification', notification); 
    return notification;
  } catch (error) {
    console.error('Notification Error:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  publicContact,
  createNotification,
};
