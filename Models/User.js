const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'], unique: true },
  password: { type: String, required: [true, 'Password is required'], minlength:[8, 'Password must be at least 8 characters'] },
  zip: { type: Number, default: null,
    minlength: [5, 'Zip must be 5 digits'],
    maxlength: [5, 'Zip must be 5 digits'],
  },
  city: { type: String, default: null},
  state: { type: String, default: null },
  country: { type: String, default: null },

  ips: { type: [String], default: []},

  guest: Boolean
});


module.exports = mongoose.model('User', UserSchema);