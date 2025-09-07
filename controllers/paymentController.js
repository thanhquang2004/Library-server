const {
  createPayment,
  getPaymentsByFine,
  getPaymentsByMember,
  getAllPayments,
  deletePayment,
  absoluteDeletePayment
} = require("../services/paymentService");
const { validateCreatePayment } = require("../utils/validate");

exports.createPayment = async (req, res, next) => {
  try {
    const { error } = validateCreatePayment(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const payment = await createPayment({
      ...req.body,
      requestingUser: req.user,
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentsByFine = async (req, res, next) => {
  try {
    const payments = await getPaymentsByFine(req.params.fineId);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentsByMember = async (req, res, next) => {
  try {
    const payments = await getPaymentsByMember(req.params.memberId, req.user);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const result = await getAllPayments(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const result = await deletePayment(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.absoluteDeletePayment = async (req, res, next) => {
  try {
    const result = await absoluteDeletePayment(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
