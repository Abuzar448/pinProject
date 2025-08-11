// models/Post.js
const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  postText: {
    type: String,
    required: true,
    trim: true
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description:{
    type:String,
  },
  image:{
    type:String,
  },
});

module.exports = mongoose.model('Post', postSchema);