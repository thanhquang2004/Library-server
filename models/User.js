const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const AuditLog = require("./AuditLog");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["member", "librarian", "admin"],
      required: true,
    },
    address: { type: String },
    phone: { type: String },
    dateOfMembership: { type: Date, default: Date.now },
    totalBooksCheckedout: { type: Number, default: 0 },
    accountStatus: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    libraryCard: { type: mongoose.Schema.Types.ObjectId, ref: "LibraryCard" },
    fines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fine" }],
    preferences: [{ type: String }],
    language: { type: String, default: "vi" },
    lastLogin: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// So sánh mật khẩu
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Kiểm tra vai trò
UserSchema.methods.hasRole = function (role) {
  return this.role === role;
};

// Ghi nhật ký hành động
UserSchema.statics.logAction = async function (
  userId,
  action,
  target,
  details
) {
  await AuditLog.create({
    user: userId,
    action,
    target,
    details,
    timestamp: new Date(),
  });
};

module.exports = mongoose.model("User", UserSchema);
