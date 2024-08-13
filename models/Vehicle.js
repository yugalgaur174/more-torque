const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vin: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[A-HJ-NPR-Z0-9]{17}$/.test(v); // VIN must be 17 characters long, alphanumeric, and excludes I, O, Q
      },
      message: props => `${props.value} is not a valid VIN!`
    }
  },
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
    required: true
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
