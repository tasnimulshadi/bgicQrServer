const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());

// cors
app.use(cors());

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/omp", require("./routes/ompRoutes"));
app.use("/api/v1/mr", require("./routes/mrRoutes"));

// To catch unhandled routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// To catch unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
