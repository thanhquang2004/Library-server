const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

exports.sanitizeMiddleware = [
  mongoSanitize(),
  xss()
];
