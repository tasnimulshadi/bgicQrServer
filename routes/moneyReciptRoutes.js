const express = require("express");
const router = express.Router();
const MoneyRecipt = require("../models/MoneyRecipt");
const verifyToken = require("../middleware/authMiddleware");

// POST: Create a new policy
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      policyNumber,
      issuingDate,
      plan,
      destinationCountries,
      travelStartDate,
      travelEndDate,
      countryOfResidence,
      telephone,
      insuredPerson,
    } = req.body;

    const newMoneyRecipt = new MoneyRecipt({
      policyNumber,
      issuingDate,
      plan,
      destinationCountries,
      travelStartDate,
      travelEndDate,
      countryOfResidence,
      telephone,
      insuredPerson,
    });

    const savedMoneyRecipt = await newMoneyRecipt.save();
    res.status(201).json(savedMoneyRecipt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all non-deleted data entries (auth required)
router.get("/", verifyToken, async (req, res) => {
  try {
    const data = await MoneyRecipt.find({ is_deleted: false });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public: Get a single data entry by ID (no auth required)
router.get("/:id", async (req, res) => {
  try {
    const data = await MoneyRecipt.findOne({ _id: req.params.id, is_deleted: false });
    if (!data) {
      return res
        .status(404)
        .json({ error: "Money Recipt not found or has been deleted" });
    }
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// PATCH: Update policy by ID
router.patch("/:id", verifyToken, async (req, res) => {
  const {
    policyNumber,
    issuingDate,
    plan,
    destinationCountries,
    travelStartDate,
    travelEndDate,
    countryOfResidence,
    telephone,
    insuredPerson,
  } = req.body;

  try {
    const updatedMoneyRecipt= await MoneyRecipt.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      {
        policyNumber,
        issuingDate,
        plan,
        destinationCountries,
        travelStartDate,
        travelEndDate,
        countryOfResidence,
        telephone,
        insuredPerson,
      },
      { new: true }
    );

    if (!updatedMoneyRecipt) {
      return res.status(404).json({ error: "MoneyRecipt not found or has been deleted" });
    }

    res.json(updatedMoneyRecipt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

// Soft delete a data entry by ID (auth required)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const data = await MoneyRecipt.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      { is_deleted: true },
      { new: true }
    );
    if (!data)
      return res
        .status(404)
        .json({ error: "Money Recipt not found or already deleted" });
    res.json({ message: "Money Recipt deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
