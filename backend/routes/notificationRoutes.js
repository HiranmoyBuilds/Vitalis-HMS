const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, publicContact } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotifications);

router.post('/public-contact', publicContact);

router.route('/:id')
  .put(protect, markAsRead);

module.exports = router;
