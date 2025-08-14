const {
  updateUser,
  getUserById,
  getAllUsers,
  getBorrowHistory,
  getRecommendedBooks,
  toggleAccountStatus,
  changePassword,
  deleteUser,
} = require("../services/userService");
const {
  validateUpdateUser,
  validateChangePasswordUser,
} = require("../utils/validate");

exports.getUser = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id, req.user);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await updateUser(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const result = await getAllUsers(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getBorrowHistory = async (req, res, next) => {
  try {
    const lendings = await getBorrowHistory(req.params.id, req.user);
    res.status(200).json({ success: true, data: lendings });
  } catch (error) {
    next(error);
  }
};

exports.getRecommendedBooks = async (req, res, next) => {
  try {
    const books = await getRecommendedBooks(req.params.id, req.user);
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
};

exports.toggleAccountStatus = async (req, res, next) => {
  try {
    const result = await toggleAccountStatus(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { error } = validateChangePasswordUser(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    const result = await changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
