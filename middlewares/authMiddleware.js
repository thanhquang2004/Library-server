const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Secret dùng để ký JWT (bạn đặt trong .env)
const JWT_SECRET = process.env.JWT_SECRET || "secret_key_example";

// Xác thực người dùng
exports.auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user; // gắn user vào request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Kiểm tra quyền Librarian hoặc Admin
exports.isLibrarianOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role === "librarian" || req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Librarian/Admin only" });
};