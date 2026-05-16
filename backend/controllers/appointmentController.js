const Appointment = require('../models/Appointment');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = async (req, res) => {
  const { doctor, date, time, reason, type } = req.body;
  console.log('Booking request received:', { doctor, date, time, reason, type });
  console.log('User from request:', req.user);

  try {
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date,
      time,
      reason,
      type,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments/my
// @access  Private (Patient)
const getMyAppointments = async (req, res) => {
  console.log('Fetching appointments for user:', req.user._id);
  try {
    const appointments = await Appointment.find({ patient: req.user._id }).sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments
// @access  Private (Admin/Staff)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({}).populate('patient', 'name email').sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { createNotification } = require('./notificationController');

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private (Admin/Doctor)
const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
      appointment.status = req.body.status || appointment.status;
      const updatedAppointment = await appointment.save();

      // Create Notification
      await createNotification(req.io, {
        recipient: appointment.patient,
        title: `Appointment ${updatedAppointment.status}`,
        message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been ${updatedAppointment.status.toLowerCase()}.`,
        type: 'Appointment',
        relatedId: appointment._id
      });

      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
};
