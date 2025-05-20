const express = require("express");
const router = express.Router();
const Data = require("../models/Data");
const verifyToken = require("../middleware/authMiddleware");

// Create new data entry (auth required)
router.post("/", verifyToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const data = await Data.create({ title, content });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all non-deleted data entries (auth required)
router.get("/", verifyToken, async (req, res) => {
  try {
    const data = await Data.find({ is_deleted: false });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public: Get a single data entry by ID (no auth required)
router.get("/:id", async (req, res) => {
  try {
    const data = await Data.findOne({ _id: req.params.id, is_deleted: false });
    if (!data) {
      return res
        .status(404)
        .json({ error: "Data not found or has been deleted" });
    }
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// Edit a data entry by ID (auth required)
router.patch("/:id", verifyToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const data = await Data.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      { title, content },
      { new: true }
    );
    if (!data)
      return res.status(404).json({ error: "Data entry not found or deleted" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Soft delete a data entry by ID (auth required)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const data = await Data.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      { is_deleted: true },
      { new: true }
    );
    if (!data)
      return res
        .status(404)
        .json({ error: "Data not found or already deleted" });
    res.json({ message: "Data deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
