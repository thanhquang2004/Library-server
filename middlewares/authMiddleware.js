const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { User } = require("../models");

async function authenticate(req, res, next) {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError(401, "No token provided");
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !decoded.role) {
      throw createError(401, "Invalid token");
    }

    // Find user by ID and ensure they are not deleted
    const user = await User.findOne({ _id: decoded.userId, isDeleted: false });
    if (!user) {
      throw createError(401, "User not found or deactivated");
    }

    // Attach user info to request
    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticate;
