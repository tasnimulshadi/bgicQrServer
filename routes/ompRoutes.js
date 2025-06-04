const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");
const { ompCreateSchema, ompUpdateSchema } = require("../schema/ompSchema");

// CREATE
router.post("/", verifyToken, async (req, res) => {
  const { error } = ompCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      typeOfTRV,
      ompNumber,
      policyNumber,
      issueDate,
      firstName,
      lastName,
      dob,
      gender,
      address,
      mobile,
      email,
      passport,
      destination,
      travelDateFrom,
      travelDays,
      travelDateTo,
      countryOfResidence,
      limitOfCover,
      limitOfCoverCurrency,
      premium,
      vat,
      producer,
      mrNo = null,
      mrDate = null,
      mop = null,
      chequeNo = null,
      chequeDate = null,
      bank = null,
      bankBranch = null,
      note = null,
    } = req.body;

    const [result] = await conn.execute(
      `INSERT INTO omp (
        typeOfTRV, ompNumber, policyNumber, issueDate, firstName, lastName,
        dob, gender, address, mobile, email, passport, destination,
        travelDateFrom, travelDays, travelDateTo, countryOfResidence,
        limitOfCover, limitOfCoverCurrency, premium, vat, producer,
        mrNo, mrDate, mop, chequeNo, chequeDate, bank, bankBranch, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        typeOfTRV,
        ompNumber,
        policyNumber,
        issueDate,
        firstName,
        lastName,
        dob,
        gender,
        address,
        mobile,
        email,
        passport,
        destination,
        travelDateFrom,
        travelDays,
        travelDateTo,
        countryOfResidence,
        limitOfCover,
        limitOfCoverCurrency,
        premium,
        vat,
        producer,
        mrNo || null,
        mrDate || null,
        mop || null,
        chequeNo || null,
        chequeDate || null,
        bank || null,
        bankBranch || null,
        note || null,
      ]
    );

    await conn.commit();
    res
      .status(201)
      .json({ message: "Policy created", policyId: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error("CREATE Error:", err);
    res.status(500).json({ error: "Server error while creating policy." });
  } finally {
    conn.release();
  }
});

// GET ALL
router.get("/", verifyToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { mobile, ompNumber } = req.query;

    let query = "SELECT * FROM omp WHERE is_deleted = FALSE";
    let params = [];

    if (mobile) {
      query += " AND mobile LIKE ?";
      params.push(`%${mobile}%`);
    }

    if (ompNumber) {
      query += " AND ompNumber LIKE ?";
      params.push(`%${ompNumber}%`);
    }

    // pagination
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await conn.execute(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET SINGLE
router.get("/:id", async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(404).json({ error: "Not found" });
    }

    // MySQL query
    const [rows] = await conn.execute(
      "SELECT * FROM omp WHERE id = ? AND is_deleted = FALSE",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// UPDATE
router.patch("/:id", verifyToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;

    // Validate input
    const { error, value } = ompUpdateSchema.validate(req.body, {
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Build dynamic query and params
    const fields = Object.keys(value);
    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    const updates = fields.map((field) => `${field} = ?`).join(", ");
    const params = fields.map((key) => value[key]);
    params.push(id); // for WHERE id = ?

    const sql = `UPDATE omp SET ${updates} WHERE id = ?`;

    const [result] = await conn.execute(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Policy not found" });
    }

    const [rows] = await conn.execute("SELECT * FROM omp WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("PATCH Error:", err);
    res.status(500).json({ error: "Server error while updating policy." });
  } finally {
    conn.release();
  }
});

// DELETE soft del
router.delete("/:id", verifyToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;

    const [result] = await conn.execute(
      "UPDATE omp SET is_deleted = 1 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "OMP entry soft deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
