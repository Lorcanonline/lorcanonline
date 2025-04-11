const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true, sparse: true, default: null },
  password: String,
  decks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deck' }],
  avatar: { type: String, default: () => `pfp${Math.floor(Math.random() * 12) + 1}` },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);