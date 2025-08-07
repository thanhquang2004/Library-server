const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');
const { auth, isLibrarianOrAdmin  } = require('../middlewares/authMiddleware');

router.post('/', auth, isLibrarianOrAdmin, authorController.createAuthor);

router.put('/:id', auth, isLibrarianOrAdmin, authorController.updateAuthor);

router.get('/search', auth, authorController.searchAuthors);

router.get('/:id', auth, authorController.getAuthor);

router.get('/:id/books', auth, authorController.getBooksByAuthor);

router.delete('/:id', auth, isLibrarianOrAdmin, authorController.deleteAuthor);

module.exports = router;
