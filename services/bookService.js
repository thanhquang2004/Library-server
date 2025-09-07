const { Book, BookItem, Author, Notification } = require("../models/Book");

exports.createBook = async (data, requestingUser) => {
  if (!data.title || !data.isbn) throw new Error("Invalid data");

  const exists = await Book.findOne({ isbn: data.isbn, isDeleted: false });
  if (exists) throw new Error("Book with this isbn already exists");

  // Log action and notify admins/librarians
  await Book.logAction(
    requestingUser.userId,
    "created_book",
    { id: book._id, model: "Book" },
    "Book created"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Book "${book.title}" in library has been created.`,
      type: "email",
    });
  }

  const book = new Book(data);
  await book.save();

  // Thêm bookId vào Author.books
  if (data.authors && data.authors.length) {
    await Author.updateMany(
      { _id: { $in: data.authors } },
      { $addToSet: { books: book._id } }
    );
  }

  return book;
};

exports.updateBook = async (id, data, requestingUser) => {
  const book = await Book.findOne({ _id: id, isDeleted: false });
  if (!book) throw new Error("Book not found");

  // Log action and notify admins/librarians
  await Book.logAction(
    requestingUser.userId,
    "updated_book",
    { id: book._id, model: "Book" },
    "Book updated"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Book "${book.title}" in library has been updated.`,
      type: "email",
    });
  }

  Object.assign(book, data);
  await book.save();

  return book;
};

exports.getBookById = async (id) => {
  const book = await Book.findOne({ _id: id, isDeleted: false }).populate(
    "authors"
  );
  if (!book) throw new Error("Book not found");
  return book;
};

exports.searchBooks = async (query) => {
  const filter = {
    isDeleted: false,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { isbn: { $regex: query, $options: "i" } },
      { categories: { $regex: query, $options: "i" } },
    ],
  };
  return Book.find(filter).populate("authors");
};

exports.getBookItems = async (bookId) => {
  return BookItem.find({ book: bookId }).lean();
};

exports.checkAvailable = async (bookId) => {
  const availableItem = await BookItem.findOne({
    book: bookId,
    status: "available",
  });
  return { available: !!availableItem };
};

exports.deleteBook = async (bookId, requestingUser) => {
  const relatedItems = await BookItem.findOne({ book: bookId });
  if (relatedItems)
    throw new Error("Cannot delete book with existing BookItems");

  const book = await Book.findOne({ _id: bookId, isDeleted: false });
  if (!book) throw new Error("Book not found");

  // Log action and notify admins/librarians
  await Book.logAction(
    requestingUser.userId,
    "Soft_deleted_book",
    { id: book._id, model: "Book" },
    "Book soft deleted"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Book "${book.title}" in library has been soft deleted.`,
      type: "email",
    });
  }

  book.isDeleted = true;
  await book.save();

  // Xóa tham chiếu trong Author.books
  await Author.updateMany({ books: book._id }, { $pull: { books: book._id } });

  return { message: "Book deleted" };
};

exports.hardDeleteBook = async (bookId) => {
  const relatedItems = await BookItem.findOne({ book: bookId });
  if (relatedItems)
    throw new Error("Cannot delete book with existing BookItems");

  const book = await Book.findOne({ _id: bookId });
  if (!book) throw new Error("Book not found");

  await Book.deleteOne({ _id: bookId });

  // Xóa tham chiếu trong Author.books
  await Author.updateMany({ books: book._id }, { $pull: { books: book._id } });

  return { message: "Book hard deleted successfull" };
};
