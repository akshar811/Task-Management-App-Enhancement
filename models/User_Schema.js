const mongoose = require("mongoose");

const userModel = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  fcmToken : String,
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User',
  },
});

let User = mongoose.model("User", userModel);

module.exports = User;

