const mongoose = require('mongoose');

const User = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    dropDups: true
  },
  log: [{
    description: {type: String, required: true, dropDups: true},
    duration: {type: Number, required: true, dropDups: true},
    date: Date
  }]
});

module.exports = mongoose.model('User', User);