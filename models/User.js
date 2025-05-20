// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userid: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // stored as plain text here
});

module.exports = mongoose.model("User", userSchema);
