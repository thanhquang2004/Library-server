// controllers/authorController.js
const Author = require('../models/Author');
const Book = require('../models/Book');

exports.createAuthor = async (req, res) => {
  const { name, description, birthDate, nationality } = req.body;
  if (!name) return res.status(400).json({ error: "Invalid data" });

  const author = new Author({ name, description, birthDate, nationality });
  await author.save();

  res.status(201).json({
    name: author.name,
    description: author.description,
    birthDate: author.birthDate,
    nationality: author.nationality,
    books: author.books
  });
};

exports.updateAuthor = async (req, res) => {
  const { id } = req.params;
  const { name, description, birthDate, nationality } = req.body;

  const author = await Author.findById(id);
  if (!author) return res.status(404).json({ error: "Author not found" });

  author.name = name ?? author.name;
  author.description = description ?? author.description;
  author.birthDate = birthDate ?? author.birthDate;
  author.nationality = nationality ?? author.nationality;

  await author.save();

  res.json({
    authorId: author.authorId,
    name: author.name,
    description: author.description,
    birthDate: author.birthDate,
    nationality: author.nationality,
    books: author.books
  });
};

exports.getAuthor = async (req, res) => {
  const { id } = req.params;
  const author = await Author.findById(id).populate('books');

  if (!author) return res.status(404).json({ error: "Author not found" });

  res.json({
    authorId: author.authorId,
    name: author.name,
    description: author.description,
    nationality: author.nationality,
    books: author.books
  });
};

exports.getBooksByAuthor = async (req, res) => {
  const { id } = req.params;

  const books = await Book.find({ authors: id });

  const result = books.map(book => ({
    bookId: book._id,
    title: book.title,
    categories: book.categories,
    ISBN: book.ISBN,
    phublisher: book.phublisher,
    publicationDate: book.publicationDate,
    language: book.language,
    numberOfPages: book.numberOfPages,
    format: book.format,
    authors: book.authors,
    digitalUrl: book.digitalUrl,
    coverImage: book.coverImage,
  }));

  res.json(result);
};

exports.searchAuthors = async (req, res) => {
  const { name } = req.query;
  const authors = await Author.find({ name: { $regex: name, $options: "i" } }).populate('books');

  const result = authors.map(author => ({
    authorId: author._id,
    name: author.name,
    description: author.description,
    nationality: author.nationality,
    books: author.books
  }));

  res.json(result);
};

exports.deleteAuthor = async (req, res) => {
  const { id } = req.params;

  try {
    const author = await Author.findById(id);

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }

    // Nếu author có sách tham chiếu → không cho xóa
    if (author.books && author.books.length > 0) {
      return res.status(400).json({ error: "Author cannot be deleted: still referenced by books" });
    }

    // XÓA MỀM: đánh dấu isDeleted = true
    author.isDeleted = true;
    await author.save();

    return res.status(200).json({ message: "Author deleted (soft)" });

  } catch (error) {
    console.error("Delete author error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
