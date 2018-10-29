const mongoose = require('mongoose');

const overseerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  tags: [],
  maxweight: Number,
});

module.exports = mongoose.model('Overseer', overseerSchema);