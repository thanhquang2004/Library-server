const Author = require('../models/Author');
const Book = require('../models/Book');
const User = require("../models/User");
const Notification = require("../models/Notification")

exports.createAuthor = async (data, requestingUser) => {
  const { name, description, birthDate, nationality } = data;
  if (!name) throw new Error("Invalid data");

  const author = new Author({ name, description, birthDate, nationality });
  await author.save();

  // Log action and notify admins/librarians
  await Author.logAction(
    requestingUser.userId,
    "create_author",
    { id: author._id, model: "Author" },
    "Author created"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Author "${author.name}" has been created.`,
      type: "email",
    });
  }

  return author;
};

exports.updateAuthor = async (id, data, requestingUser) => {
  const author = await Author.findById(id);
  if (!author) throw new Error("Author not found");

  author.name = data.name ?? author.name;
  author.description = data.description ?? author.description;
  author.birthDate = data.birthDate ?? author.birthDate;
  author.nationality = data.nationality ?? author.nationality;
  author.books = data.books ?? author.books;

  await author.save();

  // Log action and notify admins/librarians
  await Author.logAction(
    requestingUser.userId,
    "update_author",
    { id: author._id, model: "Author" },
    "Author updated"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Author "${author.name}" has been updated.`,
      type: "email",
    });
  }
  return author;
};

exports.getAllAuthors = async () => {
  const authors = await Author.find().populate("books");

  return authors.map((author) => ({
    authorId: author._id,
    name: author.name,
    description: author.description,
    birthDate: author.birthDate,
    nationality: author.nationality,
    books: author.books,
  }));
};

exports.getAuthor = async (id) => {
  const author = await Author.findById(id).populate("books");
  if (!author) throw new Error("Author not found");
  return author;
};

exports.getBooksByAuthor = async (authorId) => {
  const books = await Book.find({ authors: authorId });
  return books.map((book) => ({
    bookId: book._id,
    title: book.title,
    categories: book.categories,
    ISBN: book.isbn,
    phublisher: book.publisher,
    publicationDate: book.publicationDate,
    language: book.language,
    numberOfPages: book.numberOfPages,
    format: book.format,
    authors: book.authors,
    digitalUrl: book.digitalUrl,
    coverImage: book.coverImage,
  }));
};

exports.searchAuthors = async (name) => {
  const authors = await Author.find({
    name: { $regex: name, $options: "i" },
  }).populate("books");

  return authors.map((author) => ({
    authorId: author._id,
    name: author.name,
    description: author.description,
    nationality: author.nationality,
    books: author.books,
  }));
};

exports.deleteAuthor = async (id, requestingUser) => {
  const author = await Author.findById(id);
  if (!author) throw new Error("Author not found");

  if (author.books && author.books.length > 0) {
    throw new Error("Author cannot be deleted: still referenced by books");
  }

  // Log action and notify admins/librarians
  await Author.logAction(
    requestingUser.userId,
    "soft_delete_author",
    { id: author._id, model: "Author" },
    "Author soft deleted"
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Author "${author.name}" has been soft deleted.`,
      type: "email",
    });
  }

  author.isDeleted = true;
  await author.save();
  return true;
};

exports.hardDeleteAuthor = async (id) => {
  const author = await Author.findById(id);
  if (!author) throw new Error("Author not found");

  if (author.books && author.books.length > 0) {
    throw new Error("Author cannot be deleted: still referenced by books");
  }

  await Author.deleteOne({ _id: id });
  return true;
};
