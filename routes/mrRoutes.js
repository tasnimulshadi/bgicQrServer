const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");
const { mrCreateSchema, mrUpdateSchema } = require("../schema/mrSchema");

// CREATE
router.post("/", verifyToken, async (req, res) => {
  // 1. Validate the request body against the Joi schema
  const { error } = mrCreateSchema.validate(req.body);
  if (error) {
    // If validation fails, return a 400 Bad Request with the specific error message
    return res.status(400).json({ error: error.details[0].message });
  }

  // 2. Get a connection from the database pool
  const conn = await db.getConnection();

  try {
    // 3. Start a database transaction for atomicity
    await conn.beginTransaction();

    // 4. Destructure all fields from the validated req.body
    const {
      mrOffice,
      mrOfficeCode,
      mrClass,
      mrClassCode,
      mrNumber,
      mrDate,
      mrNo,
      receivedFrom,
      mop,
      chequeNo,
      chequeDate,
      bank,
      bankBranch,
      policyOffice,
      policyOfficeCode,
      policyClass,
      policyClassCode,
      policyNumber,
      policyDate,
      coins,
      policyNo,
      premium,
      vat,
      total,
      stamp,
      coinsnet,
      note,
    } = req.body;

    // 5. Uniqueness Check for mrNumber
    const mrYear = new Date(mrDate).getFullYear();
    const [existingMr] = await conn.execute(
      "SELECT id FROM mr WHERE mrNumber = ? AND YEAR(mrDate) = ? AND is_deleted = FALSE",
      [mrNumber, mrYear]
    );

    if (existingMr.length > 0) {
      await conn.rollback(); // No changes needed, but good practice
      return res.status(400).json({
        error: `MR number '${mrNumber}' already exists for the year ${mrYear}.`,
      });
    }

    // 6. Uniqueness Check for policyNumber
    // Note: This checks if the policy number is already present in another MR for that year.
    // Adjust the table and logic if policies are stored separately and should only be linked once.
    const policyYear = new Date(policyDate).getFullYear();
    const [existingPolicy] = await conn.execute(
      "SELECT id FROM mr WHERE policyNumber = ? AND YEAR(policyDate) = ? AND is_deleted = FALSE",
      [policyNumber, policyYear]
    );

    if (existingPolicy.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        error: `Policy number '${policyNumber}' already exists for the year ${policyYear} in another MR.`,
      });
    }

    // 7. Prepare and execute the INSERT statement
    const [result] = await conn.execute(
      `INSERT INTO mr (
        mrOffice, mrOfficeCode, mrClass, mrClassCode,
        mrNumber, mrDate, mrNo, receivedFrom, mop, chequeNo, chequeDate, bank, bankBranch,
        policyOffice, policyOfficeCode, policyClass, policyClassCode, policyNumber, policyDate, coins, policyNo,
        premium, vat, total, stamp, coinsnet, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mrOffice,
        mrOfficeCode,
        mrClass,
        mrClassCode,
        mrNumber,
        mrDate,
        mrNo,
        receivedFrom,
        mop,
        chequeNo,
        chequeDate,
        bank,
        bankBranch,
        policyOffice,
        policyOfficeCode,
        policyClass,
        policyClassCode,
        policyNumber,
        policyDate,
        coins,
        policyNo,
        premium,
        vat,
        total,
        stamp,
        coinsnet,
        note,
      ]
    );

    // 8. If the insert is successful, commit the transaction
    await conn.commit();

    // 9. Respond with a success message and the ID of the newly created MR
    res.status(201).json({
      message: "Money Receipt created successfully",
      mrId: result.insertId,
    });
  } catch (err) {
    // 10. If any server or database error occurs, rollback the transaction
    await conn.rollback();
    console.error("CREATE MR Error:", err);
    res
      .status(500)
      .json({ error: "Server error while creating the Money Receipt." });
  } finally {
    // 11. Always release the database connection back to the pool
    if (conn) {
      conn.release();
    }
  }
});

// GET ALL
/*
  /api/v1/mr?page=2&limit=10
  /api/v1/mr?gender=Male&planCode=PRO_A
  /api/v1/mr?policyNumber=OMP&firstName=John
  /api/v1/mr?policyDateFrom=2023-01-01&policyDateTo=2023-12-31
  /api/v1/mr?premium_min=100&premium_max=500
  /api/v1/mr?page=1&limit=20&policyNumber=OMP&gender=Female&policyDateFrom=2024-01-01&premium_min=200
*/
router.get("/", verifyToken, async (req, res) => {
  const conn = await db.getConnection(); // Get a connection from the pool
  try {
    // --- Destructure all possible filter parameters from req.query ---
    const {
      // Pagination
      page = 1,
      limit = 50,

      // Partial String (LIKE) Filters
      mrNumber,
      policyNumber,
      receivedFrom,
      bank,
      bankBranch,

      // Exact String Filters
      mrOffice,
      mrOfficeCode,
      mrClass,
      mrClassCode,
      mrNo,
      mop, // Method of Payment
      policyOffice,
      policyOfficeCode,
      policyClass,
      policyClassCode,
      policyNo,

      // Date Range Filters (e.g., mrDateFrom=YYYY-MM-DD&mrDateTo=YYYY-MM-DD)
      mrDateFrom,
      mrDateTo,
      chequeDateFrom,
      chequeDateTo,
      policyDateFrom,
      policyDateTo,

      // Number Range Filters (e.g., premium_min=100&premium_max=500)
      premium_min,
      premium_max,
      vat_min,
      vat_max,
      total_min,
      total_max,
      stamp_min,
      stamp_max,
      coinsnet_min,
      coinsnet_max,
    } = req.query;

    const offset = (page - 1) * limit; // Calculate offset for pagination

    let whereClause = "WHERE is_deleted = FALSE"; // Base condition for active records
    let params = []; // Array to hold parameters for the SQL query

    // --- Helper Functions to build filters dynamically ---

    const addLikeFilter = (field, value) => {
      if (value) {
        whereClause += ` AND ${field} LIKE ?`;
        params.push(`%${value}%`);
      }
    };

    const addExactFilter = (field, value) => {
      if (value) {
        whereClause += ` AND ${field} = ?`;
        params.push(value);
      }
    };

    const addDateRangeFilter = (field, fromDate, toDate) => {
      if (fromDate) {
        whereClause += ` AND ${field} >= ?`;
        params.push(fromDate);
      }
      if (toDate) {
        whereClause += ` AND ${field} <= ?`;
        params.push(toDate);
      }
    };

    const addNumberRangeFilter = (field, minVal, maxVal) => {
      if (minVal !== undefined && minVal !== null && !isNaN(Number(minVal))) {
        whereClause += ` AND ${field} >= ?`;
        params.push(Number(minVal));
      }
      if (maxVal !== undefined && maxVal !== null && !isNaN(Number(maxVal))) {
        whereClause += ` AND ${field} <= ?`;
        params.push(Number(maxVal));
      }
    };

    // --- Apply Filters based on Query Parameters ---

    // Partial String (LIKE) Filters
    addLikeFilter("mrNumber", mrNumber);
    addLikeFilter("policyNumber", policyNumber);
    addLikeFilter("receivedFrom", receivedFrom);
    addLikeFilter("bank", bank);
    addLikeFilter("bankBranch", bankBranch);

    // Exact String Filters
    addExactFilter("mrOffice", mrOffice);
    addExactFilter("mrOfficeCode", mrOfficeCode);
    addExactFilter("mrClass", mrClass);
    addExactFilter("mrClassCode", mrClassCode);
    addExactFilter("mrNo", mrNo);
    addExactFilter("mop", mop);
    addExactFilter("policyOffice", policyOffice);
    addExactFilter("policyOfficeCode", policyOfficeCode);
    addExactFilter("policyClass", policyClass);
    addExactFilter("policyClassCode", policyClassCode);
    addExactFilter("policyNo", policyNo);

    // Date Range Filters
    addDateRangeFilter("mrDate", mrDateFrom, mrDateTo);
    addDateRangeFilter("chequeDate", chequeDateFrom, chequeDateTo);
    addDateRangeFilter("policyDate", policyDateFrom, policyDateTo);

    // Number Range Filters
    addNumberRangeFilter("premium", premium_min, premium_max);
    addNumberRangeFilter("vat", vat_min, vat_max);
    addNumberRangeFilter("total", total_min, total_max);
    addNumberRangeFilter("stamp", stamp_min, stamp_max);
    addNumberRangeFilter("coinsnet", coinsnet_min, coinsnet_max);

    // --- Execute SQL Queries ---

    // 1. Get total count of records matching the filters
    const [countResult] = await conn.execute(
      `SELECT COUNT(*) as total FROM mr ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 2. Get paginated data, ordered by the MR date for consistency
    const [rows] = await conn.execute(
      `SELECT * FROM mr ${whereClause} ORDER BY mrDate DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    // Respond with the paginated data and metadata
    res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("GET ALL MR Error:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching Money Receipts." });
  } finally {
    if (conn) {
      conn.release();
    }
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
      "SELECT * FROM mr WHERE id = ? AND is_deleted = FALSE",
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
  const conn = await db.getConnection(); // Get a database connection from the pool
  try {
    const { id } = req.params; // Extract the ID from the URL parameters

    // Validate the request body against the mrUpdateSchema
    // stripUnknown: true removes any fields from req.body that are not defined in the schema
    const { error, value } = mrUpdateSchema.validate(req.body, {
      stripUnknown: true,
      abortEarly: false, // Ensure all errors are collected, not just the first one
    });

    if (error) {
      // If validation fails, return a 400 Bad Request with the error message
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if there are any fields to update after Joi validation and stripping
    const fieldsToUpdate = Object.keys(value);
    if (fieldsToUpdate.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields to update provided." });
    }

    // --- Fetch current MR data for uniqueness checks ---
    // This is crucial because an update might only provide one part of a unique key (e.g., only policyNumber, not policyDate)
    const [currentMrRows] = await conn.execute(
      "SELECT mrNumber, mrDate, policyNumber, policyDate FROM mr WHERE id = ? AND is_deleted = FALSE",
      [id]
    );

    if (currentMrRows.length === 0) {
      return res.status(404).json({ error: "MR record not found for update." });
    }

    const currentMr = currentMrRows[0];

    // --- Uniqueness Check 1: mrNumber + year(mrDate) ---
    // This block prevents creating a duplicate mrNumber within the same year
    // when either mrNumber or mrDate is being updated.
    if (value.mrNumber !== undefined || value.mrDate !== undefined) {
      // Determine the mrNumber and mrDate to check against:
      // Use the new value if provided, otherwise use the current (existing) value
      const checkMrNumber =
        value.mrNumber !== undefined ? value.mrNumber : currentMr.mrNumber;
      const checkMrDate =
        value.mrDate !== undefined ? value.mrDate : currentMr.mrDate;

      let yearToCheckMr;
      try {
        const dateObj = new Date(checkMrDate);
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json({
            error: "Invalid mrDate provided for uniqueness check.",
          });
        }
        yearToCheckMr = dateObj.getFullYear();
      } catch (dateError) {
        return res.status(400).json({
          error: "Could not process mrDate for uniqueness check.",
        });
      }

      // Check if another MR record with the same mrNumber and year exists,
      // excluding the current record being updated (id != ?).
      const [existingMrWithSameNumberAndYear] = await conn.execute(
        "SELECT id FROM mr WHERE mrNumber = ? AND YEAR(mrDate) = ? AND is_deleted = FALSE AND id != ?",
        [checkMrNumber, yearToCheckMr, id]
      );

      if (existingMrWithSameNumberAndYear.length > 0) {
        // If a duplicate is found, return an error
        return res.status(400).json({
          error: `An MR record with number '${checkMrNumber}' already exists for the year ${yearToCheckMr}.`,
        });
      }
    }

    // --- Uniqueness Check 2: policyNumber + year(policyDate) ---
    // This block prevents creating a duplicate policyNumber within the same year
    // when either policyNumber or policyDate is being updated.
    if (value.policyNumber !== undefined || value.policyDate !== undefined) {
      // Determine the policyNumber and policyDate to check against:
      // Use the new value if provided, otherwise use the current (existing) value
      const checkPolicyNumber =
        value.policyNumber !== undefined
          ? value.policyNumber
          : currentMr.policyNumber;
      const checkPolicyDate =
        value.policyDate !== undefined
          ? value.policyDate
          : currentMr.policyDate;

      let yearToCheckPolicy;
      try {
        const dateObj = new Date(checkPolicyDate);
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json({
            error: "Invalid policyDate provided for uniqueness check.",
          });
        }
        yearToCheckPolicy = dateObj.getFullYear();
      } catch (dateError) {
        return res.status(400).json({
          error: "Could not process policyDate for uniqueness check.",
        });
      }

      // Check if another MR record with the same policyNumber and year exists,
      // excluding the current record being updated (id != ?).
      const [existingPolicyWithSameNumberAndYear] = await conn.execute(
        "SELECT id FROM mr WHERE policyNumber = ? AND YEAR(policyDate) = ? AND is_deleted = FALSE AND id != ?",
        [checkPolicyNumber, yearToCheckPolicy, id]
      );

      if (existingPolicyWithSameNumberAndYear.length > 0) {
        // If a duplicate is found, return an error
        return res.status(400).json({
          error: `A policy with number '${checkPolicyNumber}' already exists for the year ${yearToCheckPolicy}.`,
        });
      }
    }

    // --- Dynamic SQL Query Construction ---
    // Create an array of 'field = ?' strings for the UPDATE clause
    const updates = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
    // Create an array of values corresponding to the fields to update
    const params = fieldsToUpdate.map((key) => value[key]);
    params.push(id); // Add the ID to the end of the parameters for the WHERE clause

    // Construct the final SQL UPDATE query for the 'mr' table
    const sql = `UPDATE mr SET ${updates} WHERE id = ?`;

    // Execute the UPDATE query
    const [result] = await conn.execute(sql, params);

    // Check if any rows were affected (i.e., if the MR record was found and updated)
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "MR record not found or no changes were applied." });
    }

    // After successful update, fetch the updated record to return it in the response
    const [updatedRows] = await conn.execute("SELECT * FROM mr WHERE id = ?", [
      id,
    ]);
    res.json(updatedRows[0]); // Return the updated MR record data
  } catch (err) {
    console.error("PATCH MR Error:", err); // Log the detailed error
    // Return a 500 Internal Server Error for unhandled exceptions
    res.status(500).json({ error: "Server error while updating MR record." });
  } finally {
    conn.release(); // Always release the database connection
  }
});

// DELETE - Soft Delete
router.delete("/:id", verifyToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;

    const [result] = await conn.execute(
      "UPDATE mr SET is_deleted = 1 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "MR entry soft deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
