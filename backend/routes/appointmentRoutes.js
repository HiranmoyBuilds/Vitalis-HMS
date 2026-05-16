const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createAppointment)
  .get(protect, admin, getAllAppointments);

router.get('/my', protect, getMyAppointments);
router.put('/:id', protect, admin, updateAppointmentStatus);

module.exports = router;
