const express = require('express');
const router = express.Router();
const { registerUser, authUser, getPatients, getStaff } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/patients', protect, admin, getPatients);
router.get('/staff', protect, admin, getStaff);

module.exports = router;
