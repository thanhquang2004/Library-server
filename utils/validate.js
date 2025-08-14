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
}).min(1);

const createLibraryCardSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  cardNumber: Joi.string()
    .pattern(/^LIB\d{4}$/)
    .required(),
});

const toggleCardStatusSchema = Joi.object({}).allow(null);

const createRackSchema = Joi.object({
  code: Joi.string()
    .pattern(/^[A-Z0-9]{2,10}$/)
    .required(),
  libraryId: Joi.string().hex().length(24).required(),
  location: Joi.string().max(100).required(),
  capacity: Joi.number().integer().min(1).required(),
});

const updateRackSchema = Joi.object({
  code: Joi.string()
    .pattern(/^[A-Z0-9]{2,10}$/)
    .optional(),
  libraryId: Joi.string().hex().length(24).optional(),
  location: Joi.string().max(100).optional(),
  capacity: Joi.number().integer().min(1).optional(),
}).min(1);

const createLibrarySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().max(200).required(),
});

const updateLibrarySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  address: Joi.string().max(200).optional(),
}).min(1);

const createBookItemSchema = Joi.object({
  bookId: Joi.string().hex().length(24).required(),
  isReferenceOnly: Joi.boolean().optional(),
  price: Joi.number().min(0).optional(),
  rackId: Joi.string().hex().length(24).optional(),
});

const updateBookItemSchema = Joi.object({
  bookId: Joi.string().hex().length(24).optional(),
  isReferenceOnly: Joi.boolean().optional(),
  price: Joi.number().min(0).optional(),
  rackId: Joi.string().hex().length(24).optional().allow(null),
}).min(1);

const updateBookItemStatusSchema = Joi.object({
  status: Joi.string().valid("available", "loaned", "reserved").required(),
});

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

const validateCreateLibraryCard = (data) =>
  createLibraryCardSchema.validate(data, { abortEarly: false });

const validateToggleCardStatus = (data) =>
  toggleCardStatusSchema.validate(data, { abortEarly: false });

const validateCreateRack = (data) =>
  createRackSchema.validate(data, { abortEarly: false });
const validateUpdateRack = (data) =>
  updateRackSchema.validate(data, { abortEarly: false });

const validateCreateLibrary = (data) =>
  createLibrarySchema.validate(data, { abortEarly: false });

const validateUpdateLibrary = (data) =>
  updateLibrarySchema.validate(data, { abortEarly: false });

const validateCreateBookItem = (data) =>
  createBookItemSchema.validate(data, { abortEarly: false });

const validateUpdateBookItem = (data) =>
  updateBookItemSchema.validate(data, { abortEarly: false });

const validateUpdateBookItemStatus = (data) =>
  updateBookItemStatusSchema.validate(data, { abortEarly: false });

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateUser,
  validateChangePasswordUser,
  validateCreateLibraryCard,
  validateToggleCardStatus,
  validateCreateRack,
  validateUpdateRack,
  validateCreateLibrary,
  validateUpdateLibrary,
  validateCreateBookItem,
  validateUpdateBookItem,
  validateUpdateBookItemStatus,
};
