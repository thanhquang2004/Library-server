const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  role: Joi.string().valid("member", "librarian", "admin").default("member"),
  address: Joi.string().max(200).optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional(),
  preferences: Joi.array().items(Joi.string()).optional(),
  language: Joi.string().max(50).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  address: Joi.string().max(200).optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional(),
  preferences: Joi.array().items(Joi.string()).optional(),
  language: Joi.string().max(50).optional(),
}).min(1); // Require at least one field to update

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).max(50).required(),
  newPassword: Joi.string()
    .min(8)
    .max(50)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required(),
});

const validateRegister = (data) =>
  registerSchema.validate(data, { abortEarly: false });
const validateLogin = (data) =>
  loginSchema.validate(data, { abortEarly: false });
const validateUpdateUser = (data) =>
  updateUserSchema.validate(data, { abortEarly: false });
const validateChangePasswordUser = (data) =>
  changePasswordSchema.validate(data, { abortEarly: false });

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateUser,
  validateChangePasswordUser,
};
