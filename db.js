// db.js
const mysql = require("mysql2");

// Development
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // or your MySQL password
  database: "bgicqr",
});

// Production
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "bgicl_bgic_omp_qr",
//   password: "ap3!i*(!7?Wd", // or your MySQL password
//   database: "bgicl_bgic_omp_qr",
// });

module.exports = pool.promise();
