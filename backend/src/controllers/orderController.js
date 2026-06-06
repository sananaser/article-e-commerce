const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create a new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress) {
    return next(new ErrorResponse("Please provide a shipping address", 400));
  }

  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");

  if (!cart || cart.products.length === 0) {
    return next(new ErrorResponse("Your cart is empty", 400));
  }

  const orderItems = [];
  let totalAmount = 0;

  // Verify stock and populate order items
  for (const item of cart.products) {
    const product = item.product;

    if (!product) {
      return next(new ErrorResponse("One of the products in your cart no longer exists", 404));
    }

    if (product.stock < item.quantity) {
      return next(
        new ErrorResponse(
          `Not enough stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
          400
        )
      );
    }

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price, // Lock in the current price
    });

    totalAmount += product.price * item.quantity;
  }

  // Decrement stock for each product
  for (const item of cart.products) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    products: orderItems,
    totalAmount,
    shippingAddress,
    paymentMethod: paymentMethod || "Card",
  });

  // Clear user's cart
  cart.products = [];
  await cart.save();

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
    .populate({
      path: "products.product",
      select: "name price images brand",
    })
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "products.product",
      select: "name price images brand",
    });

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to view this order", 403));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse("Please provide a status", 400));
  }

  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse("Invalid order status", 400));
  }

  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // If status is updated to Cancelled and the order wasn't Cancelled already, return stock
  if (status === "Cancelled" && order.orderStatus !== "Cancelled") {
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }
  // If status was Cancelled and is now being re-activated, decrement stock
  else if (order.orderStatus === "Cancelled" && status !== "Cancelled") {
    // Check if there is enough stock first
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return next(
          new ErrorResponse(
            `Cannot re-activate order. Not enough stock for product ID ${item.product}`,
            400
          )
        );
      }
    }
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }
  }

  order.orderStatus = status;
  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
