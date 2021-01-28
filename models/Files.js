const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FilesSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  dirId: { // 存储文件夹的 id
    type: String,
    required: false
  },
  path: { // 文件路径
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  fileType: { // 文件类型
    type: String,
    required: true
  },
  size: { // 文件字节大小
    type: Number,
    required: true
  },
  cover: { // 存封面
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('files', FilesSchema);
