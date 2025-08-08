const fineService = require('../services/fineService');

exports.createFine = async (req, res) => {
  try {
    const fine = await fineService.createFine(req.body);

    res.status(201).json({
      fineId: fine._id,
      bookLending: fine.bookLending,
      amount: fine.amount,
      reason: fine.reason,
      status: fine.status
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const fine = await fineService.markAsPaid(req.params.id);

    res.status(200).json({ fineId: fine._id, status: fine.status });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getFinesByUser = async (req, res) => {
  try {
    const result = await fineService.getFinesByUser(req.params.memberId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUnpaidTotal = async (req, res) => {
  try {
    const total = await fineService.getUnpaidTotal(req.params.memberId);
    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getFines = async (req, res) => {
  try {
    const result = await fineService.getFines(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteFine = async (req, res) => {
  try {
    await fineService.deleteFine(req.params.id);
    res.status(200).json({ message: 'Fine deleted (soft)' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
