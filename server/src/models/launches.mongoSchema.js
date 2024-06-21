const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
    default: 100,
    min: 100,
    max: 999,
  },
  launchDate: {
    type: Date,
    required: true,
},
rocket: {
    type: String,
    required: true,
},
mission: {
    type: String,
    required: true,
},
// if we had planets collection from which we would want
// reference the target from. we would use this.
// target: {
//     type: mongoose.ObjectId,
//     ref: 'Planet'
// }
target: {
    type: String,
    required: true,
},
customer: [String],
upcoming: {
    type: Boolean,
    required: true,
},
success: {
    type: Boolean,
    required: true,
    default: true
}
});

// connects lauchesSchema to the launches collection.
module.exports = mongoose.model('launch',launchesSchema);
// not that the first argument should always be the singular of the collection. 
// Mongoose will make is lowercase and generate plural version of the collection name. eg. 'launches'
