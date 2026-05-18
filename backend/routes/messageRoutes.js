const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesBetween, getChatContacts } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/contacts/list', protect, getChatContacts);
router.get('/:userId', protect, getMessagesBetween);

module.exports = router;
