const express = require('express');
const router = express.Router();
const Org = require('../models/Org');

// Create organization
router.post('/', async (req, res) => {
  const { name, account, website, fuelReimbursementPolicy, speedLimitPolicy } = req.body;
  try {
    const org = new Org({ name, account, website, fuelReimbursementPolicy, speedLimitPolicy });
    await org.save();
    res.status(201).json(org);
  } catch (error) {
    res.status(400).json({ error: 'Error creating organization' });
  }
});

// Update organization
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, account, website, fuelReimbursementPolicy, speedLimitPolicy } = req.body;
  try {
    const org = await Org.findByIdAndUpdate(id, { name, account, website, fuelReimbursementPolicy, speedLimitPolicy }, { new: true });
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(org);
  } catch (error) {
    res.status(400).json({ error: 'Error updating organization' });
  }
});

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const orgs = await Org.find().populate('parent');
    res.json(orgs);
  } catch (error) {
    res.status(400).json({ error: 'Error retrieving organizations' });
  }
});

module.exports = router;
