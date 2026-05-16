const MedicalRecord = require('../models/MedicalRecord');
const { createNotification } = require('./notificationController');

// @desc    Add new medical record
// @route   POST /api/records
// @access  Private (Admin/Doctor)
const addRecord = async (req, res) => {
  const { patientId, doctor, diagnosis, prescription, notes, type } = req.body;

  try {
    const record = await MedicalRecord.create({
      patient: patientId,
      doctor,
      diagnosis,
      prescription,
      notes,
      type,
    });

    // Notify patient
    await createNotification(req.io, {
      recipient: patientId,
      title: 'New Medical Record',
      message: `A new ${type.toLowerCase()} has been added to your medical profile.`,
      type: 'MedicalRecord',
      relatedId: record._id
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my medical records
// @route   GET /api/records/my
// @access  Private (Patient)
const getMyRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get records for a specific patient (Admin)
// @route   GET /api/records/patient/:id
// @access  Private (Admin/Doctor)
const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addRecord,
  getMyRecords,
  getPatientRecords,
};
