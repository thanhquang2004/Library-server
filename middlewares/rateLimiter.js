const rateLimit = require("express-rate-limit");

/**
 * Hàm tạo rate limiter theo cấu hình
 * @param {number} windowMs - Thời gian tính bằng ms (vd: 15 * 60 * 1000 = 15 phút)
 * @param {number} max - Số request tối đa trong windowMs
 * @param {string} message - Thông báo khi bị giới hạn
 * @returns Middleware rateLimiter
 */
function rateLimiter(
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests, please try again later."
) {
  return rateLimit({
    windowMs,
    max,
    message: { message },
  });
}

module.exports = rateLimiter;
