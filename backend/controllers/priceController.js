// Price controller: handles fish market price board operations

const Price = require('../models/Price');

// GET /api/prices - return all fish prices sorted alphabetically
async function getPrices(req, res) {
  try {
    const prices = await Price.find().sort({ fishType: 1 });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// POST /api/prices - add a new fish variety and price (admin only)
async function createPrice(req, res) {
  try {
    const { fishType, pricePerKg } = req.body;

    if (!fishType || pricePerKg === undefined) {
      return res.status(400).json({ message: 'Please provide fishType and pricePerKg.' });
    }

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

// PUT /api/prices/:id - update price entry (admin only)
async function updatePrice(req, res) {
  try {
    const price = await Price.findById(req.params.id);

    if (!price) {
      return res.status(404).json({ message: 'Price entry not found.' });
    }

    const { fishType, pricePerKg } = req.body;
    if (fishType !== undefined)   price.fishType = fishType;
    if (pricePerKg !== undefined) price.pricePerKg = pricePerKg;

    const updatedPrice = await price.save();
    res.json(updatedPrice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/prices/:id - delete price entry (admin only)
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
