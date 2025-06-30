const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");
const { ompCreateSchema, ompUpdateSchema } = require("../schema/ompSchema");

// CREATE
// router.post("/", verifyToken, async (req, res) => {
//   const { error } = ompCreateSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ error: error.details[0].message });
//   }

//   const conn = await db.getConnection();
//   try {
//     await conn.beginTransaction();

//     const {
//       typeOfTRV,
//       planCode,
//       ompNumber,
//       policyNumber,
//       issueDate,
//       firstName,
//       lastName,
//       dob,
//       gender,
//       address,
//       mobile,
//       email,
//       passport,
//       destination,
//       travelDateFrom,
//       travelDays,
//       travelDateTo,
//       countryOfResidence,
//       limitOfCover,
//       currency,
//       premium,
//       vat,
//       producer,
//       mrNo = null,
//       mrDate = null,
//       mop = null,
//       chequeNo = null,
//       chequeDate = null,
//       bank = null,
//       bankBranch = null,
//       note = null,
//     } = req.body;

//     // ✅ Check for existing ompNumber and Year of issueDate
//     const year = new Date(issueDate).getFullYear(); // or use moment(issueDate).year() if using moment.js
//     const [existing] = await conn.execute(
//       "SELECT * FROM omp WHERE ompNumber = ? AND YEAR(issueDate) = ? AND is_deleted = FALSE",
//       [ompNumber, year]
//     );

//     if (existing.length > 0) {
//       await conn.rollback();
//       return res.status(400).json({ error: "Policy number already exists." });
//     }

//     // ✅ Proceed with insert
//     const [result] = await conn.execute(
//       `INSERT INTO omp (
//         typeOfTRV, planCode, ompNumber, policyNumber, issueDate, firstName, lastName,
//         dob, gender, address, mobile, email, passport, destination,
//         travelDateFrom, travelDays, travelDateTo, countryOfResidence,
//         limitOfCover, currency, premium, vat, producer,
//         mrNo, mrDate, mop, chequeNo, chequeDate, bank, bankBranch, note
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         typeOfTRV,
//         planCode,
//         ompNumber,
//         policyNumber,
//         issueDate,
//         firstName,
//         lastName,
//         dob,
//         gender,
//         address,
//         mobile,
//         email,
//         passport,
//         destination,
//         travelDateFrom,
//         travelDays,
//         travelDateTo,
//         countryOfResidence,
//         limitOfCover,
//         currency,
//         premium,
//         vat,
//         producer,
//         mrNo,
//         mrDate,
//         mop,
//         chequeNo,
//         chequeDate,
//         bank,
//         bankBranch,
//         note,
//       ]
//     );

//     await conn.commit();
//     res
//       .status(201)
//       .json({ message: "Policy created", policyId: result.insertId });
//   } catch (err) {
//     await conn.rollback();
//     console.error("CREATE Error:", err);
//     res.status(500).json({ error: "Server error while creating policy." });
//   } finally {
//     conn.release();
//   }
// });
router.post("/", verifyToken, async (req, res) => {
  // Validate the request body against the Joi schema
  const { error } = ompCreateSchema.validate(req.body);
  if (error) {
    // If validation fails, return a 400 Bad Request with the error message
    return res.status(400).json({ error: error.details[0].message });
  }

  // Get a connection from the database pool
  const conn = await db.getConnection();
  try {
    // Start a database transaction for atomicity
    await conn.beginTransaction();

    // Destructure all fields from req.body based on the ompCreateSchema
    const {
      plan,
      planCode,
      policyOffice,
      policyOfficeCode,
      policyClass,
      policyClassCode,
      policyNumber,
      policyDate,
      policyNo,
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
      currency,
      premium,
      vat,
      total,
    } = req.body;

    // Extract the year from policyDate for uniqueness check
    const year = new Date(policyDate).getFullYear();

    // Check for existing policyNumber within the same year of issue to ensure uniqueness
    const [existing] = await conn.execute(
      "SELECT id FROM omp WHERE policyNumber = ? AND YEAR(policyDate) = ? AND is_deleted = FALSE",
      [policyNumber, year]
    );

    // If a policy with the same policyNumber and year already exists, rollback and return error
    if (existing.length > 0) {
      await conn.rollback();
      return res
        .status(400)
        .json({ error: "Policy number already exists for this year." });
    }

    // Prepare and execute the INSERT statement with all fields from the schema
    const [result] = await conn.execute(
      `INSERT INTO omp (
    plan, planCode, policyOffice, policyOfficeCode, policyClass, policyClassCode,
    policyNumber, policyDate, policyNo, firstName, lastName, dob, gender, address,
    mobile, email, passport, destination, travelDateFrom, travelDays, travelDateTo,
    countryOfResidence, limitOfCover, currency, premium, vat, total
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan,
        planCode,
        policyOffice,
        policyOfficeCode,
        policyClass,
        policyClassCode,
        policyNumber,
        policyDate,
        policyNo,
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
        currency,
        premium,
        vat,
        total,
      ]
    );

    // If the insert is successful, commit the transaction
    await conn.commit();
    // Respond with success message and the ID of the newly created policy
    res.status(201).json({
      message: "Policy created successfully",
      policyId: result.insertId,
    });
  } catch (err) {
    // If any error occurs, rollback the transaction
    await conn.rollback();
    console.error("CREATE OMP Error:", err);
    // Respond with a server error message
    res.status(500).json({ error: "Server error while creating OMP policy." });
  } finally {
    // Always release the database connection back to the pool
    conn.release();
  }
});

// GET ALL
// router.get("/", verifyToken, async (req, res) => {
//   const conn = await db.getConnection();
//   try {
//     const { mobile, ompNumber, page = 1, limit = 50 } = req.query;
//     const offset = (page - 1) * limit;
//     let whereClause = "WHERE is_deleted = FALSE";
//     let params = [];

//     if (mobile) {
//       whereClause += " AND mobile LIKE ?";
//       params.push(`%${mobile}%`);
//     }

//     if (ompNumber) {
//       whereClause += " AND ompNumber LIKE ?";
//       params.push(`%${ompNumber.toString()}%`);
//     }

//     // Get total count
//     const [countResult] = await conn.execute(
//       `SELECT COUNT(*) as total FROM omp ${whereClause}`,
//       params
//     );
//     const total = countResult[0].total;

//     // Get paginated data
//     const [rows] = await conn.execute(
//       `SELECT * FROM omp ${whereClause} LIMIT ? OFFSET ?`,
//       [...params, Number(limit), Number(offset)]
//     );

//     res.json({ data: rows, total });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: err.message });
//   } finally {
//     conn.release();
//   }
// });
// GET ALL with all possible filters
/*
Pagination:
  /api/omp?page=2&limit=10
Exact Match:
  /api/omp?gender=Male
  /api/omp?planCode=PRO_A
Partial Match:
  /api/omp?policyNumber=OMP123
  /api/omp?firstName=John
  /api/omp?address=Street
Date Range: (Dates should be in 'YYYY-MM-DD' format or similar, compatible with your database)
  /api/omp?policyDateFrom=2023-01-01&policyDateTo=2023-12-31
  /api/omp?dobFrom=1990-01-01 (born after Jan 1, 1990)
Number Range:
  /api/omp?premium_min=100&premium_max=500
  /api/omp?travelDays_min=7 (travel days 7 or more)
Example Combined Query:
  /api/omp?page=1&limit=20&policyNumber=OMP&gender=Female&policyDateFrom=2024-01-01&premium_min=200
*/
router.get("/", verifyToken, async (req, res) => {
  const conn = await db.getConnection(); // Assuming 'db' is your database connection pool
  try {
    // Destructure all possible filter parameters from req.query
    const {
      // Pagination
      page = 1,
      limit = 50,

      // Exact String Filters
      plan,
      planCode,
      policyOffice,
      policyOfficeCode,
      policyClass,
      policyClassCode,
      policyNo,
      gender,
      currency,

      // Partial String (LIKE) Filters
      firstName,
      lastName,
      address,
      email,
      passport,
      destination,
      countryOfResidence,
      mobile, // Kept existing mobile filter
      policyNumber, // Kept existing policyNumber filter

      // Date Range Filters (query params like fieldNameFrom, fieldNameTo)
      policyDateFrom,
      policyDateTo,
      dobFrom,
      dobTo,
      travelDateFrom_start,
      travelDateFrom_end, // Using _start/_end to avoid conflict with 'travelDateFrom' column name
      travelDateTo_start,
      travelDateTo_end, // Using _start/_end for consistency

      // Number Range Filters (query params like fieldName_min, fieldName_max)
      travelDays_min,
      travelDays_max,
      limitOfCover_min,
      limitOfCover_max,
      premium_min,
      premium_max,
      vat_min,
      vat_max,
      total_min,
      total_max,
    } = req.query;

    const offset = (page - 1) * limit; // Calculate offset for pagination

    let whereClause = "WHERE is_deleted = FALSE"; // Base condition for active records
    let params = []; // Array to hold parameters for the SQL query

    // --- Helper Functions to build filters dynamically ---

    // Adds a LIKE filter for string fields (case-insensitive depending on DB collation)
    const addLikeFilter = (field, value) => {
      if (value) {
        whereClause += ` AND ${field} LIKE ?`;
        params.push(`%${value}%`);
      }
    };

    // Adds an exact match filter for various data types
    const addExactFilter = (field, value) => {
      if (value) {
        whereClause += ` AND ${field} = ?`;
        params.push(value);
      }
    };

    // Adds a date range filter (inclusive)
    // Expects dates in a format compatible with MySQL (e.g., 'YYYY-MM-DD')
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

    // Adds a number range filter (inclusive)
    const addNumberRangeFilter = (field, minVal, maxVal) => {
      // Check if value is defined, not null, and can be converted to a number
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
    addLikeFilter("mobile", mobile);
    addLikeFilter("policyNumber", policyNumber); // Renamed from ompNumber
    addLikeFilter("firstName", firstName);
    addLikeFilter("lastName", lastName);
    addLikeFilter("address", address);
    addLikeFilter("email", email);
    addLikeFilter("passport", passport);
    addLikeFilter("destination", destination);
    addLikeFilter("countryOfResidence", countryOfResidence);

    // Exact String Filters
    addExactFilter("plan", plan);
    addExactFilter("planCode", planCode);
    addExactFilter("policyOffice", policyOffice);
    addExactFilter("policyOfficeCode", policyOfficeCode);
    addExactFilter("policyClass", policyClass);
    addExactFilter("policyClassCode", policyClassCode);
    addExactFilter("policyNo", policyNo);
    addExactFilter("gender", gender);
    addExactFilter("currency", currency);

    // Date Range Filters
    addDateRangeFilter("policyDate", policyDateFrom, policyDateTo);
    addDateRangeFilter("dob", dobFrom, dobTo);
    addDateRangeFilter(
      "travelDateFrom",
      travelDateFrom_start,
      travelDateFrom_end
    );
    addDateRangeFilter("travelDateTo", travelDateTo_start, travelDateTo_end);

    // Number Range Filters
    addNumberRangeFilter("travelDays", travelDays_min, travelDays_max);
    addNumberRangeFilter("limitOfCover", limitOfCover_min, limitOfCover_max);
    addNumberRangeFilter("premium", premium_min, premium_max);
    addNumberRangeFilter("vat", vat_min, vat_max);
    addNumberRangeFilter("total", total_min, total_max);

    // --- Execute SQL Queries ---

    // 1. Get total count of records matching the filters
    const [countResult] = await conn.execute(
      `SELECT COUNT(*) as total FROM omp ${whereClause}`,
      params // Pass the dynamically built filter parameters
    );
    const total = countResult[0].total; // Extract total count

    // 2. Get paginated data
    const [rows] = await conn.execute(
      `SELECT * FROM omp ${whereClause} ORDER BY policyDate DESC LIMIT ? OFFSET ?`, // Added ORDER BY for consistent pagination
      [...params, Number(limit), Number(offset)] // Spread existing params, then add limit and offset
    );

    // Respond with the paginated data and total count
    res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("GET ALL OMP Error:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching OMP policies." });
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
// router.patch("/:id", verifyToken, async (req, res) => {
//   const conn = await db.getConnection();
//   try {
//     const { id } = req.params;

//     // Validate input
//     const { error, value } = ompUpdateSchema.validate(req.body, {
//       stripUnknown: true,
//     });
//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }

//     // Check for ompNumber + year(issueDate) duplication
//     if (value.ompNumber && value.issueDate) {
//       const year = new Date(value.issueDate).getFullYear();

//       const [existing] = await conn.execute(
//         "SELECT id FROM omp WHERE ompNumber = ? AND YEAR(issueDate) = ? AND is_deleted = FALSE AND id != ?",
//         [value.ompNumber, year, id]
//       );

//       if (existing.length > 0) {
//         return res.status(400).json({
//           error: `Duplicate ompNumber found for year ${year}.`,
//         });
//       }
//     }

//     // Build dynamic query and params
//     const fields = Object.keys(value);
//     if (fields.length === 0) {
//       return res.status(400).json({ error: "No fields to update." });
//     }

//     const updates = fields.map((field) => `${field} = ?`).join(", ");
//     const params = fields.map((key) => value[key]);
//     params.push(id); // for WHERE id = ?

//     const sql = `UPDATE omp SET ${updates} WHERE id = ?`;

//     const [result] = await conn.execute(sql, params);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Policy not found" });
//     }

//     const [rows] = await conn.execute("SELECT * FROM omp WHERE id = ?", [id]);
//     res.json(rows[0]);
//   } catch (err) {
//     console.error("PATCH Error:", err);
//     res.status(500).json({ error: "Server error while updating policy." });
//   } finally {
//     conn.release();
//   }
// });
// UPDATE
router.patch("/:id", verifyToken, async (req, res) => {
  const conn = await db.getConnection(); // Get a database connection from the pool
  try {
    const { id } = req.params; // Extract the ID from the URL parameters

    // Validate the request body against the ompUpdateSchema
    // stripUnknown: true removes any fields from req.body that are not defined in the schema
    const { error, value } = ompUpdateSchema.validate(req.body, {
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

    // --- Uniqueness Check for policyNumber + year(policyDate) ---
    // This block is crucial to prevent creating a duplicate policyNumber within the same year
    // when either policyNumber or policyDate is being updated.
    if (value.policyNumber || value.policyDate) {
      // Fetch the current policy data to get its original policyNumber and policyDate
      // This is important because the update might only provide one of the two fields.
      const [currentPolicyRows] = await conn.execute(
        "SELECT policyNumber, policyDate FROM omp WHERE id = ? AND is_deleted = FALSE",
        [id]
      );

      if (currentPolicyRows.length === 0) {
        return res.status(404).json({ error: "Policy not found for update." });
      }

      const currentPolicy = currentPolicyRows[0];

      // Determine the policyNumber and policyDate to check against:
      // Use the new value if provided, otherwise use the current (existing) value
      const checkPolicyNumber =
        value.policyNumber !== undefined
          ? value.policyNumber
          : currentPolicy.policyNumber;
      const checkPolicyDate =
        value.policyDate !== undefined
          ? value.policyDate
          : currentPolicy.policyDate;

      // Ensure checkPolicyDate is a valid Date object before getting the year
      let yearToCheck;
      try {
        const dateObj = new Date(checkPolicyDate);
        if (isNaN(dateObj.getTime())) {
          // Handle case where checkPolicyDate might be invalid
          return res.status(400).json({
            error: "Invalid policyDate provided for uniqueness check.",
          });
        }
        yearToCheck = dateObj.getFullYear();
      } catch (dateError) {
        return res.status(400).json({
          error: "Could not process policyDate for uniqueness check.",
        });
      }

      // Check if another policy with the same policyNumber and year exists,
      // excluding the current policy being updated (id != ?).
      const [existingPolicyWithSameNumberAndYear] = await conn.execute(
        "SELECT id FROM omp WHERE policyNumber = ? AND YEAR(policyDate) = ? AND is_deleted = FALSE AND id != ?",
        [checkPolicyNumber, yearToCheck, id]
      );

      if (existingPolicyWithSameNumberAndYear.length > 0) {
        // If a duplicate is found, return an error
        return res.status(400).json({
          error: `A policy with number '${checkPolicyNumber}' already exists for the year ${yearToCheck}.`,
        });
      }
    }

    // --- Dynamic SQL Query Construction ---
    // Create an array of 'field = ?' strings for the UPDATE clause
    const updates = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
    // Create an array of values corresponding to the fields to update
    const params = fieldsToUpdate.map((key) => value[key]);
    params.push(id); // Add the ID to the end of the parameters for the WHERE clause

    // Construct the final SQL UPDATE query
    const sql = `UPDATE omp SET ${updates} WHERE id = ?`;

    // Execute the UPDATE query
    const [result] = await conn.execute(sql, params);

    // Check if any rows were affected (i.e., if the policy was found and updated)
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Policy not found or no changes were applied." });
    }

    // After successful update, fetch the updated record to return it in the response
    const [updatedRows] = await conn.execute("SELECT * FROM omp WHERE id = ?", [
      id,
    ]);
    res.json(updatedRows[0]); // Return the updated policy data
  } catch (err) {
    console.error("PATCH OMP Error:", err); // Log the detailed error
    // Return a 500 Internal Server Error for unhandled exceptions
    res.status(500).json({ error: "Server error while updating OMP policy." });
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
