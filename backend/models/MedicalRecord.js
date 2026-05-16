const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  diagnosis: {
    type: String,
    required: true,
  },
  prescription: {
    type: String,
  },
  notes: {
    type: String,
  },
  type: {
    type: String,
    enum: ['Prescription', 'Lab Result', 'Imaging', 'Note'],
    default: 'Note',
  },
  attachments: [String], // URLs to files/images
}, {
  timestamps: true,
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
module.exports = MedicalRecord;
