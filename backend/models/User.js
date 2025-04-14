const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
    collation: { locale: 'en', strength: 2 }
  },  email: {
    type: String,
    unique: true,
    sparse: true, 
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Permitir null/undefined
        return /\S+@\S+\.\S+/.test(v);
      },
      message: 'Formato de email inválido'
    }
  },
  password: {type: String, required: true},
  decks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deck' }],
  avatar: { type: String, default: () => `pfp${Math.floor(Math.random() * 12) + 1}` },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);