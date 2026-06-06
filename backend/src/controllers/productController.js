const Product = require("../models/Product");
const Category = require("../models/Category");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, brand, images, stock, featured } = req.body;

  // Validate category existence if provided
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(new ErrorResponse(`Category not found with id of ${category}`, 404));
    }
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    images: images || [],
    stock: stock || 0,
    featured: featured || false,
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Get all products (with pagination, search, filter)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from matching (handled separately)
  const removeFields = ["select", "sort", "page", "limit", "search", "categorySlug"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc.)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // Finding resource
  let queryObj = JSON.parse(queryStr);

  // Search by name (case-insensitive regex)
  if (req.query.search) {
    queryObj.name = { $regex: req.query.search, $options: "i" };
  }

  // Filter by category slug (if category parameter is passed as a slug)
  if (req.query.categorySlug) {
    const cat = await Category.findOne({ slug: req.query.categorySlug });
    if (cat) {
      queryObj.category = cat._id;
    } else {
      // If category slug not found, make query return nothing
      queryObj.category = null;
    }
  }

  query = Product.find(queryObj).populate({
    path: "category",
    select: "name slug",
  });

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments(queryObj);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const products = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination,
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: "category",
    select: "name slug",
  });

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Validate category if updating
  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return next(new ErrorResponse(`Category not found with id of ${req.body.category}`, 404));
    }
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
