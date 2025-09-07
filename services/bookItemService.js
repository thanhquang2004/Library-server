const { BookItem, Book, Rack, User, Notification } = require("../models");
const createError = require("http-errors");

// Generate a unique barcode
async function generateBarcode() {
  const prefix = "BOOK";
  let barcode;
  let isUnique = false;
  while (!isUnique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    barcode = `${prefix}-${randomNum}`;
    const existing = await BookItem.findOne({ barcode, isDeleted: false });
    if (!existing) isUnique = true;
  }
  return barcode;
}

// Create a new book item
async function createBookItem({
  bookId,
  isReferenceOnly,
  price,
  rackId,
  requestingUser,
}) {
  // Check if book exists
  const book = await Book.findOne({ _id: bookId, isDeleted: false });
  if (!book) {
    throw createError(404, "Book not found");
  }

  // Check if rack exists (if provided)
  let rack;
  if (rackId) {
    rack = await Rack.findOne({ _id: rackId, isDeleted: false });
    if (!rack) {
      throw createError(404, "Rack not found");
    }
  }

  // Generate barcode
  const barcode = await generateBarcode();

  // Create book item
  const bookItem = await BookItem.create({
    book: bookId,
    barcode,
    isReferenceOnly: isReferenceOnly || false,
    price,
    status: "available",
    dateOfPurchase: new Date(),
    rack: rackId || null,
  });

  // Log action and notify admins/librarians
  await BookItem.logAction(
    requestingUser.userId,
    "create_book_item",
    { id: bookItem._id, model: "BookItem" },
    "Book item created"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `A new book item "${barcode}" for book "${book.title}" has been added.`,
      type: "email",
    });
  }

  return {
    bookItemId: bookItem._id,
    barcode: bookItem.barcode,
    bookId: bookItem.book,
    isReferenceOnly: bookItem.isReferenceOnly,
    price: bookItem.price,
    status: bookItem.status,
    dateOfPurchase: bookItem.dateOfPurchase,
    rackId: bookItem.rack,
  };
}

// Update a book item
async function updateBookItem(bookItemId, updates, requestingUser) {
  // Check if book exists (if updated)
  if (updates.bookId) {
    const book = await Book.findOne({ _id: updates.bookId, isDeleted: false });
    if (!book) {
      throw createError(404, "Book not found");
    }
  }

  // Check if rack exists (if updated)
  if (updates.rackId) {
    const rack = await Rack.findOne({ _id: updates.rackId, isDeleted: false });
    if (!rack) {
      throw createError(404, "Rack not found");
    }
  }

  // Update book item
  const bookItem = await BookItem.findOneAndUpdate(
    { _id: bookItemId, isDeleted: false },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!bookItem) {
    throw createError(404, "Book item not found");
  }

  // Log action and notify admins/librarians
  const book = await Book.findById(bookItem.book);
  await BookItem.logAction(
    requestingUser.userId,
    "update_book_item",
    { id: bookItem._id, model: "BookItem" },
    "Book item updated"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Book item "${bookItem.barcode}" for book "${book.title}" has been updated.`,
      type: "email",
    });
  }

  return {
    bookItemId: bookItem._id,
    barcode: bookItem.barcode,
    bookId: bookItem.book,
    isReferenceOnly: bookItem.isReferenceOnly,
    price: bookItem.price,
    status: bookItem.status,
    dateOfPurchase: bookItem.dateOfPurchase,
    rackId: bookItem.rack,
  };
}

// Get book item by barcode
async function getBookItemByBarcode(barcode) {
  const bookItem = await BookItem.findOne({ barcode, isDeleted: false })
    .populate("book", "title isbn")
    .populate("rack", "code location");
  if (!bookItem) {
    throw createError(404, "Book item not found");
  }
  return bookItem;
}

// Get all book items with pagination and filters
async function getAllBookItems({
  bookId,
  rackId,
  status,
  page = 1,
  limit = 10,
}) {
  const query = { isDeleted: false };
  if (bookId) query.book = bookId;
  if (rackId) query.rack = rackId;
  if (status) query.status = status;

  const bookItems = await BookItem.find(query)
    .populate("book", "title isbn")
    .populate("rack", "code location")
    .sort({ barcode: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await BookItem.countDocuments(query);
  return { bookItems, total, page: parseInt(page), limit: parseInt(limit) };
}

// Update book item status
async function updateBookItemStatus(bookItemId, status, requestingUser) {
  // Validate status
  const validStatuses = ["available", "loaned", "reserved"];
  if (!validStatuses.includes(status)) {
    throw createError(400, "Invalid status");
  }

  const bookItem = await BookItem.findOne({
    _id: bookItemId,
    isDeleted: false,
  });
  if (!bookItem) {
    throw createError(404, "Book item not found");
  }

  // Prevent status change for reference-only books
  if (bookItem.isReferenceOnly && status !== "available") {
    throw createError(400, "Reference-only books cannot be loaned or reserved");
  }

  bookItem.status = status;
  await bookItem.save();

  // Log action and notify admins/librarians
  const book = await Book.findById(bookItem.book);
  await BookItem.logAction(
    requestingUser.userId,
    "update_book_item_status",
    { id: bookItem._id, model: "BookItem" },
    `Book item status updated to ${status}`
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Book item "${bookItem.barcode}" for book "${book.title}" status changed to ${status}.`,
      type: "email",
    });
  }

  return {
    bookItemId: bookItem._id,
    barcode: bookItem.barcode,
    status: bookItem.status,
  };
}

// Soft delete a book item
async function deleteBookItem(bookItemId, requestingUser) {
  const bookItem = await BookItem.findOneAndUpdate(
    { _id: bookItemId, isDeleted: false },
    { isDeleted: true, status: "available" },
    { new: true }
  );
  if (!bookItem) {
    throw createError(404, "Book item not found");
  }

  // Log action and notify admins/librarians
  const book = await Book.findById(bookItem.book);
  await BookItem.logAction(
    requestingUser.userId,
    "soft_delete_book_item",
    { id: bookItem._id, model: "BookItem" },
    "Book item soft deleted"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Book item "${bookItem.barcode}" for book "${book.title}" has been removed.`,
      type: "email",
    });
  }

  return { message: "Book item deleted" };
}

// Hard delete a book item
async function hardDeleteBookItem(bookItemId, requestingUser) {
  const bookItem = await BookItem.findOne({ _id: bookItemId });
  if (!bookItem) {
    throw createError(404, "Book item not found");
  }

  await BookItem.deleteOne({ _id: bookItemId });

  // Log action and notify admins/librarians
  const book = await Book.findById(bookItem.book);
  await BookItem.logAction(
    requestingUser.userId,
    "hard_delete_book_item",
    { id: bookItem._id, model: "BookItem" },
    "Book item hard deleted"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Book item "${bookItem.barcode}" for book "${book.title}" has been hard removed.`,
      type: "email",
    });
  }

  return { message: "Book item hard deleted successfull" };
}

module.exports = {
  createBookItem,
  updateBookItem,
  getBookItemByBarcode,
  getAllBookItems,
  updateBookItemStatus,
  deleteBookItem,
  hardDeleteBookItem,
};
