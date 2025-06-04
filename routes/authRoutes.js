const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  const { userid, password } = req.body;
  try {
    // Check if user exists
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE userid = ?",
      [userid]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "UserID already exists" });
    }

    // Insert new user
    await db.execute("INSERT INTO users (userid, password) VALUES (?, ?)", [
      userid,
      password,
    ]);

    res.json({ message: "User registered", userId: userid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { userid, password } = req.body;
  try {
    // Fetch user by userid
    const [users] = await db.execute("SELECT * FROM users WHERE userid = ?", [
      userid,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = users[0];

    // Direct password comparison (plain text)
    if (password !== user.password) {
      return res.status(400).json({ error: "Wrong password" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.userid }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, userid: user.userid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
