const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: false
  },
  age: {
    type: Number,
    required: true
  },
  gender: { // 'MALE' || 'FEMALE
    type: String,
    required: true
  },
  isVisible: { // 'T' || 'F
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  imgs: {
    type: [String],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
