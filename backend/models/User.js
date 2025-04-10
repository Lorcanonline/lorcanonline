const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  decks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deck' }]
});

module.exports = mongoose.model('User', userSchema);