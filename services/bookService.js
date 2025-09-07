const Book = require("../models/Book");
const BookItem = require("../models/BookItem");
const Author = require("../models/Author");

exports.createBook = async (data) => {
  if (!data.title || !data.isbn) throw new Error("Invalid data");

  const exists = await Book.findOne({ isbn: data.isbn, isDeleted: false });
  if (exists) throw new Error("Book with this isbn already exists");

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

exports.updateBook = async (id, data) => {
  const book = await Book.findOne({ _id: id, isDeleted: false });
  if (!book) throw new Error("Book not found");

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

exports.deleteBook = async (bookId) => {
  const relatedItems = await BookItem.findOne({ book: bookId });
  if (relatedItems)
    throw new Error("Cannot delete book with existing BookItems");

  const book = await Book.findOne({ _id: bookId, isDeleted: false });
  if (!book) throw new Error("Book not found");

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
