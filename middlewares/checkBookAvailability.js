const BookItem = require('../models/BookItem');

exports.checkBookAvailability = async (req, res, next) => {
  try {
    const bookItemId = req.body.bookItemId || req.params.bookItemId;
    if (!bookItemId) {
      return res.status(400).json({ message: 'Missing bookItemId' });
    }
    const bookItem = await BookItem.findById(bookItemId);
    if (!bookItem || bookItem.status !== 'available') {
      return res.status(400).json({ message: 'Book is not available' });
    }
    next();
  } catch (err) {
    next(err);
  }
};
