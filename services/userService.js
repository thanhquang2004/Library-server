const { User, Book, BookLending, Notification } = require("../models");
const { hashPassword } = require("../utils/hash");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

// Register a new user
async function register({
  name,
  email,
  password,
  role,
  address,
  phone,
  preferences,
  language,
  requestingUser,
}) {
  // Check if requesting user has permission to set role
  if (
    role !== "member" &&
    (!requestingUser || requestingUser.role !== "admin")
  ) {
    throw createError(403, "Only admin can create librarian/admin accounts");
  }

  const existingUser = await User.findOne({ email, isDeleted: false });
  if (existingUser) {
    throw createError(409, "Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: (role || "member").toLowerCase(),
    address,
    phone,
    preferences,
    language,
    dateOfMembership: new Date(),
    accountStatus: "active",
  });

  await User.logAction(
    user._id,
    "register",
    { id: user._id, model: "User" },
    "User registered"
  );
  await Notification.create({
    member: user._id,
    content: `Your account has been successfully registered.`,
    type: "email",
  });

  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Login user
async function login({ email, password }) {
  const user = await User.findOne({ email, isDeleted: false });
  if (!user || !(await user.comparePassword(password))) {
    throw createError(401, "Invalid credentials");
  }

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  await User.logAction(
    user._id,
    "login",
    { id: user._id, model: "User" },
    "User logged in"
  );

  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  };
}

// Update user
async function updateUser(userId, updates, requestingUser) {
  if (requestingUser.role === "member" && requestingUser.userId !== userId) {
    throw createError(403, "Unauthorized");
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw createError(404, "User not found");
  }

  await User.logAction(
    requestingUser.userId,
    "update_user",
    { id: user._id, model: "User" },
    "User updated"
  );

  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Get user by ID
async function getUserById(userId, requestingUser) {
  if (requestingUser.role === "member" && requestingUser.userId !== userId) {
    throw createError(403, "Unauthorized");
  }

  const user = await User.findOne({ _id: userId, isDeleted: false }).select(
    "-password"
  );
  if (!user) {
    throw createError(404, "User not found");
  }
  return user;
}

// Get all users with pagination and filters
async function getAllUsers({ role, accountStatus, page = 1, limit = 10 }) {
  const query = { isDeleted: false };
  if (role) query.role = role;
  if (accountStatus) query.accountStatus = accountStatus;

  const users = await User.find(query)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);
  return { users, total, page: parseInt(page), limit: parseInt(limit) };
}

// Get borrow history
async function getBorrowHistory(userId, requestingUser) {
  if (requestingUser.role === "member" && requestingUser.userId !== userId) {
    throw createError(403, "Unauthorized");
  }

  const lendings = await BookLending.find({ member: userId }).populate(
    "bookItem"
  );
  return lendings;
}

// Get recommended books
async function getRecommendedBooks(userId, requestingUser) {
  if (requestingUser.role !== "member" || requestingUser.userId !== userId) {
    throw createError(403, "Unauthorized");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createError(404, "User not found");
  }

  const books = await Book.find({
    categories: { $in: user.preferences },
  }).limit(10);
  return books;
}

// Toggle account status
async function toggleAccountStatus(userId, requestingUser) {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    throw createError(404, "User not found");
  }

  user.accountStatus = user.accountStatus === "active" ? "blocked" : "active";
  await user.save();

  await User.logAction(
    requestingUser.userId,
    "toggle_status",
    { id: user._id, model: "User" },
    `User status set to ${user.accountStatus}`
  );
  await Notification.create({
    member: user._id,
    content: `Your account has been ${user.accountStatus}.`,
    type: "email",
  });

  return { userId: user._id, accountStatus: user.accountStatus };
}

// Soft delete user
async function deleteUser(userId, requestingUser) {
  const user = await User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    { isDeleted: true, accountStatus: "blocked" },
    { new: true }
  );
  if (!user) {
    throw createError(404, "User not found");
  }

  await User.logAction(
    requestingUser.userId,
    "delete_user",
    { id: user._id, model: "User" },
    "User soft deleted"
  );
  await Notification.create({
    member: user._id,
    content: `Your account has been deactivated.`,
    type: "email",
  });

  return { message: "User deleted" };
}

module.exports = {
  register,
  login,
  updateUser,
  getUserById,
  getAllUsers,
  getBorrowHistory,
  getRecommendedBooks,
  toggleAccountStatus,
  deleteUser,
};
