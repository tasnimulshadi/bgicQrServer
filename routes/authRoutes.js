// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { userid, password } = req.body;
  try {
    const user = await User.create({ userid, password }); // save plain password
    res.json({ message: "User registered", userId: user.userid });
  } catch (err) {
    res.status(400).json({ error: "UserID already exists" });
  }
});

router.post("/login", async (req, res) => {
  const { userid, password } = req.body;
  const user = await User.findOne({ userid });
  if (!user) return res.status(400).json({ error: "User not found" });

  // Direct password comparison (plain text)
  if (password !== user.password)
    return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user.userid }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token, userid: user.userid });
});

module.exports = router;
