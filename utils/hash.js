const bcrypt = require("bcrypt");

/**
 * Hash mật khẩu
 * @param {string} password - Mật khẩu gốc
 * @param {number} saltRounds - Số vòng mã hóa (default: 10)
 * @returns {Promise<string>} - Mật khẩu đã hash
 */
async function hashPassword(password, saltRounds = 10) {
  if (!password) throw new Error("Password is required");
  const hashed = await bcrypt.hash(password, saltRounds);
  return hashed;
}

module.exports = {
  hashPassword,
};
