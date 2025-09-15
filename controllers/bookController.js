const bookService = require("../services/bookService");

const { validateCreateBook, validateUpdateBook } = require("../utils/validate");

exports.createBook = async (req, res) => {
  try {
    const { error } = validateCreateBook(req.body);
    if (error) throw new Error(error.details.map((d) => d.message).join(", "));

    const book = await bookService.createBook(req.body, req.user);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { error } = validateUpdateBook(req.body);
    if (error) throw new Error(error.details.map((d) => d.message).join(", "));

    const book = await bookService.updateBook(req.params.id, req.body, req.user);
    res.json(book);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    res.json(book);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const books = await bookService.searchBooks(req.query.query || "");
    res.json(books);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBookItems = async (req, res) => {
  try {
    const items = await bookService.getBookItems(req.params.id);
    res.json(items);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.checkAvailable = async (req, res) => {
  try {
    const result = await bookService.checkAvailable(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const result = await bookService.deleteBook(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.hardDeleteBook = async (req, res) => {
  try {
    const result = await bookService.hardDeleteBook(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
