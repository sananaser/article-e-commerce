const Category = require("../models/Category");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// Slugify helper
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new ErrorResponse("Please add a category name", 400));
  }

  const slug = slugify(name);

  // Check if slug or name exists
  const existingCategory = await Category.findOne({
    $or: [{ name: { $regex: new RegExp(`^${name}$`, "i") } }, { slug }],
  });
  if (existingCategory) {
    return next(new ErrorResponse("Category name or slug already exists", 400));
  }

  const category = await Category.create({
    name,
    slug,
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().lean();

  const counts = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.count])
  );

  const data = categories.map((cat) => ({
    ...cat,
    productCount: countMap[cat._id.toString()] || 0,
  }));

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new ErrorResponse("Please add a category name", 400));
  }

  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  const slug = slugify(name);

  // Check if the new name exists in another category
  const duplicate = await Category.findOne({
    _id: { $ne: req.params.id },
    $or: [{ name: { $regex: new RegExp(`^${name}$`, "i") } }, { slug }],
  });

  if (duplicate) {
    return next(new ErrorResponse("Another category with this name or slug already exists", 400));
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, slug },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category with ${productCount} linked product(s). Reassign or remove them first.`,
        400
      )
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
