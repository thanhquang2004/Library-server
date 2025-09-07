const {
  createRack,
  updateRack,
  getRackById,
  getAllRacks,
  getBooksOnRack,
  deleteRack,
  absoluteDeleteRack
} = require("../services/rackService");
const { validateCreateRack, validateUpdateRack } = require("../utils/validate");

exports.createRack = async (req, res, next) => {
  try {
    const { error } = validateCreateRack(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const rack = await createRack({ ...req.body, requestingUser: req.user });
    res.status(201).json({ success: true, data: rack });
  } catch (error) {
    next(error);
  }
};

exports.updateRack = async (req, res, next) => {
  try {
    const { error } = validateUpdateRack(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const rack = await updateRack(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: rack });
  } catch (error) {
    next(error);
  }
};

exports.getRack = async (req, res, next) => {
  try {
    const rack = await getRackById(req.params.id);
    res.status(200).json({ success: true, data: rack });
  } catch (error) {
    next(error);
  }
};

exports.getAllRacks = async (req, res, next) => {
  try {
    const result = await getAllRacks(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getBooksOnRack = async (req, res, next) => {
  try {
    const result = await getBooksOnRack(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.deleteRack = async (req, res, next) => {
  try {
    const result = await deleteRack(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.absoluteDeleteRack = async (req, res, next) => {
  try {
    const result = await absoluteDeleteRack(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};