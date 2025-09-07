const { Fine, Notification, User } = require('../models');

exports.createFine = async ({ memberId, bookLendingId, amount, reason, requestingUser }) => {
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

  // Log action and notify member and admins/librarians
  await Fine.logAction(
    requestingUser.userId,
    "delete_fine",
    { id: fine._id, model: "Fine" },
    "fine created"
  );
  await Notification.create({
    member: fine.member,
    content: `The fine of ${fine.amount} for fine "${fine.reason}" has been created.`,
    type: "email",
  });
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Fine of ${fine.amount} for fine "${fine.reason}" by ${user.name} has been created.`,
      type: "email",
    });
  }

  await fine.save();

  const populatedFine = await fine.populate('bookLending');


  return populatedFine;
};

exports.markAsPaid = async (fineId, requestingUser) => {
  const fine = await Fine.findById(fineId);
  if (!fine) {
    throw new Error("Fine not found");
  }

  // Log action and notify member and admins/librarians
  await Fine.logAction(
    requestingUser.userId,
    "update_fine",
    { id: fine._id, model: "Fine" },
    "fine updated"
  );
  await Notification.create({
    member: fine.member,
    content: `The fine of ${fine.amount} for fine "${fine.reason}" has been deleted.`,
    type: "email",
  });
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Fine of ${fine.amount} for fine "${fine.reason}" by ${user.name} has been updated.`,
      type: "email",
    });
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

exports.deleteFine = async (fineId, requestingUser) => {
  const fine = await Fine.findById(fineId);
  if (!fine) {
    throw new Error('Fine not found');
  }

  // Log action and notify member and admins/librarians
  await Fine.logAction(
    requestingUser.userId,
    "deleted_fine",
    { id: fine._id, model: "Fine" },
    "fine deleted"
  );
  await Notification.create({
    member: fine.member,
    content: `The fine of ${fine.amount} for fine "${fine.reason}" has been deleted.`,
    type: "email",
  });
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Fine of ${fine.amount} for fine "${fine.reason}" by ${user.name} has been deleted.`,
      type: "email",
    });
  }

  fine.isDeleted = true;
  await fine.save();

  return true;
};

exports.absoluteDeleteFine = async (fineId, requestingUser) => {
  const fine = await Fine.findById(fineId);
  if (!fine) {
    throw new Error('Fine not found');
  }

  // Log action and notify member and admins/librarians
  await Fine.logAction(
    requestingUser.userId,
    "Absolute_deleted_fine",
    { id: fine._id, model: "Fine" },
    "fine absolute deleted"
  );
  await Notification.create({
    member: fine.member,
    content: `The fine of ${fine.amount} for fine "${fine.reason}" has been absolutely deleted.`,
    type: "email",
  });
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Fine of ${fine.amount} for fine "${fine.reason}" by ${user.name} has been absolutely deleted.`,
      type: "email",
    });
  }

  await fine.deleteOne();

  return true;
};