const BookLending = require("../models/BookLending");
const BookItem = require("../models/BookItem");

// [GET] /api/lendings
exports.getLendings = async (req, res) => {
  try {
    const { member } = req.query;
    let filter = {};
    if (member) filter.member = member;

    const lendings = await BookLending.find(filter)
      .populate("bookItem")
      .populate("member");
    res.json(lendings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [GET] /api/lendings/:id
exports.getLendingById = async (req, res) => {
  try {
    const lending = await BookLending.findById(req.params.id)
      .populate("bookItem")
      .populate("member");
    if (!lending)
      return res.status(404).json({ message: "Lending record not found" });
    res.json(lending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [POST] /api/lendings
exports.createLending = async (req, res) => {
  try {
    const { bookItem, member, dueDate } = req.body;

    // Update bookItem status
    const bookItemDoc = await BookItem.findById(bookItem);
    if (!bookItemDoc || bookItemDoc.status !== "available") {
      return res.status(400).json({ message: "BookItem not available" });
    }
    bookItemDoc.status = "loaned";
    await bookItemDoc.save();

    const lending = new BookLending({
      bookItem,
      member,
      creationDate: new Date(),
      dueDate,
      status: "borrowed",
    });
    const saved = await lending.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// [PUT] /api/lendings/:id/return
exports.returnLending = async (req, res) => {
  try {
    const lending = await BookLending.findById(req.params.id);
    if (!lending)
      return res.status(404).json({ message: "Lending record not found" });

    lending.returnDate = new Date();
    lending.status = "returned";
    await lending.save();

    // Update bookItem status back to available
    await BookItem.findByIdAndUpdate(lending.bookItem, { status: "available" });

    res.json(lending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
