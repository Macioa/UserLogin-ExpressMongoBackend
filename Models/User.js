const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: { String, required: [true, 'username is required'], unique: true },
  password: { String, required: [true, 'password is required'] },
  zip: { number: {
    min: [5, 'Zip must be 5 digits'],
    max: [5, 'Zip must be 5 digits'],
  } },
  city: String
});


module.exports = mongoose.model('User', UserSchema);