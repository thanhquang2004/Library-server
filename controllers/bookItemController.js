const {
  createBookItem,
  updateBookItem,
  getBookItemByBarcode,
  getAllBookItems,
  updateBookItemStatus,
  deleteBookItem,
  hardDeleteBookItem,
} = require("../services/bookItemService");
const {
  validateCreateBookItem,
  validateUpdateBookItem,
  validateUpdateBookItemStatus,
} = require("../utils/validate");

exports.createBookItem = async (req, res, next) => {
  try {
    const { error } = validateCreateBookItem(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const bookItem = await createBookItem({
      ...req.body,
      requestingUser: req.user,
    });
    res.status(201).json({ success: true, data: bookItem });
  } catch (error) {
    next(error);
  }
};

exports.updateBookItem = async (req, res, next) => {
  try {
    const { error } = validateUpdateBookItem(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const bookItem = await updateBookItem(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: bookItem });
  } catch (error) {
    next(error);
  }
};

exports.getBookItem = async (req, res, next) => {
  try {
    const bookItem = await getBookItemByBarcode(req.params.barcode);
    res.status(200).json({ success: true, data: bookItem });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookItems = async (req, res, next) => {
  try {
    const result = await getAllBookItems(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.updateBookItemStatus = async (req, res, next) => {
  try {
    const { error } = validateUpdateBookItemStatus(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const bookItem = await updateBookItemStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    res.status(200).json({ success: true, data: bookItem });
  } catch (error) {
    next(error);
  }
};

exports.deleteBookItem = async (req, res, next) => {
  try {
    const result = await deleteBookItem(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.hardDeleteBookItem = async (req, res, next) => {
  try {
    const result = await hardDeleteBookItem(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
