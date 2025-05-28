const express = require("express");
const router = express.Router();
const OMP = require("../models/OMP");
const verifyToken = require("../middleware/authMiddleware");

// POST: Create a new policy
router.post("/", verifyToken, async (req, res) => {
  try {
    const newOMP = new OMP(req.body);
    const savedOMP = await newOMP.save();
    res.status(201).json(savedOMP);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all non-deleted data entries (auth required)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { mobile, ompNumber } = req.query;

    // Base query: not deleted
    let query = { is_deleted: false };

    // Optional filters
    if (mobile) {
      query.mobile = { $regex: mobile, $options: "i" }; // case-insensitive partial match
    }

    if (ompNumber) {
      query.ompNumber = { $regex: ompNumber, $options: "i" };
    }

    const data = await OMP.find(query);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public: Get a single data entry by ID (no auth required)
router.get("/:id", async (req, res) => {
  try {
    const omp = await OMP.findById(req.params.id);
    if (!omp || omp.is_deleted)
      return res.status(404).json({ error: "Not found" });
    res.json(omp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Update policy by ID
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const updatedOMP = await OMP.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedOMP) return res.status(404).json({ error: "Not found" });
    res.json(updatedOMP);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Soft delete a data entry by ID (auth required)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedOMP = await OMP.findByIdAndUpdate(
      req.params.id,
      { is_deleted: true },
      { new: true }
    );
    if (!deletedOMP) return res.status(404).json({ error: "Not found" });
    res.json({ message: "OMP entry soft deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
