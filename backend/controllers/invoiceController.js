const Invoice = require('../models/Invoice');

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private (Admin/Staff)
const createInvoice = async (req, res) => {
  const { patientId, patientName, appointmentId, amount, description, dueDate, items } = req.body;

  try {
    const invoice = await Invoice.create({
      patientId,
      patientName,
      appointmentId,
      amount,
      description,
      dueDate,
      items,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (Admin/Staff)
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in patient's invoices
// @route   GET /api/invoices/my
// @access  Private (Patient)
const getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ patientId: req.user._id }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { createNotification } = require('./notificationController');

// @desc    Update invoice status
// @route   PUT /api/invoices/:id
// @access  Private (Admin/Staff)
const updateInvoiceStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (invoice) {
      const oldStatus = invoice.status;
      invoice.status = req.body.status || invoice.status;
      if (req.body.status === 'Paid' && oldStatus !== 'Paid') {
        invoice.paidAt = Date.now();
      }
      
      const updatedInvoice = await invoice.save();

      // Notify patient
      await createNotification(req.io, {
        recipient: invoice.patientId,
        title: `Invoice ${updatedInvoice.status}`,
        message: `The status of your invoice ${invoice._id} has been updated to ${updatedInvoice.status.toLowerCase()}.`,
        type: 'Billing',
        relatedId: invoice._id
      });

      res.json(updatedInvoice);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Pay invoice (Mock)
// @route   POST /api/invoices/:id/pay
// @access  Private (Patient)
const payInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (invoice && invoice.patientId.toString() === req.user._id.toString()) {
      if (invoice.status === 'Paid') {
        return res.status(400).json({ message: 'Invoice already paid' });
      }

      invoice.status = 'Paid';
      invoice.paidAt = Date.now();
      invoice.paymentMethod = req.body.paymentMethod || 'Credit Card';
      
      const updatedInvoice = await invoice.save();

      // Notify patient
      await createNotification(req.io, {
        recipient: req.user._id,
        title: 'Payment Successful',
        message: `Your payment of $${invoice.amount} for ${invoice.description} was successful.`,
        type: 'Billing',
        relatedId: invoice._id
      });

      res.json(updatedInvoice);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getMyInvoices,
  updateInvoiceStatus,
  payInvoice,
};
