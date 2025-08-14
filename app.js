require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const allowedOrigins = process.env.CORS_ORIGINS.split(",");
const app = express();

// Require
const bookRoutes = require("./routes/bookRoutes");
const lendingRoutes = require("./routes/lendingRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const authorRoutes = require("./routes/authorRoutes");
const fineRoutes = require("./routes/finesRoutes");
const libraryCardRoutes = require("./routes/libraryCardRoutes");
const rackRoutes = require("./routes/rackRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const bookItemRoutes = require("./routes/bookItemRoutes");

app.use(cors());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Giới hạn 100 yêu cầu mỗi IP
  })
);

// Routes
app.use("/api/books", bookRoutes);
app.use("/api/lendings", lendingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/author", authorRoutes);
app.use("/api/fines", fineRoutes);
app.use("/api/library-cards", libraryCardRoutes);
app.use("/api/racks", rackRoutes);
app.use("/api/libraries", libraryRoutes);
app.use("/api/book-items", bookItemRoutes);

module.exports = app;
