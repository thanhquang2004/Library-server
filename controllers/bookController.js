const Book = require("../models/Book");

// [GET] /api/books
exports.getBooks = async (req, res) => {
  try {
    const { title, subject } = req.query;
    let filter = {};
    if (title) filter.title = { $regex: title, $options: "i" };
    if (subject) filter.subject = { $regex: subject, $options: "i" };

    const books = await Book.find(filter).populate("authors");
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [GET] /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("authors");
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [POST] /api/books
exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    const saved = await book.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// [PUT] /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Book not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// [DELETE] /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
