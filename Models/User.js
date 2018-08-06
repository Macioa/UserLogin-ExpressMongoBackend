const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'], unique: true },
  password: { type: String, required: [true, 'Password is required'], minlength:[8, 'Password must be at least 8 characters'] },
  zip: { type: Number, default: null,
    min: [5, 'Zip must be 5 digits'],
    max: [5, 'Zip must be 5 digits'],
  },
  city: { type: String, default: null}
});


module.exports = mongoose.model('User', UserSchema);