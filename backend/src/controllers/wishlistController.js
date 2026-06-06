const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// Helper to populate wishlist
const getPopulatedWishlist = async (userId) => {
  return await Wishlist.findOne({ user: userId }).populate({
    path: "products",
    select: "name price description images stock brand",
  });
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new ErrorResponse("Please provide a product ID", 400));
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });
  } else {
    // Check if product is already in wishlist
    if (wishlist.products.includes(productId)) {
      return next(new ErrorResponse("Product already in wishlist", 400));
    }

    wishlist.products.push(productId);
    await wishlist.save();
  }

  const populatedWishlist = await getPopulatedWishlist(req.user._id);

  res.status(200).json({
    success: true,
    data: populatedWishlist,
  });
});

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await getPopulatedWishlist(req.user._id);

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.status(200).json({
    success: true,
    data: wishlist,
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new ErrorResponse("Wishlist not found", 404));
  }

  // Filter out the product
  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();

  const populatedWishlist = await getPopulatedWishlist(req.user._id);

  res.status(200).json({
    success: true,
    data: populatedWishlist,
  });
});

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
