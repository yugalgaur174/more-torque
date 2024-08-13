// app.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mcache = require('memory-cache');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Setup Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware for JSON parsing
app.use(express.json());

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // limit each IP to 5 requests per windowMs
});
app.use(limiter);

// Caching middleware
function cache(req, res, next) {
  const key = req.originalUrl || req.url;
  const cachedBody = mcache.get(key);
  if (cachedBody) {
    res.send(cachedBody);
    return;
  }
  res.sendResponse = res.send;
  res.send = (body) => {
    mcache.put(key, body, 60 * 1000); // Cache for 1 minute
    res.sendResponse(body);
  };
  next();
}

// Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).send('Unauthorized');

  const token = authHeader.split(' ')[1];
  if (token === 'your-secret-token') {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
}

// Mock data for organizations
const organizations = [
  { id: '1', name: 'Org1', account: 'acc1', website: 'www.org1.com', fuelReimbursementPolicy: 'policy1', speedLimitPolicy: '20 km/h', parentId: null },
  { id: '2', name: 'Org2', account: 'acc2', website: 'www.org2.com', fuelReimbursementPolicy: 'policy1', speedLimitPolicy: '30 km/h', parentId: '1' },
  { id: '3', name: 'Org3', account: 'acc3', website: 'www.org3.com', fuelReimbursementPolicy: 'policy2', speedLimitPolicy: '40 km/h', parentId: '1' }
];

// Helper function to update organizations
function updateOrganization(orgId, updates) {
  const org = organizations.find(o => o.id === orgId);
  if (!org) return { status: 404, message: 'Organization not found' };

  Object.assign(org, updates);

  if (updates.fuelReimbursementPolicy) {
    updateChildren(orgId, 'fuelReimbursementPolicy', updates.fuelReimbursementPolicy);
  }
  if (updates.speedLimitPolicy) {
    updateChildren(orgId, 'speedLimitPolicy', updates.speedLimitPolicy);
  }

  return { status: 200, data: org };
}

// Helper function to update children based on inheritance
function updateChildren(parentId, policyType, newPolicy) {
  organizations.forEach(org => {
    if (org.parentId === parentId) {
      if (!org[policyType]) {
        org[policyType] = newPolicy;
        updateChildren(org.id, policyType, newPolicy);
      }
    }
  });
}

// Database connection
const dbURI = 'mongodb://127.0.0.1:27017/yourDatabaseName'; // Replace with your database URI
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB successfully!');
});

// Define your routes
app.get('/', (req, res) => {
  res.send('Server is up and running. Access a valid endpoint.');
});

// Endpoint to decode VIN
app.get('/vehicles/decode/:vin', cache, async (req, res) => {
  const vin = req.params.vin;
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return res.status(400).send('Invalid VIN format');
  }

  const apiUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error decoding VIN');
  }
});

// Endpoint to add a vehicle
app.post('/vehicles', authenticate, async (req, res) => {
  const { vin, org } = req.body;

  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return res.status(400).send('Invalid VIN format');
  }

  if (!org) {
    return res.status(400).send('Organization ID is required');
  }

  res.status(201).send({
    vin,
    org,
    message: 'Vehicle added successfully',
  });
});

// Endpoint to get vehicle details
app.get('/vehicles/:vin', async (req, res) => {
  const vin = req.params.vin;

  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return res.status(400).send('Invalid VIN format');
  }

  res.status(200).send({
    vin,
    manufacturer: 'Example Manufacturer',
    model: 'Example Model',
    year: '2024',
  });
});

// Endpoint to create a new organization
app.post('/orgs', authenticate, async (req, res) => {
  const { name, account, website, fuelReimbursementPolicy, speedLimitPolicy } = req.body;

  const defaultFuelReimbursementPolicy = '1000';

  if (!name || !account || !website) {
    return res.status(400).send('Name, account, and website are required');
  }

  res.status(201).send({
    name,
    account,
    website,
    fuelReimbursementPolicy: fuelReimbursementPolicy || defaultFuelReimbursementPolicy,
    speedLimitPolicy: speedLimitPolicy || 'Default Policy',
  });
});

// Endpoint to update an organization
app.patch('/orgs/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { account, website, fuelReimbursementPolicy, speedLimitPolicy } = req.body;

  if (!account && !website && !fuelReimbursementPolicy && !speedLimitPolicy) {
    return res.status(400).send('No fields to update');
  }

  const result = updateOrganization(id, { account, website, fuelReimbursementPolicy, speedLimitPolicy });

  if (result.status === 200) {
    res.status(200).send(result.data);
  } else {
    res.status(result.status).send(result.message);
  }
});

// Endpoint to get all organizations
app.get('/orgs', async (req, res) => {
  res.status(200).send(organizations);
});

module.exports = app;
