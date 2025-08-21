const authorService = require('../services/authorService');

const {
  validateCreateAuthor,
  validateUpdateAuthor,
} = require("../utils/validate");

exports.createAuthor = async (req, res) => {
  try {
    const { error } = validateCreateAuthor(req.body);
    if (error) throw new Error(error.details.map((d) => d.message).join(", "));

    const author = await authorService.createAuthor(req.body);
    res.status(201).json({
      name: author.name,
      description: author.description,
      birthDate: author.birthDate,
      nationality: author.nationality,
      books: author.books
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    const { error } = validateUpdateAuthor(req.body);
    if (error) throw new Error(error.details.map((d) => d.message).join(", "));

    const author = await authorService.updateAuthor(req.params.id, req.body);
    res.status(200).json({
      authorId: author.authorId,
      name: author.name,
      description: author.description,
      birthDate: author.birthDate,
      nationality: author.nationality,
      books: author.books
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getAuthor = async (req, res) => {
  try {
    const author = await authorService.getAuthor(req.params.id);
    res.status(200).json({
      authorId: author.authorId,
      name: author.name,
      description: author.description,
      nationality: author.nationality,
      books: author.books
    });;
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.getBooksByAuthor = async (req, res) => {
  try {
    const books = await authorService.getBooksByAuthor(req.params.id);
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchAuthors = async (req, res) => {
  try {
    const result = await authorService.searchAuthors(req.query.name);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAuthor = async (req, res) => {
  try {
    await authorService.deleteAuthor(req.params.id);
    res.status(200).json({ message: "Author deleted (soft)" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};