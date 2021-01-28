const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DirsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  parentId: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('dirs', DirsSchema);
