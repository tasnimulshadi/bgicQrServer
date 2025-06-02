const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

// CREATE
router.post("/", verifyToken, async (req, res) => {
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
      `INSERT INTO omp_policies (
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
        mrNo,
        mrDate,
        mop,
        chequeNo,
        chequeDate,
        bank,
        bankBranch,
        note,
      ]
    );

    await conn.commit();
    res
      .status(201)
      .json({ message: "Policy created", policyId: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET ALL
router.get("/", verifyToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { mobile, ompNumber } = req.query;

    let query = "SELECT * FROM omp_policies WHERE is_deleted = FALSE";
    let params = [];

    if (mobile) {
      query += " AND mobile LIKE ?";
      params.push(`%${mobile}%`);
    }

    if (ompNumber) {
      query += " AND ompNumber LIKE ?";
      params.push(`%${ompNumber}%`);
    }

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

    // MySQL query
    const [rows] = await conn.execute(
      "SELECT * FROM omp_policies WHERE id = ? AND is_deleted = FALSE",
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
      mrNo,
      mrDate,
      mop,
      chequeNo,
      chequeDate,
      bank,
      bankBranch,
      note,
    } = req.body;

    // Replace undefined with null
    const sanitize = (val) => (val === undefined ? null : val);

    const params = [
      sanitize(typeOfTRV),
      sanitize(ompNumber),
      sanitize(policyNumber),
      sanitize(issueDate),
      sanitize(firstName),
      sanitize(lastName),
      sanitize(dob),
      sanitize(gender),
      sanitize(address),
      sanitize(mobile),
      sanitize(email),
      sanitize(passport),
      sanitize(destination),
      sanitize(travelDateFrom),
      sanitize(travelDays),
      sanitize(travelDateTo),
      sanitize(countryOfResidence),
      sanitize(limitOfCover),
      sanitize(limitOfCoverCurrency),
      sanitize(premium),
      sanitize(vat),
      sanitize(producer),
      sanitize(mrNo),
      sanitize(mrDate),
      sanitize(mop),
      sanitize(chequeNo),
      sanitize(chequeDate),
      sanitize(bank),
      sanitize(bankBranch),
      sanitize(note),
      id,
    ];

    const sql = `
      UPDATE omp_policies SET
        typeOfTRV = ?,
        ompNumber = ?,
        policyNumber = ?,
        issueDate = ?,
        firstName = ?,
        lastName = ?,
        dob = ?,
        gender = ?,
        address = ?,
        mobile = ?,
        email = ?,
        passport = ?,
        destination = ?,
        travelDateFrom = ?,
        travelDays = ?,
        travelDateTo = ?,
        countryOfResidence = ?,
        limitOfCover = ?,
        limitOfCoverCurrency = ?,
        premium = ?,
        vat = ?,
        producer = ?,
        mrNo = ?,
        mrDate = ?,
        mop = ?,
        chequeNo = ?,
        chequeDate = ?,
        bank = ?,
        bankBranch = ?,
        note = ?
      WHERE id = ?
    `;

    const [result] = await conn.execute(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    const [rows] = await conn.execute(
      "SELECT * FROM omp_policies WHERE id = ?",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
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
      "UPDATE omp_policies SET is_deleted = 1 WHERE id = ?",
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
