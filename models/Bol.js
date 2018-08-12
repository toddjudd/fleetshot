const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const BolSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: 'Error 0000: Id Must be present, attempt restarting BOL Creation.'
  },
  status: String,
  type: String,
  vin: {
    type: String,
    required: 'Error 0001: Vin number must be present.',
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'Error 0003: You must supply coordinates!'
    }],
    city: {
      type: String,
      required: 'Error 0004: You must provide a city'
    },
    state: {
      type: String,
      required: 'Error 0005: You must provide a State'
    },
    postal: {
      type: String,
      required: 'Error 0009: You must provide a Postal Code'
    },
  },
  customerName: {
    type: String,
    required: 'Error 0006: You must provide a Customer Name'
  },
  driver: {
    type: String,
    required: 'Error 0007: You must provide a Driver'
  },
  damage:{
   type: Boolean,
   required: 'Error 0008: Damage needs to be recorded.'
  },
  path: String,
  driveSigPath: String,
  driveSigURI: String,
  custSigPath: String,
  custSigURI: String,
  signedDate: Date,
  customerEmail: String,
  confirmedDate: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

// This should validat that the vin is not already in the system. 
BolSchema.path('vin').validate(function(value, done) {
  return value.length === 8
}, 'Error 0002: Vin Must be 8 digits exactly. Check for white spaces, and character count, and try again.');

module.exports = mongoose.model('Bol', BolSchema);