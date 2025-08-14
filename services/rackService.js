const { Rack, BookItem, Notification, User } = require("../models");
const createError = require("http-errors");

// Create a new rack
async function createRack({ code, location, capacity, requestingUser }) {
  // Check if rack code exists
  const existingRack = await Rack.findOne({ code, isDeleted: false });
  if (existingRack) {
    throw createError(409, "Rack code already exists");
  }

  // Create rack
  const rack = await Rack.create({
    code,
    location,
    capacity,
  });

  // Log action and notify admins/librarians
  await Rack.logAction(
    requestingUser.userId,
    "create_rack",
    { id: rack._id, model: "Rack" },
    "Rack created"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `A new rack "${code}" has been added".`,
      type: "email",
    });
  }

  return {
    rackId: rack._id,
    code,
    location,
    capacity,
  };
}

// Update a rack
async function updateRack(rackId, updates, requestingUser) {
  // Update rack
  const rack = await Rack.findOneAndUpdate(
    { _id: rackId, isDeleted: false },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!rack) {
    throw createError(404, "Rack not found");
  }

  // Log action and notify admins/librarians
  await Rack.logAction(
    requestingUser.userId,
    "update_rack",
    { id: rack._id, model: "Rack" },
    "Rack updated"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Rack "${rack.code}" in library has been updated.`,
      type: "email",
    });
  }

  return {
    rackId: rack._id,
    code: rack.code,
    location: rack.location,
    capacity: rack.capacity,
  };
}

// Get rack by ID
async function getRackById(rackId) {
  const rack = await Rack.findOne({ _id: rackId, isDeleted: false });
  if (!rack) {
    throw createError(404, "Rack not found");
  }
  return rack;
}

// Get all racks with pagination and filters
async function getAllRacks({ page = 1, limit = 10 }) {
  const query = { isDeleted: false };
  const racks = await Rack.find(query)
    .sort({ code: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Rack.countDocuments(query);
  return { racks, total, page: parseInt(page), limit: parseInt(limit) };
}

// Get books on a rack
async function getBooksOnRack(rackId) {
  const rack = await Rack.findOne({ _id: rackId, isDeleted: false });
  if (!rack) {
    throw createError(404, "Rack not found");
  }

  const bookItems = await BookItem.find({
    rack: rackId,
    isDeleted: false,
  })
    .populate("book", "title isbn")
    .select("_id barcode status isReferenceOnly price dateOfPurchase");

  return { rackId, bookItems };
}

// Soft delete a rack
async function deleteRack(rackId, requestingUser) {
  const rack = await Rack.findOneAndUpdate(
    { _id: rackId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!rack) {
    throw createError(404, "Rack not found");
  }

  // Remove rack reference from BookItems
  await BookItem.updateMany(
    { rack: rackId, isDeleted: false },
    { $unset: { "placedAt.rack": "" } }
  );

  // Log action and notify admins/librarians
  await Rack.logAction(
    requestingUser.userId,
    "delete_rack",
    { id: rack._id, model: "Rack" },
    "Rack soft deleted"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Rack "${rack.code}" in library has been removed.`,
      type: "email",
    });
  }

  return { message: "Rack deleted" };
}

module.exports = {
  createRack,
  updateRack,
  getRackById,
  getAllRacks,
  getBooksOnRack,
  deleteRack,
};
