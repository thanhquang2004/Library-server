const { Category, Book, User, Notification } = require("../models");
const createError = require("http-errors");

// Create a category
async function createCategory({ name, description, parent, requestingUser }) {
  // Check for duplicate name
  const existingCategory = await Category.findOne({
    name: { $eq: name },
    isDeleted: false,
  });
  if (existingCategory) {
    throw createError(409, "Category name already exists");
  }

  // Validate parent category if provided
  if (parent) {
    const parentCategory = await Category.findOne({
      _id: { $eq: parent },
      isDeleted: false,
    });
    if (!parentCategory) {
      throw createError(404, "Parent category not found");
    }
  }

  // Create category
  const category = await Category.create({
    name,
    description,
    parent: parent || null,
  });

  // Log action and notify admins/librarians
  await Category.logAction(
    requestingUser.userId,
    "create_category",
    { id: category._id, model: "Category" },
    `Category ${name} created`
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `A new category "${name}" has been created.`,
      type: "email",
    });
  }

  return {
    categoryId: category._id,
    name: category.name,
    description: category.description,
    parent: category.parent,
  };
}

// Update a category
async function updateCategory(categoryId, updates, requestingUser) {
  // Only allow specific fields to be updated
  const allowedKeys = ["name", "description", "parent"];
  const safeUpdates = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      safeUpdates[key] = updates[key];
    }
  }

  // Check for duplicate name
  if (updates.name) {
    if (safeUpdates.name) {
      // Ensure the name is a string before querying to avoid NoSQL injection
      if (typeof updates.name !== "string") {
        throw createError(400, "Invalid category name");
      }
      const existingCategory = await Category.findOne({
        name: updates.name,
        name: { $eq: updates.name },
        isDeleted: false,
        _id: { $ne: categoryId },
      });
      if (existingCategory) {
        throw createError(409, "Category name already exists");
      }
    }
  }

  // Validate parent category if updated
  if (updates.parent) {
    const parentCategory = await Category.findOne({
      _id: { $eq: updates.parent },
      isDeleted: false,
    });
    if (!parentCategory) {
      throw createError(404, "Parent category not found");
    }
    // Prevent self-referencing
    if (updates.parent.toString() === categoryId) {
      throw createError(400, "Category cannot be its own parent");
    }
  }

  // Update category
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, isDeleted: false },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!category) {
    throw createError(404, "Category not found");
  }

  // Log action and notify admins/librarians
  await Category.logAction(
    requestingUser.userId,
    "update_category",
    { id: category._id, model: "Category" },
    `Category ${category.name} updated`
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Category "${category.name}" has been updated.`,
      type: "email",
    });
  }

  return {
    categoryId: category._id,
    name: category.name,
    description: category.description,
    parent: category.parent,
  };
}

// Get all categories
async function getAllCategories({ page = 1, limit = 10, parent }) {
  const query = { isDeleted: false };
  if (parent) {
    query.parent = { $eq: parent };
  } else if (parent === null) {
    query.parent = null;
  }

  const categories = await Category.find(query)
    .populate("parent", "name")
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Category.countDocuments(query);
  return { categories, total, page: parseInt(page), limit: parseInt(limit) };
}

// Get books by category
async function getBooksByCategory(categoryName, { page = 1, limit = 10 }) {
  // Validate category existence
  const category = await Category.findOne({
    name: categoryName,
    isDeleted: false,
  });
  if (!category) {
    throw createError(404, "Category not found");
  }

  // Find books where category name is in the categories array
  const books = await Book.find({ categories: categoryName, isDeleted: false })
    .populate("authors", "name")
    .select(
      "title isbn categories publisher publicationDate language numberOfPages format digitalUrl coverImage"
    )
    .sort({ title: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Book.countDocuments({
    categories: categoryName,
    isDeleted: false,
  });
  return { books, total, page: parseInt(page), limit: parseInt(limit) };
}

// Get subcategories
async function getSubcategories(categoryId, { page = 1, limit = 10 }) {
  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  });
  if (!category) {
    throw createError(404, "Category not found");
  }

  const subcategories = await Category.find({
    parent: categoryId,
    isDeleted: false,
  })
    .populate("parent", "name")
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Category.countDocuments({
    parent: categoryId,
    isDeleted: false,
  });
  return { subcategories, total, page: parseInt(page), limit: parseInt(limit) };
}

// Delete a category (soft delete)
async function deleteCategory(categoryId, requestingUser) {
  // Check for subcategories
  const subcategories = await Category.findOne({
    parent: categoryId,
    isDeleted: false,
  });
  if (subcategories) {
    throw createError(400, "Cannot delete category with subcategories");
  }

  // Check for associated books
  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  });
  if (!category) {
    throw createError(404, "Category not found");
  }
  const books = await Book.findOne({
    categories: category.name,
    isDeleted: false,
  });
  if (books) {
    throw createError(400, "Cannot delete category with associated books");
  }

  // Soft delete category
  const deletedCategory = await Category.findOneAndUpdate(
    { _id: categoryId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  // Log action and notify admins/librarians
  await Category.logAction(
    requestingUser.userId,
    "delete_category",
    { id: category._id, model: "Category" },
    `Category ${category.name} deleted`
  );
  const adminsAndLibrarians = await User.find({
    role: { $in: ["admin", "librarian"] },
    isDeleted: false,
  });
  for (const user of adminsAndLibrarians) {
    await Notification.create({
      member: user._id,
      content: `Category "${category.name}" has been deleted.`,
      type: "email",
    });
  }

  return { message: "Category deleted" };
}

module.exports = {
  createCategory,
  updateCategory,
  getAllCategories,
  getBooksByCategory,
  getSubcategories,
  deleteCategory,
};
