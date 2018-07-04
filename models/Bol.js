const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const BolSchema = new mongoose.Schema({
  vin: {
    type: String,
    required: 'Error 0000: Vin number must be present',
    // if the vallidation below works then this can be removed
    // unique: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    googleAddress:String,
    address: String,
  },
  customerName: String,
  driver: String,
  damage:{
   type: Boolean,
   required: 'Damage needs to be recorded.'
  },
  path: String,
  driveSigPath: String,
  driveSigURI: String,
  custSigPath: String,
  custSigURI: String,
  signedDate: Date,
  customerEmail: String,
  created: {
    type: Date,
    default: Date.now
  }
});

// This should validat that the vin is not already in the system. 
// BolSchema.path('vin').validate(function(value, done) {
//   this.model('Bol').count({ vin: value }, function(err, count) {
//     if (err) {
//       return done(err);
//     } 
//     // If `count` is greater than zero, "invalidate"
//     done(!count);
//   });
// }, 'This VIN already exists');

module.exports = mongoose.model('Bol', BolSchema);