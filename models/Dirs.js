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
  },
  format: { // IMAGE || VIDEO
    type: String,
    required: true
  },
  type: { // FILE || FOLDER
    type: String,
    required: true
  }
});


DirsSchema.set('toObject')
module.exports = Dirs = mongoose.model('dirs', DirsSchema);
