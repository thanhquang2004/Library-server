const {
  createLibrary,
  updateLibrary,
  getLibraryById,
  getAllLibraries,
  deleteLibrary,
} = require("../services/libraryService");
const {
  validateCreateLibrary,
  validateUpdateLibrary,
} = require("../utils/validate");

exports.createLibrary = async (req, res, next) => {
  try {
    const { error } = validateCreateLibrary(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const library = await createLibrary({
      ...req.body,
      requestingUser: req.user,
    });
    res.status(201).json({ success: true, data: library });
  } catch (error) {
    next(error);
  }
};

exports.updateLibrary = async (req, res, next) => {
  try {
    const { error } = validateUpdateLibrary(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const library = await updateLibrary(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: library });
  } catch (error) {
    next(error);
  }
};

exports.getLibrary = async (req, res, next) => {
  try {
    const library = await getLibraryById(req.params.id);
    res.status(200).json({ success: true, data: library });
  } catch (error) {
    next(error);
  }
};

exports.getAllLibraries = async (req, res, next) => {
  try {
    const result = await getAllLibraries(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.deleteLibrary = async (req, res, next) => {
  try {
    const result = await deleteLibrary(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
