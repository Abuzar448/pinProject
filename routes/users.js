const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
  },
  dp: {
    type: String, // profile image URL or path
    default: ''   // default empty string if no image is set
  },
  profileImage:{
    type:String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post' // Assuming you have a Post model
    }
  ]
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);

