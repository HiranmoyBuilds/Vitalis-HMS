const express = require('express');
const router = express.Router();
const {
  getInventory,
  addItem,
  updateStock,
  deleteItem,
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getInventory)
  .post(protect, admin, addItem);

router.route('/:id')
  .put(protect, admin, updateStock)
  .delete(protect, admin, deleteItem);

module.exports = router;
