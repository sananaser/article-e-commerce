const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Aggregate revenue from non-cancelled orders
  const revenueData = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    },
  });
});

// @desc    Get all users with order counts
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 }).lean();

  // Aggregate order counts grouped by user
  const orderCounts = await Order.aggregate([
    { $group: { _id: "$user", count: { $sum: 1 } } }
  ]);

  const countsMap = {};
  orderCounts.forEach(item => {
    if (item._id) {
      countsMap[item._id.toString()] = item.count;
    }
  });

  const formattedUsers = users.map(u => ({
    id: u._id,
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status || "Active",
    orders: countsMap[u._id.toString()] || 0,
    joined: u.createdAt ? u.createdAt.toISOString().split("T")[0] : "",
  }));

  res.status(200).json({
    success: true,
    data: formattedUsers,
  });
});

// @desc    Toggle block status of a user
// @route   PUT /api/admin/users/:id/toggle-block
// @access  Private/Admin
const toggleUserBlock = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Prevent blocking an administrator
  if (user.role === "admin") {
    return next(new ErrorResponse("Cannot block or modify an administrator account", 400));
  }

  // Toggle status
  user.status = user.status === "Blocked" ? "Active" : "Blocked";
  await user.save();

  res.status(200).json({
    success: true,
    message: `User status updated to ${user.status}`,
    data: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  toggleUserBlock,
};
