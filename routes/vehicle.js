const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Org = require('../models/Org');
const axios = require('axios');

// Limit NHTSA API calls to 5 per minute
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
});

router.use(limiter);

// Decode VIN from NHTSA
router.get('/decode/:vin', async (req, res) => {
  const { vin } = req.params;
  try {
    const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error decoding VIN' });
  }
});

// Add vehicle
router.post('/', async (req, res) => {
  const { vin, org } = req.body;
  try {
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return res.status(400).json({ error: 'Invalid VIN' });
    }
    const orgExists = await Org.findById(org);
    if (!orgExists) {
      return res.status(400).json({ error: 'Organization does not exist' });
    }
    const vehicle = new Vehicle({ vin, org });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Error adding vehicle' });
  }
});

// Get vehicle by VIN
router.get('/:vin', async (req, res) => {
  const { vin } = req.params;
  try {
    const vehicle = await Vehicle.findOne({ vin });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving vehicle' });
  }
});

module.exports = router;
