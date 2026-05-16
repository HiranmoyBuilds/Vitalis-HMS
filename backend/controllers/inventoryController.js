const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Admin/Staff)
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find({}).sort({ itemName: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new inventory item
// @route   POST /api/inventory
// @access  Private (Admin)
const addItem = async (req, res) => {
  console.log('Adding inventory item:', req.body);
  const { itemName, category, stock, unit, minStock } = req.body;

  try {
    const item = await Inventory.create({
      itemName,
      category,
      stock,
      unit,
      minStock,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Inventory creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update stock quantity
// @route   PUT /api/inventory/:id
// @access  Private (Admin/Staff)
const updateStock = async (req, res) => {
  const { stock } = req.body;

  try {
    const item = await Inventory.findById(req.params.id);

    if (item) {
      item.stock = stock;
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (item) {
      await item.deleteOne();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventory,
  addItem,
  updateStock,
  deleteItem,
};
