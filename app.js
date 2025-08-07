const express = require("express");
const cors = require("cors");

// Require
const bookRoutes = require("./routes/bookRoutes");
const lendingRoutes = require("./routes/lendingRoutes");
const authRoutes = require("./routes/authRoutes");
const authorRouter = require("./routes/authorRoutes")
const fineRouter = require("./routes/finesRoutes")

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/books", bookRoutes);
app.use("/api/lendings", lendingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/author", authorRouter);
app.use("/api/fines", fineRouter);

module.exports = app;
