const {
  createCategory,
  updateCategory,
  getAllCategories,
  getBooksByCategory,
  getSubcategories,
  deleteCategory,
} = require("../services/categoryService");
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../utils/validate");

exports.createCategory = async (req, res, next) => {
  try {
    const { error } = validateCreateCategory(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await createCategory({
      ...req.body,
      requestingUser: req.user,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { error } = validateUpdateCategory(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await updateCategory(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const result = await getAllCategories(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getBooksByCategory = async (req, res, next) => {
  try {
    const result = await getBooksByCategory(req.params.name, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getSubcategories = async (req, res, next) => {
  try {
    const result = await getSubcategories(req.params.id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const result = await deleteCategory(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
