const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
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
  location: Joi.string().max(100).required(),
  capacity: Joi.number().integer().min(1).required(),
});

const updateRackSchema = Joi.object({
  code: Joi.string()
    .pattern(/^[A-Z0-9]{2,10}$/)
    .optional(),
  location: Joi.string().max(100).optional(),
  capacity: Joi.number().integer().min(1).optional(),
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

const createAuthorSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  birthDate: Joi.date().optional(),
  nationality: Joi.string().max(100).optional(),
});

const updateAuthorSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  birthDate: Joi.date().optional(),
  nationality: Joi.string().max(100).optional(),
}).min(1);

const createFineSchema = Joi.object({
  memberId: Joi.string().hex().length(24).required(),
  bookLendingId: Joi.string().hex().length(24).required(),
  amount: Joi.number().positive().required(),
  reason: Joi.string().max(255).required(),
  status: Joi.string().valid("unpaid", "paid").default("unpaid"),
});

const createBookSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  isbn: Joi.string().alphanum().min(5).max(20).required(),
  categories: Joi.array().items(Joi.string()).required(), // ObjectId list
  publisher: Joi.string().min(2).max(200).required(),
  publicationDate: Joi.date().required(),
  language: Joi.string().min(2).max(50).required(),
  numberOfPages: Joi.number().integer().min(1).required(),
  format: Joi.string()
    .valid("hardcover", "paperback", "ebook", "audiobook")
    .required(),
  authors: Joi.array().items(Joi.string().hex().length(24)).required(), // ObjectId list
  digitalUrl: Joi.string().uri().optional(),
  coverImage: Joi.string().uri().optional(),
});

const updateBookSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  isbn: Joi.string().alphanum().min(5).max(20).optional(),
  categories: Joi.array().items(Joi.string()).optional(),
  publisher: Joi.string().min(2).max(200).optional(),
  publicationDate: Joi.date().optional(),
  language: Joi.string().min(2).max(50).optional(),
  numberOfPages: Joi.number().integer().min(1).optional(),
  format: Joi.string()
    .valid("hardcover", "paperback", "ebook", "audiobook")
    .optional(),
  authors: Joi.array().items(Joi.string().hex().length(24)).optional(),
  digitalUrl: Joi.string().uri().optional(),
  coverImage: Joi.string().uri().optional(),
}).min(1);

const validateCreateAuthor = (data) =>
  createAuthorSchema.validate(data, { abortEarly: false });

const validateUpdateAuthor = (data) =>
  updateAuthorSchema.validate(data, { abortEarly: false });

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(50)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required(),
});

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  parent: Joi.string().hex().length(24).optional().allow(null),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  parent: Joi.string().hex().length(24).optional().allow(null),
}).min(1);

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

const validateCreateBookItem = (data) =>
  createBookItemSchema.validate(data, { abortEarly: false });

const validateUpdateBookItem = (data) =>
  updateBookItemSchema.validate(data, { abortEarly: false });

const validateUpdateBookItemStatus = (data) =>
  updateBookItemStatusSchema.validate(data, { abortEarly: false });

const validateCreateFine = (data) =>
  createFineSchema.validate(data, { abortEarly: false });

const validateCreateBook = (data) =>
  createBookSchema.validate(data, { abortEarly: false });

const validateUpdateBook = (data) =>
  updateBookSchema.validate(data, { abortEarly: false });

const validateForgotPassword = (data) =>
  forgotPasswordSchema.validate(data, { abortEarly: false });

const validateResetPassword = (data) =>
  resetPasswordSchema.validate(data, { abortEarly: false });

const validateCreateCategory = (data) =>
  createCategorySchema.validate(data, { abortEarly: false });

const validateUpdateCategory = (data) =>
  updateCategorySchema.validate(data, { abortEarly: false });

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateUser,
  validateChangePasswordUser,
  validateCreateLibraryCard,
  validateToggleCardStatus,
  validateCreateRack,
  validateUpdateRack,
  validateCreateBookItem,
  validateUpdateBookItem,
  validateUpdateBookItemStatus,
  validateCreateAuthor,
  validateUpdateAuthor,
  validateCreateFine,
  validateCreateBook,
  validateUpdateBook,
  validateForgotPassword,
  validateResetPassword,
  validateCreateCategory,
  validateUpdateCategory,
};
