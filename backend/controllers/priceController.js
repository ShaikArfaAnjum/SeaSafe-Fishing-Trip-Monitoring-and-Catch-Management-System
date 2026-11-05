// ============================================================
// controllers/priceController.js
// Handles the fish price board.
// Admin can add, update, and delete prices.
// Any logged-in user can view the price list.
// ============================================================

const Price = require('../models/Price');

// GET /api/prices
// Return all fish prices sorted alphabetically by fish type.
async function getPrices(req, res) {
  try {
    const prices = await Price.find().sort({ fishType: 1 });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// POST /api/prices
// Add a new fish type and its price. Admin only.
// Rejects duplicate fish types.
async function createPrice(req, res) {
  try {
    const { fishType, pricePerKg } = req.body;

    // Both fields are required
    if (!fishType || pricePerKg === undefined) {
      return res.status(400).json({ message: 'Please provide fishType and pricePerKg.' });
    }

    // A price entry for this fish type must not already exist
    const existingPrice = await Price.findOne({ fishType });
    if (existingPrice) {
      return res.status(400).json({
        message: 'A price for "' + fishType + '" already exists. Use PUT to update it.'
      });
    }

    const price = await Price.create({ fishType, pricePerKg });
    res.status(201).json(price);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// PUT /api/prices/:id
// Update a fish price entry. Admin only.
async function updatePrice(req, res) {
  try {
    const price = await Price.findById(req.params.id);

    if (!price) {
      return res.status(404).json({ message: 'Price entry not found.' });
    }

    // Update only the fields that were sent
    const { fishType, pricePerKg } = req.body;
    if (fishType !== undefined)   price.fishType = fishType;
    if (pricePerKg !== undefined) price.pricePerKg = pricePerKg;

    const updatedPrice = await price.save();
    res.json(updatedPrice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/prices/:id
// Delete a fish price entry. Admin only.
async function deletePrice(req, res) {
  try {
    const price = await Price.findById(req.params.id);

    if (!price) {
      return res.status(404).json({ message: 'Price entry not found.' });
    }

    await price.deleteOne();
    res.json({ message: 'Price for "' + price.fishType + '" deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getPrices, createPrice, updatePrice, deletePrice };

