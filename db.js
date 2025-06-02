// db.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // or your MySQL password
  database: "bgicqr",
});

module.exports = pool.promise();
