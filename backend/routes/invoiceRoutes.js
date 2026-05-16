const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getMyInvoices,
  updateInvoiceStatus,
  payInvoice,
} = require('../controllers/invoiceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createInvoice)
  .get(protect, admin, getInvoices);

router.get('/my', protect, getMyInvoices);
router.post('/:id/pay', protect, payInvoice);

router.route('/:id')
  .put(protect, admin, updateInvoiceStatus);

module.exports = router;
