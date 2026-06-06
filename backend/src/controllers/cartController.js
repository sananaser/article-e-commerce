const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// Helper to populate cart items
const getPopulatedCart = async (userId) => {
  return await Cart.findOne({ user: userId }).populate({
    path: "products.product",
    select: "name price description images stock brand",
  });
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity, 10) || 1;

  if (!productId) {
    return next(new ErrorResponse("Please provide a product ID", 400));
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
  }

  // Verify stock
  if (product.stock < qty) {
    return next(new ErrorResponse(`Not enough stock. Only ${product.stock} items left.`, 400));
  }

  // Find user's cart or create new
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      products: [{ product: productId, quantity: qty }],
    });
  } else {
    // Check if product already exists in cart
    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists, increment quantity
      const newQty = cart.products[itemIndex].quantity + qty;
      if (product.stock < newQty) {
        return next(
          new ErrorResponse(
            `Cannot add more. Only ${product.stock} items available in stock.`,
            400
          )
        );
      }
      cart.products[itemIndex].quantity = newQty;
    } else {
      // Product does not exist, push to array
      cart.products.push({ product: productId, quantity: qty });
    }

    await cart.save();
  }

  const populatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    data: populatedCart,
  });
});

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res, next) => {
  let cart = await getPopulatedCart(req.user._id);

  // If cart doesn't exist, return empty products array
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, products: [] });
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Update quantity of item in cart
// @route   PUT /api/cart/quantity
// @access  Private
const updateQuantity = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (!productId || qty === undefined || isNaN(qty) || qty < 1) {
    return next(new ErrorResponse("Please provide a valid product ID and quantity (min 1)", 400));
  }

  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ErrorResponse("Cart not found", 404));
  }

  // Check if product is in cart
  const itemIndex = cart.products.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse("Product not found in cart", 404));
  }

  // Verify stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse(`Product not found`, 404));
  }

  if (product.stock < qty) {
    return next(new ErrorResponse(`Not enough stock. Only ${product.stock} items left.`, 400));
  }

  cart.products[itemIndex].quantity = qty;
  await cart.save();

  const populatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    data: populatedCart,
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/item/:productId
// @access  Private
const removeItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ErrorResponse("Cart not found", 404));
  }

  // Filter out the item
  cart.products = cart.products.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  const populatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    data: populatedCart,
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ErrorResponse("Cart not found", 404));
  }

  cart.products = [];
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
  });
});

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
};
