const { Payment, Fine, User, Notification } = require("../models");
const createError = require("http-errors");

// Create a payment
async function createPayment({
  fineId,
  amount,
  method,
  transactionId,
  requestingUser,
}) {
  // Check if fine exists and is unpaid
  const fine = await Fine.findOne({
    _id: fineId,
    isDeleted: false,
    status: "unpaid",
  });
  if (!fine) {
    throw createError(404, "Fine not found or already paid");
  }

  // Validate amount
  if (amount !== fine.amount) {
    throw createError(400, "Payment amount must match fine amount");
  }

  // Create payment
  const payment = await Payment.create({
    fine: fineId,
    amount,
    method,
    transactionId: transactionId || null,
    paidDate: new Date(),
  });

  // Update fine status
  fine.status = "paid";
  await fine.save();

  // Log action and notify member and admins/librarians
  await Payment.logAction(
    requestingUser.userId,
    "create_payment",
    { id: payment._id, model: "Payment" },
    `Payment created for fine ${fineId}`
  );
  await Notification.create({
    member: fine.member,
    content: `Your fine of ${amount} for "${fine.reason}" has been paid via ${method}.`,
    type: "email",
  });
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Payment of ${amount} for fine "${fine.reason}" by ${user.name} has been processed.`,
      type: "email",
    });
  }

  return {
    paymentId: payment._id,
    fineId: payment.fine,
    amount: payment.amount,
    method: payment.method,
    transactionId: payment.transactionId,
    paidDate: payment.paidDate,
  };
}

// Get payments by fine ID
async function getPaymentsByFine(fineId) {
  const fine = await Fine.findOne({ _id: fineId, isDeleted: false });
  if (!fine) {
    throw createError(404, "Fine not found");
  }

  const payments = await Payment.find({ fine: fineId, isDeleted: false })
    .populate("fine", "reason amount member")
    .sort({ paidDate: -1 });

  return payments;
}

// Get payments by member ID
async function getPaymentsByMember(memberId, requestingUser) {
  // Restrict members to their own payments
  if (requestingUser.role === "member" && requestingUser.userId !== memberId) {
    throw createError(403, "Unauthorized");
  }

  const user = await User.findOne({ _id: memberId, isDeleted: false });
  if (!user) {
    throw createError(404, "User not found");
  }

  const payments = await Payment.find({
    fine: {
      $in: await Fine.find({ member: memberId, isDeleted: false }).select(
        "_id"
      ),
    },
    isDeleted: false,
  })
    .populate("fine", "reason amount")
    .sort({ paidDate: -1 });

  return payments;
}

// Get all payments with pagination and filters
async function getAllPayments({ fineId, memberId, page = 1, limit = 10 }) {
  const query = { isDeleted: false };
  if (fineId) query.fine = fineId;
  if (memberId) {
    const fines = await Fine.find({
      member: memberId,
      isDeleted: false,
    }).select("_id");
    query.fine = { $in: fines.map((f) => f._id) };
  }

  const payments = await Payment.find(query)
    .populate("fine", "reason amount member")
    .sort({ paidDate: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Payment.countDocuments(query);
  return { payments, total, page: parseInt(page), limit: parseInt(limit) };
}

// Soft delete a payment
async function deletePayment(paymentId, requestingUser) {
  const payment = await Payment.findOneAndUpdate(
    { _id: paymentId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!payment) {
    throw createError(404, "Payment not found");
  }

  // Revert fine status
  const fine = await Fine.findById(payment.fine);
  if (fine) {
    fine.status = "unpaid";
    await fine.save();
  }

  // Log action and notify member and admins/librarians
  await Payment.logAction(
    requestingUser.userId,
    "delete_payment",
    { id: payment._id, model: "Payment" },
    "Payment soft deleted"
  );
  await Notification.create({
    member: fine.member,
    content: `The payment of ${payment.amount} for fine "${fine.reason}" has been deleted.`,
    type: "email",
  });
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Payment of ${payment.amount} for fine "${fine.reason}" by ${user.name} has been deleted.`,
      type: "email",
    });
  }

  return { message: "Payment deleted" };
}

module.exports = {
  createPayment,
  getPaymentsByFine,
  getPaymentsByMember,
  getAllPayments,
  deletePayment,
};
