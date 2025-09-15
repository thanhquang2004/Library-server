// controllers/bookLendingController.js
const service = require("../services/bookLendingService");
const {
  validateCreateLending,
  validateExtendLending,
} = require("../utils/validate");

async function createLending(req, res) {
  const error = validateCreateLending(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const lending = await service.createLending(req.body, req.user);
    return res.status(201).json(lending);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function returnBook(req, res) {
  const lending = await service.returnBook(req.params.id, req.user);
  if (!lending) return res.status(404).json({ error: "Lending not found" });
  return res.json({
    bookLendingId: lending.bookLendingId,
    returnDate: lending.returnDate,
    status: lending.status,
  });
}

async function extendLending(req, res) {
  const error = validateExtendLending(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const lending = await service.extendLending(
      req.params.id,
      req.body.newDueDate,
      req.user
    );
    if (!lending) return res.status(404).json({ error: "Lending not found" });
    return res.json({
      bookLendingId: lending.bookLendingId,
      dueDate: lending.dueDate,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function checkOverdue(req, res) {
  const result = await service.checkOverdue(req.params.id, req.user);
  if (!result) return res.status(404).json({ error: "Lending not found" });
  return res.json(result);
}

async function getLendings(req, res) {
  const { memberId, status } = req.query;
  const result = await service.getLendings({ memberId, status });
  return res.json(result);
}

async function getLendingById(req, res) {
  const lending = await service.getLendingById(req.params.id);
  if (!lending) return res.status(404).json({ error: "Lending not found" });
  return res.json(lending);
}

async function deleteLending(req, res) {
  const lending = await service.deleteLending(req.params.id);
  if (!lending) return res.status(404).json({ error: "Lending not found" });
  return res.json({ message: "Lending deleted" });
}

async function hardDeleteLending(req, res) {
  const lending = await service.hardDeleteLending(req.params.id);
  if (!lending) return res.status(404).json({ error: "Lending not found" });
  return res.json({ message: "Lending hard deleted" });
}

module.exports = {
  createLending,
  returnBook,
  extendLending,
  checkOverdue,
  getLendings,
  getLendingById,
  deleteLending,
  hardDeleteLending,
};
