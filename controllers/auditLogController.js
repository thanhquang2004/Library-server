const {
  createAuditLog,
  getAuditLogsByUser,
  getAuditLogsByModel,
  getAllAuditLogs,
} = require("../services/auditlogService");
const { validateCreateAuditLog } = require("../utils/validate");

exports.createAuditLog = async (req, res, next) => {
  try {
    const { error } = validateCreateAuditLog(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const auditLog = await createAuditLog(req.body);
    res.status(201).json({ success: true, data: auditLog });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogsByUser = async (req, res, next) => {
  try {
    const result = await getAuditLogsByUser(req.params.userId, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogsByModel = async (req, res, next) => {
  try {
    const result = await getAuditLogsByModel(req.params.model, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getAllAuditLogs = async (req, res, next) => {
  try {
    const result = await getAllAuditLogs(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
