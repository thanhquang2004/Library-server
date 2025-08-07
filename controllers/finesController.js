const Fine = require('../models/Fines');

// Tạo khoản phạt mới
exports.createFine = async (req, res) => {
  try {
    const { memberId, bookLendingId, amount, reason } = req.body;

    if (!memberId || !bookLendingId || !amount) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const fine = new Fine({
      member: memberId,
      bookLending: bookLendingId,
      amount,
      reason,
      created: new Date()
    });

    await fine.save();

    const populatedFine = await fine.populate('bookLending');

    res.status(201).json({
      fineId: populatedFine._id,
      bookLending: populatedFine.bookLending,
      amount: populatedFine.amount,
      reason: populatedFine.reason,
      status: populatedFine.status
    });
  } catch (error) {
    console.log("error server: ", error)
    res.status(500).json({ error: "Server error" });
  }
};

// Đánh dấu khoản phạt đã thanh toán
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const fine = await Fine.findById(id);
    if (!fine) {
      return res.status(404).json({ error: "Fine not found" });
    }

    fine.status = "paid";
    await fine.save();

    res.status(200).json({ fineId: fine._id, status: fine.status });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy danh sách khoản phạt của một người dùng
exports.getFinesByUser = async (req, res) => {
  try {
    const { memberId } = req.params;

    const fines = await Fine.find({ member: memberId }).populate("bookLending");

    const result = fines.map(fine => ({
      fineId: fine._id,
      bookLending: fine.bookLending,
      amount: fine.amount,
      reason: fine.reason,
      status: fine.status
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Tính tổng tiền phạt chưa thanh toán
exports.getUnpaidTotal = async (req, res) => {
  try {
    const { memberId } = req.params;

    const fines = await Fine.find({ member: memberId, status: "unpaid" });
    const total = fines.reduce((sum, fine) => sum + fine.amount, 0);

    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy danh sách tiền phạt (có lọc)
exports.getFines = async (req, res) => {
  try {
    const { memberId, status } = req.query;

    const query = {};
    if (memberId) query.member = memberId;
    if (status) query.status = status;

    const fines = await Fine.find(query)
      .populate('member')

    const result = fines.map(fine => ({
      fineId: fine._id,
      member: {
        _id: fine.member._id,
        email: fine.member.email,
        role: fine.member.role
      },
      amount: fine.amount,
      reason: fine.reason,
      status: fine.status
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteFine = async (req, res) => {
  const { id } = req.params;

  try {
    const fine = await Fine.findById(id);

    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    // Xóa mềm
    fine.isDeleted = true;
    await fine.save();

    return res.status(200).json({ message: 'Fine deleted (soft)' });

  } catch (error) {
    console.error('Delete fine error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};