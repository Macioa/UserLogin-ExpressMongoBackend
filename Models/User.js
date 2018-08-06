const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'username is required'], unique: true },
  password: { type: String, required: [true, 'password is required'] },
  zip: { type: Number, 
    min: [5, 'Zip must be 5 digits'],
    max: [5, 'Zip must be 5 digits'],
  },
  city: String
});


module.exports = mongoose.model('User', UserSchema);