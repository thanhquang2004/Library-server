const Fine = require('../models/Fine');

exports.createFine = async ({ memberId, bookLendingId, amount, reason }) => {
  if (!memberId || !bookLendingId || !amount) {
    throw new Error("Invalid data");
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
  return populatedFine;
};

exports.markAsPaid = async (fineId) => {
  const fine = await Fine.findById(fineId);
  if (!fine) {
    throw new Error("Fine not found");
  }

  fine.status = "paid";
  await fine.save();

  return fine;
};

exports.getFinesByUser = async (memberId) => {
  const fines = await Fine.find({ member: memberId }).populate("bookLending");

  return fines.map(fine => ({
    fineId: fine._id,
    bookLending: fine.bookLending,
    amount: fine.amount,
    reason: fine.reason,
    status: fine.status
  }));
};

exports.getUnpaidTotal = async (memberId) => {
  const fines = await Fine.find({ member: memberId, status: "unpaid" });
  const total = fines.reduce((sum, fine) => sum + fine.amount, 0);
  return total;
};

exports.getFines = async ({ memberId, status }) => {
  const query = {};
  if (memberId) query.member = memberId;
  if (status) query.status = status;

  const fines = await Fine.find(query).populate('member');

  return fines.map(fine => ({
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
};

exports.deleteFine = async (fineId) => {
  const fine = await Fine.findById(fineId);
  if (!fine) {
    throw new Error('Fine not found');
  }

  fine.isDeleted = true;
  await fine.save();

  return true;
};
