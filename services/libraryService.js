const { Library, User, Notification, Rack, BookItem } = require("../models");
const createError = require("http-errors");

// Create a new library
async function createLibrary({ name, address, requestingUser }) {
  // Check if library name exists
  const existingLibrary = await Library.findOne({ name, isDeleted: false });
  if (existingLibrary) {
    throw createError(409, "Library name already exists");
  }

  // Create library
  const library = await Library.create({
    name,
    address,
  });

  // Log action and notify admins/librarians
  await Library.logAction(
    requestingUser.userId,
    "create_library",
    { id: library._id, model: "Library" },
    "Library created"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `A new library "${name}" has been created at ${address}.`,
      type: "email",
    });
  }

  return {
    libraryId: library._id,
    name: library.name,
    address: library.address,
  };
}

// Update a library
async function updateLibrary(libraryId, updates, requestingUser) {
  // Check if updated name exists
  if (updates.name) {
    const existingLibrary = await Library.findOne({
      name: updates.name,
      isDeleted: false,
      _id: { $ne: libraryId },
    });
    if (existingLibrary) {
      throw createError(409, "Library name already exists");
    }
  }

  // Update library
  const library = await Library.findOneAndUpdate(
    { _id: libraryId, isDeleted: false },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!library) {
    throw createError(404, "Library not found");
  }

  // Log action and notify admins/librarians
  await Library.logAction(
    requestingUser.userId,
    "update_library",
    { id: library._id, model: "Library" },
    "Library updated"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Library "${library.name}" at ${library.address} has been updated.`,
      type: "email",
    });
  }

  return {
    libraryId: library._id,
    name: library.name,
    address: library.address,
  };
}

// Get library by ID
async function getLibraryById(libraryId) {
  const library = await Library.findOne({
    _id: libraryId,
    isDeleted: false,
  });
  if (!library) {
    throw createError(404, "Library not found");
  }
  return library;
}

// Get all libraries with pagination
async function getAllLibraries({ page = 1, limit = 10 }) {
  const query = { isDeleted: false };

  const libraries = await Library.find(query)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Library.countDocuments(query);
  return { libraries, total, page: parseInt(page), limit: parseInt(limit) };
}

// Soft delete a library
async function deleteLibrary(libraryId, requestingUser) {
  const library = await Library.findOneAndUpdate(
    { _id: libraryId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!library) {
    throw createError(404, "Library not found");
  }

  // Soft delete related racks
  const racks = await Rack.find({ library: libraryId, isDeleted: false });
  for (const rack of racks) {
    rack.isDeleted = true;
    await rack.save();

    // Remove rack references from BookItems
    await BookItem.updateMany(
      { rack: rack._id, isDeleted: false },
      { $unset: { "placedAt.rack": "" } }
    );
  }

  // Log action and notify admins/librarians
  await Library.logAction(
    requestingUser.userId,
    "delete_library",
    { id: library._id, model: "Library" },
    "Library soft deleted"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Library "${library.name}" at ${library.address} has been removed.`,
      type: "email",
    });
  }

  return { message: "Library deleted" };
}

module.exports = {
  createLibrary,
  updateLibrary,
  getLibraryById,
  getAllLibraries,
  deleteLibrary,
};
