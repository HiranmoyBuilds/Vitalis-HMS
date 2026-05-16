const express = require('express');
const router = express.Router();
const {
  addRecord,
  getMyRecords,
  getPatientRecords,
} = require('../controllers/recordController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, addRecord);
router.get('/my', protect, getMyRecords);
router.get('/patient/:id', protect, admin, getPatientRecords);

module.exports = router;
